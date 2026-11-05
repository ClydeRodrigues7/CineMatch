# CineMatch — Smart Movie Discovery & Data Structures Visualizer

> **A college-level Data Structures and Algorithms (DSA) mini-project** combining a modern, cinematic movie discovery platform with an interactive computer science laboratory demonstrating 7 fundamental data structures through actual application operations.

---

## 🌟 Project Overview

CineMatch is engineered with two core purposes:

1. **Modern Streaming Discovery Experience:**
   - Cinematic dark interface inspired by premium streaming services (deep charcoal surfaces, neon violet accents, large hero backdrops, studio brand pills, numbered "Top of the Week" cards, trailer modal, and cast views).
   - Deterministic **Mood & Emotional State Discovery** using a transparent ranking formula (Mood Tags 45% + Genre Affinity 35% + Ratings 20%).
   - Seamless integration with **The Movie Database (TMDB) API v3** alongside an **Offline Demo Mode** bundled with 28+ rich, verified movie and TV titles.

2. **Interactive Data Structures Laboratory:**
   - 7 independent, fully functional visualizers implementing actual computer science algorithms (zero prebuilt mockups or fake animations).
   - Real-time synchronization between movie discovery actions (adding to watchlist, viewing history, queuing titles) and internal data structure memory.
   - Dedicated **Guided Presentation Viva Mode** designed for college evaluation and defense.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Framework & Language** | React 19, TypeScript, Vite 8 |
| **Styling & Design System** | Tailwind CSS, Glassmorphism, Cinematic Custom Tokens, Lucide React Icons |
| **Routing & State** | React Router v7, TanStack Query v5, React Context (Single Source of Truth) |
| **Persistence** | LocalStorage API for synchronized watchlists, history, and queues |
| **Testing** | Vitest for unit testing algorithms and data structure operations |
| **External API** | TMDB API v3 (Bearer Token Authentication) with automatic offline fallback |

---

## 📊 The 7 Fundamental Data Structures in CineMatch

| # | Data Structure | CineMatch Application | Key Operations | Time Complexity | Real-World Software Analogy |
|---|---|---|---|---|---|
| **1** | **Singly Linked List** | Viewing History Timeline | `prepend()`, `append()`, `removeById()`, `searchById()`, `traverse()` | Prepend/append (tail pointer): **O(1)**<br>Search/remove by ID: **O(n)** | Music/video playlists, browser session trails, memory free lists |
| **2** | **General Rooted Tree** | Genre Taxonomy Hierarchy | `insertChild()`, `traverseDFS()`, `traverseBFS()`, Subtree filtering | Child insertion with duplicate check: **O(d)**<br>DFS/BFS: **O(V + E)**, BFS space: **O(V)** | DOM (Document Object Model), file systems, taxonomic classifications |
| **3** | **LIFO Stack** | Watchlist Multi-Level Undo | `push()`, `pop()`, `peek()`, Inverse state reversion | Push: **O(1)**<br>Pop: **O(1)** | Editor undo buffers (Ctrl+Z), compiler call stacks, expression parsers |
| **4** | **FIFO Linked Queue** | Watch Next Playback Queue | `enqueue()`, `dequeue()`, `peekFront()`, `peekRear()` | Enqueue: **O(1)**<br>Dequeue: **O(1)** | OS print spoolers, web server request buffers, Kafka topics |
| **5** | **Binary Max-Heap** | Top-Rated & Mood Rankings | `insert()` (sift-up), `extractMax()` (sift-down), Floyd's `buildHeap()` | Peek: **O(1)**<br>Extract: **O(log n)** | Priority task schedulers, Dijkstra's algorithm, Top-K leaderboards |
| **6** | **Hash Table** | Instant Movie Lookup | `set()`, `get()`, `remove()`, FNV-1a hash, Separate chaining | Average: **O(1)**<br>Worst: **O(n)** | In-memory key-value caches (Redis), DB indexes, symbol tables |
| **7** | **Adjacency-List Graph** | Movie Relationship Network | `addEdge()`, `runBFS()` (via Queue), `runDFS()` (via Stack), `findShortestPath()` | Traversal/shortest path: **O(V + E)** | Social networks (LinkedIn degrees of separation), route GPS, recommenders |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20.19+ or v22.12+ (tested on Node v24)
- **npm** v9+ (or pnpm/yarn)
- **GCC-compatible C compiler** (MinGW-w64/MSYS2 GCC on Windows)

