// Bulletproof Image Fallback Utility for CineMatch
// Guarantees that 100% of movie cards always display rich cinematic visuals,
// even during network dropouts, TMDB 404s, or completely offline evaluation.

export function generatePosterSvg(title: string, genre = 'Cinema', rating = 7.5): string {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const safeGenre = genre.replace(/&/g, '&amp;')

  // Select gradient based on genre
  let color1 = '#3b0764' // purple
  let color2 = '#1e1145'
  let accent = '#a855f7'

  const gLower = genre.toLowerCase()
  if (gLower.includes('action') || gLower.includes('adventure')) {
    color1 = '#450a0a' // red
    color2 = '#1c0a0a'
    accent = '#f43f5e'
  } else if (gLower.includes('sci-fi') || gLower.includes('science')) {
    color1 = '#082f49' // cyan
    color2 = '#0c192c'
    accent = '#06b6d4'
  } else if (gLower.includes('comedy') || gLower.includes('animation') || gLower.includes('family')) {
    color1 = '#064e3b' // emerald
    color2 = '#06261c'
    accent = '#10b981'
  } else if (gLower.includes('drama') || gLower.includes('crime')) {
    color1 = '#27272a' // zinc
    color2 = '#18181b'
    accent = '#eab308'
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="60%" stop-color="${color2}"/>
        <stop offset="100%" stop-color="#08090e"/>
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="500" height="750" fill="url(#bg)"/>
    <circle cx="250" cy="220" r="180" fill="url(#glow)"/>
    <rect x="20" y="20" width="460" height="710" rx="16" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    
    <!-- Film / Cinema Icon Header -->
    <g transform="translate(200, 150)" stroke="${accent}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect width="100" height="80" rx="12" />
      <line x1="25" y1="0" x2="25" y2="80" />
      <line x1="75" y1="0" x2="75" y2="80" />
      <line x1="0" y1="40" x2="100" y2="40" />
    </g>

    <!-- Genre Badge -->
    <rect x="180" y="260" width="140" height="32" rx="16" fill="rgba(255,255,255,0.1)"/>
    <text x="250" y="281" text-anchor="middle" fill="${accent}" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" letter-spacing="1.5">${safeGenre.toUpperCase()}</text>

    <!-- Rating Badge -->
    <g transform="translate(205, 310)">
      <rect width="90" height="30" rx="15" fill="rgba(0,0,0,0.5)" stroke="${accent}" stroke-width="1.5"/>
      <text x="45" y="20" text-anchor="middle" fill="#facc15" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">★ ${rating.toFixed(1)}</text>
    </g>

    <!-- Movie Title (Wrapped) -->
    <text x="250" y="440" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="32" font-weight="900" letter-spacing="-0.5">
      ${safeTitle.length > 22 ? safeTitle.slice(0, 20) + '...' : safeTitle}
    </text>
    
    <!-- CineMatch Logo Watermark at bottom -->
    <text x="250" y="680" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" letter-spacing="3">CINEMATCH ARCHIVE</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function generateBackdropSvg(title: string, genre = 'Cinema'): string {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
    <defs>
      <linearGradient id="bdbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1035"/>
        <stop offset="50%" stop-color="#0f111a"/>
        <stop offset="100%" stop-color="#08090e"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bdbg)"/>
    <circle cx="640" cy="360" r="300" fill="#a855f7" fill-opacity="0.1"/>
    <text x="640" y="380" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="44" font-weight="900" letter-spacing="-1">${safeTitle}</text>
    <text x="640" y="430" text-anchor="middle" fill="#a855f7" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" letter-spacing="4">${genre.toUpperCase()}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
