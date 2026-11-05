import React, { useState } from 'react'
import { Modal } from '../ui/dialog'
import { useApp } from '../../context/AppContext'
import { PresentationStep } from '../../types'
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'

// The 7 steps for college viva presentation
const PRESENTATION_STEPS: PresentationStep[] = [
  {
    structureId: 'linked-list',
    name: '1. Singly Linked List',
    category: 'Linear Pointer Structure',
    problemStatement:
      'How do we efficiently maintain a dynamic viewing history timeline without the performance penalties of shifting array indices on every new entry?',
    whySuitable:
      'Singly Linked Lists provide instantaneous O(1) prepend operations by updating the head pointer without reallocation or shifting. While random indexing requires O(n) traversal, chronological feeds strictly prioritize sequential insertion.',
    realWorldAnalogy: 'Sequential music playlists, browser session trails, memory block free-lists.',
    timeComplexity: {
      operation: 'Prepend Head',
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    spaceComplexity: 'O(n) — one node allocation per watched movie',
    vivaQuestion:
      'Why not use a standard dynamic array (e.g. JavaScript array.unshift()) for viewing history?',
    vivaAnswer:
      'Array unshift() runs in O(n) because every existing element in contiguous memory must be physically shifted by one position. In contrast, a Singly Linked List prepends in O(1) by simply allocating a new Node and updating head = new Node(data, head).',
    demoActionHint: 'Click "Prepend" in the visualizer to demonstrate O(1) pointer updates.',
  },
  {
    structureId: 'tree',
    name: '2. General Rooted Tree',
    category: 'Non-Linear Hierarchical Structure',
    problemStatement:
      'Movies naturally belong to nested taxonomy classifications (e.g., Movies → Sci-Fi → Time Travel). How can we model multi-level genre inheritance and filter entire subtrees?',
    whySuitable:
      'A General Rooted Tree allows an arbitrary number of child nodes per branch. Running Depth-First Search (DFS) or Breadth-First Search (BFS) allows instant recursive retrieval of all descendant genre slugs.',
    realWorldAnalogy: 'File and folder directory trees, DOM trees, e-commerce taxonomic catalogs.',
    timeComplexity: {
      operation: 'DFS Subtree Traversal',
      best: 'O(1)',
      average: 'O(V + E)',
      worst: 'O(N)',
    },
    spaceComplexity: 'O(N) where N is the total count of genres and subgenres',
    vivaQuestion: 'Is this genre tree a Binary Search Tree (BST)?',
    vivaAnswer:
      'No. This is a general rooted taxonomic tree, not a BST. Nodes have an arbitrary number of children (not restricted to two) and the structure represents categorical hierarchy rather than key-ordered sorting.',
    demoActionHint:
      'Click "Run DFS" to watch the recursive depth-first traversal visit every subcategory.',
  },
  {
    structureId: 'stack',
    name: '3. Stack (LIFO)',
    category: 'Linear Restricted-Access Collection',
    problemStatement:
      'Users frequently add or remove titles from their watchlist by accident. How can we implement a foolproof multi-level Undo system?',
    whySuitable:
      'Last-In, First-Out (LIFO) semantics ensure that the most recently executed user mutation is the exact first action reverted. Both pushing an action record and popping to undo run in strict O(1) time.',
    realWorldAnalogy: 'Text editor Ctrl+Z / Cmd+Z buffers, compiler function call stacks, calculator expression parsers.',
    timeComplexity: {
      operation: 'Push / Pop',
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    spaceComplexity: 'O(k) where k is the number of stored undoable mutations',
    vivaQuestion: 'How does CineMatch ensure the Undo operation is real and not just a visual trick?',
    vivaAnswer:
      'When an action is pushed, we store the full delta: action type (ADD or REMOVE), movie entity, and timestamp. On pop(), the state manager executes the inverse mutation directly against the master Watchlist in local storage.',
    demoActionHint:
      'Click "Push Add to Watchlist" and then "Pop & Undo" to observe state restoration.',
  },
  {
    structureId: 'queue',
    name: '4. Linked Queue (FIFO)',
    category: 'Linear Restricted-Access Collection',
    problemStatement:
      'How do we manage a "Watch Next" continuous playback queue where items are consumed in the exact fair order they were scheduled?',
    whySuitable:
      'First-In, First-Out (FIFO) with explicit Front and Rear pointers guarantees O(1) enqueue at the rear and O(1) dequeue from the front, preventing starvation.',
    realWorldAnalogy: 'OS print spoolers, web server request queues, Kafka topic consumer partitions.',
    timeComplexity: {
      operation: 'Enqueue / Dequeue',
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    spaceComplexity: 'O(n) — one node per queued movie',
    vivaQuestion: 'Why maintain both front and rear pointers in a linked queue?',
    vivaAnswer:
      'If only a head pointer is kept, appending to the tail requires traversing the entire list in O(n) time. Maintaining a rear pointer allows O(1) tail insertion while preserving O(1) head dequeue.',
    demoActionHint:
      'Enqueue a movie to see the REAR pointer advance, then Dequeue to see the FRONT item consumed.',
  },
  {
    structureId: 'heap',
    name: '5. Binary Max-Heap',
    category: 'Tree-Based Array Priority Queue',
    problemStatement:
      'How do we dynamically rank and extract the highest-rated movie or best mood-matching title without maintaining an expensive O(n) sorted array?',
    whySuitable:
      'A complete binary tree maintained in a 0-indexed array with the Max-Heap property (parent ≥ children). Root access is O(1), and restoring the heap property via Sift-Up or Sift-Down takes logarithmic O(log n) time.',
    realWorldAnalogy: 'Priority process schedulers, streaming top-K leaderboards, Dijkstra shortest-path.',
    timeComplexity: {
      operation: 'Extract Max',
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(n) stored densely in contiguous array memory',
    vivaQuestion: 'How are parent and child relationships computed without explicit pointers?',
    vivaAnswer:
      'Because the heap is a complete binary tree, pointers are unnecessary: for index i, the left child is at (2i + 1), the right child is at (2i + 2), and the parent is at Math.floor((i - 1) / 2).',
    demoActionHint:
      'Click "Extract Max" to watch the root extracted and sift-down restore the heap property.',
  },
  {
    structureId: 'hash-table',
    name: '6. Hash Table with Chaining',
    category: 'Direct-Addressing Key-Value Structure',
    problemStatement:
      'How can CineMatch achieve instantaneous O(1) movie metadata lookup by string Movie ID without scanning thousands of records?',
    whySuitable:
      'A polynomial rolling hash function converts arbitrary string keys into integer bucket indices. Separate chaining handles collisions by attaching colliding keys to a linked chain.',
    realWorldAnalogy: 'Redis key-value caches, database primary key indexes, compiler symbol tables.',
    timeComplexity: {
      operation: 'Lookup (Average)',
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(n) (all keys collide)',
    },
    spaceComplexity: 'O(capacity + n) buckets and node entries',
    vivaQuestion: 'What causes a hash collision and how does CineMatch handle it?',
    vivaAnswer:
      'A collision occurs when two distinct string keys produce the same hash modulo capacity. CineMatch uses Separate Chaining: each bucket holds a linked chain of entries, searching only through colliding items.',
    demoActionHint:
      'Click "Demonstrate Collision" to see two distinct keys cleanly resolved in the same bucket.',
  },
  {
    structureId: 'graph',
    name: '7. Adjacency-List Graph',
    category: 'Non-Linear Network of Vertices & Edges',
    problemStatement:
      'How do we model intricate real-world connections between movies (shared cast, directors, franchises, and thematic tones) and find degrees of separation?',
    whySuitable:
      'An Adjacency-List Graph represents sparse networks with O(V + E) space. Running Breadth-First Search (BFS) powered by our FIFO Queue finds the shortest path, while Depth-First Search (DFS) powered by our Stack explores deep cinematic universes.',
    realWorldAnalogy: 'Social graphs (LinkedIn 6 degrees of separation), routing networks, recommendation engines.',
    timeComplexity: {
      operation: 'BFS / DFS Traversal',
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V + E) vertices and adjacency lists',
    vivaQuestion: 'Why is an adjacency list preferred over an adjacency matrix for CineMatch?',
    vivaAnswer:
      'An adjacency matrix requires O(V²) space regardless of connections, wasting memory for sparse movie graphs. An adjacency list uses only O(V + E) space and allows immediate iteration over a movie’s neighbors.',
    demoActionHint:
      'Click "Run BFS" to watch level-order discovery, or "Shortest Path" to find connection hops.',
  },
]

interface PresentationModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToStructure?: (id: string) => void
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToStructure,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [showPresenterNotes, setShowPresenterNotes] = useState(true)

  if (!isOpen) return null

  const step = PRESENTATION_STEPS[currentStepIdx]
  const progressPercent = Math.round(((currentStepIdx + 1) / PRESENTATION_STEPS.length) * 100)

  const handleNext = () => {
    if (currentStepIdx < PRESENTATION_STEPS.length - 1) {
      setCurrentStepIdx((idx) => idx + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((idx) => idx - 1)
    }
  }

  const handleOpenVisualizer = () => {
    onClose()
    onNavigateToStructure?.(step.structureId)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-6 animate-fade-in text-white">
        {/* Top Progress & Step Badge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              College Viva Presentation Mode
            </span>
            <span className="font-mono text-gray-400">
              Step {currentStepIdx + 1} of {PRESENTATION_STEPS.length} ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Header */}
        <div className="p-6 rounded-2xl bg-[#161828] border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-black text-white">{step.name}</h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {step.category}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
                The Core Problem in CineMatch
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">{step.problemStatement}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                Why this Data Structure is Optimal
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">{step.whySuitable}</p>
            </div>
          </div>
        </div>

        {/* Complexity Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#131422] border border-white/10 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Operation</span>
            <span className="text-xs font-bold text-white mt-1 block truncate">
              {step.timeComplexity.operation}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#131422] border border-white/10 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Time Complexity
            </span>
            <span className="text-sm font-mono font-black text-emerald-400 mt-1 block">
              {step.timeComplexity.average}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#131422] border border-white/10 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Space Complexity
            </span>
            <span className="text-sm font-mono font-bold text-purple-300 mt-1 block truncate">
              {step.spaceComplexity}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#131422] border border-white/10 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Real-World Analogy
            </span>
            <span className="text-xs text-gray-300 mt-1 block truncate">{step.realWorldAnalogy}</span>
          </div>
        </div>

        {/* Presenter Viva Notes Panel */}
        <div className="p-5 rounded-2xl bg-[#10111d] border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Viva Examiner Question & Model Answer
            </h4>
            <button
              onClick={() => setShowPresenterNotes(!showPresenterNotes)}
              className="text-[11px] text-gray-400 hover:text-white"
            >
              {showPresenterNotes ? 'Collapse Notes' : 'Expand Notes'}
            </button>
          </div>

          {showPresenterNotes && (
            <div className="space-y-3 text-xs leading-relaxed animate-fade-in">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-200">
                <strong className="text-white block mb-1">Expected Viva Question:</strong>
                "{step.vivaQuestion}"
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-gray-300">
                <strong className="text-emerald-400 block mb-1">Recommended Response:</strong>
                {step.vivaAnswer}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions & Step Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <button
            onClick={handleOpenVisualizer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 text-xs font-bold transition-all"
          >
            <Play className="w-4 h-4 fill-purple-300" />
            Open Interactive Visualizer for this Structure
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:text-white disabled:opacity-40 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStepIdx < PRESENTATION_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-glow-sm hover:scale-105 transition-all"
              >
                Next Structure
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-glow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finish Presentation
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
