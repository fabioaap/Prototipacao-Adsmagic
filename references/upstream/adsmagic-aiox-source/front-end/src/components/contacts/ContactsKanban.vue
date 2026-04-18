<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Inbox, Plus } from 'lucide-vue-next'
import ContactCard from './ContactCard.vue'
import Button from '@/components/ui/Button.vue'
import { useToast } from '@/components/ui/toast/use-toast'
import { cn } from '@/lib/utils'
import type { Contact } from '@/types/models'
import { useContactsStore } from '@/stores/contacts'
import { useStagesStore } from '@/stores/stages'

interface Props {
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
  /**
   * Se true, permite drag & drop
   */
  draggable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  draggable: true,
})

const emit = defineEmits<{
  contactClick: [contact: Contact]
  contactViewDetails: [contact: Contact]
  addContact: [stageId: string]
  addStage: []
}>()

const contactsStore = useContactsStore()
const stagesStore = useStagesStore()
const { toast } = useToast()

// Estado de drag
const isDragging = ref(false)

// Ref do container scrollável
const scrollContainer = ref<HTMLElement | null>(null)

// Refs dos containers das colunas do Kanban (removido - vamos usar DOM direto)
// const columnRefs = ref<{ [stageId: string]: HTMLElement | null }>({})

// Instâncias do Sortable (removido - vamos usar abordagem mais simples)
const sortableInstances = ref<Record<string, any>>({})

// Largura da coluna + gap (320px coluna + 16px gap)
const COLUMN_WIDTH = 336

// Padding infinito dinâmico (100vw - largura de 1 coluna)
const infinitePadding = computed(() => {
  if (typeof window === 'undefined') return '0px'
  return `${Math.max(0, window.innerWidth - COLUMN_WIDTH)}px`
})

// Navegação por teclado (← →)
const handleKeyDown = (event: KeyboardEvent) => {
  if (!scrollContainer.value) return
  
  // Apenas processar se não estiver em input/textarea
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
  
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    scrollContainer.value.scrollBy({ left: -COLUMN_WIDTH, behavior: 'smooth' })
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    scrollContainer.value.scrollBy({ left: COLUMN_WIDTH, behavior: 'smooth' })
  }
}

// Auto-scroll para direita (útil ao adicionar nova etapa)
const scrollToEnd = async () => {
  await nextTick()
  if (!scrollContainer.value) return
  
  const { scrollWidth } = scrollContainer.value
  scrollContainer.value.scrollTo({ 
    left: scrollWidth, 
    behavior: 'smooth' 
  })
}

// Handler para adicionar nova etapa
const handleAddStage = () => {
  emit('addStage')
  // Auto-scroll após adicionar (aguarda renderização)
  setTimeout(() => scrollToEnd(), 100)
}

// Contatos agrupados por etapa (reactive para permitir drag and drop)
const contactsByStage = ref<Record<string, Contact[]>>({})
const optimisticStageOverrides = ref<Record<string, string>>({})
const movingContactIds = ref<Record<string, boolean>>({})

const rebuildContactsByStage = () => {
  const groups: Record<string, Contact[]> = {}

  stagesStore.stages.forEach(stage => {
    groups[stage.id] = []
  })

  contactsStore.kanbanContacts.forEach((contact) => {
    const currentStageId = optimisticStageOverrides.value[contact.id] ?? contact.stage
    if (!currentStageId) return

    if (!groups[currentStageId]) {
      groups[currentStageId] = []
    }

    if (optimisticStageOverrides.value[contact.id]) {
      groups[currentStageId].push({ ...contact, stage: currentStageId })
      return
    }

    groups[currentStageId].push(contact)
  })

  contactsByStage.value = groups
}

// Watch changes nos contatos e etapas para atualizar o agrupamento
watch([() => contactsStore.kanbanContacts, () => stagesStore.stages, () => isDragging.value], () => {
  if (isDragging.value) return
  rebuildContactsByStage()
}, { immediate: true })

