import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { Movie, WatchlistAction, MoodId, HistoryNodeData } from '../types'
import { SAMPLE_MOVIES } from '../data/sampleMovies'
import { SinglyLinkedList } from '../structures/LinkedList'
import { Stack } from '../structures/Stack'
import { LinkedQueue } from '../structures/Queue'
import { MaxHeap } from '../structures/MaxHeap'
import { MovieHashTable } from '../structures/HashTable'
import { GenreTree } from '../structures/GenreTree'
import { MovieGraph } from '../structures/MovieGraph'
import { ensureMovieArtwork, tmdbService } from '../services/tmdb'
import { toast } from 'sonner'
import { calculateMoodScore } from '../algorithms/moodScoring'

interface AppContextType {
  // Movies & Discovery
  allMovies: Movie[]
  isLoadingCatalogue: boolean
  isOfflineMode: boolean
  toggleOfflineMode: () => void
  refreshCatalogue: () => Promise<void>
  selectedMovie: Movie | null
  setSelectedMovie: (movie: Movie | null) => void
  trailerMovie: Movie | null
  setTrailerMovie: (movie: Movie | null) => void
  activeMood: MoodId | null
  setActiveMood: (mood: MoodId | null) => void

  // 1. Singly Linked List (Viewing History)
  historyList: SinglyLinkedList<HistoryNodeData>
  historyItems: HistoryNodeData[]
  markAsWatched: (movie: Movie) => void
  appendAsWatched: (movie: Movie) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void

  // 2. Stack (Watchlist & Undo)
  watchlist: Movie[]
  watchlistStack: Stack<WatchlistAction>
  addToWatchlist: (movie: Movie) => void
  removeFromWatchlist: (movieId: string) => void
  undoLastWatchlistAction: () => boolean
  canUndo: boolean
  lastUndoAction: WatchlistAction | undefined

  // 3. Queue (Watch Next FIFO)
  watchNextQueue: LinkedQueue<Movie>
  watchNextItems: Movie[]
  addToWatchNext: (movie: Movie) => void
  dequeueWatchNext: () => Movie | undefined
  clearWatchNext: () => void
  syncWatchNextFromDsa: (movies: Movie[]) => void

  // 4. Genre Tree
  genreTree: GenreTree

  // 5. Max Heap
  maxHeap: MaxHeap
  rebuildHeap: (mode: 'RATING' | 'MOOD_MATCH', moodId?: MoodId) => void

  // 6. Hash Table
  movieHashTable: MovieHashTable<Movie>

  // 7. Graph
  movieGraph: MovieGraph

  // Helper Stats for Overview Dashboard
  stats: {
    catalogueCount: number
    watchlistCount: number
    queueCount: number
    historyCount: number
    heapCount: number
    hashCount: number
    graphNodesCount: number
    graphEdgesCount: number
  }

