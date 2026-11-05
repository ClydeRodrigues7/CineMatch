import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { MovieCard } from '../components/movies/MovieCard'
import { Tv, RotateCcw } from 'lucide-react'
import { Movie } from '../types'

export const TvShowsPage: React.FC = () => {
  const { allMovies } = useApp()
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All')
  const [minRating, setMinRating] = useState<number>(0)
  const [searchFilter, setSearchFilter] = useState<string>('')

  // Filter only TV shows
  const tvShowsOnly = useMemo<Movie[]>(() => allMovies.filter((m: Movie) => m.mediaType === 'tv'), [allMovies])

  // Extract unique networks
  const availableNetworks = useMemo<string[]>(() => {
    const set = new Set<string>()
    tvShowsOnly.forEach((m: Movie) => {
      if (m.network) set.add(m.network)
    })
    return ['All', ...Array.from(set).sort()]
  }, [tvShowsOnly])

  const filteredShows = useMemo<Movie[]>(() => {
    return tvShowsOnly.filter((s: Movie) => {
      const matchesNetwork =
        selectedNetwork === 'All' || s.network?.includes(selectedNetwork)
      const matchesRating = s.voteAverage >= minRating
      const matchesSearch =
        !searchFilter.trim() ||
        s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.cast.some((c: string) => c.toLowerCase().includes(searchFilter.toLowerCase()))
      return matchesNetwork && matchesRating && matchesSearch
    })
  }, [tvShowsOnly, selectedNetwork, minRating, searchFilter])

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Tv className="w-6 h-6 text-cyan-400" />
            Television & Prestige Series
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Discover acclaimed television series across major streaming networks.
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto">
          {filteredShows.length} Series Found
        </span>
      </div>

      {/* Filter and Toolbar */}
      <div className="p-4 rounded-2xl bg-[#12131f] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search series or cast..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-48"
          />

          {/* Network Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Network:</span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
            >
              {availableNetworks.map((net) => (
                <option key={net} value={net}>
                  {net}
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
              className="w-20 accent-cyan-500 cursor-pointer"
            />
            <span className="font-bold text-yellow-400">★ {minRating.toFixed(1)}+</span>
          </div>
        </div>

        {(selectedNetwork !== 'All' || minRating > 0 || searchFilter) && (
          <button
            onClick={() => {
              setSelectedNetwork('All')
              setMinRating(0)
              setSearchFilter('')
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredShows.length === 0 ? (
        <div className="py-20 text-center space-y-3 p-8 rounded-3xl bg-[#12131f] border border-dashed border-white/10">
          <p className="text-base font-semibold text-gray-300">No TV series match your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredShows.map((show: Movie) => (
            <MovieCard key={show.id} movie={show} size="compact" />
          ))}
        </div>
      )}
    </div>
  )
}
