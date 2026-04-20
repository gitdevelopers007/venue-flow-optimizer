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

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

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
  ) : <div className="loading">Initializing Neural Map...</div>;
};

export default React.memo(VenueMap);
