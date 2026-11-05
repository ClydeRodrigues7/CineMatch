import fs from 'fs'

const text = fs.readFileSync('./src/data/sampleMovies.ts', 'utf8')
const chunks = text.split(/^\s*\{\s*$/m).slice(1)

const movies = []
for (const chunk of chunks) {
  if (!chunk.includes("id: 'demo-")) continue
  const id = chunk.match(/id:\s*'(demo-\d+)'/)?.[1]
  const tmdbId = Number(chunk.match(/tmdbId:\s*(\d+)/)?.[1])
  const titleMatch = chunk.match(/title:\s*'((?:\\'|[^'])*)'/) || chunk.match(/title:\s*"((?:\\"|[^"])*)"/)
  const title = titleMatch?.[1]?.replace(/\\'/g, "'")
  const year = chunk.match(/releaseDate:\s*'(\d{4})/)?.[1]
  const mediaType = chunk.match(/mediaType:\s*'(movie|tv)'/)?.[1]
  if (id && title && mediaType) movies.push({ id, tmdbId, title, year, mediaType })
}

async function omdbPoster(title, year) {
  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', 'trilogy')
  url.searchParams.set('t', title)
  if (year) url.searchParams.set('y', year)
  url.searchParams.set('type', 'movie')
  const res = await fetch(url)
  const data = await res.json()
  if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
    return { poster: data.Poster, imdb: data.imdbID, source: 'omdb' }
  }
  // retry without year
  url.searchParams.delete('y')
  const res2 = await fetch(url)
  const data2 = await res2.json()
  if (data2.Response === 'True' && data2.Poster && data2.Poster !== 'N/A') {
    return { poster: data2.Poster, imdb: data2.imdbID, source: 'omdb' }
  }
  return null
}

async function tvmazePoster(title) {
  const url = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const poster = data.image?.original || data.image?.medium
  if (!poster) return null
  return { poster, backdrop: poster, tvmazeId: data.id, source: 'tvmaze' }
}

const results = []
for (const m of movies) {
  try {
    let art = null
    if (m.mediaType === 'tv') {
      art = await tvmazePoster(m.title)
      if (!art) art = await omdbPoster(m.title, m.year)
    } else {
      art = await omdbPoster(m.title, m.year)
      if (!art) art = await tvmazePoster(m.title)
    }
    results.push({ ...m, ...art, ok: Boolean(art?.poster) })
    console.log(`${m.title}: ${art?.poster ? 'OK' : 'FAIL'} (${art?.source || '-'})`)
  } catch (e) {
    results.push({ ...m, ok: false, err: e.message })
    console.log(`${m.title}: ERR ${e.message}`)
  }
  // gentle rate limit for OMDb
  await new Promise((r) => setTimeout(r, 250))
}

fs.writeFileSync('./src/data/posterCache.json', JSON.stringify(results, null, 2))
console.log(`hydrated ${results.filter((r) => r.ok).length}/${results.length}`)
