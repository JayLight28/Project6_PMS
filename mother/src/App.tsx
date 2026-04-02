import React, { useState } from 'react';
import { 
  Plus,
  Search,
  Anchor,
  Activity,
  AlertCircle
} from 'lucide-react';
import Layout from './components/Layout/Layout';
import SMSModule from './modules/sms/SMSModule';
import PMSModule from './modules/pms/PMSModule';

// --- Types ---
interface Vessel {
  id: number;
  vessel_name: string;
  vessel_id: string; // IMO Number
  last_sync_at: string | null;
  status: 'online' | 'offline';
}

interface Template {
  id: number;
  name: string;
  version: number;
  updated_at: string;
}

function App() {
  const [view, setView] = useState<'dashboard' | 'templates' | 'pms' | 'sync'>('dashboard');
  const [vessels, setVessels] = useState<Vessel[]>([
    { id: 1, vessel_name: 'MV PACIFIC GLORY', vessel_id: 'IMO 9123456', last_sync_at: '2026-04-01 10:00', status: 'online' },
    { id: 2, vessel_name: 'MV ATLANTIC STAR', vessel_id: 'IMO 9876543', last_sync_at: '2026-03-30 15:30', status: 'offline' }
  ]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVessel, setNewVessel] = useState({ vessel_name: '', vessel_id: '' });

  const handleSelectVessel = (vessel: Vessel | null) => {
    setSelectedVessel(vessel);
    if (vessel) {
      setView('dashboard'); // Default to vessel dashboard when selected
    }
  };

  const handleAddVessel = () => {
    if (!newVessel.vessel_name || !newVessel.vessel_id) return;
    const vessel: Vessel = {
      id: Date.now(),
      vessel_name: newVessel.vessel_name,
      vessel_id: newVessel.vessel_id,
      last_sync_at: null,
      status: 'online'
    };
    setVessels([...vessels, vessel]);
    setNewVessel({ vessel_name: '', vessel_id: '' });
    setIsModalOpen(false);
  };

  return (
    <Layout 
      currentView={view} 
      setView={setView} 
      selectedVessel={selectedVessel}
      onSelectVessel={handleSelectVessel}
      vessels={vessels}
      user={{ username: 'hq_admin' }}
      onLogout={() => console.log('Logout')}
      onAddVessel={() => setIsModalOpen(true)}
    >
      {/* 1. Global Fleet Dashboard */}
      {!selectedVessel && view === 'dashboard' && (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="glass-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Fleet Size</p>
              <h3 style={{ fontSize: '2rem' }}>{vessels.length}</h3>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Active Alerts</p>
              <h3 style={{ fontSize: '2rem', color: 'var(--danger)' }}>14</h3>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pending Reviews</p>
              <h3 style={{ fontSize: '2rem', color: 'var(--warning)' }}>8</h3>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Avg Sync Health</p>
              <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>94%</h3>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Vessel Status Overview</h3>
              <div className="search-box" style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
                <input placeholder="Search fleet..." style={{ width: '250px', paddingLeft: '2.5rem', marginBottom: 0, height: '40px' }} />
              </div>
            </div>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Vessel Name</th>
                  <th>IMO Number</th>
                  <th>Last Sync</th>
                  <th>PMS Status</th>
                  <th>SMS Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.vessel_name}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{v.vessel_id}</td>
                    <td>{v.last_sync_at || 'Never'}</td>
                    <td><span style={{ color: 'var(--success)' }}>On Schedule</span></td>
                    <td>2 Pending</td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => handleSelectVessel(v)}>
                        Open Mimic
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Vessel Mimic Dashboard (Specific Vessel Context) */}
      {selectedVessel && view === 'dashboard' && (
        <div className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent)' }}>
            <Activity size={20} style={{ color: 'var(--accent)' }} />
            <p style={{ fontSize: '0.875rem' }}>
              <strong>Mimic Mode Active:</strong> You are viewing <strong>{selectedVessel.vessel_name}</strong>. Data shown is from the last sync: {selectedVessel.last_sync_at}.
            </p>
            <button className="btn" style={{ marginLeft: 'auto', padding: '0.5rem 1rem' }} onClick={() => handleSelectVessel(null)}>
              Exit Mimic
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3>Vessel Details</h3>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Official Name</label><p>{selectedVessel.vessel_name}</p></div>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>IMO Number</label><p>{selectedVessel.vessel_id}</p></div>
                <div><label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Sync Cycle</label><p>Daily Delta</p></div>
              </div>
            </div>
            <div className="glass-card">
              <h3>Recent Fleet Reports</h3>
              <div style={{ marginTop: '1.5rem', opacity: 0.5, textAlign: 'center', padding: '2rem' }}>
                <Anchor size={40} style={{ marginBottom: '1rem' }} />
                <p>Sync data is being parsed for this vessel...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Admin Modules */}
      {!selectedVessel && (view === 'templates' || view === 'pms' || view === 'sync') && (
        <div className="fade-in">
           <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <AlertCircle size={48} style={{ color: 'var(--accent)', opacity: 0.3, marginBottom: '1.5rem' }} />
              <h2 style={{ opacity: 0.5 }}>HQ Administration Module</h2>
              <p style={{ maxWidth: '500px', margin: '1rem auto', color: 'var(--text-dim)' }}>
                This section will allow HQ staff to manage master templates and global PMS items that are distributed across the fleet. 
                <strong> Scheduled for Phase 2 & 3.</strong>
              </p>
           </div>
        </div>
      )}

      {/* 2. SMS Module View */}
      {view === 'sms' && <SMSModule />}

      {/* 3. PMS Module View */}
      {view === 'pms' && <PMSModule />}

      {/* 4. Modal for adding vessel */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card" style={{ width: '450px', padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Register New Vessel</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.875rem' }}>Deploy a new synchronization node to the fleet.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Ship Name</label>
                <input placeholder="e.g. MV PACIFIC GLORY" value={newVessel.vessel_name} onChange={e => setNewVessel({...newVessel, vessel_name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Vessel ID / IMO</label>
                <input placeholder="e.g. IMO 9123456" value={newVessel.vessel_id} onChange={e => setNewVessel({...newVessel, vessel_id: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="btn" style={{ flex: 1 }} onClick={handleAddVessel}>Add Vessel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
