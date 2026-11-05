import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { WatchlistAction } from '../../types'
import {
  Layers,
  ArrowDown,
  RotateCcw,
  Plus,
  Undo2,
  Trash2,
  Bookmark,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

export const StackVisualizer: React.FC = () => {
  const { watchlistStack, watchlist, addToWatchlist, removeFromWatchlist, undoLastWatchlistAction, allMovies } =
    useApp()
  const [selectedMovieToAdd, setSelectedMovieToAdd] = useState(allMovies[2]?.id || '')

  const stackItems = watchlistStack.toLifoArray() // Top to bottom

  const handleSimulateAdd = () => {
    const movie = allMovies.find((m) => m.id === selectedMovieToAdd)
    if (movie) {
      addToWatchlist(movie)
    }
  }

  const handleSimulateRemove = () => {
    if (watchlist.length > 0) {
      removeFromWatchlist(watchlist[0].id)
    } else {
      toast.error('Watchlist is currently empty; cannot remove an item.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Academic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Stack (LIFO) — Watchlist Undo System
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Last-In, First-Out
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            A linear collection where elements are added and removed strictly from a single end called
            the <code className="text-rose-400">TOP</code>. When a user modifies their Watchlist, an
            undo record with the exact state mutation is pushed onto the stack. Performing an Undo
            pops the top action and executes its mathematical inverse.
          </p>
          <div className="p-3 rounded-xl bg-[#161828] border border-white/[0.06] text-xs text-gray-400">
            <strong className="text-white">Real-World Software Analogy:</strong> Text editor Ctrl+Z / Cmd+Z,
            call-stack execution frames in compilers, browser back stack, and arithmetic expression evaluation.
          </div>
        </div>

        {/* Complexity Card */}
        <div className="p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Stack Complexities
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Push (Insert Top):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Pop (Remove Top):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Peek (Inspect Top):</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Search by Value:</span>
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
          {/* Select movie to trigger watchlist action */}
          <select
            value={selectedMovieToAdd}
            onChange={(e) => setSelectedMovieToAdd(e.target.value)}
            className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
          >
            {allMovies.slice(0, 15).map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleSimulateAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-glow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Push "Add to Watchlist" (O(1))
          </button>

          <button
            onClick={handleSimulateRemove}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#201525] hover:bg-[#2b1c33] text-rose-300 border border-rose-500/30 font-medium transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Push "Remove from Watchlist" (O(1))
          </button>
        </div>

        {/* Real Pop / Undo Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => undoLastWatchlistAction()}
            disabled={watchlistStack.isEmpty()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white font-bold shadow-glow-sm disabled:opacity-40 transition-all"
          >
            <Undo2 className="w-4 h-4" />
            Pop & Undo Latest Action
          </button>

          <button
            onClick={() => {
              watchlistStack.clear()
              toast.info('Watchlist Undo Stack cleared.')
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            title="Clear Stack"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Canvas: Vertical Stack & Current Watchlist State */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vertical Stack Container (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0c0d16] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Vertical LIFO Stack Representation
              </span>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Size: {watchlistStack.size}
            </span>
          </div>

          {/* TOP Pointer Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <ArrowDown className="w-4 h-4 text-rose-400 animate-bounce" />
              TOP POINTER (Stack.peek)
            </span>
            <span className="text-[10px] text-gray-400 font-normal">Next popped element</span>
          </div>

          {/* Stack Items (Rendered top-down) */}
          <div className="space-y-2.5 min-h-[260px] max-h-[380px] overflow-y-auto pr-1">
            {stackItems.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-xs italic border border-dashed border-white/10 rounded-2xl">
                Stack is currently EMPTY. Top is pointing to NULL.
                <p className="mt-1 text-[11px] text-gray-600">
                  Add or remove movies above to push undoable actions onto the stack!
                </p>
              </div>
            ) : (
              stackItems.map((action, index) => {
                const isTop = index === 0
                return (
                  <div
                    key={action.id}
                    className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                      isTop
                        ? 'bg-rose-900/40 border-rose-400 shadow-glow-sm scale-[1.01]'
                        : 'bg-[#151726] border-white/10 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center font-mono font-bold text-xs text-rose-300">
                        [{stackItems.length - 1 - index}]
                      </div>

                      <img
                        src={action.movie.posterPath}
                        alt={action.movie.title}
                        className="w-10 h-14 object-cover rounded-lg border border-white/10"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              action.type === 'ADD_TO_WATCHLIST'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {action.type}
                          </span>
                          {isTop && (
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-500 text-white animate-pulse">
                              TOP
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white mt-1">{action.movie.title}</p>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-gray-400">
                      Undo will:{' '}
                      <strong className="text-white">
                        {action.type === 'ADD_TO_WATCHLIST' ? 'Remove' : 'Restore'}
                      </strong>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* BOTTOM Base */}
          <div className="p-2 text-center rounded-xl bg-[#090a10] border border-white/10 font-mono text-[10px] text-gray-500 uppercase tracking-widest">
            — BOTTOM OF STACK (INDEX 0) —
          </div>
        </div>

        {/* Right: Actual Watchlist State (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12131f] border border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-rose-400" />
                Live Watchlist State
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                {watchlist.length} Saved
              </span>
            </div>

            <p className="text-xs text-gray-400">
              This list reflects the actual synchronized application state. Watch it update immediately when popping the stack!
            </p>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {watchlist.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-8 text-center">
                  Your Watchlist is empty.
                </p>
              ) : (
                watchlist.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#161828] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={m.posterPath}
                        alt={m.title}
                        className="w-9 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[140px]">
                          {m.title}
                        </p>
                        <span className="text-[10px] text-yellow-400">★ {m.voteAverage.toFixed(1)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromWatchlist(m.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
