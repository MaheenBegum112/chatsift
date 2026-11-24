"""Chatsift step 2: turn parsed WhatsApp messages into conversation chunks.

Usage:  python chunker.py path/to/_chat.txt
"""
import re
import sys
from datetime import timedelta

from chat_parser import Message, parse_chat

# Words that carry no information on their own.
# A message is noise only if EVERY word in it is one of these.
FILLER = {
    "ok", "okay", "k", "kk", "thanks", "thank", "you", "thankyou", "thx", "ty",
    "hmm", "hm", "lol", "haha", "oh", "ah", "hi", "hello", "hey", "np",
    "haan", "han", "ji", "accha", "acha", "theek", "thik", "hai",
}


def is_noise(msg: Message) -> bool:
    """True if this message should be dropped before chunking."""
    if msg.is_system or msg.is_media or msg.is_deleted:
        return True
    cleaned = re.sub(r"[^\w\s]", "", msg.text.lower()).strip()
    if not cleaned:  # only emoji or punctuation, like "👍" or "??"
        return True
    return all(word in FILLER for word in cleaned.split())


def _make_chunk(n: int, msgs: list[Message]) -> dict:
    return {
        "id": f"chunk-{n}",
        "text": "\n".join(f"{m.sender}: {m.text}" for m in msgs),
        "message_ids": [m.id for m in msgs],
        "start": msgs[0].timestamp,
        "end": msgs[-1].timestamp,
    }


def chunk_messages(messages: list[Message], gap_minutes: int = 30, max_messages: int = 20) -> list[dict]:
    """Group messages into conversations.

    A new chunk starts when there is a gap of more than `gap_minutes`
    between two kept messages, or when a chunk already has `max_messages`.
    """
    kept = [m for m in messages if not is_noise(m)]

    chunks = []
    current: list[Message] = []
    for msg in kept:
        if current:
            gap = msg.timestamp - current[-1].timestamp
            if gap > timedelta(minutes=gap_minutes) or len(current) >= max_messages:
                chunks.append(_make_chunk(len(chunks), current))
                current = []
        current.append(msg)
    if current:
        chunks.append(_make_chunk(len(chunks), current))
    return chunks


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python chunker.py path/to/_chat.txt")
    with open(sys.argv[1], encoding="utf-8", errors="replace") as f:
        msgs = parse_chat(f.read())
    chunks = chunk_messages(msgs)
    print(f"{len(msgs)} messages parsed -> {len(chunks)} chunks")
    for c in chunks[:3]:
        print(f"\n--- {c['id']} ({c['start']:%d %b %H:%M} to {c['end']:%H:%M}, {len(c['message_ids'])} messages) ---")
        print(c["text"])