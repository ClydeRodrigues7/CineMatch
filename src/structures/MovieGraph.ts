import { GraphEdge, GraphRelationType, GraphTraversalStep, Movie } from '../types'
import { LinkedQueue } from './Queue'
import { Stack } from './Stack'

// Real Adjacency-List Graph Representation for Movie Relationship Explorer
// Implements BFS (via LinkedQueue) and DFS (via Stack) with educational step tracking.

export interface GraphNeighbor {
  targetId: string
  edge: GraphEdge
}

export class MovieGraph {
  private vertices: Map<string, Movie> = new Map()
  private adjacencyList: Map<string, GraphNeighbor[]> = new Map()

  constructor() {}

  // Add vertex: O(1)
  addVertex(movie: Movie): void {
    if (!this.vertices.has(movie.id)) {
      this.vertices.set(movie.id, movie)
      this.adjacencyList.set(movie.id, [])
    }
  }

  // Add undirected edge: O(1)
  addEdge(
    sourceId: string,
    targetId: string,
    relationType: GraphRelationType,
    weight = 1,
    label = 'Related',
    reason = 'Shared cinematic qualities'
  ): void {
    if (!this.vertices.has(sourceId) || !this.vertices.has(targetId)) return
    if (sourceId === targetId) return

    const sourceNeighbors = this.adjacencyList.get(sourceId) || []
    const targetNeighbors = this.adjacencyList.get(targetId) || []

    // Prevent duplicate edges
    if (!sourceNeighbors.some((n) => n.targetId === targetId)) {
      const edgeForward: GraphEdge = {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        relationType,
        weight,
        label,
        reason,
      }
      sourceNeighbors.push({ targetId, edge: edgeForward })
      this.adjacencyList.set(sourceId, sourceNeighbors)
    }

    if (!targetNeighbors.some((n) => n.targetId === sourceId)) {
      const edgeBackward: GraphEdge = {
        id: `${targetId}-${sourceId}`,
        source: targetId,
        target: sourceId,
        relationType,
        weight,
        label,
        reason,
      }
      targetNeighbors.push({ targetId: sourceId, edge: edgeBackward })
      this.adjacencyList.set(targetId, targetNeighbors)
    }
  }

  // Remove undirected edge: O(deg(V))
  removeEdge(sourceId: string, targetId: string): void {
    const sList = this.adjacencyList.get(sourceId)
    if (sList) {
      this.adjacencyList.set(
        sourceId,
        sList.filter((n) => n.targetId !== targetId)
      )
    }

    const tList = this.adjacencyList.get(targetId)
    if (tList) {
      this.adjacencyList.set(
        targetId,
        tList.filter((n) => n.targetId !== sourceId)
      )
    }
  }

  getVertex(id: string): Movie | undefined {
    return this.vertices.get(id)
  }

  getNeighbors(id: string): GraphNeighbor[] {
    return this.adjacencyList.get(id) || []
  }

  getAllVertices(): Movie[] {
    return Array.from(this.vertices.values())
  }

  getAllEdges(): GraphEdge[] {
    const edges: GraphEdge[] = []
    const seen = new Set<string>()

    for (const [, neighbors] of this.adjacencyList.entries()) {
      for (const n of neighbors) {
        const pairKey = [n.edge.source, n.edge.target].sort().join('--')
        if (!seen.has(pairKey)) {
          seen.add(pairKey)
          edges.push(n.edge)
        }
      }
    }

    return edges
  }

  get vertexCount(): number {
    return this.vertices.size
  }

  get edgeCount(): number {
    return this.getAllEdges().length
  }

