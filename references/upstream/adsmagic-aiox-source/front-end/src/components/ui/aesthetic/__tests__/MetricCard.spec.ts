import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricCard from '../MetricCard.vue'

describe('MetricCard', () => {
    describe('Rendering', () => {
        it('renders with required props', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                },
            })

            expect(wrapper.text()).toContain('Revenue')
            expect(wrapper.text()).toContain('R$45.2K')
        })

        it('renders with numeric value', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Users',
                    value: 1234,
                },
            })

            expect(wrapper.text()).toContain('1234')
        })
    })

    describe('Trend Calculation', () => {
        it('shows up trend for positive change', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    change: 12.5,
                },
            })

            expect(wrapper.text()).toContain('↑ 12.5%')
            expect(wrapper.html()).toContain('text-green-600')
        })

        it('shows down trend for negative change', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    change: -8.3,
                },
            })

            expect(wrapper.text()).toContain('↓ 8.3%')
            expect(wrapper.html()).toContain('text-red-600')
        })

        it('shows neutral for zero change', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    change: 0,
                },
            })

            expect(wrapper.text()).not.toContain('↑')
            expect(wrapper.text()).not.toContain('↓')
            expect(wrapper.html()).toContain('text-gray-600')
        })

        it('respects manual trend override', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    change: 12.5,
                    trend: 'down',
                },
            })

            expect(wrapper.html()).toContain('text-red-600')
        })

        it('does not show trend when change is undefined', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                },
            })

            expect(wrapper.text()).not.toContain('↑')
            expect(wrapper.text()).not.toContain('↓')
            expect(wrapper.text()).not.toContain('%')
        })
    })

    describe('Variants', () => {
        it('applies default variant', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    variant: 'default',
                },
            })

            expect(wrapper.html()).toContain('bg-white')
            expect(wrapper.html()).toContain('dark:bg-gray-950')
        })

        it('applies secondary variant', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    variant: 'secondary',
                },
            })

            expect(wrapper.html()).toContain('bg-gray-50')
            expect(wrapper.html()).toContain('dark:bg-gray-900')
        })
    })

    describe('Dark Mode', () => {
        it('applies dark mode classes', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    change: 12.5,
                },
            })

            // Verify dark mode classes are present in HTML
            const html = wrapper.html()
            expect(html).toContain('dark:bg-gray-950')
            expect(html).toContain('dark:text-white')
            expect(html).toContain('dark:text-gray-400')
            expect(html).toContain('dark:text-green-400')
        })
    })

    describe('Custom Classes', () => {
        it('merges custom classes', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    class: 'shadow-lg hover:shadow-xl',
                },
            })

            expect(wrapper.html()).toContain('shadow-lg')
            expect(wrapper.html()).toContain('hover:shadow-xl')
        })
    })

    describe('Accessibility', () => {
        it('has semantic HTML structure', () => {
            const wrapper = mount(MetricCard, {
                props: {
                    label: 'Revenue',
                    value: 'R$45.2K',
                    change: 12.5,
                },
            })

            // Verify structure
            expect(wrapper.find('div.space-y-2').exists()).toBe(true)
            expect(wrapper.find('p.text-sm').text()).toBe('Revenue')
            expect(wrapper.find('p.text-2xl').text()).toBe('R$45.2K')
        })
    })
})
