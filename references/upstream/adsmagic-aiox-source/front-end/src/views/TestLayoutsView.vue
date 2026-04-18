<script setup lang="ts">
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import { LayoutDashboard, FileText, TestTube } from 'lucide-vue-next'

const router = useRouter()

// Available test routes
const routes = [
  {
    name: 'Dashboard Layout',
    icon: LayoutDashboard,
    description: 'Layout principal com sidebar, header, breadcrumb e footer',
    path: '/dashboard',
    layout: 'default',
    color: 'text-blue-500',
  },
  {
    name: 'Contacts Layout',
    icon: LayoutDashboard,
    description: 'Outra página usando DashboardLayout',
    path: '/contacts',
    layout: 'default',
    color: 'text-green-500',
  },
  {
    name: 'Projects Layout',
    icon: LayoutDashboard,
    description: 'Página de projetos com DashboardLayout',
    path: '/projects',
    layout: 'default',
    color: 'text-purple-500',
  },
  {
    name: 'Login (Blank Layout)',
    icon: FileText,
    description: 'Página de login com BlankLayout',
    path: '/login',
    layout: 'blank',
    color: 'text-orange-500',
  },
  {
    name: 'Onboarding (Blank Layout)',
    icon: FileText,
    description: 'Onboarding com layout customizado',
    path: '/onboarding',
    layout: 'blank',
    color: 'text-pink-500',
  },
  {
    name: 'Test Components',
    icon: TestTube,
    description: 'Página de teste de componentes base',
    path: '/test-components',
    layout: 'default',
    color: 'text-cyan-500',
  },
  {
    name: 'Test Common Components',
    icon: TestTube,
    description: 'Página de teste de componentes comuns',
    path: '/test-common-components',
    layout: 'blank',
    color: 'text-indigo-500',
  },
]

const navigateTo = (path: string) => {
  const locale = router.currentRoute.value.params.locale || 'en'
  router.push(`/${locale}${path}`)
}
</script>

<template>
  <div class="min-h-screen bg-background p-6">
    <div class="container mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight mb-2">Layout System Test</h1>
        <p class="text-muted-foreground">
          Teste os diferentes layouts disponíveis no sistema. Clique em um card para navegar.
        </p>
      </div>

      <!-- Layout Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- DashboardLayout Info -->
        <Card class="p-6">
          <div class="flex items-start gap-3 mb-4">
            <div class="p-2 rounded-lg bg-primary/10">
              <LayoutDashboard class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 class="font-semibold text-lg">DashboardLayout</h3>
              <p class="text-sm text-muted-foreground">Layout padrão do app</p>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <p class="text-muted-foreground"><strong>Componentes:</strong></p>
            <ul class="list-disc list-inside space-y-1 text-muted-foreground">
              <li>AppSidebar - Menu lateral colapsável</li>
              <li>AppHeader - Header com search, notifications, user menu</li>
              <li>AppBreadcrumb - Navegação hierárquica</li>
              <li>AppFooter - Footer opcional</li>
            </ul>
            <p class="text-muted-foreground mt-3">
              <strong>Mobile:</strong> Sidebar com overlay, botão hamburger
            </p>
            <p class="text-muted-foreground">
              <strong>Router meta:</strong> <code class="text-xs bg-muted px-1 py-0.5 rounded">layout: 'default'</code>
            </p>
          </div>
        </Card>

        <!-- BlankLayout Info -->
        <Card class="p-6">
          <div class="flex items-start gap-3 mb-4">
            <div class="p-2 rounded-lg bg-secondary/10">
              <FileText class="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 class="font-semibold text-lg">BlankLayout</h3>
              <p class="text-sm text-muted-foreground">Layout mínimo</p>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <p class="text-muted-foreground"><strong>Componentes:</strong></p>
            <ul class="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Container básico sem decoração</li>
              <li>Props opcionais: padding, centered</li>
            </ul>
            <p class="text-muted-foreground mt-3">
              <strong>Uso:</strong> Auth, onboarding, wizard, completion
            </p>
            <p class="text-muted-foreground">
              <strong>Router meta:</strong> <code class="text-xs bg-muted px-1 py-0.5 rounded">layout: 'blank'</code>
            </p>
          </div>
        </Card>
      </div>

      <!-- Available Routes -->
      <div>
        <h2 class="text-2xl font-semibold mb-4">Available Routes</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="route in routes"
            :key="route.path"
            class="p-4 cursor-pointer hover:border-primary transition-colors"
            @click="navigateTo(route.path)"
          >
            <div class="flex items-start gap-3">
              <component
                :is="route.icon"
                :class="[route.color, 'h-5 w-5 mt-0.5 flex-shrink-0']"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-medium mb-1">{{ route.name }}</h3>
                <p class="text-xs text-muted-foreground mb-2">
                  {{ route.description }}
                </p>
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-0.5 rounded bg-muted">
                    {{ route.layout }}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    {{ route.path }}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- How it Works -->
      <Card class="mt-8 p-6">
        <h2 class="text-xl font-semibold mb-4">Como Funciona</h2>
        <div class="space-y-3 text-sm text-muted-foreground">
          <p>
            O sistema de layouts é gerenciado pelo <code class="text-xs bg-muted px-1 py-0.5 rounded">App.vue</code>
            usando a meta <code class="text-xs bg-muted px-1 py-0.5 rounded">layout</code> de cada rota:
          </p>
          <pre class="bg-muted p-3 rounded-md overflow-x-auto"><code>// router/index.ts
{
  path: 'dashboard',
  name: 'dashboard',
  component: () => import('@/views/dashboard/DashboardView.vue'),
  meta: {
    requiresAuth: true,
    layout: 'default', // ← Define qual layout usar
  },
}</code></pre>
          <p class="mt-4">
            O <code class="text-xs bg-muted px-1 py-0.5 rounded">App.vue</code> lê essa meta e renderiza o layout apropriado:
          </p>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li><code class="text-xs bg-muted px-1 py-0.5 rounded">layout: 'default'</code> → DashboardLayout</li>
            <li><code class="text-xs bg-muted px-1 py-0.5 rounded">layout: 'blank'</code> → BlankLayout</li>
            <li><code class="text-xs bg-muted px-1 py-0.5 rounded">layout: undefined</code> → Sem layout (view renderiza diretamente)</li>
          </ul>
        </div>
      </Card>

      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card class="p-4">
          <h3 class="font-medium mb-2">📱 Responsivo</h3>
          <p class="text-sm text-muted-foreground">
            Mobile-first design com sidebar colapsável e overlay
          </p>
        </Card>
        <Card class="p-4">
          <h3 class="font-medium mb-2">🎨 Customizável</h3>
          <p class="text-sm text-muted-foreground">
            Props para controlar visibilidade de elementos (breadcrumb, footer, etc)
          </p>
        </Card>
        <Card class="p-4">
          <h3 class="font-medium mb-2">♿ Acessível</h3>
          <p class="text-sm text-muted-foreground">
            ARIA labels, keyboard navigation, focus management
          </p>
        </Card>
      </div>
    </div>
  </div>
</template>
