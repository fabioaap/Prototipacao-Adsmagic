<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { ChevronDown, Check, Plus } from '@/composables/useIcons'
import { onClickOutside } from '@vueuse/core'

interface Props {
  projectName?: string
  compactOnMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  projectName: '',
  compactOnMobile: false,
})

const router = useRouter()
const route = useRoute()
const projectsStore = useProjectsStore()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref<{ top: string; left: string; width: string; right?: string; bottom?: string }>({
  top: '0px',
  left: '0px',
  width: '320px',
})
const VIEWPORT_MARGIN = 8
const DEFAULT_MENU_WIDTH = 320

const currentProject = computed(() => projectsStore.currentProject)
const availableProjects = computed(() => projectsStore.projects || [])
const hasOnlyOneProject = computed(() => availableProjects.value.length === 1)
const routeProject = computed(() => {
  const projectId = route.params.projectId as string | undefined
  if (!projectId) return null
  return availableProjects.value.find((project) => project.id === projectId) || null
})
const displayedProjectName = computed(() => {
  return (
    currentProject.value?.name ||
    routeProject.value?.name ||
    props.projectName ||
    'Selecione um projeto'
  )
})

function updateMenuPosition() {
  if (!triggerRef.value || !menuRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const availableWidth = Math.max(240, window.innerWidth - VIEWPORT_MARGIN * 2)
  const menuWidth = Math.min(DEFAULT_MENU_WIDTH, availableWidth)
  const menuHeight = menuRef.value.offsetHeight || 200
  const desiredLeft = triggerRect.left
  const clampedLeft = Math.min(
    Math.max(VIEWPORT_MARGIN, desiredLeft),
    Math.max(VIEWPORT_MARGIN, window.innerWidth - menuWidth - VIEWPORT_MARGIN)
  )
  const spaceBelow = window.innerHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const openUpwards = spaceBelow < menuHeight && spaceAbove > spaceBelow
  const desiredTop = openUpwards
    ? triggerRect.top - menuHeight - VIEWPORT_MARGIN
    : triggerRect.bottom + VIEWPORT_MARGIN
  const clampedTop = Math.min(
    Math.max(VIEWPORT_MARGIN, desiredTop),
    Math.max(VIEWPORT_MARGIN, window.innerHeight - menuHeight - VIEWPORT_MARGIN)
  )

  menuStyle.value = {
    top: `${clampedTop}px`,
    left: `${clampedLeft}px`,
    width: `${menuWidth}px`,
    right: 'auto',
    bottom: 'auto',
  }
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    nextTick(() => updateMenuPosition())
  }
}

const selectProject = async (projectId: string) => {
  if (projectId === currentProject.value?.id) {
    isOpen.value = false
    return
  }

  // Atualizar projeto atual na store
  const project = projectsStore.projects.find(p => p.id === projectId)
  if (project) {
    await projectsStore.setCurrentProject(project)
  }
  
  // Redirecionar para o dashboard do novo projeto
  const locale = route.params.locale || 'pt'
  await router.push(`/${locale}/projects/${projectId}/dashboard-v2`)
  
  isOpen.value = false
}

const createNewProject = () => {
  const locale = route.params.locale || 'pt'
  router.push(`/${locale}/project/new`)
  isOpen.value = false
}

// Fechar ao clicar fora
onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

onMounted(() => {
  window.addEventListener('scroll', updateMenuPosition, true)
  window.addEventListener('resize', updateMenuPosition)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateMenuPosition, true)
  window.removeEventListener('resize', updateMenuPosition)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button 
      ref="triggerRef"
      class="project-selector-button h-[var(--sym-control-height-md)] rounded-control border border-border flex items-center justify-center px-[var(--sym-space-5)] gap-2 text-sm text-foreground font-medium transition-colors hover:bg-accent/50 cursor-pointer"
      :class="{ 'project-selector-button--compact-mobile': props.compactOnMobile }"
      data-testid="project-selector"
      @click="toggleDropdown"
    >
      <span 
        class="project-selector-prefix font-medium text-foreground"
        :class="{ 'project-selector-prefix--compact-mobile': props.compactOnMobile }"
        data-testid="project-selector-label"
      >
        Projeto:
      </span>
      <span 
        class="project-selector-title font-semibold text-foreground truncate max-w-[180px]"
        :class="{ 'project-selector-title--compact-mobile': props.compactOnMobile }"
        :title="displayedProjectName"
        data-testid="project-selector-title"
      >
        {{ displayedProjectName }}
      </span>
      <ChevronDown 
        class="h-4 w-4 text-foreground transition-transform flex-shrink-0" 
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    
    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="isOpen"
        ref="menuRef"
        class="fixed bg-popover border border-border rounded-lg shadow-lg z-[70] py-1 max-w-[calc(100vw-16px)]"
        :style="menuStyle"
      >
        <!-- Lista de projetos -->
        <div v-if="availableProjects.length > 0" class="max-h-[280px] overflow-y-auto">
          <button
            v-for="project in availableProjects"
            :key="project.id"
            class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors cursor-pointer border-b border-border/50 last:border-0"
            @click="selectProject(project.id)"
          >
            <div class="flex flex-col flex-1 min-w-0 text-left">
              <span class="font-semibold truncate text-foreground">{{ project.name }}</span>
              <span class="text-xs text-muted-foreground truncate">
                {{ project.company_type }}
              </span>
            </div>
            <Check 
              v-if="project.id === currentProject?.id"
              class="h-5 w-5 text-primary flex-shrink-0 ml-3"
            />
          </button>
        </div>
        
        <div v-else class="px-4 py-6 text-center text-sm text-muted-foreground">
          Nenhum projeto disponível
        </div>
        
        <!-- Separador -->
        <div class="border-t border-border my-1" />
        
        <!-- CTA Criar novo projeto -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          @click="createNewProject"
        >
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Plus class="h-4 w-4 text-primary" />
          </div>
          <div class="flex flex-col items-start flex-1">
            <span class="font-semibold">Criar novo projeto</span>
            <span v-if="hasOnlyOneProject" class="text-xs text-muted-foreground">
              Expanda seu negócio com mais um projeto
            </span>
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  .project-selector-button--compact-mobile {
    width: 100%;
    justify-content: flex-start;
    padding-inline: var(--sym-space-4);
  }

  .project-selector-prefix--compact-mobile {
    display: none;
  }

  .project-selector-title--compact-mobile {
    max-width: none;
    flex: 1 1 auto;
  }
}
</style>
