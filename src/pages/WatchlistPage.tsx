import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MovieCard } from '../components/movies/MovieCard'
import {
  Bookmark,
  Undo2,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Movie, WatchlistAction } from '../types'

export const WatchlistPage: React.FC = () => {
  const { watchlist, watchlistStack, undoLastWatchlistAction, canUndo, lastUndoAction } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [showStackDrawer, setShowStackDrawer] = useState(false)

  const filteredWatchlist = watchlist.filter((m: Movie) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stackHistory: WatchlistAction[] = watchlistStack.toLifoArray()

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with Stack Undo Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-rose-500" />
            My Watchlist
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Stack-Backed
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Persisted locally. Modifications are recorded on an explicit LIFO Stack for multi-level Undo.
          </p>
        </div>

        {/* Undo Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => undoLastWatchlistAction()}
            disabled={!canUndo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white font-bold text-xs shadow-glow-sm hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all"
            title="Pop top state change from Stack"
          >
            <Undo2 className="w-4 h-4" />
            <span>Undo Last Action</span>
            {lastUndoAction && (
              <span className="hidden sm:inline text-[10px] opacity-80">
                ({lastUndoAction.type === 'ADD_TO_WATCHLIST' ? 'Revert Add' : 'Restore'})
              </span>
            )}
          </button>

          <button
            onClick={() => setShowStackDrawer(!showStackDrawer)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-medium transition-colors"
          >
            <Layers className="w-4 h-4 text-rose-400" />
            <span>Undo Stack ({watchlistStack.size})</span>
          </button>

          <Link
            to="/dsa-lab?tab=stack"
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
            title="Open Stack in DSA Lab"
          >
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Optional Stack History Drawer */}
      {showStackDrawer && (
        <div className="p-5 rounded-2xl bg-[#12131f] border border-rose-500/30 space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              LIFO Undo Action Stack (Top to Bottom)
            </span>
            <span className="font-mono text-gray-400">Total Frames: {stackHistory.length}</span>
          </div>

          {stackHistory.length === 0 ? (
            <p className="text-gray-500 italic py-2">
              Undo stack is empty. Add or remove movies to create undoable operations.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {stackHistory.map((act: WatchlistAction, idx: number) => (
                <div
                  key={act.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    idx === 0
                      ? 'bg-rose-950/40 border-rose-400 text-white font-bold'
                      : 'bg-[#171929] border-white/[0.06] text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-rose-400 text-[10px]">[{idx === 0 ? 'TOP' : idx}]</span>
                    <span className="truncate">{act.movie.title}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold ${
                      act.type === 'ADD_TO_WATCHLIST'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {act.type === 'ADD_TO_WATCHLIST' ? '+ Add' : '- Del'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Count Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search within watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12131f] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <span className="text-xs text-gray-400">
          Showing <strong className="text-white">{filteredWatchlist.length}</strong> of{' '}
          {watchlist.length} saved titles
        </span>
      </div>

      {/* Watchlist Grid */}
      {filteredWatchlist.length === 0 ? (
        <div className="py-24 text-center space-y-4 p-8 rounded-3xl bg-[#12131f] border border-dashed border-white/10">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-base font-semibold text-gray-300">Your Watchlist is empty.</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Browse Discover or Movies and click the "+" button on any card to save titles.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-full bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 shadow-glow-sm"
          >
            Discover Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredWatchlist.map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} size="compact" />
          ))}
        </div>
      )}
    </div>
  )
}
