import { fileURLToPath } from 'node:url'
import { primary } from '../../design-system/tokens/colors'

const __dir = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    `${__dir}/index.html`,
    `${__dir}/**/*.html`,
    `${__dir}/src/**/*.{vue,js,ts}`,
  ],
  theme: {
    extend: {
      colors: {
        primary,
      },
    },
  },
  plugins: [],
}