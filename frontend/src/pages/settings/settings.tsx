import "./settings.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, clearToken } from "../../api/client";

type UserInfo = {
  id: string;
  name: string;
  email: string;
};

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [emailReminders, setEmailReminders] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const [userData, prefsData] = await Promise.all([
          apiRequest<UserInfo>("/auth/me"),
          apiRequest<{ email_reminders: boolean }>("/auth/preferences"),
        ]);
        setUser(userData);
        setEmailReminders(prefsData.email_reminders);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load account.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleToggleReminders() {
    const newValue = !emailReminders;
    setEmailReminders(newValue);
    setIsSavingPrefs(true);
    try {
      await apiRequest("/auth/preferences", {
        method: "PUT",
        body: { email_reminders: newValue },
      });
    } catch (err) {
      setEmailReminders(!newValue);
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSavingPrefs(false);
    }
  }

  function handleSignOut() {
    clearToken();
    navigate("/login");
  }

  return (
    <main className="settings">
      <div className="page-head">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Settings.</h1>
        </div>
      </div>

      <div className="panel settings-panel">
        <div className="panel-title">Account</div>
        {isLoading ? (
          <p className="settings-copy">Loading account...</p>
        ) : error ? (
          <p className="settings-copy settings-error">{error}</p>
        ) : (
          <>
            <div className="settings-user-name">{user?.name}</div>
            <div className="settings-user-email">{user?.email}</div>
          </>
        )}
        <button
          className="btn btn-ghost settings-signout-btn"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>

      <div className="panel settings-panel">
        <div className="panel-title">Notifications</div>
        <div className="settings-toggle-row">
          <div>
            <div className="settings-toggle-label">
              Email reminders for due cards
            </div>
            <p className="settings-copy">
              Get a daily email when you have flashcards or MCQs due for review.
            </p>
          </div>
          <button
            className={`settings-toggle ${emailReminders ? "on" : ""}`}
            onClick={handleToggleReminders}
            disabled={isLoading || isSavingPrefs}
            aria-pressed={emailReminders}
            aria-label="Toggle email reminders"
          >
            <span className="settings-toggle-knob" />
          </button>
        </div>
      </div>
    </main>
  );
}

export default Settings;
