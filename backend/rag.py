"""Chatsift step 3: embeddings, ChromaDB search, and cited answers."""
import json
import os
import re
from datetime import datetime

import chromadb
from dotenv import load_dotenv
from google import genai

load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    raise RuntimeError("Add GEMINI_API_KEY to backend/.env")

client = genai.Client()  # reads GEMINI_API_KEY from the environment

# Model names change over time. Override them in .env without touching the code:
#   GEN_MODEL=...   EMBED_MODEL=...
EMBED_MODEL = os.getenv("EMBED_MODEL", "gemini-embedding-001")
GEN_MODEL = os.getenv("GEN_MODEL", "gemini-3.5-flash-lite")

chroma = chromadb.Client()  # in memory: data disappears when the server restarts


def embed(texts: list[str], batch_size: int = 50) -> list[list[float]]:
    vectors = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        result = client.models.embed_content(model=EMBED_MODEL, contents=batch)
        vectors.extend(e.values for e in result.embeddings)
    return vectors


def add_chat(session_id: str, chunks: list[dict]) -> None:
    """Embed every chunk and store it under this session."""
    collection = chroma.create_collection(session_id)
    collection.add(
        ids=[c["id"] for c in chunks],
        documents=[c["text"] for c in chunks],
        embeddings=embed([c["text"] for c in chunks]),
        metadatas=[
            {
                "message_ids": json.dumps(c["message_ids"]),
                "start": c["start"].isoformat(),
                "end": c["end"].isoformat(),
            }
            for c in chunks
        ],
    )


def retrieve(session_id: str, question: str, k: int = 4) -> list[dict]:
    """Return the k chunks closest in meaning to the question."""
    collection = chroma.get_collection(session_id)
    q_vec = embed([question])[0]
    res = collection.query(query_embeddings=[q_vec], n_results=min(k, collection.count()))
    hits = []
    for text, meta, dist in zip(res["documents"][0], res["metadatas"][0], res["distances"][0]):
        hits.append({
            "text": text,
            "message_ids": json.loads(meta["message_ids"]),
            "start": datetime.fromisoformat(meta["start"]),
            "end": datetime.fromisoformat(meta["end"]),
            "distance": dist,
        })
    return hits


def _label(hit: dict) -> str:
    return f"{hit['start']:%d %b %Y, %H:%M} to {hit['end']:%H:%M}"


def answer(session_id: str, question: str, messages: dict, k: int = 4, max_sources: int = 20) -> dict:
    """Answer from the retrieved chunks. Returns {answer, found, sources}."""
    hits = retrieve(session_id, question, k)
    context = "\n\n".join(f"[{i}] ({_label(h)})\n{h['text']}" for i, h in enumerate(hits, start=1))

    prompt = f"""You answer questions about a class group chat using ONLY the chat excerpts below.
- Each excerpt is a short conversation with its date and time.
- If later messages correct or change an earlier answer, use the latest one.
- Keep the answer short (under five sentences).
- Cite the excerpts you used like [1] or [2].
- If the excerpts do not contain the answer, reply with exactly: NOT_FOUND

CHAT EXCERPTS:
{context}

QUESTION: {question}
ANSWER:"""

    response = client.models.generate_content(model=GEN_MODEL, contents=prompt)
    text = (response.text or "").strip()

    if "NOT_FOUND" in text:
        return {"answer": "I couldn't find this in the chat.", "found": False, "sources": []}

    # Which excerpts did the model cite? If it cited none, show all that were retrieved.
    cited_numbers = {int(n) for n in re.findall(r"\[(\d+)\]", text)}
    cited = [h for i, h in enumerate(hits, start=1) if i in cited_numbers] or hits

    sources, seen = [], set()
    for h in cited:
        for mid in h["message_ids"]:
            msg = messages.get(mid)
            if msg is None or mid in seen:
                continue
            seen.add(mid)
            sources.append({
                "sender": msg.sender,
                "time": f"{msg.timestamp:%d %b %Y, %H:%M}",
                "text": msg.text,
            })
    clean_answer = re.sub(r"\s*\[\d+\]", "", text).strip()
    return {"answer": clean_answer, "found": True, "sources": sources[:max_sources]}


def delete_session(session_id: str) -> None:
    try:
        chroma.delete_collection(session_id)
    except Exception:
        pass