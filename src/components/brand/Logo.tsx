import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
}

export function Logo({ className, showWordmark = true, size = 'md' }: LogoProps) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
      <img
        src="/logo.svg"
        alt="CineMatch"
        className={cn(
          sizeMap[size],
          'rounded-xl shadow-glow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-3deg]'
        )}
      />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Cine<span className="text-cyan-300">Match</span>
          </span>
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Discover · Structure
          </span>
        </div>
      )}
    </Link>
  )
}
