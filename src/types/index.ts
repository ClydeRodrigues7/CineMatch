// CineMatch Domain & Data Structure Types

export type MediaType = 'movie' | 'tv'

export interface Movie {
  id: string
  tmdbId?: number
  title: string
  overview: string
  posterPath: string
  backdropPath: string
  releaseDate: string
  voteAverage: number
  voteCount: number
  genres: string[]
  genreIds?: number[]
  mediaType: MediaType
  runtime?: number
  director?: string
  cast: string[]
  trailerUrl?: string
  moodTags: string[]
  network?: string
}

export type MoodId =
  | 'mind-bending'
  | 'comfort-watch'
  | 'plot-twist'
  | 'dark-twisted'
  | 'feel-good'
  | 'intense-thriller'
  | 'emotional'
  | 'adventure'

export interface MoodConfig {
  id: MoodId
  label: string
  tagline: string
  icon: string
  color: string
  gradient: string
  relevantGenres: string[]
  keyMoodTags: string[]
}

// 1. Linked List Types (Viewing History)
export interface HistoryNodeData {
  id: string
  movieId: string
  title: string
  posterPath: string
  watchedAt: number
  rating?: number
}

// 2. Tree Types (Genre Hierarchy)
export interface GenreTreeNodeData {
  id: string
  name: string
  slug: string
  description: string
  genreIds?: number[]
  movieCount?: number
  iconName?: string
}

// 3. Stack Types (Watchlist Undo System)
export type WatchlistActionType = 'ADD_TO_WATCHLIST' | 'REMOVE_FROM_WATCHLIST'

export interface WatchlistAction {
  id: string
  type: WatchlistActionType
  movie: Movie
  timestamp: number
  description: string
}

// 4. Queue Types (Watch Next FIFO Playlist)
export interface WatchNextQueueItem {
  id: string
  movie: Movie
  addedAt: number
  priorityIndex: number
}

// 5. Max Heap Types (Top-Rated / Best-Matching)
export type HeapMode = 'RATING' | 'MOOD_MATCH'

export interface HeapItem {
  id: string
  movieId: string
  title: string
  posterPath: string
  priority: number
  scoreBreakdown?: {
    moodScore?: number
    genreScore?: number
    ratingScore?: number
    explanation?: string
  }
}

export interface HeapTraceStep {
  step: number
  action: 'SWAP' | 'COMPARE' | 'INSERT' | 'EXTRACT' | 'INITIAL'
  indices: [number, number] | [number]
  arraySnapshot: HeapItem[]
  message: string
}

// 6. Hash Table Types (Instant Movie Lookup)
export interface HashEntry<T> {
  key: string
  value: T
  hash: number
}

export interface HashSearchTrace<T> {
  found: boolean
  hash: number
  bucketIndex: number
  comparisons: number
  inspectedKeys: string[]
  result?: T
  message: string
}

// 7. Graph Types (Movie Relationship Explorer)
export type GraphRelationType =
  | 'SHARED_CAST'
  | 'SAME_GENRE'
  | 'FRANCHISE'
  | 'SIMILAR_MOOD'
  | 'DIRECTOR'
  | 'RECOMMENDED'

export interface GraphEdge {
  id: string
  source: string
  target: string
  relationType: GraphRelationType
  weight: number
  label: string
  reason: string
}

export interface GraphTraversalStep {
  stepIndex: number
  currentVertexId: string
  visitedOrder: string[]
  dataStructureState: string[] // stack or queue snapshot of vertex IDs
  discoveredNeighbors: string[]
  edgeTraversed?: { from: string; to: string }
  logMessage: string
}

// Presentation Tour Types
export interface PresentationStep {
  structureId: string
  name: string
  category: string
  problemStatement: string
  whySuitable: string
  realWorldAnalogy: string
  timeComplexity: {
    best: string
    average: string
    worst: string
    operation: string
  }
  spaceComplexity: string
  vivaQuestion: string
  vivaAnswer: string
  demoActionHint: string
}
