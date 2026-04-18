import type { Preview } from '@storybook/vue3-vite'
import type { App } from 'vue'
import { setup } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'

// Import TailwindCSS styles
import '../src/assets/styles/main.css'

// Import i18n messages
import pt from '../src/locales/pt.json'
import en from '../src/locales/en.json'
import es from '../src/locales/es.json'

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'pt',
  fallbackLocale: 'pt',
  messages: { pt, en, es }
})

// Create router instance (minimal for Storybook)
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/:locale', name: 'locale-root', component: { template: '<div>Locale</div>' } },
    { path: '/:locale/projects/:projectId/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/:locale/projects/:projectId/contacts', name: 'contacts', component: { template: '<div>Contacts</div>' } },
    { path: '/:locale/projects/:projectId/sales', name: 'sales', component: { template: '<div>Sales</div>' } },
  ]
})

// Setup global plugins for all stories
setup((app: App) => {
  const pinia = createPinia()
  app.use(pinia)
  app.use(i18n)
  app.use(router)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
    // Viewport addon configuration
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
    // Background options
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1f2937' },
        { name: 'gray', value: '#f3f4f6' },
      ],
    },
  },
  // Global decorators
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="p-4"><story /></div>',
    }),
  ],
}

export default preview