// Função para configurar ref de coluna (removido - usando DOM direto)
// const setColumnRef = (stageId: string) => (el: HTMLElement | null) => {
//   if (el) {
//     columnRefs.value[stageId] = el
//     console.log(`[Kanban] Ref configurado para stage: ${stageId}`, el)
//   }
// }

// Inicializar SortableJS para todas as colunas - VERSÃO SIMPLES E FUNCIONAL
const destroySortableInstances = () => {
  Object.values(sortableInstances.value).forEach((instance) => {
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy()
    }
  })
  sortableInstances.value = {}
}

const initializeSortable = async () => {
  await nextTick()

  if (!props.draggable || props.loading) {
    destroySortableInstances()
    return
  }
  
  try {
    // Dynamic import do SortableJS
    console.log('[Kanban] Carregando SortableJS...')
    const { default: Sortable } = await import('sortablejs')
    console.log('[Kanban] SortableJS carregado:', typeof Sortable)
    
    // Usar seletor DOM direto para todos os containers
    const containers = scrollContainer.value?.querySelectorAll('.sortable-container') ?? []
    console.log('[Kanban] Containers encontrados:', containers.length)

    if (containers.length === 0) {
      destroySortableInstances()
      return
    }

    destroySortableInstances()
    
    containers.forEach((container) => {
      const stageId = container.getAttribute('data-stage-id')
      if (!stageId) return
      
      console.log(`[Kanban] Inicializando SortableJS para: ${stageId}`)
      
      const sortable = Sortable.create(container as HTMLElement, {
        group: 'kanban',
        animation: 200,
        ghostClass: 'opacity-50',
        chosenClass: 'ring-2',
        dragClass: 'scale-105',
        draggable: '.contact-item',
        filter: 'button, a, input, textarea',
        preventOnFilter: false,
        forceFallback: false,
        fallbackOnBody: true,
        
        onStart: () => {
          isDragging.value = true
          console.log(`[Kanban] Drag iniciado`)
        },
        
        onEnd: async (evt) => {
          isDragging.value = false
          console.log(`[Kanban] Drag finalizado`)

          const contactId = evt.item.getAttribute('data-contact-id')
          const sourceStageId = evt.from.getAttribute('data-stage-id')
          const targetStageId = evt.to.getAttribute('data-stage-id')

          if (!contactId || !targetStageId || sourceStageId === targetStageId) return
          if (movingContactIds.value[contactId]) return

          console.log(`[Kanban] Movendo contato ${contactId} de ${sourceStageId} para ${targetStageId}`)

          movingContactIds.value = { ...movingContactIds.value, [contactId]: true }
          optimisticStageOverrides.value = { ...optimisticStageOverrides.value, [contactId]: targetStageId }
          rebuildContactsByStage()

          try {
            await contactsStore.updateContact(contactId, { stage: targetStageId })
            console.log(`[Kanban] ✅ Contato ${contactId} movido com sucesso`)

            const { [contactId]: _removedOverride, ...restOverrides } = optimisticStageOverrides.value
            optimisticStageOverrides.value = restOverrides
          } catch (error) {
            console.error('[Kanban] ❌ Erro ao mover contato:', error)

            if (sourceStageId) {
              optimisticStageOverrides.value = { ...optimisticStageOverrides.value, [contactId]: sourceStageId }
            } else {
              const { [contactId]: _removedOverride, ...restOverrides } = optimisticStageOverrides.value
              optimisticStageOverrides.value = restOverrides
            }

            toast({
              title: 'Erro ao mover contato',
              description: 'Nao foi possivel salvar a nova etapa. Tentando novamente pode resolver.',
              variant: 'destructive',
            })
          } finally {
            const { [contactId]: _removedMoving, ...restMoving } = movingContactIds.value
            movingContactIds.value = restMoving
            rebuildContactsByStage()
          }
        }
      })
      
      sortableInstances.value[stageId] = sortable
      
      console.log(`[Kanban] ✅ SortableJS criado para ${stageId}`, { sortable, container })
    })
    
    console.log(`[Kanban] ✅ Inicialização completa`)
  } catch (error) {
    console.error('[Kanban] ❌ Erro ao inicializar SortableJS:', error)
  }
}

