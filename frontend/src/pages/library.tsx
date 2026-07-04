import "./library.css";

function Library() {
  return (
    <main className="library">
      <div className="page-head">
        <div>
          <div className="eyebrow">All lectures</div>
          <h1>Library.</h1>
        </div>
        <button className="btn btn-ghost">Export full deck (.apkg)</button>
      </div>

      <table className="lib-table">
        <thead>
          <tr>
            <th>Lecture</th>
            <th>Subject</th>
            <th>Recorded</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="lib-title">
              Thermodynamics — Entropy &amp; the 2nd Law
            </td>
            <td className="lib-tag">CHEM 201</td>
            <td className="lib-date">Jul 1</td>
            <td>
              <span className="status-pilllib status-donelib">Ready</span>
            </td>
            <td className="lib-due has-due">6 due</td>
          </tr>
          <tr>
            <td className="lib-title">History of Political Thought — Week 4</td>
            <td className="lib-tag">POL SCI 110</td>
            <td className="lib-date">Jun 29</td>
            <td>
              <span className="status-pilllib status-donelib">Ready</span>
            </td>
            <td className="lib-due has-due">4 due</td>
          </tr>
          <tr>
            <td className="lib-title">Distributed Systems — Consensus</td>
            <td className="lib-tag">CS 350</td>
            <td className="lib-date">Jun 27</td>
            <td>
              <span className="status-pilllib status-processinglib">
                Transcribing
              </span>
            </td>
            <td className="lib-due none">—</td>
          </tr>
          <tr>
            <td className="lib-title">Cellular Respiration — Krebs Cycle</td>
            <td className="lib-tag">BIO 140</td>
            <td className="lib-date">Jun 24</td>
            <td>
              <span className="status-pill status-done">Ready</span>
            </td>
            <td className="lib-due none">Not due</td>
          </tr>
          <tr>
            <td className="lib-title">Contract Law — Offer &amp; Acceptance</td>
            <td className="lib-tag">LAW 210</td>
            <td className="lib-date">Jun 20</td>
            <td>
              <span className="status-pill status-done">Ready</span>
            </td>
            <td className="lib-due has-due">2 due</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}

export default Library;
