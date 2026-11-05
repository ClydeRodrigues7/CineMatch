import React from 'react'
import { useApp } from '../context/AppContext'
import { Clock, Trash2, Sparkles, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HistoryNodeData } from '../types'

export const HistoryPage: React.FC = () => {
  const { historyItems, removeFromHistory, clearHistory } = useApp()

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-amber-400" />
            Viewing History Timeline
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Singly Linked List
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Chronological watch records prepended directly to the Linked List HEAD pointer in O(1) time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearHistory}
            disabled={historyItems.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold disabled:opacity-30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>

          <Link
            to="/dsa-lab?tab=linked-list"
            className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
            title="Open Linked List in DSA Lab"
          >
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* History Items Timeline */}
      {historyItems.length === 0 ? (
        <div className="py-24 text-center space-y-4 p-8 rounded-3xl bg-[#12131f] border border-dashed border-white/10">
          <Clock className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-base font-semibold text-gray-300">Viewing history is currently empty.</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click "Mark as Watched" on any movie card or modal to prepend an entry to this Singly Linked List.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-purple-500/30 space-y-6 my-4">
          {historyItems.map((item: HistoryNodeData, index: number) => {
            const isHead = index === 0
            const isTail = index === historyItems.length - 1

            return (
              <div key={item.id} className="relative group">
                {/* Node pointer node icon on vertical timeline */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 transition-all ${
                    isHead
                      ? 'bg-purple-600 border-white shadow-glow-sm scale-125'
                      : 'bg-[#151726] border-purple-400'
                  }`}
                />

                <div className="p-4 rounded-2xl bg-[#12131f] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.posterPath}
                      alt={item.title}
                      className="w-14 h-20 object-cover rounded-xl border border-white/10 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-300">
                          Node [{index}]
                        </span>
                        {isHead && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-600 text-white">
                            HEAD
                          </span>
                        )}
                        {isTail && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">
                            TAIL → NULL
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white mt-1">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Watched on: {new Date(item.watchedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(item.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromHistory(item.id)}
                    className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors self-end sm:self-auto"
                    title="Remove node from Linked List"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