// Mover contato para nova etapa (simplificado)
/*
// Função temporariamente desabilitada
const moveContact = async (contactId: string, newStageId: string) => {
  try {
    await contactsStore.updateContact(contactId, { stage: newStageId })
    console.log(`[Kanban] ✅ Contato ${contactId} atualizado para etapa ${newStageId}`)
  } catch (error) {
    console.error('[Kanban] ❌ Erro ao mover contato:', error)
    await contactsStore.fetchContacts() // Recarregar em caso de erro
  }
}
*/

// Handle add contact
const handleAddContact = (stageId: string) => {
  emit('addContact', stageId)
}

// Handle contact click
const handleContactClick = (contact: Contact) => {
  emit('contactClick', contact)
}

// Handle view details
const handleViewDetails = (contact: Contact) => {
  emit('contactViewDetails', contact)
}

// Get stage color class
const getStageColorClass = () => {
  return cn(
    'border-t-4',
    'border-primary' // Usar cor padrão por enquanto
  )
}

// Inicializar estado de scroll e teclado
onMounted(async () => {
  await nextTick()
  window.addEventListener('keydown', handleKeyDown)

  await initializeSortable()
})

watch(
  [
    () => props.loading,
    () => props.draggable,
    () => stagesStore.stages.length,
    () => contactsStore.kanbanContacts.length,
    () => !!scrollContainer.value,
  ],
  async ([loading, draggable, stagesCount, _contactsCount, hasContainer]) => {
    if (!hasContainer || loading || !draggable || stagesCount === 0) {
      destroySortableInstances()
      return
    }

    console.log('[Kanban] Estado mudou, reinicializando SortableJS...')
    await initializeSortable()
  },
  { immediate: true, flush: 'post' }
)

// Cleanup (simplificado)
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  destroySortableInstances()
})
</script>

