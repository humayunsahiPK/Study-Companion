import "./settings.css";

function Settings() {
  return (
    <main className="settings">
      <div className="page-head">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Settings.</h1>
        </div>
      </div>
      <div className="panel" style={{ maxWidth: "480px" }}>
        <div className="panel-title">Notifications</div>
        <p
          style={{ fontSize: "14px", color: "var(--ink-dim)", lineHeight: 1.6 }}
        >
          Daily digest emails and the extension's shared login state would live
          here — this screen is a placeholder in the prototype.
        </p>
      </div>
    </main>
  );
}

export default Settings;
