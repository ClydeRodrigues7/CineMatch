import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Sparkles,
  Wifi,
  WifiOff,
  GraduationCap,
  Menu,
  X,
  Layers,
  Heart,
  ListOrdered,
  History,
  Film,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onToggleSidebar: () => void
  onOpenPresentation?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenPresentation }) => {
  const { isOfflineMode, toggleOfflineMode, watchlist, watchNextItems, allMovies, setSelectedMovie } =
    useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<typeof allMovies>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    if (val.trim().length > 1) {
      const q = val.toLowerCase()
      const filtered = allMovies.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.cast.some((c) => c.toLowerCase().includes(q))
      )
      setSearchResults(filtered.slice(0, 6))
      setIsSearchOpen(true)
    } else {
      setSearchResults([])
      setIsSearchOpen(false)
    }
  }

  const handleSelectSearchResult = (movie: (typeof allMovies)[0]) => {
    setSelectedMovie(movie)
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden lg:flex"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Logo />
        </div>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies, actors, genres..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 1 && setIsSearchOpen(true)}
              className="rounded-full border-white/10 bg-card pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setIsSearchOpen(false)
                }}
                className="absolute right-3 text-muted-foreground hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {isSearchOpen && searchResults.length > 0 && (
            <div className="glass-dropdown absolute left-0 right-0 top-full z-50 mt-2 animate-fade-in overflow-hidden rounded-2xl shadow-2xl">
              <div className="divide-y divide-white/[0.06] p-2">
                {searchResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectSearchResult(m)}
                    className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/[0.06]"
                  >
                    <img
                      src={m.posterPath}
                      alt={m.title}
                      className="h-14 w-10 flex-shrink-0 rounded-lg object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.opacity = '0.3'
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{m.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{m.releaseDate.split('-')[0]}</span>
                        <span>•</span>
                        <span className="text-yellow-400">★ {m.voteAverage.toFixed(1)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleOfflineMode}
            className={cn(
              'rounded-full text-xs',
              isOfflineMode
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
            )}
            title="Toggle between Live TMDB API and Bundled Sample Catalogue"
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden md:inline">Demo Mode</span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">TMDB Online</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={onOpenPresentation}
            className="rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-xs shadow-glow-sm"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Presentation Viva</span>
          </Button>

          <Button variant="outline" size="icon" asChild className="border-primary/20 bg-primary/10 text-primary">
            <Link to="/dsa-lab" title="Open Data Structures Lab">
              <Sparkles className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="animate-fade-in space-y-1 border-t border-border bg-card px-4 py-4 lg:hidden">
          {[
            { to: '/', label: 'Discover', icon: Film },
            { to: '/movies', label: 'Movies' },
            { to: '/tv', label: 'TV Series' },
            { to: '/watchlist', label: 'Watchlist', icon: Heart, badge: watchlist.length },
            { to: '/watch-next', label: 'Watch Next', icon: ListOrdered, badge: watchNextItems.length },
            { to: '/history', label: 'Viewing History', icon: History },
            { to: '/dsa-lab', label: 'Data Structures Lab', icon: Layers, highlight: true },
            { to: '/about', label: 'About College Project' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-muted-foreground hover:bg-white/[0.05] hover:text-white',
                item.highlight && 'bg-primary/10 font-medium text-primary'
              )}
            >
              <span className="flex items-center gap-3">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </span>
              {item.badge !== undefined && <Badge variant="secondary">{item.badge}</Badge>}
            </Link>
          ))}
          <Separator className="my-2" />
        </div>
      )}
    </header>
  )
}
