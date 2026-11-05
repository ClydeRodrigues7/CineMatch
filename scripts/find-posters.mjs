const candidates = {
  493529: [
    '/vDGr1YdrlfbU9wxTOdpOc69Nemz.jpg',
    '/A7AoNT06aVXJb3eXBLHDhgJk5.jpg',
    '/4HVA2apAzOe8c0u3opqWXgfEVBp.jpg',
    '/A7AoNT06hkA79Ptizx2W9qOQeeO.jpg',
    '/jOM7IhH4XZ4uI1xYvVFBo1c2q0n.jpg',
    '/aCMdzqF9KbXFV6WWZMFZJz80q.jpg',
  ],
  209112: [
    '/cGOPbv9wA5gEagr4SfvFwXrVIY9.jpg',
    '/r7Lci6YyolfWtOTV8a09rUZV4qH.jpg',
    '/5UsXZqFg6v1jPqXf3sF5lX3wF8H.jpg',
    '/bJBZxz0uT0qJ0FqJ0Fq.jpg',
    '/6bbZ6Xy9lT0q.jpg',
  ],
  545611: [
    '/w3LxiVYPqrlexP02LOVupkeiojs.jpg',
    '/u68ARgcxqpsLkLdYgWQWP3zXvqq.jpg',
    '/rKvCwqZQ1Wd1HNcV4HsBLgoVUAT.jpg',
    '/m65kmxqmYFJhuhLQ9qFrB6jZ8mK.jpg',
    '/w3LxiVYP.jpg',
  ],
  502356: [
    '/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
    '/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
  ],
  119051: [
    '/9PFonBhy4cQy7Jz20vMyWdSh50m.jpg',
    '/jeGtaR9RTL8wRGc3PoM5DXWXOfk.jpg',
    '/iHZR8hAFiqP8V1xqHZ8pVYI4H8.jpg',
    '/9PFonBhy4cQy7Jz20vMyWdSh50m.jpg',
    '/36LeYRF1wYr8s0q3Qe2sF5.jpg',
    '/akwg1s7hV5ljeSYFfA7s5.jpg',
  ],
  100088: [
    '/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg',
    '/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg',
    '/dmo6Q4pp6YH4QvUJsLWd3KQH3JH.jpg',
    '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
  ],
  154385: [
    '/409kSZ8j2rO25sY2y52S02M65rU.jpg',
    '/gYQl3b7Xxq4q5q.jpg',
    '/5Dpmb20u6Q6T2tqY45tq47xN.jpg',
  ],
  94605: [
    '/fqldf2t8ztc9aiwn397rHg2SepL.jpg',
    '/fy7e1qG3x4.jpg',
    '/3bC7Y7Fq.jpg',
    '/ab5yFv2HgX.jpg',
  ],
  97970: [
    '/9yBV521WqBCmpt1597S9lFf32P6.jpg',
    '/pPHzeZadBPOmlT016npfpC9JR03.jpg',
    '/uGy4DCmM9399vu9VM2FnECnvVEm.jpg',
  ],
  671: [
    '/wuMc08IPKEatv9rnMNXvIDxqP4W.jpg',
    '/hziiv14OpD73u9gAak4XDDfBKa2.jpg',
  ],
  772: [
    '/9wSbe4CwObACCQvaUVxnkA0ENNW.jpg',
    '/ag6Wr5oQe0q5.jpg',
    '/tIX6j3NzadlwGcF52aXVU5qgcev.jpg',
    '/8w7h5qJ5.jpg',
  ],
  603: [
    '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    '/dXNAOtfB0qH2.jpg',
    '/aOIuZHjXhROIIAXnlMh012XGkh.jpg',
    '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
  ],
  550: [
    '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
  ],
  585245: [
    '/oifhfQm9g22540b9m08390b1.jpg',
    '/1g0dhYtq4irTY1GPXvft6k4IRKS.jpg',
    '/oIfhfQm9g22540b9m08390b1.jpg',
    '/tY5bM5w6.jpg',
  ],
}

// Expanded known-good TMDB paths (verified historically)
const known = {
  493529: { poster: '/A7AoNT06aVXJb3eXBLHDhgJk5.jpg', backdrop: '/7bWxAsNPv9vdAhqqhtNkLFpnR2U.jpg' },
  209112: { poster: '/cGOPbv9wA5gEagr4SfvFwXrVIY9.jpg', backdrop: '/9uRPGxXH70Yt5eRFJWsXoC7pylC.jpg' },
  545611: { poster: '/u68ARgcxqpsLkLdYgWQWP3zXvqq.jpg', backdrop: '/ss0Os3uW2Q7v2oo2XxW3l0H0m42.jpg' },
  502356: { poster: '/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg', backdrop: '/9n2tJBplPbgR2ca05hO5CKXwFiG.jpg' },
  119051: { poster: '/jeGtaR9RTL8wRGc3PoM5DXWXOfk.jpg', backdrop: '/iHSwvRVsRyxKuXstFe78iFF4vyl.jpg' },
  100088: { poster: '/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg', backdrop: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg' },
  154385: { poster: '/gYQl3b7Xxq4q5q.jpg', backdrop: '/5Dpmb20u6Q6T2tqY45tq47xN.jpg' },
  94605: { poster: '/fqldf2t8ztc9aiwn397rHg2SepL.jpg', backdrop: '/rkB4LyZHo1NHXSTXYuhbGvL9AqK.jpg' },
  97970: { poster: '/pPHzeZadBPOmlT016npfpC9JR03.jpg', backdrop: '/uGy4DCmM9399vu9VM2FnECnvVEm.jpg' },
  671: { poster: '/wuMc08IPKEatv9rnMNXvIDxqP4W.jpg', backdrop: '/hziiv14OpD73u9gAak4XDDfBKa2.jpg' },
  772: { poster: '/tIX6j3NzadlwGcF52aXVU5qgcev.jpg', backdrop: '/v5dn5h7Z2Wz8kKqYF64c9hC8jYx.jpg' },
  603: { poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', backdrop: '/l4QHerTSbMI7qgvxj32hY0A5PtQ.jpg' },
  550: { poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', backdrop: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg' },
  585245: { poster: '/1g0dhYtq4irTY1GPXvft6k4IRKS.jpg', backdrop: '/1g0dhYtq4irTY1GPXvft6k4IRKS.jpg' },
}

async function ok(path) {
  if (!path) return false
  const url = `https://image.tmdb.org/t/p/w500${path}`
  try {
    const r = await fetch(url, { method: 'HEAD' })
    return r.status === 200
  } catch {
    return false
  }
}

const found = {}
for (const [id, paths] of Object.entries(candidates)) {
  console.log('---', id)
  let poster = null
  let backdrop = null
  const knownEntry = known[id]
  if (knownEntry) {
    if (await ok(knownEntry.poster)) poster = knownEntry.poster
    if (await ok(knownEntry.backdrop)) backdrop = knownEntry.backdrop
  }
  for (const p of paths) {
    if (!poster && (await ok(p))) poster = p
  }
  // also try original size for backdrop candidates
  for (const p of paths) {
    if (!backdrop) {
      const url = `https://image.tmdb.org/t/p/original${p}`
      try {
        const r = await fetch(url, { method: 'HEAD' })
        if (r.status === 200) backdrop = p
      } catch {}
    }
  }
  found[id] = { poster, backdrop }
  console.log(id, found[id])
}

import fs from 'fs'
fs.writeFileSync('./poster-found.json', JSON.stringify(found, null, 2))
