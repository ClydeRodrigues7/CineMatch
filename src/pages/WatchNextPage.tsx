import React from 'react'
import { useApp } from '../context/AppContext'
import { ListVideo, Play, Trash2, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Movie } from '../types'

export const WatchNextPage: React.FC = () => {
  const {
    watchNextQueue,
    watchNextItems,
    dequeueWatchNext,
    clearWatchNext,
    setTrailerMovie,
    setSelectedMovie,
  } = useApp()

  const currentFront = watchNextQueue.peek()

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ListVideo className="w-6 h-6 text-cyan-400" />
            Watch Next Playlist
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              FIFO Queue
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            A First-In, First-Out sequential pipeline. Dequeueing advances continuous playback to the next title in line.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dequeueWatchNext()}
            disabled={watchNextQueue.isEmpty()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-xs shadow-glow-sm hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play Next (Dequeue)</span>
          </button>

          <button
            onClick={clearWatchNext}
            disabled={watchNextQueue.isEmpty()}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 disabled:opacity-30 transition-colors"
            title="Clear Queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            to="/dsa-lab?tab=queue"
            className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors"
            title="Open Queue in DSA Lab"
          >
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Featured "Up Next" Hero (Front of Queue) */}
      {currentFront && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#12131f] to-[#12131f] border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <img
              src={currentFront.posterPath}
              alt={currentFront.title}
              className="w-20 h-28 object-cover rounded-2xl border border-white/10 shadow-lg flex-shrink-0"
            />
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-black">
                Up Next (Queue FRONT)
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{currentFront.title}</h3>
              <p className="text-xs text-gray-300 line-clamp-2 max-w-xl">{currentFront.overview}</p>
              <div className="flex items-center gap-2 text-xs text-yellow-400 pt-1 font-semibold">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span>{currentFront.voteAverage.toFixed(1)}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{currentFront.genres.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
            {currentFront.trailerUrl && (
              <button
                onClick={() => setTrailerMovie(currentFront)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Play Trailer
              </button>
            )}
            <button
              onClick={() => setSelectedMovie(currentFront)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Queue Pipeline Ordered List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Queued Pipeline Order ({watchNextItems.length} Titles)
        </h3>

        {watchNextItems.length === 0 ? (
          <div className="py-24 text-center space-y-4 p-8 rounded-3xl bg-[#12131f] border border-dashed border-white/10">
            <ListVideo className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-base font-semibold text-gray-300">Watch Next Queue is empty.</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Add movies to the queue from any movie card or the movie details dialog.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {watchNextItems.map((movie: Movie, index: number) => {
              const isFront = index === 0
              const isRear = index === watchNextItems.length - 1

              return (
                <div
                  key={`${movie.id}-${index}`}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isFront
                      ? 'bg-cyan-950/30 border-cyan-400/50'
                      : isRear
                      ? 'bg-[#151726] border-white/10'
                      : 'bg-[#12131f] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                      #{index + 1}
                    </span>

                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded-xl border border-white/10 flex-shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{movie.title}</h4>
                        {isFront && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500 text-black">
                            FRONT
                          </span>
                        )}
                        {isRear && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500 text-black">
                            REAR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {movie.releaseDate.split('-')[0]} • {movie.genres.join(', ')} • ★ {movie.voteAverage.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMovie(movie)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300"
                  >
                    Inspect
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
