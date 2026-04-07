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
  isCollapsed?: boolean;
}

const TreeItem: React.FC<{ 
  node: TreeNode; 
  onSelect: (node: TreeNode) => void; 
  selectedId?: string | number;
  onAdd?: (parentNode: TreeNode | null) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  isAdmin?: boolean;
  isCollapsed?: boolean;
}> = ({ node, onSelect, selectedId, onAdd, onEdit, onDelete, isAdmin, isCollapsed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div style={{ marginLeft: (!isCollapsed && node.level > 0) ? '1rem' : '0', position: 'relative' }}>
      <div 
        className={`tree-item ${isSelected ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        onClick={() => onSelect(node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? '0.25rem' : '0.5rem',
          padding: isCollapsed ? '0.1rem 0.15rem' : '0.05rem 0.2rem',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'var(--transition)',
          background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
          color: isSelected ? 'var(--accent)' : 'var(--text-dim)',
          marginBottom: '0px',
          flexDirection: isCollapsed ? 'column' : 'row'
        }}
      >
        {!isCollapsed && node.type === 'folder' && (
          <div onClick={toggleExpand} style={{ display: 'flex', alignItems: 'center' }}>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
        {node.type === 'folder' ? <Folder size={isCollapsed ? 18 : 18} /> : <FileText size={isCollapsed ? 18 : 18} />}
        
        {!isCollapsed ? (
          <span style={{
            fontSize: '0.9rem',
            fontWeight: node.type === 'folder' ? 600 : 400,
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {node.name}
            {node.type === 'folder' && node.children && node.children.length > 0 && (
              <span style={{
                marginLeft: '0.4rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-dim)',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0.05rem 0.4rem',
                verticalAlign: 'middle'
              }}>
                {node.children.length}
              </span>
            )}
          </span>
        ) : (
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 800,
            color: isSelected ? 'var(--accent)' : 'var(--text-dim)',
            width: '24px',
            textAlign: 'center'
          }} title={node.name}>
            {(() => {
              const match = node.name.match(/^([A-Z0-9\-\.]+)/i);
              return match ? match[1] : node.name.substring(0, 1);
            })()}
          </span>
        )}

        {!isCollapsed && isAdmin && (
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
        <div className="tree-children" style={{ borderLeft: isCollapsed ? 'none' : '1px solid var(--border)', marginLeft: isCollapsed ? '0' : '0.75rem' }}>
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
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNavigator: React.FC<TreeNavigatorProps> = ({ nodes, onSelect, selectedId, onAdd, onEdit, onDelete, isAdmin, isCollapsed }) => {
  return (
    <div className="tree-navigator" style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '0.02rem' : '0.02rem' }}>

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
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  );
};

export default TreeNavigator;
