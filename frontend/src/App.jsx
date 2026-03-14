import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Sun, Moon } from 'lucide-react';

import Login from './components/Login';
import NurseStation from './components/NurseStation';
import DoctorDashboard from './components/DoctorDashboard';
import SearchPatient from './components/SearchPatient';
import NotificationLog from './components/NotificationLog';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('lifekey_token');
  const [theme, setTheme] = useState(localStorage.getItem('lifekey_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('lifekey_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('lifekey_token');
    localStorage.removeItem('lifekey_user');
    navigate('/login');
  };

  const showNav = location.pathname !== '/login';

  return (
    <>
      {showNav && (
        <nav className="navbar">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Activity className="brand-icon" size={28} />
            LifeKey
          </div>
          {token && (
            <div className="nav-links">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/nurse'); }} className={location.pathname === '/nurse' ? 'active' : ''}>Nurse Station</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} className={location.pathname === '/dashboard' ? 'active' : ''}>Emergency Dashboard</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/search'); }} className={location.pathname === '/search' ? 'active' : ''}>Search Patient</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/notifications'); }} className={location.pathname === '/notifications' ? 'active' : ''}>Notification Log</a>
              <button 
                className="btn btn-outline" 
                style={{ padding: '0.4rem', marginLeft: '0.5rem', border: 'none' }} 
                onClick={toggleTheme}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </nav>
      )}
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/nurse" element={<NurseStation />} />
        <Route path="/dashboard" element={<DoctorDashboard />} />
        <Route path="/search" element={<SearchPatient />} />
        <Route path="/notifications" element={<NotificationLog />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
