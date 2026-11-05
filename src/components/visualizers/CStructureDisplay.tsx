import React from 'react'
import type { CBackendResult, CStructureState, GenreNode, MovieRecord } from '../../services/cDsaBackend'

const movieCard = (movie: MovieRecord, detail?: string) => (
  <div key={`${movie.id}-${detail || ''}`} className="min-w-36 rounded-xl border border-white/10 bg-[#151a1e] px-3 py-2">
    <p className="truncate text-sm font-semibold text-white">{movie.title}</p>
    <p className="mt-1 truncate font-mono text-[10px] text-gray-500">{movie.id}</p>
    {detail && <p className="mt-1 text-[10px] text-emerald-300">{detail}</p>}
  </div>
)

const genreBranch = (node: GenreNode, depth = 0): React.ReactNode => (
  <div key={`${node.name}-${depth}`} className="space-y-2">
    <div className="flex items-center gap-2">
      {depth > 0 && <span className="text-gray-600">└─</span>}
      <span className={`rounded-lg border px-3 py-1.5 text-xs ${depth === 0 ? 'border-purple-400/40 bg-purple-500/15 font-bold text-purple-200' : 'border-white/10 bg-white/[0.03] text-gray-200'}`}>
        {node.name}
      </span>
    </div>
    {node.children.length > 0 && (
      <div className="ml-4 space-y-2 border-l border-white/10 pl-4">
        {node.children.map((child) => genreBranch(child, depth + 1))}
      </div>
    )}
  </div>
)

interface HeapTreeNode {
  index: number
  movie: MovieRecord
  left: HeapTreeNode | null
  right: HeapTreeNode | null
}

const heapBranch = (node: HeapTreeNode | null): React.ReactNode => {
  if (!node) return null
  return (
    <li key={node.index} className="space-y-2">
      <div className="inline-flex max-w-full flex-col rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
        <span className="truncate text-xs font-semibold text-amber-100">{node.movie.title}</span>
        <span className="font-mono text-[10px] text-amber-300">index {node.index} · {node.movie.priority}</span>
      </div>
      {(node.left || node.right) && (
        <ul className="ml-4 flex gap-3 border-l border-white/10 pl-4">
          {node.left && heapBranch(node.left)}
          {node.right && heapBranch(node.right)}
        </ul>
      )}
    </li>
  )
}

function isHeapTree(value: unknown): value is HeapTreeNode {
  if (typeof value !== 'object' || value === null) return false
  const node = value as Record<string, unknown>
  return typeof node.index === 'number' && typeof node.movie === 'object' &&
    node.movie !== null && 'title' in node.movie &&
    (node.left === null || isHeapTree(node.left)) &&
    (node.right === null || isHeapTree(node.right))
}

interface CStructureDisplayProps {
  result: CBackendResult | null
}

