import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-rose-light/50 dark:bg-white/5', className)}
      {...props}
    />
  )
}

