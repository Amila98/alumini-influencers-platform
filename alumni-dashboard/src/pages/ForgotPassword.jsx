import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
      setStatus({ 
        type: 'success', 
        msg: "If an account exists, a reset link has been sent to your email." 
      });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.message || "Error processing request." 
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
          <h2>Reset Password</h2>
          <p>Enter your institutional email to receive a secure reset link.</p>
        </div>

        <form className="auth-form" onSubmit={handleReset}>
          <div className="input-group">
            <label htmlFor="email">Staff Email Address</label>
            <input 
              id="email"
              type="email" 
              placeholder="e.g., user@my.eastminster.ac.uk" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>

        {status.msg && (
          <div className={`status-msg ${status.type}`}>
            {status.msg}
          </div>
        )}

        <Link to="/login" className="back-link">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}