import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, HeatmapLayer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const center = {
  lat: 40.7588, // Example: Madison Square Garden
  lng: -73.9851
};

const mapOptions = {
  disableDefaultUI: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    // ... more dark theme styles
  ]
};

interface MapProps {
  heatmapData: google.maps.LatLng[];
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
}

const VenueMap: React.FC<MapProps> = ({ heatmapData, onMapClick }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ['visualization']
  });

  const [_map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const hasValidKey = apiKey.length > 10 && apiKey !== "your_google_maps_api_key_here";

  if (!hasValidKey) {
    return (
      <div className="w-full h-screen bg-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
        {/* Cool Grid Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Radar Sweep Animation */}
        <div className="absolute w-[600px] h-[600px] border border-blue-500/30 rounded-full flex items-center justify-center">
          <div className="w-[400px] h-[400px] border border-blue-500/20 rounded-full flex items-center justify-center">
             <div className="w-[200px] h-[200px] border border-blue-500/10 rounded-full relative">
                <div className="absolute top-1/2 left-1/2 w-full h-1 bg-gradient-to-r from-transparent to-blue-500 origin-left animate-[spin_4s_linear_infinite]" />
             </div>
          </div>
        </div>
        <div className="relative z-10 glass-card p-6 text-center border-blue-500/50">
          <h2 className="text-xl font-bold text-blue-400 mb-2">Neural Map Simulator Active</h2>
          <p className="text-sm text-gray-400">Live map is in sandbox mode (Missing API Key).</p>
          <p className="text-xs text-emerald-400 mt-2">Routing Engine: ONLINE • Sensors: ACTIVE</p>
        </div>
      </div>
    );
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={17}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
      onClick={onMapClick}
    >
      <HeatmapLayer
        data={heatmapData}
        options={{
          radius: 20,
          opacity: 0.6,
        }}
      />
    </GoogleMap>
  ) : <div className="w-full h-screen bg-[#0a0a0c] flex flex-col items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div><div className="text-blue-400 font-bold tracking-widest text-sm">INITIALIZING NEURAL MAP...</div></div>;
};

export default React.memo(VenueMap);
