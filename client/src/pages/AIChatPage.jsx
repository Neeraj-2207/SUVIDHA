import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center
                        flex-shrink-0 mr-2 mt-0.5 text-xs font-medium"
             style={{ background: '#4160bf', color: '#ffffff' }}>
          AI
        </div>
      )}
      <div
        className="max-w-xs lg:max-w-md px-4 py-3 text-sm leading-relaxed"
        style={{
          background:   isUser ? '#4160bf' : '#ffffff',
          color:        isUser ? '#ffffff'  : '#0f172a',
          border:       isUser ? 'none' : '0.5px solid #e2e8f0',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
        }}
      >
        {message.content}
        <p className="text-xs mt-1 opacity-60">
          {new Date(message.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
          })}
        </p>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center
                        flex-shrink-0 ml-2 mt-0.5 text-xs font-medium"
             style={{ background: '#e2e8f0', color: '#64748b' }}>
          U
        </div>
      )}
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex justify-start mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center
                    flex-shrink-0 mr-2 text-xs font-medium"
         style={{ background: '#4160bf', color: '#ffffff' }}>
      AI
    </div>
    <div className="px-4 py-3 rounded-2xl"
         style={{ background: '#ffffff', border: '0.5px solid #e2e8f0',
                  borderRadius: '18px 18px 18px 4px' }}>
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full"
               style={{
                 background: '#94a3b8',
                 animation: `bounce 1.4s infinite`,
                 animationDelay: `${i * 0.2}s`
               }} />
        ))}
      </div>
    </div>
  </div>
);

const suggestions = [
  "What is SUVIDHA?",
  "How do I pay my water bill?",
  "How to file a complaint?",
  "What documents needed for water connection?",
  "How long to resolve a streetlight complaint?"
];

const AIChatPage = () => {
  const { user }                  = useAuth();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const messagesEndRef            = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([{
      role:      'assistant',
      content:   `Hello ${user?.name?.split(' ')[0]}! 👋 I'm SUVIDHA AI Assistant. I can help you with information about municipal services, bills, complaints, and civic procedures in Vijayawada. What would you like to know?`,
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = {
      role:      'user',
      content:   messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/ai/chat', { message: messageText });

      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   response.data.answer,
        timestamp: new Date()
      }]);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'AI service unavailable. Make sure the Python service is running on port 8000.'
      );
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col"
         style={{ height: 'calc(100vh - 120px)' }}>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            AI Assistant
          </h2>
          <p className="text-sm font-light mt-0.5" style={{ color: '#94a3b8' }}>
            Powered by Gemini + RAG · Civic knowledge base
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full"
               style={{ background: '#22c55e' }} />
          <span className="text-xs" style={{ color: '#94a3b8' }}>Online</span>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 rounded-xl overflow-hidden flex flex-col"
           style={{ background: '#f8fafc', border: '0.5px solid #e2e8f0' }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider mb-2 px-1"
                 style={{ color: '#94a3b8' }}>
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: '#ffffff',
                      color:      '#4160bf',
                      border:     '0.5px solid #c7d2fe'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {loading && <TypingIndicator />}

          {error && (
            <div className="text-xs px-4 py-2 rounded-lg mb-2"
                 style={{ background: '#fef2f2', color: '#dc2626',
                          border: '0.5px solid #fecaca' }}>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4"
             style={{ borderTop: '0.5px solid #e2e8f0', background: '#ffffff' }}>
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about bills, complaints, civic services..."
              rows={1}
              className="flex-1 text-sm px-4 py-3 rounded-xl outline-none resize-none"
              style={{
                background: '#f8fafc',
                border:     '0.5px solid #e2e8f0',
                color:      '#0f172a',
                fontFamily: 'DM Sans, sans-serif',
                maxHeight:  '100px'
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: loading || !input.trim() ? '#e2e8f0' : '#4160bf',
                color:      loading || !input.trim() ? '#94a3b8'  : '#ffffff',
                cursor:     loading || !input.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: '#cbd5e1' }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default AIChatPage;
