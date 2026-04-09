import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rose/40 dark:border-white/10 dark:bg-white/5',
        className,
      )}
      {...props}
    />
  )
}

