import { MoodConfig, MoodId, Movie } from '../types'

// Deterministic Transparent Mood-Scoring Algorithm
// Formula:
// Score = (MoodTagMatchRatio * 0.45 + GenreAffinityRatio * 0.35 + NormalizedRating * 0.20) * 100
// Clearly documented weights suitable for college evaluation and viva presentation.

export const MOOD_DEFINITIONS: Record<MoodId, MoodConfig> = {
  'mind-bending': {
    id: 'mind-bending',
    label: 'Mind-Bending',
    tagline: 'Complex realities, paradoxes & psychological puzzles',
    icon: 'Brain',
    color: '#8b5cf6',
    gradient: 'from-purple-600 to-indigo-700',
    relevantGenres: ['Science Fiction', 'Mystery', 'Thriller'],
    keyMoodTags: ['mind-bending', 'time-travel', 'delusion', 'philosophical', 'multiverse'],
  },
  'comfort-watch': {
    id: 'comfort-watch',
    label: 'Comfort Watch',
    tagline: 'Warmth, gentle humor, nostalgic favorites & peace',
    icon: 'Coffee',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-700',
    relevantGenres: ['Comedy', 'Animation', 'Family', 'Romance'],
    keyMoodTags: ['comfort-watch', 'wholesome', 'uplifting', 'nostalgic', 'feel-good'],
  },
  'plot-twist': {
    id: 'plot-twist',
    label: 'Plot Twist',
    tagline: 'Jaw-dropping revelations that redefine everything',
    icon: 'Shuffle',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-700',
    relevantGenres: ['Mystery', 'Thriller', 'Crime', 'Drama'],
    keyMoodTags: ['plot-twist', 'surprise-ending', 'deception', 'unreliable-narrator'],
  },
  'dark-twisted': {
    id: 'dark-twisted',
    label: 'Dark & Twisted',
    tagline: 'Psychological darkness, grim noir & moral ambiguity',
    icon: 'Skull',
    color: '#ef4444',
    gradient: 'from-red-600 to-rose-900',
    relevantGenres: ['Horror', 'Crime', 'Thriller', 'Drama'],
    keyMoodTags: ['dark-twisted', 'noir', 'gritty', 'dystopian', 'psychological'],
  },
  'feel-good': {
    id: 'feel-good',
    label: 'Feel Good',
    tagline: 'High spirits, triumph of hope, friendship & smiles',
    icon: 'Sun',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    relevantGenres: ['Comedy', 'Animation', 'Adventure', 'Music'],
    keyMoodTags: ['feel-good', 'triumph', 'inspiring', 'friendship', 'comedy'],
  },
  'intense-thriller': {
    id: 'intense-thriller',
    label: 'Intense Thriller',
    tagline: 'Edge-of-your-seat suspense, ticking clocks & adrenaline',
    icon: 'Zap',
    color: '#ec4899',
    gradient: 'from-pink-600 to-purple-800',
    relevantGenres: ['Action', 'Thriller', 'Crime', 'Adventure'],
    keyMoodTags: ['intense-thriller', 'heist', 'survival', 'high-stakes', 'chase'],
  },
  'emotional': {
    id: 'emotional',
    label: 'Deeply Emotional',
    tagline: 'Poignant, tear-jerking journeys of the human heart',
    icon: 'Heart',
    color: '#a855f7',
    gradient: 'from-fuchsia-600 to-purple-900',
    relevantGenres: ['Drama', 'Romance', 'Biography'],
    keyMoodTags: ['emotional', 'bittersweet', 'heartbreaking', 'triumph', 'human-spirit'],
  },
  'adventure': {
    id: 'adventure',
    label: 'Epic Adventure',
    tagline: 'Vast worlds, daring quests and grand spectacles',
    icon: 'Compass',
    color: '#3b82f6',
    gradient: 'from-blue-600 to-indigo-800',
    relevantGenres: ['Adventure', 'Action', 'Fantasy', 'Science Fiction'],
    keyMoodTags: ['adventure', 'quest', 'cosmic', 'superhero', 'spectacle'],
  },
}

export interface MoodMatchResult {
  score: number // 0 to 100
  moodTagScore: number // 0 to 45
  genreScore: number // 0 to 35
  ratingScore: number // 0 to 20
  matchedTags: string[]
  matchedGenres: string[]
  explanation: string
}

export function calculateMoodScore(
  movie: Movie,
  targetMood: MoodId,
  minRatingFilter = 0
): MoodMatchResult {
  const config = MOOD_DEFINITIONS[targetMood]

  // 1. Mood Tag Match (Weight: 45%)
  const matchedTags = movie.moodTags.filter((tag) =>
    config.keyMoodTags.some((kt) => kt.toLowerCase() === tag.toLowerCase())
  )
  const tagRatio = Math.min(matchedTags.length / 2, 1) // 2 matched tags = 100% of mood weight
  const moodTagScore = Number((tagRatio * 45).toFixed(1))

  // 2. Genre Affinity Match (Weight: 35%)
  const matchedGenres = movie.genres.filter((g) =>
    config.relevantGenres.some((rg) => rg.toLowerCase() === g.toLowerCase())
  )
  const genreRatio = Math.min(matchedGenres.length / 2, 1)
  const genreScore = Number((genreRatio * 35).toFixed(1))

  // 3. Normalized Rating Match (Weight: 20%)
  // Normalized from TMDB vote average (0 - 10)
  const effectiveRating = movie.voteAverage >= minRatingFilter ? movie.voteAverage : 0
  const ratingRatio = Math.min(effectiveRating / 10, 1)
  const ratingScore = Number((ratingRatio * 20).toFixed(1))

  const totalScore = Math.round(moodTagScore + genreScore + ratingScore)

  let explanation = ''
  if (matchedTags.length > 0 && matchedGenres.length > 0) {
    explanation = `Matches "${config.label}" mood via [${matchedTags.join(', ')}] with ${matchedGenres.join(' & ')} genre affinity and ${movie.voteAverage.toFixed(1)}/10 rating.`
  } else if (matchedGenres.length > 0) {
    explanation = `Matches ${config.label} genre tone (${matchedGenres.join(', ')}) with strong audience rating (${movie.voteAverage.toFixed(1)}/10).`
  } else {
    explanation = `General recommendation based on overall quality score (${movie.voteAverage.toFixed(1)}/10).`
  }

  return {
    score: totalScore,
    moodTagScore,
    genreScore,
    ratingScore,
    matchedTags,
    matchedGenres,
    explanation,
  }
}
