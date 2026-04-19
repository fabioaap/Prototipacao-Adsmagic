import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  type Experiment,
  type ExperimentStage,
  type ExperimentPriority,
  type ExperimentHorizon,
  experimentStages,
  mockExperiments,
} from '@/data/experiments'

export const useExperimentsStore = defineStore('experiments', () => {
  const experiments = ref<Experiment[]>([...mockExperiments])

  // ── Filters ──────────────────────────────────────────────────────────────
  const filterPriority = ref<ExperimentPriority | null>(null)
  const filterOwner = ref<string | null>(null)
  const filterHorizon = ref<ExperimentHorizon | null>(null)
  const searchQuery = ref('')

  // ── Computed ──────────────────────────────────────────────────────────────
  const filtered = computed(() => {
    return experiments.value.filter((exp) => {
      if (filterPriority.value && exp.priority !== filterPriority.value) return false
      if (filterOwner.value && !exp.owner.includes(filterOwner.value)) return false
      if (filterHorizon.value && exp.horizon !== filterHorizon.value) return false
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        return (
          exp.id.toLowerCase().includes(q) ||
          exp.title.toLowerCase().includes(q) ||
          exp.hypothesis.toLowerCase().includes(q) ||
          exp.owner.toLowerCase().includes(q)
        )
      }
      return true
    })
  })

  const columns = computed(() => {
    return experimentStages.map((stage) => ({
      ...stage,
      experiments: filtered.value.filter((e) => e.stage === stage.id),
      count: filtered.value.filter((e) => e.stage === stage.id).length,
    }))
  })

  const getByStage = (stage: ExperimentStage): Experiment[] =>
    filtered.value.filter((e) => e.stage === stage)

  const countByStage = (stage: ExperimentStage): number =>
    experiments.value.filter((e) => e.stage === stage).length

  const owners = computed(() => {
    const all = experiments.value.flatMap((e) =>
      e.owner.split('+').map((o) => o.trim())
    )
    return [...new Set(all)].sort()
  })

  // ── Actions ───────────────────────────────────────────────────────────────
  function moveExperiment(id: string, newStage: ExperimentStage) {
    const exp = experiments.value.find((e) => e.id === id)
    if (!exp) return
    exp.stage = newStage
    exp.updatedAt = new Date().toISOString().split('T')[0]
  }

  function updateExperiment(id: string, fields: Partial<Omit<Experiment, 'id' | 'createdAt'>>) {
    const exp = experiments.value.find((e) => e.id === id)
    if (!exp) return
    Object.assign(exp, { ...fields, updatedAt: new Date().toISOString().split('T')[0] })
  }

  function createExperiment(fields: Partial<Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>>): string {
    const maxNum = experiments.value.reduce((max, e) => {
      const m = e.id.match(/PROTO-(\d+)/)
      return m ? Math.max(max, parseInt(m[1], 10)) : max
    }, 0)
    const id = `PROTO-${String(maxNum + 1).padStart(3, '0')}`
    const today = new Date().toISOString().split('T')[0]
    experiments.value.push({
      id,
      title: fields.title ?? 'Novo Experimento',
      hypothesis: fields.hypothesis ?? '',
      branch: fields.branch ?? `prototypes/feature/${id.toLowerCase()}`,
      owner: fields.owner ?? '@dev',
      priority: fields.priority ?? 'medium',
      stage: fields.stage ?? 'backlog',
      horizon: fields.horizon ?? 'later',
      createdAt: today,
      updatedAt: today,
      result: fields.result,
      attachments: fields.attachments ?? [],
      issues: fields.issues ?? [],
    })
    return id
  }

  function deleteExperiment(id: string): boolean {
    const index = experiments.value.findIndex((experiment) => experiment.id === id)
    if (index === -1) return false
    experiments.value.splice(index, 1)
    return true
  }

  function setFilterPriority(priority: ExperimentPriority | null) {
    filterPriority.value = priority
  }

  function setFilterOwner(owner: string | null) {
    filterOwner.value = owner
  }

  function setFilterHorizon(horizon: ExperimentHorizon | null) {
    filterHorizon.value = horizon
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function clearFilters() {
    filterPriority.value = null
    filterOwner.value = null
    filterHorizon.value = null
    searchQuery.value = ''
  }

  return {
    experiments,
    filtered,
    columns,
    filterPriority,
    filterOwner,
    filterHorizon,
    searchQuery,
    owners,
    getByStage,
    countByStage,
    moveExperiment,
    updateExperiment,
    createExperiment,
    deleteExperiment,
    setFilterPriority,
    setFilterOwner,
    setFilterHorizon,
    setSearchQuery,
    clearFilters,
  }
})
