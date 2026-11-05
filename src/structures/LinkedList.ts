// Singly Linked List Implementation for Viewing History
// Nodes store sequential movie records with head pointer, next links, and null terminator.

export class ListNode<T> {
  data: T
  next: ListNode<T> | null

  constructor(data: T, next: ListNode<T> | null = null) {
    this.data = data
    this.next = next
  }
}

export interface LinkedListTraversalStep<T> {
  step: number
  nodeData: T
  index: number
  hasNext: boolean
}

export interface LinkedListSearchResult<T> {
  found: boolean
  node: ListNode<T> | null
  comparisons: number
  visited: T[]
}

export class SinglyLinkedList<T> {
  private head: ListNode<T> | null = null
  private count = 0

  constructor(initialItems?: T[]) {
    if (initialItems && initialItems.length > 0) {
      this.fromArray(initialItems)
    }
  }

  get length(): number {
    return this.count
  }

  getHead(): ListNode<T> | null {
    return this.head
  }

  isEmpty(): boolean {
    return this.head === null
  }

  // Prepend: O(1) - inserts at head (most recent watched item)
  prepend(data: T): ListNode<T> {
    const newNode = new ListNode<T>(data, this.head)
    this.head = newNode
    this.count++
    return newNode
  }

  // Append: O(n) - inserts at tail (oldest item)
  append(data: T): ListNode<T> {
    const newNode = new ListNode<T>(data)
    if (!this.head) {
      this.head = newNode
      this.count++
      return newNode
    }

    let current = this.head
    while (current.next !== null) {
      current = current.next
    }
    current.next = newNode
    this.count++
    return newNode
  }

  // Remove by identifier: O(n)
  removeById(id: string, idExtractor: (item: T) => string): boolean {
    if (!this.head) return false

    // Check if head is the target
    if (idExtractor(this.head.data) === id) {
      this.head = this.head.next
      this.count--
      return true
    }

    let current = this.head
    while (current.next !== null) {
      if (idExtractor(current.next.data) === id) {
        current.next = current.next.next
        this.count--
        return true
      }
      current = current.next
    }

    return false
  }

  // Search by identifier: O(n) with step trace
  searchById(
    id: string,
    idExtractor: (item: T) => string
  ): LinkedListSearchResult<T> {
    let current = this.head
    let comparisons = 0
    const visited: T[] = []

    while (current !== null) {
      comparisons++
      visited.push(current.data)
      if (idExtractor(current.data) === id) {
        return {
          found: true,
          node: current,
          comparisons,
          visited,
        }
      }
      current = current.next
    }

    return {
      found: false,
      node: null,
      comparisons,
      visited,
    }
  }

  // Traverse and collect sequential step snapshots for educational animation
  traverseWithSteps(): LinkedListTraversalStep<T>[] {
    const steps: LinkedListTraversalStep<T>[] = []
    let current = this.head
    let idx = 0

    while (current !== null) {
      steps.push({
        step: idx + 1,
        nodeData: current.data,
        index: idx,
        hasNext: current.next !== null,
      })
      current = current.next
      idx++
    }

    return steps
  }

  // Convert list to array: O(n)
  toArray(): T[] {
    const result: T[] = []
    let current = this.head
    while (current !== null) {
      result.push(current.data)
      current = current.next
    }
    return result
  }

  // Populate from array (preserving order)
  fromArray(items: T[]): void {
    this.clear()
    for (let i = items.length - 1; i >= 0; i--) {
      this.prepend(items[i])
    }
  }

  clear(): void {
    this.head = null
    this.count = 0
  }
}
