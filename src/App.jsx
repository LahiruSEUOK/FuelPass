import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { List, Plus, User } from 'lucide-react';
import ListView from './pages/ListView';
import ShedDetail from './pages/ShedDetail';
import AddShed from './pages/AddShed';
import Admin from './pages/Admin';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isActive('/')}`}>
        <List size={22} />
        <span style={{ fontSize: '0.65rem', marginTop: '0.15rem', fontWeight: '600' }}>Stations</span>
      </Link>
      
      <Link to="/add">
        <div className="fab-pill-btn">
          <Plus size={16} strokeWidth={3} />
          <span>Add Station</span>
        </div>
      </Link>
      
      <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>
        <User size={22} />
        <span style={{ fontSize: '0.65rem', marginTop: '0.15rem', fontWeight: '600' }}>Admin</span>
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <main style={{ paddingBottom: '90px', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/shed/:id" element={<ShedDetail />} />
          <Route path="/add" element={<AddShed />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Navigation />
    </Router>
  );
}

export default App;
