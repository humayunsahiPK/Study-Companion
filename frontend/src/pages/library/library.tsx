import "./library.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest, downloadFile } from "../../api/client";

type Lecture = {
  id: string;
  title: string;
  tag: string;
  date: string;
  status: "done" | "processing";
  due: string;
  dueState: "has-due" | "none";
  summary: string;
};

function Library() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedId = (location.state as { lectureId?: string } | null)
    ?.lectureId;

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    preselectedId ?? null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadLectures() {
      try {
        const data = await apiRequest<Lecture[]>("/lectures");
        setLectures(data);
        if (!selectedId && data.length > 0) {
          setSelectedId(preselectedId ?? data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load lectures.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLectures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLecture = lectures.find((l) => l.id === selectedId);

  function handleRowClick(id: string) {
    setSelectedId(id);
  }

  function handleStartReview() {
    navigate("/review", { state: { lectureId: selectedId } });
  }

  async function handleExport() {
    if (!selectedLecture) return;
    setIsExporting(true);
    try {
      await downloadFile(
        `/lectures/${selectedLecture.id}/export`,
        `${selectedLecture.title}.apkg`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleDeleteClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setConfirmDeleteId(id);
  }

  async function confirmDelete(id: string) {
    setIsDeleting(true);
    try {
      await apiRequest(`/lectures/${id}`, { method: "DELETE" });
      const remaining = lectures.filter((l) => l.id !== id);
      setLectures(remaining);
      if (selectedId === id) {
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="library">
        <p className="lib-status">Loading your lectures...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="library">
        <p className="lib-status lib-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="library">
      <div className="page-head">
        <div>
          <div className="eyebrow">All lectures</div>
          <h1>Library.</h1>
        </div>
        <button
          className="btn btn-ghost"
          onClick={handleExport}
          disabled={!selectedLecture || isExporting}
        >
          {isExporting ? "Exporting..." : "Export selected (.apkg)"}
        </button>
      </div>

      {lectures.length === 0 ? (
        <p className="lib-status">
          No lectures yet — head to the Dashboard to upload audio or paste
          notes.
        </p>
      ) : (
        <div className="lib-table-wrap">
          <table className="lib-table">
            <thead>
              <tr>
                <th>Lecture</th>
                <th>Subject</th>
                <th>Recorded</th>
                <th>Status</th>
                <th>Due</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lectures.map((lecture) => (
                <tr
                  key={lecture.id}
                  onClick={() => handleRowClick(lecture.id)}
                  className={lecture.id === selectedId ? "lib-row-active" : ""}
                >
                  <td className="lib-title">{lecture.title}</td>
                  <td className="lib-tag">{lecture.tag}</td>
                  <td className="lib-date">{lecture.date || "—"}</td>
                  <td>
                    <span
                      className={`status-pilllib ${
                        lecture.status === "done"
                          ? "status-donelib"
                          : "status-processinglib"
                      }`}
                    >
                      {lecture.status === "done" ? "Ready" : "Transcribing"}
                    </span>
                  </td>
                  <td className={`lib-due ${lecture.dueState}`}>
                    {lecture.due}
                  </td>
                  <td className="lib-delete-cell">
                    {confirmDeleteId === lecture.id ? (
                      <span className="lib-confirm-row">
                        <button
                          className="lib-confirm-btn lib-confirm-yes"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(lecture.id);
                          }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "..." : "Delete"}
                        </button>
                        <button
                          className="lib-confirm-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          disabled={isDeleting}
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        className="lib-delete-btn"
                        onClick={(e) => handleDeleteClick(e, lecture.id)}
                        aria-label={`Delete ${lecture.title}`}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedLecture && (
        <div className="lib-summary">
          <div className="eyebrow">Summary</div>
          <h2 className="lib-summary-title">{selectedLecture.title}</h2>
          {selectedLecture.summary ? (
            <>
              <p className="lib-summary-text">{selectedLecture.summary}</p>
              <button
                className="btnrev btn-ghostrev"
                onClick={handleStartReview}
              >
                Start review
              </button>
            </>
          ) : (
            <p className="lib-summary-text lib-summary-pending">
              Still transcribing — summary will appear once processing is
              complete.
            </p>
          )}
        </div>
      )}
    </main>
  );
}

export default Library;
