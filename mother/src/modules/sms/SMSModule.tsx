import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Settings,
  MoreVertical,
  FileText,
  FolderPlus,
  Trash2,
  Edit2,
  Upload
} from 'lucide-react';
import TreeNavigator, { TreeNode } from '../../components/TreeNavigator';

const SMSModule: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Mock Hierarchy (Category Admin View)
  const [tree, setTree] = useState<TreeNode[]>([
    {
      id: '1', level: 0, type: 'folder', name: '1. Main Manual', children: [
        { id: '1.1', level: 1, type: 'file', name: '1.1 Safety Policy' },
        { id: '1.2', level: 1, type: 'file', name: '1.2 Roles & Responsibilities' }
      ]
    },
    {
      id: '2', level: 0, type: 'folder', name: '2. Procedures', children: [
        { id: '2.1', level: 1, type: 'folder', name: '2.1 Navigation', children: [] }
      ]
    },
    { id: '3', level: 0, type: 'folder', name: '3. Checklists', children: [] },
    { id: '4', level: 0, type: 'folder', name: '4. Instructions', children: [] }
  ]);

  const handleAddCategory = (parentNode: TreeNode | null) => {
    const name = window.prompt('Enter new category/clause name:');
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
      {/* Sidebar: Category Administration */}
      <div className="glass-card" style={{ width: '350px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} style={{ color: 'var(--accent)' }} /> SMS Category Admin
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Define the hierarchical structure (Articles, Clauses, Items).
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

      {/* Main Panel: Node Editor / Template Upload */}
      <div className="glass-card" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        {selectedNode ? (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                  {selectedNode.type === 'folder' ? 'Category / Clause' : 'Document Form'}
                </span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{selectedNode.name}</h1>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" style={{ color: 'var(--danger)' }}><Trash2 size={18} /></button>
                <button className="btn"><Edit2 size={18} /> Edit Label</button>
              </div>
            </div>

            {selectedNode.type === 'folder' ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)' }}>
                    <FolderPlus size={24} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                    <h3>Add Sub-Clause</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', margin: '0.5rem 0 1.5rem' }}>Create a nested article or item under this category.</p>
                    <button className="btn" onClick={() => handleAddCategory(selectedNode)}>New Sub-Category</button>
                  </div>
                  <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)' }}>
                    <Upload size={24} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                    <h3>Attach Form Template</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', margin: '0.5rem 0 1.5rem' }}>Upload a .docx or .xlsx template for this specific clause.</p>
                    <button className="btn-secondary"><FileText size={18} /> Upload Template</button>
                  </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                   <h3>Child Nodes ({selectedNode.children?.length || 0})</h3>
                   <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedNode.children?.map(child => (
                        <div key={child.id} style={{ padding: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                           <span style={{ fontWeight: 600 }}>{child.name}</span>
                           <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{child.type}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Template Editor Placeholder */}
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                   <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                   <h3>Template Field Mapping</h3>
                   <p style={{ color: 'var(--text-dim)', maxWidth: '400px', margin: '1rem auto' }}>
                     Map Word tags (e.g. &#123;&#123;DATE&#125;&#125;) to smart form fields here.
                   </p>
                   <button className="btn-secondary">Run Auto-Parser</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', opacity: 0.5 }}>
            <Settings size={80} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>Select a category to manage the SMS Hierarchy</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSModule;
