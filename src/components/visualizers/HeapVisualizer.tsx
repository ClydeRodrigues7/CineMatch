import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { HeapItem, HeapMode, HeapTraceStep, MoodId } from '../../types'
import {
  Activity,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Layers,
  TreeDeciduous,
} from 'lucide-react'
import { toast } from 'sonner'

export const HeapVisualizer: React.FC = () => {
  const { maxHeap, rebuildHeap, allMovies } = useApp()
  const [mode, setMode] = useState<HeapMode>('RATING')
  const [selectedMood, setSelectedMood] = useState<MoodId>('mind-bending')
  const [selectedMovieToAdd, setSelectedMovieToAdd] = useState(allMovies[0]?.id || '')
  const [traceLogs, setTraceLogs] = useState<HeapTraceStep[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [highlightIndices, setHighlightIndices] = useState<number[]>([])

  const heapArray = maxHeap.getArray()

  // Switch Heap Mode
  const handleModeChange = (newMode: HeapMode) => {
    setMode(newMode)
    rebuildHeap(newMode, newMode === 'MOOD_MATCH' ? selectedMood : undefined)
    setTraceLogs([])
    setHighlightIndices([])
    toast.success(`Max-Heap rebuilt using ${newMode === 'RATING' ? 'IMDb/TMDB Ratings' : 'Transparent Mood-Match Scoring'}.`)
  }

  // Switch Mood in Mood-Match Mode
  const handleMoodSelectChange = (newMood: MoodId) => {
    setSelectedMood(newMood)
    if (mode === 'MOOD_MATCH') {
      rebuildHeap('MOOD_MATCH', newMood)
      setTraceLogs([])
      setHighlightIndices([])
    }
  }

  // Insert item with animated Sift-Up
  const handleInsert = async () => {
    const movie = allMovies.find((m) => m.id === selectedMovieToAdd)
    if (!movie) return

    const priority = mode === 'RATING' ? movie.voteAverage : Math.round(movie.voteAverage * 10)
    const newItem: HeapItem = {
      id: `${movie.id}-${Date.now()}`,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.posterPath,
      priority,
    }

    const steps = maxHeap.insert(newItem)
    setTraceLogs(steps)

    if (steps.length > 0) {
      setIsAnimating(true)
      for (const step of steps) {
        setHighlightIndices([...step.indices])
        await new Promise((resolve) => setTimeout(resolve, 550))
      }
      setIsAnimating(false)
    }

    toast.success(`Inserted "${movie.title}" (Priority ${priority}). Sift-up restored max-heap property.`)
  }

  // Extract Max with animated Sift-Down
  const handleExtractMax = async () => {
    if (maxHeap.isEmpty()) {
      toast.error('Heap is empty; cannot extract root.')
      return
    }

    const { item, trace } = maxHeap.extractMax()
    setTraceLogs(trace)

    if (trace.length > 0) {
      setIsAnimating(true)
      for (const step of trace) {
        setHighlightIndices([...step.indices])
        await new Promise((resolve) => setTimeout(resolve, 550))
      }
      setIsAnimating(false)
    }

    if (item) {
      toast.success(`[Extract Max]: Retrieved "${item.title}" with maximum priority (${item.priority}).`)
    }
  }

  const handleReset = () => {
    rebuildHeap(mode, mode === 'MOOD_MATCH' ? selectedMood : undefined)
    setTraceLogs([])
    setHighlightIndices([])
    toast.info('Max-Heap reset to baseline.')
  }

  // Coordinates calculation for binary tree SVG
  const calculateNodePosition = (index: number, total: number) => {
    const level = Math.floor(Math.log2(index + 1))
    const itemsInLevel = Math.pow(2, level)
    const positionInLevel = index - (itemsInLevel - 1)

    const width = 640
    const xStep = width / (itemsInLevel + 1)
    const x = xStep * (positionInLevel + 1)
    const y = 40 + level * 75

    return { x, y, level }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Academic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Binary Max-Heap — Top-Rated & Mood Match Ranking
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Priority Queue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            A complete binary tree maintained in a contiguous array where every parent node has a
            priority greater than or equal to its children (<code className="text-amber-400">arr[parent] ≥ arr[child]</code>).
            The root (<code className="text-amber-400">arr[0]</code>) always holds the maximum priority.
            Unlike a sorted array which takes <strong className="text-rose-400">O(n)</strong> to insert,
            a binary heap inserts and extracts in logarithmic time <strong className="text-emerald-400">O(log n)</strong>.
          </p>
          <div className="p-3 rounded-xl bg-[#161828] border border-white/[0.06] text-xs text-gray-400">
            <strong className="text-white">Real-World Software Analogy:</strong> Dijkstra’s shortest
            path algorithm, OS priority process schedulers, Top-K recommendation streams, and heap sort.
          </div>
        </div>

        {/* Complexity Card */}
        <div className="p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Binary Max-Heap Complexities
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Peek Max (Root arr[0]):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Insert (Sift-Up):</span>
              <span className="font-mono font-bold text-emerald-400">O(log n)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Extract Max (Sift-Down):</span>
              <span className="font-mono font-bold text-emerald-400">O(log n)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Build Heap (Floyd's):</span>
              <span className="font-mono font-bold text-indigo-400">O(n)</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-400">Space Complexity:</span>
              <span className="font-mono font-bold text-purple-400">O(n)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector & Controls */}
      <div className="p-4 rounded-2xl bg-[#131422] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Select Mode */}
          <div className="flex items-center rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => handleModeChange('RATING')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'RATING'
                  ? 'bg-amber-500 text-black shadow-glow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Highest-Rated (0 - 10)
            </button>
            <button
              onClick={() => handleModeChange('MOOD_MATCH')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'MOOD_MATCH'
                  ? 'bg-purple-600 text-white shadow-glow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Best Mood Match (0 - 100)
            </button>
          </div>

          {/* If mood mode, mood selector */}
          {mode === 'MOOD_MATCH' && (
            <select
              value={selectedMood}
              onChange={(e) => handleMoodSelectChange(e.target.value as MoodId)}
              className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs"
            >
              <option value="mind-bending">Mind-Bending</option>
              <option value="comfort-watch">Comfort Watch</option>
              <option value="dark-twisted">Dark & Twisted</option>
              <option value="plot-twist">Plot Twist</option>
              <option value="feel-good">Feel Good</option>
              <option value="intense-thriller">Intense Thriller</option>
            </select>
          )}

          {/* Select movie to insert */}
          <select
            value={selectedMovieToAdd}
            onChange={(e) => setSelectedMovieToAdd(e.target.value)}
            className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs max-w-[150px]"
          >
            {allMovies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleInsert}
            disabled={isAnimating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-glow-sm disabled:opacity-50 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Insert & Sift-Up
          </button>

          <button
            onClick={handleExtractMax}
            disabled={isAnimating || maxHeap.isEmpty()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 font-bold disabled:opacity-40 transition-all"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Extract Max (O(log n))
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Baseline
        </button>
      </div>

      {/* Visual Canvas: Binary Tree SVG & Contiguous Array Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Tree SVG (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0c0d16] border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <TreeDeciduous className="w-4 h-4 text-amber-400" />
              Complete Binary Tree Representation
            </span>
            <span className="text-xs font-mono text-amber-400">
              Root [0] Priority: {maxHeap.peek()?.priority || 'None'}
            </span>
          </div>

          <div className="overflow-x-auto min-h-[320px] flex justify-center py-2">
            {heapArray.length === 0 ? (
              <p className="text-gray-500 text-xs italic self-center">Heap is empty.</p>
            ) : (
              <svg width="640" height="280" className="select-none">
                {/* Edges from parent to children */}
                {heapArray.map((_, index) => {
                  const leftChildIdx = 2 * index + 1
                  const rightChildIdx = 2 * index + 2
                  const parentPos = calculateNodePosition(index, heapArray.length)

                  return (
                    <g key={`edges-${index}`}>
                      {leftChildIdx < heapArray.length && (
                        <line
                          x1={parentPos.x}
                          y1={parentPos.y}
                          x2={calculateNodePosition(leftChildIdx, heapArray.length).x}
                          y2={calculateNodePosition(leftChildIdx, heapArray.length).y}
                          stroke="#374151"
                          strokeWidth="2"
                        />
                      )}
                      {rightChildIdx < heapArray.length && (
                        <line
                          x1={parentPos.x}
                          y1={parentPos.y}
                          x2={calculateNodePosition(rightChildIdx, heapArray.length).x}
                          y2={calculateNodePosition(rightChildIdx, heapArray.length).y}
                          stroke="#374151"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  )
                })}

                {/* Nodes */}
                {heapArray.map((item, index) => {
                  const pos = calculateNodePosition(index, heapArray.length)
                  const isHighlighted = highlightIndices.includes(index)
                  const isRoot = index === 0

                  return (
                    <g key={item.id} className="transition-all duration-300">
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="22"
                        className={`${
                          isHighlighted
                            ? 'fill-amber-500 stroke-white stroke-2 animate-pulse'
                            : isRoot
                            ? 'fill-purple-600 stroke-purple-400 stroke-2'
                            : 'fill-[#1a1c2d] stroke-white/20 stroke-1'
                        }`}
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 2}
                        textAnchor="middle"
                        className="text-[11px] font-black fill-white"
                        dy=".3em"
                      >
                        {item.priority}
                      </text>
                      <text
                        x={pos.x}
                        y={pos.y + 32}
                        textAnchor="middle"
                        className="text-[9px] fill-gray-400 font-mono"
                      >
                        [{index}] {item.title.slice(0, 8)}..
                      </text>
                    </g>
                  )
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Right: Contiguous Array View & Trace Log (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12131f] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Underlying Array Storage
            </span>
            <span className="text-xs text-gray-400">Parent = ⌊(i-1)/2⌋</span>
          </div>

          {/* Array Cells */}
          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-1">
            {heapArray.map((item, index) => {
              const isHighlighted = highlightIndices.includes(index)
              return (
                <div
                  key={`cell-${item.id}-${index}`}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center min-w-[54px] text-center transition-all ${
                    isHighlighted
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200 scale-105'
                      : index === 0
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-200'
                      : 'bg-[#18192a] border-white/10 text-gray-300'
                  }`}
                >
                  <span className="text-[9px] font-mono text-gray-500">[{index}]</span>
                  <span className="text-xs font-black">{item.priority}</span>
                </div>
              )
            })}
          </div>

          {/* Step Execution Log */}
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Live Sift Operation Log
            </span>
            <div className="p-3 rounded-xl bg-[#090a10] text-[11px] font-mono text-gray-300 max-h-[160px] overflow-y-auto space-y-1">
              {traceLogs.length === 0 ? (
                <p className="text-gray-500 italic">No recent sift operations.</p>
              ) : (
                traceLogs.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">Step {step.step}:</span>
                    <span className="text-gray-300">{step.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
