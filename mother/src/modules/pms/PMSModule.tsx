import React, { useState } from 'react';
import { 
  Settings,
  Wrench,
  FolderPlus,
  Plus,
  Download,
  Trash2,
  Edit2,
  Zap,
  Search as SearchIcon
} from 'lucide-react';
import TreeNavigator, { type TreeNode } from '@shared/components/TreeNavigator';
import Modal from '@shared/components/Modal';

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

  const handleDeleteCategory = (node: TreeNode) => {
    if (!window.confirm(`Are you sure you want to delete "${node.name}"?`)) return;
    
    const removeFromNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter(n => n.id !== node.id)
        .map(n => ({
          ...n,
          children: n.children ? removeFromNodes(n.children) : []
        }));
    };

    setTree(removeFromNodes(tree));
    if (selectedNode?.id === node.id) setSelectedNode(null);
  };

  const handleModalConfirm = (name: string) => {
    if (modalConfig.mode === 'add') {
      const newNode: TreeNode = {
        id: Date.now().toString(),
        level: modalConfig.parentNode ? modalConfig.parentNode.level + 1 : 0,
        type: 'folder',
        name,
        children: []
      };

      if (modalConfig.parentNode) {
        modalConfig.parentNode.children = [...(modalConfig.parentNode.children || []), newNode];
        setTree([...tree]);
      } else {
        setTree([...tree, newNode]);
      }
    } else if (modalConfig.mode === 'edit' && modalConfig.targetNode) {
      modalConfig.targetNode.name = name;
      setTree([...tree]);
      if (selectedNode?.id === modalConfig.targetNode.id) {
        setSelectedNode({ ...modalConfig.targetNode });
      }
    }
    setModalConfig({ ...modalConfig, isOpen: false });
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
                  <button className="btn-secondary">
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
                        <tr>
                            <td style={{ fontWeight: 600 }}>Visual Inspection</td>
                            <td>Weekly</td>
                            <td><span style={{ color: 'var(--text-dim)' }}>None</span></td>
                            <td>
                              <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Settings size={14} /> Config
                              </button>
                            </td>
                        </tr>
                      </tbody>
                  </table>
                  <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', borderStyle: 'dashed' }}>
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
    </div>
  );
};

export default PMSModule;
