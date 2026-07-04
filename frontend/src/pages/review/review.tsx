import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./review.css";

type FlipCard = {
  type: "flip";
  front: string;
  back: string;
};

type McqCard = {
  type: "mcq";
  question: string;
  options: string[];
  correctIndex: number;
};

type Card = FlipCard | McqCard;

const cards: Card[] = [
  {
    type: "flip",
    front: "Locke's argument for private property rests on what act?",
    back: "Mixing one's labor with an unowned natural resource...",
  },
  {
    type: "mcq",
    question: "Which gas is released during the Krebs cycle?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 1,
  },
  { type: "flip", front: "Your third question", back: "Your third answer" },
  {
    type: "mcq",
    question: "Locke's labor theory justifies ownership through what?",
    options: [
      "Government decree",
      "Mixing labor with unowned resources",
      "Inheritance rights",
      "Social contract voting",
    ],
    correctIndex: 1,
  },
];

function Review() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"flashcards" | "mcq">("flashcards");
  const [flipped, setFlipped] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const filteredCards =
    mode === "mcq" ? cards.filter((c) => c.type === "mcq") : cards;

  const card = filteredCards[current];

  function exitSession() {
    navigate("/");
  }

  function switchMode(newMode: "flashcards" | "mcq") {
    setMode(newMode);
    setCurrent(0);
    setFlipped(false);
    setSelectedOption(null);
    setIsComplete(false);
  }

  function goToNext() {
    if (current + 1 >= filteredCards.length) {
      setIsComplete(true);
    } else {
      setFlipped(false);
      setSelectedOption(null);
      setCurrent((prev) => prev + 1);
    }
  }

  function rate(type: string) {
    console.log("Rated:", type);
    goToNext();
  }

  function selectOption(index: number) {
    if (selectedOption !== null) return;
    setSelectedOption(index);
  }

  return (
    <main className="review">
      <div className="page-head">
        <div>
          <div className="eyebrow">Review session</div>
          <h1>{filteredCards.length} cards to review.</h1>
        </div>

        <button className="btnrev btn-ghostrev" onClick={exitSession}>
          Exit session
        </button>
      </div>

      <div className="mode-row">
        <button
          className={`mode-btn ${mode === "flashcards" ? "active" : ""}`}
          onClick={() => switchMode("flashcards")}
        >
          Flashcards
        </button>
        <button
          className={`mode-btn ${mode === "mcq" ? "active" : ""}`}
          onClick={() => switchMode("mcq")}
        >
          Attempt MCQs
        </button>
      </div>

      <div className="review-shell">
        {filteredCards.length === 0 ? (
          <p className="review-empty">No MCQs available yet.</p>
        ) : isComplete ? (
          <div
            className="review-complete"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "30px",
            }}
          >
            <h2>Session complete 🎉</h2>
            <p>You reviewed all {filteredCards.length} cards.</p>
            <button className="btnrev btn-ghostrev" onClick={exitSession}>
              Back to dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="review-progress">
              CARD {current + 1} OF {filteredCards.length}
            </div>

            {card.type === "mcq" ? (
              <>
                <div className="mcq-card">
                  <div className="mcq-question">{card.question}</div>
                  <div className="mcq-options">
                    {card.options.map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isCorrect = index === card.correctIndex;
                      const showResult = selectedOption !== null;

                      let optionClass = "mcq-option";
                      if (showResult && isCorrect) {
                        optionClass += " mcq-correct";
                      } else if (showResult && isSelected && !isCorrect) {
                        optionClass += " mcq-incorrect";
                      }

                      return (
                        <button
                          key={index}
                          className={optionClass}
                          onClick={() => selectOption(index)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  className="btnrev btn-ghostrev mcq-next-btn"
                  onClick={goToNext}
                  disabled={selectedOption === null}
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <div
                  className={`flip-card ${flipped ? "flipped" : ""}`}
                  onClick={() => setFlipped(!flipped)}
                >
                  <div className="flip-inner">
                    <div className="flip-face front">
                      <div className="flip-text">{card.front}</div>
                      <div className="flip-hint">Tap to reveal</div>
                    </div>

                    <div className="flip-face back">
                      <div className="flip-text">{card.back}</div>
                      <div className="flip-hint">How did you do?</div>
                    </div>
                  </div>
                </div>

                <div className="rate-row">
                  <button
                    className="rate-btn rate-forgot"
                    onClick={() => rate("forgot")}
                  >
                    Forgot
                    <span>&lt;1d</span>
                  </button>

                  <button
                    className="rate-btn rate-hard"
                    onClick={() => rate("hard")}
                  >
                    Hard
                    <span>2d</span>
                  </button>

                  <button
                    className="rate-btn rate-good"
                    onClick={() => rate("good")}
                  >
                    Good
                    <span>6d</span>
                  </button>

                  <button
                    className="rate-btn rate-easy"
                    onClick={() => rate("easy")}
                  >
                    Easy
                    <span>10d</span>
                  </button>
                </div>
              </>
            )}

            <div className="review-source">
              from <b>POL SCI 110 — History of Political Thought</b>, recorded
              Jun 29
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Review;
