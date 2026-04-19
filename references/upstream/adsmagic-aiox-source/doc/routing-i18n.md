# Fluxo de Rotas e i18n

Este documento detalha o sistema de roteamento e internacionalização do frontend, incluindo exemplos práticos e melhores práticas.

## 🌐 Locale na URL

### Estrutura de Rotas
- **Todas as rotas** iniciam com `/:locale`
- **Locales suportados**: `pt`, `en`, `es`
- **Fallback**: Locales inválidos redirecionam para `pt`

### Exemplos de URLs
```
/pt/dashboard          # Dashboard em português
/en/projects           # Projetos em inglês
/es/onboarding         # Onboarding em espanhol
/invalid-route         # Redireciona para /pt/dashboard
```

## 🛡️ Guards de Roteamento

### Guard de Locale
```typescript
// router/guards/locale.ts
export function setupLocaleGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const locale = to.params.locale as string
    
    // Validar locale
    if (!isValidLocale(locale)) {
      return next(`/pt${to.path}`)
    }
    
    // Definir locale ativo
    i18n.global.locale.value = locale
    next()
  })
}

function isValidLocale(locale: string): boolean {
  return ['pt', 'en', 'es'].includes(locale)
}
```

### Guard de Autenticação
```typescript
// router/guards/auth.ts
export function setupAuthGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const requiresAuth = to.meta.requiresAuth
    const isAuthenticated = useAuthStore().isAuthenticated
    
    if (requiresAuth && !isAuthenticated) {
      const locale = to.params.locale
      return next(`/${locale}/auth/login?redirect=${to.fullPath}`)
    }
    
    next()
  })
}
```

## 🔧 Composable `useLocalizedRoute`

### Implementação
```typescript
// composables/useLocalizedRoute.ts
export function useLocalizedRoute() {
  const route = useRoute()
  const router = useRouter()
  const { locale } = useI18n()
  
  const localizedRoute = (options: RouteLocationRaw) => {
    const localeParam = route.params.locale || locale.value
    
    if (typeof options === 'string') {
      return `/${localeParam}${options}`
    }
    
    if (typeof options === 'object') {
      return {
        ...options,
        params: {
          ...options.params,
          locale: localeParam
        }
      }
    }
    
    return options
  }
  
  const navigateToLocalized = (options: RouteLocationRaw) => {
    return router.push(localizedRoute(options))
  }
  
  const changeLocale = (newLocale: string) => {
    const currentPath = route.path.replace(`/${route.params.locale}`, '')
    return router.push(`/${newLocale}${currentPath}`)
  }
  
  return {
    locale: readonly(locale),
    localizedRoute,
    navigateToLocalized,
    changeLocale
  }
}
```

### Uso em Componentes
```vue
<script setup lang="ts">
import { useLocalizedRoute } from '@/composables/useLocalizedRoute'

const { locale, localizedRoute, navigateToLocalized, changeLocale } = useLocalizedRoute()

// Navegação programática
const goToProjects = () => {
  navigateToLocalized({ name: 'projects' })
}

// Mudança de idioma
const switchToEnglish = () => {
  changeLocale('en')
}

// Geração de links
const projectLink = localizedRoute({ 
  name: 'project-detail', 
  params: { id: '123' } 
})
</script>

<template>
  <div>
    <!-- Link estático -->
    <router-link :to="localizedRoute({ name: 'dashboard' })">
      {{ $t('nav.dashboard') }}
    </router-link>
    
    <!-- Botão de mudança de idioma -->
    <button @click="switchToEnglish">
      {{ $t('common.switchToEnglish') }}
    </button>
    
    <!-- Link dinâmico -->
    <a :href="projectLink">Ver Projeto</a>
  </div>
</template>
```

## 🗺️ Configuração de Rotas

### Estrutura de Rotas
```typescript
// router/index.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/:locale',
    component: AppLayout,
    beforeEnter: localeGuard,
    children: [
      // Rotas públicas
      {
        path: 'auth/login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { requiresAuth: false }
      },
      
      // Rotas protegidas
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { requiresAuth: true }
      },
      
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/projects/ProjectsView.vue'),
        meta: { requiresAuth: true }
      },
      
      {
        path: 'projects/:id',
        name: 'project-detail',
        component: () => import('@/views/projects/ProjectDetailView.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  
  // Redirecionamento para locale padrão
  {
    path: '/',
    redirect: '/pt'
  },
  
  // 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/pt/dashboard'
  }
]
```