### 2. Installation
Clone or navigate to the project directory:
```bash
cd CineApp
npm install
```

### 3. Environment Configuration (TMDB API)
CineMatch works 100% out-of-the-box in **Offline Demo Mode** without any API token.

To connect live TMDB data:
1. Register for a free account at [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Generate an **API Read Access Token (v4 auth Bearer token)** under **Account Settings → API**.
3. Create a `.env` file in the project root (copied from `.env.example`):
```bash
cp .env.example .env
```
4. Set your access token:
```env
VITE_TMDB_ACCESS_TOKEN=your_tmdb_bearer_token_here
```

> **Security Note:** In Vite client-side applications, variables prefixed with `VITE_` are embedded in the browser bundle. This is suitable for local development and academic evaluation. For public production, route API requests through a secure server-side proxy.

### 4. Running the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.

### 5. Running the C DSA Backend

The DSA Laboratory includes a **Live C Backend** console. Its seven operations are executed by a persistent C process; the small Node server only validates HTTP requests and forwards them to that process.

In a second terminal, start the backend:
```powershell
npm run dev:backend
```

The backend compiles every `.c` file in `backend/csrc` with GCC when it starts and serves the engine at `http://127.0.0.1:3001`. Keep both the frontend (`npm run dev`) and backend terminals running. Open **DSA Laboratory** and use the **Live C Backend** panel to execute operations and inspect the resulting nodes, pointers, buckets, heap array, or traversal. The TypeScript frontend mirrors My Library's viewing history, watchlist, and Watch Next queue into the C structures through the existing API; operations in those C structures are reflected back into My Library. Use **Sync with My Library** to resynchronize those collections without resetting unrelated C structures.

On Windows, install MinGW-w64 or MSYS2 UCRT64 GCC and make sure `gcc` is on `PATH`. In PowerShell, start the API with `npm run dev:backend`; set `$env:CC` first if GCC is installed under a non-standard executable name. You can also build the standalone C executable from `backend\csrc` with GNU Make (`make`). The resulting binary is `backend\build\dsa-engine.exe`.

For a Windows PC setup, copy the complete project folder, install Node.js 20.19+ or 22.12+ and a GCC-compatible MinGW-w64/MSYS2 compiler, and add both to `PATH`. Double-click `Run-CineMatch.bat`; it installs npm dependencies if needed, opens separate backend/frontend terminal windows, and launches the app in your browser. Keep those windows open while using CineMatch.

The C command dispatcher is `backend/csrc/main.c`. Each algorithm is separately inspectable in its own `.c`/`.h` pair (`linked_list`, `genre_tree`, `stack`, `queue`, `max_heap`, `hash_table`, and `movie_graph`); shared movie data is declared in `movie.h`. The HTTP bridge in `backend/server.js` validates requests and forwards them over a persistent line-oriented Base64 command protocol; the C process returns one JSON response per command. The C process owns all seven structures for its lifetime, and the existing visualizers remain available alongside this executable backend demonstration.

### 6. Running Automated Unit Tests
To execute the Vitest test suite covering all 7 data structures and mood-scoring algorithms:
```bash
npm run test
```

### 7. Building for Production
```bash
npm run build
```

---

## 🎯 Switching Between Live TMDB Mode and Offline Demo Mode

- In the top navigation bar, toggle the **Demo Mode / TMDB Online** pill button at any time.
- When **Demo Mode** is active, the app uses a bundled dataset of 28+ verified movies and TV series with pre-calculated genre taxonomies, cast connections, and mood tags.
- If TMDB credentials fail or internet connectivity drops, CineMatch automatically enters Demo Mode without interrupting the evaluation.

---

## 🎓 College Viva Presentation Script (5-Minute Demonstration)

When presenting to professors or examiners:

1. **Step 1: Introduction (Discover & Theme)**
   - Click the **Presentation Viva** button in the header or visit `/dsa-lab`.
   - Point out the dark cinematic UI with streaming studio badges, hero banner, and "Popular of the Week" cards (1, 2, 3, 4).
   - Demonstrate the **Mood Selector** ("Mind-Bending") to show how the deterministic transparent formula (Mood 45% + Genre 35% + Rating 20%) ranks titles.

2. **Step 2: Linked List (Viewing History)**
   - Navigate to **DSA Lab → 1. Linked List**.
   - Explain why arrays are inefficient for feeds (`unshift()` takes $O(n)$ to shift memory).
   - Click **Prepend (Head O(1))** to watch the new node connect to `HEAD`.
   - Click **Traverse List** to watch the pointer animate through each node toward `NULL`.

3. **Step 3: General Rooted Tree (Genre Classification)**
   - Navigate to **2. Genre Tree**.
   - Explain why this is a general rooted tree rather than a BST (general categories have arbitrary branching).
   - Click **Run DFS** to show depth-first recursive traversal.
   - Click **Insert Subcategory** to append a custom genre (e.g., "Cyberpunk" under "Sci-Fi").
   - Click any node to watch the **Subtree Filter** instantly display matching movies.

4. **Step 4: LIFO Stack (Watchlist Undo)**
   - Navigate to **3. Stack**.
   - Show the vertical container with the `TOP` pointer.
   - Click **Push "Add to Watchlist"** to push an operation.
   - Click **Pop & Undo Latest Action** to demonstrate that the undo operation **reversibly restores the actual Watchlist state**.

5. **Step 5: FIFO Linked Queue (Watch Next Playlist)**
   - Navigate to **4. FIFO Queue**.
   - Show the horizontal pipeline: `FRONT → [Node] → [Node] ← REAR`.
   - Click **Enqueue** to show rear pointer insertion.
   - Click **Dequeue** to show the front title consumed and the next title advancing to `FRONT`.

6. **Step 6: Binary Max-Heap (Priority Queue)**
   - Navigate to **5. Max-Heap**.
   - Explain the heap invariant: `arr[parent] >= arr[child]`.
   - Toggle between **Highest-Rated** and **Best Mood Match**.
   - Click **Extract Max** to watch the root extracted and sift-down restore the heap in $O(\log n)$ time.

7. **Step 7: Hash Table (Instant Lookup & Chaining)**
   - Navigate to **6. Hash Table**.
   - Show the polynomial rolling hash formula: $h(k) = (\sum k[i] \cdot 31^i) \pmod 8$.
   - Search for a movie ID (e.g. `demo-1`) to show direct bucket addressing in $O(1)$ time.
   - Click **Demonstrate Collision** to show how colliding keys are stored in a separate linked chain.

8. **Step 8: Adjacency-List Graph (Relationships & BFS/DFS)**
   - Navigate to **7. Graph Network**.
   - Point out that **BFS uses our Linked Queue** and **DFS uses our Stack**.
   - Click **Run BFS** to observe circular level-order expansion.
   - Select Source ("Inception") and Target ("The Dark Knight"), then click **Shortest Path** to display the connection path.

9. **Step 9: Academic Documentation & Test Verification**
   - Navigate to **About Project** (`/about`) to present the project requirements, architecture diagram, viva Q&A answers, and the 13/13 Vitest passing report.

---

## ⚖️ TMDB API Disclaimer
"This product uses the TMDB API but is not endorsed or certified by TMDB."

---

## 📜 License
Developed as an academic computer science mini-project in Data Structures and Algorithms. Free for educational reference and evaluation.
