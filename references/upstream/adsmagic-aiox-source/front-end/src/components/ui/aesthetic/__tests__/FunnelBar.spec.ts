import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FunnelBar from '../FunnelBar.vue'

describe('FunnelBar', () => {
    const mockSteps = [
        { label: 'Visitors', count: 1000 },
        { label: 'Signups', count: 500 },
        { label: 'Conversions', count: 100 },
    ]

    describe('Rendering', () => {
        it('renders all steps', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                },
            })

            expect(wrapper.text()).toContain('Visitors')
            expect(wrapper.text()).toContain('Signups')
            expect(wrapper.text()).toContain('Conversions')
        })

        it('renders step counts', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                },
            })

            expect(wrapper.text()).toContain('1,000')
            expect(wrapper.text()).toContain('500')
            expect(wrapper.text()).toContain('100')
        })

        it('renders empty state when no steps', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: [],
                },
            })

            expect(wrapper.text()).toContain('Nenhum dado disponível')
        })
    })

    describe('Percentage Calculation', () => {
        it('calculates percentage based on first step', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                },
            })

            // First step: 1000/1000 = 100%
            expect(wrapper.text()).toContain('100%')

            // Second step: 500/1000 = 50%
            expect(wrapper.text()).toContain('50%')

            // Third step: 100/1000 = 10%
            expect(wrapper.text()).toContain('10%')
        })

        it('handles zero counts gracefully', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: [
                        { label: 'Step 1', count: 100 },
                        { label: 'Step 2', count: 0 },
                    ],
                },
            })

            expect(wrapper.text()).toContain('0%')
        })

        it('rounds percentages to whole numbers', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: [
                        { label: 'Step 1', count: 100 },
                        { label: 'Step 2', count: 33 }, // 33% (33/100)
                    ],
                },
            })

            expect(wrapper.text()).toContain('33%')
        })
    })

    describe('Bar Width', () => {
        it('sets bar width based on percentage', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                },
            })

            const bars = wrapper.findAll('.h-full.rounded.bg-primary')

            const firstBar = bars[0]
            expect(firstBar).toBeDefined()
            expect(firstBar?.attributes('style')).toContain('width: 100%')

            const secondBar = bars[1]
            expect(secondBar).toBeDefined()
            expect(secondBar?.attributes('style')).toContain('width: 50%')

            const thirdBar = bars[2]
            expect(thirdBar).toBeDefined()
            expect(thirdBar?.attributes('style')).toContain('width: 10%')
        })
    })

    describe('Variants', () => {
        it('applies default variant', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                    variant: 'default',
                },
            })

            expect(wrapper.classes()).toContain('space-y-3')
        })

        it('applies compact variant', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                    variant: 'compact',
                },
            })

            expect(wrapper.classes()).toContain('space-y-2')
        })
    })

    describe('Dark Mode', () => {
        it('applies dark mode classes', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                },
            })

            const html = wrapper.html()
            expect(html).toContain('dark:text-gray-300')
            expect(html).toContain('dark:bg-gray-800')
            expect(html).toContain('dark:text-white')
            expect(html).toContain('dark:bg-primary-foreground')
        })
    })

    describe('Accessibility', () => {
        it('has proper structure for screen readers', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                },
            })

            // Each step has label, bar, and count
            const items = wrapper.findAll('.flex.items-center.gap-3')
            expect(items).toHaveLength(3)
        })

        it('displays readable count with locale formatting', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: [{ label: 'Big Number', count: 1234567 }],
                },
            })

            expect(wrapper.text()).toContain('1,234,567')
        })
    })

    describe('Responsive Behavior', () => {
        it('has fixed min-widths for labels and counts', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                },
            })

            const labels = wrapper.findAll('.min-w-\\[120px\\]')
            expect(labels.length).toBeGreaterThan(0)

            const counts = wrapper.findAll('.min-w-\\[60px\\]')
            expect(counts.length).toBeGreaterThan(0)
        })
    })

    describe('Custom Classes', () => {
        it('merges custom classes', () => {
            const wrapper = mount(FunnelBar, {
                props: {
                    steps: mockSteps,
                    class: 'p-4 bg-white',
                },
            })

            expect(wrapper.classes()).toContain('p-4')
            expect(wrapper.classes()).toContain('bg-white')
        })
    })
})
