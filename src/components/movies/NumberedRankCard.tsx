import React from 'react'
import { Movie } from '../../types'
import { useApp } from '../../context/AppContext'
import { Star, Plus, Check } from 'lucide-react'

interface Props {
  movie: Movie
  rank: number
}

export const NumberedRankCard: React.FC<Props> = ({ movie, rank }) => {
  const { setSelectedMovie, watchlist, addToWatchlist, removeFromWatchlist } = useApp()
  const inWatchlist = watchlist.some((m) => m.id === movie.id)

  return (
    <div
      onClick={() => setSelectedMovie(movie)}
      className="group flex items-center gap-3 cursor-pointer p-2 rounded-2xl bg-[#12131f]/70 border border-white/[0.06] hover:border-purple-500/30 hover:bg-[#161828] transition-all duration-300 min-w-[260px] sm:min-w-[300px]"
    >
      {/* Big Ranking Number */}
      <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/70 via-white/20 to-transparent italic px-2 select-none">
        {rank}
      </span>

      <img
        src={movie.posterPath}
        alt={movie.title}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.background = '#1a1b2e'
          e.currentTarget.removeAttribute('src')
        }}
        className="w-16 h-22 object-cover rounded-xl border border-white/10 group-hover:scale-105 transition-transform bg-card"
      />

      {/* Details */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
          {movie.title}
        </h4>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {movie.releaseDate.split('-')[0]} • {movie.genres.slice(0, 2).join(', ')}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400">
            <Star className="w-3 h-3 fill-yellow-400" />
            {movie.voteAverage.toFixed(1)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie)
            }}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              inWatchlist
                ? 'bg-rose-500 text-white'
                : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
            }`}
            title="Watchlist"
          >
            {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
