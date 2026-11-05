import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { HeroBanner } from '../components/movies/HeroBanner'
import { StreamingStudiosBar } from '../components/movies/StreamingStudiosBar'
import { MovieRow } from '../components/movies/MovieRow'
import { NumberedRankCard } from '../components/movies/NumberedRankCard'
import { MoodSelector } from '../components/movies/MoodSelector'
import { MoodId, Movie } from '../types'
import { calculateMoodScore, MOOD_DEFINITIONS } from '../algorithms/moodScoring'
import { Flame, Sparkles } from 'lucide-react'

export const DiscoverPage: React.FC = () => {
  const { allMovies, isLoadingCatalogue, activeMood, setActiveMood } = useApp()
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null)
  const [minRating, setMinRating] = useState<number>(0)
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres')

  // Top spotlight movies for Hero Banner
  const heroMovies = useMemo<Movie[]>(
    () =>
      [allMovies[0], allMovies[2], allMovies[1], allMovies[5]].filter(
        (m): m is Movie => Boolean(m)
      ),
    [allMovies]
  )

  // Top of the Week (Numbered cards 1 - 4 as shown in the reference design)
  const topOfWeekMovies = useMemo<Movie[]>(() => {
    return [...allMovies].sort((a: Movie, b: Movie) => b.voteAverage - a.voteAverage).slice(0, 4)
  }, [allMovies])

  // Studio-filtered movies
  const studioFilteredMovies = useMemo<Movie[]>(() => {
    if (!selectedStudio) return allMovies
    return allMovies.filter((m: Movie) =>
      m.network?.toLowerCase().includes(selectedStudio.toLowerCase())
    )
  }, [allMovies, selectedStudio])

  // Deterministic Mood Match ranking
  const moodMatchedResults = useMemo(() => {
    if (!activeMood) return []
    return allMovies
      .map((movie: Movie) => {
        const result = calculateMoodScore(movie, activeMood, minRating)
        return {
          movie,
          ...result,
        }
      })
      .filter((item) => {
        const matchesRating = item.movie.voteAverage >= minRating
        const matchesGenre =
          selectedGenre === 'All Genres' ||
          item.movie.genres.some((g: string) => g.toLowerCase() === selectedGenre.toLowerCase())
        return matchesRating && matchesGenre
      })
      .sort((a, b) => b.score - a.score)
  }, [allMovies, activeMood, minRating, selectedGenre])

  // Curated mood-specific rows using deterministic tags
  const mindBendingRow = useMemo<Movie[]>(
    () => allMovies.filter((m: Movie) => m.moodTags.includes('mind-bending')),
    [allMovies]
  )
  const comfortWatchRow = useMemo<Movie[]>(
    () => allMovies.filter((m: Movie) => m.moodTags.includes('comfort-watch')),
    [allMovies]
  )
  const plotTwistRow = useMemo<Movie[]>(
    () => allMovies.filter((m: Movie) => m.moodTags.includes('plot-twist')),
    [allMovies]
  )
  const darkTwistedRow = useMemo<Movie[]>(
    () => allMovies.filter((m: Movie) => m.moodTags.includes('dark-twisted')),
    [allMovies]
  )
  const tvSeriesRow = useMemo<Movie[]>(
    () => allMovies.filter((m: Movie) => m.mediaType === 'tv'),
    [allMovies]
  )

  const handleClearFilters = () => {
    setActiveMood(null)
    setMinRating(0)
    setSelectedGenre('All Genres')
  }

  if (isLoadingCatalogue && allMovies.length === 0) {
    return (
      <div className="animate-fade-in space-y-6 pb-12">
        <div className="h-[440px] animate-pulse rounded-3xl bg-card" />
        <div className="h-12 animate-pulse rounded-xl bg-card" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Cinematic Hero Banner */}
      <HeroBanner featuredMovies={heroMovies} />

      {/* 2. Streaming Studios Pill Bar (Disney+, Netflix, HBO Max, etc.) */}
      <StreamingStudiosBar
        selectedStudio={selectedStudio}
        onSelectStudio={(name: string) => setSelectedStudio(name || null)}
      />

      {/* 3. Popular of the Week (Numbered 1, 2, 3, 4 Cards from reference image) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Popular of the Week
          </h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Top 4 Ranked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topOfWeekMovies.map((movie, idx) => (
            <NumberedRankCard key={movie.id} movie={movie} rank={idx + 1} />
          ))}
        </div>
      </section>

      {/* 4. Interactive Mood Selector */}
      <MoodSelector
        selectedMood={activeMood}
        onSelectMood={setActiveMood}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        onClearFilters={handleClearFilters}
      />

      {/* If mood is active, display ranked match score results with transparent explanations */}
      {activeMood && (
        <section className="p-6 rounded-3xl bg-[#10111d] border border-purple-500/30 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Ranked Recommendations for "{MOOD_DEFINITIONS[activeMood].label}"
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Ordered deterministically by transparent formula: (Mood Tags 45% + Genre Affinity 35% + Rating 20%).
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 self-start sm:self-auto">
              {moodMatchedResults.length} Matched Titles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {moodMatchedResults.map(({ movie, score, explanation }: { movie: Movie; score: number; explanation: string }) => (
              <div
                key={movie.id}
                className="p-3.5 rounded-2xl bg-[#161828] border border-white/10 hover:border-purple-500/40 transition-all flex gap-3.5"
              >
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded-xl border border-white/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{movie.title}</h4>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-purple-600 text-white font-mono shadow-glow-sm">
                        {score}% Match
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 block truncate">
                      {movie.releaseDate.split('-')[0]} • {movie.genres.join(', ')}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06] mt-2">
                    <p className="text-[10px] text-purple-200 leading-snug line-clamp-2 italic">
                      "{explanation}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Trending & Popular Curated Rows */}
      <MovieRow
        title="Trending Now"
        subtitle="Global audience favorites updated hourly"
        movies={studioFilteredMovies.slice(0, 10)}
        badge="Live Trending"
      />

      <MovieRow
        title="Top Rated Masterpieces"
        subtitle="Critically acclaimed cinematic landmarks"
        movies={[...studioFilteredMovies].sort((a: Movie, b: Movie) => b.voteAverage - a.voteAverage).slice(0, 10)}
        badge="Critique Score"
      />

      {/* 6. Mid-Page Featured Spotlight */}
      <section className="relative w-full rounded-3xl overflow-hidden border border-white/10 my-8 bg-gradient-to-r from-purple-950/60 to-indigo-950/40 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <img
            src={allMovies[2].backdropPath}
            alt={allMovies[2].title}
            className="w-full lg:w-1/2 h-56 sm:h-72 object-cover rounded-2xl border border-white/10 shadow-glow-sm"
          />

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                Cinematic Spotlight
              </span>
              <span className="text-xs text-yellow-400 font-bold">★ {allMovies[2].voteAverage.toFixed(1)} Rating</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {allMovies[2].title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3">
              {allMovies[2].overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {}}
                className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors"
              >
                View Spotlight Details
              </button>
              <span className="text-xs text-gray-400">
                Connected to {allMovies[0].title} & {allMovies[8].title} in Adjacency Graph
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Mood-Specific Rows */}
      <MovieRow
        title="Mind-Bending & Paradoxes"
        subtitle="Challenging narratives that question reality and time"
        movies={mindBendingRow}
        badge="Complex Realities"
      />

      <MovieRow
        title="Comfort Watches & Warmth"
        subtitle="Feel-good, lighthearted, and wholesome adventures"
        movies={comfortWatchRow}
        badge="Cozy Vibes"
      />

      <MovieRow
        title="Plot Twist & Shocking Endings"
        subtitle="Unpredictable stories with unforgettable reveals"
        movies={plotTwistRow}
        badge="Jaw-Dropping"
      />

      <MovieRow
        title="Dark, Twisted & Gritty"
        subtitle="Psychological tension, noir crime, and moral ambiguity"
        movies={darkTwistedRow}
        badge="High Tension"
      />

      <MovieRow
        title="Popular TV & Prestige Series"
        subtitle="Binge-worthy seasonal storytelling"
        movies={tvSeriesRow}
        badge="Television"
      />
    </div>
  )
}
