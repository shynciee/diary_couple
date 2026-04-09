import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-rose/20 bg-cream/70 px-3 py-1 text-xs font-medium text-ink dark:border-white/10 dark:bg-white/5 dark:text-cream',
        className,
      )}
      {...props}
    />
  )
}

