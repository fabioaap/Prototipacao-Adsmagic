import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardSection from '../DashboardSection.vue'

describe('DashboardSection', () => {
    describe('Rendering', () => {
        it('renders with required props', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                },
            })

            expect(wrapper.text()).toContain('Revenue Overview')
            expect(wrapper.find('h2').exists()).toBe(true)
        })

        it('renders description when provided', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    description: 'Last 30 days performance',
                },
            })

            expect(wrapper.text()).toContain('Last 30 days performance')
        })

        it('renders default slot content', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                },
                slots: {
                    default: '<div class="content">Main content</div>',
                },
            })

            expect(wrapper.find('.content').exists()).toBe(true)
            expect(wrapper.text()).toContain('Main content')
        })

        it('renders footer slot when provided', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                },
                slots: {
                    footer: '<p class="footer-text">Footer</p>',
                },
            })

            expect(wrapper.find('.footer-text').exists()).toBe(true)
        })
    })

    describe('Action Button', () => {
        it('renders action button when actionLabel provided', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    actionLabel: 'View All',
                },
            })

            const button = wrapper.find('button')
            expect(button.exists()).toBe(true)
            expect(button.text()).toBe('View All')
        })

        it('does not render action button when actionLabel not provided', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                },
            })

            expect(wrapper.find('button').exists()).toBe(false)
        })

        it('emits action event when button clicked', async () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    actionLabel: 'View All',
                },
            })

            await wrapper.find('button').trigger('click')

            expect(wrapper.emitted('action')).toBeTruthy()
            expect(wrapper.emitted('action')).toHaveLength(1)
        })
    })

    describe('Variants', () => {
        it('applies default variant', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    variant: 'default',
                },
            })

            expect(wrapper.classes()).toContain('space-y-4')
            expect(wrapper.classes()).not.toContain('p-6')
        })

        it('applies padded variant', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    variant: 'padded',
                },
            })

            expect(wrapper.classes()).toContain('p-6')
        })

        it('applies bordered variant', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    variant: 'bordered',
                },
            })

            expect(wrapper.classes()).toContain('border')
            expect(wrapper.classes()).toContain('rounded-lg')
            expect(wrapper.classes()).toContain('p-6')
        })
    })

    describe('Responsive Behavior', () => {
        it('applies responsive header layout', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    actionLabel: 'View All',
                },
            })

            const header = wrapper.find('.flex')
            expect(header.classes()).toContain('flex-col')
            expect(header.classes()).toContain('sm:flex-row')
            expect(header.classes()).toContain('sm:items-center')
            expect(header.classes()).toContain('sm:justify-between')
        })

        it('applies responsive title sizing', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                },
            })

            const title = wrapper.find('h2')
            expect(title.classes()).toContain('text-xl')
            expect(title.classes()).toContain('sm:text-2xl')
        })
    })

    describe('Dark Mode', () => {
        it('applies dark mode classes', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    description: 'Description',
                },
            })

            const html = wrapper.html()
            expect(html).toContain('dark:text-white')
            expect(html).toContain('dark:text-gray-400')
            // Note: dark:border-gray-800 only appears in footer slot or bordered variant
        })
    })

    describe('Semantic HTML', () => {
        it('uses section element', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                },
            })

            expect(wrapper.element.tagName).toBe('SECTION')
        })

        it('uses h2 heading for title', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                },
            })

            expect(wrapper.find('h2').exists()).toBe(true)
        })
    })

    describe('Accessibility', () => {
        it('action button has proper focus styles', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    actionLabel: 'View All',
                },
            })

            const button = wrapper.find('button')
            expect(button.classes()).toContain('focus:ring-2')
            expect(button.classes()).toContain('focus:ring-primary')
        })
    })

    describe('Custom Classes', () => {
        it('merges custom classes', () => {
            const wrapper = mount(DashboardSection, {
                props: {
                    title: 'Revenue Overview',
                    class: 'mb-8 custom-section',
                },
            })

            expect(wrapper.classes()).toContain('mb-8')
            expect(wrapper.classes()).toContain('custom-section')
        })
    })
})
