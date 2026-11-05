import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, CircleAlert, Cpu, Play, RotateCcw, Wifi, WifiOff } from 'lucide-react'
import { checkCBackend, executeCOperation, rememberCOperationResult, syncCBackendWithLibrary, CStructure, CBackendResult, MovieRecord } from '../../services/cDsaBackend'
import { CStructureDisplay } from './CStructureDisplay'
import { useApp } from '../../context/AppContext'
import { Movie } from '../../types'
import { ensureMovieArtwork } from '../../services/tmdb'

const STRUCTURES: { id: CStructure; label: string; actions: string[] }[] = [
  { id: 'LIST', label: 'Singly Linked List', actions: ['PREPEND', 'APPEND', 'TRAVERSE', 'SEARCH', 'REMOVE'] },
  { id: 'TREE', label: 'General Genre Tree', actions: ['DFS', 'BFS', 'FIND', 'ADD'] },
  { id: 'STACK', label: 'Undo Stack', actions: ['ADD', 'REMOVE', 'UNDO'] },
  { id: 'QUEUE', label: 'Watch Next Queue', actions: ['ENQUEUE', 'DEQUEUE', 'PEEK'] },
  { id: 'HEAP', label: 'Max-Heap', actions: ['PEEK', 'INSERT', 'EXTRACT'] },
  { id: 'HASH', label: 'Separate-Chaining Hash Table', actions: ['SEARCH', 'INSERT', 'DELETE', 'COLLISION'] },
  { id: 'GRAPH', label: 'Movie Relationship Graph', actions: ['BFS', 'DFS', 'SHORTEST'] },
]

const needsMovie = (structure: CStructure, action: string) =>
  (structure === 'LIST' && ['PREPEND', 'APPEND', 'REMOVE', 'SEARCH'].includes(action)) ||
  (structure === 'STACK' && ['ADD', 'REMOVE'].includes(action)) ||
  (structure === 'QUEUE' && action === 'ENQUEUE') ||
  (structure === 'HEAP' && action === 'INSERT') ||
  (structure === 'HASH' && action === 'INSERT')

