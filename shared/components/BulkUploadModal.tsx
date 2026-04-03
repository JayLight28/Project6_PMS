import React, { useState, useMemo } from 'react';
import { X, Upload, ListFilter, RotateCcw, Folder, CheckCircle } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileList | null;
  type: 'sms' | 'pms';
  onComplete: () => void;
}

interface PathPreview {
  original: string;
  cleaned: string;
  file: File;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, files: initialFiles, type, onComplete }) => {
  const [stripNumbers, setStripNumbers] = useState(true);
  const [stripSuffixes, setStripSuffixes] = useState(true);
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const previewList = useMemo(() => {
    if (!initialFiles) return [];
    
    const list: PathPreview[] = [];
    for (let i = 0; i < initialFiles.length; i++) {
        const file = initialFiles[i];
        // webkitRelativePath contains the directory structure
        let pathStr = (file as any).webkitRelativePath || file.name;
        
        let cleanedPath = pathStr;
        
        // Apply cleaning rules to each segment
        const segments = cleanedPath.split('/');
        const cleanedSegments = segments.map((segment: string) => {
            let s = segment;
            
            // 1. Strip leading numbers (e.g. "01_Admin" -> "Admin")
            if (stripNumbers) {
                s = s.replace(/^[\d\s._-]+/, '');
            }
            
            // 2. Strip version/status suffixes (e.g. "manual_v2_final" -> "manual")
            if (stripSuffixes) {
                // Also handle extension collision if stripping from file name
                const extIndex = s.lastIndexOf('.');
                if (extIndex !== -1) {
                    const namePart = s.substring(0, extIndex);
                    const extPart = s.substring(extIndex);
                    const cleanedName = namePart.replace(/(_v\d+|[Vv]\d+|_final|_copy|_\d{8})$/i, '');
                    s = cleanedName + extPart;
                } else {
                    s = s.replace(/(_v\d+|[Vv]\d+|_final|_copy|_\d{8})$/i, '');
                }
            }

            // 3. Custom Search & Replace
            if (search) {
                try {
                    const regex = new RegExp(search, 'gi');
                    s = s.replace(regex, replace);
                } catch (e) {
                    // Fallback to simple replace if search is not a valid regex
                    s = s.split(search).join(replace);
                }
            }
            
            return s.trim() || segment; // Fallback to segment if cleaning emptied it
        });

        cleanedPath = cleanedSegments.join('/');
        list.push({ original: pathStr, cleaned: cleanedPath, file });
    }
    return list;
  }, [initialFiles, stripNumbers, stripSuffixes, search, replace]);

  const handleUpload = async () => {
    if (previewList.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    const finalPaths: string[] = [];

    // Filter valid documents
    previewList.forEach((item: PathPreview) => {
        const ext = item.file.name.split('.').pop()?.toLowerCase();
        if (['docx', 'xlsx', 'pdf', 'doc', 'xls'].includes(ext || '')) {
            formData.append('files', item.file);
            finalPaths.push(item.cleaned);
        }
    });

    if (finalPaths.length === 0) {
        alert("No valid documents selected.");
        setIsUploading(false);
        return;
    }

    formData.append('paths', JSON.stringify(finalPaths));
    formData.append('type', type);

    try {
        const res = await fetch(`http://localhost:3001/api/admin/bulk-upload`, {
            method: 'POST',
            body: formData
        });
        
        if (res.ok) {
            alert(`Success! Successfully uploaded ${finalPaths.length} items.`);
            onComplete();
            onClose();
        } else {
            const err = await res.json();
            alert(`Upload failed: ${err.error}`);
        }
    } catch (err) {
        console.error("Bulk upload logic error:", err);
        alert("Network error. Check connection to Mother HQ server.");
    } finally {
        setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fade-in"
        style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)'
        }}
    >
      <div className="glass-card" style={{ width: '900px', maxWidth: '95vw', padding: '0', display: 'flex', flexDirection: 'column', height: '85vh', overflow: 'hidden', background: 'rgba(23, 23, 23, 0.95)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
              <Upload size={24} style={{ color: 'var(--accent)' }} /> 
              Smart Bulk Upload ({type.toUpperCase()})
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Review and customize naming recognition before saving to database.
            </p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={24} /></button>
        </div>

        {/* Action Bar / Settings */}
        <div style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="stripNumbers" checked={stripNumbers} onChange={e => setStripNumbers(e.target.checked)} />
              <label htmlFor="stripNumbers" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Clean Leading Numbers</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="stripSuffixes" checked={stripSuffixes} onChange={e => setStripSuffixes(e.target.checked)} />
              <label htmlFor="stripSuffixes" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Strip Version Suffixes</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
              <ListFilter size={16} style={{ color: 'var(--accent)' }} />
              <input 
                placeholder="Search text..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color:'white', outline: 'none' }} 
              />
              <span style={{ opacity: 0.5 }}>→</span>
              <input 
                placeholder="Replace with..." 
                value={replace} 
                onChange={e => setReplace(e.target.value)}
                style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color:'white', outline: 'none' }} 
              />
            </div>
            
            <button className="btn-icon" title="Reset Filters" onClick={() => { setSearch(''); setReplace(''); setStripNumbers(true); setStripSuffixes(true); }}>
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Preview List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 40px minmax(0, 1fr)', gap: '1rem', padding: '0.5rem', position: 'sticky', top: 0, background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color:'var(--accent)', fontWeight: 800 }}>
                <span>ORIGINAL HIERARCHY</span>
                <span></span>
                <span>CLEANED FOR DATABASE</span>
            </div>
            {previewList.map((item: PathPreview, idx: number) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 40px minmax(0, 1fr)', gap: '1rem', padding: '0.75rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
                        <Folder size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.original}</span>
                    </div>
                    <div style={{ textAlign: 'center', color:'var(--accent)' }}>→</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={14} style={{ color: item.original !== item.cleaned ? 'var(--accent)' : 'rgba(255,255,255,0.2)' }} />
                        <span style={{ color: item.original !== item.cleaned ? 'var(--accent)' : 'inherit', fontWeight: item.original !== item.cleaned ? 600 : 400 }}>{item.cleaned}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginRight: 'auto' }}>
            Detected <strong>{previewList.length}</strong> items for upload.
          </span>
          <button className="btn-secondary" onClick={onClose} disabled={isUploading}>Cancel</button>
          <button className="btn" onClick={handleUpload} disabled={isUploading || previewList.length === 0} style={{ minWidth: '150px' }}>
            {isUploading ? 'Uploading...' : 'Begin Upload'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BulkUploadModal;
