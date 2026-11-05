import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { GraphRelationType, GraphTraversalStep, Movie } from '../../types'
import {
  Network,
  Play,
  RotateCcw,
  Sparkles,
  GitFork,
  ArrowRight,
  Layers,
  Search,
  Plus,
  Route,
} from 'lucide-react'
import { toast } from 'sonner'

export const GraphVisualizer: React.FC = () => {
  const { movieGraph, allMovies } = useApp()
  const [, setTrigger] = useState(0)

  const [startMovieId, setStartMovieId] = useState('demo-7') // Inception
  const [targetMovieId, setTargetMovieId] = useState('demo-9') // Dark Knight
  const [activeStep, setActiveStep] = useState<GraphTraversalStep | null>(null)
  const [traversalLogs, setTraversalLogs] = useState<GraphTraversalStep[]>([])
  const [isTraversing, setIsTraversing] = useState(false)
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([])
  const [shortestPathResult, setShortestPathResult] = useState<Movie[] | null>(null)

  const vertices = movieGraph.getAllVertices()
  const edges = movieGraph.getAllEdges()

  // Node position geometry for SVG circle layout
  const getNodePosition = (index: number, total: number) => {
    const radius = 210
    const centerX = 360
    const centerY = 260
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  }

  // Pre-calculate positions
  const nodePositions = React.useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    vertices.forEach((v, idx) => {
      map.set(v.id, getNodePosition(idx, vertices.length))
    })
    return map
  }, [vertices])

  // Run BFS using LinkedQueue
  const handleRunBFS = async () => {
    if (isTraversing) return
    setIsTraversing(true)
    setShortestPathResult(null)
    setTraversalLogs([])
    setHighlightedNodeIds([])

    const steps = movieGraph.runBFS(startMovieId)
    setTraversalLogs(steps)

    for (const step of steps) {
      setActiveStep(step)
      setHighlightedNodeIds([...step.visitedOrder])
      await new Promise((resolve) => setTimeout(resolve, 600))
    }

    setIsTraversing(false)
    toast.success(`BFS Traversal complete! Explored ${steps.length} connected movie nodes.`)
  }

  // Run DFS using Stack
  const handleRunDFS = async () => {
    if (isTraversing) return
    setIsTraversing(true)
    setShortestPathResult(null)
    setTraversalLogs([])
    setHighlightedNodeIds([])

    const steps = movieGraph.runDFS(startMovieId)
    setTraversalLogs(steps)

    for (const step of steps) {
      setActiveStep(step)
      setHighlightedNodeIds([...step.visitedOrder])
      await new Promise((resolve) => setTimeout(resolve, 600))
    }

    setIsTraversing(false)
    toast.success(`DFS Traversal complete! Explored ${steps.length} connected movie nodes.`)
  }

  // Find Shortest Path
  const handleFindShortestPath = () => {
    const res = movieGraph.findShortestPath(startMovieId, targetMovieId)
    if (res) {
      setShortestPathResult(res.path)
      setHighlightedNodeIds(res.path.map((m) => m.id))
      toast.success(
        `Found shortest path with ${res.path.length} hops: ${res.path.map((m) => m.title).join(' → ')}`
      )
    } else {
      toast.error('No connected path exists between these two movies.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Academic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              Graph (Adjacency List) — Movie Relationship Network
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Adjacency List
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            A non-linear network of vertices (<code className="text-purple-300">V</code>) connected by
            edges (<code className="text-purple-300">E</code>) representing cinematic relationships
            such as shared directors, cast members, franchises, and thematic moods.
            BFS explores level-by-level using our <strong>FIFO Queue</strong>, while DFS explores
            deep paths using our <strong>LIFO Stack</strong>.
          </p>
          <div className="p-3 rounded-xl bg-[#161828] border border-white/[0.06] text-xs text-gray-400">
            <strong className="text-white">Real-World Software Analogy:</strong> Social graphs (LinkedIn,
            Facebook), GPS route navigators, recommendation engines, and dependency analyzers.
          </div>
        </div>

        {/* Complexity Card */}
        <div className="p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Graph Complexities
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">BFS Traversal (with Queue):</span>
              <span className="font-mono font-bold text-emerald-400">O(V + E)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">DFS Traversal (with Stack):</span>
              <span className="font-mono font-bold text-emerald-400">O(V + E)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Shortest Path (Unweighted):</span>
              <span className="font-mono font-bold text-indigo-400">O(V + E)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Add Edge / Vertex:</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-400">Space Complexity:</span>
              <span className="font-mono font-bold text-purple-400">O(V + E)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-4 rounded-2xl bg-[#131422] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Start vertex */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Source:</span>
            <select
              value={startMovieId}
              onChange={(e) => setStartMovieId(e.target.value)}
              className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs max-w-[140px]"
            >
              {vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>

          {/* Target vertex for shortest path */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Target:</span>
            <select
              value={targetMovieId}
              onChange={(e) => setTargetMovieId(e.target.value)}
              className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs max-w-[140px]"
            >
              {vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunBFS}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-glow-sm disabled:opacity-50 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Run BFS (Queue O(V+E))
          </button>

          <button
            onClick={handleRunDFS}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-semibold disabled:opacity-50 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-300" />
            Run DFS (Stack O(V+E))
          </button>

          <button
            onClick={handleFindShortestPath}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold transition-all"
          >
            <Route className="w-3.5 h-3.5" />
            Shortest Path
          </button>
        </div>

        <button
          onClick={() => {
            setHighlightedNodeIds([])
            setActiveStep(null)
            setTraversalLogs([])
            setShortestPathResult(null)
            toast.info('Graph highlights cleared.')
          }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Visual Canvas: SVG Circular Adjacency Network */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Graph Network (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0c0d16] border border-white/10 flex flex-col items-center justify-center overflow-x-auto min-h-[540px]">
          <svg width="720" height="520" className="select-none">
            {/* Edges */}
            {edges.map((edge) => {
              const p1 = nodePositions.get(edge.source)
              const p2 = nodePositions.get(edge.target)
              if (!p1 || !p2) return null

              const isPathEdge =
                shortestPathResult &&
                shortestPathResult.some((m, idx) => {
                  const nextM = shortestPathResult[idx + 1]
                  return (
                    nextM &&
                    ((m.id === edge.source && nextM.id === edge.target) ||
                      (m.id === edge.target && nextM.id === edge.source))
                  )
                })

              return (
                <g key={edge.id}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isPathEdge ? '#10b981' : '#2d3748'}
                    strokeWidth={isPathEdge ? '3.5' : '1.5'}
                    strokeDasharray={isPathEdge ? 'none' : '2,2'}
                  />
                  {/* Midpoint Label for edge */}
                  <text
                    x={(p1.x + p2.x) / 2}
                    y={(p1.y + p2.y) / 2 - 4}
                    fill={isPathEdge ? '#34d399' : '#6b7280'}
                    fontSize="8"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {edge.label}
                  </text>
                </g>
              )
            })}

            {/* Vertices */}
            {vertices.map((v) => {
              const pos = nodePositions.get(v.id)
              if (!pos) return null

              const isCurrent = activeStep?.currentVertexId === v.id
              const isVisited = highlightedNodeIds.includes(v.id)
              const isStart = startMovieId === v.id
              const isTarget = targetMovieId === v.id

              return (
                <g
                  key={v.id}
                  onClick={() => setStartMovieId(v.id)}
                  className="cursor-pointer transition-all duration-300"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isCurrent ? '26' : isVisited ? '22' : '19'}
                    className={`${
                      isCurrent
                        ? 'fill-purple-600 stroke-white stroke-2 animate-pulse'
                        : isVisited
                        ? 'fill-emerald-600 stroke-emerald-300 stroke-2'
                        : isStart
                        ? 'fill-indigo-600 stroke-indigo-400 stroke-2'
                        : isTarget
                        ? 'fill-rose-600 stroke-rose-400 stroke-2'
                        : 'fill-[#17192a] stroke-white/20 hover:stroke-purple-400'
                    }`}
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="9"
                    fontWeight="bold"
                    fill="white"
                  >
                    {v.title.slice(0, 5)}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 32}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#9ca3af"
                    className="font-medium"
                  >
                    {v.title.slice(0, 11)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Right: Traversal Trace & Queue/Stack Inspector (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#12131f] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Live DSA State
            </span>
            <span className="text-xs font-mono text-purple-400">
              V: {vertices.length} | E: {edges.length}
            </span>
          </div>

          {/* Current Traversal Step State */}
          {activeStep ? (
            <div className="p-3.5 rounded-xl bg-[#17192a] border border-purple-500/30 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-purple-300 font-bold">
                <span>Step #{activeStep.stepIndex}</span>
                <span>Active: {activeStep.currentVertexId}</span>
              </div>
              <p className="text-gray-300 text-[11px] font-sans">{activeStep.logMessage}</p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-white/10">
                Data Structure Buffer (Queue/Stack):{' '}
                <span className="text-emerald-400">[{activeStep.dataStructureState.join(', ') || 'Empty'}]</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic p-3 rounded-xl bg-[#17192a]">
              Click "Run BFS" or "Run DFS" to see live queue/stack snapshots.
            </p>
          )}

          {/* Adjacency List for Selected Source */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Adjacency List for "{movieGraph.getVertex(startMovieId)?.title}"
            </span>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {movieGraph.getNeighbors(startMovieId).map((n) => {
                const neighborMovie = movieGraph.getVertex(n.targetId)
                if (!neighborMovie) return null
                return (
                  <div
                    key={n.targetId}
                    className="p-2 rounded-xl bg-[#171929] border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-white">{neighborMovie.title}</span>
                    <span className="text-[10px] text-purple-400 font-mono px-2 py-0.5 rounded bg-purple-500/10">
                      {n.edge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
