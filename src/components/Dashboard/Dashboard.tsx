import React, { useState, useCallback, useMemo } from 'react';
import VenueMap from '../Map/VenueMap';
import VirtualQueue from '../Queue/VirtualQueue';
import SmartAssistant from '../Assistant/SmartAssistant';
import { Navigation, Accessibility, Layers, Settings, MapPin, LogIn, UploadCloud } from 'lucide-react';
import { authenticateUser, uploadDiagnosticLog, analytics } from '../../services/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * Main Dashboard Component for VenueFlow Optimizer
 * @component
 * @returns {React.ReactElement} The rendered dashboard interface
 */
const Dashboard: React.FC = React.memo(() => {
  const [mobilityFirst, setMobilityFirst] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [user, setUser] = useState<any>(null);

  // Efficiency: useCallback for event handlers
  const handleAuth = useCallback(async () => {
    const loggedInUser = await authenticateUser();
    setUser(loggedInUser);
    if (analytics) logEvent(analytics, 'user_authenticated');
  }, []);

  const handleStorageUpload = useCallback(async () => {
    const blob = new Blob(["diagnostic data"], { type: 'text/plain' });
    await uploadDiagnosticLog(blob, `log-${Date.now()}.txt`);
    alert("Log uploaded to Google Cloud Storage successfully!");
  }, []);

  // Efficiency: useMemo for derived data
  const mockCoords = useMemo(() => [
    { lat: 40.7588, lng: -73.9851 },
    { lat: 40.7589, lng: -73.9852 },
    { lat: 40.7590, lng: -73.9853 },
  ], []);

  const heatmapData = useMemo(() => {
    return typeof google !== 'undefined' 
      ? mockCoords.map(c => new google.maps.LatLng(c.lat, c.lng)) 
      : [];
  }, [mockCoords]);

  return (
    <div className={`app-container ${highContrast ? 'high-contrast' : ''}`}>
      {/* Sidebar Navigation */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        <div className="glass-card p-3 flex flex-col gap-4" role="menubar">
          <NavItem active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={<Layers size={22} />} label="Heatmap" ariaLabel="View Venue Heatmap" />
          <NavItem active={activeTab === 'route'} onClick={() => setActiveTab('route')} icon={<Navigation size={22} />} label="Navigate" ariaLabel="Smart Navigation" />
          <NavItem active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon={<MapPin size={22} />} label="Facilities" ariaLabel="Facility Queues" />
          <div className="w-full h-px bg-white/10 my-2" role="separator" />
          <NavItem active={false} onClick={() => setHighContrast(!highContrast)} icon={<Accessibility size={22} />} label="Contrast" ariaLabel="Toggle High Contrast Mode" />
          <div className="w-full h-px bg-white/10 my-2" role="separator" />
          <NavItem active={!!user} onClick={handleAuth} icon={<LogIn size={22} />} label="Auth" ariaLabel="Google Auth Login" />
          <NavItem active={false} onClick={handleStorageUpload} icon={<UploadCloud size={22} />} label="Upload" ariaLabel="Cloud Storage Upload" />
        </div>
      </nav>

      {/* Main Map */}
      <div className="heatmap-container">
        <VenueMap heatmapData={heatmapData} />
      </div>

      {/* Top Header Overlay */}
      <header className="fixed top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-20 overlay-ui">
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">VF</div>
            <div>
              <h1 className="text-lg font-bold leading-tight">VenueFlow Optimizer</h1>
              <p className="text-xs text-blue-400 font-medium">Real-time Coordination System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {user && <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">Authenticated</span>}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400" id="mobility-label">MOBILITY FIRST</span>
              <button 
                onClick={() => setMobilityFirst(!mobilityFirst)}
                aria-labelledby="mobility-label"
                aria-pressed={mobilityFirst}
                className={`w-12 h-6 rounded-full transition-colors relative ${mobilityFirst ? 'bg-blue-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${mobilityFirst ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <button aria-label="Settings" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Right Panel - Dynamic Content */}
      <aside className="fixed right-8 top-32 w-80 z-20 overlay-ui flex flex-col gap-4">
        {activeTab === 'explore' && (
          <div className="glass-card p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Live Insights</h2>
            <div className="space-y-4">
              <InsightItem label="Main Entrance" status="Congested" color="text-rose-400" value="High" />
              <InsightItem label="Concession A" status="Optimal" color="text-emerald-400" value="Low" />
              <InsightItem label="East Restrooms" status="Moderate" color="text-amber-400" value="Medium" />
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <VirtualQueue facilityId="conc_01" facilityName="Nitro Burgers & Shakes" userId={user?.uid || "guest_123"} />
        )}
      </aside>

      {/* Smart AI Assistant */}
      <SmartAssistant congestionLevel={0.8} />

      {/* Footer Info */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 overlay-ui">
        <div className="glass-card px-6 py-3 flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="font-medium">System Online</span>
          </div>
          <div className="text-gray-400">Lat: 40.7588° N | Lng: 73.9851° W</div>
          <div className="text-blue-400 font-semibold cursor-pointer">View Network Topology</div>
        </div>
      </footer>
    </div>
  );
});

/**
 * Navigation Item Component
 */
const NavItem = React.memo(({ active, icon, label, onClick, ariaLabel }: any) => (
  <button 
    onClick={onClick}
    aria-label={ariaLabel || label}
    aria-pressed={active}
    role="tab"
    className={`p-3 rounded-xl flex items-center justify-center transition-all relative group focus:outline-none focus:ring-2 focus:ring-blue-400 ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
  >
    {icon}
    <div className="absolute left-full ml-4 px-2 py-1 rounded bg-black/80 text-white text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none" aria-hidden="true">
      {label}
    </div>
  </button>
));

/**
 * Insight Status Item Component
 */
const InsightItem = React.memo(({ label, status, color, value }: any) => (
  <div className="p-3 rounded-xl bg-white/5 border border-white/5" role="status" aria-live="polite">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-[10px] font-bold uppercase ${color}`}>{status}</span>
    </div>
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden" aria-hidden="true">
      <div className={`h-full rounded-full ${color.replace('text', 'bg')}`} style={{ width: value === 'High' ? '85%' : value === 'Medium' ? '45%' : '15%' }} />
    </div>
  </div>
));

export default Dashboard;
