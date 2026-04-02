import React, { useState } from 'react';
import { 
  Settings,
  Wrench,
  FolderPlus,
  Plus,
  Download,
  Trash2,
  Edit2,
  Search as SearchIcon
} from 'lucide-react';
import TreeNavigator, { TreeNode } from '../../components/TreeNavigator';

const PMSModule: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Global Equipment Tree
  const [tree, setTree] = useState<TreeNode[]>([
    {
      id: '1', level: 0, type: 'folder', name: 'DECK MACHINERY', children: [
        { id: '1.1', level: 1, type: 'folder', name: 'Windlass', children: [] }
      ]
    },
    {
      id: '2', level: 0, type: 'folder', name: 'ENGINE ROOM', children: [] }
  ]);

  const handleAddCategory = (parentNode: TreeNode | null) => {
    const name = window.prompt('Enter new category/equipment name:');
    if (!name) return;
    
    const newNode: TreeNode = {
      id: Date.now().toString(),
      level: parentNode ? parentNode.level + 1 : 0,
      type: 'folder',
      name: name,
      children: []
    };

    if (parentNode) {
      parentNode.children = [...(parentNode.children || []), newNode];
      setTree([...tree]);
    } else {
      setTree([...tree, newNode]);
    }
  };

  return (
     <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - var(--header-h) - 5rem)' }}>
      {/* Sidebar: Global Equipment Setup */}
      <div className="glass-card" style={{ width: '350px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} style={{ color: 'var(--accent)' }} /> Global PMS Admin
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Map the global equipment hierarchy for the entire fleet.
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          <TreeNavigator 
            nodes={tree} 
            onSelect={setSelectedNode} 
            selectedId={selectedNode?.id} 
            isAdmin={true}
            onAdd={handleAddCategory}
          />
        </div>
      </div>

      {/* Main Panel: Node Editor */}
      <div className="glass-card" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        {selectedNode ? (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Equipment Configuration
                </span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{selectedNode.name}</h1>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" style={{ color: 'var(--danger)' }}><Trash2 size={18} /></button>
                <button className="btn"><Edit2 size={18} /> Edit Label</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
               <div>
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
                           <tr>
                              <td style={{ fontWeight: 600 }}>Visual Inspection</td>
                              <td>Weekly</td>
                              <td><span style={{ color: 'var(--text-dim)' }}>None</span></td>
                              <td><button className="btn-secondary" style={{ padding: '0.4rem' }}>Config</button></td>
                           </tr>
                        </tbody>
                     </table>
                     <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', borderStyle: 'dashed' }}>
                        <Plus size={16} /> Add Standard Task
                     </button>
                  </div>
               </div>

               <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Fleet Actions</h4>
                  <button className="btn" style={{ width: '100%', marginBottom: '0.75rem' }}>
                     <Download size={18} /> Push to All Ships
                  </button>
                  <button className="btn-secondary" style={{ width: '100%' }}>
                     <FolderPlus size={18} /> Move to Category
                  </button>
               </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', opacity: 0.5 }}>
            <Wrench size={80} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>Select global equipment node to manage fleet-wide tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PMSModule;
