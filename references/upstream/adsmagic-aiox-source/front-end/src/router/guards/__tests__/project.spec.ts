import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUseAuthStore, mockUseProjectsStore, mockSetCurrentProjectId } = vi.hoisted(() => ({
  mockUseAuthStore: vi.fn(),
  mockUseProjectsStore: vi.fn(),
  mockSetCurrentProjectId: vi.fn(),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: mockUseAuthStore,
}))

vi.mock('@/stores/projects', () => ({
  useProjectsStore: mockUseProjectsStore,
}))

vi.mock('@/composables/useCurrentProjectId', () => ({
  setCurrentProjectId: mockSetCurrentProjectId,
}))

import { projectGuard } from '../project'

describe('projectGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('redirects to login when user is not authenticated', async () => {
    const next = vi.fn()
    const setCurrentProject = vi.fn().mockResolvedValue(undefined)

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
    })
    mockUseProjectsStore.mockReturnValue({
      setCurrentProject,
    })

    await projectGuard(
      {
        params: { locale: 'pt', projectId: 'project-1' },
        meta: {},
      } as any,
      {} as any,
      next
    )

    expect(mockSetCurrentProjectId).toHaveBeenCalledWith(null)
    expect(setCurrentProject).toHaveBeenCalledWith(null)
    expect(next).toHaveBeenCalledWith({ name: 'login', params: { locale: 'pt' } })
  })

  it('uses fast path when current project already matches route projectId', async () => {
    const next = vi.fn()
    const loadProject = vi.fn()

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
    })
    mockUseProjectsStore.mockReturnValue({
      currentProject: { id: 'project-1', name: 'Projeto 1', status: 'active' },
      loadProject,
      setCurrentProject: vi.fn(),
    })

    const to = {
      params: { locale: 'pt', projectId: 'project-1' },
      meta: {},
    } as any

    await projectGuard(to, {} as any, next)

    expect(mockSetCurrentProjectId).toHaveBeenCalledWith('project-1')
    expect(loadProject).not.toHaveBeenCalled()
    expect(to.meta.projectId).toBe('project-1')
    expect(to.meta.projectName).toBe('Projeto 1')
    expect(next).toHaveBeenCalledWith()
  })

  it('blocks archived project even on fast path', async () => {
    vi.stubEnv('VITE_USE_SUPABASE', 'true')
    vi.stubEnv('VITE_USE_MOCK', 'false')

    const next = vi.fn()
    const setCurrentProject = vi.fn().mockResolvedValue(undefined)
    const loadProject = vi.fn()

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
    })
    mockUseProjectsStore.mockReturnValue({
      currentProject: { id: 'project-1', name: 'Projeto 1', status: 'archived' },
      loadProject,
      setCurrentProject,
    })

    await projectGuard(
      {
        params: { locale: 'pt', projectId: 'project-1' },
        meta: {},
      } as any,
      {} as any,
      next
    )

    expect(setCurrentProject).toHaveBeenCalledWith(null)
    expect(loadProject).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith({
      name: 'projects',
      params: { locale: 'pt' },
      query: { error: 'project_archived' },
    })
  })

  it('loads project when route projectId differs from current project', async () => {
    const next = vi.fn()
    const project = { id: 'project-2', name: 'Projeto 2', status: 'active' }
    const loadProject = vi.fn().mockResolvedValue(project)
    const setCurrentProject = vi.fn().mockResolvedValue(undefined)

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
    })
    mockUseProjectsStore.mockReturnValue({
      currentProject: { id: 'project-1', name: 'Projeto 1', status: 'active' },
      loadProject,
      setCurrentProject,
    })

    const to = {
      params: { locale: 'pt', projectId: 'project-2' },
      meta: {},
    } as any

    await projectGuard(to, {} as any, next)

    expect(loadProject).toHaveBeenCalledWith('project-2')
    expect(setCurrentProject).toHaveBeenCalledWith(project)
    expect(to.meta.projectId).toBe('project-2')
    expect(to.meta.projectName).toBe('Projeto 2')
    expect(next).toHaveBeenCalledWith()
  })
})
