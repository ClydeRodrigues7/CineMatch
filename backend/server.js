import { createServer } from 'node:http'
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const backendRoot = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(backendRoot, '..')
const sourceDir = path.join(backendRoot, 'csrc')
const buildDir = path.join(backendRoot, 'build')
const executable = path.join(buildDir, process.platform === 'win32' ? 'dsa-engine.exe' : 'dsa-engine')
const port = Number(process.env.CINEMATCH_BACKEND_PORT || 3001)

const structures = new Set(['LIST', 'TREE', 'STACK', 'QUEUE', 'HEAP', 'HASH', 'GRAPH', 'RESET', 'STATUS'])
const actions = {
  LIST: new Set(['PREPEND', 'APPEND', 'REMOVE', 'SEARCH', 'TRAVERSE']),
  TREE: new Set(['ADD', 'FIND', 'DFS', 'BFS']),
  STACK: new Set(['ADD', 'REMOVE', 'UNDO']),
  QUEUE: new Set(['ENQUEUE', 'DEQUEUE', 'PEEK']),
  HEAP: new Set(['INSERT', 'EXTRACT', 'PEEK']),
  HASH: new Set(['INSERT', 'SEARCH', 'DELETE', 'COLLISION']),
  GRAPH: new Set(['BFS', 'DFS', 'SHORTEST']),
}

function compileBackend() {
  mkdirSync(buildDir, { recursive: true })

  const compiler = process.env.CC || 'gcc'
  const sources = readdirSync(sourceDir)
    .filter((file) => file.endsWith('.c'))
    .sort()
    .map((file) => path.join(sourceDir, file))
  if (sources.length === 0) throw new Error(`No C source files found in ${sourceDir}.`)
  const args = ['-std=c11', '-Wall', '-Wextra', '-Wpedantic', '-O2', ...sources, '-o', executable]
  const result = spawnSync(compiler, args, { cwd: backendRoot, encoding: 'utf8', windowsHide: true })
  if (result.error || result.status !== 0) {
    throw new Error(`Could not compile the C backend with ${compiler}. Install GCC (MinGW-w64/MSYS2) and ensure gcc is on PATH. ${result.stderr || result.error?.message || ''}`)
  }
}

compileBackend()

const engine = spawn(executable, [], { cwd: projectRoot, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true })
const output = createInterface({ input: engine.stdout })
let pending = []
let stderr = ''
engine.stderr.setEncoding('utf8').on('data', (chunk) => { stderr = (stderr + chunk).slice(-4000) })
output.on('line', (line) => {
  const current = pending.shift()
  if (!current) return
  try { current.resolve(JSON.parse(line)) }
  catch { current.reject(new Error(`C backend returned invalid JSON: ${line.slice(0, 300)}`)) }
})
engine.on('error', (error) => {
  for (const item of pending.splice(0)) item.reject(error)
})
engine.on('exit', (code) => {
  const detail = stderr ? ` ${stderr}` : ''
  for (const item of pending.splice(0)) item.reject(new Error(`C backend exited (${code}).${detail}`))
})