export const CBackendPanel: React.FC = () => {
  const {
    allMovies,
    historyItems,
    markAsWatched,
    appendAsWatched,
    removeFromHistory,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    watchNextItems,
    syncWatchNextFromDsa,
  } = useApp()
  const [structure, setStructure] = useState<CStructure>('LIST')
  const [action, setAction] = useState('PREPEND')
  const [movieId, setMovieId] = useState('demo-1')
  const [title, setTitle] = useState('The Flash')
  const [score, setScore] = useState('6.8')
  const [query, setQuery] = useState('demo-1')
  const [parentId, setParentId] = useState('Science Fiction')
  const [genreName, setGenreName] = useState('Space Opera')
  const [sourceId, setSourceId] = useState('demo-7')
  const [targetId, setTargetId] = useState('demo-9')
  const [result, setResult] = useState<CBackendResult | null>(null)
  const [resultStructure, setResultStructure] = useState<CStructure>('LIST')
  const [connected, setConnected] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const initialSyncComplete = useRef(false)
  const suppressLibrarySync = useRef(false)

  const selected = useMemo(() => STRUCTURES.find((item) => item.id === structure)!, [structure])
  const needsTwoInputs = structure === 'TREE' && action === 'ADD'
  const isTreeFind = structure === 'TREE' && action === 'FIND'
  const isGraph = structure === 'GRAPH'

  useEffect(() => {
    let active = true
    if (suppressLibrarySync.current) {
      suppressLibrarySync.current = false
      return () => { active = false }
    }

    void (async () => {
      const health = await checkCBackend()
      if (!active) return
      setConnected(health.ok)
      const snapshot = await syncCBackendWithLibrary({
        historyItems: historyItems.map(({ movieId: id, title: movieTitle }) => ({ movieId: id, title: movieTitle })),
        watchlist: watchlist.map(({ id, title: movieTitle }) => ({ id, title: movieTitle })),
        watchNextItems: watchNextItems.map(({ id, title: movieTitle }) => ({ id, title: movieTitle })),
      })
      if (!active) return
      setConnected(true)
      if (!initialSyncComplete.current) {
        setResult(snapshot)
        setResultStructure('LIST')
        initialSyncComplete.current = true
      }
    })()
      .catch((cause) => {
        if (!active) return
        setConnected(false)
        setError(cause instanceof Error ? cause.message : 'Could not synchronize the C backend with My Library.')
      })
    return () => { active = false }
  }, [historyItems, watchlist, watchNextItems])

  const movieForRecord = (record: MovieRecord): Movie => {
    const existing = allMovies.find((movie) => movie.id === record.id)
    if (existing) {
      return existing.title === record.title
        ? existing
        : { ...existing, title: record.title, voteAverage: record.priority }
    }
    return ensureMovieArtwork({
      id: record.id,
      title: record.title,
      overview: '',
      posterPath: '',
      backdropPath: '',
      releaseDate: '',
      voteAverage: record.priority,
      voteCount: 0,
      genres: [],
      mediaType: 'movie',
      cast: [],
      moodTags: [],
    })
  }

  const mirrorCResultToLibrary = (result: CBackendResult) => {
    if (structure === 'LIST' && action === 'PREPEND') {
      suppressLibrarySync.current = true
      markAsWatched(movieForRecord({ id: movieId, title, priority: 0 }))
    } else if (structure === 'LIST' && action === 'APPEND') {
      suppressLibrarySync.current = true
      appendAsWatched(movieForRecord({ id: movieId, title, priority: 0 }))
    } else if (structure === 'LIST' && action === 'REMOVE' && result.found) {
      const historyItem = historyItems.find((item) => item.movieId === movieId)
      if (historyItem) {
        suppressLibrarySync.current = true
        removeFromHistory(historyItem.id)
      }
    } else if (structure === 'STACK' && result.state && 'watchlist' in result.state) {
      const desired = new Set(result.state.watchlist.map((movie) => movie.id))
      const current = new Set(watchlist.map((movie) => movie.id))
      if (desired.size !== current.size || [...desired].some((id) => !current.has(id))) {
        suppressLibrarySync.current = true
        watchlist.filter((movie) => !desired.has(movie.id)).forEach((movie) => removeFromWatchlist(movie.id))
        result.state.watchlist
          .filter((movie) => !current.has(movie.id))
          .forEach((movie) => addToWatchlist(movieForRecord(movie)))
      }
    } else if (structure === 'QUEUE' && result.state && 'items' in result.state) {
      const nextMovies = result.state.items.map(movieForRecord)
      if (nextMovies.length !== watchNextItems.length ||
          nextMovies.some((movie, index) => movie.id !== watchNextItems[index]?.id)) {
        suppressLibrarySync.current = true
        syncWatchNextFromDsa(nextMovies)
      }
    }
  }

  const run = async (reset = false) => {
    setBusy(true)
    setError('')
    try {
      let next: CBackendResult
      if (reset) {
        next = await syncCBackendWithLibrary({
          historyItems: historyItems.map(({ movieId: id, title: movieTitle }) => ({ movieId: id, title: movieTitle })),
          watchlist: watchlist.map(({ id, title: movieTitle }) => ({ id, title: movieTitle })),
          watchNextItems: watchNextItems.map(({ id, title: movieTitle }) => ({ id, title: movieTitle })),
        })
        next.message = 'C structures synchronized with My Library.'
      } else {
        next = await executeCOperation({
            structure,
            action,
            movieId: needsMovie(structure, action) ? movieId : query,
            title,
            score,
            query,
            parentId,
            genreName,
            sourceId,
            targetId,
          })
        rememberCOperationResult(structure, next)
        mirrorCResultToLibrary(next)
      }
      setResult(next)
      setResultStructure(reset ? 'LIST' : structure)
      setConnected(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reach the C backend.')
      setConnected(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#0c1114] shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-300"><Cpu className="h-5 w-5" /></div>
          <div>
            <h2 className="font-bold text-white">Live C Backend</h2>
            <p className="text-xs text-gray-400">Choose a structure and operation, then execute to see its live C state below.</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? 'C Engine Connected' : 'C Engine Offline'}
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs text-gray-400">Data structure
              <select value={structure} onChange={(event) => { const next = STRUCTURES.find((item) => item.id === event.target.value)!; setStructure(next.id); setAction(next.actions[0]) }} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white">
                {STRUCTURES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs text-gray-400">Operation
              <select value={action} onChange={(event) => setAction(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white">
                {selected.actions.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
              </select>
            </label>
          </div>

          {needsMovie(structure, action) && <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs text-gray-400">Movie ID
              <input value={movieId} onChange={(event) => setMovieId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
            </label>
            {action !== 'SEARCH' && action !== 'REMOVE' && <label className="space-y-1.5 text-xs text-gray-400">Movie title
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
            </label>}
            {structure === 'HEAP' && <label className="space-y-1.5 text-xs text-gray-400">Priority score
              <input type="number" step="0.1" value={score} onChange={(event) => setScore(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
            </label>}
          </div>}

          {isTreeFind && <label className="block space-y-1.5 text-xs text-gray-400">Category name
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
          </label>}
          {needsTwoInputs && <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs text-gray-400">Parent category
              <input value={parentId} onChange={(event) => setParentId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="space-y-1.5 text-xs text-gray-400">New child category
              <input value={genreName} onChange={(event) => setGenreName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
            </label>
          </div>}
          {structure === 'HASH' && ['SEARCH', 'DELETE'].includes(action) && <label className="block space-y-1.5 text-xs text-gray-400">Key to look up
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
          </label>}
          {isGraph && <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs text-gray-400">Source movie ID
              <input value={sourceId} onChange={(event) => setSourceId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
            </label>
            {action === 'SHORTEST' && <label className="space-y-1.5 text-xs text-gray-400">Target movie ID
              <input value={targetId} onChange={(event) => setTargetId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#171b21] px-3 py-2.5 text-sm text-white" />
            </label>}
          </div>}

          {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void run()} disabled={busy} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"><Play className="h-4 w-4 fill-current" />{busy ? 'Executing C…' : 'Execute in C'}</button>
            <button onClick={() => void run(true)} disabled={busy} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"><RotateCcw className="h-4 w-4" />Sync with My Library</button>
          </div>
          <p className="flex items-center gap-2 text-[11px] text-gray-500"><Activity className="h-3.5 w-3.5" />The C process keeps its structures in memory while the backend runs.</p>
        </div>

        <div className="min-h-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080a0d]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-4 py-2.5">
            <span className="text-xs font-semibold text-gray-300">Live C structure visualization</span>
            {result && <span className="text-[10px] text-emerald-300">{STRUCTURES.find((item) => item.id === resultStructure)?.label} · C result</span>}
          </div>
          <div aria-live="polite" className="space-y-3 p-4">
            {result ? (
              <>
                <p className="text-xs text-emerald-200">{result.message}</p>
                <CStructureDisplay result={result} />
                <details className="rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <summary className="cursor-pointer px-3 py-2 text-[10px] font-semibold text-gray-400">Inspect raw C JSON response</summary>
                  <pre className="max-h-64 overflow-auto border-t border-white/[0.06] p-3 text-[10px] leading-relaxed text-emerald-200">{JSON.stringify(result, null, 2)}</pre>
                </details>
              </>
            ) : (
              <p className="text-xs text-gray-500">Waiting for the C engine to return a structure snapshot…</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
