import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Settings,
  FolderPlus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FolderOpen,
  Zap,
  Upload,
  Cpu,
  Activity
} from 'lucide-react';
import TreeNavigator, { type TreeNode } from '@shared/components/TreeNavigator';
import Modal from '@shared/components/Modal';
import BulkUploadModal from '@shared/components/BulkUploadModal';
import DropdownMenu from '@shared/components/DropdownMenu';
import Config from '@shared/config';

const SMSModule: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [selectedFieldIdx, setSelectedFieldIdx] = useState<number | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  // Bulk Upload State
  const [bulkFiles, setBulkFiles] = useState<FileList | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    parentNode: TreeNode | null;
    targetNode?: TreeNode;
    showTypeSelector?: boolean;
  }>({
    isOpen: false,
    mode: 'add',
    parentNode: null
  });

  const API_BASE = `${Config.MOTHER_API_URL}/sms`;

  const parsingSteps = [
    "Initializing AI OCR engine...",
    "Scanning document layout...",
    "Identifying form fields...",
    "Extracting metadata & values...",
    "Mapping to SMS standard..."
  ];

  const fetchHierarchy = async () => {
    try {
      const [catsRes, tplsRes] = await Promise.all([
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/templates`)
      ]);
      const categories = await catsRes.json();
      const templates = await tplsRes.json();

      const map: Record<number, TreeNode> = {};
      const roots: TreeNode[] = [];

      categories.forEach((cat: any) => {
        map[cat.id] = { id: cat.id, name: cat.name, type: 'folder', level: 0, children: [] };
      });

      templates.forEach((tpl: any) => {
        let parsedFields: any[] = [];
        try { parsedFields = tpl.fields_json ? JSON.parse(tpl.fields_json) : []; } catch { parsedFields = []; }
        const node: TreeNode = {
          id: `tpl-${tpl.id}`,
          name: tpl.name,
          type: 'file',
          level: 0,
          itemData: {
            ...tpl,
            isParsed: parsedFields.length > 0,
            parsedFields
          }
        };
        if (tpl.category_id && map[tpl.category_id]) {
          map[tpl.category_id].children?.push(node);
        }
      });

      categories.forEach((cat: any) => {
        const node = map[cat.id];
        if (cat.parent_id && map[cat.parent_id]) {
          map[cat.parent_id].children?.push(node);
        } else {
          roots.push(node);
        }
      });

      const setLevels = (nodes: TreeNode[], level: number) => {
        nodes.forEach(n => {
          n.level = level;
          if (n.children) setLevels(n.children, level + 1);
        });
      };
      setLevels(roots, 0);
      setTree(roots);
    } catch (err) { console.error("Failed to load SMS hierarchy", err); }
  };

  useEffect(() => { fetchHierarchy(); }, []);

  const loadPreview = async (node: TreeNode) => {
    if (node.type !== 'file' || typeof node.id !== 'string') return;
    const tplId = node.id.split('-')[1];
    setIsLoadingPreview(true);
    setPreviewData(null);
    setActiveSheetIdx(0);
    try {
      const res = await fetch(`${API_BASE}/templates/${tplId}/preview`);
      const data = await res.json();
      setPreviewData(data);
    } catch { setPreviewData(null); }
    setIsLoadingPreview(false);
  };

  const handleSelectNode = (node: TreeNode) => {
    setSelectedNode(node);
    loadPreview(node);
  };

  const handleAddCategory = (parentNode: TreeNode | null) => {
    setModalConfig({
      isOpen: true,
      mode: 'add',
      parentNode,
      showTypeSelector: !!parentNode
    });
  };

  const handleEditCategory = (node: TreeNode) => {
    setModalConfig({
      isOpen: true,
      mode: 'edit',
      parentNode: null,
      targetNode: node,
      showTypeSelector: false
    });
  };

  const handleDeleteCategory = async (node: TreeNode) => {
    if (!window.confirm(`Are you sure you want to delete "${node.name}" and all its contents?`)) return;

    try {
      const isTemplate = typeof node.id === 'string' && node.id.startsWith('tpl-');
      const url = isTemplate 
        ? `${API_BASE}/templates/${String(node.id).split('-')[1]}` 
        : `${API_BASE}/categories/${node.id}`;
      
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        await fetchHierarchy();
        if (selectedNode?.id === node.id) setSelectedNode(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) { console.error("Delete failed", err); }
  };

  const handleModalConfirm = async (name: string, type?: 'folder' | 'file') => {
    try {
      if (modalConfig.mode === 'add') {
        const parentId = modalConfig.parentNode?.id;
        const cleanParentId = typeof parentId === 'string' && parentId.startsWith('tpl-') 
          ? parentId.split('-')[1] 
          : parentId;

        const isTemplate = type === 'file';
        const url = isTemplate ? `${API_BASE}/templates` : `${API_BASE}/categories`;
        const body = isTemplate 
          ? { name, category_id: cleanParentId, file_path: `uploads/${name}.pdf` }
          : { name, parent_id: cleanParentId };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (res.ok) {
          await fetchHierarchy();
        } else {
          const errData = await res.json();
          alert(`Failed to save: ${errData.error || 'Unknown error'}`);
        }
      } else if (modalConfig.mode === 'edit' && modalConfig.targetNode) {
        const isTemplate = typeof modalConfig.targetNode.id === 'string' && modalConfig.targetNode.id.startsWith('tpl-');
        const url = isTemplate 
          ? `${API_BASE}/templates/${String(modalConfig.targetNode.id).split('-')[1]}` 
          : `${API_BASE}/categories/${modalConfig.targetNode.id}`;
          
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        
        if (res.ok) {
          await fetchHierarchy();
        } else {
          const errData = await res.json();
          alert(`Failed to update: ${errData.error || 'Unknown error'}`);
        }
      }
    } catch (err) { 
      console.error("Save failed", err);
      alert("Network error: Could not reach the server.");
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedNode) return;

    setIsUploading(true);
    try {
      const res = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: file.name, 
          category_id: selectedNode.id,
          file_path: 'uploads/' + file.name 
        })
      });
      if (res.ok) {
        await fetchHierarchy();
      }
    } catch (err) { console.error("Upload failed", err); }
    setIsUploading(false);
    if (event.target) event.target.value = '';
  };
  
  const handleBulkFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setBulkFiles(files);
    setIsBulkModalOpen(true);
  };

  const selectedNodeRef = useRef<TreeNode | null>(null);
  selectedNodeRef.current = selectedNode;

  const handleRunAutoParser = async () => {
    const node = selectedNodeRef.current;
    if (!node || typeof node.id !== 'string') return;
    setIsParsing(true);
    setParsingStep(0);

    const mockFields = [
      { field: 'Vessel Name', value: 'MV PACIFIC GLORY', confidence: '98%', area: 'Top-Right' },
      { field: 'IMO Number', value: '9123456', confidence: '99%', area: 'Header Block' },
      { field: 'Inspection Date', value: '2026-04-01', confidence: '95%', area: 'Center Main' },
      { field: 'Inspector Name', value: 'Capt. Smith', confidence: '88%', area: 'Footer Signature' },
      { field: 'Next Due', value: '2026-10-01', confidence: '92%', area: 'Clause 4.2' }
    ];

    let step = 0;
    const interval = setInterval(async () => {
      step++;
      if (step < parsingSteps.length) {
        setParsingStep(step);
      } else {
        clearInterval(interval);
        try {
          const tplId = node.id.split('-')[1];
          await fetch(`${API_BASE}/templates/${tplId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: node.name, fields_json: mockFields })
          });
          await fetchHierarchy();
          setSelectedNode(prev => prev ? {
            ...prev,
            itemData: { ...(prev.itemData || {}), isParsed: true, parsedFields: mockFields }
          } : prev);
        } catch (err) { console.error("Parser sync failed", err); }
        setIsParsing(false);
      }
    }, 800);
  };
  
  const handleUpdateField = (index: number, updates: any) => {
    if (!selectedNode || !selectedNode.itemData) return;
    const newFields = [...(selectedNode.itemData.parsedFields || [])];
    newFields[index] = { ...newFields[index], ...updates };
    
    setSelectedNode({
      ...selectedNode,
      itemData: { ...selectedNode.itemData, parsedFields: newFields }
    });
  };

  const handleSyncStyle = async () => {
    if (!selectedNode || typeof selectedNode.id !== 'string') return;
    const tplId = selectedNode.id.split('-')[1];
    
    try {
        const res = await fetch(`${Config.MOTHER_API_URL}/sms/templates/${tplId}/sync-style`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields_json: selectedNode.itemData.parsedFields })
        });
        
        if (res.ok) {
            alert("Success! Formatting successfully synced to the original Word/Excel template file.");
            await fetchHierarchy();
        } else {
            const err = await res.json();
            alert(`Sync failed: ${err.error}`);
        }
    } catch (err) {
        console.error(err);
        alert("Network error while syncing style.");
    }
  };

  const handleLoadSample = () => {
    if (!selectedNode) return;
    const sampleFile: TreeNode = {
      id: `sample-${Date.now()}`,
      level: selectedNode.level + 1,
      type: 'file',
      name: 'SAMPLE_InspectionForm_v2.pdf',
      itemData: { size: '1.2MB', type: 'PDF Document' }
    };
    setSelectedNode(sampleFile);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
      <div className="glass-card" style={{ 
        width: isNavCollapsed ? '80px' : '350px', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: isNavCollapsed ? 'var(--gap-md) 0.5rem' : 'var(--gap-md)',
        transition: 'var(--transition)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          marginBottom: '0.75rem', 
          display: 'flex', 
          justifyContent: isNavCollapsed ? 'center' : 'space-between', 
          alignItems: 'center',
          flexDirection: isNavCollapsed ? 'column' : 'row',
          gap: isNavCollapsed ? '0.75rem' : '0'
        }}>
          {!isNavCollapsed && (
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <Settings size={18} style={{ color: 'var(--accent)' }} /> SMS Categories
            </h3>
          )}
          <div style={{ display: 'flex', flexDirection: isNavCollapsed ? 'column' : 'row', gap: '0.25rem' }}>
            {!isNavCollapsed && (
              <DropdownMenu 
                items={[
                  { 
                    label: 'Add Root Category', 
                    icon: <Plus size={16} />, 
                    onClick: () => handleAddCategory(null) 
                  },
                  { 
                    label: 'Bulk Folder Upload', 
                    icon: <FolderOpen size={16} />, 
                    onClick: () => folderInputRef.current?.click() 
                  }
                ]} 
              />
            )}
            <button 
              className="btn-icon" 
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              title={isNavCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{ width: '32px', height: '32px' }}
            >
              {isNavCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: isNavCollapsed ? '0' : '0.25rem', paddingBottom: '0.5rem' }}>
          <TreeNavigator
            nodes={tree}
            onSelect={handleSelectNode}
            selectedId={selectedNode?.id}
            isAdmin={true}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            isCollapsed={isNavCollapsed}
          />
        </div>
      </div>

      <div className="glass-card" style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
        <input
          type="file"
          ref={folderInputRef}
          style={{ display: 'none' }}
          {...({ webkitdirectory: "", directory: "" } as any)}
          onChange={handleBulkFolderChange}
        />
        {selectedNode ? (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {selectedNode.type === 'folder' ? 'Category / Clause' : 'Document Form'}
                </span>
                <h2 style={{ fontSize: '1.1rem', marginTop: '0.15rem', lineHeight: 1.3 }}>{selectedNode.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className="btn-icon btn-danger" 
                  onClick={() => handleDeleteCategory(selectedNode!)}
                  title="Delete Item"
                >
                  <Trash2 size={18} />
                </button>
                <button className="btn" onClick={() => handleEditCategory(selectedNode!)}>
                  <Edit2 size={18} /> Edit Label
                </button>
                <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }} />
                {selectedNode.type === 'folder' ? (
                  <>
                    <button className="btn-secondary" onClick={() => handleAddCategory(selectedNode)}>
                      <FolderPlus size={18} /> New Sub-Category
                    </button>
                    <button className="btn-secondary" onClick={handleUploadClick} disabled={isUploading}>
                      <Upload size={18} className={isUploading ? 'spin' : ''} /> 
                      {isUploading ? 'Uploading...' : 'Upload Template'}
                    </button>
                  </>
                ) : (
                  <button className="btn-secondary" onClick={handleRunAutoParser} disabled={isParsing}>
                    <Cpu size={18} className={isParsing ? 'spin' : ''} /> 
                    {isParsing ? 'Parsing...' : 'Run Auto-Parser'}
                  </button>
                )}
                <button 
                  className="btn-secondary" 
                  onClick={async () => {
                    try {
                      const res = await fetch('http://localhost:3001/api/sync/push-all', { method: 'POST' });
                      if (res.ok) alert("Master SMS Configuration pushed to all ships. Vessels will receive updates on next connection.");
                    } catch (err) { console.error(err); }
                  }}
                >
                  <Zap size={18} /> Push to All Ships
                </button>
              </div>
            </div>

            {selectedNode.type === 'folder' ? (
              <div style={{ overflowY: 'auto' }}>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                  <Activity size={18} style={{ color: 'var(--accent)' }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Manage articles and clauses.</p>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <h3>Child Nodes ({selectedNode.children?.length || 0})</h3>
                  <button className="btn-secondary" style={{ marginTop: '0.5rem', borderStyle: 'dashed' }} onClick={handleLoadSample}>
                    <Plus size={14} /> Load Sample (Demo)
                  </button>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedNode.children?.map(child => (
                      <div key={child.id} onClick={() => setSelectedNode(child)} style={{ cursor: 'pointer', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ fontWeight: 600 }}>{child.name}</span>
                         <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{child.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: '2rem', flex: 1, minHeight: 0 }}>
                  <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Sheet tabs */}
                    {previewData?.type === 'xlsx' && previewData.sheets?.length > 1 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {previewData.sheets.map((s: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => setActiveSheetIdx(i)}
                            style={{
                              padding: '0.3rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                              background: i === activeSheetIdx ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                              color: i === activeSheetIdx ? 'black' : 'var(--text-dim)',
                              fontWeight: i === activeSheetIdx ? 700 : 400
                            }}
                          >{s.name}</button>
                        ))}
                      </div>
                    )}
                    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'white', position: 'relative', overflow: 'auto', minHeight: '500px' }}>
                      {isLoadingPreview ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', gap: '1rem' }}>
                          <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                          <p style={{ color: 'var(--accent)' }}>Loading preview...</p>
                        </div>
                      ) : previewData?.type === 'xlsx' ? (
                        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.78rem', color: '#222' }}>
                          <tbody>
                            {previewData.sheets[activeSheetIdx]?.rows.map((row: any) => (
                              <tr key={row.rowNum}>
                                {row.cells.map((cell: any) => (
                                  <td
                                    key={cell.col}
                                    rowSpan={cell.rowSpan || 1}
                                    colSpan={cell.colSpan || 1}
                                    style={{
                                      border: '1px solid #d0d0d0',
                                      padding: '4px 8px',
                                      whiteSpace: 'pre-wrap',
                                      fontWeight: cell.bold ? 700 : 400,
                                      textAlign: (cell.align as any) || 'left',
                                      minWidth: '60px',
                                      maxWidth: '220px',
                                      verticalAlign: 'middle',
                                      background: cell.bgColor
                                        ? `#${cell.bgColor.slice(-6)}`
                                        : 'white'
                                    }}
                                  >
                                    {cell.value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : previewData?.type === 'unsupported' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#888' }}>
                          Preview not available for this file type
                        </div>
                      ) : (
                        <div style={{ padding: '2rem', color: '#333', fontFamily: 'serif' }}>
                          <p style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem' }}>Select a file to preview</p>
                        </div>
                      )}
                      {isParsing && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(56, 189, 248, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                          <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>{parsingSteps[parsingStep]}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {selectedNode.itemData?.isParsed && (
                      <div className="glass-card fade-in" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Template Fields</h3>
                            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleSyncStyle}>
                                <Zap size={14} /> Sync to Original
                            </button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {selectedNode.itemData.parsedFields.map((f: any, i: number) => (
                            <div 
                                key={i} 
                                onClick={() => setSelectedFieldIdx(i === selectedFieldIdx ? null : i)}
                                style={{ 
                                    padding: '0.75rem', 
                                    background: i === selectedFieldIdx ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.03)', 
                                    borderRadius: '8px', 
                                    border: i === selectedFieldIdx ? '1px solid var(--accent)' : '1px solid var(--border)', 
                                    marginBottom: '0.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TAG: {f.field}</div>
                                        <div style={{ fontWeight: 600, color: i === selectedFieldIdx ? 'var(--accent)' : 'inherit' }}>{f.value}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {f.bold && <span style={{ fontSize: '10px', background: 'var(--accent)', color: 'black', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>B</span>}
                                        {f.shrinkToFit && <span style={{ fontSize: '10px', background: '#fbbf24', color: 'black', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>S</span>}
                                    </div>
                                </div>

                                {i === selectedFieldIdx && (
                                    <div className="fade-in" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.25rem', opacity: 0.6 }}>Alignment</label>
                                            <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '4px' }}>
                                                {['left', 'center', 'right'].map(align => (
                                                    <button 
                                                        key={align}
                                                        onClick={() => handleUpdateField(i, { align })}
                                                        style={{ 
                                                            flex: 1, padding: '4px', fontSize: '0.7rem', border: 'none', borderRadius: '3px',
                                                            background: f.align === align ? 'var(--accent)' : 'transparent',
                                                            color: f.align === align ? 'black' : 'white',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {align.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            className={f.bold ? "btn" : "btn-secondary"}
                                            style={{ fontSize: '0.7rem', padding: '0.4rem' }}
                                            onClick={() => handleUpdateField(i, { bold: !f.bold })}
                                        >
                                            BOLD
                                        </button>
                                        
                                        <button 
                                            className={f.shrinkToFit ? "btn" : "btn-secondary"}
                                            style={{ fontSize: '0.7rem', padding: '0.4rem' }}
                                            onClick={() => handleUpdateField(i, { shrinkToFit: !f.shrinkToFit })}
                                        >
                                            SHRINK
                                        </button>

                                        <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <input 
                                                type="checkbox" 
                                                id={`multi-${i}`} 
                                                checked={f.isMultiLine} 
                                                onChange={e => handleUpdateField(i, { isMultiLine: e.target.checked })} 
                                            />
                                            <label htmlFor={`multi-${i}`} style={{ fontSize: '0.75rem', cursor: 'pointer' }}>Multi-line Support</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', opacity: 0.3 }}>
            <Settings size={80} style={{ marginBottom: '1.5rem' }} />
            <p>Select a category to manage SMS Hierarchy</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.mode === 'add' ? 'Add Item' : 'Rename Item'}
        initialValue={modalConfig.mode === 'edit' ? modalConfig.targetNode?.name : ''}
        showTypeSelector={modalConfig.showTypeSelector}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleModalConfirm}
      />

      <BulkUploadModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        files={bulkFiles}
        type="sms"
        onComplete={fetchHierarchy}
      />
    </div>
  );
};

export default SMSModule;
