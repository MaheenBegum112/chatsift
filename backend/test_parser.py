from datetime import datetime

from chat_parser import detect_dayfirst, parse_chat

ANDROID_12H = (
    "12/10/24, 4:32 pm - Rahul: Unit 3 is important\n"
    "12/10/24, 4:33 pm - Priya: ok thanks\n"
)

ANDROID_24H = "12/10/2024, 16:32 - Rahul: Unit 3 is important\n"

IOS = "[12/10/24, 4:32:15 PM] Rahul: Unit 3 is important\n"


def test_android_12h():
    msgs = parse_chat(ANDROID_12H)
    assert len(msgs) == 2
    assert msgs[0].sender == "Rahul"
    assert msgs[0].text == "Unit 3 is important"
    assert msgs[0].timestamp == datetime(2024, 10, 12, 16, 32)


def test_android_24h():
    msgs = parse_chat(ANDROID_24H)
    assert msgs[0].timestamp == datetime(2024, 10, 12, 16, 32)
    assert msgs[0].sender == "Rahul"


def test_ios_format_with_seconds():
    msgs = parse_chat(IOS)
    assert msgs[0].sender == "Rahul"
    assert msgs[0].timestamp == datetime(2024, 10, 12, 16, 32, 15)


def test_12am_and_12pm_edge_cases():
    raw = "12/10/24, 12:05 am - A: midnight\n12/10/24, 12:05 pm - A: noon\n"
    msgs = parse_chat(raw)
    assert msgs[0].timestamp.hour == 0
    assert msgs[1].timestamp.hour == 12


def test_multiline_message_is_joined():
    raw = (
        "12/10/24, 4:32 pm - Rahul: Notes:\n"
        "1. Normalization\n"
        "2. Joins\n"
        "12/10/24, 4:40 pm - Priya: thanks\n"
    )
    msgs = parse_chat(raw)
    assert len(msgs) == 2
    assert msgs[0].text == "Notes:\n1. Normalization\n2. Joins"


def test_system_message_has_no_sender():
    raw = "12/10/24, 4:00 pm - Rahul added Priya\n"
    msgs = parse_chat(raw)
    assert msgs[0].is_system and msgs[0].sender is None


def test_system_message_with_colon_inside_quotes():
    raw = '12/10/24, 4:00 pm - You changed the subject to "Unit 3: notes"\n'
    msgs = parse_chat(raw)
    assert msgs[0].is_system


def test_media_and_deleted_flags():
    raw = (
        "12/10/24, 4:00 pm - Rahul: <Media omitted>\n"
        "12/10/24, 4:01 pm - Priya: This message was deleted\n"
        "[12/10/24, 4:02:00 PM] Anil: image omitted\n"
    )
    msgs = parse_chat(raw)
    assert msgs[0].is_media
    assert msgs[1].is_deleted
    assert msgs[2].is_media


def test_invisible_characters_and_narrow_space():
    raw = "\u200e[12/10/24, 4:32:15\u202fPM] Rahul: hello\n"
    msgs = parse_chat(raw)
    assert msgs[0].timestamp == datetime(2024, 10, 12, 16, 32, 15)
    assert msgs[0].text == "hello"


def test_dayfirst_detection():
    assert detect_dayfirst(["25/10/24, 4:00 pm - A: x"]) is True
    assert detect_dayfirst(["10/25/24, 4:00 pm - A: x"]) is False
    assert detect_dayfirst(["10/11/24, 4:00 pm - A: x"]) is True  # ambiguous -> day-first


def test_month_first_chat_parses_correctly():
    raw = "10/25/24, 4:00 PM - A: x\n10/26/24, 4:00 PM - A: y\n"
    msgs = parse_chat(raw)
    assert msgs[0].timestamp == datetime(2024, 10, 25, 16, 0)


def test_message_with_colon_in_text():
    raw = "12/10/24, 4:32 pm - Rahul: Reminder: exam on Friday\n"
    msgs = parse_chat(raw)
    assert msgs[0].sender == "Rahul"
    assert msgs[0].text == "Reminder: exam on Friday"


def test_empty_and_garbage_input_never_crash():
    assert parse_chat("") == []
    assert parse_chat("random text\nwith no timestamps") == []
    assert parse_chat("31/02/24, 4:00 pm - A: impossible date") == []