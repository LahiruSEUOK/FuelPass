import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MapIcon, List, PlusCircle, ShieldAlert } from 'lucide-react';
import MapView from './pages/MapView';
import ListView from './pages/ListView';
import ShedDetail from './pages/ShedDetail';
import AddShed from './pages/AddShed';
import Admin from './pages/Admin';
import OddEvenBanner from './components/OddEvenBanner';
import { useTranslation } from './hooks/useTranslation';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isActive('/')}`}>
        <List />
        <span>{t('list')}</span>
      </Link>
      <Link to="/map" className={`nav-item ${isActive('/map')}`}>
        <MapIcon />
        <span>{t('map')}</span>
      </Link>
      <Link to="/add" className={`nav-item ${isActive('/add')}`}>
        <PlusCircle />
        <span>{t('addShed')}</span>
      </Link>
      <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>
        <ShieldAlert />
        <span>{t('admin')}</span>
      </Link>
    </nav>
  );
}

function App() {
  const { lang, setLanguage } = useTranslation();

  return (
    <Router>
      <header className="app-header">
        <div className="brand">
          <FuelIcon /> FuelLK
        </div>
        <select 
          value={lang} 
          onChange={(e) => setLanguage(e.target.value)}
          className="lang-select"
          style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
        >
          <option value="en">English</option>
          <option value="si">සිංහල</option>
          <option value="ta">தமிழ்</option>
        </select>
      </header>

      <OddEvenBanner />

      <main style={{ paddingBottom: '70px' }}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/shed/:id" element={<ShedDetail />} />
          <Route path="/add" element={<AddShed />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <Navigation />
    </Router>
  );
}

const FuelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"></line>
    <line x1="4" y1="9" x2="14" y2="9"></line>
    <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path>
    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path>
  </svg>
);

export default App;
