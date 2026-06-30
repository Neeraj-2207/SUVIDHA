import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const FloatingChat = () => {
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const messagesEndRef            = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Welcome message when opened for first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role:      'assistant',
        content:   `Hi ${user?.name?.split(' ')[0]}! 👋 Ask me anything about SUVIDHA services.`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setMessages(prev => [...prev, {
      role:      'user',
      content:   messageText,
      timestamp: new Date()
    }]);
    setInput('');
    setLoading(true);

    try {
      const response = await API.post('/ai/chat', { message: messageText });
      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   response.data.answer,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   'Sorry, AI service is unavailable right now. Try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How to pay bills?",
    "File a complaint?",
    "Water connection?"
  ];

  return (
    <>
      {/* ── Chat Popup ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width:      '340px',
            height:     '460px',
            background: '#ffffff',
            border:     '0.5px solid #e2e8f0'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
               style={{ background: '#4160bf' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full"
                   style={{ background: '#22c55e' }} />
              <p className="text-sm font-medium text-white">
                SUVIDHA AI
              </p>
              <span className="text-xs opacity-60 text-white">
                · Civic Assistant
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Open full page button */}
              <button
                onClick={() => { setIsOpen(false); navigate('/dashboard/ai'); }}
                className="text-white opacity-60 hover:opacity-100 transition-opacity"
                title="Open full chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"/>
                  <polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/>
                  <line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              </button>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white opacity-60 hover:opacity-100 transition-opacity"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3"
               style={{ background: '#f8fafc' }}>

            {/* Quick questions — show only at start */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {quickQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 rounded-full transition-all"
                    style={{
                      background: '#ffffff',
                      color:      '#4160bf',
                      border:     '0.5px solid #c7d2fe'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i}
                     className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center
                                    flex-shrink-0 mr-1.5 mt-0.5 text-xs font-medium"
                         style={{ background: '#4160bf', color: '#ffffff' }}>
                      AI
                    </div>
                  )}
                  <div
                    className="text-xs leading-relaxed px-3 py-2 max-w-xs"
                    style={{
                      background:   isUser ? '#4160bf' : '#ffffff',
                      color:        isUser ? '#ffffff'  : '#0f172a',
                      border:       isUser ? 'none' : '0.5px solid #e2e8f0',
                      borderRadius: isUser
                        ? '14px 14px 4px 14px'
                        : '14px 14px 14px 4px'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center
                                flex-shrink-0 mr-1.5 text-xs font-medium"
                     style={{ background: '#4160bf', color: '#ffffff' }}>
                  AI
                </div>
                <div className="px-3 py-2 rounded-2xl"
                     style={{ background: '#ffffff', border: '0.5px solid #e2e8f0',
                              borderRadius: '14px 14px 14px 4px' }}>
                  <div className="flex gap-1 items-center h-3">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1 h-1 rounded-full"
                           style={{
                             background: '#94a3b8',
                             animation: 'floatBounce 1.4s infinite',
                             animationDelay: `${i * 0.2}s`
                           }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-3 py-2 flex-shrink-0"
               style={{ borderTop: '0.5px solid #e2e8f0', background: '#ffffff' }}>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask something..."
                className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
                style={{
                  background: '#f8fafc',
                  border:     '0.5px solid #e2e8f0',
                  color:      '#0f172a',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: loading || !input.trim() ? '#e2e8f0' : '#4160bf',
                  color:      loading || !input.trim() ? '#94a3b8'  : '#ffffff',
                  cursor:     loading || !input.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Button ── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                   flex items-center justify-center shadow-lg transition-all"
        style={{
          background: isOpen ? '#3550a8' : '#4160bf',
          transform:  isOpen ? 'rotate(0deg)' : 'rotate(0deg)'
        }}
        title="Ask AI Assistant"
      >
        {isOpen ? (
          // X icon when open
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="white" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          // AI spark icon when closed
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="white" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
            <circle cx="9" cy="14" r="1" fill="white" stroke="none"/>
            <circle cx="15" cy="14" r="1" fill="white" stroke="none"/>
          </svg>
        )}

        {/* Pulse ring when closed */}
        {!isOpen && (
          <span className="absolute w-14 h-14 rounded-full"
                style={{
                  background: '#4160bf',
                  opacity: 0.3,
                  animation: 'pulse 2s infinite'
                }} />
        )}
      </button>

      {/* Animations */}
      <style>{`
        @keyframes floatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default FloatingChat;