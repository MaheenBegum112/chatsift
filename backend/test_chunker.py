from chat_parser import parse_chat
from chunker import chunk_messages, is_noise


def one(line):
    """Parse a single chat line into a Message."""
    return parse_chat(line)[0]


def test_system_media_deleted_are_noise():
    assert is_noise(one("12/10/24, 4:00 pm - Rahul added Priya"))
    assert is_noise(one("12/10/24, 4:00 pm - Rahul: <Media omitted>"))
    assert is_noise(one("12/10/24, 4:00 pm - Rahul: This message was deleted"))


def test_filler_and_emoji_are_noise():
    assert is_noise(one("12/10/24, 4:00 pm - Priya: ok"))
    assert is_noise(one("12/10/24, 4:00 pm - Priya: Thanks!"))
    assert is_noise(one("12/10/24, 4:00 pm - Priya: lol"))
    assert is_noise(one("12/10/24, 4:00 pm - Priya: ok thanks"))
    assert is_noise(one("12/10/24, 4:00 pm - Priya: Thank you!"))
    assert is_noise(one("12/10/24, 4:00 pm - Priya: 👍"))
    assert is_noise(one("12/10/24, 4:00 pm - Priya: ???"))


def test_real_messages_are_kept():
    assert not is_noise(one("12/10/24, 4:00 pm - Rahul: Unit 3 is important"))
    assert not is_noise(one("12/10/24, 4:00 pm - Priya: Friday"))
    assert not is_noise(one("12/10/24, 4:00 pm - Priya: Thanks sir for the notes"))
    assert not is_noise(one("12/10/24, 4:00 pm - Priya: you can submit on the portal"))


CHAT = (
    "12/10/24, 4:00 pm - Anil: when is the DBMS assignment due?\n"
    "12/10/24, 4:02 pm - Priya: Friday\n"
    "12/10/24, 4:03 pm - Anil: ok thanks\n"
    "12/10/24, 4:05 pm - Rahul: submit on the portal\n"
    "12/10/24, 7:00 pm - Asha: Unit 3 notes are in the drive\n"
)


def test_time_gap_starts_new_chunk():
    chunks = chunk_messages(parse_chat(CHAT), gap_minutes=30)
    assert len(chunks) == 2
    assert "Friday" in chunks[0]["text"] and "portal" in chunks[0]["text"]
    assert "Unit 3" in chunks[1]["text"]


def test_noise_is_removed_from_chunks():
    chunks = chunk_messages(parse_chat(CHAT))
    assert "thanks" not in chunks[0]["text"]


def test_message_ids_and_times_are_kept():
    msgs = parse_chat(CHAT)
    chunks = chunk_messages(msgs)
    assert chunks[0]["message_ids"] == [0, 1, 3]
    assert chunks[1]["message_ids"] == [4]
    assert chunks[0]["start"] == msgs[0].timestamp


def test_max_messages_splits_a_long_conversation():
    raw = "".join(f"12/10/24, 4:{i:02d} pm - A: message number {i}\n" for i in range(10))
    chunks = chunk_messages(parse_chat(raw), max_messages=4)
    assert [len(c["message_ids"]) for c in chunks] == [4, 4, 2]


def test_multiline_message_stays_in_one_chunk():
    raw = "12/10/24, 4:00 pm - Rahul: Notes:\n1. Joins\n2. Keys\n"
    chunks = chunk_messages(parse_chat(raw))
    assert chunks[0]["text"] == "Rahul: Notes:\n1. Joins\n2. Keys"


def test_empty_and_all_noise_give_no_chunks():
    assert chunk_messages([]) == []
    assert chunk_messages(parse_chat("12/10/24, 4:00 pm - A: ok\n")) == []