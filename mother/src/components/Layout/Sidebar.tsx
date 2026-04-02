import React from 'react';
import {
  BarChart3,
  FileStack,
  Wrench,
  RefreshCw,
  Settings,
  LogOut,
  ChevronRight,
  Layers,
  Ship,
  Plus
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
  selectedVessel: any;
  onSelectVessel: (vessel: any) => void;
  vessels: any[];
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onAddVessel: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  selectedVessel,
  onSelectVessel,
  vessels,
  user,
  onLogout,
  isOpen,
  onAddVessel
}) => {
  const mainModules = [
    { id: 'dashboard', label: 'Fleet Overview', icon: BarChart3 },
    { id: 'sms', label: 'SMS Center', icon: FileStack },
    { id: 'pms', label: 'PMS Master', icon: Wrench },
    { id: 'sync', label: 'Sync Console', icon: RefreshCw },
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
          <Layers size={24} /> <span className="sidebar-header-text" style={{ fontFamily: 'Outfit' }}>HOMEPORT</span>
        </h2>
        {isOpen && (
          <p className="sidebar-header-text" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
            FLEET COMMAND HUB
          </p>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', paddingRight: isOpen ? '0.5rem' : '0' }}>
        {/* Main Fleet Modules */}
        <div style={{ marginBottom: '2rem' }}>
          {mainModules.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id && !selectedVessel;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { setView(item.id); onSelectVessel(null); }}
              >
                <Icon size={24} />
                {isOpen && <span className="nav-text" style={{ flex: 1, fontSize: '1.05rem', fontWeight: 600 }}>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Vessel List */}
        <div style={{ marginBottom: '1.5rem' }}>
          {isOpen && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 1rem',
              marginBottom: '0.5rem'
            }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>VESSELS</p>
              <button
                className="btn-icon"
                onClick={onAddVessel}
                style={{ color: 'var(--accent)', width: '24px', height: '24px' }}
                title="Add Vessel"
              >
                <Plus size={14} />
              </button>
            </div>
          )}

          {vessels.map((vessel) => {
            const isActive = selectedVessel?.id === vessel.id;
            return (
          <button
                key={vessel.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectVessel(vessel)}
                title={!isOpen ? vessel.vessel_name : ''}
              >
                <Ship size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--text-dim)' }} />
                {isOpen && <span className="nav-text" style={{ flex: 1, fontSize: '0.875rem' }}>{vessel.vessel_name}</span>}
                {isOpen && isActive && <ChevronRight size={14} />}
              </button>
            );
          })}

          {vessels.length === 0 && isOpen && (
            <p style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>No vessels registered</p>
          )}
        </div>
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        {isOpen && (
          <div className="user-info" style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>HQ Admin</p>
          </div>
        )}
        <button
          className="nav-item"
          onClick={onLogout}
          style={{ color: 'var(--danger)', justifyContent: isOpen ? 'flex-start' : 'center' }}
        >
          <LogOut size={18} />
          {isOpen && <span className="nav-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
