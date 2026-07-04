import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AadhaarUpload from '../components/AadhaarUpload';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const VerifyAadhaarPage = () => {
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const [existingDocs, setExistingDocs]   = useState([]);
  const [checkingDocs, setCheckingDocs]   = useState(true);
  const [extractedData, setExtractedData] = useState(null);
  const [confirming, setConfirming]       = useState(false);
  const [extracting, setExtracting]       = useState(null);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);
  const [showUpload, setShowUpload]       = useState(false);

  // ─────────────────────────────────────────
  // On load — check if user has Aadhaar docs
  // in their document vault
  // ─────────────────────────────────────────
  useEffect(() => {
    checkExistingAadhaar();
  }, []);

  const checkExistingAadhaar = async () => {
    try {
      setCheckingDocs(true);
      const res = await API.get('/documents');

      // Filter only Aadhaar category documents
      const aadhaarDocs = res.data.documents.filter(
        doc => doc.category === 'aadhaar'
      );

      setExistingDocs(aadhaarDocs);

      // If no Aadhaar docs found → show upload directly
      if (aadhaarDocs.length === 0) {
        setShowUpload(true);
      }

    } catch (err) {
      // If error fetching docs → fallback to upload
      setShowUpload(true);
    } finally {
      setCheckingDocs(false);
    }
  };

  // ─────────────────────────────────────────
  // Use an existing document from vault
  // Fetch the image from Cloudinary URL and
  // send it to OCR endpoint
  // ─────────────────────────────────────────
  const handleUseExisting = async (doc) => {
    try {
      setExtracting(doc._id);
      setError('');

      // Fetch the image from Cloudinary as a blob
      const imageRes  = await fetch(doc.cloudinaryUrl);
      const blob      = await imageRes.blob();
      const file      = new File([blob], doc.fileName, { type: blob.type });

      // Send to OCR endpoint
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setExtractedData(response.data.data);
      setError('');

    } catch (err) {
      setError('Could not extract data from this document. Try uploading a fresh photo.');
    } finally {
      setExtracting(null);
    }
  };

  // ─────────────────────────────────────────
  // Fresh upload extracted data
  // ─────────────────────────────────────────
  const handleExtracted = (data) => {
    setExtractedData(data);
    setError('');
  };

  // ─────────────────────────────────────────
  // Confirm and verify
  // ─────────────────────────────────────────
  const handleConfirm = async () => {
    if (!extractedData) return;

    try {
      setConfirming(true);
      setError('');

      await API.patch('/auth/verify-aadhaar', {
        aadhaarNumber: extractedData.aadhaar_number,
        name:          extractedData.name,
        dob:           extractedData.dob
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard/profile'), 2000);

    } catch (err) {
      const message = err.response?.data?.message ||
                      'Could not verify. Please try again.';
      setError(message);

      if (err.response?.data?.mismatch) {
        setTimeout(() => {
          setExtractedData(null);
          setShowUpload(false);
        }, 3000);
      }
    } finally {
      setConfirming(false);
    }
  };

  // ─────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <div className="w-16 h-16 rounded-full flex items-center
                        justify-center mx-auto mb-4"
             style={{ background: '#f0fdf4' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="#16a34a" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="text-lg font-medium mb-1" style={{ color: '#0f172a' }}>
          Aadhaar Verified!
        </h2>
        <p className="text-sm font-light" style={{ color: '#94a3b8' }}>
          Redirecting to your profile...
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────
  if (checkingDocs) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Checking your document vault...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">

      {/* Back */}
      <button
        onClick={() => navigate('/dashboard/profile')}
        className="flex items-center gap-1.5 text-xs mb-5 hover:opacity-70"
        style={{ color: '#94a3b8' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to profile
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-medium"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
          Verify Aadhaar
        </h2>
        <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
          Confirm your identity as a citizen of Vijayawada.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg mb-4 text-sm"
             style={{ background: '#fef2f2', color: '#dc2626',
                      border: '0.5px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* ─── EXISTING AADHAAR DOCS FROM VAULT ─── */}
      {existingDocs.length > 0 && !extractedData && (
        <div className="rounded-xl mb-4 overflow-hidden"
             style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

          <div className="px-5 py-4"
               style={{ borderBottom: '0.5px solid #f1f5f9' }}>
            <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
              Found in your document vault
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Use an existing Aadhaar document to verify instantly
            </p>
          </div>

          {existingDocs.map((doc, i) => (
            <div key={doc._id}
                 className="flex items-center gap-4 px-5 py-4"
                 style={{
                   borderBottom: i < existingDocs.length - 1
                     ? '0.5px solid #f8fafc' : 'none'
                 }}>

              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                   style={{ background: '#eef2ff' }}>
                {doc.fileType?.startsWith('image/') ? (
                  <img src={doc.cloudinaryUrl} alt={doc.fileName}
                       className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                       style={{ color: '#4160bf' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.5"
                         strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12
                               a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate"
                   style={{ color: '#0f172a' }}>
                  {doc.fileName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  Uploaded {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>

              {/* Use button */}
              <button
                onClick={() => handleUseExisting(doc)}
                disabled={extracting === doc._id}
                className="text-xs px-4 py-2 rounded-lg font-medium flex-shrink-0"
                style={{
                  background: extracting === doc._id ? '#e2e8f0' : '#4160bf',
                  color:      extracting === doc._id ? '#94a3b8'  : '#ffffff',
                  cursor:     extracting === doc._id ? 'not-allowed' : 'pointer'
                }}
              >
                {extracting === doc._id ? 'Extracting...' : 'Use this →'}
              </button>

            </div>
          ))}

          {/* Option to upload fresh instead */}
          <div className="px-5 py-3"
               style={{ borderTop: '0.5px solid #f1f5f9',
                        background: '#fafafa' }}>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="text-xs"
              style={{ color: '#94a3b8' }}
            >
              {showUpload
                ? '↑ Hide upload form'
                : '+ Upload a different Aadhaar photo instead'
              }
            </button>
          </div>
        </div>
      )}

      {/* ─── UPLOAD FORM ─── */}
      {showUpload && !extractedData && (
        <AadhaarUpload onExtracted={handleExtracted} />
      )}

      {/* ─── CONFIRMATION PANEL ─── */}
      {extractedData && (
        <div className="rounded-xl overflow-hidden"
             style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, #4160bf 0%, #4160bf 40%, #e2e8f0 40%)'
          }} />

          <div className="p-6">
            <p className="text-sm font-medium mb-1" style={{ color: '#0f172a' }}>
              Confirm your details
            </p>
            <p className="text-xs font-light mb-5" style={{ color: '#94a3b8' }}>
              Review the extracted information before confirming.
            </p>

            {/* Extracted fields */}
            <div className="space-y-3 mb-5">
              {[
                { label: 'Full Name',      value: extractedData.name },
                { label: 'Date of Birth',  value: extractedData.dob },
                { label: 'Aadhaar Number', value: extractedData.aadhaar_number,
                  mono: true }
              ].map(field => (
                <div key={field.label}
                     className="flex justify-between py-2"
                     style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>
                    {field.label}
                  </span>
                  <span className={`text-xs font-medium ${field.mono ? 'font-mono' : ''}`}
                        style={{ color: '#0f172a' }}>
                    {field.value || '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full py-2.5 rounded-lg text-sm font-medium"
              style={{
                background: confirming ? '#93c5fd' : '#4160bf',
                color:      '#ffffff',
                cursor:     confirming ? 'not-allowed' : 'pointer'
              }}
            >
              {confirming ? 'Verifying...' : 'Confirm & Verify'}
            </button>

            {/* Try different */}
            <button
              onClick={() => setExtractedData(null)}
              className="w-full py-2 mt-2 rounded-lg text-xs"
              style={{ background: 'transparent', color: '#94a3b8' }}
            >
              ← Try a different document
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default VerifyAadhaarPage;