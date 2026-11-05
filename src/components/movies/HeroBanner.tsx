import React, { useState } from 'react'
import { Movie } from '../../types'
import { useApp } from '../../context/AppContext'
import { Play, Plus, Check, Star, Info, Network, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { generateBackdropSvg } from '../../utils/imageFallback'

interface HeroBannerProps {
  featuredMovies: Movie[]
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featuredMovies }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { setSelectedMovie, setTrailerMovie, watchlist, addToWatchlist, removeFromWatchlist } =
    useApp()
  const navigate = useNavigate()

  if (!featuredMovies || featuredMovies.length === 0) return null
  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0]
  const inWatchlist = watchlist.some((m) => m.id === currentMovie.id)

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#0c0d15] my-4">
      {/* Cinematic Backdrop Image with Gradients */}
      <div className="relative h-[440px] sm:h-[520px] lg:h-[580px] w-full overflow-hidden">
        <img
          key={currentMovie.id}
          src={currentMovie.backdropPath || generateBackdropSvg(currentMovie.title, currentMovie.genres[0] || 'Cinema')}
          alt={currentMovie.title}
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = generateBackdropSvg(
              currentMovie.title,
              currentMovie.genres[0] || 'Cinema'
            )
          }}
          className="w-full h-full object-cover object-center scale-[1.02] brightness-[0.82] contrast-[1.08] transition-transform duration-700"
        />

        {/* Multi-layered cinematic dark vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b10] via-[#0a0b10]/70 to-transparent w-full lg:w-3/4" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0a0b10]/80" />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-3xl space-y-4">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-purple-600 text-white shadow-glow-sm">
              Spotlight
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 backdrop-blur-md text-yellow-400 border border-yellow-400/30">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              {currentMovie.voteAverage.toFixed(1)} Rating
            </span>
            <span className="text-xs text-gray-300 font-medium px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm">
              {currentMovie.releaseDate.split('-')[0]}
            </span>
            {currentMovie.runtime && (
              <span className="text-xs text-gray-300 font-medium px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm">
                {currentMovie.runtime} min
              </span>
            )}
            <span className="text-xs text-purple-300 font-medium px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
              {currentMovie.genres.join(' • ')}
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase font-sans drop-shadow-lg">
            {currentMovie.title}
          </h1>

          {/* Overview Synopsis */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Watch Trailer Button */}
            <button
              onClick={() => setTrailerMovie(currentMovie)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-glow-purple hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Trailer</span>
            </button>

            {/* Add to Watchlist (Stack operation) */}
            <button
              onClick={() =>
                inWatchlist ? removeFromWatchlist(currentMovie.id) : addToWatchlist(currentMovie)
              }
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold backdrop-blur-md border transition-all ${
                inWatchlist
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>

            {/* Movie Details Modal */}
            <button
              onClick={() => setSelectedMovie(currentMovie)}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#18192a]/80 hover:bg-[#202236] text-gray-200 border border-white/15 text-sm font-medium transition-all"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>

            {/* Explore in Graph (Academic DSA connection) */}
            <button
              onClick={() => navigate('/dsa-lab?tab=graph')}
              className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
              title="View relationships in Adjacency Graph"
            >
              <Network className="w-3.5 h-3.5 text-purple-400" />
              <span>Relationship Graph</span>
            </button>
          </div>
        </div>

        {/* Featured Thumbnail Selector (as seen in the Batman v Superman design in reference image) */}
        <div className="absolute right-6 bottom-6 hidden md:flex items-center gap-2.5 z-20 bg-black/50 backdrop-blur-md p-2 rounded-2xl border border-white/10">
          {featuredMovies.slice(0, 4).map((movie, idx) => (
            <button
              key={movie.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                currentIndex === idx
                  ? 'ring-2 ring-purple-500 scale-105 opacity-100 shadow-glow-sm'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={movie.posterPath} alt={movie.title} className="w-14 h-20 object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
