/**
 * Composable para gerenciar o ID do projeto atual de forma reativa.
 *
 * Este composable resolve o problema de que localStorage.getItem() não é
 * reativo no Vue. Ele mantém um ref sincronizado com localStorage e
 * permite que outros stores/composables observem mudanças de projeto.
 *
 * @module composables/useCurrentProjectId
 */
import { ref, readonly } from 'vue'

// Singleton ref - compartilhado entre todas as instâncias
const currentProjectId = ref<string | null>(localStorage.getItem('current_project_id'))

/**
 * Atualiza o projeto atual (chamado pelo projects store)
 */
export function setCurrentProjectId(projectId: string | null): void {
  const oldValue = currentProjectId.value
  const hasChanged = oldValue !== projectId
  currentProjectId.value = projectId

  // Sync com localStorage
  if (projectId) {
    localStorage.setItem('current_project_id', projectId)
  } else {
    localStorage.removeItem('current_project_id')
  }

  if (import.meta.env.DEV && hasChanged) {
    console.log('[useCurrentProjectId] Project changed:', { oldValue, newValue: projectId })
  }
}

/**
 * Retorna o ref reativo do projeto atual (readonly para prevenir mutações diretas)
 */
export function useCurrentProjectId() {
  return {
    currentProjectId: readonly(currentProjectId),
    setCurrentProjectId
  }
}

/**
 * Getter direto do valor (para uso em funções não-reativas)
 */
export function getCurrentProjectId(): string | null {
  return currentProjectId.value
}
