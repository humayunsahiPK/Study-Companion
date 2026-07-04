import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./review.css";

const cards = [
  {
    front: "Locke's argument for private property rests on what act?",
    back: "Mixing one's labor with an unowned natural resource...",
  },
  { front: "Your second question", back: "Your second answer" },
  { front: "Your third question", back: "Your third answer" },
];

function Review() {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  function exitSession() {
    navigate("/");
  }

  function rate(type: string) {
    console.log("Rated:", type);
    if (current + 1 >= cards.length) {
      setIsComplete(true);
    } else {
      setFlipped(false);
      setCurrent((prev) => prev + 1);
    }
  }

  return (
    <main className="review">
      <div className="page-head">
        <div>
          <div className="eyebrow">Review session</div>
          <h1>{cards.length} cards to review.</h1>
        </div>

        <button className="btnrev btn-ghostrev" onClick={exitSession}>
          Exit session
        </button>
      </div>

      <div className="review-shell">
        {isComplete ? (
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
            <p>You reviewed all {cards.length} cards.</p>
            <button className="btnrev btn-ghostrev" onClick={exitSession}>
              Back to dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="review-progress">
              CARD {current + 1} OF {cards.length}
            </div>

            <div
              className={`flip-card ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped(!flipped)}
            >
              <div className="flip-inner">
                <div className="flip-face front">
                  <div className="flip-text">{cards[current].front}</div>
                  <div className="flip-hint">Tap to reveal</div>
                </div>

                <div className="flip-face back">
                  <div className="flip-text">{cards[current].back}</div>
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