  // Breadth-First Search (BFS) using explicit LinkedQueue
  // Complexity: O(V + E)
  runBFS(startId: string): GraphTraversalStep[] {
    const steps: GraphTraversalStep[] = []
    if (!this.vertices.has(startId)) return steps

    const visited = new Set<string>()
    const queue = new LinkedQueue<string>()

    visited.add(startId)
    queue.enqueue(startId)

    const visitedOrder: string[] = []
    let stepCount = 0

    while (!queue.isEmpty()) {
      const currentId = queue.dequeue()!
      visitedOrder.push(currentId)
      stepCount++

      const currentMovie = this.vertices.get(currentId)!
      const neighbors = this.adjacencyList.get(currentId) || []
      const newlyDiscovered: string[] = []

      for (const n of neighbors) {
        if (!visited.has(n.targetId)) {
          visited.add(n.targetId)
          queue.enqueue(n.targetId)
          newlyDiscovered.push(n.targetId)
        }
      }

      steps.push({
        stepIndex: stepCount,
        currentVertexId: currentId,
        visitedOrder: [...visitedOrder],
        dataStructureState: queue.toArray(),
        discoveredNeighbors: newlyDiscovered,
        logMessage: `[BFS] Visited "${currentMovie.title}". Enqueued ${newlyDiscovered.length} unvisited neighbor(s). Queue state: [${queue.toArray().join(', ')}].`,
      })
    }

    return steps
  }

  // Depth-First Search (DFS) using explicit Stack
  // Complexity: O(V + E)
  runDFS(startId: string): GraphTraversalStep[] {
    const steps: GraphTraversalStep[] = []
    if (!this.vertices.has(startId)) return steps

    const visited = new Set<string>()
    const stack = new Stack<string>()

    stack.push(startId)
    const visitedOrder: string[] = []
    let stepCount = 0

    while (!stack.isEmpty()) {
      const currentId = stack.pop()!

      if (!visited.has(currentId)) {
        visited.add(currentId)
        visitedOrder.push(currentId)
        stepCount++

        const currentMovie = this.vertices.get(currentId)!
        const neighbors = this.adjacencyList.get(currentId) || []
        const newlyDiscovered: string[] = []

        // Reverse neighbor push so order is consistent
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const n = neighbors[i]
          if (!visited.has(n.targetId)) {
            stack.push(n.targetId)
            newlyDiscovered.push(n.targetId)
          }
        }

        steps.push({
          stepIndex: stepCount,
          currentVertexId: currentId,
          visitedOrder: [...visitedOrder],
          dataStructureState: stack.toLifoArray(),
          discoveredNeighbors: newlyDiscovered,
          logMessage: `[DFS] Explored "${currentMovie.title}". Pushed ${newlyDiscovered.length} unvisited neighbor(s) onto stack. Stack (top to bottom): [${stack.toLifoArray().join(', ')}].`,
        })
      }
    }

    return steps
  }

  // Shortest path between two movies using unweighted BFS
  findShortestPath(
    startId: string,
    targetId: string
  ): { path: Movie[]; edges: GraphEdge[] } | null {
    if (!this.vertices.has(startId) || !this.vertices.has(targetId)) return null
    if (startId === targetId) {
      return { path: [this.vertices.get(startId)!], edges: [] }
    }

    const queue = new LinkedQueue<string>()
    const visited = new Set<string>()
    const parentMap = new Map<string, { parentId: string; edge: GraphEdge }>()

    visited.add(startId)
    queue.enqueue(startId)

    let found = false
    while (!queue.isEmpty()) {
      const curr = queue.dequeue()!
      if (curr === targetId) {
        found = true
        break
      }

      const neighbors = this.adjacencyList.get(curr) || []
      for (const n of neighbors) {
        if (!visited.has(n.targetId)) {
          visited.add(n.targetId)
          parentMap.set(n.targetId, { parentId: curr, edge: n.edge })
          queue.enqueue(n.targetId)
        }
      }
    }

    if (!found) return null

    // Reconstruct path
    const path: Movie[] = []
    const edges: GraphEdge[] = []
    let curr: string | undefined = targetId

    while (curr && curr !== startId) {
      path.unshift(this.vertices.get(curr)!)
      const step = parentMap.get(curr)
      if (step) {
        edges.unshift(step.edge)
        curr = step.parentId
      } else {
        break
      }
    }
    path.unshift(this.vertices.get(startId)!)

    return { path, edges }
  }

  clear(): void {
    this.vertices.clear()
    this.adjacencyList.clear()
  }
}
