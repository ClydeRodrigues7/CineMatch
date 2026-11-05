import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Studio {
  name: string
  color: string
}

const STUDIOS: Studio[] = [
  { name: 'Disney+', color: 'from-blue-600 to-blue-800' },
  { name: 'Netflix', color: 'from-red-600 to-red-900' },
  { name: 'HBO Max', color: 'from-purple-700 to-indigo-900' },
  { name: 'Pixar', color: 'from-cyan-600 to-blue-700' },
  { name: 'Marvel', color: 'from-red-700 to-red-800' },
  { name: 'Star Wars', color: 'from-amber-600 to-yellow-700' },
  { name: 'A24', color: 'from-zinc-700 to-zinc-900' },
  { name: 'TMDB', color: 'from-emerald-600 to-teal-800' },
]

interface Props {
  onSelectStudio?: (studioName: string) => void
  selectedStudio?: string | null
}

export const StreamingStudiosBar: React.FC<Props> = ({ onSelectStudio, selectedStudio }) => {
  return (
    <div className="w-full py-4">
      <div className="scrollbar-none flex items-center gap-3 overflow-x-auto pb-2">
        {STUDIOS.map((studio) => {
          const isSelected = selectedStudio === studio.name
          return (
            <Button
              key={studio.name}
              variant="outline"
              onClick={() => onSelectStudio?.(isSelected ? '' : studio.name)}
              className={cn(
                'h-auto flex-shrink-0 rounded-2xl px-6 py-3 text-sm font-extrabold tracking-wider shadow-md transition-all duration-300',
                isSelected
                  ? `scale-105 border-white/40 bg-gradient-to-r ${studio.color} text-white shadow-glow-sm hover:text-white`
                  : 'border-white/[0.08] bg-card/80 text-muted-foreground hover:scale-[1.02] hover:border-white/20 hover:bg-secondary'
              )}
            >
              {studio.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
