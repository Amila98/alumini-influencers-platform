import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, generateApiKey, setApiKey, getApiKey } from '../services/api';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Requirement: University domain required
    if (!email.endsWith("@my.eastminster.ac.uk")) {
      setError("Access only allowed for University staff emails.");
      return;
    }

    setLoading(true);

    try {
      const loginRes = await login(email, password);
      const { token, user } = loginRes.data;

      // Role Enforcement: Explicitly check for 'staff' 
      if (user.role !== "staff") {
        setError(
          "Unauthorized: This dashboard is reserved for University Staff.",
        );
        setLoading(false);
        return;
      }

      // Save session data 
      localStorage.setItem("user", JSON.stringify(user));

      // API Key Scoping 
      const keyRes = await generateApiKey(
        token,
        "Analytics Dashboard",
        "analytics_dashboard",
      );
      const apiKey = keyRes.data.apiKey.key;

      setApiKey(apiKey);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid staff credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-background-decor">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="login-card-v2">
        <header className="login-header">
          <div className="brand-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1>Alumni Intelligence</h1>
          <p>University Analytics & Strategic Dashboard</p>
        </header>

        {error && (
          <div className="error-box">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>University Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@my.eastminster.ac.uk"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span className="loader-text">Verifying...</span>
            ) : (
              "Sign in"
            )}
          </button>
          <div className="login-footer">
            <div className="login-actions">
              <button type="button" className="action-link" onClick={() => navigate("/register")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
                </svg>
                Create Account
              </button>
              <button type="button" className="action-link" onClick={() => navigate("/forgot-password")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Reset Password
              </button>
            </div>
            <p className="copyright">2026 Phantasmagoria Ltd / University of Eastminster</p>
          </div>
        </form>
      </div>
    </div>
  );
}