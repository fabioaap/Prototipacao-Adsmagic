import { cva } from 'class-variance-authority'

export const cardVariants = cva(
  'rounded-surface text-card-foreground bg-card border border-border',
  {
    variants: {
      variant: {
        default: 'shadow-card',
        elevated: 'shadow-2xl',
        outlined: 'border-2 shadow-none',
      },
      padded: {
        true: 'sym-card-padded p-[var(--sym-space-7)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padded: false,
    },
  }
)
