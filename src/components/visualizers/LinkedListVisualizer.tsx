import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { HistoryNodeData } from '../../types'
import {
  Play,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'

export const LinkedListVisualizer: React.FC = () => {
  const { historyList, allMovies } = useApp()
  const [nodes, setNodes] = useState<HistoryNodeData[]>(() => historyList.toArray())
  const [activeTraverseIndex, setActiveTraverseIndex] = useState<number | null>(null)
  const [isTraversing, setIsTraversing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHighlightIndex, setSearchHighlightIndex] = useState<number | null>(null)
  const [selectedMovieToAdd, setSelectedMovieToAdd] = useState(allMovies[0]?.id || '')

  const refreshNodes = () => {
    setNodes(historyList.toArray())
  }

  // Prepend: O(1)
  const handlePrepend = () => {
    const movie = allMovies.find((m) => m.id === selectedMovieToAdd)
    if (!movie) return

    const newNode: HistoryNodeData = {
      id: `hist-${Date.now()}`,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.posterPath,
      watchedAt: Date.now(),
      rating: movie.voteAverage,
    }
    historyList.prepend(newNode)
    refreshNodes()
    toast.success(`[Prepend]: Added "${movie.title}" to HEAD in O(1) time.`)
  }

  // Append: O(n)
  const handleAppend = () => {
    const movie = allMovies.find((m) => m.id === selectedMovieToAdd)
    if (!movie) return

    const newNode: HistoryNodeData = {
      id: `hist-${Date.now()}`,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.posterPath,
      watchedAt: Date.now(),
      rating: movie.voteAverage,
    }
    historyList.append(newNode)
    refreshNodes()
    toast.success(`[Append]: Traversed to TAIL and appended "${movie.title}" in O(n) time.`)
  }

  // Remove by ID
  const handleRemove = (id: string, title: string) => {
    const success = historyList.removeById(id, (item) => item.id)
    if (success) {
      refreshNodes()
      toast.info(`Removed node "${title}" from Linked List.`)
    }
  }

  // Step-by-step traversal animation
  const handleTraverse = async () => {
    if (nodes.length === 0 || isTraversing) return
    setIsTraversing(true)
    setSearchHighlightIndex(null)

    for (let i = 0; i < nodes.length; i++) {
      setActiveTraverseIndex(i)
      await new Promise((resolve) => setTimeout(resolve, 600))
    }

    setActiveTraverseIndex(null)
    setIsTraversing(false)
    toast.success(`Traversed all ${nodes.length} nodes sequentially from HEAD to TAIL.`)
  }

  // Search by ID with comparison trace
  const handleSearch = () => {
    if (!searchQuery.trim()) return
    const result = historyList.searchById(
      searchQuery.trim(),
      (item) => item.title.toLowerCase()
    )

    if (result.found && result.node) {
      const idx = nodes.findIndex((n) => n.id === result.node?.data.id)
      setSearchHighlightIndex(idx)
      toast.success(
        `Found "${result.node.data.title}" after ${result.comparisons} node comparison(s)!`
      )
    } else {
      setSearchHighlightIndex(null)
      toast.error(`Movie "${searchQuery}" not found after ${result.comparisons} comparison(s).`)
    }
  }

  const handleReset = () => {
    historyList.clear()
    historyList.prepend({
      id: 'hist-1',
      movieId: allMovies[6].id,
      title: allMovies[6].title,
      posterPath: allMovies[6].posterPath,
      watchedAt: Date.now() - 172800000,
      rating: allMovies[6].voteAverage,
    })
    historyList.prepend({
      id: 'hist-2',
      movieId: allMovies[7].id,
      title: allMovies[7].title,
      posterPath: allMovies[7].posterPath,
      watchedAt: Date.now() - 86400000,
      rating: allMovies[7].voteAverage,
    })
    refreshNodes()
    setActiveTraverseIndex(null)
    setSearchHighlightIndex(null)
    toast.info('Viewing History Linked List reset to baseline.')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Academic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              Singly Linked List — Viewing History
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Pointer Chaining
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            A linear sequence of explicitly allocated nodes connected by unidirectional pointers
            (<code className="text-purple-300">node.next</code>). In CineMatch, each node stores a
            watched movie timestamp. Inserting at the beginning is <strong className="text-emerald-400">O(1)</strong>, while sequential search and appending to the tail require <strong className="text-amber-400">O(n)</strong> pointer traversals.
          </p>
          <div className="p-3 rounded-xl bg-[#161828] border border-white/[0.06] text-xs text-gray-400">
            <strong className="text-white">Real-World Software Analogy:</strong> Sequential media
            playlists, undo chains, memory chunk free-lists, and chained data structures.
          </div>
        </div>

        {/* Complexity Card */}
        <div className="p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Time & Space Complexity
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Prepend (Insert Head):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Append (Insert Tail):</span>
              <span className="font-mono font-bold text-amber-400">O(n)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Search by Title/ID:</span>
              <span className="font-mono font-bold text-amber-400">O(n)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Delete Node:</span>
              <span className="font-mono font-bold text-amber-400">O(n)</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-400">Space Complexity:</span>
              <span className="font-mono font-bold text-purple-400">O(n)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Control Toolbar */}
      <div className="p-4 rounded-2xl bg-[#131422] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Select movie to insert */}
          <select
            value={selectedMovieToAdd}
            onChange={(e) => setSelectedMovieToAdd(e.target.value)}
            className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
          >
            {allMovies.slice(0, 15).map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrepend}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-glow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Prepend (Head O(1))
          </button>

          <button
            onClick={handleAppend}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1f2136] hover:bg-[#282a44] text-purple-300 border border-purple-500/30 font-medium transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Append (Tail O(n))
          </button>

          <button
            onClick={handleTraverse}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-300" />
            Traverse List
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search movie title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 w-36 sm:w-48"
          />
          <button
            onClick={handleSearch}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Reset baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Visual Canvas: Animated Singly Linked List */}
      <div className="p-6 rounded-2xl bg-[#0c0d16] border border-white/10 overflow-x-auto min-h-[220px]">
        <div className="flex items-center gap-3 min-w-max py-4">
          {/* HEAD Pointer Label */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold shadow-glow-sm">
            <span>HEAD</span>
            <span className="text-[10px] text-gray-400 font-normal">pointer</span>
          </div>

          <ArrowRight className="w-5 h-5 text-purple-400 flex-shrink-0 animate-pulse" />

          {/* Node Cards */}
          {nodes.length === 0 ? (
            <div className="px-6 py-4 rounded-xl border border-dashed border-white/10 text-gray-500 text-xs italic">
              Linked List is empty. Head points directly to NULL.
            </div>
          ) : (
            nodes.map((node, index) => {
              const isCurrent = activeTraverseIndex === index
              const isHighlighted = searchHighlightIndex === index

              return (
                <React.Fragment key={node.id}>
                  <div
                    className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 w-60 sm:w-64 ${
                      isCurrent
                        ? 'bg-purple-900/40 border-purple-400 shadow-glow-purple scale-105'
                        : isHighlighted
                        ? 'bg-amber-900/40 border-amber-400 shadow-glow-sm scale-105'
                        : 'bg-[#151726] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Index badge */}
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1d1f33] border border-white/10 text-purple-300">
                      Node [{index}]
                    </div>

                    <img
                      src={node.posterPath}
                      alt={node.title}
                      className="w-12 h-16 object-cover rounded-xl border border-white/10 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{node.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(node.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-[10px] font-mono text-purple-400 mt-1">
                        next: {index < nodes.length - 1 ? `ptr(Node[${index + 1}])` : 'NULL'}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemove(node.id, node.title)}
                      className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove this node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Connecting Arrow */}
                  <div className="flex items-center flex-shrink-0">
                    <div className="h-[2px] w-6 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                    <ArrowRight className="w-4 h-4 -ml-1 text-indigo-400" />
                  </div>
                </React.Fragment>
              )
            })
          )}

          {/* NULL Pointer Terminator */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 font-mono text-xs font-bold">
            <span>NULL</span>
            <span className="text-[10px] text-gray-400 font-normal">tail.next</span>
          </div>
        </div>
      </div>

      {/* Pseudocode & Viva Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[#12131f] border border-white/10 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Pseudocode (Prepend vs Append)
          </h4>
          <pre className="p-3 rounded-xl bg-[#090a10] text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed">
{`function prepend(data):
    newNode = Node(data)
    newNode.next = head
    head = newNode
    count++     // O(1) instantaneous

function append(data):
    newNode = Node(data)
    if head is null: head = newNode; return
    curr = head
    while curr.next != null:
        curr = curr.next    // O(n) traversal
    curr.next = newNode`}
          </pre>
        </div>

        <div className="p-4 rounded-2xl bg-[#12131f] border border-white/10 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Viva Evaluation Notes
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            <strong>Why Singly Linked List?</strong> History feeds benefit from instantaneous prepend (<code className="text-emerald-400">O(1)</code>) as new movies are watched. Unlike arrays, there is no expensive <code className="text-amber-400">O(n)</code> reallocation or memory shifting when inserting at index 0.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>Trade-off:</strong> No random index access (<code className="text-amber-400">arr[i]</code>); finding the k-th movie requires sequential pointer traversal.
          </p>
        </div>
      </div>
    </div>
  )
}
