import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
  id: string;
  type: 'warning' | 'tip' | 'info';
  message: string;
}

const SmartAssistant: React.FC<{ congestionLevel: number }> = ({ congestionLevel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Simulated AI Logic based on context
    const newSuggestions: Suggestion[] = [];
    
    if (congestionLevel > 0.7) {
      newSuggestions.push({
        id: '1',
        type: 'warning',
        message: 'High density detected at Section 104. Consider using the Upper Tier concourse for faster movement.'
      });
    } else {
      newSuggestions.push({
        id: '2',
        type: 'tip',
        message: 'Wait times at West Grill are currently under 4 minutes. Perfect time for a snack!'
      });
    }

    newSuggestions.push({
      id: '3',
      type: 'info',
      message: 'Mobility-first mode is active. All suggested routes are ADA-compliant.'
    });

    setSuggestions(newSuggestions);
  }, [congestionLevel]);

  return (
    <div className="fixed bottom-24 right-8 z-50 pointer-events-none">
      <div className="flex flex-col items-end gap-4 pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-80 p-6 mb-2 overflow-hidden border-blue-500/30"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-blue-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">AI Venue Assistant</h3>
              </div>
              
              <div className="space-y-4">
                {suggestions.map((s) => (
                  <div key={s.id} className={`flex gap-3 p-3 rounded-xl ${
                    s.type === 'warning' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                    s.type === 'tip' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                  }`}>
                    {s.type === 'warning' ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
                    <p className="text-xs leading-relaxed">{s.message}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-[10px] text-gray-500 italic">
                  AI is analyzing live data from 14 sensor nodes...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
            isOpen ? 'bg-blue-600 rotate-90' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isOpen ? <MessageSquare size={24} /> : <Sparkles size={24} />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-bg-dark animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SmartAssistant;
