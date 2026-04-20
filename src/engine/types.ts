export interface VenueNode {
  id: string;
  lat: number;
  lng: number;
  isAccessible: boolean;
  type: 'gate' | 'concession' | 'restroom' | 'seat_block' | 'waypoint';
  congestion: number; // 0.0 to 1.0
}

export interface VenueEdge {
  from: string;
  to: string;
  distance: number;
  isAccessible: boolean;
}

export interface VenueGraph {
  nodes: Record<string, VenueNode>;
  edges: Record<string, VenueEdge[]>;
}

export interface RouteResult {
  path: VenueNode[];
  totalDistance: number;
  estimatedTime: number; // in seconds
  averageCongestion: number;
}
