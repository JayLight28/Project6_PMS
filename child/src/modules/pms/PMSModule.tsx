import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search as SearchIcon,
  Plus
} from 'lucide-react';
import TreeNavigator, { type TreeNode } from '@shared/components/TreeNavigator';

const PMSModule: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTree();
  }, []);

  const handleTaskComplete = async (taskId: string, linkedTemplateId?: string) => {
    if (linkedTemplateId) {
      try {
        const res = await fetch(`http://localhost:3002/api/documents?template_id=${linkedTemplateId}`);
        if (res.ok) {
          const docs = await res.json();
          const isDone = docs.some((d: any) => d.status === 'completed' || d.status === 'signed');
          if (!isDone) {
            alert("Mandatory Safety Document (SMS) must be completed before closing this maintenance task.");
            return;
          }
        }
      } catch (err) {
        console.error("Link check failed:", err);
      }
    }

    try {
      const res = await fetch(`http://localhost:3002/api/pms/items/${taskId}/complete`, {
        method: 'POST'
      });
      if (res.ok) {
        // Refresh or update local state
        fetchTree();
        alert("Maintenance task completed successfully.");
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3002/api/pms/categories');
      if (res.ok) {
        const data = await res.json();
        // Convert flat categories to tree if needed, or assume backend returns tree
        // For now, assume backend returns tree structure
        setTree(data); 
      }
    } catch (err) {
      console.error("Failed to fetch PMS tree:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - var(--header-h) - 5rem)' }}>
      {/* Sidebar: Equipment Tree */}
      <div className="glass-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={20} style={{ color: 'var(--accent)' }} /> Equipment Tree
          </h3>
          <div className="search-box" style={{ position: 'relative' }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-dim)' }} />
            <input placeholder="Search equipment..." style={{ paddingLeft: '2.5rem', marginBottom: 0, height: '40px' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          <TreeNavigator nodes={tree} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
        </div>
      </div>

      {/* Main Panel: maintenance board */}
      <div className="glass-card" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        {selectedNode ? (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                  {selectedNode.type === 'folder' ? 'Equipment Category' : 'Maintenance Task'}
                </span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{selectedNode.name}</h1>
              </div>
            </div>

            {selectedNode.type === 'file' ? (
              <div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>INTERVAL</p>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} /> 6 Months</h3>
                    </div>
                    <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>LAST DONE</p>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> 2026-01-15</h3>
                    </div>
                    <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)', background: 'rgba(239, 68, 68, 0.05)' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>NEXT DUE</p>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}><AlertTriangle size={18} /> 2026-07-15</h3>
                    </div>
                 </div>

                 <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border)' }}>
                    <Activity size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h3>Maintenance Entry Form</h3>
                    <p style={{ color: 'var(--text-dim)', margin: '1rem 0' }}>Log specific findings and measurements for this equipment.</p>
                    <button className="btn"><Plus size={18} /> Create Work Order</button>
                 </div>
              </div>
            ) : (
              <div className="table-container">
                 <table className="table-glass">
                    <thead>
                       <tr>
                          <th>Task/Sub-Equipment</th>
                          <th>Frequency</th>
                          <th>Status</th>
                       </tr>
                    </thead>
                    <tbody>
                       {selectedNode.children?.map(child => (
                         <tr key={child.id}>
                            <td style={{ fontWeight: 600 }}>{child.name}</td>
                            <td>{child.type === 'file' ? '6M' : '-'}</td>
                            <td>
                               <span style={{ color: child.type === 'file' ? 'var(--success)' : 'var(--text-dim)' }}>
                                  {child.type === 'file' ? 'Operational' : 'Sub-Category'}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', opacity: 0.5 }}>
            <Wrench size={80} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>Select equipment to view maintenance schedule</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PMSModule;
