import React, { useState, useCallback, useMemo } from 'react';
import VenueMap from '../Map/VenueMap';
import VirtualQueue from '../Queue/VirtualQueue';
import SmartAssistant from '../Assistant/SmartAssistant';
import SmartNav from '../Navigation/SmartNav';
import { Navigation, Accessibility, Layers, Settings, MapPin, LogIn } from 'lucide-react';
import { authenticateUser } from '../../services/firebase';
import { RoutingEngine } from '../../engine/routing';
import type { VenueGraph, RouteResult } from '../../engine/types';

// Build the venue graph that matches our SVG map zones
const venueGraph: VenueGraph = {
  nodes: {
    gate_north:  { id: 'gate_north',  lat: 40.7595, lng: -73.9845, isAccessible: true,  type: 'gate',       congestion: 0.85 },
    gate_south:  { id: 'gate_south',  lat: 40.7580, lng: -73.9845, isAccessible: true,  type: 'gate',       congestion: 0.3 },
    gate_east:   { id: 'gate_east',   lat: 40.7588, lng: -73.9835, isAccessible: true,  type: 'gate',       congestion: 0.5 },
    gate_west:   { id: 'gate_west',   lat: 40.7588, lng: -73.9855, isAccessible: false, type: 'gate',       congestion: 0.9 },
    conc_01:     { id: 'conc_01',     lat: 40.7593, lng: -73.9852, isAccessible: true,  type: 'concession', congestion: 0.6 },
    conc_02:     { id: 'conc_02',     lat: 40.7593, lng: -73.9838, isAccessible: true,  type: 'concession', congestion: 0.35 },
    conc_03:     { id: 'conc_03',     lat: 40.7583, lng: -73.9838, isAccessible: true,  type: 'concession', congestion: 0.45 },
    rest_east:   { id: 'rest_east',   lat: 40.7591, lng: -73.9837, isAccessible: true,  type: 'restroom',   congestion: 0.55 },
    rest_west:   { id: 'rest_west',   lat: 40.7584, lng: -73.9853, isAccessible: true,  type: 'restroom',   congestion: 0.4 },
    seat_a:      { id: 'seat_a',      lat: 40.7591, lng: -73.9848, isAccessible: true,  type: 'seat_block', congestion: 0.7 },
    seat_b:      { id: 'seat_b',      lat: 40.7591, lng: -73.9842, isAccessible: true,  type: 'seat_block', congestion: 0.5 },
    seat_c:      { id: 'seat_c',      lat: 40.7585, lng: -73.9848, isAccessible: true,  type: 'seat_block', congestion: 0.25 },
    seat_d:      { id: 'seat_d',      lat: 40.7585, lng: -73.9842, isAccessible: true,  type: 'seat_block', congestion: 0.6 },
    stage:       { id: 'stage',       lat: 40.7588, lng: -73.9845, isAccessible: true,  type: 'waypoint',   congestion: 0 },
  },
  edges: {
    gate_north: [{ from: 'gate_north', to: 'conc_01', distance: 40, isAccessible: true }, { from: 'gate_north', to: 'conc_02', distance: 45, isAccessible: true }, { from: 'gate_north', to: 'seat_a', distance: 60, isAccessible: true }],
    gate_south: [{ from: 'gate_south', to: 'rest_west', distance: 35, isAccessible: true }, { from: 'gate_south', to: 'conc_03', distance: 40, isAccessible: true }, { from: 'gate_south', to: 'seat_c', distance: 55, isAccessible: true }],
    gate_east:  [{ from: 'gate_east', to: 'rest_east', distance: 30, isAccessible: true }, { from: 'gate_east', to: 'seat_b', distance: 50, isAccessible: true }, { from: 'gate_east', to: 'conc_03', distance: 45, isAccessible: true }],
    gate_west:  [{ from: 'gate_west', to: 'conc_01', distance: 35, isAccessible: false }, { from: 'gate_west', to: 'rest_west', distance: 30, isAccessible: false }, { from: 'gate_west', to: 'seat_a', distance: 55, isAccessible: false }],
    conc_01:    [{ from: 'conc_01', to: 'gate_north', distance: 40, isAccessible: true }, { from: 'conc_01', to: 'seat_a', distance: 25, isAccessible: true }, { from: 'conc_01', to: 'gate_west', distance: 35, isAccessible: false }],
    conc_02:    [{ from: 'conc_02', to: 'gate_north', distance: 45, isAccessible: true }, { from: 'conc_02', to: 'seat_b', distance: 25, isAccessible: true }, { from: 'conc_02', to: 'rest_east', distance: 30, isAccessible: true }],
    conc_03:    [{ from: 'conc_03', to: 'gate_east', distance: 45, isAccessible: true }, { from: 'conc_03', to: 'seat_d', distance: 25, isAccessible: true }, { from: 'conc_03', to: 'gate_south', distance: 40, isAccessible: true }],
    rest_east:  [{ from: 'rest_east', to: 'gate_east', distance: 30, isAccessible: true }, { from: 'rest_east', to: 'conc_02', distance: 30, isAccessible: true }, { from: 'rest_east', to: 'seat_b', distance: 35, isAccessible: true }],
    rest_west:  [{ from: 'rest_west', to: 'gate_west', distance: 30, isAccessible: false }, { from: 'rest_west', to: 'gate_south', distance: 35, isAccessible: true }, { from: 'rest_west', to: 'seat_c', distance: 25, isAccessible: true }],
    seat_a:     [{ from: 'seat_a', to: 'conc_01', distance: 25, isAccessible: true }, { from: 'seat_a', to: 'stage', distance: 20, isAccessible: true }, { from: 'seat_a', to: 'seat_c', distance: 30, isAccessible: true }],
    seat_b:     [{ from: 'seat_b', to: 'conc_02', distance: 25, isAccessible: true }, { from: 'seat_b', to: 'stage', distance: 20, isAccessible: true }, { from: 'seat_b', to: 'seat_d', distance: 30, isAccessible: true }],
    seat_c:     [{ from: 'seat_c', to: 'rest_west', distance: 25, isAccessible: true }, { from: 'seat_c', to: 'stage', distance: 20, isAccessible: true }, { from: 'seat_c', to: 'seat_a', distance: 30, isAccessible: true }],
    seat_d:     [{ from: 'seat_d', to: 'conc_03', distance: 25, isAccessible: true }, { from: 'seat_d', to: 'stage', distance: 20, isAccessible: true }, { from: 'seat_d', to: 'seat_b', distance: 30, isAccessible: true }],
    stage:      [{ from: 'stage', to: 'seat_a', distance: 20, isAccessible: true }, { from: 'stage', to: 'seat_b', distance: 20, isAccessible: true }, { from: 'stage', to: 'seat_c', distance: 20, isAccessible: true }, { from: 'stage', to: 'seat_d', distance: 20, isAccessible: true }],
  },
};

