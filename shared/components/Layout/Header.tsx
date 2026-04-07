import React from 'react';
import { 
  Bell, 
  Search, 
  Menu,
  Globe
} from 'lucide-react';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  mode: 'mother' | 'child';
  vesselCount?: number; // Mother exclusive
  vesselName?: string;  // Child exclusive
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onToggleSidebar, 
  mode, 
  vesselCount, 
  vesselName 
}) => {
  return (
    <header style={{
      height: 'var(--header-h)',
      padding: mode === 'mother' ? '0 1rem' : '0 1.5rem',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: mode === 'mother' ? '1rem' : '1.5rem' }}>
        <button 
          onClick={onToggleSidebar}
          className={mode === 'mother' ? 'btn-icon' : 'btn-secondary'}
          style={mode === 'child' ? { width: '40px', height: '40px', padding: 0 } : {}}
        >
          <Menu size={mode === 'mother' ? 18 : 20} />
        </button>
        <h1 style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {/* Context Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          background: mode === 'mother' ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255,255,255,0.05)', 
          padding: '0.6rem 1.25rem', 
          borderRadius: '30px',
          border: mode === 'mother' ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid var(--border)'
        }}>
          {mode === 'mother' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>FLEET CONTEXT</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>System Online</span>
            </div>
          )}
          
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: mode === 'mother' ? 'var(--text-dim)' : 'var(--accent)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: mode === 'child' ? 700 : 400 }}>
              {mode === 'mother' ? `${vesselCount} Ships Registered` : vesselName}
            </span>
          </div>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={mode === 'mother' ? 'btn-icon' : 'btn-secondary'} style={mode === 'child' ? { width: '45px', height: '45px', padding: 0, borderRadius: '50%' } : {}}>
            <Search size={mode === 'mother' ? 18 : 20} />
          </button>
          <button className={mode === 'mother' ? 'btn-icon' : 'btn-secondary'} style={mode === 'child' ? { width: '45px', height: '45px', padding: 0, borderRadius: '50%', position: 'relative' } : { position: 'relative' }}>
            <Bell size={mode === 'mother' ? 18 : 20} />
            <div style={{ 
              position: 'absolute', 
              top: mode === 'mother' ? '10px' : '12px', 
              right: mode === 'mother' ? '10px' : '12px', 
              width: '8px', 
              height: '8px', 
              background: mode === 'mother' ? 'var(--warning)' : 'var(--danger)', 
              borderRadius: '50%', 
              border: '2px solid var(--primary)' 
            }}></div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
