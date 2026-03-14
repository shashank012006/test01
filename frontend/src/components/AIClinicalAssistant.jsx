import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, X, Send, AlertCircle, Loader2, Lock } from 'lucide-react';

const AIClinicalAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('lifekey_token');
    if (!token) setIsLocked(true);
  }, [isOpen]);

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading || isLocked) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const token = localStorage.getItem('lifekey_token');
      const { data } = await axios.post('/api/assistant/query', 
        { query }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(data);
      setQuery('');
    } catch (err) {
      if (err.response?.status === 401) setIsLocked(true);
      setError(err.response?.data?.error || 'Failed to process clinical query.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="assistant-fab"
        onClick={() => setIsOpen(true)}
        title="AI Clinical Assistant"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="assistant-panel glass-panel">
      <div className="assistant-header">
        <div className="flex items-center gap-2">
          <Bot size={20} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>AI Clinical Assistant</span>
        </div>
        <button className="btn-close" onClick={() => { setIsOpen(false); setResults(null); setError(null); }}>
          <X size={18} />
        </button>
      </div>

      <div className="assistant-body" ref={chatRef}>
        {isLocked ? (
          <div className="assistant-message system text-center" style={{ padding: '2rem' }}>
            <Lock size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h4>Session Locked</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Please re-authenticate to continue using the clinical assistant.</p>
          </div>
        ) : (
          <>
            {!results && !isLoading && !error && (
              <div className="assistant-placeholder">
                <p>Hello. I can assist with clinical lookups, safety checks, and data summaries.</p>
                <div className="hint-list">
                  <span>"Show allergy for PT-1021"</span>
                  <span>"Is it safe to give Penicillin to PT-1025?"</span>
                  <span>"Summarize patient EM-70402"</span>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center p-4">
                <Loader2 className="spinning" size={24} color="var(--primary)" />
              </div>
            )}

            {error && (
              <div className="alert alert-danger flex gap-2 items-start" style={{ margin: '1rem', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {results && (
              <div className="assistant-response">
                <div className="response-title">{results.title}</div>
                <div className="response-content">
                  {results.content.split('⚠️').map((part, i) => (
                    i === 0 ? part : <div key={i} className="safety-alert-block">⚠️{part}</div>
                  ))}
                </div>
                {results.hint && <div className="assistant-hint">Tip: {results.hint}</div>}
                <div className="response-meta flex justify-between">
                  <span>Sync: {results.timestamp}</span>
                </div>
                <div className="clinical-disclaimer">
                  {results.footer}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!isLocked && (
        <form className="assistant-footer" onSubmit={handleQuery}>
          <input 
            placeholder="Ask a clinical question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={300}
            disabled={isLoading}
          />
          <button type="submit" disabled={!query.trim() || isLoading}>
            <Send size={18} />
          </button>
        </form>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .assistant-fab {
          position: fixed;
          top: 80px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .assistant-fab:hover { transform: scale(1.1); }
        
        .assistant-panel {
          position: fixed;
          top: 80px;
          right: 20px;
          width: 380px;
          height: 600px;
          max-height: 85vh;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          padding: 0 !important;
          box-shadow: 0 12px 48px rgba(0,0,0,0.5);
        }
        
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .assistant-header {
          padding: 1rem;
          border-bottom: 1px solid var(--panel-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.02);
        }
        
        .assistant-body {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        
        .assistant-placeholder {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        .hint-list {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .hint-list span {
          padding: 0.5rem;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
        }
        
        .assistant-footer {
          padding: 1rem;
          border-top: 1px solid var(--panel-border);
          display: flex;
          gap: 0.5rem;
        }
        
        .assistant-footer input {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--panel-border);
          border-radius: 4px;
          padding: 0.5rem;
          color: white;
          font-size: 0.875rem;
        }
        
        .assistant-footer button {
          background: transparent;
          border: none;
          color: var(--primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.25rem;
        }
        
        .assistant-footer button:disabled { opacity: 0.3; }
        
        .assistant-response {
          padding: 1.25rem;
          animation: fadeIn 0.3s ease-in;
        }
        
        .response-title {
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }
        
        .response-content {
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        
        .safety-alert-block {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          padding: 0.75rem;
          margin-top: 0.5rem;
          color: #fca5a5;
        }
        
        .assistant-hint {
          font-style: italic;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }
        
        .clinical-disclaimer {
          font-size: 0.7rem;
          color: var(--text-secondary);
          opacity: 0.7;
          border-top: 1px solid var(--panel-border);
          padding-top: 0.75rem;
          margin-top: 1rem;
        }
        
        .response-meta {
          font-size: 0.75rem;
          color: var(--text-secondary);
          opacity: 0.6;
        }
        
        .btn-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
        }
      ` }} />
    </div>
  );
};

export default AIClinicalAssistant;
