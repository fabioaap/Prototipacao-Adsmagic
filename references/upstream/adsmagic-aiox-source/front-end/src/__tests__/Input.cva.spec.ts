import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '@/components/ui/Input.vue'

describe('Input (CVA)', () => {
    const variants = ['default', 'subtle', 'invalid'] as const
    const sizes = ['sm', 'md', 'lg'] as const

    it('renders 3 variants × 3 sizes matrix', () => {
        variants.forEach(variant => {
            sizes.forEach(size => {
                const wrapper = mount(Input, {
                    props: { variant, size }
                })
                expect(wrapper.exists()).toBe(true)
            })
        })
    })

    it('sets aria-invalid on invalid variant', () => {
        const wrapper = mount(Input, { props: { variant: 'invalid' } })
        expect(wrapper.attributes('aria-invalid')).toBe('true')
    })

    it('applies size classes correctly', () => {
        const wrapperSm = mount(Input, { props: { size: 'sm' } })
        expect(wrapperSm.classes()).toContain('h-9')

        const wrapperLg = mount(Input, { props: { size: 'lg' } })
        expect(wrapperLg.classes()).toContain('h-11')
    })

    it('emits update:modelValue on input', async () => {
        const wrapper = mount(Input, { props: { modelValue: '' } })
        const input = wrapper.find('input')

        await input.setValue('test')
        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test'])
    })
})
