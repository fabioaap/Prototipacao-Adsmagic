import { ref } from 'vue'
import type { Router } from 'vue-router'
import type { HomeJourney } from '@/data/home'

export interface ValidationResult {
  valid: boolean
  reason?: string
}

export function useJourneyExperienceDrawer({ router }: { router: Router }) {
  const isOpen = ref(false)
  const activeJourney = ref<HomeJourney | null>(null)
  const triggerEl = ref<EventTarget | null>(null)
  const validationResult = ref<ValidationResult | null>(null)
  const iframeSrc = ref('')

  function openJourneyDrawer({
    journey,
    triggerElement,
  }: {
    journey: HomeJourney
    triggerElement: EventTarget | null
  }) {
    activeJourney.value = journey
    triggerEl.value = triggerElement

    if (journey.experience) {
      validationResult.value = { valid: true }
      iframeSrc.value = journey.experience.target
    } else {
      validationResult.value = { valid: false, reason: 'Jornada sem experiência configurada.' }
      iframeSrc.value = ''
    }

    isOpen.value = true
  }

  function closeJourneyDrawer() {
    isOpen.value = false
  }

  function openFullPage() {
    if (!activeJourney.value) return
    const journey = activeJourney.value
    if (journey.experience?.targetType === 'external') {
      window.open(journey.experience.target, '_blank', 'noopener,noreferrer')
    } else {
      router.push(`/journeys/${journey.id}`)
    }
    closeJourneyDrawer()
  }

  return {
    isOpen,
    activeJourney,
    triggerEl,
    validationResult,
    iframeSrc,
    openJourneyDrawer,
    closeJourneyDrawer,
    openFullPage,
  }
}