export const CStructureDisplay: React.FC<CStructureDisplayProps> = ({ result }) => {
  const state: CStructureState | null | undefined = result?.state
  if (!state || typeof state !== 'object') {
    return <p className="text-xs text-gray-500">The C engine did not return a structure snapshot.</p>
  }

  if ('head' in state && 'tail' in state && 'nodes' in state) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-300">HEAD: {state.head || 'NULL'}</span>
          <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-purple-300">TAIL: {state.tail || 'NULL'}</span>
        </div>
        <div className="flex min-h-20 items-center gap-2 overflow-x-auto pb-2">
          {state.nodes.length === 0 && <span className="text-xs text-gray-500">List is empty.</span>}
          {state.nodes.map((node, index) => (
            <React.Fragment key={`${node.id}-${index}`}>
              <div className="min-w-36 rounded-xl border border-purple-400/25 bg-purple-500/10 px-3 py-2">
                <p className="truncate text-xs font-bold text-white">{node.title}</p>
                <p className="mt-1 font-mono text-[10px] text-gray-400">{node.id}</p>
                <p className="mt-1 text-[10px] text-purple-300">next → {node.next || 'NULL'}</p>
              </div>
              {index < state.nodes.length - 1 && <span className="text-emerald-400">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if ('name' in state && 'children' in state) {
    return <div className="max-h-72 overflow-auto rounded-xl border border-white/[0.06] bg-black/10 p-4">{genreBranch(state)}</div>
  }

  if ('watchlist' in state && 'topFirst' in state) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">TOP → bottom · LIFO actions</p>
          {state.topFirst.length === 0 && <p className="text-xs text-gray-500">Undo stack is empty.</p>}
          {state.topFirst.map((entry, index) => (
            <div key={`${entry.action}-${entry.movie.id}-${index}`} className="rounded-lg border border-rose-400/20 bg-rose-500/[0.06] px-3 py-2">
              <p className="text-[10px] font-bold text-rose-200">{index === 0 ? 'TOP · ' : ''}{entry.action}</p>
              <p className="mt-1 truncate text-xs text-white">{entry.movie.title} <span className="font-mono text-gray-500">({entry.movie.id})</span></p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Actual watchlist state</p>
          {state.watchlist.length === 0 && <p className="text-xs text-gray-500">Watchlist is empty.</p>}
          {state.watchlist.map((movie) => movieCard(movie))}
        </div>
      </div>
    )
  }

  if ('items' in state && 'front' in state && 'rear' in state) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-cyan-300">FRONT: {state.front || 'NULL'}</span>
          <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-purple-300">REAR: {state.rear || 'NULL'}</span>
        </div>
        <div className="flex min-h-16 items-center gap-2 overflow-x-auto pb-2">
          {state.items.length === 0 && <span className="text-xs text-gray-500">Queue is empty.</span>}
          {state.items.map((movie, index) => (
            <React.Fragment key={`${movie.id}-${index}`}>
              {index === 0 && <span className="text-[10px] text-cyan-300">FRONT</span>}
              {movieCard(movie)}
              {index < state.items.length - 1 && <span className="text-gray-500">→</span>}
              {index === state.items.length - 1 && <span className="text-[10px] text-purple-300">REAR</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if ('array' in state && 'max' in state && 'tree' in state) {
    return (
      <div className="space-y-4">
        {state.max && <p className="text-xs font-bold text-amber-300">MAX ROOT: {state.max.title} · priority {state.max.priority}</p>}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Heap array (level-order)</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {state.array.map((movie, index) => (
              <div key={`${movie.id}-${index}`} className="min-w-24 rounded-lg border border-amber-400/20 bg-amber-500/[0.06] px-2 py-2 text-center">
                <p className="font-mono text-[10px] text-amber-300">[{index}] · {movie.priority}</p>
                <p className="mt-1 truncate text-[10px] text-white">{movie.title}</p>
              </div>
            ))}
            {state.array.length === 0 && <span className="text-xs text-gray-500">Heap is empty.</span>}
          </div>
        </div>
        {isHeapTree(state.tree) && state.tree && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Binary tree representation</p>
            <ul className="overflow-x-auto">{heapBranch(state.tree)}</ul>
          </div>
        )}
        {result?.heapTrace && result.heapTrace.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">C sift steps</p>
            {result.heapTrace.map((step, index) => (
              <p key={`${step.phase}-${index}`} className="font-mono text-[10px] text-gray-400">
                {index + 1}. {step.phase}: index {step.index} ↔ {step.otherIndex} · {step.array.map((item) => item.priority).join(' → ')}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  if ('buckets' in state && 'bucketCount' in state && 'collisions' in state) {
    return (
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {state.buckets.map((bucket, index) => (
          <div key={index} className="min-h-16 rounded-lg border border-white/10 bg-white/[0.02] p-2">
            <p className="mb-2 font-mono text-[10px] text-emerald-300">Bucket [{index}]</p>
            <div className="flex flex-wrap items-center gap-1">
              {bucket.length === 0 && <span className="text-[10px] text-gray-600">empty</span>}
              {bucket.map((movie, chainIndex) => (
                <React.Fragment key={movie.id}>
                  {chainIndex > 0 && <span className="text-gray-500">→</span>}
                  <span className="rounded bg-emerald-500/10 px-2 py-1 text-[10px] text-gray-200">{movie.id}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        <p className="col-span-full text-[10px] text-gray-500">{state.bucketCount} buckets · {state.size} keys · {state.collisions} collisions</p>
      </div>
    )
  }

  if ('vertices' in state && 'edges' in state && 'traversal' in state && 'path' in state) {
    const vertexTitles = new Map(state.vertices.map((movie) => [movie.id, movie.title]))
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Adjacency-list edges</p>
        <div className="flex flex-wrap gap-2">
          {state.edges.map(([from, to], index) => (
            <span key={`${from}-${to}-${index}`} className="rounded-lg border border-purple-400/20 bg-purple-500/[0.06] px-2.5 py-1.5 text-[10px] text-gray-200">
              {vertexTitles.get(from) || from} ↔ {vertexTitles.get(to) || to}
            </span>
          ))}
        </div>
        {state.traversal.length > 0 && (
          <p className="text-xs text-gray-300"><span className="font-bold text-purple-300">Traversal:</span> {state.traversal.map((movie) => movie.title).join(' → ')}</p>
        )}
        {state.path.length > 0 && (
          <p className="text-xs text-emerald-200"><span className="font-bold">Shortest path:</span> {state.path.map((id) => vertexTitles.get(id) || id).join(' → ')}</p>
        )}
      </div>
    )
  }

  return <p className="text-xs text-gray-500">No visualization is available for this C response.</p>
}
