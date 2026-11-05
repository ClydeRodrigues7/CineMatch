import fs from 'fs'

const text = fs.readFileSync('./src/data/sampleMovies.ts', 'utf8')
const blocks = text.split(/\{\s*id:\s*'demo-/).slice(1)

const entries = blocks.map((block, i) => {
  const id = String(i + 1)
  const tmdbId = block.match(/tmdbId:\s*(\d+)/)?.[1]
  const title =
    block.match(/title:\s*'((?:\\'|[^'])*)'/)?.[1]?.replace(/\\'/g, "'") ||
    block.match(/title:\s*"((?:\\"|[^"])*)"/)?.[1]
  const mediaType = block.match(/mediaType:\s*'(movie|tv)'/)?.[1] || 'movie'
  return { demoId: `demo-${id}`, tmdbId, title, mediaType }
})

const results = []
for (const entry of entries) {
  const url = `https://www.themoviedb.org/${entry.mediaType}/${entry.tmdbId}`
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CineMatchBot/1.0)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    const html = await res.text()
    const og =
      html.match(/property="og:image"\s+content="([^"]+)"/) ||
      html.match(/content="([^"]+)"\s+property="og:image"/)
    const poster = og?.[1] ?? null
    let path = null
    if (poster?.includes('/t/p/')) {
      const parts = poster.split('/t/p/')[1]
      const slash = parts.indexOf('/')
      path = slash >= 0 ? parts.slice(slash) : null
    }
    // backdrop from page json if present
    const backdropMatch = html.match(/"backdrop_path":"(\/[^"]+)"/)
    const posterMatch = html.match(/"poster_path":"(\/[^"]+)"/)
    if (posterMatch?.[1]) path = posterMatch[1]
    const backdrop = backdropMatch?.[1] ?? null
    results.push({ ...entry, path, backdrop, ok: Boolean(path) })
    console.log(`${entry.title}: ${path || 'FAIL'}`)
  } catch (e) {
    results.push({ ...entry, path: null, backdrop: null, ok: false, err: String(e) })
    console.log(`${entry.title}: ERR ${e.message}`)
  }
}

fs.writeFileSync('./poster-hydrate.json', JSON.stringify(results, null, 2))
console.log(`done ${results.filter((r) => r.ok).length}/${results.length}`)
