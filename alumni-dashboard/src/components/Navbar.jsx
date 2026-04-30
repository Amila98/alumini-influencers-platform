import { clearApiKey } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    clearApiKey();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Section */}
        <div className="nav-brand" onClick={() => navigate('/dashboard')}>
          <div className="nav-logo-container">
            <div className="nav-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </div>
            <div className="nav-logo-glow"></div>
          </div>
          <div className="nav-brand-info">
            <span className="nav-brand-text">Alumni<span className="text-highlight">Intelligence</span></span>
            <span className="nav-brand-sub">University of Eastminster</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="nav-main">
          <button 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-link ${isActive('/alumni') ? 'active' : ''}`}
            onClick={() => navigate('/alumni')}
          >
            Alumni Directory
          </button>
        </div>

        {/* Profile/Actions */}
        <div className="nav-actions">
          <div className="nav-user-badge">
            <div className="user-dot"></div>
            <span className="user-role">Staff</span>
          </div>
          <div className="nav-divider" />
          <button className="nav-logout-btn" onClick={handleLogout} title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}