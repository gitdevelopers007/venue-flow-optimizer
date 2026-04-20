import { describe, it, expect } from 'vitest';
import { RoutingEngine } from '../engine/routing';
import type { VenueGraph } from '../engine/types';

describe('RoutingEngine - Predictive Load Balancing', () => {
  const mockGraph: VenueGraph = {
    nodes: {
      'GateA': { id: 'GateA', lat: 0, lng: 0, isAccessible: true, type: 'gate', congestion: 0 },
      'Waypoint1': { id: 'Waypoint1', lat: 0.0001, lng: 0.0001, isAccessible: true, type: 'waypoint', congestion: 0.8 }, // Heavy congestion
      'Waypoint2': { id: 'Waypoint2', lat: 0.0001, lng: -0.0001, isAccessible: true, type: 'waypoint', congestion: 0.1 }, // Clear path
      'SeatBlock': { id: 'SeatBlock', lat: 0.0002, lng: 0, isAccessible: true, type: 'seat_block', congestion: 0 },
      'Stairs': { id: 'Stairs', lat: 0.0001, lng: 0, isAccessible: false, type: 'waypoint', congestion: 1.0 }, // Maximum congestion
    },
    edges: {
      'GateA': [
        { from: 'GateA', to: 'Waypoint1', distance: 10, isAccessible: true },
        { from: 'GateA', to: 'Waypoint2', distance: 15, isAccessible: true },
        { from: 'GateA', to: 'Stairs', distance: 5, isAccessible: false },
      ],
      'Waypoint1': [{ from: 'Waypoint1', to: 'SeatBlock', distance: 10, isAccessible: true }],
      'Waypoint2': [{ from: 'Waypoint2', to: 'SeatBlock', distance: 10, isAccessible: true }],
      'Stairs': [{ from: 'Stairs', to: 'SeatBlock', distance: 5, isAccessible: false }],
    }
  };

  const engine = new RoutingEngine(mockGraph);

  it('should redirect users away from high congestion (Waypoint1) even if the path is longer (Waypoint2)', () => {
    const route = engine.findRoute('GateA', 'SeatBlock', false);
    expect(route).not.toBeNull();
    // Path through Waypoint2 (total dist 25) should be chosen over Waypoint1 (total dist 20) 
    // because Waypoint1 has 0.8 congestion which adds a massive multiplier.
    expect(route?.path.map(n => n.id)).toContain('Waypoint2');
    expect(route?.path.map(n => n.id)).not.toContain('Waypoint1');
  });

  it('should exclusively use ADA-compliant paths when mobilityFirst is enabled', () => {
    const route = engine.findRoute('GateA', 'SeatBlock', true);
    expect(route).not.toBeNull();
    // Should NOT use 'Stairs' even though it's the shortest physical distance
    expect(route?.path.map(n => n.id)).not.toContain('Stairs');
    route?.path.forEach(node => {
      expect(node.isAccessible).toBe(true);
    });
  });

  it('should return null if no accessible path exists', () => {
    // Modify graph to block all accessible paths
    const blockedGraph: VenueGraph = {
      ...mockGraph,
      edges: {
        'GateA': [{ from: 'GateA', to: 'Stairs', distance: 5, isAccessible: false }]
      }
    };
    const blockedEngine = new RoutingEngine(blockedGraph);
    const route = blockedEngine.findRoute('GateA', 'SeatBlock', true);
    expect(route).toBeNull();
  });
});
