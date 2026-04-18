export type CreativeTheme = 'light' | 'dark' | 'split' | 'editorial'

export interface CreativeDimensionSpec {
  label: string
  aspect: string
  pixels: string
  use: string
  theme: CreativeTheme
}

export interface LpResponsiveSpec {
  label: string
  value: string
  description: string
  token: string
}

export const brandSocialPostDimensions = {
  feedHorizontal: {
    label: 'Feed horizontal',
    aspect: '1200 / 628',
    pixels: '1200 x 628 px',
    use: 'Ads e previews externos com headline curta.',
    theme: 'split',
  },
  square: {
    label: 'Quadrado',
    aspect: '1 / 1',
    pixels: '1080 x 1080 px',
    use: 'Feed tradicional e variações de quote, série e offer.',
    theme: 'dark',
  },
  vertical: {
    label: 'Vertical 4:5',
    aspect: '4 / 5',
    pixels: '1080 x 1350 px',
    use: 'Feed mobile-first com prova e argumento mais densos.',
    theme: 'editorial',
  },
  stories: {
    label: 'Stories / Reels 9:16',
    aspect: '9 / 16',
    pixels: '1080 x 1920 px',
    use: 'Narração curta, ritmo visual forte e CTA objetivo.',
    theme: 'light',
  },
} satisfies Record<string, CreativeDimensionSpec>

export const brandDisplayAdDimensions = {
  response: {
    label: 'Response ad',
    aspect: '1200 / 628',
    pixels: '1200 x 628 px',
    use: 'Headlines curtas, prova pontual e CTA.',
    theme: 'dark',
  },
  offerCard: {
    label: 'Offer card',
    aspect: '1 / 1',
    pixels: '1080 x 1080 px',
    use: 'Promo, feature, insight ou convite para demo.',
    theme: 'light',
  },
  proof: {
    label: 'Proof ad',
    aspect: '4 / 5',
    pixels: '1080 x 1350 px',
    use: 'Resultados, métricas e comparação visual.',
    theme: 'split',
  },
} satisfies Record<string, CreativeDimensionSpec>

export const brandLpResponsiveSpecs = {
  containerXl: {
    label: 'Desktop',
    value: 'Container XL · 1280 px',
    description: 'Use como largura base para sections principais quando a landing pedir leitura ampla sem virar full-bleed descontrolado.',
    token: 'container-xl = 80rem',
  },
  container2xl: {
    label: 'Desktop amplo',
    value: 'Container 2XL · 1400 px',
    description: 'Use quando hero, bento ou proof wall precisarem de mais respiro horizontal mantendo grid controlado.',
    token: 'container-2xl = 87.5rem',
  },
  gutters: {
    label: 'Gutters',
    value: '16 / 24 / 32 px',
    description: 'Mobile 16 px, tablet 24 px e desktop 32 px. Para LP section, isso importa mais que inventar um frame fixo em pixel.',
    token: 'gutter-mobile / tablet / desktop',
  },
} satisfies Record<string, LpResponsiveSpec>