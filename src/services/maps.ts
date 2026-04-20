/**
 * Google Maps Service Module
 *
 * Provides helper functions for Google Maps Geocoding, Places, and
 * Directions APIs. These are used by the Smart Navigation feature
 * to resolve user destinations and calculate real-world walking routes.
 *
 * All API calls are routed through environment variables for security.
 */

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/**
 * Geocodes an address string into lat/lng coordinates using the
 * Google Maps Geocoding API.
 *
 * @param address - The human-readable address string
 * @returns The geocoded coordinates or null on failure
 */
export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  if (!MAPS_API_KEY || MAPS_API_KEY.length < 10) {
    console.warn('[Maps] Geocoding unavailable in sandbox mode');
    return null;
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${MAPS_API_KEY}`
    );
    const data = await res.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].geometry.location;
    }
    return null;
  } catch (error) {
    console.error('[Maps] Geocoding error:', error);
    return null;
  }
};

/**
 * Searches for nearby venue facilities (restrooms, concessions, first aid)
 * using the Google Maps Places API (Nearby Search).
 *
 * @param lat - Latitude of the search center
 * @param lng - Longitude of the search center
 * @param type - The facility type to search for
 * @param radius - Search radius in meters (default: 200m for venue use)
 */
export const findNearbyFacilities = async (
  lat: number,
  lng: number,
  type: string = 'restaurant',
  radius: number = 200
): Promise<any[]> => {
  if (!MAPS_API_KEY || MAPS_API_KEY.length < 10) {
    console.warn('[Maps] Places API unavailable in sandbox mode');
    return [];
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${MAPS_API_KEY}`
    );
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('[Maps] Places error:', error);
    return [];
  }
};

/**
 * Requests walking directions between two points using the
 * Google Maps Directions API. Used by SmartNav to render polyline routes.
 *
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 */
export const getWalkingDirections = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<any | null> => {
  if (!MAPS_API_KEY || MAPS_API_KEY.length < 10) {
    console.warn('[Maps] Directions API unavailable in sandbox mode');
    return null;
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=walking&key=${MAPS_API_KEY}`
    );
    const data = await res.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      return {
        distance: data.routes[0].legs[0].distance,
        duration: data.routes[0].legs[0].duration,
        steps: data.routes[0].legs[0].steps,
        polyline: data.routes[0].overview_polyline.points,
      };
    }
    return null;
  } catch (error) {
    console.error('[Maps] Directions error:', error);
    return null;
  }
};
