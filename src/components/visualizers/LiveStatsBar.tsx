import React from 'react'
import { useApp } from '../../context/AppContext'
import { Film, Bookmark, ListVideo, Clock, Activity, Binary, Network, RefreshCw } from 'lucide-react'

export const LiveStatsBar: React.FC = () => {
  const { stats, resetAllDsaToDefault } = useApp()

  const items = [
    { label: 'Catalogue', value: stats.catalogueCount, icon: Film, color: 'text-purple-400' },
    { label: 'Watchlist (Stack)', value: stats.watchlistCount, icon: Bookmark, color: 'text-rose-400' },
    { label: 'Queue (FIFO)', value: stats.queueCount, icon: ListVideo, color: 'text-cyan-400' },
    { label: 'History (List)', value: stats.historyCount, icon: Clock, color: 'text-amber-400' },
    { label: 'Max-Heap', value: stats.heapCount, icon: Activity, color: 'text-yellow-400' },
    { label: 'Hash Table', value: stats.hashCount, icon: Binary, color: 'text-emerald-400' },
    {
      label: 'Graph (V / E)',
      value: `${stats.graphNodesCount} / ${stats.graphEdgesCount}`,
      icon: Network,
      color: 'text-indigo-400',
    },
  ]

  return (
    <div className="w-full p-4 rounded-2xl bg-[#10111d] border border-white/10 my-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Active Client Memory State (Live Synchronization)
          </span>
        </div>

        <button
          onClick={resetAllDsaToDefault}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset All 7 Structures to Default Baseline
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-3">
        {items.map((stat) => (
          <div
            key={stat.label}
            className="p-2.5 rounded-xl bg-[#151726]/70 border border-white/[0.06] flex items-center gap-3"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 block truncate">{stat.label}</span>
              <span className="text-sm font-black text-white font-mono">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
