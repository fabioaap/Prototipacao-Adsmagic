import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import WhatsAppStatus from '@/components/ui/WhatsAppStatus.vue'

// Mock da service de integrações WhatsApp para evitar chamadas HTTP reais
vi.mock('@/services/api/whatsappIntegrationService', () => ({
    whatsappIntegrationService: {
        listProjectAccounts: vi.fn().mockResolvedValue({ success: false, data: [] })
    }
}))

const DropdownMenuStub = {
    template: `<div><slot name="trigger" /><div data-testid="menu"><slot /></div></div>`,
}

function createTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [{
            path: '/:locale/projects/:projectId',
            name: 'dashboard',
            component: { template: '<div/>' }
        }]
    })
}

describe('WhatsAppStatus', () => {
    beforeEach(async () => {
        setActivePinia(createPinia())
    })

    it('renderiza ícone SVG, texto e pill de status', async () => {
        const router = createTestRouter()
        await router.push('/pt/projects/test-project-123')

        const wrapper = mount(WhatsAppStatus, {
            global: {
                plugins: [router],
                stubs: { DropdownMenu: DropdownMenuStub }
            },
        })

        expect(wrapper.find('svg').exists()).toBe(true)
        expect(wrapper.text()).toContain('WhatsApp')
        expect(
            wrapper.text().includes('Conectado') || wrapper.text().includes('Desconectado')
        ).toBe(true)
    })

    it('mostra "Desconectado" (vermelho) por padrão', async () => {
        const router = createTestRouter()
        await router.push('/pt/projects/test-project-123')

        const wrapper = mount(WhatsAppStatus, {
            global: {
                plugins: [router],
                stubs: { DropdownMenu: DropdownMenuStub }
            },
        })

        expect(wrapper.text()).toContain('Desconectado')
        expect(wrapper.html()).toContain('bg-[rgba(239,68,68,0.1)]')
        expect(wrapper.html()).toContain('text-[#ef4444]')
    })

    it('tem aria-label para acessibilidade', async () => {
        const router = createTestRouter()
        await router.push('/pt/projects/test-project-123')

        const wrapper = mount(WhatsAppStatus, {
            global: {
                plugins: [router],
                stubs: { DropdownMenu: DropdownMenuStub }
            },
        })

        const button = wrapper.find('button[aria-label="Status do WhatsApp"]')
        expect(button.exists()).toBe(true)
    })
})
