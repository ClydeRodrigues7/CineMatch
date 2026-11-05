import React, { useRef } from 'react'
import { Movie } from '../../types'
import { MovieCard } from './MovieCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MovieRowProps {
  title: string
  subtitle?: string
  movies: Movie[]
  cardSize?: 'normal' | 'compact' | 'wide'
  badge?: string
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  subtitle,
  movies,
  cardSize = 'normal',
  badge,
}) => {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current
      const scrollAmount = clientWidth * 0.75
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (!movies || movies.length === 0) return null

  return (
    <div className="w-full my-6 space-y-3 group/row relative">
      {/* Row Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h3>
            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-80 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-[#161827] border border-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-[#161827] border border-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={rowRef}
        className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none scroll-smooth"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} size={cardSize} />
        ))}
      </div>
    </div>
  )
}
