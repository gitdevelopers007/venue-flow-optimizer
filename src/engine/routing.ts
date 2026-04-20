import { VenueGraph, VenueNode, RouteResult } from './types';

export class RoutingEngine {
  private graph: VenueGraph;
  private CONGESTION_MULTIPLIER = 5.0; // Significant penalty for high congestion

  constructor(graph: VenueGraph) {
    this.graph = graph;
  }

  /**
   * Calculates the optimal route between two points using A*.
   * @param startNodeId 
   * @param endNodeId 
   * @param mobilityFirst If true, only uses ADA-compliant paths.
   */
  public findRoute(
    startNodeId: string,
    endNodeId: string,
    mobilityFirst: boolean = false
  ): RouteResult | null {
    const startNode = this.graph.nodes[startNodeId];
    const endNode = this.graph.nodes[endNodeId];

    if (!startNode || !endNode) return null;

    const openSet: string[] = [startNodeId];
    const cameFrom: Record<string, string> = {};

    const gScore: Record<string, number> = {};
    const fScore: Record<string, number> = {};

    Object.keys(this.graph.nodes).forEach((id) => {
      gScore[id] = Infinity;
      fScore[id] = Infinity;
    });

    gScore[startNodeId] = 0;
    fScore[startNodeId] = this.heuristic(startNode, endNode);

    while (openSet.length > 0) {
      // Sort openSet to get the node with the lowest fScore
      openSet.sort((a, b) => fScore[a] - fScore[b]);
      const currentId = openSet.shift()!;

      if (currentId === endNodeId) {
        return this.reconstructPath(cameFrom, currentId);
      }

      const neighbors = this.graph.edges[currentId] || [];

      for (const edge of neighbors) {
        // Accessibility check
        if (mobilityFirst && !edge.isAccessible) continue;

        const neighbor = this.graph.nodes[edge.to];
        
        // Calculate cost with dynamic congestion multiplier
        const congestionPenalty = 1 + (neighbor.congestion * this.CONGESTION_MULTIPLIER);
        const tentativeGScore = gScore[currentId] + (edge.distance * congestionPenalty);

        if (tentativeGScore < gScore[edge.to]) {
          cameFrom[edge.to] = currentId;
          gScore[edge.to] = tentativeGScore;
          fScore[edge.to] = gScore[edge.to] + this.heuristic(neighbor, endNode);

          if (!openSet.includes(edge.to)) {
            openSet.push(edge.to);
          }
        }
      }
    }

    return null;
  }

  /**
   * Simple Euclidean distance heuristic (in a real map, use Haversine if long distance)
   */
  private heuristic(a: VenueNode, b: VenueNode): number {
    const dx = a.lat - b.lat;
    const dy = a.lng - b.lng;
    return Math.sqrt(dx * dx + dy * dy) * 111320; // Rough approx to meters
  }

  private reconstructPath(cameFrom: Record<string, string>, currentId: string): RouteResult {
    const path: VenueNode[] = [];
    let totalDistance = 0;
    let totalCongestion = 0;

    let curr = currentId;
    while (curr) {
      const node = this.graph.nodes[curr];
      path.unshift(node);
      totalCongestion += node.congestion;

      const prevId = cameFrom[curr];
      if (prevId) {
        const edge = this.graph.edges[prevId].find((e) => e.to === curr);
        if (edge) totalDistance += edge.distance;
      }
      curr = prevId;
    }

    return {
      path,
      totalDistance,
      estimatedTime: (totalDistance / 1.4) * (1 + (totalCongestion / path.length)), // 1.4 m/s average walk speed
      averageCongestion: totalCongestion / path.length,
    };
  }
}