const routingEngine = new RoutingEngine(venueGraph);

// Insight data from venue zones
const INSIGHTS = [
  { id: 'gate_west', label: 'West Gate', status: 'Congested', statusClass: 'congested', fillClass: 'high' },
  { id: 'conc_02', label: 'Cold Drinks', status: 'Optimal', statusClass: 'optimal', fillClass: 'low' },
  { id: 'rest_east', label: 'East Restrooms', status: 'Moderate', statusClass: 'moderate', fillClass: 'medium' },
  { id: 'seat_a', label: 'Section A', status: 'Congested', statusClass: 'congested', fillClass: 'high' },
  { id: 'conc_03', label: 'Pizza Station', status: 'Moderate', statusClass: 'moderate', fillClass: 'medium' },
];

const Dashboard: React.FC = React.memo(() => {
  const [mobilityFirst, setMobilityFirst] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [user, setUser] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [routeStart, setRouteStart] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<RouteResult | null>(null);

  const handleAuth = useCallback(async () => {
    const loggedInUser = await authenticateUser();
    setUser(loggedInUser);
  }, []);

  const handleZoneClick = useCallback((zoneId: string) => {
    setSelectedZone(zoneId);

    if (activeTab === 'route') {
      if (!routeStart) {
        setRouteStart(zoneId);
      } else if (routeStart !== zoneId) {
        const result = routingEngine.findRoute(routeStart, zoneId, mobilityFirst);
        setCurrentRoute(result);
        setRouteStart(null);
      }
    }
  }, [activeTab, routeStart, mobilityFirst]);

  const clearRoute = useCallback(() => {
    setCurrentRoute(null);
    setRouteStart(null);
    setSelectedZone(null);
  }, []);

  const handleApplySmartRoute = useCallback(() => {
    // AI suggests route from West Gate to Section C (avoids congestion)
    const result = routingEngine.findRoute('gate_west', 'seat_c', mobilityFirst);
    if (result) {
      setCurrentRoute(result);
      setActiveTab('route');
    }
  }, [mobilityFirst]);

  const routePath = useMemo(() => {
    if (!currentRoute) return [];
    return currentRoute.path.map(n => n.id);
  }, [currentRoute]);

  return (
    <div className={`app-container ${highContrast ? 'high-contrast' : ''}`}>
      {/* Sidebar Navigation */}
      <nav className="sidebar-nav">
        <div className="glass-card" role="menubar">
          <button
            className={`nav-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => { setActiveTab('explore'); clearRoute(); }}
            aria-label="View Venue Heatmap"
          >
            <Layers size={20} />
            <span className="nav-tooltip">Heatmap</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'route' ? 'active' : ''}`}
            onClick={() => { setActiveTab('route'); clearRoute(); }}
            aria-label="Smart Navigation"
          >
            <Navigation size={20} />
            <span className="nav-tooltip">Navigate</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
            aria-label="Facility Queues"
          >
            <MapPin size={20} />
            <span className="nav-tooltip">Facilities</span>
          </button>

          <div className="nav-separator" role="separator" />

          <button
            className={`nav-btn ${highContrast ? 'active' : ''}`}
            onClick={() => setHighContrast(!highContrast)}
            aria-label="Toggle High Contrast Mode"
          >
            <Accessibility size={20} />
            <span className="nav-tooltip">Contrast</span>
          </button>

          <div className="nav-separator" role="separator" />

          <button
            className={`nav-btn ${user ? 'active' : ''}`}
            onClick={handleAuth}
            aria-label="Login"
          >
            <LogIn size={20} />
            <span className="nav-tooltip">{user ? 'Logged In' : 'Login'}</span>
          </button>
        </div>
      </nav>

      {/* Interactive Venue Map */}
      <div className="venue-map-area">
        <VenueMap
          onZoneClick={handleZoneClick}
          selectedZone={selectedZone}
          routePath={routePath}
        />
      </div>

      {/* Top Header */}
      <header className="top-header">
        <div className="glass-card header-inner">
          <div className="header-brand">
            <div className="brand-icon">VF</div>
            <div>
              <h1 className="brand-title">VenueFlow Optimizer</h1>
              <p className="brand-subtitle">Real-time Coordination System</p>
            </div>
          </div>

          <div className="header-controls">
            {user && <span className="auth-badge">✓ Authenticated</span>}
            <div className="toggle-group">
              <span className="toggle-label">Mobility First</span>
              <button
                className={`toggle-switch ${mobilityFirst ? 'on' : ''}`}
                onClick={() => setMobilityFirst(!mobilityFirst)}
                aria-label="Toggle mobility-first routing"
                aria-pressed={mobilityFirst}
              >
                <div className="toggle-knob" />
              </button>
            </div>
            <button className="settings-btn" aria-label="Settings">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Right Panel */}
      <aside className="right-panel">
        {activeTab === 'explore' && (
          <div className="glass-card panel-card animate-fade-in">
            <h2 className="panel-title">Live Insights</h2>
            {INSIGHTS.map(item => (
              <div
                key={item.id}
                className="insight-item"
                onClick={() => {
                  setSelectedZone(item.id);
                }}
              >
                <div className="insight-header">
                  <span className="insight-label">{item.label}</span>
                  <span className={`insight-status ${item.statusClass}`}>{item.status}</span>
                </div>
                <div className="insight-bar">
                  <div className={`insight-bar-fill ${item.fillClass}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'route' && (
          <>
            {currentRoute ? (
              <SmartNav route={currentRoute} onClear={clearRoute} />
            ) : (
              <div className="glass-card panel-card animate-fade-in">
                <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={18} style={{ color: '#3b82f6' }} />
                  Smart Navigation
                </h2>
                <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                  {routeStart ? (
                    <>
                      <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginBottom: '8px' }}>
                        ● Start: {routeStart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      Click a <strong style={{ color: '#f8fafc' }}>destination zone</strong> on the map to calculate the optimal route.
                    </>
                  ) : (
                    <>
                      Click a <strong style={{ color: '#f8fafc' }}>starting zone</strong> on the venue map, then click a destination to find the optimal route.
                    </>
                  )}
                </div>
                {mobilityFirst && (
                  <div style={{
                    marginTop: '12px', padding: '8px 12px', borderRadius: '10px',
                    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                    fontSize: '11px', color: '#93c5fd',
                  }}>
                    ♿ Mobility-First mode: Only accessible paths will be used.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'queue' && (
          <VirtualQueue
            facilityId="conc_01"
            facilityName="Nitro Burgers & Shakes"
            userId={user?.uid || 'guest_' + Math.random().toString(36).slice(2, 6)}
          />
        )}
      </aside>

      {/* Smart AI Assistant */}
      <SmartAssistant congestionLevel={0.8} onApplyRoute={handleApplySmartRoute} />

      {/* Footer */}
      <footer className="bottom-footer">
        <div className="glass-card footer-inner">
          <div className="footer-status">
            <div className="status-dot" />
            <span>System Online</span>
          </div>
          <div className="footer-coords">Lat: 40.7588° N | Lng: 73.9851° W</div>
          <button className="footer-link" onClick={() => setActiveTab('explore')}>
            View Network Topology
          </button>
        </div>
      </footer>
    </div>
  );
});

export default Dashboard;
