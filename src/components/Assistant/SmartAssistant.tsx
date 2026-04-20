import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, AlertCircle, CheckCircle2, ChevronRight, Mic } from 'lucide-react';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../services/firebase';

interface AssistantProps {
  congestionLevel: number;
}

const SmartAssistant: React.FC<AssistantProps> = React.memo(({ congestionLevel }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [listening, setListening] = useState(false);

  // Efficiency: useMemo for pure state logic
  const suggestion = useMemo(() => {
    if (congestionLevel > 0.7) {
      return {
        title: "Heavy Traffic Detected",
        message: "Main Gate is currently at 85% capacity. Rerouting via Gate B will save you approximately 12 minutes.",
        type: "warning",
        icon: <AlertCircle size={20} className="text-amber-400" />
      };
    }
    return {
      title: "Path Optimal",
      message: "Current route to your seat is clear. Concession wait times are under 5 minutes.",
      type: "success",
      icon: <CheckCircle2 size={20} className="text-emerald-400" />
    };
  }, [congestionLevel]);

  useEffect(() => {
    // Simulate AI proactive suggestion delay
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleVoiceCommand = useCallback(() => {
    setListening(true);
    if (analytics) logEvent(analytics, 'voice_command_activated');
    // Mocking Google Cloud Speech-to-Text / Dialogflow CX
    setTimeout(() => {
      setListening(false);
      alert("Google Dialogflow CX Mock: Processing intent...");
    }, 2000);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-8 w-80 animate-slide-up z-30">
      <div className="glass-card overflow-hidden border border-blue-500/20 shadow-[0_8px_32px_rgba(59,130,246,0.15)]">
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-900/20 p-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MessageSquare size={16} className="text-blue-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </div>
            <span className="text-xs font-bold tracking-wider text-blue-200">VENUE AI ASSISTANT</span>
          </div>
          <button 
            onClick={handleVoiceCommand}
            className={`p-1.5 rounded-full transition-colors ${listening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
            aria-label="Activate Voice Command"
          >
            <Mic size={14} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-3 items-start">
            <div className="mt-1">{suggestion.icon}</div>
            <div>
              <h4 className="font-semibold text-sm mb-1 text-white">{suggestion.title}</h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {suggestion.message}
              </p>
              
              <button className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors group">
                Apply Smart Route 
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SmartAssistant;
