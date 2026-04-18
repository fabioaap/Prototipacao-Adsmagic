import { cva } from 'class-variance-authority'

export const inputVariants = cva(
  'flex w-full border ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-control',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-input',
        subtle: 'bg-muted text-foreground border-transparent focus-visible:border-input',
        invalid: 'border-destructive focus-visible:ring-destructive aria-[invalid=true]:border-destructive',
      },
      size: {
        sm: 'sym-input-size-sm',
        md: 'sym-input-size-md',
        lg: 'sym-input-size-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)
