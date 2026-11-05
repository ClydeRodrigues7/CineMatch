import React from 'react'
import {
  Brain,
  Coffee,
  Shuffle,
  Skull,
  Sun,
  Zap,
  Heart,
  Compass,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { MoodId } from '../../types'
import { MOOD_DEFINITIONS } from '../../algorithms/moodScoring'

interface MoodSelectorProps {
  selectedMood: MoodId | null
  onSelectMood: (mood: MoodId | null) => void
  minRating: number
  onMinRatingChange: (val: number) => void
  selectedGenre: string
  onSelectGenre: (genre: string) => void
  onClearFilters: () => void
}

const ICONS: Record<string, React.ElementType> = {
  Brain,
  Coffee,
  Shuffle,
  Skull,
  Sun,
  Zap,
  Heart,
  Compass,
}

const ALL_GENRES = [
  'All Genres',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Mystery',
  'Science Fiction',
  'Thriller',
]

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  minRating,
  onMinRatingChange,
  selectedGenre,
  onSelectGenre,
  onClearFilters,
}) => {
  return (
    <div className="w-full my-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Discover by Mood & Emotional State
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            Powered by a transparent deterministic ranking algorithm (Mood 45%, Genre 35%, Rating 20%).
          </p>
        </div>

        {/* Clear Filters button */}
        {(selectedMood || minRating > 0 || selectedGenre !== 'All Genres') && (
          <button
            onClick={onClearFilters}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Discovery Filters
          </button>
        )}
      </div>

      {/* Mood Cards Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {(Object.keys(MOOD_DEFINITIONS) as MoodId[]).map((moodId) => {
          const config = MOOD_DEFINITIONS[moodId]
          const isSelected = selectedMood === moodId
          const IconComp = ICONS[config.icon] || Sparkles

          return (
            <button
              key={moodId}
              onClick={() => onSelectMood(isSelected ? null : moodId)}
              className={`group flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-b ${config.gradient} text-white border-white/40 shadow-glow-sm scale-[1.03]`
                  : 'bg-[#12131f]/80 hover:bg-[#181a29] text-gray-300 border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div
                className={`p-2 rounded-xl mb-2 transition-transform duration-300 group-hover:scale-110 ${
                  isSelected ? 'bg-black/30' : 'bg-white/5 text-purple-400'
                }`}
              >
                <IconComp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold tracking-tight line-clamp-1">{config.label}</span>
            </button>
          )
        })}
      </div>

      {/* Filter Adjuster Bar */}
      {selectedMood && (
        <div className="p-4 rounded-2xl bg-[#131422] border border-white/10 flex flex-wrap items-center justify-between gap-4 animate-fade-in text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Tuning Filters:
            </span>

            {/* Min Rating Slider */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Min Rating:</span>
              <input
                type="range"
                min="0"
                max="9"
                step="0.5"
                value={minRating}
                onChange={(e) => onMinRatingChange(parseFloat(e.target.value))}
                className="w-24 accent-purple-500 cursor-pointer"
              />
              <span className="font-bold text-yellow-400">★ {minRating.toFixed(1)}+</span>
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Genre Affinity:</span>
            <select
              value={selectedGenre}
              onChange={(e) => onSelectGenre(e.target.value)}
              className="bg-[#1a1b2d] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-purple-500"
            >
              {ALL_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
