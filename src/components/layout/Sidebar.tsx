import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Compass,
  Film,
  Tv,
  Bookmark,
  ListVideo,
  Clock,
  Cpu,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { watchlist, watchNextItems, historyItems } = useApp()

  const navItems = [
    { to: '/', label: 'Discover', icon: Compass, exact: true },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/tv', label: 'TV Series', icon: Tv },
  ]

  const libraryItems = [
    {
      to: '/watchlist',
      label: 'My Watchlist',
      icon: Bookmark,
      badge: watchlist.length,
      badgeVariant: 'rose' as const,
      dsaTag: 'Stack Undo',
    },
    {
      to: '/watch-next',
      label: 'Watch Next',
      icon: ListVideo,
      badge: watchNextItems.length,
      badgeVariant: 'cyan' as const,
      dsaTag: 'FIFO Queue',
    },
    {
      to: '/history',
      label: 'Viewing History',
      icon: Clock,
      badge: historyItems.length,
      badgeVariant: 'amber' as const,
      dsaTag: 'Linked List',
    },
  ]

  const dsaItems = [
    {
      to: '/dsa-lab',
      label: 'DSA Laboratory',
      icon: Cpu,
      highlight: true,
      sublabel: '7 Visualizers & Algorithms',
    },
    {
      to: '/about',
      label: 'About Project',
      icon: BookOpen,
      sublabel: 'College Viva & Specs',
    },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }, highlight?: boolean) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
      isCollapsed && 'justify-center',
      highlight
        ? isActive
          ? 'bg-primary text-primary-foreground shadow-glow-sm font-semibold'
          : 'border border-primary/30 bg-gradient-to-r from-violet-900/40 to-cyan-900/20 text-primary hover:bg-violet-900/50'
        : isActive
          ? 'border border-primary/30 bg-primary/15 font-semibold text-primary'
          : 'text-muted-foreground hover:bg-white/[0.05] hover:text-white'
    )

  return (
    <aside
      className={cn(
        'z-30 hidden flex-shrink-0 flex-col border-r border-border bg-card/40 transition-all duration-300 lg:flex',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        <div>
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Browse Media
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={(state) => linkClass(state)}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <Separator />

        <div>
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              My Library & State
            </p>
          )}
          <nav className="space-y-1">
            {libraryItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={(state) => cn(linkClass(state), !isCollapsed && 'justify-between')}
                title={isCollapsed ? `${item.label} (${item.dsaTag})` : undefined}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="truncate">
                      <span>{item.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{item.dsaTag}</span>
                    </div>
                  )}
                </div>
                {!isCollapsed && <Badge variant={item.badgeVariant}>{item.badge}</Badge>}
              </NavLink>
            ))}
          </nav>
        </div>

        <Separator />

        <div>
          {!isCollapsed && (
            <p className="mb-2 flex items-center gap-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Academic Project
            </p>
          )}
          <nav className="space-y-1">
            {dsaItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={(state) => cn(linkClass(state, item.highlight), !isCollapsed && 'justify-between')}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <item.icon className="h-5 w-5 flex-shrink-0 text-primary" />
                  {!isCollapsed && (
                    <div className="truncate">
                      <span className="block">{item.label}</span>
                      {item.sublabel && (
                        <span className="block text-[10px] text-muted-foreground">{item.sublabel}</span>
                      )}
                    </div>
                  )}
                </div>
                {!isCollapsed && item.highlight && <ChevronRight className="h-4 w-4 text-primary" />}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {!isCollapsed && (
        <Card className="m-3 border-white/[0.06] bg-secondary/40">
          <CardContent className="space-y-1 p-3 text-xs text-muted-foreground">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Memory State
              </span>
              <span className="text-[10px] text-primary">Synchronized</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Stack, Queue, Heap, Graph & Hash Table active in client memory.
            </p>
          </CardContent>
        </Card>
      )}
    </aside>
  )
}
