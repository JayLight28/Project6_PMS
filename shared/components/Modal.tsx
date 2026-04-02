import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onConfirm: (value: string, type?: 'folder' | 'file') => void;
  initialValue?: string;
  placeholder?: string;
  showTypeSelector?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  onConfirm, 
  initialValue = '', 
  placeholder = 'Enter name...',
  showTypeSelector = false
}) => {
  const [value, setValue] = useState(initialValue);
  const [type, setType] = useState<'folder' | 'file'>('folder');

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setType('folder');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return (
    <div 
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-card" 
        style={{
          width: '420px',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(23, 23, 23, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="btn-icon"
          style={{
            position: 'absolute',
            right: '1.25rem',
            top: '1.25rem',
            opacity: 0.6
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Name / Label
          </label>
          <input 
            autoFocus
            type="text" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) onConfirm(value, type);
              if (e.key === 'Escape') onClose();
            }}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {showTypeSelector && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Resource Type
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div 
                onClick={() => setType('folder')}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: '10px', 
                  border: `1px solid ${type === 'folder' ? 'var(--accent)' : 'var(--border)'}`,
                  background: type === 'folder' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  color: type === 'folder' ? 'var(--accent)' : 'var(--text-dim)'
                }}
              >
                Category
              </div>
              <div 
                onClick={() => setType('file')}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: '10px', 
                  border: `1px solid ${type === 'file' ? 'var(--accent)' : 'var(--border)'}`,
                  background: type === 'file' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  color: type === 'file' ? 'var(--accent)' : 'var(--text-dim)'
                }}
              >
                Document
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1.5rem', borderRadius: '10px' }}>Cancel</button>
          <button 
            className="btn" 
            onClick={() => onConfirm(value, type)} 
            disabled={!value.trim()}
            style={{ padding: '0.6rem 1.5rem', borderRadius: '10px' }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
