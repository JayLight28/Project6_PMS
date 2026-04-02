import React from 'react';
import { 
  Bell, 
  Search, 
  Menu,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  title: string;
  vesselName: string;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, vesselName, onToggleSidebar }) => {
  return (
    <header style={{ 
      height: 'var(--header-h)', 
      padding: '0 2.5rem', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(2, 6, 23, 0.5)',
      backdropFilter: 'blur(10px)',
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={onToggleSidebar}
          className="btn-secondary" 
          style={{ width: '40px', height: '40px', padding: 0 }}
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: '1.75rem', textTransform: 'capitalize' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '0.6rem 1.25rem', 
          borderRadius: '30px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>System Online</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{vesselName}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ width: '45px', height: '45px', padding: 0, borderRadius: '50%' }}>
            <Search size={20} />
          </button>
          <button className="btn-secondary" style={{ width: '45px', height: '45px', padding: 0, borderRadius: '50%', position: 'relative' }}>
            <Bell size={20} />
            <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--primary)' }}></div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
