import { SAMPLE_MOVIES } from '../data/sampleMovies'
import posterCache from '../data/posterCache.json'
import { Movie } from '../types'
import { generateBackdropSvg, generatePosterSvg } from '../utils/imageFallback'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
}

type PosterCacheEntry = {
  id: string
  poster?: string
  backdrop?: string
  ok?: boolean
}

const POSTER_BY_ID = new Map<string, PosterCacheEntry>(
  (posterCache as PosterCacheEntry[]).map((entry) => [entry.id, entry])
)

export function getTMDBImageUrl(
  path: string | null | undefined,
  size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'
): string {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${TMDB_IMAGE_BASE}/${size}${normalized}`
}

function extractTmdbPath(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath) return null
  if (urlOrPath.startsWith('data:')) return urlOrPath
  if (urlOrPath.startsWith('http') && urlOrPath.includes('/t/p/')) {
    const parts = urlOrPath.split('/t/p/')[1]
    const slash = parts.indexOf('/')
    return slash >= 0 ? parts.slice(slash) : null
  }
  if (urlOrPath.startsWith('http')) return urlOrPath
  return urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`
}

/** Ensures every movie has displayable poster + backdrop artwork. */
export function ensureMovieArtwork(movie: Movie): Movie {
  const cached = POSTER_BY_ID.get(movie.id)
  const genre = movie.genres?.[0] || 'Cinema'

  let posterPath =
    cached?.poster ||
    getTMDBImageUrl(extractTmdbPath(movie.posterPath), 'w500') ||
    movie.posterPath

  const movieBackdropPath = extractTmdbPath(movie.backdropPath)
  const posterFilePath = extractTmdbPath(movie.posterPath)
  const hasDedicatedBackdrop = Boolean(movieBackdropPath && movieBackdropPath !== posterFilePath)
  const cachedBackdropIsPoster = Boolean(cached?.backdrop && cached.backdrop === cached.poster)
  const backdropPath =
    (hasDedicatedBackdrop &&
      (getTMDBImageUrl(movieBackdropPath, 'original') || movie.backdropPath)) ||
    (!cachedBackdropIsPoster && cached?.backdrop) ||
    generateBackdropSvg(movie.title, genre)

  if (!posterPath) {
    posterPath = generatePosterSvg(movie.title, genre, movie.voteAverage)
  }
  return { ...movie, posterPath, backdropPath }
}

function dedupeMovies(movies: Movie[]): Movie[] {
  const seen = new Set<string>()
  const out: Movie[] = []
  for (const movie of movies) {
    const key = movie.tmdbId ? `tmdb-${movie.tmdbId}` : movie.id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(movie)
  }
  return out
}

export class TMDBService {
  private accessToken: string | null = null
  private apiKey: string | null = null
  private forceDemoMode = false

  constructor() {
    this.accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN || null
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY || null
  }

  setForceDemoMode(value: boolean) {
    this.forceDemoMode = value
  }

  hasCredentials(): boolean {
    return Boolean(
      (this.accessToken && this.accessToken.trim() && this.accessToken !== 'your_tmdb_bearer_token_here') ||
        (this.apiKey && this.apiKey.trim() && this.apiKey !== 'your_tmdb_api_key_here')
    )
  }

  isDemoModeActive(): boolean {
    return this.forceDemoMode || !this.hasCredentials()
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (this.accessToken && this.accessToken.trim() && this.accessToken !== 'your_tmdb_bearer_token_here') {
      headers.Authorization = `Bearer ${this.accessToken}`
    }
    return headers
  }

  private async fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (this.isDemoModeActive()) {
      throw new Error('DEMO_MODE_ACTIVE')
    }

