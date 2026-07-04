import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';

// ─────────────────────────────────────────
// Category config
// ─────────────────────────────────────────
const categoryConfig = {
  aadhaar: {
    label: 'Aadhaar Card',
    color: '#4160bf',
    bg:    '#eef2ff'
  },
  property_tax: {
    label: 'Property Tax',
    color: '#8b5cf6',
    bg:    '#f5f3ff'
  },
  water_bill: {
    label: 'Water Bill',
    color: '#0ea5e9',
    bg:    '#f0f9ff'
  },
  electricity_bill: {
    label: 'Electricity Bill',
    color: '#f59e0b',
    bg:    '#fffbeb'
  },
  birth_certificate: {
    label: 'Birth Certificate',
    color: '#16a34a',
    bg:    '#f0fdf4'
  },
  income_certificate: {
    label: 'Income Certificate',
    color: '#0891b2',
    bg:    '#ecfeff'
  },
  caste_certificate: {
    label: 'Caste Certificate',
    color: '#dc2626',
    bg:    '#fef2f2'
  },
  other: {
    label: 'Other',
    color: '#64748b',
    bg:    '#f8fafc'
  }
};

// ─────────────────────────────────────────
// Format file size
// ─────────────────────────────────────────
const formatSize = (bytes) => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─────────────────────────────────────────
// File icon based on type
// ─────────────────────────────────────────
const FileIcon = ({ fileType }) => {
  const isPDF = fileType === 'application/pdf';
  return isPDF ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
};

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
const DocumentsPage = () => {
  const [documents, setDocuments]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [preview, setPreview]       = useState(null);
  const fileInputRef                = useRef(null);

  const [formData, setFormData] = useState({
    fileName:    '',
    category:    'other',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/documents');
      setDocuments(res.data.documents);
    } catch (err) {
      setError('Could not load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      fileName: file.name.replace(/\.[^/.]+$/, '') // remove extension
    }));

    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const data = new FormData();
      data.append('file',        selectedFile);
      data.append('fileName',    formData.fileName || selectedFile.name);
      data.append('category',    formData.category);
      data.append('description', formData.description);

      await API.post('/documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Document uploaded successfully!');
      setShowForm(false);
      setSelectedFile(null);
      setPreview(null);
      setFormData({ fileName: '', category: 'other', description: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments();
      setTimeout(() => setSuccessMsg(''), 4000);

    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"? This cannot be undone.`)) return;

    try {
      setDeleting(docId);
      await API.delete(`/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d._id !== docId));
      setSuccessMsg('Document deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Could not delete document');
    } finally {
      setDeleting(null);
    }
  };

  const inputStyle = {
    background:   '#f8fafc',
    border:       '0.5px solid #e2e8f0',
    color:        '#0f172a',
    fontFamily:   'DM Sans, sans-serif',
    width:        '100%',
    padding:      '9px 12px',
    borderRadius: '8px',
    outline:      'none',
    fontSize:     '13px'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Loading documents...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            My Documents
          </h2>
          <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
            Securely store your civic documents in one place.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="text-sm px-4 py-2 rounded-lg font-medium"
          style={{ background: '#4160bf', color: '#ffffff' }}
        >
          {showForm ? 'Cancel' : '+ Upload Document'}
        </button>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="px-4 py-3 rounded-lg mb-5 text-sm"
             style={{ background: '#f0fdf4', color: '#16a34a',
                      border: '0.5px solid #bbf7d0' }}>
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg mb-5 text-sm"
             style={{ background: '#fef2f2', color: '#dc2626',
                      border: '0.5px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="rounded-xl mb-6 overflow-hidden"
             style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, #4160bf 0%, #4160bf 40%, #e2e8f0 40%)'
          }} />
          <div className="p-6">
            <h3 className="text-sm font-medium mb-4" style={{ color: '#0f172a' }}>
              Upload New Document
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">

              {/* File picker */}
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5"
                       style={{ color: '#94a3b8' }}>
                  Select File *
                </label>
                {!selectedFile ? (
                  <label
                    className="flex flex-col items-center justify-center py-8
                               rounded-lg cursor-pointer"
                    style={{ background: '#f8fafc',
                             border: '1.5px dashed #cbd5e1' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="#94a3b8" strokeWidth="1.5"
                         strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p className="text-xs mt-2" style={{ color: '#64748b' }}>
                      Click to select file
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
                      JPG, PNG, PDF up to 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg"
                       style={{ background: '#f8fafc',
                                border: '0.5px solid #e2e8f0' }}>
                    {preview ? (
                      <img src={preview} alt="preview"
                           className="w-12 h-12 object-cover rounded-lg flex-shrink-0"/>
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center
                                      justify-center flex-shrink-0"
                           style={{ background: '#fef2f2', color: '#dc2626' }}>
                        <FileIcon fileType={selectedFile.type} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium"
                         style={{ color: '#0f172a' }}>
                        {selectedFile.name}
                      </p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>
                        {formatSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{ color: '#94a3b8' }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5"
                         style={{ color: '#94a3b8' }}>
                    Document Name
                  </label>
                  <input
                    type="text"
                    value={formData.fileName}
                    onChange={e => setFormData(p => ({
                      ...p, fileName: e.target.value
                    }))}
                    placeholder="e.g. Aadhaar Card 2024"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5"
                         style={{ color: '#94a3b8' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(p => ({
                      ...p, category: e.target.value
                    }))}
                    style={inputStyle}
                  >
                    {Object.entries(categoryConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5"
                       style={{ color: '#94a3b8' }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(p => ({
                    ...p, description: e.target.value
                  }))}
                  placeholder="e.g. Original Aadhaar card scan"
                  style={inputStyle}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: uploading || !selectedFile ? '#e2e8f0' : '#4160bf',
                  color:      uploading || !selectedFile ? '#94a3b8'  : '#ffffff',
                  cursor:     uploading || !selectedFile ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="rounded-xl py-16 text-center"
             style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
          <p className="text-2xl mb-2">📁</p>
          <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
            No documents yet
          </p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
            Upload your civic documents to store them securely
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => {
            const cfg     = categoryConfig[doc.category];
            const isPDF   = doc.fileType === 'application/pdf';
            const isImage = doc.fileType?.startsWith('image/');

            return (
              <div key={doc._id}
                   className="rounded-xl overflow-hidden transition-all"
                   style={{ background: '#ffffff',
                            border: '0.5px solid #e2e8f0' }}>

                {/* Preview area */}
                <div className="h-32 flex items-center justify-center relative"
                     style={{ background: cfg.bg }}>
                  {isImage ? (
                    <img
                      src={doc.cloudinaryUrl}
                      alt={doc.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div style={{ color: cfg.color }}>
                      <FileIcon fileType={doc.fileType} />
                    </div>
                  )}

                  {/* Category badge */}
                  <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color,
                                 border: `0.5px solid ${cfg.color}30` }}>
                    {cfg.label}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-medium truncate mb-0.5"
                     style={{ color: '#0f172a' }}>
                    {doc.fileName}
                  </p>
                  {doc.description && (
                    <p className="text-xs truncate mb-1"
                       style={{ color: '#94a3b8' }}>
                      {doc.description}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: '#cbd5e1' }}>
                    {formatSize(doc.fileSize)} ·{' '}
                    {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <a
                      href={doc.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs py-1.5 rounded-lg text-center
                                 font-medium transition-all"
                      style={{ background: '#f8fafc', color: '#4160bf',
                               border: '0.5px solid #e2e8f0' }}
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(doc._id, doc.fileName)}
                      disabled={deleting === doc._id}
                      className="flex-1 text-xs py-1.5 rounded-lg font-medium"
                      style={{
                        background: '#fef2f2',
                        color:      '#dc2626',
                        border:     '0.5px solid #fecaca',
                        cursor:     deleting === doc._id
                          ? 'not-allowed' : 'pointer',
                        opacity: deleting === doc._id ? 0.6 : 1
                      }}
                    >
                      {deleting === doc._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};


export default DocumentsPage;