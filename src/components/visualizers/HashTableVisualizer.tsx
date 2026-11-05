import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { MovieHashTable } from '../../structures/HashTable'
import { HashSearchTrace, Movie } from '../../types'
import {
  Binary,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

export const HashTableVisualizer: React.FC = () => {
  const { allMovies } = useApp()
  // Dedicated local instance for the visualizer with small capacity 8 to clearly illustrate collisions
  const [hashTable] = useState<MovieHashTable<Movie>>(() => {
    const table = new MovieHashTable<Movie>(8)
    // Seed first 6 movies
    allMovies.slice(0, 6).forEach((m) => table.set(m.id, m))
    return table
  })

  const [, setTrigger] = useState(0)
  const [searchKey, setSearchKey] = useState('demo-1')
  const [lastTrace, setLastTrace] = useState<HashSearchTrace<Movie> | null>(null)
  const [highlightBucket, setHighlightBucket] = useState<number | null>(null)

  const [newKey, setNewKey] = useState('')
  const [selectedMovieForInsert, setSelectedMovieForInsert] = useState(allMovies[6]?.id || '')

  const forceUpdate = () => setTrigger((v) => v + 1)

  // Search by key
  const handleSearch = () => {
    if (!searchKey.trim()) return
    const trace = hashTable.get(searchKey.trim())
    setLastTrace(trace)
    setHighlightBucket(trace.bucketIndex)

    if (trace.found) {
      toast.success(trace.message)
    } else {
      toast.info(trace.message)
    }
  }

  // Insert key-value
  const handleInsert = () => {
    const key = newKey.trim() || `custom-${Date.now().toString().slice(-4)}`
    const movie = allMovies.find((m) => m.id === selectedMovieForInsert) || allMovies[0]

    const res = hashTable.set(key, movie)
    setHighlightBucket(res.bucketIndex)
    forceUpdate()
    toast.success(
      `Inserted "${key}" into Bucket [${res.bucketIndex}] (Chain Length: ${res.chainLength}).`
    )
    setNewKey('')
  }

  // Remove key
  const handleRemove = (key: string) => {
    const success = hashTable.remove(key)
    if (success) {
      forceUpdate()
      setLastTrace(null)
      toast.info(`Removed key "${key}" from hash table.`)
    }
  }

  // Demonstration: Force collision
  const handleDemonstrateCollision = () => {
    // Find a bucket with at least 1 item or insert into bucket 2
    const keyA = 'alpha-key'
    const keyB = 'collide-key'
    const movieA = allMovies[0]
    const movieB = allMovies[1]

    hashTable.set(keyA, movieA)
    hashTable.set(keyB, movieB)

    // Calculate their buckets
    const bA = hashTable.computeHash(keyA).bucketIndex
    const bB = hashTable.computeHash(keyB).bucketIndex

    forceUpdate()
    toast.success(
      `Inserted demonstration keys "${keyA}" (Bucket ${bA}) and "${keyB}" (Bucket ${bB}).`
    )
  }

  const handleReset = () => {
    hashTable.clear()
    allMovies.slice(0, 6).forEach((m) => hashTable.set(m.id, m))
    setLastTrace(null)
    setHighlightBucket(null)
    forceUpdate()
    toast.info('Hash table reset to academic baseline.')
  }

  const buckets = hashTable.getBuckets()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Academic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Hash Table — Instant Movie Lookup & Separate Chaining
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Direct Addressing
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            A key-value data structure utilizing a polynomial rolling hash function to map
            arbitrary string keys (Movie IDs) into array indices (<code className="text-emerald-400">bucketIndex = hash(key) % capacity</code>).
            When multiple distinct keys hash to the same bucket index (a collision), separate
            chaining appends them to a singly linked chain in that bucket.
          </p>
          <div className="p-3 rounded-xl bg-[#161828] border border-white/[0.06] text-xs text-gray-400">
            <strong className="text-white">Real-World Software Analogy:</strong> Redis in-memory caches,
            compiler symbol tables, database primary key indexes, and JavaScript object property lookups.
          </div>
        </div>

        {/* Complexity Card */}
        <div className="p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Hash Table Complexities
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Search (Average):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Search (Worst-Case all collide):</span>
              <span className="font-mono font-bold text-rose-400">O(n)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Insert (Average):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Delete (Average):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-400">Space Complexity:</span>
              <span className="font-mono font-bold text-purple-400">O(n)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-4 rounded-2xl bg-[#131422] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Key */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Search key (e.g. demo-1)..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs w-44 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSearch}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-glow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              Hash & Search
            </button>
          </div>

          <button
            onClick={handleDemonstrateCollision}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 font-medium transition-all"
            title="Insert colliding key pairs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Demonstrate Collision
          </button>
        </div>

        {/* Live Table Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-gray-300">
            <span>Capacity: <strong className="text-white">{hashTable.tableCapacity}</strong></span>
            <span>•</span>
            <span>Items: <strong className="text-emerald-400">{hashTable.size}</strong></span>
            <span>•</span>
            <span>Load Factor: <strong className="text-purple-300">{hashTable.loadFactor}</strong></span>
            <span>•</span>
            <span>Collisions: <strong className="text-amber-400">{hashTable.collisionCount}</strong></span>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Canvas: Buckets & Separate Chaining */}
      <div className="p-6 rounded-2xl bg-[#0c0d16] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Bucket Array with Separate Chaining
          </span>
          <span className="text-xs font-mono text-gray-400">
            Formula: h(k) = (∑ k[i] * 31^i) mod {hashTable.tableCapacity}
          </span>
        </div>

        {/* Buckets Grid / Column */}
        <div className="space-y-3">
          {buckets.map((chain, bucketIdx) => {
            const isTarget = highlightBucket === bucketIdx
            const hasCollision = chain.length > 1

            return (
              <div
                key={bucketIdx}
                className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-3 ${
                  isTarget
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-glow-sm'
                    : 'bg-[#12131f] border-white/[0.08]'
                }`}
              >
                {/* Bucket Header Cell */}
                <div className="flex items-center gap-2 min-w-[140px] flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      isTarget
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    [{bucketIdx}]
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Bucket {bucketIdx}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {chain.length} entry/entries
                    </span>
                  </div>
                </div>

                <ArrowRight className="hidden sm:block w-4 h-4 text-gray-500 flex-shrink-0" />

                {/* Chain Nodes */}
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {chain.length === 0 ? (
                    <span className="text-xs text-gray-600 font-mono italic">
                      Empty bucket (points to null)
                    </span>
                  ) : (
                    chain.map((entry, chainIdx) => (
                      <React.Fragment key={entry.key}>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#181a29] border border-white/10 hover:border-emerald-500/40 transition-colors">
                          <img
                            src={entry.value.posterPath}
                            alt={entry.value.title}
                            className="w-8 h-10 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="min-w-0 pr-1">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold block truncate max-w-[120px]">
                              key: "{entry.key}"
                            </span>
                            <span className="text-xs font-semibold text-white block truncate max-w-[120px]">
                              {entry.value.title}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemove(entry.key)}
                            className="p-1 rounded text-gray-500 hover:text-rose-400"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {chainIdx < chain.length - 1 && (
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            → [Collision Chain] →
                          </span>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>

                {hasCollision && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0 self-start sm:self-auto">
                    Chain Collision ({chain.length})
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Search Result Trace Details */}
      {lastTrace && (
        <div className="p-4 rounded-2xl bg-[#12131f] border border-white/10 space-y-2 animate-fade-in text-xs font-mono">
          <div className="flex items-center justify-between text-purple-300 font-bold">
            <span>Search Inspection Trace</span>
            <span>Comparisons: {lastTrace.comparisons}</span>
          </div>
          <p className="text-gray-300">{lastTrace.message}</p>
          <div className="text-[11px] text-gray-400">
            Computed Hash: <span className="text-emerald-400">{lastTrace.hash}</span> | Target
            Bucket: <span className="text-emerald-400">[{lastTrace.bucketIndex}]</span> | Inspected
            Keys: [{lastTrace.inspectedKeys.join(', ')}]
          </div>
        </div>
      )}
    </div>
  )
}
