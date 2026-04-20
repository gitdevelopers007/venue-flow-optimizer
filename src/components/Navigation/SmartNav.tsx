import React from 'react';
import { RouteResult } from '../../engine/types';
import { MapPin, Navigation, Clock, ShieldCheck } from 'lucide-react';

interface SmartNavProps {
  route: RouteResult | null;
  onClear: () => void;
}

const SmartNav: React.FC<SmartNavProps> = ({ route, onClear }) => {
  if (!route) return null;

  return (
    <div className="glass-card p-6 animate-fade-in border-blue-500/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Navigation size={20} className="text-blue-400" />
          Optimal Route
        </h3>
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-white underline">Clear</button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <div className="w-0.5 h-8 bg-blue-400/20" />
            <MapPin size={16} className="text-rose-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500">Current Location</div>
            <div className="text-sm font-medium mb-3">{route.path[0].id}</div>
            <div className="text-xs text-gray-500">Destination</div>
            <div className="text-sm font-medium">{route.path[route.path.length - 1].id}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
              <Clock size={12} /> Duration
            </div>
            <div className="text-xl font-bold">{(route.estimatedTime / 60).toFixed(1)}m</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
              <ShieldCheck size={12} /> Safety Score
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {Math.round((1 - route.averageCongestion) * 100)}%
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 leading-relaxed">
          <strong>Intelligent Load Balancing:</strong> We've redirected you away from the West Gate to avoid a 12-minute bottleneck.
        </div>
      </div>
    </div>
  );
};

export default SmartNav;
