import fs from 'fs'

const text = fs.readFileSync('./src/data/sampleMovies.ts', 'utf8')
const posters = [...text.matchAll(/posterPath:\s*'([^']+)'/g)].map((m) => m[1])
const backdrops = [...text.matchAll(/backdropPath:\s*'([^']+)'/g)].map((m) => m[1])
const titles = [...text.matchAll(/title:\s*'((?:\\'|[^'])*)'/g)].map((m) => m[1].replace(/\\'/g, "'"))

async function check(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' })
    return r.status
  } catch {
    try {
      const r = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } })
      return r.status
    } catch (e) {
      return 'ERR:' + e.message
    }
  }
}

const out = []
for (let i = 0; i < posters.length; i++) {
  const p = await check(posters[i])
  const b = await check(backdrops[i])
  const row = { title: titles[i], poster: p, backdrop: b, posterUrl: posters[i], backdropUrl: backdrops[i] }
  out.push(row)
  console.log(`${titles[i]} | poster=${p} | backdrop=${b}`)
}
fs.writeFileSync('./poster-check.json', JSON.stringify(out, null, 2))
