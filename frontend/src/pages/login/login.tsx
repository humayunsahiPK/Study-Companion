import "./login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, setToken } from "../../api/client";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await apiRequest<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
        requiresAuth: false,
      });
      setToken(data.access_token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login">
      <div className="login-card">
        <div className="eyebrow">Study Companion</div>
        <h1>Sign in.</h1>
        <p className="login-subtext">
          Pick up where you left off with your lectures and cards.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Email
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="login-label">
            Password
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="btn login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button className="btnrev btn-ghostrev" onClick={() => navigate("/")}>
          Back to dashboard
        </button>
      </div>
    </main>
  );
}

export default Login;
