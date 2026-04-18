/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        brand: {
          50: 'hsl(var(--brand-50))',
          100: 'hsl(var(--brand-100))',
          500: 'hsl(var(--brand-500))',
          900: 'hsl(var(--brand-900))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        surface: 'var(--radius-surface)',
        control: 'var(--radius-control)',
        pill: 'var(--radius-pill)',
      },
      spacing: {
        'gutter-mobile': 'var(--gutter-mobile)',
        'gutter-tablet': 'var(--gutter-tablet)',
        'gutter-desktop': 'var(--gutter-desktop)',
      },
      height: {
        'control-sm': 'var(--control-height-sm)',
        'control-md': 'var(--control-height-md)',
        'control-lg': 'var(--control-height-lg)',
      },
      minHeight: {
        'control-sm': 'var(--control-height-sm)',
        'control-md': 'var(--control-height-md)',
        'control-lg': 'var(--control-height-lg)',
      },
      width: {
        'control-sm': 'var(--control-height-sm)',
        'control-md': 'var(--control-height-md)',
        'control-lg': 'var(--control-height-lg)',
      },
      maxWidth: {
        'content-sm': 'var(--container-sm)',
        'content-md': 'var(--container-md)',
        'content-lg': 'var(--container-lg)',
        'content-xl': 'var(--container-xl)',
        'content-2xl': 'var(--container-2xl)',
      },
    },
  },
  plugins: [],
}
