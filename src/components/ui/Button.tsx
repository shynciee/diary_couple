import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline' | 'ink'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-60',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-sm',
        size === 'lg' && 'px-7 py-3.5 text-base',
        variant === 'primary' &&
          'bg-rose text-cream shadow-soft hover:brightness-95',
        variant === 'ink' &&
          'bg-ink text-cream hover:brightness-95 dark:bg-white/10',
        variant === 'outline' &&
          'border border-rose/25 bg-white/60 text-ink hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-cream dark:hover:bg-white/10',
        variant === 'ghost' &&
          'bg-transparent text-rose hover:underline underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

