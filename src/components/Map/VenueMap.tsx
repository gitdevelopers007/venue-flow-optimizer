import React, { useState, useCallback, useEffect, useRef } from 'react';

interface VenueZone {
  id: string;
  label: string;
  type: 'gate' | 'concession' | 'restroom' | 'seat_block' | 'waypoint';
  x: number;
  y: number;
  w: number;
  h: number;
  congestion: number;
}

interface VenueMapProps {
  onZoneClick?: (zoneId: string) => void;
  selectedZone?: string | null;
  routePath?: string[];
}

const ZONES: VenueZone[] = [
  { id: 'gate_north', label: 'North Gate', type: 'gate', x: 320, y: 30, w: 120, h: 40, congestion: 0.85 },
  { id: 'gate_south', label: 'South Gate', type: 'gate', x: 320, y: 530, w: 120, h: 40, congestion: 0.3 },
  { id: 'gate_east', label: 'East Gate', type: 'gate', x: 640, y: 280, w: 40, h: 100, congestion: 0.5 },
  { id: 'gate_west', label: 'West Gate', type: 'gate', x: 80, y: 280, w: 40, h: 100, congestion: 0.9 },
  { id: 'conc_01', label: 'Nitro Burgers', type: 'concession', x: 160, y: 120, w: 100, h: 50, congestion: 0.6 },
  { id: 'conc_02', label: 'Cold Drinks', type: 'concession', x: 500, y: 120, w: 100, h: 50, congestion: 0.35 },
  { id: 'conc_03', label: 'Pizza Station', type: 'concession', x: 500, y: 440, w: 100, h: 50, congestion: 0.45 },
  { id: 'rest_east', label: 'East Restrooms', type: 'restroom', x: 580, y: 200, w: 60, h: 50, congestion: 0.55 },
  { id: 'rest_west', label: 'West Restrooms', type: 'restroom', x: 120, y: 400, w: 60, h: 50, congestion: 0.4 },
  { id: 'seat_a', label: 'Section A', type: 'seat_block', x: 220, y: 200, w: 130, h: 80, congestion: 0.7 },
  { id: 'seat_b', label: 'Section B', type: 'seat_block', x: 410, y: 200, w: 130, h: 80, congestion: 0.5 },
  { id: 'seat_c', label: 'Section C', type: 'seat_block', x: 220, y: 340, w: 130, h: 80, congestion: 0.25 },
  { id: 'seat_d', label: 'Section D', type: 'seat_block', x: 410, y: 340, w: 130, h: 80, congestion: 0.6 },
  { id: 'stage', label: 'Main Stage', type: 'waypoint', x: 280, y: 280, w: 200, h: 50, congestion: 0 },
];

const getCongestionColor = (c: number) => {
  if (c > 0.7) return 'rgba(239,68,68,0.6)';
  if (c > 0.4) return 'rgba(251,191,36,0.5)';
  return 'rgba(52,211,153,0.4)';
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'gate': return '🚪';
    case 'concession': return '🍔';
    case 'restroom': return '🚻';
    case 'seat_block': return '💺';
    default: return '🎤';
  }
};

