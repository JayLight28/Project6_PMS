import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Search as SearchIcon,
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import TreeNavigator, { type TreeNode } from '@shared/components/TreeNavigator';

const SMSModule: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3002/api/templates');
      if (res.ok) {
        const data = await res.json();
        // Templates usually come as a list, need to group them by category for the tree
        // For now, let's just show them as a flat list under 'Documents'
        setTree([{
          id: 'root',
          level: 0,
          type: 'folder',
          name: 'SMS Templates',
          children: data.map((t: any) => ({
            id: `template-${t.id}`,
            level: 1,
            type: 'file',
            name: t.name,
            template: t
          }))
        }]);
      }
    } catch (err) {
      console.error("Failed to fetch SMS tree:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - var(--header-h) - 5rem)' }}>
      {/* Sidebar: Tree Navigation */}
      <div className="glass-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: 'var(--accent)' }} /> SMS Explorer
          </h3>
          <div className="search-box" style={{ position: 'relative' }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
            <input placeholder="Search documents..." style={{ paddingLeft: '2.5rem', marginBottom: 0, height: '40px' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          <TreeNavigator nodes={mockTree} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
        </div>
      </div>

      {/* Main Panel: Document View/Forms */}
      <div className="glass-card" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        {selectedNode ? (
          nodeView(selectedNode)
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', opacity: 0.5 }}>
            <FileText size={80} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>Select a document or clause from the tree to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeView = (node: TreeNode) => {
  if (node.type === 'folder') {
    return (
      <div className="fade-in">
        <h2 style={{ marginBottom: '0.5rem' }}>{node.name}</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Category Folder containing all relevant sub-clauses and forms.</p>
        
        <div className="table-container" style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table className="table-glass">
            <thead>
              <tr>
                <th>Sub-Item Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {node.children?.map(child => (
                <tr key={child.id}>
                  <td style={{ fontWeight: 600 }}>{child.name}</td>
                  <td>{child.type === 'folder' ? 'Category' : 'Document Form'}</td>
                  <td><span style={{ color: child.type === 'folder' ? 'var(--text-dim)' : 'var(--success)' }}>{child.type === 'folder' ? '-' : 'Ready'}</span></td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      {child.type === 'folder' ? 'Explore' : 'Open Form'}
                    </button>
                  </td>
                </tr>
              ))}
              {(!node.children || node.children.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>No sub-items found in this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>{node.name}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>v1.2.0</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              <Clock size={14} /> Last updated: 2 days ago
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <button className="btn-secondary">View History</button>
           <button className="btn"><Plus size={18} /> New Entry</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Drafts In-Progress</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
            <h3 style={{ fontSize: '1.5rem' }}>2</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Completed</p>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={20} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '1.5rem' }}>124</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Last Sync Staging</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Download size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.5rem' }}>Clean</h3>
          </div>
        </div>
      </div>

      <h3>Recent Documents</h3>
      <div className="table-container" style={{ marginTop: '1rem' }}>
        <table className="table-glass">
            <thead>
              <tr>
                <th>Document No.</th>
                <th>Author</th>
                <th>Date Issued</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>DOC-2026-0042</td>
                <td>Ch. Officer</td>
                <td>2026-04-02</td>
                <td><span style={{ color: 'var(--success)' }}>Completed</span></td>
                <td><button className="btn-secondary" style={{ padding: '0.4rem' }}>View</button></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>DOC-2026-0041</td>
                <td>Master</td>
                <td>2026-04-01</td>
                <td><span style={{ color: 'var(--success)' }}>Completed</span></td>
                <td><button className="btn-secondary" style={{ padding: '0.4rem' }}>View</button></td>
              </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default SMSModule;
