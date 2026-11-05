import { describe, expect, it } from 'vitest'
import { SinglyLinkedList } from '../structures/LinkedList'
import { Stack } from '../structures/Stack'
import { LinkedQueue } from '../structures/Queue'
import { MaxHeap } from '../structures/MaxHeap'
import { MovieHashTable } from '../structures/HashTable'
import { GenreTree } from '../structures/GenreTree'
import { MovieGraph } from '../structures/MovieGraph'
import { calculateMoodScore } from '../algorithms/moodScoring'
import { Movie } from '../types'

// Mock movie objects for testing
const mockMovieA: Movie = {
  id: 'm-1',
  title: 'Inception',
  overview: 'A thief who steals corporate secrets through dream-sharing technology.',
  posterPath: '/inception.jpg',
  backdropPath: '/inception-bg.jpg',
  releaseDate: '2010-07-16',
  voteAverage: 8.8,
  voteCount: 35000,
  genres: ['Science Fiction', 'Action', 'Mystery'],
  mediaType: 'movie',
  cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
  moodTags: ['mind-bending', 'time-travel', 'plot-twist'],
}

const mockMovieB: Movie = {
  id: 'm-2',
  title: 'Interstellar',
  overview: 'A team of explorers travel through a wormhole in space.',
  posterPath: '/interstellar.jpg',
  backdropPath: '/interstellar-bg.jpg',
  releaseDate: '2014-11-07',
  voteAverage: 8.7,
  voteCount: 33000,
  genres: ['Science Fiction', 'Drama', 'Adventure'],
  mediaType: 'movie',
  cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
  moodTags: ['mind-bending', 'space', 'emotional'],
}

const mockMovieC: Movie = {
  id: 'm-3',
  title: 'The Dark Knight',
  overview: 'Batman raises the stakes in his war on crime.',
  posterPath: '/dark-knight.jpg',
  backdropPath: '/dark-knight-bg.jpg',
  releaseDate: '2008-07-18',
  voteAverage: 9.0,
  voteCount: 31000,
  genres: ['Action', 'Crime', 'Drama'],
  mediaType: 'movie',
  cast: ['Christian Bale', 'Heath Ledger', 'Gary Oldman'],
  moodTags: ['dark-twisted', 'intense-thriller', 'noir'],
}

describe('1. Singly Linked List (Viewing History)', () => {
  it('should prepend and append elements maintaining correct order', () => {
    const list = new SinglyLinkedList<Movie>()
    expect(list.length).toBe(0)
    expect(list.isEmpty()).toBe(true)

    list.prepend(mockMovieA)
    expect(list.length).toBe(1)
    expect(list.getHead()?.data.id).toBe('m-1')

    list.prepend(mockMovieB)
    expect(list.length).toBe(2)
    // Most recent at head
    expect(list.getHead()?.data.id).toBe('m-2')

    list.append(mockMovieC)
    expect(list.length).toBe(3)
    const array = list.toArray()
    expect(array.map((m) => m.id)).toEqual(['m-2', 'm-1', 'm-3'])
  })

  it('should remove elements by ID from head and middle', () => {
    const list = new SinglyLinkedList<Movie>([mockMovieA, mockMovieB, mockMovieC])
    expect(list.length).toBe(3)

    // Remove middle (mockMovieB)
    const removedMid = list.removeById('m-2', (m) => m.id)
    expect(removedMid).toBe(true)
    expect(list.length).toBe(2)
    expect(list.toArray().map((m) => m.id)).toEqual(['m-1', 'm-3'])

    // Remove head (mockMovieA)
    const removedHead = list.removeById('m-1', (m) => m.id)
    expect(removedHead).toBe(true)
    expect(list.length).toBe(1)
    expect(list.getHead()?.data.id).toBe('m-3')

    // Remove nonexistent ID
    const removedNonexistent = list.removeById('invalid-id', (m) => m.id)
    expect(removedNonexistent).toBe(false)
  })

  it('should trace traversal and search step-by-step with comparison counts', () => {
    const list = new SinglyLinkedList<Movie>([mockMovieA, mockMovieB, mockMovieC])
    const searchResult = list.searchById('m-3', (m) => m.id)
    expect(searchResult.found).toBe(true)
    expect(searchResult.comparisons).toBe(3)
    expect(searchResult.node?.data.title).toBe('The Dark Knight')

    const steps = list.traverseWithSteps()
    expect(steps.length).toBe(3)
    expect(steps[0].nodeData.id).toBe('m-1')
    expect(steps[2].hasNext).toBe(false)
  })
})

