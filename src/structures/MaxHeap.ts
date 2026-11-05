import { HeapItem, HeapTraceStep } from '../types'

// Binary Max-Heap Implementation using contiguous array representation
// Parent at index i: left child = 2i + 1, right child = 2i + 2, parent = floor((i - 1) / 2)
// Root always holds the maximum priority element.

export class MaxHeap {
  private heap: HeapItem[] = []

  constructor(initialItems?: HeapItem[]) {
    if (initialItems && initialItems.length > 0) {
      this.buildHeap(initialItems)
    }
  }

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  peek(): HeapItem | undefined {
    return this.heap[0]
  }

  getArray(): HeapItem[] {
    return [...this.heap]
  }

  clear(): void {
    this.heap = []
  }

  // Insert an item and sift-up to restore max-heap property: O(log n)
  // Returns trace steps for step-by-step animation
  insert(item: HeapItem): HeapTraceStep[] {
    const trace: HeapTraceStep[] = []
    this.heap.push(item)
    const insertedIdx = this.heap.length - 1

    trace.push({
      step: 1,
      action: 'INSERT',
      indices: [insertedIdx],
      arraySnapshot: [...this.heap],
      message: `Inserted "${item.title}" (Priority: ${item.priority}) at index ${insertedIdx} (end of heap).`,
    })

    this.siftUp(insertedIdx, trace)
    return trace
  }

  // Extract maximum element: O(log n)
  // Returns extracted item and trace steps
  extractMax(): { item: HeapItem | undefined; trace: HeapTraceStep[] } {
    const trace: HeapTraceStep[] = []
    if (this.isEmpty()) {
      return { item: undefined, trace }
    }

    const maxItem = this.heap[0]
    const lastItem = this.heap.pop()!

    if (this.heap.length > 0) {
      this.heap[0] = lastItem
      trace.push({
        step: 1,
        action: 'EXTRACT',
        indices: [0],
        arraySnapshot: [...this.heap],
        message: `Extracted max "${maxItem.title}" (${maxItem.priority}). Moved last element "${lastItem.title}" (${lastItem.priority}) to root index 0.`,
      })

      this.siftDown(0, trace)
    } else {
      trace.push({
        step: 1,
        action: 'EXTRACT',
        indices: [0],
        arraySnapshot: [],
        message: `Extracted only element "${maxItem.title}". Heap is now empty.`,
      })
    }

    return { item: maxItem, trace }
  }

  // Sift-up: compare with parent and swap if greater: O(log n)
  private siftUp(startIndex: number, trace: HeapTraceStep[]): void {
    let currentIdx = startIndex

    while (currentIdx > 0) {
      const parentIdx = Math.floor((currentIdx - 1) / 2)
      const current = this.heap[currentIdx]
      const parent = this.heap[parentIdx]

      trace.push({
        step: trace.length + 1,
        action: 'COMPARE',
        indices: [currentIdx, parentIdx],
        arraySnapshot: [...this.heap],
        message: `Comparing child [${currentIdx}] "${current.title}" (${current.priority}) with parent [${parentIdx}] "${parent.title}" (${parent.priority}).`,
      })

      if (current.priority > parent.priority) {
        // Swap
        this.heap[currentIdx] = parent
        this.heap[parentIdx] = current

        trace.push({
          step: trace.length + 1,
          action: 'SWAP',
          indices: [currentIdx, parentIdx],
          arraySnapshot: [...this.heap],
          message: `Swapped index ${currentIdx} with parent ${parentIdx} as child has higher priority.`,
        })

        currentIdx = parentIdx
      } else {
        trace.push({
          step: trace.length + 1,
          action: 'COMPARE',
          indices: [currentIdx, parentIdx],
          arraySnapshot: [...this.heap],
          message: `Child priority (${current.priority}) <= parent priority (${parent.priority}). Max-heap property satisfied.`,
        })
        break
      }
    }
  }

  // Sift-down: compare with children and swap with larger child: O(log n)
  private siftDown(startIndex: number, trace: HeapTraceStep[]): void {
    let currentIdx = startIndex
    const length = this.heap.length

    while (true) {
      const leftChildIdx = 2 * currentIdx + 1
      const rightChildIdx = 2 * currentIdx + 2
      let largestIdx = currentIdx

      if (
        leftChildIdx < length &&
        this.heap[leftChildIdx].priority > this.heap[largestIdx].priority
      ) {
        largestIdx = leftChildIdx
      }

      if (
        rightChildIdx < length &&
        this.heap[rightChildIdx].priority > this.heap[largestIdx].priority
      ) {
        largestIdx = rightChildIdx
      }

      if (largestIdx !== currentIdx) {
        const currentItem = this.heap[currentIdx]
        const largestItem = this.heap[largestIdx]

        trace.push({
          step: trace.length + 1,
          action: 'COMPARE',
          indices: [currentIdx, largestIdx],
          arraySnapshot: [...this.heap],
          message: `Child [${largestIdx}] "${largestItem.title}" (${largestItem.priority}) is larger than parent [${currentIdx}] "${currentItem.title}" (${currentItem.priority}).`,
        })

        // Swap
        this.heap[currentIdx] = largestItem
        this.heap[largestIdx] = currentItem

        trace.push({
          step: trace.length + 1,
          action: 'SWAP',
          indices: [currentIdx, largestIdx],
          arraySnapshot: [...this.heap],
          message: `Swapped parent [${currentIdx}] with largest child [${largestIdx}].`,
        })

        currentIdx = largestIdx
      } else {
        trace.push({
          step: trace.length + 1,
          action: 'COMPARE',
          indices: [currentIdx],
          arraySnapshot: [...this.heap],
          message: `Node at [${currentIdx}] is >= all children. Max-heap property satisfied.`,
        })
        break
      }
    }
  }

  // Floyd's build heap algorithm: O(n)
  buildHeap(items: HeapItem[]): HeapTraceStep[] {
    this.heap = [...items]
    const trace: HeapTraceStep[] = []

    trace.push({
      step: 1,
      action: 'INITIAL',
      indices: [0],
      arraySnapshot: [...this.heap],
      message: `Initialized heap array with ${items.length} items. Starting bottom-up heapify.`,
    })

    const startIdx = Math.floor(this.heap.length / 2) - 1
    for (let i = startIdx; i >= 0; i--) {
      this.siftDown(i, trace)
    }

    return trace
  }
}
