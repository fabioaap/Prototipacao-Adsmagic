import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '@/components/ui/Card.vue'

describe('Card (CVA)', () => {
    const variants = ['default', 'outlined', 'elevated'] as const

    it('renders outlined/elevated/default variants', () => {
        variants.forEach(variant => {
            const wrapper = mount(Card, {
                props: { variant },
                slots: { default: 'Content' }
            })
            expect(wrapper.exists()).toBe(true)
        })
    })

    it('applies variant classes correctly', () => {
        const wrapperDefault = mount(Card, { props: { variant: 'default' } })
        expect(wrapperDefault.classes()).toContain('shadow-card')

        const wrapperOutlined = mount(Card, { props: { variant: 'outlined' } })
        expect(wrapperOutlined.classes()).toContain('border-2')

        const wrapperElevated = mount(Card, { props: { variant: 'elevated' } })
        expect(wrapperElevated.classes()).toContain('shadow-2xl')
    })

    it('renders as different HTML elements', () => {
        const wrapperDiv = mount(Card, { props: { as: 'div' } })
        expect(wrapperDiv.element.tagName).toBe('DIV')

        const wrapperSection = mount(Card, { props: { as: 'section' } })
        expect(wrapperSection.element.tagName).toBe('SECTION')
    })
})
