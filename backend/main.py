import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import rag
from chat_parser import parse_chat
from chunker import chunk_messages

app = FastAPI(title="Chatsift")

# Allow the React dev server (Vite) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_BYTES = 10 * 1024 * 1024  # 10 MB

# session_id -> {message id: Message}. In memory, so it resets when the server restarts.
SESSIONS: dict[str, dict] = {}


class AskRequest(BaseModel):
    session_id: str
    question: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload(file: UploadFile = File(...), consent: str = Form("false")):
    if consent != "true":
        raise HTTPException(status_code=400, detail="Consent is required.")
    if not (file.filename or "").lower().endswith(".txt"):
        raise HTTPException(status_code=400, detail="Please upload the .txt file from WhatsApp's Export chat.")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File is too large (max 10 MB).")

    messages = parse_chat(data.decode("utf-8", errors="replace"))
    if not messages:
        raise HTTPException(status_code=400, detail="I couldn't read any messages. Is this a WhatsApp export?")

    chunks = chunk_messages(messages)
    if not chunks:
        raise HTTPException(status_code=400, detail="This chat has no useful text messages.")

    session_id = str(uuid.uuid4())
    try:
        rag.add_chat(session_id, chunks)
    except Exception as e:
        rag.delete_session(session_id)
        raise HTTPException(status_code=502, detail=f"Could not process the chat: {e}")

    SESSIONS[session_id] = {m.id: m for m in messages}
    return {"session_id": session_id, "messages": len(messages), "chunks": len(chunks)}


@app.post("/ask")
def ask(req: AskRequest):
    session = SESSIONS.get(req.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found. Please upload your chat again.")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Please type a question.")

    try:
        return rag.answer(req.session_id, req.question, session)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"The AI service failed: {e}")


@app.delete("/data/{session_id}")
def delete_data(session_id: str):
    rag.delete_session(session_id)
    SESSIONS.pop(session_id, None)
    return {"deleted": True}