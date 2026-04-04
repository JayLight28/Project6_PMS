import React from 'react';
import {
  ChevronRight,
  Plus,
  Ship,
  LogOut,
  Layers,
  LucideIcon
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
  isOpen: boolean;
  mode: 'mother' | 'child';
  
  // Mother exclusive
  vessels?: any[];
  selectedVessel?: any;
  onSelectVessel?: (vessel: any) => void;
  onAddVessel?: () => void;
  mainModules?: { id: string; label: string; icon: LucideIcon }[];

  // Child exclusive
  user?: any;
  onLogout?: () => void;
  menuItems?: { id: string; label: string; icon: LucideIcon }[];
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  isOpen,
  mode,
  vessels = [],
  selectedVessel,
  onSelectVessel,
  onAddVessel,
  mainModules = [],
  user,
  onLogout,
  menuItems = []
}) => {
  const items = mode === 'mother' ? mainModules : menuItems;

  return (
    <aside className={`sidebar-wrapper ${!isOpen ? 'collapsed' : ''}`}>
      {/* Header / Logo */}
      <div style={{ marginBottom: '3rem', padding: isOpen ? '0 1rem' : '0' }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: isOpen ? 'flex-start' : 'center'
        }}>
          {mode === 'mother' ? <Layers size={24} /> : '🚢'} 
          <span className="sidebar-header-text" style={{ fontFamily: 'Outfit' }}>
            {mode === 'mother' ? 'HOMEPORT' : 'PMS PRO'}
          </span>
        </h2>
        {isOpen && (
          <p className="sidebar-header-text" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
            {mode === 'mother' ? 'FLEET COMMAND HUB' : 'VESSEL NODE v1.0'}
          </p>
        )}
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingRight: isOpen ? '0.5rem' : '0' }}>
        <div style={{ marginBottom: '2rem' }}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = mode === 'mother' 
              ? (currentView === item.id && !selectedVessel)
              : (currentView === item.id);
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { 
                  setView(item.id); 
                  if (mode === 'mother' && onSelectVessel) onSelectVessel(null); 
                }}
                title={!isOpen ? item.label : ''}
              >
                <Icon size={mode === 'mother' ? 24 : 20} />
                {isOpen && <span className="nav-text" style={{ flex: 1, fontSize: mode === 'mother' ? '1.05rem' : '0.875rem', fontWeight: mode === 'mother' ? 600 : 500 }}>{item.label}</span>}
                {isOpen && isActive && mode === 'child' && <ChevronRight size={16} />}
              </button>
            );
          })}
        </div>

        {/* Mother Specific: Vessel List */}
        {mode === 'mother' && (
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

            {vessels.map((vessel: any) => {
              const isActive = selectedVessel?.id === vessel.id;
              return (
                <button
                  key={vessel.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectVessel && onSelectVessel(vessel)}
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
        )}
      </nav>

      {/* Child Specific: User Profile & Logout */}
      {mode === 'child' && (
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
      )}
    </aside>
  );
};

export default Sidebar;
