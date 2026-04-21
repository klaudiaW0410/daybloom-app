import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Calendar, 
  CircleDot, 
  Target, 
  BarChart2, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/today', icon: Sun, label: 'Today' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/habits', icon: CircleDot, label: 'Habits' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/stats', icon: BarChart2, label: 'Stats' },
];

export const Navbar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: '40px', padding: '0 16px' }}>
          <h1 style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            DAYBLOOM
          </h1>
        </div>
        
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Settings />
            <span>Settings</span>
          </NavLink>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', textAlign: 'left' }}>
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tabs */}
      <nav className="bottom-tabs">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ flexDirection: 'column', fontSize: '10px', gap: '4px', padding: '8px' }}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
