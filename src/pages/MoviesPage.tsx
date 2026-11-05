import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { MovieCard } from '../components/movies/MovieCard'
import { Film, RotateCcw } from 'lucide-react'
import { Movie } from '../types'

export const MoviesPage: React.FC = () => {
  const { allMovies } = useApp()
  const [selectedGenre, setSelectedGenre] = useState<string>('All')
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating')
  const [searchFilter, setSearchFilter] = useState<string>('')

  // Filter only movies
  const moviesOnly = useMemo<Movie[]>(() => allMovies.filter((m: Movie) => m.mediaType === 'movie'), [allMovies])

  // Extract unique genres
  const availableGenres = useMemo<string[]>(() => {
    const set = new Set<string>()
    moviesOnly.forEach((m: Movie) => m.genres.forEach((g: string) => set.add(g)))
    return ['All', ...Array.from(set).sort()]
  }, [moviesOnly])

  const filteredMovies = useMemo<Movie[]>(() => {
    return moviesOnly
      .filter((m: Movie) => {
        const matchesGenre = selectedGenre === 'All' || m.genres.includes(selectedGenre)
        const matchesRating = m.voteAverage >= minRating
        const matchesSearch =
          !searchFilter.trim() ||
          m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          m.cast.some((c: string) => c.toLowerCase().includes(searchFilter.toLowerCase()))
        return matchesGenre && matchesRating && matchesSearch
      })
      .sort((a: Movie, b: Movie) => {
        if (sortBy === 'rating') return b.voteAverage - a.voteAverage
        if (sortBy === 'year') return b.releaseDate.localeCompare(a.releaseDate)
        return a.title.localeCompare(b.title)
      })
  }, [moviesOnly, selectedGenre, minRating, searchFilter, sortBy])

  const handleReset = () => {
    setSelectedGenre('All')
    setMinRating(0)
    setSortBy('rating')
    setSearchFilter('')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Film className="w-6 h-6 text-purple-400" />
            Explore Feature Films
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse our verified cinematic catalogue with interactive rating and genre filtering.
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 self-start sm:self-auto">
          {filteredMovies.length} Titles Found
        </span>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="p-4 rounded-2xl bg-[#12131f] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search within page */}
          <input
            type="text"
            placeholder="Filter by title or actor..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 w-44"
          />

          {/* Genre Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
            >
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Min Rating:</span>
            <input
              type="range"
              min="0"
              max="9"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-20 accent-purple-500 cursor-pointer"
            />
            <span className="font-bold text-yellow-400">★ {minRating.toFixed(1)}+</span>
          </div>
        </div>

        {/* Sort and Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="rating">Rating (Highest)</option>
              <option value="year">Release Date (Newest)</option>
              <option value="title">Alphabetical (A - Z)</option>
            </select>
          </div>

          {(selectedGenre !== 'All' || minRating > 0 || searchFilter || sortBy !== 'rating') && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-20 text-center space-y-3 p-8 rounded-3xl bg-[#12131f] border border-dashed border-white/10">
          <p className="text-base font-semibold text-gray-300">No movies match your filter criteria.</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} size="compact" />
          ))}
        </div>
      )}
    </div>
  )
}
