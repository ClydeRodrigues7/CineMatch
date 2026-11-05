import { Heart, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 w-full border-t border-border bg-background/80 pb-8 pt-12 text-xs text-muted-foreground">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <Logo size="sm" />
            <p className="text-[13px] leading-relaxed">
              A smart movie and TV-series discovery platform engineered as an interactive Data
              Structures and Algorithms (DSA) educational project.
            </p>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              7 Data Structures
            </h4>
            <ul className="space-y-1.5">
              <li>1. Singly Linked List (History)</li>
              <li>2. General Tree (Genre Hierarchy)</li>
              <li>3. LIFO Stack (Watchlist Undo)</li>
              <li>4. FIFO Queue (Watch Next)</li>
              <li>5. Binary Max-Heap (Top-Rated)</li>
              <li>6. Hash Table (Instant Lookup)</li>
              <li>7. Adjacency Graph (Relations)</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Navigation</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="transition-colors hover:text-primary">
                  Discover Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="transition-colors hover:text-primary">
                  Explore Movies
                </Link>
              </li>
              <li>
                <Link to="/tv" className="transition-colors hover:text-primary">
                  TV Series
                </Link>
              </li>
              <li>
                <Link to="/dsa-lab" className="font-medium text-primary transition-colors hover:text-cyan-300">
                  Data Structures Lab
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-primary">
                  Academic Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="mb-2 text-sm font-semibold text-foreground">Data & API Attribution</h4>
            <Card className="border-white/[0.06] bg-card">
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                    TMDB API
                  </Badge>
                  <span className="text-[11px] text-foreground">The Movie Database</span>
                </div>
                <p className="text-[11px] italic leading-relaxed">
                  "This product uses the TMDB API but is not endorsed or certified by TMDB."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} CineMatch — College Mini-Project in Data Structures & Algorithms.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              Built with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> & TypeScript
            </span>
            <span>•</span>
            <span className="text-primary">shadcn/ui · Vitest</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
