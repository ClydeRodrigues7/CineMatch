import React from 'react'

export const ComplexityTable: React.FC = () => {
  const rows = [
    {
      name: 'Singly Linked List',
      useCase: 'Viewing History Timeline',
      operation: 'Prepend watched title (head)',
      complexity: 'O(1) prepend/append (tail pointer); O(n) search/remove',
      realWorld: 'Music/podcast playlist streams, navigation trails',
      assumptions: 'Known head pointer; traversal required for random access',
    },
    {
      name: 'General Rooted Tree',
      useCase: 'Hierarchical Genre Taxonomy',
      operation: 'DFS recursive classification traversal',
      complexity: 'O(V + E) traversal; O(d) insert with duplicate check',
      realWorld: 'DOM tree, file directory structure, e-commerce categories',
      assumptions: 'Arbitrary number of child branches per genre node',
    },
    {
      name: 'Stack (LIFO)',
      useCase: 'Watchlist Undo System',
      operation: 'Push state change & Pop reverse mutation',
      complexity: 'O(1) push, O(1) pop, O(1) peek',
      realWorld: 'Text editor undo buffers, browser history back stack, JVM call stack',
      assumptions: 'Linked action nodes; each action stores its inverse data',
    },
    {
      name: 'Linked Queue (FIFO)',
      useCase: 'Watch Next Continuous Queue',
      operation: 'Enqueue to rear & Dequeue next from front',
      complexity: 'O(1) enqueue, O(1) dequeue, O(1) peek',
      realWorld: 'Message broker message pipelines, printer queues, background workers',
      assumptions: 'Explicit front and rear pointers maintained concurrently',
    },
    {
      name: 'Binary Max-Heap',
      useCase: 'Top-Rated & Mood-Match Rankings',
      operation: 'Insert with sift-up & Extract max root with sift-down',
      complexity: 'O(1) peek max, O(log n) insert/extract, O(n) build',
      realWorld: 'Priority process schedulers, top-K streaming leaders, Dijkstra algorithm',
      assumptions: 'Complete binary tree packed tightly into 0-indexed array',
    },
    {
      name: 'Hash Table (Chaining)',
      useCase: 'Instant Movie Identifier Lookup',
      operation: 'FNV-1a hash calculation & bucket retrieval',
      complexity: 'O(1) average lookup/insert, O(n) worst-case collision',
      realWorld: 'In-memory caches (Redis/Memcached), database hash indexes, symbol tables',
      assumptions: 'Fixed bucket count; lookup cost depends on key distribution and chain length',
    },
    {
      name: 'Adjacency-List Graph',
      useCase: 'Movie Relationship Network',
      operation: 'BFS (using Queue) & DFS (using Stack) traversal',
      complexity: 'O(V + E) traversal, O(V + E) unweighted shortest path',
      realWorld: 'Social network friend graphs, recommendation networks, map navigation',
      assumptions: 'Sparse graph; each vertex stores linked neighbor edges',
    },
  ]

  return (
    <div className="w-full my-6 rounded-2xl bg-[#0c0d16] border border-white/10 overflow-hidden shadow-xl">
      <div className="p-4 bg-[#12131f] border-b border-white/[0.08] flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
          Comprehensive Data Structures & Complexity Evaluation
        </h4>
        <span className="text-xs text-purple-400 font-mono">Academic Matrix</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#151726] border-b border-white/[0.08] text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Data Structure</th>
              <th className="py-3 px-4">CineMatch Application</th>
              <th className="py-3 px-4">Example Operation</th>
              <th className="py-3 px-4">Time Complexity</th>
              <th className="py-3 px-4">Real-World Software</th>
              <th className="py-3 px-4">Theoretical Assumptions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-gray-300">
            {rows.map((row) => (
              <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{row.name}</td>
                <td className="py-3 px-4 text-purple-300">{row.useCase}</td>
                <td className="py-3 px-4 text-gray-300">{row.operation}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                  {row.complexity}
                </td>
                <td className="py-3 px-4 text-gray-400">{row.realWorld}</td>
                <td className="py-3 px-4 text-gray-400 text-[11px] italic">{row.assumptions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
