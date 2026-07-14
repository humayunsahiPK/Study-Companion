import genanki
import random


def generate_apkg(lecture_title: str, flashcards: list[dict]) -> bytes:
    """flashcards: list of {"front": str, "back": str}. Returns raw .apkg bytes."""
    model_id = random.randrange(1 << 30, 1 << 31)
    deck_id = random.randrange(1 << 30, 1 << 31)

    model = genanki.Model(
        model_id,
        "Study Companion Basic Model",
        fields=[{"name": "Front"}, {"name": "Back"}],
        templates=[
            {
                "name": "Card 1",
                "qfmt": "{{Front}}",
                "afmt": '{{FrontSide}}<hr id="answer">{{Back}}',
            }
        ],
    )

    deck = genanki.Deck(deck_id, lecture_title)

    for card in flashcards:
        note = genanki.Note(model=model, fields=[card["front"], card["back"]])
        deck.add_note(note)

    package = genanki.Package(deck)

    import io

    buffer = io.BytesIO()
    package.write_to_file(buffer)
    return buffer.getvalue()
