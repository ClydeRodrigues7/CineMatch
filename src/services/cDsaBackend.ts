export type CStructure = 'LIST' | 'TREE' | 'STACK' | 'QUEUE' | 'HEAP' | 'HASH' | 'GRAPH'

export interface MovieRecord {
  id: string
  title: string
  priority: number
}

export interface GenreNode {
  name: string
  children: GenreNode[]
}

export interface LinkedListState {
  head: string
  tail: string
  nodes: Array<MovieRecord & { next: string | null }>
}

export interface StackState {
  watchlist: MovieRecord[]
  topFirst: Array<{ action: 'ADD_TO_WATCHLIST' | 'REMOVE_FROM_WATCHLIST'; index: number; movie: MovieRecord }>
}

export interface QueueState {
  front: string
  rear: string
  items: MovieRecord[]
}

export interface HeapTreeNode {
  index: number
  movie: MovieRecord
  left: HeapTreeNode | null
  right: HeapTreeNode | null
}

export interface HeapTraceStep {
  phase: string
  index: number
  otherIndex: number
  array: MovieRecord[]
}

export interface HeapState {
  array: MovieRecord[]
  max: MovieRecord | null
  tree: HeapTreeNode | null
}

export interface HashState {
  bucketCount: number
  size: number
  collisions: number
  buckets: MovieRecord[][]
}

export interface GraphState {
  vertices: MovieRecord[]
  edges: [string, string][]
  traversal: MovieRecord[]
  path: string[]
}

export type CStructureState =
  | LinkedListState
  | GenreNode
  | StackState
  | QueueState
  | HeapState
  | HashState
  | GraphState

export interface CBackendResult {
  ok: boolean
  message: string
  state?: CStructureState | null
  found?: boolean
  subtree?: GenreNode
  traversal?: string[]
  heapTrace?: HeapTraceStep[]
}

type CBackendHealth = Omit<CBackendResult, 'state'> & {
  state?: {
    ready: boolean
    language: string
    structures: number
  }
}

export async function checkCBackend(): Promise<CBackendHealth> {
  const response = await fetch('/api/dsa/health')
  const result = await response.json() as CBackendHealth
  if (!response.ok || !result.ok) throw new Error(result.message || 'C backend health check failed.')
  return result
}

