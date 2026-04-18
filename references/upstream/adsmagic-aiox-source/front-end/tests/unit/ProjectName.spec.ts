import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectName from '@/components/ui/ProjectName.vue'

describe('ProjectName', () => {
    it('renderiza título hierárquico (label + h1)', () => {
        const wrapper = mount(ProjectName, {
            props: { projectName: 'Meu Projeto Teste' }
        })

        const label = wrapper.find('.text-xs.uppercase')
        expect(label.text()).toBe('Nome do projeto')

        const title = wrapper.find('h1')
        expect(title.text()).toBe('Meu Projeto Teste')
    })

    it('não tem bordas ou background de botão', () => {
        const wrapper = mount(ProjectName, {
            props: { projectName: 'Projeto X' }
        })

        const root = wrapper.find('div')
        expect(root.classes()).not.toContain('border')
        expect(root.classes()).not.toContain('bg-accent')
        expect(root.classes()).not.toContain('rounded-lg')
    })

    it('trunca nomes longos', () => {
        const longName = 'A'.repeat(50)
        const wrapper = mount(ProjectName, {
            props: { projectName: longName }
        })

        const title = wrapper.find('h1')
        expect(title.classes()).toContain('truncate')
        expect(title.attributes('title')).toBe(longName)
    })
})
