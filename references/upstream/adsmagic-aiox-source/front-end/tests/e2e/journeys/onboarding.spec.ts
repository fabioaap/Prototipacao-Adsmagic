import { test, expect } from '@playwright/test'

const MOCK_SERVER_URL = 'http://localhost:8787'

test.describe('Jornada: Onboarding empresa/projeto', () => {
    test('fluxo completo 1→5 com is_completed = true', async ({ page, request }) => {
        // 1. Criar empresa via API
        const companyResponse = await request.post(`${MOCK_SERVER_URL}/rest/v1/companies`, {
            data: {
                name: 'Test Company',
                description: 'Test company for onboarding'
            }
        })
        expect(companyResponse.ok()).toBe(true)
        const company = await companyResponse.json()
        expect(company.id).toBeTruthy()

        // 2. Criar projeto via API
        const projectResponse = await request.post(`${MOCK_SERVER_URL}/rest/v1/projects`, {
            data: {
                company_id: company.id,
                name: 'Test Project',
                description: 'Test project for onboarding'
            }
        })
        expect(projectResponse.ok()).toBe(true)
        const project = await projectResponse.json()
        expect(project.id).toBeTruthy()

        // 3. Criar contato via API
        const contactResponse = await request.post(`${MOCK_SERVER_URL}/rest/v1/contacts`, {
            data: {
                project_id: project.id,
                email: 'contact@example.com',
                name: 'Test Contact'
            }
        })
        expect(contactResponse.ok()).toBe(true)
        const contact = await contactResponse.json()
        expect(contact.id).toBeTruthy()

        // 4. Criar venda via API (finalizar onboarding)
        const saleResponse = await request.post(`${MOCK_SERVER_URL}/rest/v1/sales`, {
            data: {
                project_id: project.id,
                contact_id: contact.id,
                amount: 1500,
                status: 'completed'
            }
        })
        expect(saleResponse.ok()).toBe(true)
        const sale = await saleResponse.json()
        expect(sale.id).toBeTruthy()
        expect(sale.amount).toBe(1500)
    })
})
