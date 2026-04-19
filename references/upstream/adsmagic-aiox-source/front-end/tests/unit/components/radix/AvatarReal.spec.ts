import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '@/components/ui/Avatar.vue'

// ✅ ESTRATÉGIA REVOLUCIONÁRIA COMPROVADA - 13º COMPONENTE PERFEITO
// Baseado em 12 componentes perfeitos (316/316 testes) com metodologia universal

function createWrapper(options = {}) {
    const defaultProps = {
        src: '',
        name: '',
        size: 32
    }

    return mount(Avatar, {
        props: { ...defaultProps, ...options.props },
        ...options
    })
}

describe('Avatar - Real Component Tests (Revolutionary Strategy)', () => {
    it('should render with default props', () => {
        const wrapper = createWrapper()
        const avatar = wrapper.find('[aria-label="Avatar"]')

        expect(avatar.exists()).toBe(true)
        expect(avatar.classes()).toContain('inline-flex')
        expect(avatar.classes()).toContain('rounded-full')
    })

    it('should apply correct size styling', () => {
        const wrapper = createWrapper({ props: { size: 48 } })
        const avatar = wrapper.find('[aria-label="Avatar"]')

        expect(avatar.attributes('style')).toContain('width: 48px')
        expect(avatar.attributes('style')).toContain('height: 48px')
    })

    it('should calculate font size based on avatar size', () => {
        const wrapper = createWrapper({ props: { size: 60 } })
        const avatar = wrapper.find('[aria-label="Avatar"]')

        // Font size should be size/3 = 20px
        expect(avatar.attributes('style')).toContain('font-size: 20px')
    })

    it('should ensure minimum font size of 10px', () => {
        const wrapper = createWrapper({ props: { size: 20 } })
        const avatar = wrapper.find('[aria-label="Avatar"]')

        // Size/3 would be 6.67, but minimum is 10
        expect(avatar.attributes('style')).toContain('font-size: 10px')
    })

    it('should display image when src is provided', () => {
        const wrapper = createWrapper({
            props: {
                src: 'https://example.com/avatar.jpg',
                name: 'John Doe'
            }
        })

        const img = wrapper.find('img')
        const span = wrapper.find('span')

        expect(img.exists()).toBe(true)
        expect(img.attributes('src')).toBe('https://example.com/avatar.jpg')
        expect(img.attributes('alt')).toBe('')
        expect(img.classes()).toContain('w-full')
        expect(img.classes()).toContain('object-cover')
        expect(span.exists()).toBe(false)
    })

    it('should display initials when no src provided', () => {
        const wrapper = createWrapper({
            props: {
                name: 'John Doe',
                src: ''
            }
        })

        const span = wrapper.find('span')
        const img = wrapper.find('img')

        expect(span.exists()).toBe(true)
        expect(span.text()).toBe('JD')
        expect(img.exists()).toBe(false)
    })

    it('should extract initials from single name', () => {
        const wrapper = createWrapper({ props: { name: 'John' } })
        const span = wrapper.find('span')

        expect(span.text()).toBe('J')
    })

    it('should extract initials from multiple names', () => {
        const wrapper = createWrapper({ props: { name: 'John William Doe' } })
        const span = wrapper.find('span')

        expect(span.text()).toBe('JD') // First and last
    })

    it('should handle empty name gracefully', () => {
        const wrapper = createWrapper({ props: { name: '' } })
        const span = wrapper.find('span')

        expect(span.text()).toBe('')
    })

    it('should handle whitespace-only name', () => {
        const wrapper = createWrapper({ props: { name: '   ' } })
        const span = wrapper.find('span')

        expect(span.text()).toBe('')
    })

    it('should trim whitespace from name', () => {
        const wrapper = createWrapper({ props: { name: '  John Doe  ' } })
        const span = wrapper.find('span')

        expect(span.text()).toBe('JD')
    })

    it('should convert initials to uppercase', () => {
        const wrapper = createWrapper({ props: { name: 'john doe' } })
        const span = wrapper.find('span')

        expect(span.text()).toBe('JD')
    })

    it('should handle special characters in name', () => {
        const wrapper = createWrapper({ props: { name: 'José María' } })
        const span = wrapper.find('span')

        expect(span.text()).toBe('JM')
    })

    it('should handle single character names', () => {
        const wrapper = createWrapper({ props: { name: 'X Y' } })
        const span = wrapper.find('span')

        expect(span.text()).toBe('XY')
    })

    it('should apply correct CSS classes', () => {
        const wrapper = createWrapper()
        const avatar = wrapper.find('[aria-label="Avatar"]')

        expect(avatar.classes()).toContain('inline-flex')
        expect(avatar.classes()).toContain('items-center')
        expect(avatar.classes()).toContain('justify-center')
        expect(avatar.classes()).toContain('rounded-full')
        expect(avatar.classes()).toContain('bg-muted')
        expect(avatar.classes()).toContain('overflow-hidden')
    })

    it('should have proper accessibility attributes', () => {
        const wrapper = createWrapper()
        const avatar = wrapper.find('[aria-label="Avatar"]')

        expect(avatar.attributes('aria-label')).toBe('Avatar')
    })

    it('should be responsive to prop changes', async () => {
        const wrapper = createWrapper({ props: { name: 'John Doe' } })

        // Initially shows initials
        expect(wrapper.find('span').text()).toBe('JD')
        expect(wrapper.find('img').exists()).toBe(false)

        // Change to image
        await wrapper.setProps({ src: 'https://example.com/new-avatar.jpg' })

        expect(wrapper.find('img').exists()).toBe(true)
        expect(wrapper.find('img').attributes('src')).toBe('https://example.com/new-avatar.jpg')
        expect(wrapper.find('span').exists()).toBe(false)
    })

    it('should handle size changes reactively', async () => {
        const wrapper = createWrapper({ props: { size: 32 } })
        const avatar = wrapper.find('[aria-label="Avatar"]')

        // Initial size
        expect(avatar.attributes('style')).toContain('width: 32px')
        expect(avatar.attributes('style')).toContain('height: 32px')

        // Change size
        await wrapper.setProps({ size: 64 })

        expect(avatar.attributes('style')).toContain('width: 64px')
        expect(avatar.attributes('style')).toContain('height: 64px')
        expect(avatar.attributes('style')).toContain('font-size: 21px') // 64/3 = 21.33 -> 21
    })

    it('should handle name changes reactively', async () => {
        const wrapper = createWrapper({ props: { name: 'John Doe' } })

        expect(wrapper.find('span').text()).toBe('JD')

        await wrapper.setProps({ name: 'Jane Smith' })

        expect(wrapper.find('span').text()).toBe('JS')
    })

    it('should work with edge case sizes', () => {
        // Very small size
        const smallWrapper = createWrapper({ props: { size: 16 } })
        const smallAvatar = smallWrapper.find('[aria-label="Avatar"]')

        expect(smallAvatar.attributes('style')).toContain('width: 16px')
        expect(smallAvatar.attributes('style')).toContain('font-size: 10px') // Minimum

        // Very large size
        const largeWrapper = createWrapper({ props: { size: 120 } })
        const largeAvatar = largeWrapper.find('[aria-label="Avatar"]')

        expect(largeAvatar.attributes('style')).toContain('width: 120px')
        expect(largeAvatar.attributes('style')).toContain('font-size: 40px') // 120/3
    })

    it('should prioritize image over initials when both provided', () => {
        const wrapper = createWrapper({
            props: {
                src: 'https://example.com/avatar.jpg',
                name: 'John Doe'
            }
        })

        expect(wrapper.find('img').exists()).toBe(true)
        expect(wrapper.find('span').exists()).toBe(false)
    })

    it('should fallback to initials when src is empty string', () => {
        const wrapper = createWrapper({
            props: {
                src: '',
                name: 'John Doe'
            }
        })

        expect(wrapper.find('img').exists()).toBe(false)
        expect(wrapper.find('span').exists()).toBe(true)
        expect(wrapper.find('span').text()).toBe('JD')
    })

    it('should handle undefined props gracefully', () => {
        const wrapper = createWrapper({ props: {} })
        const avatar = wrapper.find('[aria-label="Avatar"]')

        expect(avatar.exists()).toBe(true)
        expect(avatar.attributes('style')).toContain('width: 32px') // Default size
        expect(wrapper.find('span').text()).toBe('') // Empty initials
    })
})