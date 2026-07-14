import "./dashboard.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/client";

type DashboardSummary = {
  due_number: number;
  lecture_count: number;
  most_overdue_title: string;
  overdue_days: number;
};

type StreakDay = {
  day: string;
  state: "done" | "due" | "today" | "today due" | "none";
};

type StreakResponse = {
  days: StreakDay[];
};

type RecentLecture = {
  id: string;
  title: string;
  tag: string;
  date: string;
  status: "done" | "processing";
  due: string;
  dueState: "has-due" | "none";
};

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [streak, setStreak] = useState<StreakDay[]>([]);
  const [recentLectures, setRecentLectures] = useState<RecentLecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [noteText, setNoteText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmittingNotes, setIsSubmittingNotes] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryData, streakData, lecturesData] = await Promise.all([
          apiRequest<DashboardSummary>("/dashboard/summary"),
          apiRequest<StreakResponse>("/dashboard/streak"),
          apiRequest<RecentLecture[]>("/lectures"),
        ]);
        setSummary(summaryData);
        setStreak(streakData.days);
        setRecentLectures(lecturesData.slice(0, 3));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiRequest("/lectures/upload", {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  }

  function handleNoteChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNoteText(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  async function handleNoteSubmit() {
    if (!noteText.trim()) return;
    setIsSubmittingNotes(true);

    try {
      await apiRequest("/lectures/from-notes", {
        method: "POST",
        body: { notes: noteText },
      });
      setNoteText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit notes.");
    } finally {
      setIsSubmittingNotes(false);
    }
  }

  function dotClassFor(state: StreakDay["state"]) {
    if (state === "none") return "dot";
    return `dot ${state}`;
  }

  if (isLoading) {
    return (
      <main className="dashboard">
        <p className="dashboard-status">Loading your dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <p className="dashboard-status dashboard-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <div className="pagehead">
        <div className="Date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div className="Container">
          <div className="Greetings">Good Evening</div>
          <div className="pagehead-actions">
            <button
              className="btn btn-ghost"
              onClick={() =>
                navigate("/library", {
                  state: { lectureId: recentLectures[0]?.id },
                })
              }
            >
              View summary
            </button>
            <button className="ReviewBtn" onClick={() => navigate("/review")}>
              Start review session
            </button>
          </div>
        </div>
      </div>
      <div className="dashgrid">
        <div className="Panel">
          <div className="PanelTitle">Due Today</div>
          <div className="due-figure">
            <div className="due-number">{summary?.due_number ?? 0}</div>
            <div className="due-copy">
              cards waiting across{" "}
              <b>{summary?.lecture_count ?? 0} lectures </b>
              {summary && summary.overdue_days > 0
                ? ` — ${summary.most_overdue_title} is overdue by ${summary.overdue_days} day${summary.overdue_days === 1 ? "" : "s"}.`
                : "."}
            </div>
          </div>
        </div>
        <div className="Panel">
          <div className="PanelTitle">This Week</div>
          <div className="dotgrid" id="dotgrid">
            {streak.map((day, i) => (
              <div key={i} className={dotClassFor(day.state)}></div>
            ))}
          </div>
          <div className="streak-caption">
            {streak.map((day) => (
              <span key={day.day}>{day.day}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="section-label">Recent lectures</div>
      <div className="card-row">
        {recentLectures.length === 0 ? (
          <p className="dashboard-status">
            No lectures yet — upload audio or paste notes below to get started.
          </p>
        ) : (
          recentLectures.map((lecture) => (
            <div
              className="idx-card"
              key={lecture.id}
              onClick={() =>
                navigate("/library", { state: { lectureId: lecture.id } })
              }
            >
              <div>
                <div className="idx-tag">{lecture.tag}</div>
                <div className="idx-title">{lecture.title}</div>
              </div>
              <div className="idx-meta">
                <span>{lecture.date}</span>
                {lecture.status === "done" ? (
                  <span className="status-pill status-done">{lecture.due}</span>
                ) : (
                  <span className="status-pill status-processing">
                    transcribing…
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="drop-cta">
        <div className="drop-cta-copy">
          <div className="section-label">Add a lecture</div>
          <p>
            Drop an audio file, paste raw notes, or record live from the
            extension.
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload audio"}
        </button>
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div className="note-cta">
        <div className="section-label">Or paste notes</div>
        <textarea
          ref={textareaRef}
          className="note-textarea"
          placeholder="Paste your raw lecture notes here..."
          value={noteText}
          onChange={handleNoteChange}
          rows={1}
        />
        <button
          className="btn btn-ghost note-submit-btn"
          onClick={handleNoteSubmit}
          disabled={isSubmittingNotes || !noteText.trim()}
        >
          {isSubmittingNotes ? "Generating..." : "Generate cards from notes"}
        </button>
      </div>
    </main>
  );
}

export default Dashboard;
