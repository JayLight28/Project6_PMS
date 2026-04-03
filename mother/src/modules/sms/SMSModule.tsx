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

const SMSModule: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
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

  const API_BASE = 'http://localhost:3001/api/sms';

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
        const node: TreeNode = {
          id: `tpl-${tpl.id}`,
          name: tpl.name,
          type: 'file',
          level: 0,
          itemData: { 
            ...tpl, 
            isParsed: tpl.fields_json && JSON.parse(tpl.fields_json).length > 0, 
            parsedFields: tpl.fields_json ? (typeof tpl.fields_json === 'string' ? JSON.parse(tpl.fields_json) : tpl.fields_json) : [] 
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

  const handleRunAutoParser = async () => {
    if (!selectedNode || typeof selectedNode.id !== 'string') return;
    setIsParsing(true);
    setParsingStep(0);

    let step = 0;
    const interval = setInterval(async () => {
      step++;
      if (step < parsingSteps.length) {
        setParsingStep(step);
      } else {
        clearInterval(interval);
        const mockFields = [
          { field: 'Vessel Name', value: 'MV PACIFIC GLORY', confidence: '98%', area: 'Top-Right' },
          { field: 'IMO Number', value: '9123456', confidence: '99%', area: 'Header Block' },
          { field: 'Inspection Date', value: '2026-04-01', confidence: '95%', area: 'Center Main' },
          { field: 'Inspector Name', value: 'Capt. Smith', confidence: '88%', area: 'Footer Signature' },
          { field: 'Next Due', value: '2026-10-01', confidence: '92%', area: 'Clause 4.2' }
        ];

        try {
          const tplId = (selectedNode.id as string).split('-')[1];
          await fetch(`${API_BASE}/templates/${tplId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: selectedNode.name, 
              fields_json: mockFields 
            })
          });
          await fetchHierarchy();
          
          const resTpls = await fetch(`${API_BASE}/templates`);
          const tpls = await resTpls.json();
          const updated = tpls.find((t: any) => `tpl-${t.id}` === selectedNode.id);
          if (updated) {
            setSelectedNode({
              ...selectedNode,
              itemData: { 
                ...updated, 
                isParsed: true, 
                parsedFields: mockFields 
              }
            });
          }
        } catch (err) { console.error("Parser sync failed", err); }
        setIsParsing(false);
      }
    }, 800);
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
    <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - var(--header-h) - 5rem)' }}>
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
              <Settings size={18} style={{ color: 'var(--accent)' }} /> SMS Category Admin
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

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: isNavCollapsed ? '0' : '0.5rem' }}>
          <TreeNavigator 
            nodes={tree} 
            onSelect={setSelectedNode} 
            selectedId={selectedNode?.id} 
            isAdmin={true}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            isCollapsed={isNavCollapsed}
          />
        </div>
      </div>

      <div className="glass-card" style={{ flex: 1, padding: 'var(--gap-lg)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {selectedNode ? (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--gap-lg)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {selectedNode.type === 'folder' ? 'Category / Clause' : 'Document Form'}
                </span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{selectedNode.name}</h1>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <input 
                    type="file" 
                    ref={folderInputRef} 
                    style={{ display: 'none' }} 
                    {...({ webkitdirectory: "", directory: "" } as any)} 
                    onChange={handleBulkFolderChange} 
                />
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
                  <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', overflowY: 'auto' }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'white', position: 'relative', overflow: 'hidden', minHeight: '500px' }}>
                      <div style={{ padding: '2rem', color: '#333', fontFamily: 'serif' }}>
                        <h2 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>MARITIME INSPECTION FORM</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                          <div style={{ border: '1px solid #ccc', padding: '0.5rem' }}>VESSEL: MV PACIFIC GLORY</div>
                          <div style={{ border: '1px solid #ccc', padding: '0.5rem' }}>IMO NO: 9123456</div>
                        </div>
                        {isParsing && (
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(56, 189, 248, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                            <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>{parsingSteps[parsingStep]}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {selectedNode.itemData?.isParsed && (
                      <div className="glass-card fade-in" style={{ padding: '1.25rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Extracted Fields</h3>
                        {selectedNode.itemData.parsedFields.map((f: any, i: number) => (
                          <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{f.field}</div>
                            <div style={{ fontWeight: 600 }}>{f.value}</div>
                          </div>
                        ))}
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
