import { GenreTreeNodeData } from '../types'

// General Rooted Tree Implementation for Hierarchical Genre Classification
// Demonstrates hierarchical data representation, DFS traversal, child insertion, and category filtering.

export class GenreTreeNode {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
  children: GenreTreeNode[]
  isExpanded: boolean

  constructor(
    data: GenreTreeNodeData,
    parentId: string | null = null,
    children: GenreTreeNode[] = []
  ) {
    this.id = data.id
    this.name = data.name
    this.slug = data.slug
    this.description = data.description
    this.parentId = parentId
    this.children = children
    this.isExpanded = true
  }
}

export interface TreeTraversalStep {
  step: number
  nodeId: string
  nodeName: string
  depth: number
  parentId: string | null
}

export class GenreTree {
  private root: GenreTreeNode

  constructor(rootData?: GenreTreeNodeData) {
    const defaultRoot: GenreTreeNodeData = rootData || {
      id: 'root',
      name: 'All Genres',
      slug: 'all',
      description: 'Top-level root of movie genre classification',
    }
    this.root = new GenreTreeNode(defaultRoot, null)
    this.initializeDefaultTree()
  }

  getRoot(): GenreTreeNode {
    return this.root
  }

  // Populate academic hierarchy tree
  private initializeDefaultTree(): void {
    // Level 1: Major Genres
    const thriller = this.insertChild('root', {
      id: 'thriller',
      name: 'Thriller',
      slug: 'thriller',
      description: 'Suspenseful and high-stakes narratives',
    })
    if (thriller) {
      this.insertChild('thriller', {
        id: 'psychological-thriller',
        name: 'Psychological Thriller',
        slug: 'psychological-thriller',
        description: 'Focuses on unstable and delusional mental states',
      })
      this.insertChild('thriller', {
        id: 'crime-thriller',
        name: 'Crime Thriller',
        slug: 'crime-thriller',
        description: 'Underworld, heists, and detective investigations',
      })
    }

    const sciFi = this.insertChild('root', {
      id: 'sci-fi',
      name: 'Science Fiction',
      slug: 'sci-fi',
      description: 'Speculative fiction with scientific imagination',
    })
    if (sciFi) {
      this.insertChild('sci-fi', {
        id: 'time-travel',
        name: 'Time Travel',
        slug: 'time-travel',
        description: 'Temporal paradoxes and alternate timelines',
      })
      this.insertChild('sci-fi', {
        id: 'space-exploration',
        name: 'Space & Cosmic',
        slug: 'space-exploration',
        description: 'Interstellar travel and cosmic mysteries',
      })
    }

    const comedy = this.insertChild('root', {
      id: 'comedy',
      name: 'Comedy',
      slug: 'comedy',
      description: 'Lighthearted and humorous storytelling',
    })
    if (comedy) {
      this.insertChild('comedy', {
        id: 'romantic-comedy',
        name: 'Romantic Comedy',
        slug: 'romantic-comedy',
        description: 'Humorous storylines centered on romantic love',
      })
    }

    const drama = this.insertChild('root', {
      id: 'drama',
      name: 'Drama',
      slug: 'drama',
      description: 'Character-driven emotional depth and conflict',
    })
    if (drama) {
      this.insertChild('drama', {
        id: 'biography',
        name: 'Biography & History',
        slug: 'biography',
        description: 'Real-life historical figures and biographical narratives',
      })
    }

    const action = this.insertChild('root', {
      id: 'action',
      name: 'Action',
      slug: 'action',
      description: 'High energy, stunts, and physical spectacles',
    })
    if (action) {
      this.insertChild('action', {
        id: 'superhero',
        name: 'Superhero',
        slug: 'superhero',
        description: 'Comic book adaptations and superpowered heroes',
      })
    }
  }

  // Insert child node under parentId: O(n) search + O(1) append
  insertChild(parentId: string, data: GenreTreeNodeData): GenreTreeNode | null {
    const parent = this.findNode(this.root, parentId)
    if (!parent) return null

    // Avoid duplicate IDs
    if (this.findNode(this.root, data.id)) return null

    const newNode = new GenreTreeNode(data, parentId)
    parent.children.push(newNode)
    return newNode
  }

  // Find node by id recursively: O(n)
  findNode(current: GenreTreeNode, id: string): GenreTreeNode | null {
    if (current.id === id) return current

    for (const child of current.children) {
      const found = this.findNode(child, id)
      if (found) return found
    }

    return null
  }

  // Search by keyword in name or description
  search(keyword: string): GenreTreeNode[] {
    const results: GenreTreeNode[] = []
    const lower = keyword.toLowerCase().trim()
    if (!lower) return results

    const dfs = (node: GenreTreeNode) => {
      if (
        node.name.toLowerCase().includes(lower) ||
        node.description.toLowerCase().includes(lower) ||
        node.slug.toLowerCase().includes(lower)
      ) {
        results.push(node)
      }
      for (const child of node.children) {
        dfs(child)
      }
    }

    dfs(this.root)
    return results
  }

  // Depth First Search (DFS) Traversal with educational step trace: O(n)
  traverseDFS(): TreeTraversalStep[] {
    const steps: TreeTraversalStep[] = []
    let stepCount = 0

    const dfs = (node: GenreTreeNode, depth: number) => {
      stepCount++
      steps.push({
        step: stepCount,
        nodeId: node.id,
        nodeName: node.name,
        depth,
        parentId: node.parentId,
      })

      for (const child of node.children) {
        dfs(child, depth + 1)
      }
    }

    dfs(this.root, 0)
    return steps
  }

  // Breadth First Search (BFS) Traversal: O(n)
  traverseBFS(): TreeTraversalStep[] {
    const steps: TreeTraversalStep[] = []
    const queue: Array<{ node: GenreTreeNode; depth: number }> = [{ node: this.root, depth: 0 }]
    let stepCount = 0

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!
      stepCount++
      steps.push({
        step: stepCount,
        nodeId: node.id,
        nodeName: node.name,
        depth,
        parentId: node.parentId,
      })

      for (const child of node.children) {
        queue.push({ node: child, depth: depth + 1 })
      }
    }

    return steps
  }

  // Toggle node expansion
  toggleExpand(nodeId: string): boolean {
    const node = this.findNode(this.root, nodeId)
    if (node) {
      node.isExpanded = !node.isExpanded
      return true
    }
    return false
  }

  // Get path from root to node: e.g. ["All Genres", "Thriller", "Psychological Thriller"]
  getPathToNode(nodeId: string): string[] {
    const path: string[] = []
    let curr = this.findNode(this.root, nodeId)
    while (curr) {
      path.unshift(curr.name)
      if (!curr.parentId) break
      curr = this.findNode(this.root, curr.parentId)
    }
    return path
  }

  // Collect all genre slugs within this subtree for movie catalog filtering
  getAllSubtreeSlugs(nodeId: string): string[] {
    const node = this.findNode(this.root, nodeId)
    if (!node) return []

    const slugs: string[] = []
    const collect = (curr: GenreTreeNode) => {
      slugs.push(curr.slug)
      slugs.push(curr.name.toLowerCase())
      for (const child of curr.children) {
        collect(child)
      }
    }
    collect(node)
    return slugs
  }

  reset(): void {
    this.root = new GenreTreeNode(
      {
        id: 'root',
        name: 'All Genres',
        slug: 'all',
        description: 'Top-level root of movie genre classification',
      },
      null
    )
    this.initializeDefaultTree()
  }
}
