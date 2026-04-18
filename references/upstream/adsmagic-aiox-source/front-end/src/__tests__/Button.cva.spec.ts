import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button (CVA)', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const
    const sizes = ['sm', 'default', 'lg', 'icon'] as const

    it('renders all 6×4 variants/sizes matrix without throwing', () => {
        variants.forEach(variant => {
            sizes.forEach(size => {
                const wrapper = mount(Button, {
                    props: { variant, size },
                    slots: { default: 'Test' }
                })
                expect(wrapper.exists()).toBe(true)
            })
        })
    })

    it('applies size classes correctly', () => {
        const wrapperSm = mount(Button, { props: { size: 'sm' } })
        expect(wrapperSm.classes()).toContain('h-9')

        const wrapperLg = mount(Button, { props: { size: 'lg' } })
        expect(wrapperLg.classes()).toContain('h-11')

        const wrapperIcon = mount(Button, { props: { size: 'icon' } })
        expect(wrapperIcon.classes()).toContain('w-10')
    })

    it('applies disabled styles consistently', () => {
        const wrapper = mount(Button, { props: { disabled: true } })
        // disabled:opacity-50 e disabled:pointer-events-none são pseudo-classes
        // Verificamos que as classes base estão presentes (aplicadas via CVA)
        expect(wrapper.classes()).toContain('disabled:opacity-50')
        expect(wrapper.classes()).toContain('disabled:pointer-events-none')
        // Verificamos que o atributo HTML disabled está presente
        expect(wrapper.attributes('disabled')).toBe('')
    })

    it('renders default variant when no variant specified', () => {
        const wrapper = mount(Button)
        expect(wrapper.classes()).toContain('bg-primary')
    })
})
