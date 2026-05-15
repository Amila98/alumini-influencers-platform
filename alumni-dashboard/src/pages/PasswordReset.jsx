import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ type: 'error', msg: "Passwords do not match." });
    }

    setLoading(true);
    try {
      // Endpoint: POST /api/auth/reset-password/:token
      await axios.post(`https://alumini-influencers-platform-api.onrender.com/api/auth/reset-password/${token}`, { 
        password 
      });
      
      setStatus({ type: 'success', msg: "Password reset successful! Redirecting to login..." });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.message || "Link expired or invalid." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Create New Password</h2>
          <p>Please enter and confirm your new secure password.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {status.msg && (
          <div className={`status-msg ${status.type}`}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