let commandQueue = Promise.resolve()
function encode(value = '') { return Buffer.from(String(value), 'utf8').toString('base64') }
function field(value, name, maximum, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${name} is required.`)
    return ''
  }
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error(`${name} must be a string or number.`)
  const text = String(value).trim()
  if (required && text.length === 0) throw new Error(`${name} is required.`)
  if (text.length > maximum) throw new Error(`${name} must be at most ${maximum} characters.`)
  return text
}
function commandFor(body) {
  const structure = typeof body.structure === 'string' ? body.structure.toUpperCase() : ''
  const action = typeof body.action === 'string' ? body.action.toUpperCase() : ''
  if (structure === 'RESET' || structure === 'STATUS') return `${structure}\n`
  if (!structures.has(structure) || !actions[structure]?.has(action)) throw new Error('Unsupported data structure operation.')
  const movieActionRequiresTitle =
    (structure === 'LIST' && ['PREPEND', 'APPEND'].includes(action)) ||
    (structure === 'STACK' && action === 'ADD') ||
    (structure === 'QUEUE' && action === 'ENQUEUE') ||
    (structure === 'HEAP' && action === 'INSERT') ||
    (structure === 'HASH' && action === 'INSERT')
  const idRequired =
    (structure === 'LIST' && action !== 'TRAVERSE') ||
    (structure === 'STACK' && ['ADD', 'REMOVE'].includes(action)) ||
    (structure === 'QUEUE' && action === 'ENQUEUE') ||
    (structure === 'HEAP' && action === 'INSERT') ||
    (structure === 'HASH' && ['INSERT', 'SEARCH', 'DELETE'].includes(action)) ||
    (structure === 'TREE' && ['ADD', 'FIND'].includes(action)) ||
    structure === 'GRAPH'
  const idValue = structure === 'GRAPH'
    ? field(body.sourceId, 'Source movie ID', 47, true)
    : structure === 'TREE' && action === 'ADD'
      ? field(body.parentId, 'Parent category', 200, true)
      : field(body.movieId ?? body.id ?? body.query ?? body.parentId, 'Movie ID or category', 47, idRequired)
  const titleValue = structure === 'GRAPH'
    ? field(body.targetId, 'Target movie ID', 47, action === 'SHORTEST')
    : structure === 'TREE' && action === 'ADD'
      ? field(body.genreName, 'Child category', 200, true)
      : field(body.title, 'Movie title', 159, movieActionRequiresTitle)
  const scoreValue = structure === 'HEAP' && action === 'INSERT'
    ? Number(field(body.score, 'Priority score', 32, true))
    : 0
  if (structure === 'HEAP' && action === 'INSERT' && !Number.isFinite(scoreValue)) {
    throw new Error('Priority score must be a finite number.')
  }
  const id = encode(idValue)
  const title = encode(titleValue)
  const extra = encode(scoreValue)
  if (structure === 'GRAPH') return `${structure}\t${action}\t${id}\t${title}\n`
  if (structure === 'TREE') return `${structure}\t${action}\t${id}\t${title}\n`
  if (structure === 'HEAP') return `${structure}\t${action}\t${id}\t${title}\t${extra}\n`
  if (['LIST', 'STACK', 'QUEUE', 'HASH'].includes(structure)) return `${structure}\t${action}\t${id}\t${title}\n`
  return `${structure}\t${action}\n`
}

function sendCommand(line) {
  const task = commandQueue.then(() => new Promise((resolve, reject) => {
    if (engine.exitCode !== null) return reject(new Error('C backend process is not running.'))
    const timer = setTimeout(() => {
      const index = pending.findIndex((item) => item.resolve === resolve)
      if (index >= 0) pending.splice(index, 1)
      reject(new Error('C backend operation timed out.'))
    }, 5000)
    pending.push({ resolve: (value) => { clearTimeout(timer); resolve(value) }, reject: (error) => { clearTimeout(timer); reject(error) } })
    engine.stdin.write(line, (error) => {
      if (!error) return
      pending.pop()
      clearTimeout(timer)
      reject(error)
    })
  }))
  commandQueue = task.catch(() => {})
  return task
}

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(value))
}

async function readBody(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 16_384) throw new Error('Request body exceeds 16 KB.')
  }
  return JSON.parse(body || '{}')
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/dsa/health') {
    try { json(res, 200, await sendCommand('STATUS\n')) }
    catch (error) { json(res, 503, { ok: false, message: error.message }) }
    return
  }
  if (req.method !== 'POST' || req.url !== '/api/dsa/execute') {
    json(res, 404, { ok: false, message: 'Route not found.' })
    return
  }
  try {
    const body = await readBody(req)
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be a JSON object.')
    }
    const result = await sendCommand(commandFor(body))
    json(res, result.ok === false ? 400 : 200, result)
  } catch (error) {
    json(res, 400, { ok: false, message: error instanceof Error ? error.message : 'Invalid request.' })
  }
})

server.listen(port, '127.0.0.1', () => process.stdout.write(`CineMatch C backend listening on http://127.0.0.1:${port}\n`))
function stop() { server.close(); engine.kill(); process.exit(0) }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