async function requestCOperation(payload: Record<string, string | number>): Promise<CBackendResult> {
  const response = await fetch('/api/dsa/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await response.json() as CBackendResult
  if (!response.ok || !result.ok) throw new Error(result.message || 'C operation failed.')
  return result
}

let operationQueue: Promise<unknown> = Promise.resolve()

function serializeOperation<T>(operation: () => Promise<T>): Promise<T> {
  const task = operationQueue.then(operation)
  operationQueue = task.catch(() => {})
  return task
}

export function executeCOperation(payload: Record<string, string | number>): Promise<CBackendResult> {
  return serializeOperation(() => requestCOperation(payload))
}

interface LibraryMovie {
  id: string
  title: string
}

interface LibraryHistoryItem {
  movieId: string
  title: string
}

export interface CLibrarySyncPayload {
  historyItems: LibraryHistoryItem[]
  watchlist: LibraryMovie[]
  watchNextItems: LibraryMovie[]
}

const DEFAULT_LIBRARY: CLibrarySyncPayload = {
  historyItems: [
    { movieId: 'demo-1', title: 'The Flash' },
    { movieId: 'demo-2', title: 'Dungeons & Dragons: Honor Among Thieves' },
    { movieId: 'demo-3', title: 'Batman v Superman: Dawn of Justice' },
    { movieId: 'demo-4', title: 'Spider-Man: Across the Spider-Verse' },
    { movieId: 'demo-5', title: 'Top Gun: Maverick' },
    { movieId: 'demo-6', title: 'Oppenheimer' },
  ],
  watchlist: [
    { id: 'demo-1', title: 'The Flash' },
    { id: 'demo-4', title: 'Spider-Man: Across the Spider-Verse' },
    { id: 'demo-5', title: 'Top Gun: Maverick' },
  ],
  watchNextItems: [
    { id: 'demo-2', title: 'Dungeons & Dragons: Honor Among Thieves' },
    { id: 'demo-10', title: 'Everything Everywhere All at Once' },
    { id: 'demo-5', title: 'Top Gun: Maverick' },
  ],
}

let syncedLibrary: CLibrarySyncPayload | null = null

function sameMovies(left: LibraryMovie[], right: LibraryMovie[]): boolean {
  return left.length === right.length && left.every((movie, index) =>
    movie.id === right[index].id && movie.title === right[index].title)
}

function sameHistory(left: LibraryHistoryItem[], right: LibraryHistoryItem[]): boolean {
  return left.length === right.length && left.every((item, index) =>
    item.movieId === right[index].movieId && item.title === right[index].title)
}

function copyLibrary(payload: CLibrarySyncPayload): CLibrarySyncPayload {
  return {
    historyItems: payload.historyItems.map((item) => ({ ...item })),
    watchlist: payload.watchlist.map((movie) => ({ ...movie })),
    watchNextItems: payload.watchNextItems.map((movie) => ({ ...movie })),
  }
}

async function applyLibraryDelta(payload: CLibrarySyncPayload): Promise<void> {
  if (syncedLibrary === null) throw new Error('C library sync state is not initialized.')

  if (!sameHistory(payload.historyItems, syncedLibrary.historyItems)) {
    for (const item of syncedLibrary.historyItems) {
      await requestCOperation({ structure: 'LIST', action: 'REMOVE', movieId: item.movieId })
    }
    for (const item of [...payload.historyItems].reverse()) {
      await requestCOperation({
        structure: 'LIST',
        action: 'PREPEND',
        movieId: item.movieId,
        title: item.title,
      })
    }
  }

  if (!sameMovies(payload.watchlist, syncedLibrary.watchlist)) {
    for (const movie of syncedLibrary.watchlist) {
      await requestCOperation({ structure: 'STACK', action: 'REMOVE', movieId: movie.id })
    }
    for (const movie of payload.watchlist) {
      await requestCOperation({
        structure: 'STACK',
        action: 'ADD',
        movieId: movie.id,
        title: movie.title,
      })
    }
  }

  if (!sameMovies(payload.watchNextItems, syncedLibrary.watchNextItems)) {
    for (let item = 0; item < syncedLibrary.watchNextItems.length; item++) {
      await requestCOperation({ structure: 'QUEUE', action: 'DEQUEUE' })
    }
    for (const movie of payload.watchNextItems) {
      await requestCOperation({
        structure: 'QUEUE',
        action: 'ENQUEUE',
        movieId: movie.id,
        title: movie.title,
      })
    }
  }

  syncedLibrary = copyLibrary(payload)
}

export function syncCBackendWithLibrary(payload: CLibrarySyncPayload): Promise<CBackendResult> {
  return serializeOperation(async () => {
    try {
      if (syncedLibrary === null) {
        await requestCOperation({ structure: 'RESET', action: 'RESET' })
        syncedLibrary = copyLibrary(DEFAULT_LIBRARY)
      }
      await applyLibraryDelta(payload)
    } catch {
      syncedLibrary = null
      try {
        await requestCOperation({ structure: 'RESET', action: 'RESET' })
        syncedLibrary = copyLibrary(DEFAULT_LIBRARY)
        await applyLibraryDelta(payload)
      } catch (recoveryError) {
        syncedLibrary = null
        const detail = recoveryError instanceof Error ? recoveryError.message : 'Unknown recovery failure.'
        throw new Error(`Could not synchronize C data with My Library. Recovery failed: ${detail}`)
      }
    }

    const snapshot = await requestCOperation({ structure: 'LIST', action: 'TRAVERSE' })
    return { ...snapshot, message: 'C library structures synchronized with My Library.' }
  })
}

export function rememberCOperationResult(structure: CStructure, result: CBackendResult): void {
  if (syncedLibrary === null || result.state === null || result.state === undefined) return

  if (structure === 'LIST' && 'nodes' in result.state) {
    syncedLibrary.historyItems = result.state.nodes.map((node) => ({
      movieId: node.id,
      title: node.title,
    }))
  } else if (structure === 'STACK' && 'watchlist' in result.state) {
    syncedLibrary.watchlist = result.state.watchlist.map(({ id, title }) => ({ id, title }))
  } else if (structure === 'QUEUE' && 'items' in result.state) {
    syncedLibrary.watchNextItems = result.state.items.map(({ id, title }) => ({ id, title }))
  }
}