<template>
  <div class="relative w-full" data-testid="contacts-kanban">
    <!-- Container scrollável -->
    <div 
      ref="scrollContainer"
      class="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent" 
      style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch;"
      data-testid="contacts-kanban-scroll"
    >
      <!-- Padding-right infinito; padding lateral herdado do container externo -->
      <div 
        class="inline-flex min-w-full w-full gap-4 sm:gap-5 md:gap-6" 
        :style="{ paddingRight: infinitePadding }"
      >
      <!-- Loading State -->
      <template v-if="props.loading">
        <div
          v-for="i in 4"
          :key="i"
          class="flex-shrink-0 w-72 sm:w-80"
        >
          <div class="h-full rounded-xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur-sm space-y-3">
            <div class="h-12 rounded-lg bg-muted animate-pulse" />
            <div class="space-y-3">
              <div class="h-32 rounded-lg bg-muted animate-pulse" />
              <div class="h-32 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </template>

      <!-- Kanban Columns -->
      <template v-else>
        <div
          v-for="stage in stagesStore.stages"
          :key="stage.id"
          data-testid="kanban-column"
          class="flex-shrink-0 w-72 sm:w-80 h-[clamp(24rem,calc(100dvh-18rem),38rem)]"
        >
          <!-- T010: Surface com bg-card + rounded-lg + padding do DS -->
          <div
            :class="cn(
              'flex h-full flex-col',
              'bg-card border border-border rounded-lg', // T010: Surface padrão do DS
              'p-4', // T010: Padding consistente do DS
              'shadow-sm transition-all hover:shadow-md',
              getStageColorClass()
            )"
          >
            <!-- T011: Header harmonizado com título + contador alinhados horizontalmente -->
            <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border/50">
              <h3 class="flex-1 truncate section-title-sm" :title="stage.name">
                {{ stage.name }}
              </h3>
              <span class="flex-shrink-0 rounded-full bg-primary/12 px-3 py-1 text-sm font-medium text-primary">
                {{ contactsByStage[stage.id]?.length || 0 }}
              </span>
            </div>

            <div class="flex min-h-0 flex-1 flex-col">
              <Button
                variant="outline"
                size="sm"
                class="mb-3 w-full border-dashed text-muted-foreground hover:text-foreground"
                @click="handleAddContact(stage.id)"
              >
                <Plus class="h-4 w-4 mr-2" />
                Adicionar contato
              </Button>

              <div
                class="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted/30 scrollbar-track-transparent"
              >
                <div
                  :id="stage.id"
                  class="space-y-3 min-h-full pb-2 sortable-container" 
                  :data-stage-id="stage.id"
                >
                  <!-- T012: Espaçamento vertical consistente entre cards (12px = space-y-3) -->
                  <div
                    v-for="contact in contactsByStage[stage.id]"
                    :key="contact.id"
                    :class="[
                      'contact-item',
                      { 'opacity-70 pointer-events-none': movingContactIds[contact.id] }
                    ]"
                    :data-contact-id="contact.id"
                  >
                    <ContactCard
                      :contact="contact"
                      :draggable="props.draggable"
                      @click="handleContactClick(contact)"
                      @view-details="handleViewDetails(contact)"
                    />
                  </div>
                </div>
              </div>

              <!-- T020: Empty state padronizado com ícone + texto + ação secundária -->
              <div
                v-if="!contactsByStage[stage.id]?.length"
                class="mt-3 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/30 p-4 text-center transition-colors hover:bg-muted/40"
              >
                <Inbox class="h-8 w-8 text-muted-foreground/60" />
                <div class="space-y-1">
                  <p class="section-kicker">
                    Nenhum contato nesta etapa
                  </p>
                  <p class="text-xs text-muted-foreground">
                    Adicione contatos ou mova-os de outras etapas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botão "Adicionar Etapa" - sempre visível após última coluna -->
        <div class="flex-shrink-0 w-72 sm:w-80 h-[clamp(24rem,calc(100dvh-18rem),38rem)]">
          <button
            type="button"
            class="w-full h-[120px] rounded-[14.4px] border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-all group"
            @click="handleAddStage"
          >
            <div class="flex flex-col items-center justify-center space-y-2">
              <div class="h-12 w-12 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Plus class="h-6 w-6 text-primary" />
              </div>
              <span class="section-kicker group-hover:text-foreground transition-colors">
                Adicionar Etapa
              </span>
            </div>
          </button>
        </div>
      </template>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Custom scrollbar horizontal (mais visível) */
::-webkit-scrollbar {
  height: 10px;
  width: 6px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
  margin: 4px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--primary) / 0.4);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.6);
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* Suporte para Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--primary) / 0.4) hsl(var(--muted) / 0.3);
}

/* Estilos para SortableJS */
.sortable-ghost {
  opacity: 0.5;
  background-color: hsl(var(--primary) / 0.1);
  border: 2px dashed hsl(var(--primary) / 0.5);
  transform: rotate(3deg);
}

.sortable-chosen {
  border-color: hsl(var(--primary));
  box-shadow: 0 8px 32px hsl(var(--primary) / 0.2);
  transform: scale(1.02);
  transition: all 200ms ease;
}

.sortable-drag {
  opacity: 0.8;
  transform: rotate(-2deg);
  box-shadow: 0 12px 40px hsl(var(--shadow) / 0.4);
}

/* Container de items draggable */
.contact-item {
  cursor: move;
  transition: all 200ms ease;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px hsl(var(--shadow) / 0.15);
}

/* Indicar área de drop válida */
.sortable-container:not(:has(.contact-item)) {
  background-color: hsl(var(--muted) / 0.3);
  border: 2px dashed hsl(var(--border));
  border-radius: 8px;
}

.sortable-container.sortable-over {
  background-color: hsl(var(--primary) / 0.05);
  border-color: hsl(var(--primary) / 0.3);
}
</style>
