import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { GenreTreeNode } from '../../structures/GenreTree'
import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Play,
  RotateCcw,
  Sparkles,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'

export const TreeVisualizer: React.FC = () => {
  const { genreTree, allMovies } = useApp()
  const [, setRenderTrigger] = useState(0)
  const [activeDfsStep, setActiveDfsStep] = useState<string | null>(null)
  const [isTraversing, setIsTraversing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([])
  const [selectedSubtreeGenre, setSelectedSubtreeGenre] = useState<string | null>('thriller')

  // New child category form modal/state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [parentTargetId, setParentTargetId] = useState('sci-fi')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')

  const forceRerender = () => setRenderTrigger((v) => v + 1)

  // Expand/collapse toggle
  const handleToggle = (nodeId: string) => {
    genreTree.toggleExpand(nodeId)
    forceRerender()
  }

  // Insert child category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required.')
      return
    }
    const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-')
    const res = genreTree.insertChild(parentTargetId, {
      id: slug,
      name: newCategoryName.trim(),
      slug,
      description: newCategoryDesc.trim() || 'User added genre classification',
    })

    if (res) {
      toast.success(`Inserted category "${newCategoryName}" under [${parentTargetId}].`)
      setIsAddOpen(false)
      setNewCategoryName('')
      setNewCategoryDesc('')
      forceRerender()
    } else {
      toast.error('Could not insert child (duplicate ID or parent not found).')
    }
  }

  // Depth-First Search (DFS) Traversal Animation
  const handleRunDFS = async () => {
    if (isTraversing) return
    setIsTraversing(true)
    setHighlightedNodeIds([])
    const steps = genreTree.traverseDFS()

    for (const step of steps) {
      setActiveDfsStep(step.nodeId)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setActiveDfsStep(null)
    setIsTraversing(false)
    toast.success(`Completed DFS Traversal through all ${steps.length} categories!`)
  }

  // Breadth-First Search (BFS) Traversal Animation
  const handleRunBFS = async () => {
    if (isTraversing) return
    setIsTraversing(true)
    setHighlightedNodeIds([])
    const steps = genreTree.traverseBFS()

    for (const step of steps) {
      setActiveDfsStep(step.nodeId)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setActiveDfsStep(null)
    setIsTraversing(false)
    toast.success(`Completed BFS Level-Order Traversal through all ${steps.length} categories!`)
  }

  // Search category
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setHighlightedNodeIds([])
      return
    }
    const results = genreTree.search(searchQuery.trim())
    if (results.length > 0) {
      setHighlightedNodeIds(results.map((r) => r.id))
      toast.success(`Found ${results.length} category match(es)!`)
    } else {
      setHighlightedNodeIds([])
      toast.info(`No category found matching "${searchQuery}".`)
    }
  }

  // Filter movies matching the selected genre or its descendants
  const filteredSubtreeMovies = React.useMemo(() => {
    if (!selectedSubtreeGenre) return allMovies
    const slugs = genreTree.getAllSubtreeSlugs(selectedSubtreeGenre)
    return allMovies.filter((movie) =>
      movie.genres.some((g) => slugs.some((s) => s.toLowerCase() === g.toLowerCase())) ||
      movie.moodTags.some((t) => slugs.some((s) => s.toLowerCase() === t.toLowerCase()))
    )
  }, [allMovies, genreTree, selectedSubtreeGenre])

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: GenreTreeNode, depth = 0) => {
    const isCurrentStep = activeDfsStep === node.id
    const isMatched = highlightedNodeIds.includes(node.id)
    const isSelected = selectedSubtreeGenre === node.id
    const hasChildren = node.children.length > 0

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border transition-all duration-300 my-1 ${
            isCurrentStep
              ? 'bg-purple-900/50 border-purple-400 shadow-glow-purple scale-102'
              : isMatched
              ? 'bg-amber-900/40 border-amber-400 scale-102'
              : isSelected
              ? 'bg-purple-600/20 border-purple-500/40 text-purple-200'
              : 'bg-[#151726]/60 border-white/[0.06] hover:bg-[#1a1c30]'
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => handleToggle(node.id)}
              className="p-1 rounded text-gray-400 hover:text-white"
            >
              {node.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-purple-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ) : (
            <span className="w-6 h-4 inline-block text-center text-gray-600">•</span>
          )}

          <div
            onClick={() => setSelectedSubtreeGenre(node.id)}
            className="flex-1 cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-white tracking-wide">{node.name}</span>
              <span className="text-[10px] text-gray-400 ml-2 hidden sm:inline">
                ({node.slug})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                Depth {depth}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setParentTargetId(node.id)
                  setIsAddOpen(true)
                }}
                className="p-1 rounded text-gray-400 hover:text-purple-300 hover:bg-white/10"
                title={`Add child category under ${node.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && node.isExpanded && (
          <div className="border-l border-white/10 ml-6 pl-1">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Academic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              General Rooted Tree — Genre & Category Hierarchy
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Hierarchical Tree
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            A non-linear hierarchical data structure composed of a single Root node where every
            node can branch into multiple arbitrary children (<code className="text-indigo-300">node.children[]</code>).
            Unlike binary search trees, a general genre tree models multi-level taxonomic
            classification (e.g. Movies → Science Fiction → Time Travel).
          </p>
          <div className="p-3 rounded-xl bg-[#161828] border border-white/[0.06] text-xs text-gray-400">
            <strong className="text-white">Real-World Software Analogy:</strong> File system folders,
            DOM (Document Object Model), e-commerce category taxonomy, and AST (Abstract Syntax Trees).
          </div>
        </div>

        {/* Complexity Card */}
        <div className="p-5 rounded-2xl bg-[#12131f] border border-white/10 space-y-3 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Tree Complexities
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Insert Child:</span>
              <span className="font-mono font-bold text-emerald-400">O(1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">DFS Traversal:</span>
              <span className="font-mono font-bold text-indigo-400">O(V + E) = O(N)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">BFS Level Traversal:</span>
              <span className="font-mono font-bold text-indigo-400">O(N)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.06]">
              <span className="text-gray-400">Search by Name:</span>
              <span className="font-mono font-bold text-amber-400">O(N)</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-400">Space Complexity:</span>
              <span className="font-mono font-bold text-purple-400">O(N)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-4 rounded-2xl bg-[#131422] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunDFS}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-glow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Run DFS (Depth-First)
          </button>

          <button
            onClick={handleRunBFS}
            disabled={isTraversing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-semibold transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-300" />
            Run BFS (Breadth-First)
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Insert Subcategory
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-[#1a1b2e] border border-white/10 text-white rounded-xl px-3 py-2 text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 w-36 sm:w-48"
          />
          <button
            onClick={handleSearch}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              genreTree.reset()
              setSelectedSubtreeGenre('thriller')
              setHighlightedNodeIds([])
              forceRerender()
              toast.info('Genre Tree reset to academic baseline.')
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            title="Reset tree"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visualizer: Tree Layout & Live Subtree Filtering */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Hierarchical Tree (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0c0d16] border border-white/10 space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-purple-400" />
              Interactive Genre Hierarchy
            </span>
            <span className="text-[11px] text-gray-400">Click node to filter movies</span>
          </div>

          <div className="pt-2 max-h-[460px] overflow-y-auto pr-2">
            {renderTreeNode(genreTree.getRoot())}
          </div>
        </div>

        {/* Right: Subtree Movie Filter Results (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12131f] border border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                Subtree Movies
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                {filteredSubtreeMovies.length} Found
              </span>
            </div>

            <p className="text-xs text-gray-400">
              Selected Branch:{' '}
              <strong className="text-purple-300">
                {selectedSubtreeGenre ? genreTree.getPathToNode(selectedSubtreeGenre).join(' > ') : 'All'}
              </strong>
            </p>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredSubtreeMovies.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-8 text-center">
                  No movies tagged under this subcategory.
                </p>
              ) : (
                filteredSubtreeMovies.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-[#161828] border border-white/[0.06]"
                  >
                    <img
                      src={m.posterPath}
                      alt={m.title}
                      className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{m.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">{m.genres.join(', ')}</p>
                      <span className="text-[10px] text-yellow-400 font-semibold">
                        ★ {m.voteAverage.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insert Subcategory Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#141525] border border-white/15 space-y-4 text-white">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              Insert Child Genre Category
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Parent Category:</label>
                <select
                  value={parentTargetId}
                  onChange={(e) => setParentTargetId(e.target.value)}
                  className="w-full bg-[#1b1d30] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="root">All Genres (Root)</option>
                  <option value="thriller">Thriller</option>
                  <option value="sci-fi">Science Fiction</option>
                  <option value="comedy">Comedy</option>
                  <option value="drama">Drama</option>
                  <option value="action">Action</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">New Category Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Cyberpunk, Dystopian Noir, Heist"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-[#1b1d30] border border-white/10 rounded-xl p-2.5 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Description:</label>
                <input
                  type="text"
                  placeholder="Brief academic definition"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="w-full bg-[#1b1d30] border border-white/10 rounded-xl p-2.5 text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-glow-sm"
              >
                Insert Node (O(1))
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
