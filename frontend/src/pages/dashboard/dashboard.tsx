import "./dashboard.css";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [noteText, setNoteText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
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

  function handleNoteSubmit() {
    console.log("Submitted notes:", noteText);
  }

  const navigate = useNavigate();
  return (
    <main className="dashboard">
      <div className="pagehead">
        <div className="Date">Friday, July 3</div>
        <div className="Container">
          <div className="Greetings">Good Evening</div>
          <button className="ReviewBtn" onClick={() => navigate("/review")}>
            Start review session
          </button>
        </div>
      </div>
      <div className="dashgrid">
        <div className="Panel">
          <div className="PanelTitle">Due Today</div>
          <div className="due-figure">
            <div className="due-number">12</div>
            <div className="due-copy">
              cards waiting across <b>3 lectures </b> — Thermodynamics is
              overdue by two days.
            </div>
          </div>
        </div>
        <div className="Panel">
          <div className="PanelTitle">This Week</div>
          <div className="dotgrid" id="dotgrid">
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot due"></div>
            <div className="dot today due"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot"></div>
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot due"></div>
            <div className="dot"></div>
            <div className="dot done"></div>
            <div className="dot"></div>
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot"></div>
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot done"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <div className="streak-caption">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
      <div className="section-label">Recent lectures</div>
      <div className="card-row">
        <div className="idx-card">
          <div>
            <div className="idx-tag">CHEM 201</div>
            <div className="idx-title">
              Thermodynamics — Entropy &amp; the 2nd Law
            </div>
          </div>
          <div className="idx-meta">
            <span>Jul 1</span>
            <span className="status-pill status-done">6 cards due</span>
          </div>
        </div>
        <div className="idx-card">
          <div>
            <div className="idx-tag">POL SCI 110</div>
            <div className="idx-title">
              History of Political Thought — Week 4
            </div>
          </div>
          <div className="idx-meta">
            <span>Jun 29</span>
            <span className="status-pill status-done">4 cards due</span>
          </div>
        </div>
        <div className="idx-card">
          <div>
            <div className="idx-tag">CS 350</div>
            <div className="idx-title">Distributed Systems — Consensus</div>
          </div>
          <div className="idx-meta">
            <span>Jun 27</span>
            <span className="status-pill status-processing">transcribing…</span>
          </div>
        </div>
      </div>
      <div className="drop-cta">
        <div className="drop-cta-copy">
          <div className="section-label">Add a lecture</div>
          <p>
            Drop an audio file, paste raw notes, or record live from the
            extension.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={handleUploadClick}>
          Upload audio
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
        >
          Generate cards from notes
        </button>
      </div>
    </main>
  );
}

export default Dashboard;
