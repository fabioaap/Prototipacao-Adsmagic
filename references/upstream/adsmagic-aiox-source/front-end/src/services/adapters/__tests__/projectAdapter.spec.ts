/**
 * Testes unitários para projectAdapter
 */

import { describe, it, expect } from 'vitest'
import { adaptProject, adaptProjects } from '../projectAdapter'
import type { Project } from '@/types/project'

describe('projectAdapter', () => {
  const createMockProject = (whatsappConnected: boolean): Project => ({
    id: 'project-123',
    name: 'Meu Projeto',
    company_id: 'company-123',
    created_by: 'user-123',
    company_type: 'individual',
    franchise_count: 1,
    country: 'BR',
    language: 'pt',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    attribution_model: 'first_touch',
    whatsapp_connected: whatsappConnected,
    meta_ads_connected: false,
    google_ads_connected: false,
    tiktok_ads_connected: false,
    status: 'active',
    created_at: '2025-01-27T10:00:00Z',
    updated_at: '2025-01-27T10:00:00Z'
  })

  describe('adaptProject', () => {
    it('deve mapear whatsapp_connected: true para whatsappStatus: connected', () => {
      const project = createMockProject(true)
      const result = adaptProject(project)

      expect(result.whatsappStatus).toBe('connected')
      expect(result.whatsapp_connected).toBe(true)
      expect(result.id).toBe(project.id)
      expect(result.name).toBe(project.name)
    })

    it('deve mapear whatsapp_connected: false para whatsappStatus: disconnected', () => {
      const project = createMockProject(false)
      const result = adaptProject(project)

      expect(result.whatsappStatus).toBe('disconnected')
      expect(result.whatsapp_connected).toBe(false)
      expect(result.id).toBe(project.id)
      expect(result.name).toBe(project.name)
    })

    it('deve preservar todos os outros campos do projeto', () => {
      const project = createMockProject(true)
      project.description = 'Descrição do projeto'
      project.wizard_progress = { current_step: 1, data: {}, last_saved_at: '2025-01-27T10:00:00Z' }
      project.wizard_current_step = 1

      const result = adaptProject(project)

      expect(result.description).toBe('Descrição do projeto')
      expect(result.wizard_progress).toEqual({ current_step: 1, data: {} })
      expect(result.wizard_current_step).toBe(1)
      expect(result.company_id).toBe(project.company_id)
      expect(result.status).toBe(project.status)
    })

    it('deve retornar novo objeto (não mutar o original)', () => {
      const project = createMockProject(true)
      const result = adaptProject(project)

      expect(result).not.toBe(project)
      expect(result.whatsappStatus).toBe('connected')
      expect(project.whatsappStatus).toBeUndefined()
    })

    it('deve criar objeto metrics com campos zerados quando não fornecidos', () => {
      const project = createMockProject(true)
      const result = adaptProject(project)

      expect(result.metrics).toEqual({
        investment: 0,
        contacts: 0,
        sales: 0,
        conversionRate: 0,
        averageTicket: 0,
        revenue: 0
      })
    })

    it('deve popular metrics com valores da API quando fornecidos', () => {
      const project = createMockProject(true) as Project & {
        investment?: number
        revenue?: number
        contacts_count?: number
        sales_count?: number
        conversion_rate?: number
        average_ticket?: number
      }
      project.investment = 1000
      project.revenue = 5000
      project.contacts_count = 100
      project.sales_count = 10
      project.conversion_rate = 10
      project.average_ticket = 500

      const result = adaptProject(project)

      expect(result.metrics).toEqual({
        investment: 1000,
        contacts: 100,
        sales: 10,
        conversionRate: 10,
        averageTicket: 500,
        revenue: 5000
      })
    })
  })

  describe('adaptProjects', () => {
    it('deve adaptar array de projetos', () => {
      const projects = [
        createMockProject(true),
        createMockProject(false),
        createMockProject(true)
      ]

      const result = adaptProjects(projects)

      expect(result).toHaveLength(3)
      expect(result[0]?.whatsappStatus).toBe('connected')
      expect(result[1]?.whatsappStatus).toBe('disconnected')
      expect(result[2]?.whatsappStatus).toBe('connected')
    })

    it('deve retornar array vazio quando recebe array vazio', () => {
      const projects: Project[] = []
      const result = adaptProjects(projects)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('deve preservar ordem dos projetos', () => {
      const projects = [
        createMockProject(true),
        createMockProject(false),
        createMockProject(true)
      ]

      const result = adaptProjects(projects)

      expect(result[0]?.id).toBe(projects[0]?.id)
      expect(result[1]?.id).toBe(projects[1]?.id)
      expect(result[2]?.id).toBe(projects[2]?.id)
    })

    it('não deve mutar o array original', () => {
      const projects = [
        createMockProject(true),
        createMockProject(false)
      ]

      const result = adaptProjects(projects)

      expect(result).not.toBe(projects)
      expect(projects[0]?.whatsappStatus).toBeUndefined()
      expect(projects[1]?.whatsappStatus).toBeUndefined()
    })
  })
})

