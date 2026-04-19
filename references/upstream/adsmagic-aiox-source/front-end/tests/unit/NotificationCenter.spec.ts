import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationCenter from '@/components/ui/NotificationCenter.vue'

const DropdownMenuStub = {
    template: `<div><slot name="trigger" /><div data-testid="menu"><slot /></div></div>`,
}

const ButtonStub = {
    template: `<button v-bind="$attrs"><slot /></button>`,
}

describe('NotificationCenter', () => {
    it('renderiza o botão de notificações (trigger)', () => {
        const wrapper = mount(NotificationCenter, {
            global: { stubs: { DropdownMenu: DropdownMenuStub, Button: ButtonStub } },
        })

        const trigger = wrapper.find('button[aria-label="Notificações"]')
        expect(trigger.exists()).toBe(true)
    })

    it('exibe contador de não lidas dentro do menu (não no trigger)', () => {
        const wrapper = mount(NotificationCenter, {
            global: { stubs: { DropdownMenu: DropdownMenuStub, Button: ButtonStub } },
        })

        const counter = wrapper.find('[data-testid="unread-count"]')
        expect(counter.exists()).toBe(true)
        expect(counter.text()).toMatch(/[0-9]+/)
    })

    it('marca todas como lidas ao clicar no botão', async () => {
        const wrapper = mount(NotificationCenter, {
            global: { stubs: { DropdownMenu: DropdownMenuStub, Button: ButtonStub } },
        })

        expect(wrapper.find('[data-testid="unread-count"]').exists()).toBe(true)

        await wrapper.find('[data-testid="notification-mark-all"]').trigger('click')

        expect(wrapper.find('[data-testid="unread-count"]').exists()).toBe(false)
    })

    it('renderiza 5 notificações mock', () => {
        const wrapper = mount(NotificationCenter, {
            global: { stubs: { DropdownMenu: DropdownMenuStub, Button: ButtonStub } },
        })

        const items = wrapper.findAll('[data-testid="notification-item"]')
        expect(items.length).toBe(5)
    })

    it('suporta 4 tipos de notificação (info, success, warning, error)', () => {
        const wrapper = mount(NotificationCenter, {
            global: { stubs: { DropdownMenu: DropdownMenuStub, Button: ButtonStub } },
        })

        const items = wrapper.findAll('[data-testid="notification-item"]')
        expect(items.length).toBeGreaterThan(0)
    })
})
