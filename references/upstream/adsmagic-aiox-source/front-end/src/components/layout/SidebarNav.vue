<script setup lang="ts">
/**
 * SidebarNav - Navegação lateral com accordion para grupos colapsáveis
 * 
 * Implementa G4.1: Sidebar com accordion
 * - Grupos de navegação podem ser expandidos/recolhidos
 * - Persiste estado de expansão durante a sessão
 * - Suporte a teclado (Enter/Space para toggle, setas para navegar)
 */
import { ref, computed, watch, type Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronDown } from '@/composables/useIcons'
import { 
  AccordionRoot, 
  AccordionItem, 
  AccordionHeader, 
  AccordionTrigger, 
  AccordionContent 
} from 'radix-vue'

// ============================================================================
// TIPOS
// ============================================================================

export interface NavLink {
  label: string
  icon: Component
  /** Rota interna (RouterLink) ou URL externa quando `external` for true. */
  href?: string
  badge?: string | number
  /** Se definido, o item vira um botão e dispara esta ação no clique. */
  onClick?: () => void
  /** Quando true, `href` é aberto em uma nova aba. */
  external?: boolean
}

export interface NavSection {
  id: string
  title: string
  links: NavLink[]
  defaultOpen?: boolean
}

interface Props {
  sections: NavSection[]
  collapsed?: boolean
}

// ============================================================================
// PROPS & STATE
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const route = useRoute()

// Seções abertas (accordion multi-seleção)
const openSections = ref<string[]>([])

// Inicializar seções abertas com base no defaultOpen ou rota ativa
const initializeOpenSections = () => {
  const activeSection = props.sections.find(section => 
    section.links.some(link => isActive(link.href))
  )
  
  const defaultOpen = props.sections
    .filter(s => s.defaultOpen)
    .map(s => s.id)
  
  // Prioriza a seção com link ativo, senão usa defaults
  if (activeSection && !defaultOpen.includes(activeSection.id)) {
    openSections.value = [...defaultOpen, activeSection.id]
  } else {
    openSections.value = defaultOpen.length > 0 
      ? defaultOpen 
      : props.sections.slice(0, 1).map(s => s.id) // Abre primeira seção por padrão
  }
}

// ============================================================================
// COMPUTED
// ============================================================================

const isActive = (href?: string) => {
  if (!href) return false
  return route.fullPath.startsWith(href)
}

const isRouterLink = (link: NavLink) => {
  return !link.onClick && !!link.href && !link.external
}

// Quando sidebar está colapsado, mostrar apenas ícones sem accordion
const showAccordion = computed(() => !props.collapsed)

// ============================================================================
// WATCHERS
// ============================================================================

// Reinicializar quando as seções mudarem (troca de projeto)
watch(() => props.sections, () => {
  initializeOpenSections()
}, { immediate: true })

// Quando navegar para uma nova rota, expandir a seção correspondente
watch(() => route.fullPath, () => {
  const activeSection = props.sections.find(section => 
    section.links.some(link => isActive(link.href))
  )
  
  if (activeSection && !openSections.value.includes(activeSection.id)) {
    openSections.value = [...openSections.value, activeSection.id]
  }
})
</script>

<template>
  <nav class="flex flex-col gap-1 py-2" :class="{ 'p-1': collapsed }">
    <!-- Modo Accordion (sidebar expandido) -->
    <AccordionRoot
      v-if="showAccordion"
      v-model="openSections"
      type="multiple"
      class="flex flex-col gap-1"
    >
      <AccordionItem
        v-for="section in sections"
        :key="section.id"
        :value="section.id"
        class="border-none"
      >
        <AccordionHeader class="flex">
          <AccordionTrigger class="flex items-center justify-between w-full p-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase bg-transparent transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-control group">
            <span class="flex-1 text-left">{{ section.title }}</span>
            <ChevronDown 
              :size="14" 
              class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </AccordionTrigger>
        </AccordionHeader>
        
        <AccordionContent class="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
          <template v-for="link in section.links" :key="link.label + (link.href ?? '')">
            <!-- Link interno via RouterLink -->
            <RouterLink
              v-if="isRouterLink(link)"
              :to="link.href!"
              class="flex items-center gap-3 px-3 py-2 pl-4 mx-2 text-sm font-medium text-foreground/70 decoration-0 rounded-lg transition-all duration-150 hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              :class="{ 'text-accent-foreground bg-accent font-semibold': isActive(link.href) }"
            >
              <component :is="link.icon" :size="20" aria-hidden="true" />
              <span class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{{ link.label }}</span>
              <span v-if="link.badge" class="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-semibold text-white bg-primary rounded-full">
                {{ link.badge }}
              </span>
            </RouterLink>

            <!-- Link externo (nova aba) -->
            <a
              v-else-if="link.external && link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 px-3 py-2 pl-4 mx-2 text-sm font-medium text-foreground/70 decoration-0 rounded-lg transition-all duration-150 hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <component :is="link.icon" :size="20" aria-hidden="true" />
              <span class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{{ link.label }}</span>
              <span v-if="link.badge" class="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-semibold text-white bg-primary rounded-full">
                {{ link.badge }}
              </span>
            </a>

            <!-- Ação via botão (onClick) -->
            <button
              v-else
              type="button"
              class="flex items-center gap-3 px-3 py-2 pl-4 mx-2 w-[calc(100%-1rem)] text-left text-sm font-medium text-foreground/70 bg-transparent border-0 rounded-lg transition-all duration-150 hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              @click="link.onClick?.()"
            >
              <component :is="link.icon" :size="20" aria-hidden="true" />
              <span class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{{ link.label }}</span>
              <span v-if="link.badge" class="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-semibold text-white bg-primary rounded-full">
                {{ link.badge }}
              </span>
            </button>
          </template>
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>

    <!-- Modo Colapsado (apenas ícones) -->
    <div v-else class="flex flex-col items-center gap-1">
      <template v-for="section in sections" :key="section.id">
        <template v-for="link in section.links" :key="link.label + (link.href ?? '')">
          <RouterLink
            v-if="isRouterLink(link)"
            :to="link.href!"
            class="relative flex items-center justify-center w-10 h-10 text-muted-foreground decoration-0 rounded-control transition-all duration-150 hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :class="{ 'text-accent-foreground bg-accent': isActive(link.href) }"
            :title="link.label"
          >
            <component :is="link.icon" :size="20" aria-hidden="true" />
            <span v-if="link.badge" class="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-primary rounded-full">
              {{ link.badge }}
            </span>
          </RouterLink>

          <a
            v-else-if="link.external && link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="relative flex items-center justify-center w-10 h-10 text-muted-foreground decoration-0 rounded-control transition-all duration-150 hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :title="link.label"
          >
            <component :is="link.icon" :size="20" aria-hidden="true" />
            <span v-if="link.badge" class="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-primary rounded-full">
              {{ link.badge }}
            </span>
          </a>

          <button
            v-else
            type="button"
            class="relative flex items-center justify-center w-10 h-10 bg-transparent border-0 text-muted-foreground rounded-control transition-all duration-150 hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            :title="link.label"
            :aria-label="link.label"
            @click="link.onClick?.()"
          >
            <component :is="link.icon" :size="20" aria-hidden="true" />
            <span v-if="link.badge" class="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-primary rounded-full">
              {{ link.badge }}
            </span>
          </button>
        </template>
      </template>
    </div>
  </nav>
</template>

<style scoped>
/* Animações do Accordion */
@keyframes slideDown {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}
</style>