describe('2. Stack (Undo Watchlist Actions)', () => {
  it('should adhere to strict LIFO order on push and pop', () => {
    const stack = new Stack<string>()
    expect(stack.isEmpty()).toBe(true)

    stack.push('ADD_INCEPTION')
    stack.push('ADD_INTERSTELLAR')
    stack.push('REMOVE_INCEPTION')

    expect(stack.size).toBe(3)
    expect(stack.peek()).toBe('REMOVE_INCEPTION')

    expect(stack.pop()).toBe('REMOVE_INCEPTION')
    expect(stack.pop()).toBe('ADD_INTERSTELLAR')
    expect(stack.pop()).toBe('ADD_INCEPTION')
    expect(stack.pop()).toBeUndefined()
    expect(stack.isEmpty()).toBe(true)
  })

  it('should provide reverse LIFO view for UI and undo management', () => {
    const stack = new Stack<number>([1, 2, 3])
    expect(stack.toArray()).toEqual([1, 2, 3])
    expect(stack.toLifoArray()).toEqual([3, 2, 1])
  })
})

describe('3. Queue (Watch Next FIFO Playlist)', () => {
  it('should maintain FIFO order with front and rear pointers', () => {
    const queue = new LinkedQueue<Movie>()
    expect(queue.isEmpty()).toBe(true)

    queue.enqueue(mockMovieA)
    queue.enqueue(mockMovieB)
    queue.enqueue(mockMovieC)

    expect(queue.size).toBe(3)
    expect(queue.peek()?.id).toBe('m-1')
    expect(queue.getRear()?.id).toBe('m-3')

    // First in must be first out
    const firstDequeued = queue.dequeue()
    expect(firstDequeued?.id).toBe('m-1')
    expect(queue.size).toBe(2)
    expect(queue.peek()?.id).toBe('m-2')

    const secondDequeued = queue.dequeue()
    expect(secondDequeued?.id).toBe('m-2')

    const thirdDequeued = queue.dequeue()
    expect(thirdDequeued?.id).toBe('m-3')
    expect(queue.isEmpty()).toBe(true)
    expect(queue.dequeue()).toBeUndefined()
  })
})

describe('4. Binary Max-Heap (Top-Rated / Best Matching)', () => {
  it('should maintain max-heap property: root is always maximum', () => {
    const heap = new MaxHeap()
    heap.insert({ id: '1', movieId: 'm-1', title: 'Movie 1', posterPath: '', priority: 7.2 })
    heap.insert({ id: '2', movieId: 'm-2', title: 'Movie 2', posterPath: '', priority: 9.5 })
    heap.insert({ id: '3', movieId: 'm-3', title: 'Movie 3', posterPath: '', priority: 8.1 })
    heap.insert({ id: '4', movieId: 'm-4', title: 'Movie 4', posterPath: '', priority: 9.9 })

    expect(heap.peek()?.priority).toBe(9.9)

    // Extract maximums in descending order
    const firstMax = heap.extractMax()
    expect(firstMax.item?.priority).toBe(9.9)
    expect(firstMax.trace.length).toBeGreaterThan(0)

    const secondMax = heap.extractMax()
    expect(secondMax.item?.priority).toBe(9.5)

    const thirdMax = heap.extractMax()
    expect(thirdMax.item?.priority).toBe(8.1)

    const fourthMax = heap.extractMax()
    expect(fourthMax.item?.priority).toBe(7.2)

    expect(heap.isEmpty()).toBe(true)
  })

  it('should build heap bottom-up and return valid step trace', () => {
    const items = [
      { id: '1', movieId: '1', title: 'A', posterPath: '', priority: 5 },
      { id: '2', movieId: '2', title: 'B', posterPath: '', priority: 12 },
      { id: '3', movieId: '3', title: 'C', posterPath: '', priority: 9 },
      { id: '4', movieId: '4', title: 'D', posterPath: '', priority: 18 },
    ]
    const heap = new MaxHeap()
    const trace = heap.buildHeap(items)
    expect(trace.length).toBeGreaterThan(0)
    expect(heap.peek()?.priority).toBe(18)
  })
})

