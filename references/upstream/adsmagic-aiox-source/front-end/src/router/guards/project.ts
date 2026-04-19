/**
 * Project Guard
 * 
 * Valida se o usuário tem acesso ao projeto especificado na rota
 * e carrega os dados do projeto se necessário.
 * 
 * @module router/guards/project
 */

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import { setCurrentProjectId } from '@/composables/useCurrentProjectId'

/**
 * Guard de validação de projeto
 * 
 * Verifica se:
 * 1. O usuário está autenticado
 * 2. O projectId existe na rota
 * 3. O usuário tem acesso ao projeto
 * 4. O projeto está carregado na store
 */
export async function projectGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> {
  const authStore = useAuthStore()
  const projectsStore = useProjectsStore()
  const clearProjectContext = async () => {
    setCurrentProjectId(null)
    try {
      await projectsStore.setCurrentProject(null)
    } catch (error) {
      console.warn('[Project Guard] Failed to clear current project context:', error)
    }
  }

  // 1. Verificar se usuário está autenticado
  if (!authStore.isAuthenticated) {
    await clearProjectContext()
    console.warn('[Project Guard] User not authenticated')
    const locale = (to.params.locale as string) || 'pt'
    // Garantir rota existente para evitar falha de navegação
    next({ name: 'login', params: { locale } })
    return
  }

  // 2. Verificar se projectId existe na rota
  const projectId = to.params.projectId as string
  if (!projectId) {
    await clearProjectContext()
    console.warn('[Project Guard] No projectId in route')
    next({
      name: 'projects',
      params: { locale: to.params.locale || 'pt' }
    })
    return
  }

  // Importante: sincronizar contexto de projeto da rota antes de qualquer loadProject().
  // O interceptor da API usa current_project_id para X-Project-ID.
  // Sem isso, navegar de A -> B pode enviar header de A ao carregar B.
  setCurrentProjectId(projectId)
  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_SUPABASE !== 'true'

  // Fast path: se já estamos no mesmo projeto carregado, evita recarga e bloqueio.
  if (projectsStore.currentProject?.id === projectId) {
    if (!isMockMode && projectsStore.currentProject.status === 'archived') {
      await clearProjectContext()
      console.warn('[Project Guard] Archived project cannot access route:', projectId)
      next({
        name: 'projects',
        params: { locale: to.params.locale || 'pt' },
        query: { error: 'project_archived' }
      })
      return
    }

    to.meta.projectId = projectId
    to.meta.projectName = projectsStore.currentProject?.name || 'Unknown Project'
    next()
    return
  }

  try {
    // 3. Verificar se o projeto está carregado
    let currentProject = projectsStore.currentProject
    // Corrigir lógica: mock mode é quando VITE_USE_MOCK é 'true' OU VITE_USE_SUPABASE não é 'true'
    console.log('[Project Guard] Mock mode check:', {
      VITE_USE_SUPABASE: import.meta.env.VITE_USE_SUPABASE,
      VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK,
      isMockMode
    })

    if (!currentProject || currentProject.id !== projectId) {
      console.log('[Project Guard] Loading project:', projectId)

      // Carregar projeto específico com retry para cenários pós-F5/race de sessão.
      let project = await projectsStore.loadProject(projectId)
      if (!project) {
        try {
          const { ensureSession } = await import('@/services/api/client')
          await ensureSession({ waitForRestore: true })
        } catch {
          // noop - vamos tentar nova carga mesmo assim
        }
        project = await projectsStore.loadProject(projectId)
      }

      if (!project) {
        console.error('[Project Guard] Project not found or no access:', projectId)

        // Em modo mock, criar projeto temporário para permitir acesso
        if (isMockMode) {
          console.log('[Project Guard] Modo mock - criando projeto temporário:', projectId)
          const mockProject = {
            id: projectId,
            name: `Projeto ${projectId}`,
            company_id: 'mock-company',
            status: 'draft',
            created_at: new Date().toISOString(),
            created_by: 'mock-user'
          } as any

          await projectsStore.setCurrentProject(mockProject)
          currentProject = mockProject
        } else {
          // Em produção, redirecionar para projects
          await clearProjectContext()
          next({
            name: 'projects',
            params: { locale: to.params.locale || 'pt' },
            query: { error: 'project_not_found' }
          })
          return
        }
      } else {
        // Definir como projeto atual
        await projectsStore.setCurrentProject(project)
        currentProject = project // ← ATUALIZAR a variável local!
      }
    }

    // 4. Verificar status do projeto (pula em modo mock)
    if (!isMockMode) {
      // Projeto arquivado não deve acessar módulos operacionais.
      if (currentProject?.status === 'archived') {
        await clearProjectContext()
        console.warn('[Project Guard] Archived project cannot access route:', projectId)
        next({
          name: 'projects',
          params: { locale: to.params.locale || 'pt' },
          query: { error: 'project_archived' }
        })
        return
      }
    } else {
      console.log('[Project Guard] Mock mode ativo - ignorando validação de status')
    }

    // 5. Adicionar metadados da rota
    to.meta.projectId = projectId
    to.meta.projectName = currentProject?.name || 'Unknown Project'

    console.log('[Project Guard] Project access granted:', projectId)
    next()

  } catch (error) {
    await clearProjectContext()
    console.error('[Project Guard] Error validating project:', error)
    next({
      name: 'projects',
      params: { locale: to.params.locale || 'pt' },
      query: { error: 'project_validation_failed' }
    })
  }
}

/**
 * Guard para rotas que requerem projeto ativo
 * 
 * Usado em rotas que precisam de um projeto específico carregado
 */
export async function requireActiveProject(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> {
  const projectsStore = useProjectsStore()

  if (!projectsStore.currentProject) {
    console.warn('[Require Active Project] No current project')
    next({
      name: 'projects',
      params: { locale: to.params.locale || 'pt' }
    })
    return
  }

  next()
}

/**
 * Helper para gerar rotas com projectId
 */
export function createProjectRoute(routeName: string, projectId: string, locale: string = 'pt') {
  return {
    name: routeName,
    params: { projectId, locale }
  }
}

/**
 * Helper para verificar se a rota atual tem projectId
 */
export function hasProjectId(route: RouteLocationNormalized): boolean {
  return !!(route.params.projectId && typeof route.params.projectId === 'string')
}

/**
 * Helper para obter projectId da rota atual
 */
export function getProjectId(route: RouteLocationNormalized): string | null {
  return route.params.projectId as string || null
}
