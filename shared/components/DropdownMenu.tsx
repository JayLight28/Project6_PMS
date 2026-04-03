import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';

export interface DropdownItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export interface DropdownMenuProps {
  items: DropdownItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        className="btn-icon" 
        onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
        }}
        style={{ width: '32px', height: '32px' }}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div 
            className="fade-in"
            style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '0.5rem',
                background: 'rgba(23, 23, 23, 0.95)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)', 
                borderRadius: '12px',
                padding: '0.5rem',
                minWidth: '200px',
                zIndex: 1000,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
            }}
        >
          {items.map((item, idx) => (
            <div 
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setIsOpen(false);
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                cursor: 'pointer',
                borderRadius: '8px',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
              className="dropdown-item"
            >
              <span style={{ display: 'flex', color: 'var(--accent)' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      )}
      <style>{`
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default DropdownMenu;
