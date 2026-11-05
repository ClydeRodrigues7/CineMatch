import { HashEntry, HashSearchTrace } from '../types'

// Educational Hash Table with Separate Chaining Collision Resolution
// Implements manual polynomial rolling hash function and explicit bucket array.

export class MovieHashTable<T> {
  private capacity: number
  private buckets: HashEntry<T>[][]
  private count = 0

  constructor(capacity = 8) {
    this.capacity = capacity
    this.buckets = Array.from({ length: capacity }, () => [])
  }

  // Polynomial rolling hash function: h(s) = (∑ s[i] * 31^i) mod capacity
  computeHash(key: string): { rawHash: number; bucketIndex: number } {
    let rawHash = 0
    const prime = 31

    for (let i = 0; i < key.length; i++) {
      rawHash = (rawHash * prime + key.charCodeAt(i)) >>> 0 // 32-bit unsigned int
    }

    const bucketIndex = rawHash % this.capacity
    return { rawHash, bucketIndex }
  }

  // Insert or update key-value pair: O(1) average, O(n) worst-case
  set(
    key: string,
    value: T
  ): { bucketIndex: number; rawHash: number; updated: boolean; chainLength: number } {
    const { rawHash, bucketIndex } = this.computeHash(key)
    const bucket = this.buckets[bucketIndex]

    // Check if key already exists in the bucket's chain (Separate Chaining)
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i].value = value
        bucket[i].hash = rawHash
        return {
          bucketIndex,
          rawHash,
          updated: true,
          chainLength: bucket.length,
        }
      }
    }

    // New entry: append to chain
    bucket.push({ key, value, hash: rawHash })
    this.count++

    return {
      bucketIndex,
      rawHash,
      updated: false,
      chainLength: bucket.length,
    }
  }

  // Search by key with full educational trace: O(1) average
  get(key: string): HashSearchTrace<T> {
    const { rawHash, bucketIndex } = this.computeHash(key)
    const bucket = this.buckets[bucketIndex]
    const inspectedKeys: string[] = []
    let comparisons = 0

    for (let i = 0; i < bucket.length; i++) {
      comparisons++
      inspectedKeys.push(bucket[i].key)

      if (bucket[i].key === key) {
        return {
          found: true,
          hash: rawHash,
          bucketIndex,
          comparisons,
          inspectedKeys,
          result: bucket[i].value,
          message: `Found key "${key}" in Bucket [${bucketIndex}] after ${comparisons} comparison(s). Hash: ${rawHash}.`,
        }
      }
    }

    return {
      found: false,
      hash: rawHash,
      bucketIndex,
      comparisons,
      inspectedKeys,
      message: `Key "${key}" not found in Bucket [${bucketIndex}]. Inspected ${comparisons} chain entry/entries.`,
    }
  }

  // Remove key: O(1) average
  remove(key: string): boolean {
    const { bucketIndex } = this.computeHash(key)
    const bucket = this.buckets[bucketIndex]

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket.splice(i, 1)
        this.count--
        return true
      }
    }

    return false
  }

  // Inspect all buckets for visualization
  getBuckets(): HashEntry<T>[][] {
    return this.buckets.map((b) => [...b])
  }

  get size(): number {
    return this.count
  }

  get tableCapacity(): number {
    return this.capacity
  }

  get loadFactor(): number {
    return Number((this.count / this.capacity).toFixed(2))
  }

  get collisionCount(): number {
    let collisions = 0
    for (const bucket of this.buckets) {
      if (bucket.length > 1) {
        collisions += bucket.length - 1
      }
    }
    return collisions
  }

  clear(): void {
    this.buckets = Array.from({ length: this.capacity }, () => [])
    this.count = 0
  }
}
