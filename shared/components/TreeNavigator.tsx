import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileText, 
  MoreVertical,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

export interface TreeNode {
  id: string | number;
  name: string;
  type: 'folder' | 'file';
  level: number;
  children?: TreeNode[];
  itemData?: any; // To hold linked template or maintenance item
}

interface TreeNavigatorProps {
  nodes: TreeNode[];
  onSelect: (node: TreeNode) => void;
  selectedId?: string | number;
  onAdd?: (parentNode: TreeNode | null) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  isAdmin?: boolean;
}

const TreeItem: React.FC<{ 
  node: TreeNode; 
  onSelect: (node: TreeNode) => void; 
  selectedId?: string | number;
  onAdd?: (parentNode: TreeNode | null) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  isAdmin?: boolean;
}> = ({ node, onSelect, selectedId, onAdd, onEdit, onDelete, isAdmin }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleMenuClick = (e: React.MouseEvent, action: 'edit' | 'delete') => {
    e.stopPropagation();
    setShowMenu(false);
    if (action === 'edit') onEdit?.(node);
    if (action === 'delete') onDelete?.(node);
  };

  return (
    <div style={{ marginLeft: node.level > 0 ? '1rem' : '0', position: 'relative' }}>
      <div 
        className={`tree-item ${isSelected ? 'active' : ''}`}
        onClick={() => onSelect(node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.1rem 0.6rem',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'var(--transition)',
          background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
          color: isSelected ? 'var(--accent)' : 'var(--text-dim)',
          marginBottom: '0px'
        }}
      >
        {node.type === 'folder' && (
          <div onClick={toggleExpand} style={{ display: 'flex', alignItems: 'center' }}>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
        {node.type === 'folder' ? <Folder size={18} /> : <FileText size={18} />}
        
        <span style={{ 
          fontSize: '0.9rem', 
          fontWeight: node.type === 'folder' ? 600 : 400,
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {node.name}
        </span>

        {isAdmin && (
            <div 
              className="tree-actions" 
              style={{ display: 'flex', gap: '0.25rem', position: 'relative' }}
              onMouseLeave={() => setShowMenu(false)}
            >
              <button 
                className="btn-icon"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                title="More Actions"
              >
                <MoreVertical size={14} />
              </button>

            {showMenu && (
              <div 
                className="fade-in"
                style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: '100%', 
                  zIndex: 200, 
                  padding: '0.25rem', 
                  minWidth: '120px',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {node.type === 'folder' && (
                  <div 
                    className="nav-item"
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowMenu(false); onAdd?.(node); }}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Plus size={14} /> Add Sub-item
                  </div>
                )}
                <div 
                  className="nav-item"
                  onClick={(e: React.MouseEvent) => handleMenuClick(e, 'edit')}
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                   <Edit2 size={14} /> Rename
                </div>
                <div 
                  className="nav-item"
                  onClick={(e: React.MouseEvent) => handleMenuClick(e, 'delete')}
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                   <Trash2 size={14} /> Delete
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="tree-children" style={{ borderLeft: '1px solid var(--border)', marginLeft: '0.75rem' }}>
          {node.children?.map((child: TreeNode) => (
            <TreeItem 
              key={child.id} 
              node={child} 
              onSelect={onSelect} 
              selectedId={selectedId}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNavigator: React.FC<TreeNavigatorProps> = ({ nodes, onSelect, selectedId, onAdd, onEdit, onDelete, isAdmin }) => {
  return (
    <div className="tree-navigator" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>

      {nodes.map((node: TreeNode) => (
        <TreeItem 
          key={node.id} 
          node={node} 
          onSelect={onSelect} 
          selectedId={selectedId} 
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default TreeNavigator;
