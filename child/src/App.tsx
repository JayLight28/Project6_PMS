import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Settings,
  LogOut,
  AlertCircle,
  FileText,
  Clock,
  Download,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  ChevronRight,
  Anchor,
  User as UserIcon,
  Lock
} from 'lucide-react';
import Layout from './components/Layout/Layout';
import SMSModule from './modules/sms/SMSModule';

interface User {
  id: number;
  username: string;
  role: 'master' | 'user';
}

interface Template {
  id: number;
  name: string;
  fields_json: string;
}

interface Document {
  id: number;
  template_id: number;
  template_name: string;
  title: string;
  data_json: string;
  author_name: string;
  status: 'draft' | 'completed';
  edit_count: number;
  updated_at: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'sms' | 'pms' | 'sync' | 'settings'>('dashboard');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Login State
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  useEffect(() => {
    if (user) fetchData();
  }, [user, view]);

  const fetchData = async () => {
    try {
      // Mocking fetch as placeholders for now
      if (view === 'dashboard' || view === 'sms') {
        const res = await fetch('http://localhost:3002/api/documents');
        if (res.ok) setDocuments(await res.json());
      }
    } catch (err) { console.error("Fetch error - Check if backend is running:", err); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3002/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });
    if (res.ok) setUser(await res.json());
    else alert('Invalid login (Use: admin / admin123)');
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
  };

  if (!user) {
    return (
      <div className="login-screen" style={{
        background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }} className="fade-in">
          <Anchor size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', letterSpacing: '-0.05em' }}>
            PROJECT 6 <span style={{ color: 'var(--accent)' }}>PMS</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', letterSpacing: '0.2em' }}>MARITIME SAFETY & MAINTENANCE</p>
        </div>

        <div className="glass-card login-card fade-in" style={{ width: '400px', padding: '3rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem', fontSize: '0.875rem' }}>Authorized Personnel Only</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-dim)' }} />
              <input 
                placeholder="Username" 
                style={{ paddingLeft: '3rem' }}
                value={loginData.username} 
                onChange={e => setLoginData({...loginData, username: e.target.value})} 
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-dim)' }} />
              <input 
                type="password" 
                placeholder="Password" 
                style={{ paddingLeft: '3rem' }}
                value={loginData.password} 
                onChange={e => setLoginData({...loginData, password: e.target.value})} 
              />
            </div>
            <button className="btn" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
              Access Terminal
            </button>
          </form>
        </div>
        
        <p style={{ color: '#334155', fontSize: '0.7rem' }}>© 2026 FORTUNE FLEET MULTI-PMS SYSTEM</p>
      </div>
    );
  }

  return (
    <Layout currentView={view} setView={setView} user={user} onLogout={handleLogout}>
      {/* 1. Dashboard View */}
      {view === 'dashboard' && (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="glass-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Overdue Tasks</p>
              <h3 style={{ fontSize: '2rem' }}>0</h3>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Due Today</p>
              <h3 style={{ fontSize: '2rem' }}>4</h3>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Due This Week</p>
              <h3 style={{ fontSize: '2rem' }}>12</h3>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Unsynced Reports</p>
              <h3 style={{ fontSize: '2rem', color: 'var(--accent)' }}>3</h3>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Vessel Activity Log</h3>
              <button className="btn-secondary" style={{ fontSize: '0.75rem' }}>View All</button>
            </div>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Operator</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-dim)' }}>10:45 AM</td>
                  <td>Document Finalized</td>
                  <td><span style={{ color: 'var(--accent)' }}>SMS</span></td>
                  <td>Master J. Doe</td>
                  <td><span style={{ color: 'var(--success)' }}>Completed</span></td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-dim)' }}>09:15 AM</td>
                  <td>Main Engine Check</td>
                  <td><span style={{ color: 'var(--warning)' }}>PMS</span></td>
                  <td>C/E Park</td>
                  <td><span style={{ color: 'var(--warning)' }}>In Progress</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(view === 'sms' || view === 'pms' || view === 'sync' || view === 'settings') && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: 'var(--text-dim)',
          textAlign: 'center' 
        }}>
          <Anchor size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
          <h2 style={{ opacity: 0.5 }}>Module Phase Initializing</h2>
          <p style={{ maxWidth: '400px', marginTop: '1rem', fontSize: '0.875rem' }}>
            This module is currently being provisioned. Features will be integrated in Phase {view === 'sms' ? '2' : view === 'pms' ? '3' : '4'}.
          </p>
        </div>
      )}
    </Layout>
  );
}

export default App;