const VenueMap: React.FC<VenueMapProps> = ({ onZoneClick, selectedZone, routePath = [] }) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [zones, setZones] = useState(ZONES);
  const animRef = useRef<number>(0);

  // Simulate live congestion changes
  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prev => prev.map(z => ({
        ...z,
        congestion: z.type === 'waypoint' ? 0 :
          Math.max(0.05, Math.min(0.95, z.congestion + (Math.random() - 0.5) * 0.08))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Grid animation
  useEffect(() => {
    const tick = () => {
      animRef.current += 0.3;
      const el = document.getElementById('grid-offset');
      if (el) el.setAttribute('y', String(animRef.current % 40));
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const handleZoneClick = useCallback((id: string) => {
    onZoneClick?.(id);
  }, [onZoneClick]);

  const isOnRoute = (id: string) => routePath.includes(id);

  return (
    <div style={{
      width: '100%', height: '100vh', background: '#0a0a0c',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated grid background */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.08 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect id="grid-offset" x="0" y="0" width="40" height="40" fill="none" />
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Venue SVG */}
      <svg
        viewBox="0 0 760 600"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 760px)',
          height: 'auto',
          filter: 'drop-shadow(0 0 60px rgba(59,130,246,0.08))',
        }}
      >
        {/* Venue outline */}
        <rect x="70" y="20" width="620" height="560" rx="30"
          fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="2" strokeDasharray="8 4" />

        {/* Route path lines */}
        {routePath.length > 1 && routePath.slice(0, -1).map((fromId, i) => {
          const from = zones.find(z => z.id === fromId);
          const to = zones.find(z => z.id === routePath[i + 1]);
          if (!from || !to) return null;
          return (
            <line
              key={`route-${i}`}
              x1={from.x + from.w / 2} y1={from.y + from.h / 2}
              x2={to.x + to.w / 2} y2={to.y + to.h / 2}
              stroke="#3b82f6" strokeWidth="3" strokeDasharray="8 4"
              opacity="0.8"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" repeatCount="indefinite" />
            </line>
          );
        })}

        {/* Zones */}
        {zones.map(zone => {
          const isHovered = hoveredZone === zone.id;
          const isSelected = selectedZone === zone.id;
          const onRoute = isOnRoute(zone.id);

          return (
            <g key={zone.id}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => handleZoneClick(zone.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Congestion heatmap glow */}
              <rect
                x={zone.x - 4} y={zone.y - 4}
                width={zone.w + 8} height={zone.h + 8}
                rx="14"
                fill={getCongestionColor(zone.congestion)}
                opacity={zone.type === 'waypoint' ? 0 : 0.3 + zone.congestion * 0.4}
                style={{ transition: 'all 1s ease' }}
              />

              {/* Zone body */}
              <rect
                x={zone.x} y={zone.y}
                width={zone.w} height={zone.h}
                rx="10"
                fill={isSelected ? 'rgba(59,130,246,0.3)' :
                  onRoute ? 'rgba(59,130,246,0.2)' :
                  zone.type === 'waypoint' ? 'rgba(168,85,247,0.15)' :
                  'rgba(255,255,255,0.06)'}
                stroke={isSelected ? '#3b82f6' :
                  onRoute ? 'rgba(59,130,246,0.5)' :
                  isHovered ? 'rgba(255,255,255,0.3)' :
                  'rgba(255,255,255,0.1)'}
                strokeWidth={isSelected || onRoute ? 2 : 1}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Icon */}
              <text
                x={zone.x + zone.w / 2}
                y={zone.y + zone.h / 2 - (zone.h > 50 ? 4 : 0)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={zone.type === 'waypoint' ? '16' : '14'}
              >
                {getTypeIcon(zone.type)}
              </text>

              {/* Label */}
              <text
                x={zone.x + zone.w / 2}
                y={zone.y + zone.h / 2 + (zone.h > 50 ? 16 : 0)}
                textAnchor="middle"
                dominantBaseline={zone.h > 50 ? 'auto' : 'central'}
                fontSize="9"
                fill={isSelected ? '#93c5fd' : '#94a3b8'}
                fontFamily="Outfit, sans-serif"
                fontWeight="500"
                dy={zone.h <= 50 ? 20 : 0}
              >
                {zone.label}
              </text>

              {/* Congestion badge */}
              {zone.type !== 'waypoint' && (isHovered || isSelected) && (
                <g>
                  <rect
                    x={zone.x + zone.w - 30} y={zone.y - 10}
                    width="36" height="18" rx="9"
                    fill={zone.congestion > 0.7 ? '#ef4444' : zone.congestion > 0.4 ? '#f59e0b' : '#10b981'}
                  />
                  <text
                    x={zone.x + zone.w - 12} y={zone.y + 2}
                    textAnchor="middle"
                    fontSize="9" fill="#fff"
                    fontFamily="Outfit, sans-serif"
                    fontWeight="700"
                  >
                    {Math.round(zone.congestion * 100)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(90, 570)">
          {[
            { color: 'rgba(52,211,153,0.6)', label: 'Low' },
            { color: 'rgba(251,191,36,0.6)', label: 'Medium' },
            { color: 'rgba(239,68,68,0.6)', label: 'High' },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${i * 80}, 0)`}>
              <circle cx="0" cy="0" r="5" fill={item.color} />
              <text x="10" y="3" fontSize="10" fill="#64748b" fontFamily="Outfit">
                {item.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Radar sweep in corner */}
      <div style={{
        position: 'absolute', bottom: '80px', left: '40px',
        width: '120px', height: '120px', opacity: 0.15,
      }}>
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="55" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          <circle cx="60" cy="60" r="35" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          <circle cx="60" cy="60" r="15" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          <line x1="60" y1="60" x2="115" y2="60" stroke="#3b82f6" strokeWidth="1"
            style={{ transformOrigin: '60px 60px', animation: 'spin 4s linear infinite' }} />
        </svg>
      </div>
    </div>
  );
};

export default React.memo(VenueMap);
