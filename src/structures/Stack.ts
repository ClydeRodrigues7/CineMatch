// Real LIFO Stack Implementation for Watchlist Undo Operations
// Backed by contiguous array with O(1) push, pop, and peek operations.

export interface StackSnapshot<T> {
  elements: T[]
  topIndex: number
  size: number
}

export class Stack<T> {
  private items: T[] = []

  constructor(initialItems?: T[]) {
    if (initialItems) {
      this.items = [...initialItems]
    }
  }

  // Push an item onto the top of the stack: O(1)
  push(item: T): void {
    this.items.push(item)
  }

  // Pop and return the top item: O(1)
  pop(): T | undefined {
    if (this.isEmpty()) return undefined
    return this.items.pop()
  }

  // Peek at the top item without removing: O(1)
  peek(): T | undefined {
    if (this.isEmpty()) return undefined
    return this.items[this.items.length - 1]
  }

  // Check if stack is empty: O(1)
  isEmpty(): boolean {
    return this.items.length === 0
  }

  // Number of elements in the stack: O(1)
  get size(): number {
    return this.items.length
  }

  // Return copy of elements from bottom to top
  toArray(): T[] {
    return [...this.items]
  }

  // Return elements from top to bottom (LIFO order)
  toLifoArray(): T[] {
    return [...this.items].reverse()
  }

  // Clear all items: O(1)
  clear(): void {
    this.items = []
  }

  // Get current snapshot for visualizer
  getSnapshot(): StackSnapshot<T> {
    return {
      elements: [...this.items],
      topIndex: this.items.length - 1,
      size: this.items.length,
    }
  }
}
