// Real FIFO Linked Queue Implementation with Front and Rear Pointers
// O(1) enqueue, O(1) dequeue, guaranteed FIFO order.

export class QueueNode<T> {
  value: T
  next: QueueNode<T> | null

  constructor(value: T, next: QueueNode<T> | null = null) {
    this.value = value
    this.next = next
  }
}

export class LinkedQueue<T> {
  private frontPtr: QueueNode<T> | null = null
  private rearPtr: QueueNode<T> | null = null
  private count = 0

  constructor(initialItems?: T[]) {
    if (initialItems) {
      for (const item of initialItems) {
        this.enqueue(item)
      }
    }
  }

  // O(1) Enqueue to rear
  enqueue(item: T): void {
    const newNode = new QueueNode<T>(item)
    if (this.isEmpty()) {
      this.frontPtr = newNode
      this.rearPtr = newNode
    } else {
      if (this.rearPtr) {
        this.rearPtr.next = newNode
      }
      this.rearPtr = newNode
    }
    this.count++
  }

  // O(1) Dequeue from front
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined

    const dequeuedValue = this.frontPtr!.value
    this.frontPtr = this.frontPtr!.next
    this.count--

    if (this.frontPtr === null) {
      this.rearPtr = null
    }

    return dequeuedValue
  }

  // O(1) Peek at front
  peek(): T | undefined {
    if (this.isEmpty()) return undefined
    return this.frontPtr!.value
  }

  // O(1) Inspect rear
  getRear(): T | undefined {
    if (this.isEmpty()) return undefined
    return this.rearPtr!.value
  }

  get size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0 || this.frontPtr === null
  }

  // Convert to array from front to rear
  toArray(): T[] {
    const result: T[] = []
    let current = this.frontPtr
    while (current !== null) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  clear(): void {
    this.frontPtr = null
    this.rearPtr = null
    this.count = 0
  }
}
