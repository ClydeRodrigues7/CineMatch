import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground border-white/20',
        gold: 'border-yellow-400/20 bg-black/70 text-yellow-400',
        purple: 'border-purple-500/30 bg-purple-500/20 text-purple-300',
        rose: 'border-rose-500/30 bg-rose-500/20 text-rose-300',
        cyan: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-300',
        amber: 'border-amber-500/30 bg-amber-500/20 text-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
