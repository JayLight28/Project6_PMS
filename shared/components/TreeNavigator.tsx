import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileText, 
  MoreVertical,
  Plus
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
  isAdmin?: boolean;
}

const TreeItem: React.FC<{ 
  node: TreeNode; 
  onSelect: (node: TreeNode) => void; 
  selectedId?: string | number;
  onAdd?: (parentNode: TreeNode | null) => void;
  onEdit?: (node: TreeNode) => void;
  isAdmin?: boolean;
}> = ({ node, onSelect, selectedId, onAdd, onEdit, isAdmin }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{ marginLeft: node.level > 0 ? '1rem' : '0' }}>
      <div 
        className={`tree-item ${isSelected ? 'active' : ''}`}
        onClick={() => onSelect(node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'var(--transition)',
          background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
          color: isSelected ? 'var(--accent)' : 'var(--text-dim)',
          marginBottom: '2px'
        }}
      >
        {node.type === 'folder' && (
          <div onClick={toggleExpand} style={{ display: 'flex', alignItems: 'center' }}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
          <div className="tree-actions" style={{ display: 'flex', gap: '0.25rem' }}>
            {node.type === 'folder' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAdd?.(node); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <Plus size={14} />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(node); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <MoreVertical size={14} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="tree-children" style={{ borderLeft: '1px solid var(--border)', marginLeft: '0.75rem' }}>
          {node.children?.map(child => (
            <TreeItem 
              key={child.id} 
              node={child} 
              onSelect={onSelect} 
              selectedId={selectedId}
              onAdd={onAdd}
              onEdit={onEdit}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNavigator: React.FC<TreeNavigatorProps> = ({ nodes, onSelect, selectedId, onAdd, onEdit, isAdmin }) => {
  return (
    <div className="tree-navigator" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {isAdmin && (
        <button 
          className="btn-secondary" 
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}
          onClick={() => onAdd?.(null)}
        >
          <Plus size={14} /> Add Root Category
        </button>
      )}
      {nodes.map(node => (
        <TreeItem 
          key={node.id} 
          node={node} 
          onSelect={onSelect} 
          selectedId={selectedId} 
          onAdd={onAdd}
          onEdit={onEdit}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default TreeNavigator;
