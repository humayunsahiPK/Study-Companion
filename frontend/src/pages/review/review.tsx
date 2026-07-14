import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./review.css";
import { apiRequest } from "../../api/client";

type FlipCard = {
  id: string;
  type: "flip";
  front: string;
  back: string;
};

type McqCard = {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  correctIndex: number;
};

type Card = FlipCard | McqCard;

function Review() {
  const navigate = useNavigate();
  const location = useLocation();
  const lectureId = (location.state as { lectureId?: string } | null)
    ?.lectureId;

  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(lectureId));
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"flashcards" | "mcq">("flashcards");
  const [flipped, setFlipped] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (!lectureId) return;

    async function loadCards() {
      try {
        const data = await apiRequest<{ cards: Card[] }>(
          `/lectures/${lectureId}/cards`,
        );
        setCards(data.cards);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cards.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCards();
  }, [lectureId]);

  const filteredCards =
    mode === "mcq"
      ? cards.filter((c) => c.type === "mcq")
      : cards.filter((c) => c.type === "flip");

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

  async function submitReview(cardId: string, rating: string) {
    try {
      await apiRequest(`/lectures/cards/${cardId}/review`, {
        method: "POST",
        body: { rating },
      });
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  }

  function rate(type: string) {
    if (card) submitReview(card.id, type);
    goToNext();
  }

  function selectOption(index: number) {
    if (selectedOption !== null || card.type !== "mcq") return;
    setSelectedOption(index);
  }

  function handleMcqNext() {
    if (card && card.type === "mcq" && selectedOption !== null) {
      const isCorrect = selectedOption === card.correctIndex;
      submitReview(card.id, isCorrect ? "good" : "forgot");
    }
    goToNext();
  }

  if (isLoading) {
    return (
      <main className="review">
        <p className="review-empty">Loading cards...</p>
      </main>
    );
  }

  if (!lectureId) {
    return (
      <main className="review">
        <div className="page-head">
          <div>
            <div className="eyebrow">Review session</div>
            <h1>No lecture selected.</h1>
          </div>
          <button className="btnrev btn-ghostrev" onClick={exitSession}>
            Exit session
          </button>
        </div>
        <p className="review-empty">
          Pick a lecture from the Library and click "Start review" to begin.
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="review">
        <p className="review-empty">{error}</p>
      </main>
    );
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
          <p className="review-empty">No cards of this type yet.</p>
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
                  onClick={handleMcqNext}
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
          </>
        )}
      </div>
    </main>
  );
}

export default Review;
