import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DsaOverviewCards } from '../components/visualizers/DsaOverviewCards'
import { LiveStatsBar } from '../components/visualizers/LiveStatsBar'
import { ComplexityTable } from '../components/visualizers/ComplexityTable'
import { LinkedListVisualizer } from '../components/visualizers/LinkedListVisualizer'
import { TreeVisualizer } from '../components/visualizers/TreeVisualizer'
import { StackVisualizer } from '../components/visualizers/StackVisualizer'
import { QueueVisualizer } from '../components/visualizers/QueueVisualizer'
import { HeapVisualizer } from '../components/visualizers/HeapVisualizer'
import { HashTableVisualizer } from '../components/visualizers/HashTableVisualizer'
import { GraphVisualizer } from '../components/visualizers/GraphVisualizer'
import { PresentationModal } from '../components/visualizers/PresentationModal'
import { CBackendPanel } from '../components/visualizers/CBackendPanel'
import {
  Cpu,
  GraduationCap,
  ListFilter,
  FolderTree,
  Layers,
  ListVideo,
  Activity,
  Binary,
  Network,
} from 'lucide-react'

export const DataStructuresLabPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'linked-list'
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [isPresentationOpen, setIsPresentationOpen] = useState(false)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [searchParams, activeTab])

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const tabButtons = [
    { id: 'linked-list', label: '1. Linked List', icon: ListFilter },
    { id: 'tree', label: '2. Genre Tree', icon: FolderTree },
    { id: 'stack', label: '3. Stack (Undo)', icon: Layers },
    { id: 'queue', label: '4. FIFO Queue', icon: ListVideo },
    { id: 'heap', label: '5. Max-Heap', icon: Activity },
    { id: 'hash-table', label: '6. Hash Table', icon: Binary },
    { id: 'graph', label: '7. Graph Network', icon: Network },
  ]

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-glow-sm">
              Academic Mini-Project
            </span>
            <span className="text-xs text-gray-400 font-mono">7 Fundamental Structures</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-purple-400" />
            Data Structures & Algorithms Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Run operations in the Live C Backend to inspect real nodes, pointers, buckets, heap steps, and graph paths.
            The interactive visualizers below provide additional demonstrations and complexity explanations.
          </p>
        </div>

        {/* Start Presentation Button */}
        <button
          onClick={() => setIsPresentationOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-extrabold text-sm shadow-glow-purple hover:scale-[1.03] active:scale-[0.98] transition-all self-start lg:self-auto"
        >
          <GraduationCap className="w-5 h-5 text-purple-200" />
          <span>Start Presentation Viva Mode</span>
        </button>
      </div>

      <CBackendPanel />

      {/* 1. Live Memory Statistics Bar */}
      <LiveStatsBar />

      {/* 2. Top Overview Cards for all 7 structures */}
      <DsaOverviewCards activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* 3. Interactive Tab Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
        {tabButtons.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-glow-sm scale-105'
                  : 'bg-[#12131f] text-gray-400 hover:text-white hover:bg-[#18192a] border border-white/[0.06]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 4. Active Visualizer Section */}
      <div className="p-6 rounded-3xl bg-[#0c0d16] border border-white/10 shadow-2xl min-h-[500px]">
        {activeTab === 'linked-list' && <LinkedListVisualizer />}
        {activeTab === 'tree' && <TreeVisualizer />}
        {activeTab === 'stack' && <StackVisualizer />}
        {activeTab === 'queue' && <QueueVisualizer />}
        {activeTab === 'heap' && <HeapVisualizer />}
        {activeTab === 'hash-table' && <HashTableVisualizer />}
        {activeTab === 'graph' && <GraphVisualizer />}
      </div>

      {/* 5. Comprehensive Complexity Comparison Table */}
      <ComplexityTable />

      {/* Presentation Viva Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onNavigateToStructure={(id: string) => handleSelectTab(id)}
      />
    </div>
  )
}
