import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChartCard from '../ChartCard.vue'

describe('ChartCard', () => {
    describe('Rendering', () => {
        it('renders with required props', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                },
            })

            expect(wrapper.text()).toContain('Revenue Chart')
        })

        it('renders subtitle when provided', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    subtitle: 'Last 30 days',
                },
            })

            expect(wrapper.text()).toContain('Last 30 days')
        })

        it('renders slot content when not loading', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    loading: false,
                },
                slots: {
                    default: '<div class="chart-content">Chart goes here</div>',
                },
            })

            expect(wrapper.text()).toContain('Chart goes here')
            expect(wrapper.find('.chart-content').exists()).toBe(true)
        })

        it('renders footer slot when provided', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                },
                slots: {
                    footer: '<p class="footer-text">Footer content</p>',
                },
            })

            expect(wrapper.find('.footer-text').exists()).toBe(true)
            expect(wrapper.text()).toContain('Footer content')
        })
    })

    describe('Loading State', () => {
        it('shows skeleton when loading', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    loading: true,
                },
                slots: {
                    default: '<div>Content</div>',
                },
            })

            expect(wrapper.find('.animate-pulse').exists()).toBe(true)
            expect(wrapper.text()).not.toContain('Content')
        })

        it('hides skeleton when not loading', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    loading: false,
                },
            })

            expect(wrapper.find('.animate-pulse').exists()).toBe(false)
        })

        it('transitions from loading to content', async () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    loading: true,
                },
                slots: {
                    default: '<div class="chart">Chart</div>',
                },
            })

            expect(wrapper.find('.animate-pulse').exists()).toBe(true)
            expect(wrapper.find('.chart').exists()).toBe(false)

            await wrapper.setProps({ loading: false })

            expect(wrapper.find('.animate-pulse').exists()).toBe(false)
            expect(wrapper.find('.chart').exists()).toBe(true)
        })
    })

    describe('Action Button', () => {
        it('renders action button when actionLabel provided', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    actionLabel: 'View Details',
                },
            })

            const button = wrapper.find('button')
            expect(button.exists()).toBe(true)
            expect(button.text()).toBe('View Details')
        })

        it('does not render action button when actionLabel not provided', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                },
            })

            expect(wrapper.find('button').exists()).toBe(false)
        })

        it('emits action event when button clicked', async () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    actionLabel: 'View Details',
                },
            })

            await wrapper.find('button').trigger('click')

            expect(wrapper.emitted('action')).toBeTruthy()
            expect(wrapper.emitted('action')).toHaveLength(1)
        })
    })

    describe('Responsive Behavior', () => {
        it('applies responsive classes to header', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart with Very Long Title That Should Truncate',
                },
            })

            const title = wrapper.find('h3')
            expect(title.classes()).toContain('truncate')
            expect(title.classes()).toContain('sm:text-xl')
        })

        it('applies responsive flex layout', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    actionLabel: 'View Details',
                },
            })

            const header = wrapper.find('div.mb-4')
            expect(header.classes()).toContain('flex-col')
            expect(header.classes()).toContain('sm:flex-row')
            expect(header.classes()).toContain('sm:items-center')
        })
    })

    describe('Variants', () => {
        it('applies default variant', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    variant: 'default',
                },
            })

            expect(wrapper.html()).toContain('bg-white')
            expect(wrapper.html()).toContain('dark:bg-gray-950')
        })

        it('applies outlined variant', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    variant: 'outlined',
                },
            })

            expect(wrapper.html()).toContain('bg-transparent')
            expect(wrapper.html()).toContain('border-gray-300')
        })
    })

    describe('Dark Mode', () => {
        it('applies dark mode classes', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    subtitle: 'Subtitle',
                },
            })

            const html = wrapper.html()
            expect(html).toContain('dark:bg-gray-950')
            expect(html).toContain('dark:text-white')
            expect(html).toContain('dark:text-gray-400')
            // dark:bg-gray-800 only appears in skeleton (loading state)
            expect(html).toContain('dark:border-gray-800')
        })
    })

    describe('Custom Classes', () => {
        it('merges custom classes', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    class: 'shadow-2xl custom-class',
                },
            })

            expect(wrapper.html()).toContain('shadow-2xl')
            expect(wrapper.html()).toContain('custom-class')
        })
    })

    describe('Accessibility', () => {
        it('uses semantic heading for title', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                },
            })

            expect(wrapper.find('h3').exists()).toBe(true)
        })

        it('action button has proper focus styles', () => {
            const wrapper = mount(ChartCard, {
                props: {
                    title: 'Revenue Chart',
                    actionLabel: 'View Details',
                },
            })

            const button = wrapper.find('button')
            expect(button.classes()).toContain('focus:ring-2')
            expect(button.classes()).toContain('focus:ring-primary')
        })
    })
})
