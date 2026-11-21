"""Chatsift step 1: parse a WhatsApp exported .txt chat into structured messages.

Handles:
  - Android:  12/10/24, 4:32 pm - Rahul: Unit 3 is important
  - Android 24h: 12/10/2024, 16:32 - Rahul: text
  - iPhone:   [12/10/24, 4:32:15 PM] Rahul: text
  - multi-line messages, system lines, media/deleted placeholders
  - DD/MM vs MM/DD date order (auto-detected, default day-first)
  - invisible characters WhatsApp inserts (LRM, narrow no-break space)

Usage:  python chat_parser.py path/to/_chat.txt
"""
from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

# Characters WhatsApp sprinkles into exports.
_INVISIBLE = dict.fromkeys(map(ord, "\u200e\u200f\u202a\u202c\ufeff"), None)
_SPACES = str.maketrans({"\u202f": " ", "\u00a0": " "})

# One "header" line: date, time, then everything after (sender: text, or a system note).
LINE_RE = re.compile(
    r"^\[?(?P<date>\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}),?\s+"
    r"(?P<time>\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp]\.?[Mm]\.?)?)\]?"
    r"\s*(?:-\s*)?(?P<rest>.*)$"
)

_MEDIA_RE = re.compile(
    r"^(<media omitted>|(image|video|audio|sticker|gif|document|contact card) omitted"
    r"|<attached: .+>)$",
    re.IGNORECASE,
)
_DELETED = {"this message was deleted", "you deleted this message"}


@dataclass
class Message:
    id: int
    timestamp: datetime
    sender: Optional[str]  # None for system messages
    text: str
    is_system: bool = False
    is_media: bool = False
    is_deleted: bool = False


def _split_date(date_s: str) -> tuple[int, int, int]:
    a, b, y = re.split(r"[/.\-]", date_s)
    return int(a), int(b), int(y)


def detect_dayfirst(lines: list[str]) -> bool:
    """True if dates look like DD/MM. If ambiguous, assume day-first (India/UK)."""
    first_gt12 = second_gt12 = False
    for line in lines:
        m = LINE_RE.match(line)
        if not m:
            continue
        a, b, _ = _split_date(m["date"])
        first_gt12 |= a > 12
        second_gt12 |= b > 12
    return not (second_gt12 and not first_gt12)


def _parse_timestamp(date_s: str, time_s: str, dayfirst: bool) -> datetime:
    a, b, year = _split_date(date_s)
    day, month = (a, b) if dayfirst else (b, a)
    if year < 100:
        year += 2000
    m = re.match(r"(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp])?", time_s)
    hour, minute, sec = int(m[1]), int(m[2]), int(m[3] or 0)
    if m[4]:  # 12-hour clock
        hour %= 12
        if m[4].lower() == "p":
            hour += 12
    return datetime(year, month, day, hour, minute, sec)


def _split_sender(rest: str) -> tuple[Optional[str], str]:
    """Return (sender, text). sender is None for system lines."""
    if rest.endswith(":"):  # "Rahul:" with an empty body
        head, text = rest[:-1], ""
    else:
        head, sep, text = rest.partition(": ")
        if not sep:
            return None, rest
    # System lines like: You changed the subject to "Unit 3: notes"
    if not head or '"' in head or len(head) > 60:
        return None, rest
    return head.strip(), text


def _build(idx: int, ts: datetime, rest: str) -> Message:
    sender, text = _split_sender(rest)
    text = text.strip()
    low = text.lower()
    return Message(
        id=idx,
        timestamp=ts,
        sender=sender,
        text=text,
        is_system=sender is None,
        is_media=bool(_MEDIA_RE.match(text)),
        is_deleted=low in _DELETED,
    )


def parse_chat(raw: str, dayfirst: Optional[bool] = None) -> list[Message]:
    """Parse the full text of a WhatsApp export. Never raises on odd lines."""
    cleaned = raw.translate(_INVISIBLE).translate(_SPACES)
    lines = cleaned.splitlines()
    if dayfirst is None:
        dayfirst = detect_dayfirst(lines)

    messages: list[Message] = []
    pending: Optional[tuple[datetime, str]] = None  # (timestamp, text so far)

    def flush() -> None:
        nonlocal pending
        if pending:
            messages.append(_build(len(messages), pending[0], pending[1]))
            pending = None

    for line in lines:
        m = LINE_RE.match(line)
        if m:
            try:
                ts = _parse_timestamp(m["date"], m["time"], dayfirst)
            except ValueError:  # impossible date: treat as continuation text
                ts = None
            if ts is not None:
                flush()
                pending = (ts, m["rest"])
                continue
        if pending:  # continuation of a multi-line message
            pending = (pending[0], pending[1] + "\n" + line)
        # lines before the first header are ignored

    flush()
    return messages


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python chat_parser.py path/to/_chat.txt")
    with open(sys.argv[1], encoding="utf-8", errors="replace") as f:
        msgs = parse_chat(f.read())
    real = [m for m in msgs if not m.is_system and not m.is_media and not m.is_deleted]
    print(f"total lines parsed: {len(msgs)}  |  real text messages: {len(real)}")
    for m in msgs[:10]:
        print(f"{m.timestamp:%Y-%m-%d %H:%M} | {m.sender or 'SYSTEM'} | {m.text[:60]!r}")