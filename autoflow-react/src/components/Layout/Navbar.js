import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    window.location.href = '/login'; 
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
      <div className="container-fluid">
        
        <div className="brand-pill">
            <Link className="navbar-brand m-0" to={isAuthenticated ? "/" : "/login"}>Autoflow</Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto links-pill">
            {isAuthenticated ? (
              <>
                {/* Link "Home" sekarang hanya muncul jika sudah login */}
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/transactions">Transactions</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Profile</Link> 
                </li>
                <li className="nav-item">
                  <button className="nav-link btn" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                {/* Blok ini berjalan jika belum login, tidak ada link "Home" */}
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;