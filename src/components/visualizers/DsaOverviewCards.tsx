import React from 'react'
import {
  ListFilter,
  FolderTree,
  Layers,
  ListVideo,
  Activity,
  Binary,
  Network,
  ArrowRight,
} from 'lucide-react'

interface DsaCardInfo {
  id: string
  name: string
  cinesyncRole: string
  coreOp: string
  complexity: string
  icon: React.ElementType
  color: string
}

export const DSA_CARDS: DsaCardInfo[] = [
  {
    id: 'linked-list',
    name: 'Singly Linked List',
    cinesyncRole: 'Viewing History',
    coreOp: 'Prepend watched movies; sequential traversal',
    complexity: 'Prepend: O(1) | Search: O(n)',
    icon: ListFilter,
    color: 'from-purple-600/30 to-purple-900/10 border-purple-500/30 text-purple-300',
  },
  {
    id: 'tree',
    name: 'General Rooted Tree',
    cinesyncRole: 'Genre Classification Hierarchy',
    coreOp: 'Multi-level taxonomy branching & DFS filtering',
    complexity: 'Insert: O(1) | DFS: O(V+E) = O(N)',
    icon: FolderTree,
    color: 'from-indigo-600/30 to-indigo-900/10 border-indigo-500/30 text-indigo-300',
  },
  {
    id: 'stack',
    name: 'Stack (LIFO)',
    cinesyncRole: 'Watchlist Undo System',
    coreOp: 'Push state mutations; pop & revert actions',
    complexity: 'Push: O(1) | Pop: O(1)',
    icon: Layers,
    color: 'from-rose-600/30 to-rose-900/10 border-rose-500/30 text-rose-300',
  },
  {
    id: 'queue',
    name: 'Queue (FIFO)',
    cinesyncRole: 'Watch Next Continuous Playlist',
    coreOp: 'Enqueue to rear; dequeue next title from front',
    complexity: 'Enqueue: O(1) | Dequeue: O(1)',
    icon: ListVideo,
    color: 'from-cyan-600/30 to-cyan-900/10 border-cyan-500/30 text-cyan-300',
  },
  {
    id: 'heap',
    name: 'Binary Max-Heap',
    cinesyncRole: 'Top-Rated & Mood-Match Priority Queue',
    coreOp: 'Sift-up insertion; root extraction of highest rank',
    complexity: 'Peek: O(1) | Extract: O(log n)',
    icon: Activity,
    color: 'from-amber-600/30 to-amber-900/10 border-amber-500/30 text-amber-300',
  },
  {
    id: 'hash-table',
    name: 'Hash Table (Separate Chaining)',
    cinesyncRole: 'Instant Movie Identifier Lookup',
    coreOp: 'Polynomial hash with linked-chain collision resolution',
    complexity: 'Average: O(1) | Worst: O(n)',
    icon: Binary,
    color: 'from-emerald-600/30 to-emerald-900/10 border-emerald-500/30 text-emerald-300',
  },
  {
    id: 'graph',
    name: 'Adjacency-List Graph',
    cinesyncRole: 'Movie Relationship Explorer',
    coreOp: 'BFS (using Queue) & DFS (using Stack) traversal',
    complexity: 'BFS/DFS: O(V + E)',
    icon: Network,
    color: 'from-fuchsia-600/30 to-purple-900/10 border-fuchsia-500/30 text-fuchsia-300',
  },
]

interface Props {
  activeTab: string
  onSelectTab: (id: string) => void
}

export const DsaOverviewCards: React.FC<Props> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
      {DSA_CARDS.map((card) => {
        const isSelected = activeTab === card.id
        return (
          <button
            key={card.id}
            onClick={() => onSelectTab(card.id)}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${
              isSelected
                ? 'bg-gradient-to-b from-purple-900/40 to-[#12131f] border-purple-400 shadow-glow-sm scale-[1.02]'
                : `bg-[#12131f]/80 hover:bg-[#18192a] border-white/[0.08] hover:border-white/20`
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color}`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
                  {card.cinesyncRole}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">{card.name}</h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {card.coreOp}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="font-mono text-emerald-400 font-semibold">{card.complexity}</span>
              <span className="text-purple-400 flex items-center gap-1 font-medium">
                Open <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
