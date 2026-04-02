import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings,
  Wrench,
  FolderPlus,
  Plus,
  Trash2,
  Edit2,
  Zap
} from 'lucide-react';
import TreeNavigator, { type TreeNode } from '@shared/components/TreeNavigator';
import Modal from '@shared/components/Modal';

const PMSModule: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Global Equipment Tree
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Task Management State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', interval_months: 6, linked_template_id: '' });
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchPMSData = useCallback(async () => {
    try {
      const resp = await fetch('http://localhost:3001/api/pms/categories');
      const cats = await resp.json();
      
      const buildTree = (parentId: number | null = null, level = 0): TreeNode[] => {
        return cats
          .filter((c: any) => c.parent_id === parentId)
          .map((c: any) => ({
            id: c.id.toString(),
            level,
            type: 'folder',
            name: c.name,
            children: buildTree(c.id, level + 1)
          }));
      };
      
      setTree(buildTree());
    } catch (err) {
      console.error("Failed to fetch PMS categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const resp = await fetch('http://localhost:3001/api/sms/templates');
      const data = await resp.json();
      setTemplates(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchPMSData();
    fetchTemplates();
  }, [fetchPMSData, fetchTemplates]);

  useEffect(() => {
    if (selectedNode) {
      fetch('http://localhost:3001/api/pms/items?category_id=' + selectedNode.id)
        .then(res => res.json())
        .then(setItems);
    } else {
      setItems([]);
    }
  }, [selectedNode]);

  const handleAddTask = async () => {
    if (!selectedNode || !newTask.name) return;
    try {
      const resp = await fetch('http://localhost:3001/api/pms/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          category_id: selectedNode.id
        })
      });
      if (resp.ok) {
        // Refresh items
        const res = await fetch('http://localhost:3001/api/pms/items?category_id=' + selectedNode.id);
        const data = await res.json();
        setItems(data);
        setTaskModalOpen(false);
        setNewTask({ name: '', interval_months: 6, linked_template_id: '' });
      }
    } catch (err) { console.error(err); }
  };

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    parentNode: TreeNode | null;
    targetNode?: TreeNode;
  }>({
    isOpen: false,
    mode: 'add',
    parentNode: null
  });

  const handleAddCategory = (parentNode: TreeNode | null) => {
    setModalConfig({
      isOpen: true,
      mode: 'add',
      parentNode
    });
  };

  const handleEditCategory = (node: TreeNode) => {
    setModalConfig({
      isOpen: true,
      mode: 'edit',
      parentNode: null,
      targetNode: node
    });
  };

  const handleDeleteCategory = async (node: TreeNode) => {
    if (!window.confirm(`Are you sure you want to delete "${node.name}"?`)) return;
    
    try {
      const resp = await fetch(`http://localhost:3001/api/pms/categories/${node.id}`, { method: 'DELETE' });
      if (resp.ok) {
        fetchPMSData();
        if (selectedNode?.id === node.id) setSelectedNode(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleModalConfirm = async (name: string) => {
    try {
      if (modalConfig.mode === 'add') {
        await fetch('http://localhost:3001/api/pms/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, parent_id: modalConfig.parentNode?.id || null })
        });
      } else if (modalConfig.mode === 'edit' && modalConfig.targetNode) {
        await fetch(`http://localhost:3001/api/pms/categories/${modalConfig.targetNode.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
      }
      fetchPMSData();
      setModalConfig({ ...modalConfig, isOpen: false });
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - var(--header-h) - 5rem)' }}>
        {/* Sidebar: Global Equipment Setup */}
        <div className="glass-card" style={{ width: '350px', display: 'flex', flexDirection: 'column', padding: 'var(--gap-md)' }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} style={{ color: 'var(--accent)' }} /> Global PMS Admin
            </h3>
            <button 
              className="btn-icon" 
              onClick={() => handleAddCategory(null)}
              title="Add Root Category"
            >
              <Plus size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            <TreeNavigator 
              nodes={tree} 
              onSelect={setSelectedNode} 
              selectedId={selectedNode?.id} 
              isAdmin={true}
              onAdd={handleAddCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          </div>
        </div>

        {/* Main Panel: Node Editor */}
        <div className="glass-card" style={{ flex: 1, padding: 'var(--gap-lg)', display: 'flex', flexDirection: 'column' }}>
          {selectedNode ? (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--gap-lg)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Equipment Configuration
                  </span>
                  <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{selectedNode.name}</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button 
                    className="btn-icon btn-danger" 
                    title="Delete Item"
                    onClick={() => handleDeleteCategory(selectedNode!)}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="btn" onClick={() => handleEditCategory(selectedNode!)}>
                    <Edit2 size={18} /> Edit Label
                  </button>
                  <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }} />
                  <button 
                    className="btn-secondary" 
                    onClick={async () => {
                      try {
                        const res = await fetch('http://localhost:3001/api/sync/push-all', { method: 'POST' });
                        if (res.ok) alert("Master PMS Configuration pushed to all ships. Vessels will receive updates on next connection.");
                      } catch (err) { console.error(err); }
                    }}
                  >
                    <Zap size={18} /> Push to All Ships
                  </button>
                  <button className="btn-secondary">
                    <FolderPlus size={18} /> Move to Category
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h3>Maintenance Schedule for this Item</h3>
                <div className="table-container" style={{ marginTop: '1rem' }}>
                  <table className="table-glass">
                      <thead>
                        <tr>
                            <th>Task Description</th>
                            <th>Interval</th>
                            <th>SMS Link</th>
                            <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No maintenance tasks defined.</td></tr>
                        ) : (
                          items.map(item => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: 600 }}>{item.name}</td>
                                <td>{item.interval_months} Months</td>
                                <td><span style={{ color: item.linked_template_id ? 'var(--accent)' : 'var(--text-dim)' }}>{item.linked_template_id ? 'Linked' : 'None'}</span></td>
                                <td>
                                  <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Settings size={14} /> Config
                                  </button>
                                </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                  </table>
                  <button 
                    className="btn-secondary" 
                    style={{ width: '100%', marginTop: '1rem', borderStyle: 'dashed' }}
                    onClick={() => setTaskModalOpen(true)}
                  >
                      <Plus size={14} /> Add Standard Task
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', opacity: 0.3 }}>
              <Wrench size={80} style={{ marginBottom: '1.5rem', strokeWidth: 1.5 }} />
              <p style={{ fontSize: '1.25rem', fontWeight: 500 }}>Select equipment node to manage fleet-wide tasks</p>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.mode === 'add' ? 'Add New Category' : 'Rename Category'}
        initialValue={modalConfig.mode === 'edit' ? modalConfig.targetNode?.name : ''}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleModalConfirm}
        placeholder="e.g. DECK MACHINERY"
      />

      {/* Task Creation Modal */}
      {taskModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card" style={{ width: '500px', padding: '2rem' }}>
            <h2>New Maintenance Task</h2>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Task Name</label>
                <input placeholder="e.g. Annual Inspection" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Interval (Months)</label>
                  <input type="number" value={newTask.interval_months} onChange={e => setNewTask({...newTask, interval_months: parseInt(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Link to SMS Template</label>
                  <select style={{ width: '100%' }} value={newTask.linked_template_id} onChange={e => setNewTask({...newTask, linked_template_id: e.target.value})}>
                    <option value="">None</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setTaskModalOpen(false)}>Cancel</button>
                <button className="btn" style={{ flex: 1 }} onClick={handleAddTask}>Create Global Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMSModule;