    const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
    Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val))
    if (this.apiKey && (!this.accessToken || this.accessToken === 'your_tmdb_bearer_token_here')) {
      url.searchParams.set('api_key', this.apiKey)
    }

    const response = await fetch(url.toString(), { headers: this.getHeaders() })
    if (!response.ok) {
      throw new Error(`TMDB HTTP error ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }

  private mapRawTMDBItem(item: any, mediaTypeDefault: 'movie' | 'tv' = 'movie'): Movie | null {
    // Skip entries with no poster — blank cards are never acceptable
    if (!item.poster_path) return null

    const isTV = item.media_type === 'tv' || mediaTypeDefault === 'tv' || (item.name && !item.title)
    const title = item.title || item.name || 'Untitled'
    const releaseDate = item.release_date || item.first_air_date || '2023-01-01'

    const genreNames: string[] = []
    if (Array.isArray(item.genre_ids)) {
      item.genre_ids.forEach((id: number) => {
        if (GENRE_MAP[id]) genreNames.push(GENRE_MAP[id])
      })
    } else if (Array.isArray(item.genres)) {
      item.genres.forEach((g: any) => genreNames.push(g.name))
    }

    const moodTags: string[] = []
    if (genreNames.includes('Science Fiction') || genreNames.includes('Mystery')) moodTags.push('mind-bending')
    if (genreNames.includes('Comedy') || genreNames.includes('Animation')) {
      moodTags.push('comfort-watch', 'feel-good')
    }
    if (genreNames.includes('Thriller') || genreNames.includes('Horror')) {
      moodTags.push('dark-twisted', 'intense-thriller')
    }
    if (genreNames.includes('Action') || genreNames.includes('Adventure')) moodTags.push('adventure')
    if (genreNames.includes('Drama')) moodTags.push('emotional')
    if (genreNames.includes('Crime')) moodTags.push('plot-twist', 'dark-twisted')

    return {
      id: `tmdb-${item.id}`,
      tmdbId: item.id,
      title,
      overview: item.overview || 'No synopsis available.',
      posterPath: getTMDBImageUrl(item.poster_path, 'w500'),
      backdropPath: item.backdrop_path
        ? getTMDBImageUrl(item.backdrop_path, 'original')
        : generateBackdropSvg(title, genreNames[0] || 'Cinema'),
      releaseDate,
      voteAverage: Number(item.vote_average?.toFixed(1)) || 7.0,
      voteCount: item.vote_count || 100,
      genres: genreNames.length > 0 ? genreNames : ['Cinema'],
      genreIds: item.genre_ids,
      mediaType: isTV ? 'tv' : 'movie',
      runtime: item.runtime || (isTV ? 45 : 120),
      cast: [],
      moodTags: moodTags.length > 0 ? moodTags : ['popular', 'recommended'],
      network: isTV ? 'TV Network' : 'Theatrical Studio',
    }
  }

  private mapResults(results: any[], mediaTypeDefault: 'movie' | 'tv' = 'movie'): Movie[] {
    return results
      .map((item) => this.mapRawTMDBItem(item, mediaTypeDefault))
      .filter((m): m is Movie => Boolean(m))
  }

  /** Bundled demo catalogue with verified poster artwork (OMDb/TVMaze hydrated). */
  getDemoCatalogue(): Movie[] {
    return SAMPLE_MOVIES.map(ensureMovieArtwork)
  }

  /**
   * Full catalogue for the app shell.
   * Online: merges trending + popular movies/TV + top rated (posters required).
   * Offline: returns hydrated sample catalogue.
   */
  async getCatalogue(): Promise<Movie[]> {
    if (this.isDemoModeActive()) {
      return this.getDemoCatalogue()
    }

    try {
      const [trending, popular, topRated, tv] = await Promise.all([
        this.fetchFromTMDB<any>('/trending/all/week', { page: '1' }),
        this.fetchFromTMDB<any>('/movie/popular', { page: '1' }),
        this.fetchFromTMDB<any>('/movie/top_rated', { page: '1' }),
        this.fetchFromTMDB<any>('/tv/popular', { page: '1' }),
      ])

      const merged = dedupeMovies([
        ...this.mapResults(trending.results || []),
        ...this.mapResults(popular.results || [], 'movie'),
        ...this.mapResults(topRated.results || [], 'movie'),
        ...this.mapResults(tv.results || [], 'tv'),
      ])

      if (merged.length === 0) return this.getDemoCatalogue()
      return merged.map(ensureMovieArtwork)
    } catch {
      return this.getDemoCatalogue()
    }
  }

  async getTrending(page = 1): Promise<Movie[]> {
    if (this.isDemoModeActive()) return this.getDemoCatalogue().slice(0, 10)
    try {
      const data = await this.fetchFromTMDB<any>('/trending/all/week', { page: String(page) })
      return this.mapResults(data.results || []).map(ensureMovieArtwork)
    } catch {
      return this.getDemoCatalogue().slice(0, 10)
    }
  }

  async getPopularMovies(page = 1): Promise<Movie[]> {
    if (this.isDemoModeActive()) {
      return this.getDemoCatalogue().filter((m) => m.mediaType === 'movie')
    }
    try {
      const data = await this.fetchFromTMDB<any>('/movie/popular', { page: String(page) })
      return this.mapResults(data.results || [], 'movie').map(ensureMovieArtwork)
    } catch {
      return this.getDemoCatalogue().filter((m) => m.mediaType === 'movie')
    }
  }

  async getTopRated(page = 1): Promise<Movie[]> {
    if (this.isDemoModeActive()) {
      return [...this.getDemoCatalogue()].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12)
    }
    try {
      const data = await this.fetchFromTMDB<any>('/movie/top_rated', { page: String(page) })
      return this.mapResults(data.results || [], 'movie').map(ensureMovieArtwork)
    } catch {
      return [...this.getDemoCatalogue()].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12)
    }
  }

  async getPopularTV(page = 1): Promise<Movie[]> {
    if (this.isDemoModeActive()) {
      return this.getDemoCatalogue().filter((m) => m.mediaType === 'tv')
    }
    try {
      const data = await this.fetchFromTMDB<any>('/tv/popular', { page: String(page) })
      return this.mapResults(data.results || [], 'tv').map(ensureMovieArtwork)
    } catch {
      return this.getDemoCatalogue().filter((m) => m.mediaType === 'tv')
    }
  }

  async searchMulti(query: string): Promise<Movie[]> {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []

    if (this.isDemoModeActive()) {
      return this.getDemoCatalogue().filter(
        (m) =>
          m.title.toLowerCase().includes(trimmed) ||
          m.overview.toLowerCase().includes(trimmed) ||
          m.cast.some((c) => c.toLowerCase().includes(trimmed)) ||
          m.genres.some((g) => g.toLowerCase().includes(trimmed))
      )
    }

    try {
      const data = await this.fetchFromTMDB<any>('/search/multi', { query: trimmed })
      return this.mapResults(
        (data.results || []).filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      ).map(ensureMovieArtwork)
    } catch {
      return this.getDemoCatalogue().filter((m) => m.title.toLowerCase().includes(trimmed))
    }
  }

  async getMovieDetails(id: string): Promise<Movie | null> {
    const catalogue = this.getDemoCatalogue()
    const local = catalogue.find((m) => m.id === id || String(m.tmdbId) === id)
    if (local && this.isDemoModeActive()) return local

    const tmdbNumericId = id.replace('tmdb-', '').replace('demo-', '')
    try {
      const details = await this.fetchFromTMDB<any>(`/movie/${tmdbNumericId}`)
      const credits = await this.fetchFromTMDB<any>(`/movie/${tmdbNumericId}/credits`).catch(() => ({
        cast: [],
        crew: [],
      }))
      const castNames = (credits.cast || []).slice(0, 6).map((c: any) => c.name)
      const directorObj = (credits.crew || []).find((c: any) => c.job === 'Director')
      const movie = this.mapRawTMDBItem(details, 'movie')
      if (!movie) return local || null
      movie.cast = castNames
      movie.director = directorObj ? directorObj.name : undefined
      return ensureMovieArtwork(movie)
    } catch {
      return local || catalogue[0]
    }
  }

  async getSimilar(id: string): Promise<Movie[]> {
    if (this.isDemoModeActive()) {
      const current = this.getDemoCatalogue().find((m) => m.id === id) || this.getDemoCatalogue()[0]
      return this.getDemoCatalogue()
        .filter((m) => m.id !== current.id && m.genres.some((g) => current.genres.includes(g)))
        .slice(0, 8)
    }

    const numericId = id.replace('tmdb-', '').replace('demo-', '')
    try {
      const data = await this.fetchFromTMDB<any>(`/movie/${numericId}/similar`)
      return this.mapResults((data.results || []).slice(0, 8), 'movie').map(ensureMovieArtwork)
    } catch {
      return this.getDemoCatalogue().slice(0, 8)
    }
  }
}

export const tmdbService = new TMDBService()
