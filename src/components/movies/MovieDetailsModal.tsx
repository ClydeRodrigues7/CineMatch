import React from 'react'
import { Modal } from '../ui/dialog'
import { Movie } from '../../types'
import { useApp } from '../../context/AppContext'
import {
  Star,
  Play,
  Plus,
  Check,
  ListVideo,
  Eye,
  Calendar,
  Clock,
  User,
  Network,
  Share2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const MovieDetailsModal: React.FC = () => {
  const {
    selectedMovie,
    setSelectedMovie,
    setTrailerMovie,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    addToWatchNext,
    markAsWatched,
    allMovies,
  } = useApp()

  const navigate = useNavigate()

  if (!selectedMovie) return null

  const inWatchlist = watchlist.some((m) => m.id === selectedMovie.id)

  const similarMovies = allMovies
    .filter(
      (m) =>
        m.id !== selectedMovie.id &&
        m.genres.some((g) => selectedMovie.genres.includes(g))
    )
    .slice(0, 4)

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success('Movie link copied to clipboard!')
  }

  const handleOpenInGraph = () => {
    setSelectedMovie(null)
    navigate(`/dsa-lab?tab=graph&highlight=${selectedMovie.id}`)
  }

  return (
    <Modal isOpen={!!selectedMovie} onClose={() => setSelectedMovie(null)} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Backdrop Banner */}
        <div className="relative h-64 sm:h-80 -mx-6 -mt-6 overflow-hidden rounded-t-2xl">
          <img
            src={selectedMovie.backdropPath || selectedMovie.posterPath}
            alt={selectedMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12131d] via-[#12131d]/60 to-transparent" />

          {/* Quick Play Trailer Over Backdrop */}
          {selectedMovie.trailerUrl && (
            <button
              onClick={() => setTrailerMovie(selectedMovie)}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center hover:scale-110 hover:bg-purple-500 shadow-glow-purple transition-all"
              title="Play Trailer"
            >
              <Play className="w-7 h-7 fill-white ml-1" />
            </button>
          )}
        </div>

        {/* Header Information */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Poster Card */}
          <img
            src={selectedMovie.posterPath}
            alt={selectedMovie.title}
            className="w-36 h-52 sm:w-44 sm:h-64 object-cover rounded-2xl border border-white/10 shadow-2xl flex-shrink-0 -mt-16 sm:-mt-24 z-10 mx-auto sm:mx-0"
          />

          {/* Details & Actions */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {selectedMovie.voteAverage.toFixed(1)} / 10 ({selectedMovie.voteCount.toLocaleString()} votes)
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedMovie.releaseDate}
                </span>
                {selectedMovie.runtime && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedMovie.runtime} min
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {selectedMovie.mediaType === 'tv' ? 'TV Series' : 'Feature Film'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedMovie.title}
              </h2>

              {selectedMovie.director && (
                <p className="text-xs text-purple-300 mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Directed by: <span className="font-semibold">{selectedMovie.director}</span>
                </p>
              )}
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap gap-1.5">
              {selectedMovie.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.06] text-gray-300 border border-white/[0.06]"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Action Buttons row (Direct DSA manipulation) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() =>
                  inWatchlist
                    ? removeFromWatchlist(selectedMovie.id)
                    : addToWatchlist(selectedMovie)
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  inWatchlist
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Watchlist uses LIFO Stack for Undo"
              >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={() => addToWatchNext(selectedMovie)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all"
                title="Watch Next uses FIFO Queue"
              >
                <ListVideo className="w-4 h-4" />
                <span>Queue Next</span>
              </button>

              <button
                onClick={() => markAsWatched(selectedMovie)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                title="History uses Singly Linked List"
              >
                <Eye className="w-4 h-4" />
                <span>Mark Watched</span>
              </button>

              <button
                onClick={handleOpenInGraph}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition-all"
                title="Explore Movie Relationships in Adjacency Graph"
              >
                <Network className="w-4 h-4 text-purple-400" />
                <span>Explore in Graph</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Share Movie"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Overview Synopsis */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">
            Story Synopsis
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">{selectedMovie.overview}</p>
        </div>

        {/* Cast Members */}
        {selectedMovie.cast && selectedMovie.cast.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">
              Starring Cast
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedMovie.cast.map((actor) => (
                <span
                  key={actor}
                  className="px-3 py-1 rounded-full bg-[#18192a] border border-white/10 text-xs text-gray-200"
                >
                  {actor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Similar Titles Carousel */}
        {similarMovies.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">
              Similar Titles & Recommendations
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {similarMovies.map((similar) => (
                <div
                  key={similar.id}
                  onClick={() => setSelectedMovie(similar)}
                  className="group cursor-pointer p-2 rounded-xl bg-[#161828] border border-white/10 hover:border-purple-500/40 transition-all"
                >
                  <img
                    src={similar.posterPath}
                    alt={similar.title}
                    className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  <p className="text-xs font-semibold text-white truncate mt-2 group-hover:text-purple-300">
                    {similar.title}
                  </p>
                  <span className="text-[10px] text-yellow-400">★ {similar.voteAverage.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
