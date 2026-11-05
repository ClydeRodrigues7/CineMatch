import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Movie } from '../../types'
import {
  ListVideo,
  ArrowRight,
  ArrowLeft,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

export const QueueVisualizer: React.FC = () => {
  const { watchNextQueue, watchNextItems, addToWatchNext, dequeueWatchNext, clearWatchNext, allMovies } =
    useApp()
  const [selectedMovieToAdd, setSelectedMovieToAdd] = useState(allMovies[4]?.id || '')

  const frontItem = watchNextQueue.peek()
  const rearItem = watchNextQueue.getRear()

  const handleEnqueue = () => {
    const movie = allMovies.find((m) => m.id === selectedMovieToAdd)
    if (movie) {
      addToWatchNext(movie)
    }
  }

  const handleDequeue = () => {
    dequeueWatchNext()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Academic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              Queue (FIFO) — Watch Next Continuous Playlist
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              First-In, First-Out
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            A linear collection governed by strict First-In, First-Out (FIFO) semantics. Elements are
            appended to the <code className="text-cyan-400">REAR</code> pointer and consumed
            sequentially from the <code className="text-cyan-400">FRONT</code> pointer. In CineMatch,
            users queue titles to watch next without disturbing the sequence.
          </p>
          <div className="p-3 rounded-xl bg-[#161828] border border-white/[0.06] text-xs text-gray-400">
            <strong className="text-white">Real-World Software Analogy:</strong> OS print spoolers,
            message brokers (Kafka, RabbitMQ), web server request handling buffers, and task scheduling.
          </div>
        </div>

        {/* Complexity Card */}
        <div className="p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Linked Queue Complexities
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Enqueue (Insert Rear):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Dequeue (Remove Front):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Peek Front / Rear:</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Search by Title:</span>
              <span className="font-mono font-bold text-amber-400">O(n)</span>
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
          {/* Movie select */}
          <select
            value={selectedMovieToAdd}
            onChange={(e) => setSelectedMovieToAdd(e.target.value)}
            className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
          >
            {allMovies.slice(0, 15).map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleEnqueue}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-glow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Enqueue to REAR (O(1))
          </button>

          <button
            onClick={handleDequeue}
            disabled={watchNextQueue.isEmpty()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold shadow-glow-sm disabled:opacity-40 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Dequeue from FRONT (O(1))
          </button>
        </div>

        <button
          onClick={clearWatchNext}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear Queue
        </button>
      </div>

      {/* Visual Canvas: Horizontal FIFO Pipeline */}
      <div className="p-6 rounded-2xl bg-[#0c0d16] border border-white/10 space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <ListVideo className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Horizontal FIFO Pipeline
            </span>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Queue Size: {watchNextQueue.size}
          </span>
        </div>

        {/* Pipeline Nodes */}
        <div className="flex items-center gap-3 min-w-max py-4">
          {/* FRONT Pointer Marker */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shadow-glow-sm">
            <span>FRONT</span>
            <span className="text-[10px] text-gray-400 font-normal">Next out</span>
          </div>

          <ArrowRight className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />

          {watchNextItems.length === 0 ? (
            <div className="px-10 py-6 rounded-2xl border border-dashed border-white/10 text-gray-500 text-xs italic">
              Queue is empty. FRONT and REAR both point to NULL.
            </div>
          ) : (
            watchNextItems.map((movie, index) => {
              const isFront = index === 0
              const isRear = index === watchNextItems.length - 1

              return (
                <React.Fragment key={movie.id}>
                  <div
                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 w-56 sm:w-60 ${
                      isFront
                        ? 'bg-emerald-900/30 border-emerald-400 shadow-glow-sm'
                        : isRear
                        ? 'bg-cyan-900/30 border-cyan-400 shadow-glow-sm'
                        : 'bg-[#151726] border-white/10'
                    }`}
                  >
                    {/* Index badge */}
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1d1f33] border border-white/10 text-cyan-300">
                      Pos [{index}]
                    </div>

                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-10 h-14 object-cover rounded-xl border border-white/10 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{movie.title}</p>
                      <div className="flex items-center gap-1 text-[10px] text-yellow-400 mt-0.5">
                        <span>★ {movie.voteAverage.toFixed(1)}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 truncate">{movie.genres[0]}</span>
                      </div>
                      <div className="mt-1">
                        {isFront && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500 text-black">
                            NEXT TO PLAY
                          </span>
                        )}
                        {isRear && !isFront && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-cyan-500 text-black">
                            REAR ITEM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inter-node connector */}
                  {index < watchNextItems.length - 1 && (
                    <div className="flex items-center flex-shrink-0">
                      <div className="h-[2px] w-6 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
                      <ArrowRight className="w-4 h-4 -ml-1 text-indigo-400" />
                    </div>
                  )}
                </React.Fragment>
              )
            })
          )}

          {/* REAR Pointer Marker */}
          <ArrowLeft className="w-5 h-5 text-cyan-400 flex-shrink-0 animate-pulse" />

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold shadow-glow-sm">
            <span>REAR</span>
            <span className="text-[10px] text-gray-400 font-normal">Last in</span>
          </div>
        </div>
      </div>
    </div>
  )
}