describe('5. Hash Table (Instant Movie Lookup & Separate Chaining)', () => {
  it('should insert, retrieve, update and handle collisions with separate chaining', () => {
    const table = new MovieHashTable<Movie>(4) // Small capacity 4 to induce collisions easily

    table.set('m-1', mockMovieA)
    table.set('m-2', mockMovieB)
    table.set('m-3', mockMovieC)

    expect(table.size).toBe(3)

    // Retrieve
    const trace1 = table.get('m-1')
    expect(trace1.found).toBe(true)
    expect(trace1.result?.title).toBe('Inception')

    // Update existing key
    table.set('m-1', { ...mockMovieA, title: 'Inception (Updated)' })
    expect(table.size).toBe(3) // Size shouldn't grow on update
    expect(table.get('m-1').result?.title).toBe('Inception (Updated)')

    // Remove
    const removed = table.remove('m-2')
    expect(removed).toBe(true)
    expect(table.size).toBe(2)
    expect(table.get('m-2').found).toBe(false)
  })

  it('should compute deterministic hash and track chain comparisons', () => {
    const table = new MovieHashTable<string>(8)
    const { rawHash, bucketIndex } = table.computeHash('inception-2010')
    expect(typeof rawHash).toBe('number')
    expect(bucketIndex).toBeGreaterThanOrEqual(0)
    expect(bucketIndex).toBeLessThan(8)
  })
})

describe('6. Genre Tree (General Rooted Tree)', () => {
  it('should support parent-child navigation, DFS traversal, and child insertion', () => {
    const tree = new GenreTree()
    const root = tree.getRoot()
    expect(root.name).toBe('All Genres')
    expect(root.children.length).toBeGreaterThan(0)

    // Add new subcategory under 'sci-fi'
    const cyberNode = tree.insertChild('sci-fi', {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      slug: 'cyberpunk',
      description: 'Futuristic dystopian technology and high-tech life',
    })
    expect(cyberNode).not.toBeNull()
    expect(cyberNode?.parentId).toBe('sci-fi')

    // Search
    const searchResults = tree.search('Cyberpunk')
    expect(searchResults.length).toBe(1)
    expect(searchResults[0].id).toBe('cyberpunk')

    // DFS Traversal
    const dfsSteps = tree.traverseDFS()
    expect(dfsSteps.length).toBeGreaterThan(5)
    expect(dfsSteps[0].nodeId).toBe('root')

    // Path to node
    const path = tree.getPathToNode('cyberpunk')
    expect(path).toEqual(['All Genres', 'Science Fiction', 'Cyberpunk'])
  })
})

describe('7. Movie Graph (Adjacency List with BFS and DFS)', () => {
  it('should add vertices, undirected edges, and run BFS with Queue', () => {
    const graph = new MovieGraph()
    graph.addVertex(mockMovieA)
    graph.addVertex(mockMovieB)
    graph.addVertex(mockMovieC)

    expect(graph.vertexCount).toBe(3)

    // Inception <-> Interstellar (Shared Christopher Nolan / SciFi)
    graph.addEdge('m-1', 'm-2', 'SIMILAR_MOOD', 1, 'Sci-Fi Director', 'Directed by Nolan')
    // Inception <-> Dark Knight (Nolan / Action)
    graph.addEdge('m-1', 'm-3', 'DIRECTOR', 1, 'Shared Director', 'Directed by Nolan')

    expect(graph.edgeCount).toBe(2)
    expect(graph.getNeighbors('m-1').length).toBe(2)

    // Run BFS starting at Inception
    const bfsSteps = graph.runBFS('m-1')
    expect(bfsSteps.length).toBe(3)
    expect(bfsSteps[0].currentVertexId).toBe('m-1')
    // Queue should have held unvisited neighbors
    expect(bfsSteps[0].discoveredNeighbors).toContain('m-2')
    expect(bfsSteps[0].discoveredNeighbors).toContain('m-3')

    // Run DFS starting at Inception
    const dfsSteps = graph.runDFS('m-1')
    expect(dfsSteps.length).toBe(3)
    expect(dfsSteps[0].currentVertexId).toBe('m-1')

    // Shortest Path
    const shortestPath = graph.findShortestPath('m-2', 'm-3')
    expect(shortestPath).not.toBeNull()
    expect(shortestPath?.path.map((m) => m.id)).toEqual(['m-2', 'm-1', 'm-3'])
  })
})

describe('8. Mood Scoring Algorithm', () => {
  it('should deterministically calculate transparent mood scores', () => {
    const mindBendingResult = calculateMoodScore(mockMovieA, 'mind-bending', 7.0)
    expect(mindBendingResult.score).toBeGreaterThan(60)
    expect(mindBendingResult.matchedTags).toContain('mind-bending')
    expect(mindBendingResult.matchedGenres).toContain('Science Fiction')
    expect(mindBendingResult.explanation).toContain('Matches "Mind-Bending" mood')

    const darkTwistedResult = calculateMoodScore(mockMovieC, 'dark-twisted', 7.0)
    expect(darkTwistedResult.score).toBeGreaterThan(60)
    expect(darkTwistedResult.matchedTags).toContain('dark-twisted')
  })
})
