import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { FaMusic, FaSearch, FaList, FaCrown, FaSignOutAlt, FaUser } from 'react-icons/fa';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <FaMusic />
          <span>MusicStream</span>
        </Link>
        
        <nav className="nav">
          <Link to="/" className="nav-link">
            <FaMusic /> Home
          </Link>
          <Link to="/search" className="nav-link">
            <FaSearch /> Search
          </Link>
          {isAuthenticated && (
            <Link to="/library" className="nav-link">
              <FaList /> Library
            </Link>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              {!user?.is_premium && (
                <Link to="/premium" className="premium-btn">
                  <FaCrown /> Go Premium
                </Link>
              )}
              <div className="user-menu">
                <FaUser />
                <span>{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
