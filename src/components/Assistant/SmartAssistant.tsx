import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, AlertCircle, CheckCircle2, ChevronRight, Mic, X } from 'lucide-react';

interface AssistantProps {
  congestionLevel: number;
  onApplyRoute?: () => void;
}

const SmartAssistant: React.FC<AssistantProps> = React.memo(({ congestionLevel, onApplyRoute }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const suggestion = useMemo(() => {
    if (congestionLevel > 0.7) {
      return {
        title: 'Heavy Traffic Detected',
        message: 'Main Gate is at 85% capacity. Rerouting via Gate B saves ~12 minutes.',
        type: 'warning',
        icon: <AlertCircle size={20} style={{ color: '#fbbf24' }} />,
      };
    }
    return {
      title: 'Path Optimal',
      message: 'Current route to your seat is clear. Concession wait times are under 5 minutes.',
      type: 'success',
      icon: <CheckCircle2 size={20} style={{ color: '#34d399' }} />,
    };
  }, [congestionLevel]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleVoiceCommand = useCallback(() => {
    setListening(true);
    setTimeout(() => {
      setListening(false);
    }, 2500);
  }, []);

  if (!isVisible || dismissed) return null;

  return (
    <div className="assistant-wrap animate-slide-up">
      <div className="glass-card assistant-card">
        <div className="assistant-header">
          <div className="assistant-title">
            <span className="assistant-dot">
              <MessageSquare size={14} />
            </span>
            VENUE AI ASSISTANT
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleVoiceCommand}
              className={`voice-btn ${listening ? 'listening' : ''}`}
              aria-label="Activate Voice Command"
            >
              <Mic size={13} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="voice-btn"
              aria-label="Dismiss assistant"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="assistant-body">
          {listening ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(239,68,68,0.15)', margin: '0 auto 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 1.5s ease infinite',
              }}>
                <Mic size={20} style={{ color: '#f87171' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Listening...</div>
            </div>
          ) : (
            <div className="suggestion-row">
              <div className="suggestion-icon">{suggestion.icon}</div>
              <div>
                <div className="suggestion-title">{suggestion.title}</div>
                <div className="suggestion-text">{suggestion.message}</div>
                <button className="suggestion-action" onClick={onApplyRoute}>
                  Apply Smart Route
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default SmartAssistant;
