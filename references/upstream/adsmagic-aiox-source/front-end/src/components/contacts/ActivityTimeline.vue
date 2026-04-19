<script setup lang="ts">
/**
 * ActivityTimeline - Timeline visual de atividades do contato
 *
 * Exibe um histórico cronológico de todas as atividades relacionadas
 * a um contato, com ícones, cores e detalhes específicos por tipo.
 *
 * @component
 */
import { computed, ref, onMounted, watch } from 'vue'
import {
    UserPlus,
    ArrowRightLeft,
    Tag,
    FileText,
    DollarSign,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Edit,
    Activity,
    ChevronDown,
    ChevronUp,
    AlertCircle
} from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'
import { useFormat } from '@/composables/useFormat'
import { activitiesService } from '@/services/api/activities'
import type { ContactActivity, ContactActivityType } from '@/types/models'

interface Props {
    /** ID do contato */
    contactId: string
    /** Limite inicial de atividades a exibir */
    initialLimit?: number
    /** Se deve carregar automaticamente ao montar */
    autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    initialLimit: 5,
    autoLoad: true
})

const { formatRelativeTime, formatCurrency } = useFormat()

// Estado
const activities = ref<ContactActivity[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showAll = ref(false)
const totalCount = ref(0)

// Configuração visual por tipo de atividade
const activityConfig: Record<ContactActivityType, {
    icon: typeof Activity
    color: string
    bgColor: string
}> = {
    contact_created: {
        icon: UserPlus,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100'
    },
    stage_changed: {
        icon: ArrowRightLeft,
        color: 'text-info',
        bgColor: 'bg-info/10'
    },
    tag_added: {
        icon: Tag,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100'
    },
    tag_removed: {
        icon: Tag,
        color: 'text-muted-foreground',
        bgColor: 'bg-secondary'
    },
    note_added: {
        icon: FileText,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
    },
    note_updated: {
        icon: FileText,
        color: 'text-primary',
        bgColor: 'bg-primary/5'
    },
    sale_created: {
        icon: DollarSign,
        color: 'text-success',
        bgColor: 'bg-success/10'
    },
    sale_updated: {
        icon: DollarSign,
        color: 'text-success',
        bgColor: 'bg-success/5'
    },
    email_sent: {
        icon: Mail,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100'
    },
    call_logged: {
        icon: Phone,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100'
    },
    meeting_scheduled: {
        icon: Calendar,
        color: 'text-rose-600',
        bgColor: 'bg-rose-100'
    },
    origin_changed: {
        icon: MapPin,
        color: 'text-warning',
        bgColor: 'bg-warning/10'
    },
    field_updated: {
        icon: Edit,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100'
    },
    event_tracked: {
        icon: Activity,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100'
    }
}

// Atividades visíveis (limitadas ou todas)
const visibleActivities = computed(() => {
    if (showAll.value) {
        return activities.value
    }
    return activities.value.slice(0, props.initialLimit)
})

// Se há mais atividades para mostrar
const hasMore = computed(() => {
    return activities.value.length > props.initialLimit
})

// Carregar atividades
async function loadActivities() {
    loading.value = true
    error.value = null

    try {
        const [data, count] = await Promise.all([
            activitiesService.getContactActivities({
                contactId: props.contactId,
                limit: 20
            }),
            activitiesService.countContactActivities(props.contactId)
        ])

        activities.value = data
        totalCount.value = count
    } catch (e) {
        console.error('Erro ao carregar atividades:', e)
        error.value = 'Não foi possível carregar o histórico de atividades'
    } finally {
        loading.value = false
    }
}

// Obter configuração de uma atividade
function getConfig(type: ContactActivityType) {
    return activityConfig[type] || {
        icon: Activity,
        color: 'text-muted-foreground',
        bgColor: 'bg-secondary'
    }
}

// Formatar valor de venda
function formatSaleValue(value: number | undefined): string {
    if (value === undefined) return ''
    return formatCurrency(value)
}

// Toggle mostrar todas
function toggleShowAll() {
    showAll.value = !showAll.value
}

// Watch para recarregar quando contactId mudar
watch(() => props.contactId, () => {
    if (props.autoLoad) {
        loadActivities()
    }
})

// Carregar ao montar
onMounted(() => {
    if (props.autoLoad) {
        loadActivities()
    }
})

// Expor método para reload externo
defineExpose({
    reload: loadActivities
})
</script>

<template>
    <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h4 class="section-kicker uppercase tracking-wide">
                Histórico de Atividades
            </h4>
            <span v-if="!loading && activities.length > 0" class="text-xs text-muted-foreground">
                {{ totalCount }} atividade{{ totalCount !== 1 ? 's' : '' }}
            </span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="flex items-start gap-3 animate-pulse">
                <div class="h-8 w-8 rounded-full bg-muted shrink-0" />
                <div class="flex-1 space-y-2 pt-1">
                    <div class="h-4 w-40 bg-muted rounded" />
                    <div class="h-3 w-24 bg-muted rounded" />
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div
            v-else-if="error"
            class="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg"
        >
            <AlertCircle class="h-5 w-5 shrink-0" />
            <div class="flex-1">
                <p class="text-sm font-medium">{{ error }}</p>
                <Button variant="ghost" size="sm" class="mt-2 -ml-2" @click="loadActivities">
                    Tentar novamente
                </Button>
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else-if="activities.length === 0"
            class="text-center py-8 bg-muted/30 rounded-lg"
        >
            <Activity class="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p class="section-kicker">Nenhuma atividade registrada</p>
            <p class="text-xs text-muted-foreground/70 mt-1">
                As atividades aparecerão aqui conforme forem realizadas
            </p>
        </div>

        <!-- Activities Timeline -->
        <div v-else class="relative">
            <!-- Timeline line -->
            <div class="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <!-- Activity Items -->
            <div class="space-y-4">
                <div
                    v-for="activity in visibleActivities"
                    :key="activity.id"
                    class="relative flex items-start gap-4 pl-0"
                >
                    <!-- Icon -->
                    <div
                        :class="cn(
                            'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            getConfig(activity.type).bgColor
                        )"
                    >
                        <component
                            :is="getConfig(activity.type).icon"
                            :class="cn('h-4 w-4', getConfig(activity.type).color)"
                        />
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0 pt-0.5">
                        <!-- Title -->
                        <p class="section-kicker">
                            {{ activity.title }}
                        </p>

                        <!-- Description (se houver) -->
                        <p
                            v-if="activity.description"
                            class="text-sm text-muted-foreground mt-0.5"
                        >
                            {{ activity.description }}
                        </p>

                        <!-- Metadata específico por tipo -->
                        <div class="mt-1.5 space-y-1">
                            <!-- Stage Changed -->
                            <div
                                v-if="activity.type === 'stage_changed' && activity.metadata.fromStageName"
                                class="flex items-center gap-2 text-xs"
                            >
                                <span class="text-muted-foreground">
                                    {{ activity.metadata.fromStageName }}
                                </span>
                                <ArrowRightLeft class="h-3 w-3 text-muted-foreground" />
                                <span class="font-medium text-foreground">
                                    {{ activity.metadata.toStageName }}
                                </span>
                            </div>

                            <!-- Tag Added/Removed -->
                            <div
                                v-if="(activity.type === 'tag_added' || activity.type === 'tag_removed') && activity.metadata.tagName"
                                class="flex items-center gap-2"
                            >
                                <Badge
                                    variant="outline"
                                    class="text-xs px-2 py-0.5"
                                    :style="{
                                        backgroundColor: `${activity.metadata.tagColor}20`,
                                        borderColor: activity.metadata.tagColor,
                                        color: activity.metadata.tagColor
                                    }"
                                >
                                    {{ activity.metadata.tagName }}
                                </Badge>
                            </div>

                            <!-- Sale Created -->
                            <div
                                v-if="activity.type === 'sale_created' && activity.metadata.saleValue"
                                class="flex items-center gap-2"
                            >
                                <Badge variant="success" class="text-xs">
                                    {{ formatSaleValue(activity.metadata.saleValue) }}
                                </Badge>
                                <span
                                    v-if="activity.metadata.saleStatus === 'completed'"
                                    class="text-xs text-success"
                                >
                                    Concluída
                                </span>
                            </div>

                            <!-- Note Preview -->
                            <p
                                v-if="activity.type === 'note_added' && activity.metadata.notePreview"
                                class="text-xs text-muted-foreground italic line-clamp-2"
                            >
                                "{{ activity.metadata.notePreview }}"
                            </p>

                            <!-- Field Updated -->
                            <div
                                v-if="activity.type === 'field_updated' && activity.metadata.fieldName"
                                class="text-xs text-muted-foreground"
                            >
                                <span class="line-through">{{ activity.metadata.oldValue }}</span>
                                <span class="mx-1">→</span>
                                <span class="font-medium text-foreground">{{ activity.metadata.newValue }}</span>
                            </div>

                            <!-- Event Tracked -->
                            <div
                                v-if="activity.type === 'event_tracked' && activity.metadata.platform"
                                class="flex items-center gap-2"
                            >
                                <Badge variant="outline" class="text-xs">
                                    {{ activity.metadata.platform }}
                                </Badge>
                                <span class="text-xs text-muted-foreground">
                                    {{ activity.metadata.eventType }}
                                </span>
                            </div>
                        </div>

                        <!-- Footer: Performed by + Time -->
                        <div class="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span v-if="activity.performedByName">
                                {{ activity.performedByName }}
                            </span>
                            <span v-if="activity.performedByName" class="text-muted-foreground/50">•</span>
                            <span>{{ formatRelativeTime(activity.createdAt) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Show More/Less Button -->
        <Button
            v-if="!loading && hasMore"
            variant="ghost"
            size="sm"
            class="w-full"
            @click="toggleShowAll"
        >
            <component :is="showAll ? ChevronUp : ChevronDown" class="h-4 w-4 mr-2" />
            {{ showAll ? 'Mostrar menos' : `Ver mais (${activities.length - initialLimit})` }}
        </Button>
    </div>
</template>