  resetAllDsaToDefault: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Master catalogue of movies — hydrated demo posters by default, live TMDB when configured
  const [allMovies, setAllMovies] = useState<Movie[]>(() => SAMPLE_MOVIES.map(ensureMovieArtwork))
  const [isLoadingCatalogue, setIsLoadingCatalogue] = useState(true)
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => tmdbService.isDemoModeActive())
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null)
  const [activeMood, setActiveMood] = useState<MoodId | null>(null)

  const demoCatalogue = useMemo(() => SAMPLE_MOVIES.map(ensureMovieArtwork), [])

  // 1. Linked List: Viewing History
  const [historyList] = useState<SinglyLinkedList<HistoryNodeData>>(() => {
    const list = new SinglyLinkedList<HistoryNodeData>()
    const seeded = SAMPLE_MOVIES.map(ensureMovieArtwork)
    try {
      const saved = localStorage.getItem('cinematch_history')
      if (saved) {
        const parsed: HistoryNodeData[] = JSON.parse(saved)
        parsed.reverse().forEach((item) => {
          const match = seeded.find((m) => m.id === item.movieId)
          list.prepend({
            ...item,
            posterPath: match?.posterPath || item.posterPath,
          })
        })
      } else {
        seeded.slice(0, 6).forEach((movie, index) => {
          list.append({
            id: `hist-seed-${index + 1}`,
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.posterPath,
            watchedAt: Date.now() - 86400000 * (6 - index),
          })
        })
      }
    } catch {
      // Fallback
    }
    return list
  })
  const [historyItems, setHistoryItems] = useState<HistoryNodeData[]>(() => historyList.toArray())

  // 2. Stack: Watchlist Undo System
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('cinematch_watchlist')
      if (saved) return (JSON.parse(saved) as Movie[]).map(ensureMovieArtwork)
    } catch {}
    const seeded = SAMPLE_MOVIES.map(ensureMovieArtwork)
    return [seeded[0], seeded[3], seeded[4]]
  })
  const [watchlistStack] = useState<Stack<WatchlistAction>>(() => new Stack<WatchlistAction>())
  const [stackVersion, setStackVersion] = useState(0)

  // 3. Queue: Watch Next FIFO Playlist
  const [watchNextQueue] = useState<LinkedQueue<Movie>>(() => {
    const q = new LinkedQueue<Movie>()
    const seeded = SAMPLE_MOVIES.map(ensureMovieArtwork)
    try {
      const saved = localStorage.getItem('cinematch_watch_next')
      if (saved) {
        const parsed: Movie[] = JSON.parse(saved)
        parsed.forEach((m) => q.enqueue(ensureMovieArtwork(m)))
      } else {
        q.enqueue(seeded[1])
        q.enqueue(seeded[9])
        q.enqueue(seeded[4])
      }
    } catch {}
    return q
  })
  const [watchNextItems, setWatchNextItems] = useState<Movie[]>(() => watchNextQueue.toArray())

  // 4. Tree: Genre Hierarchy
  const [genreTree] = useState<GenreTree>(() => new GenreTree())

  // 5. Max Heap: Priority Ranking
  const [maxHeap] = useState<MaxHeap>(() => {
    const heap = new MaxHeap()
    const items = SAMPLE_MOVIES.slice(0, 10).map((m) => ({
      id: m.id,
      movieId: m.id,
      title: m.title,
      posterPath: m.posterPath,
      priority: m.voteAverage,
    }))
    heap.buildHeap(items)
    return heap
  })
  const [heapVersion, setHeapVersion] = useState(0)

  // 6. Hash Table: Instant Movie Lookup with separate chaining
  const [movieHashTable] = useState<MovieHashTable<Movie>>(() => {
    const table = new MovieHashTable<Movie>(10)
    demoCatalogue.forEach((movie) => {
      table.set(movie.id, movie)
    })
    return table
  })

  const refreshCatalogue = useCallback(async () => {
    setIsLoadingCatalogue(true)
    try {
      const catalogue = await tmdbService.getCatalogue()
      setAllMovies(catalogue)
      catalogue.forEach((movie) => movieHashTable.set(movie.id, movie))
    } catch {
      setAllMovies(demoCatalogue)
    } finally {
      setIsLoadingCatalogue(false)
    }
  }, [demoCatalogue, movieHashTable])

  useEffect(() => {
    void refreshCatalogue()
  }, [refreshCatalogue])

  // 7. Graph: Movie Relationship Network
  const [movieGraph] = useState<MovieGraph>(() => {
    const graph = new MovieGraph()
    SAMPLE_MOVIES.forEach((m) => graph.addVertex(m))

    // Curated rich relationships
    // Nolan Universe
    graph.addEdge('demo-7', 'demo-8', 'SAME_GENRE', 0.9, 'Nolan Sci-Fi', 'Both directed by Christopher Nolan with mind-bending cosmic themes')
    graph.addEdge('demo-7', 'demo-6', 'DIRECTOR', 0.85, 'Shared Director', 'Both directed by Christopher Nolan')
    graph.addEdge('demo-7', 'demo-9', 'DIRECTOR', 0.85, 'Shared Director', 'Both directed by Christopher Nolan')
    graph.addEdge('demo-8', 'demo-6', 'SHARED_CAST', 0.8, 'Matt Damon', 'Both feature Matt Damon in crucial roles')

    // DC Superhero Cluster
    graph.addEdge('demo-1', 'demo-3', 'FRANCHISE', 0.9, 'DC Universe', 'Part of the DC Extended Universe')
    graph.addEdge('demo-1', 'demo-9', 'FRANCHISE', 0.75, 'Batman & Flash', 'Both feature Batman lore')
    graph.addEdge('demo-3', 'demo-9', 'FRANCHISE', 0.8, 'Dark Knight Lore', 'DC Gotham City mythology')

    // Multiverse / Sci-Fi
    graph.addEdge('demo-4', 'demo-10', 'SIMILAR_MOOD', 0.95, 'Multiverse Odyssey', 'Both explore chaotic multiverses and emotional family bonds')
    graph.addEdge('demo-4', 'demo-16', 'SAME_GENRE', 0.85, 'Masterpiece Animation', 'Stylized groundbreaking visual animation')
    graph.addEdge('demo-10', 'demo-23', 'SIMILAR_MOOD', 0.8, 'Reality Bending', 'Protagonists awakened to infinite realities')
    graph.addEdge('demo-7', 'demo-23', 'SIMILAR_MOOD', 0.85, 'Simulated Worlds', 'Dreamscapes and virtual reality illusions')

    // Dark Drama / Thrillers
    graph.addEdge('demo-20', 'demo-25', 'SAME_GENRE', 0.85, 'Crime Empire', 'The rise and fall of underworld syndicates')
    graph.addEdge('demo-20', 'demo-24', 'SIMILAR_MOOD', 0.8, 'Dark Transformation', 'Moral decay and alter-egos')
    graph.addEdge('demo-11', 'demo-15', 'SIMILAR_MOOD', 0.85, 'Class Conflict', 'Black comedy satire on class resentment')
    graph.addEdge('demo-14', 'demo-19', 'SIMILAR_MOOD', 0.8, 'Supernatural Survival', 'Surviving in apocalyptic / strange worlds')

    // Comfort / Adventure
    graph.addEdge('demo-2', 'demo-21', 'SAME_GENRE', 0.85, 'Fantasy Magic', 'Rich magical lore and spellcasting companions')
    graph.addEdge('demo-12', 'demo-28', 'SAME_GENRE', 0.8, 'Family Fun', 'Bright, colorful, lighthearted family adventures')
    graph.addEdge('demo-5', 'demo-26', 'RECOMMENDED', 0.8, 'Cinematic Spectacle', 'High-adrenaline theater-grade masterpieces')

    return graph
  })

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('cinematch_watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    localStorage.setItem('cinematch_history', JSON.stringify(historyItems))
  }, [historyItems])

  useEffect(() => {
    localStorage.setItem('cinematch_watch_next', JSON.stringify(watchNextItems))
  }, [watchNextItems])

  // Watchlist Actions & Undo Stack
  const addToWatchlist = useCallback(
    (movie: Movie) => {
      if (watchlist.some((m) => m.id === movie.id)) {
        toast.info(`"${movie.title}" is already in your Watchlist.`)
        return
      }

      setWatchlist((prev) => [movie, ...prev])
      watchlistStack.push({
        id: `act-${Date.now()}`,
        type: 'ADD_TO_WATCHLIST',
        movie,
        timestamp: Date.now(),
        description: `Added "${movie.title}" to Watchlist`,
      })
      setStackVersion((v) => v + 1)
      toast.success(`Added "${movie.title}" to Watchlist`, {
        action: {
          label: 'Undo',
          onClick: () => undoLastWatchlistAction(),
        },
      })
    },
    [watchlist, watchlistStack]
  )

  const removeFromWatchlist = useCallback(
    (movieId: string) => {
      const movie = watchlist.find((m) => m.id === movieId)
      if (!movie) return

      setWatchlist((prev) => prev.filter((m) => m.id !== movieId))
      watchlistStack.push({
        id: `act-${Date.now()}`,
        type: 'REMOVE_FROM_WATCHLIST',
        movie,
        timestamp: Date.now(),
        description: `Removed "${movie.title}" from Watchlist`,
      })
      setStackVersion((v) => v + 1)
      toast.info(`Removed "${movie.title}" from Watchlist`, {
        action: {
          label: 'Undo',
          onClick: () => undoLastWatchlistAction(),
        },
      })
    },
    [watchlist, watchlistStack]
  )

  // Real LIFO Undo Operation
  const undoLastWatchlistAction = useCallback((): boolean => {
    const action = watchlistStack.pop()
    if (!action) {
      toast.error('Nothing to undo: Watchlist Undo Stack is empty.')
      return false
    }

    setStackVersion((v) => v + 1)

    if (action.type === 'ADD_TO_WATCHLIST') {
      // Revert addition by removing the movie
      setWatchlist((prev) => prev.filter((m) => m.id !== action.movie.id))
      toast.success(`[Stack Pop]: Reverted addition of "${action.movie.title}".`)
    } else if (action.type === 'REMOVE_FROM_WATCHLIST') {
      // Revert removal by re-inserting the movie
      setWatchlist((prev) => [action.movie, ...prev])
      toast.success(`[Stack Pop]: Restored "${action.movie.title}" to Watchlist.`)
    }

    return true
  }, [watchlistStack])

  // Queue Operations
  const addToWatchNext = useCallback(
    (movie: Movie) => {
      watchNextQueue.enqueue(movie)
      setWatchNextItems(watchNextQueue.toArray())
      toast.success(`Enqueued "${movie.title}" at the REAR of Watch Next.`)
    },
    [watchNextQueue]
  )

  const dequeueWatchNext = useCallback((): Movie | undefined => {
    const movie = watchNextQueue.dequeue()
    if (movie) {
      setWatchNextItems(watchNextQueue.toArray())
      toast.success(`[FIFO Dequeue]: Playing next in line: "${movie.title}".`)
    } else {
      toast.info('Watch Next queue is empty.')
    }
    return movie
  }, [watchNextQueue])

  const clearWatchNext = useCallback(() => {
    watchNextQueue.clear()
    setWatchNextItems([])
    toast.info('Watch Next queue cleared.')
  }, [watchNextQueue])

  const syncWatchNextFromDsa = useCallback((movies: Movie[]) => {
    watchNextQueue.clear()
    movies.forEach((movie) => watchNextQueue.enqueue(movie))
    setWatchNextItems(watchNextQueue.toArray())
  }, [watchNextQueue])

  // Linked List History Operations
  const markAsWatched = useCallback(
    (movie: Movie) => {
      const nodeData: HistoryNodeData = {
        id: `hist-${Date.now()}`,
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        watchedAt: Date.now(),
        rating: movie.voteAverage,
      }
      historyList.prepend(nodeData)
      setHistoryItems(historyList.toArray())
      toast.success(`Marked "${movie.title}" as watched (Prepended to Linked List).`)
    },
    [historyList]
  )

  const appendAsWatched = useCallback(
    (movie: Movie) => {
      const nodeData: HistoryNodeData = {
        id: `hist-${Date.now()}`,
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        watchedAt: Date.now(),
        rating: movie.voteAverage,
      }
      historyList.append(nodeData)
      setHistoryItems(historyList.toArray())
      toast.success(`Marked "${movie.title}" as watched (Appended to Linked List).`)
    },
    [historyList]
  )

  const removeFromHistory = useCallback(
    (id: string) => {
      const success = historyList.removeById(id, (item) => item.id)
      if (success) {
        setHistoryItems(historyList.toArray())
        toast.info('Removed entry from Viewing History linked list.')
      }
    },
    [historyList]
  )

  const clearHistory = useCallback(() => {
    historyList.clear()
    setHistoryItems([])
    toast.info('Viewing History linked list reset.')
  }, [historyList])

  // Rebuild Max-Heap based on Mode
  const rebuildHeap = useCallback(
    (mode: 'RATING' | 'MOOD_MATCH', moodId?: MoodId) => {
      maxHeap.clear()
      const items = allMovies.map((movie) => {
        let priority = movie.voteAverage
        let breakdown: any = undefined

        if (mode === 'MOOD_MATCH' && moodId) {
          const res = calculateMoodScore(movie, moodId)
          priority = res.score
          breakdown = {
            moodScore: res.moodTagScore,
            genreScore: res.genreScore,
            ratingScore: res.ratingScore,
            explanation: res.explanation,
          }
        }

        return {
          id: movie.id,
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.posterPath,
          priority,
          scoreBreakdown: breakdown,
        }
      })

      maxHeap.buildHeap(items)
      setHeapVersion((v) => v + 1)
    },
    [allMovies, maxHeap]
  )

  const toggleOfflineMode = useCallback(() => {
    setIsOfflineMode((prev) => {
      const next = !prev
      tmdbService.setForceDemoMode(next)
      toast(next ? 'Switched to Bundled Offline Demo Mode' : 'Switched to TMDB Online Mode')
      void tmdbService.getCatalogue().then((catalogue) => {
        setAllMovies(catalogue)
        catalogue.forEach((movie) => movieHashTable.set(movie.id, movie))
      })
      return next
    })
  }, [movieHashTable])

  const resetAllDsaToDefault = useCallback(() => {
    const seeded = demoCatalogue
    historyList.clear()
    seeded.slice(0, 6).forEach((movie, index) => {
      historyList.append({
        id: `hist-seed-${index + 1}`,
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        watchedAt: Date.now() - 86400000 * (6 - index),
      })
    })
    setHistoryItems(historyList.toArray())

    setWatchlist([seeded[0], seeded[3], seeded[4]])
    watchlistStack.clear()
    setStackVersion((v) => v + 1)

    watchNextQueue.clear()
    watchNextQueue.enqueue(seeded[1])
    watchNextQueue.enqueue(seeded[9])
    watchNextQueue.enqueue(seeded[4])
    setWatchNextItems(watchNextQueue.toArray())

    // Reset Tree
    genreTree.reset()

    // Reset Heap
    rebuildHeap('RATING')

    toast.success('All seven Data Structures successfully reset to default academic state.')
  }, [demoCatalogue, genreTree, historyList, rebuildHeap, watchNextQueue, watchlistStack])

  // Live Statistics calculated directly from active memory
  const stats = useMemo(
    () => ({
      catalogueCount: allMovies.length,
      watchlistCount: watchlist.length,
      queueCount: watchNextItems.length,
      historyCount: historyItems.length,
      heapCount: maxHeap.size,
      hashCount: movieHashTable.size,
      graphNodesCount: movieGraph.vertexCount,
      graphEdgesCount: movieGraph.edgeCount,
    }),
    [
      allMovies.length,
      watchlist.length,
      watchNextItems.length,
      historyItems.length,
      heapVersion,
      maxHeap.size,
      movieHashTable.size,
      movieGraph.vertexCount,
      movieGraph.edgeCount,
    ]
  )

  const value: AppContextType = {
    allMovies,
    isLoadingCatalogue,
    isOfflineMode,
    toggleOfflineMode,
    refreshCatalogue,
    selectedMovie,
    setSelectedMovie,
    trailerMovie,
    setTrailerMovie,
    activeMood,
    setActiveMood,
    historyList,
    historyItems,
    markAsWatched,
    appendAsWatched,
    removeFromHistory,
    clearHistory,
    watchlist,
    watchlistStack,
    addToWatchlist,
    removeFromWatchlist,
    undoLastWatchlistAction,
    canUndo: !watchlistStack.isEmpty(),
    lastUndoAction: watchlistStack.peek(),
    watchNextQueue,
    watchNextItems,
    addToWatchNext,
    dequeueWatchNext,
    clearWatchNext,
    syncWatchNextFromDsa,
    genreTree,
    maxHeap,
    rebuildHeap,
    movieHashTable,
    movieGraph,
    stats,
    resetAllDsaToDefault,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextType {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
