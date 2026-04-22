import React from 'react';
import type { RouteResult } from '../../engine/types';
import { Navigation, MapPin, Clock, ShieldCheck } from 'lucide-react';

interface SmartNavProps {
  route: RouteResult | null;
  onClear: () => void;
}

const SmartNav: React.FC<SmartNavProps> = ({ route, onClear }) => {
  if (!route || route.path.length < 2) return null;

  const startNode = route.path[0];
  const endNode = route.path[route.path.length - 1];
  const safetyScore = Math.round((1 - route.averageCongestion) * 100);

  return (
    <div className="glass-card route-panel panel-card animate-fade-in">
      <div className="route-header">
        <div className="route-title">
          <Navigation size={18} />
          Optimal Route
        </div>
        <button onClick={onClear} className="route-clear">Clear</button>
      </div>

      <div className="route-path">
        <div className="route-dots">
          <div className="route-dot-start" />
          <div className="route-dot-line" />
          <MapPin size={14} style={{ color: '#fb7185' }} />
        </div>
        <div className="route-labels">
          <div className="route-sublabel">From</div>
          <div className="route-mainlabel">{startNode.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
          <div className="route-sublabel">To</div>
          <div className="route-mainlabel">{endNode.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
        </div>
      </div>

      <div className="route-stats">
        <div className="route-stat">
          <div className="route-stat-label">
            <Clock size={12} /> Duration
          </div>
          <div className="route-stat-value">
            {(route.estimatedTime / 60).toFixed(1)}m
          </div>
        </div>
        <div className="route-stat">
          <div className="route-stat-label">
            <ShieldCheck size={12} /> Safety
          </div>
          <div className="route-stat-value safety">{safetyScore}%</div>
        </div>
      </div>

      <div className="route-tip">
        <strong>Smart Load Balancing:</strong> Route avoids {route.averageCongestion > 0.5 ? 'heavily congested West Gate' : 'moderate traffic areas'} to minimize your wait time.
      </div>
    </div>
  );
};

export default SmartNav;
