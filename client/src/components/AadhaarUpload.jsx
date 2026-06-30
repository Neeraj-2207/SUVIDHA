import { useState } from 'react';
import API from '../api/axios';

const AadhaarUpload = ({ onExtracted }) => {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [extracted, setExtracted] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setError('');
    setExtracted(null);

    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selected);
  };

  const handleExtract = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setExtracted(response.data.data);

      // Pass data up to parent component to autofill form
      if (onExtracted) {
        onExtracted(response.data.data);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not extract data. Please try a clearer photo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl p-5"
         style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

      <p className="text-sm font-medium mb-1" style={{ color: '#0f172a' }}>
        Aadhaar Verification
      </p>
      <p className="text-xs font-light mb-4" style={{ color: '#94a3b8' }}>
        Upload a clear photo of your Aadhaar card to auto-verify your identity
      </p>

      {/* Upload area */}
      {!preview ? (
        <label className="flex flex-col items-center justify-center
                          py-8 rounded-lg cursor-pointer transition-all"
               style={{
                 background: '#f8fafc',
                 border: '1.5px dashed #cbd5e1'
               }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="#94a3b8" strokeWidth="1.5"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p className="text-xs mt-2" style={{ color: '#64748b' }}>
            Click to upload Aadhaar card photo
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
            JPG, PNG up to 5MB
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div>
          {/* Image preview */}
          <img src={preview} alt="Aadhaar preview"
               className="w-full h-40 object-cover rounded-lg mb-3"
               style={{ border: '0.5px solid #e2e8f0' }} />

          <div className="flex gap-2">
            <button
              onClick={() => { setFile(null); setPreview(null); setExtracted(null); }}
              className="flex-1 text-xs py-2 rounded-lg font-medium"
              style={{ background: '#f1f5f9', color: '#64748b' }}
            >
              Change photo
            </button>
            <button
              onClick={handleExtract}
              disabled={loading}
              className="flex-1 text-xs py-2 rounded-lg font-medium"
              style={{
                background: loading ? '#93c5fd' : '#4160bf',
                color: '#ffffff'
              }}
            >
              {loading ? 'Extracting...' : 'Extract Details'}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-xs px-3 py-2 rounded-lg mt-3"
             style={{ background: '#fef2f2', color: '#dc2626',
                      border: '0.5px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Extracted data preview */}
      {extracted && (
        <div className="mt-4 p-3 rounded-lg"
             style={{ background: '#f0fdf4', border: '0.5px solid #bbf7d0' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#16a34a' }}>
            ✓ Data extracted successfully
          </p>
          <div className="space-y-1">
            {extracted.name && (
              <p className="text-xs" style={{ color: '#0f172a' }}>
                <span style={{ color: '#94a3b8' }}>Name:</span> {extracted.name}
              </p>
            )}
            {extracted.dob && (
              <p className="text-xs" style={{ color: '#0f172a' }}>
                <span style={{ color: '#94a3b8' }}>DOB:</span> {extracted.dob}
              </p>
            )}
            {extracted.aadhaar_number && (
              <p className="text-xs" style={{ color: '#0f172a' }}>
                <span style={{ color: '#94a3b8' }}>Aadhaar:</span> {extracted.aadhaar_number}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AadhaarUpload;