import React, { useEffect, useState } from 'react'
import { Star, Plus, Check, ListVideo, Eye, Play } from 'lucide-react'
import { Movie } from '../../types'
import { useApp } from '../../context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { generateBackdropSvg, generatePosterSvg } from '@/utils/imageFallback'

interface MovieCardProps {
  movie: Movie
  size?: 'normal' | 'compact' | 'wide'
  showRank?: number
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, size = 'normal' }) => {
  const {
    setSelectedMovie,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    addToWatchNext,
    markAsWatched,
    setTrailerMovie,
  } = useApp()

  const primarySrc = size === 'wide' ? movie.backdropPath || movie.posterPath : movie.posterPath
  const [imgSrc, setImgSrc] = useState(primarySrc)

  useEffect(() => {
    setImgSrc(primarySrc)
  }, [primarySrc])

  const inWatchlist = watchlist.some((m) => m.id === movie.id)
  const genre = movie.genres[0] || 'Cinema'

  const handleImageError = () => {
    setImgSrc(
      size === 'wide'
        ? generateBackdropSvg(movie.title, genre)
        : generatePosterSvg(movie.title, genre, movie.voteAverage)
    )
  }

  return (
    <div
      onClick={() => setSelectedMovie(movie)}
      className="group relative cursor-pointer flex-shrink-0 select-none transition-transform duration-300 hover:scale-[1.03]"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card shadow-lg transition-all group-hover:border-primary/40 group-hover:shadow-glow-purple',
          size === 'compact' && 'h-52 w-36 sm:h-64 sm:w-44',
          size === 'wide' && 'h-40 w-64 sm:h-48 sm:w-80',
          size === 'normal' && 'h-64 w-44 sm:h-76 sm:w-52'
        )}
      >
        <img
          src={imgSrc}
          alt={movie.title}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center justify-between">
            <Badge variant="gold" className="gap-1 backdrop-blur-md">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {movie.voteAverage.toFixed(1)}
            </Badge>
            {movie.trailerUrl && (
              <Button
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  setTrailerMovie(movie)
                }}
                title="Watch Trailer"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-1 pt-2">
            <Button
              size="icon"
              variant={inWatchlist ? 'rose' : 'secondary'}
              className="h-9 w-9 rounded-xl backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation()
                if (inWatchlist) removeFromWatchlist(movie.id)
                else addToWatchlist(movie)
              }}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist (Stack)'}
            >
              {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="cyan"
              className="h-9 w-9 rounded-xl backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation()
                addToWatchNext(movie)
              }}
              title="Add to Watch Next (Queue FIFO)"
            >
              <ListVideo className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation()
                markAsWatched(movie)
              }}
              title="Mark as Watched (Linked List)"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="absolute right-2.5 top-2.5 transition-opacity group-hover:opacity-0">
          <Badge variant="gold" className="backdrop-blur-sm">
            ★ {movie.voteAverage.toFixed(1)}
          </Badge>
        </div>
      </div>

      <div className="mt-2.5 space-y-0.5 px-0.5">
        <h4 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-primary">
          {movie.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{movie.releaseDate.split('-')[0]}</span>
          <span>•</span>
          <span className="max-w-[120px] truncate">{genre}</span>
          {movie.mediaType === 'tv' && <Badge variant="purple">TV</Badge>}
        </div>
      </div>
    </div>
  )
}
