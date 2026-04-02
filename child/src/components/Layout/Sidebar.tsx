import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Database, 
  ShieldCheck, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
  user: any;
  onLogout: () => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout, isOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sms', label: 'SMS Documents', icon: FileText },
    { id: 'pms', label: 'PMS Maintenance', icon: Database },
    { id: 'sync', label: 'Sync Center', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar-wrapper ${!isOpen ? 'collapsed' : ''}`}>
      <div style={{ marginBottom: '3rem', padding: isOpen ? '0 1rem' : '0' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: 'var(--accent)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          justifyContent: isOpen ? 'flex-start' : 'center'
        }}>
          🚢 <span className="sidebar-header-text" style={{ fontFamily: 'Outfit' }}>PMS PRO</span>
        </h2>
        {isOpen && (
          <p className="sidebar-header-text" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
            VESSEL NODE v1.0
          </p>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={!isOpen ? item.label : ''}
              onClick={() => setView(item.id)}
            >
              <Icon size={20} />
              {isOpen && <span className="nav-text" style={{ flex: 1 }}>{item.label}</span>}
              {isOpen && isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        {isOpen && (
          <div className="user-info" style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{user?.username || 'Crew'}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              {user?.role || 'User'} Level
            </p>
          </div>
        )}
        <button 
          className="nav-item" 
          onClick={onLogout} 
          style={{ color: 'var(--danger)', justifyContent: isOpen ? 'flex-start' : 'center' }}
          title={!isOpen ? 'Logout System' : ''}
        >
          <LogOut size={20} />
          {isOpen && <span className="nav-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