## 🎯 Navegação e Links

### Navegação Programática
```typescript
// ✅ BOM - Usando composable
const { navigateToLocalized } = useLocalizedRoute()

// Navegar para projeto específico
navigateToLocalized({ 
  name: 'project-detail', 
  params: { id: projectId } 
})

// Navegar com query parameters
navigateToLocalized({ 
  name: 'projects',
  query: { search: 'keyword', page: 1 }
})

// ❌ EVITAR - Navegação direta sem locale
router.push({ name: 'projects' }) // Pode quebrar o locale
```

### Links em Templates
```vue
<template>
  <!-- ✅ BOM - Link com locale preservado -->
  <router-link :to="localizedRoute({ name: 'dashboard' })">
    {{ $t('nav.dashboard') }}
  </router-link>
  
  <!-- ✅ BOM - Link com parâmetros -->
  <router-link 
    :to="localizedRoute({ 
      name: 'project-detail', 
      params: { id: project.id } 
    })"
  >
    {{ project.name }}
  </router-link>
  
  <!-- ✅ BOM - Link externo com locale -->
  <a :href="`/${locale}/external-page`">
    {{ $t('nav.external') }}
  </a>
</template>
```

## 🔄 Mudança de Idioma

### Componente de Seletor de Idioma
```vue
<!-- components/ui/LanguageSelector.vue -->
<template>
  <select 
    :value="locale" 
    @change="handleLanguageChange"
    class="language-selector"
  >
    <option value="pt">🇧🇷 Português</option>
    <option value="en">🇺🇸 English</option>
    <option value="es">🇪🇸 Español</option>
  </select>
</template>

<script setup lang="ts">
import { useLocalizedRoute } from '@/composables/useLocalizedRoute'
import { useLanguageStore } from '@/stores/language'

const { locale, changeLocale } = useLocalizedRoute()
const languageStore = useLanguageStore()

const handleLanguageChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newLocale = target.value
  
  // Persistir preferência
  languageStore.setLanguage(newLocale)
  
  // Mudar rota
  await changeLocale(newLocale)
}
</script>
```

## 📱 Rotas Responsivas

### Detecção de Dispositivo
```typescript
// composables/useDevice.ts
export function useDevice() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)
  
  const updateDevice = () => {
    const width = window.innerWidth
    isMobile.value = width < 768
    isTablet.value = width >= 768 && width < 1024
    isDesktop.value = width >= 1024
  }
  
  onMounted(() => {
    updateDevice()
    window.addEventListener('resize', updateDevice)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateDevice)
  })
  
  return {
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop)
  }
}
```

### Rotas Condicionais
```vue
<template>
  <div>
    <!-- Desktop: Sidebar -->
    <AppSidebar v-if="isDesktop" />
    
    <!-- Mobile: Bottom Navigation -->
    <BottomNavigation v-else-if="isMobile" />
    
    <!-- Tablet: Top Navigation -->
    <TopNavigation v-else />
  </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/composables/useDevice'

const { isMobile, isTablet, isDesktop } = useDevice()
</script>
```

## 🧪 Testes de Rotas

### Testes de Navegação
```typescript
// tests/routing.test.ts
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import App from '@/App.vue'

describe('Routing and i18n', () => {
  let router: Router
  let i18n: I18n
  
  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: testRoutes
    })
    
    i18n = createI18n({
      locale: 'pt',
      messages: testMessages
    })
  })
  
  it('should redirect invalid locale to pt', async () => {
    await router.push('/invalid/dashboard')
    expect(router.currentRoute.value.path).toBe('/pt/dashboard')
  })
  
  it('should preserve route when changing language', async () => {
    await router.push('/pt/projects/123')
    await router.push('/en/projects/123')
    expect(router.currentRoute.value.params.locale).toBe('en')
    expect(router.currentRoute.value.params.id).toBe('123')
  })
})
```

## 📋 Checklist de Implementação

- [ ] Todas as rotas incluem prefixo `/:locale`
- [ ] Guards de locale e autenticação configurados
- [ ] Composable `useLocalizedRoute` implementado
- [ ] Componentes usam links localizados
- [ ] Mudança de idioma preserva rota atual
- [ ] Fallbacks para locales inválidos
- [ ] Testes de navegação implementados
- [ ] Responsividade considerada
- [ ] Performance otimizada (lazy loading)
- [ ] Acessibilidade implementada
