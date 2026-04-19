import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatGrid from '../StatGrid.vue'

describe('StatGrid', () => {
    describe('Rendering', () => {
        it('renders slot content', () => {
            const wrapper = mount(StatGrid, {
                slots: {
                    default: '<div class="item">Item 1</div><div class="item">Item 2</div>',
                },
            })

            expect(wrapper.findAll('.item')).toHaveLength(2)
            expect(wrapper.text()).toContain('Item 1')
            expect(wrapper.text()).toContain('Item 2')
        })

        it('applies grid classes', () => {
            const wrapper = mount(StatGrid)

            expect(wrapper.classes()).toContain('grid')
            expect(wrapper.classes()).toContain('w-full')
        })
    })

    describe('Gap Variants', () => {
        it('applies sm gap', () => {
            const wrapper = mount(StatGrid, {
                props: {
                    gap: 'sm',
                },
            })

            expect(wrapper.classes()).toContain('gap-2')
        })

        it('applies md gap (default)', () => {
            const wrapper = mount(StatGrid)

            expect(wrapper.classes()).toContain('gap-4')
        })

        it('applies lg gap', () => {
            const wrapper = mount(StatGrid, {
                props: {
                    gap: 'lg',
                },
            })

            expect(wrapper.classes()).toContain('gap-6')
        })
    })

    describe('Column Variants', () => {
        it('applies responsive columns (default)', () => {
            const wrapper = mount(StatGrid)

            expect(wrapper.classes()).toContain('grid-cols-1')
            expect(wrapper.classes()).toContain('md:grid-cols-2')
            expect(wrapper.classes()).toContain('lg:grid-cols-4')
        })

        it('applies fixed 2 columns', () => {
            const wrapper = mount(StatGrid, {
                props: {
                    cols: 'fixed2',
                },
            })

            expect(wrapper.classes()).toContain('grid-cols-2')
            expect(wrapper.classes()).not.toContain('md:grid-cols-2')
        })

        it('applies fixed 3 columns', () => {
            const wrapper = mount(StatGrid, {
                props: {
                    cols: 'fixed3',
                },
            })

            expect(wrapper.classes()).toContain('grid-cols-3')
        })

        it('applies fixed 4 columns', () => {
            const wrapper = mount(StatGrid, {
                props: {
                    cols: 'fixed4',
                },
            })

            expect(wrapper.classes()).toContain('grid-cols-4')
        })
    })

    describe('Responsive Behavior', () => {
        it('has mobile-first responsive columns', () => {
            const wrapper = mount(StatGrid, {
                props: {
                    cols: 'responsive',
                },
            })

            // Mobile: 1 column
            expect(wrapper.classes()).toContain('grid-cols-1')

            // Tablet: 2 columns (≥768px)
            expect(wrapper.classes()).toContain('md:grid-cols-2')

            // Desktop: 4 columns (≥1024px)
            expect(wrapper.classes()).toContain('lg:grid-cols-4')
        })

        it('does not have horizontal overflow with responsive grid', () => {
            const wrapper = mount(StatGrid, {
                props: {
                    cols: 'responsive',
                },
            })

            expect(wrapper.classes()).toContain('w-full')
            expect(wrapper.classes()).toContain('grid')
        })
    })

    describe('Custom Classes', () => {
        it('merges custom classes', () => {
            const wrapper = mount(StatGrid, {
                props: {
                    class: 'p-4 bg-gray-50',
                },
            })

            expect(wrapper.classes()).toContain('p-4')
            expect(wrapper.classes()).toContain('bg-gray-50')
        })
    })

    describe('Empty State', () => {
        it('renders without error when no items', () => {
            const wrapper = mount(StatGrid)

            expect(wrapper.exists()).toBe(true)
            expect(wrapper.text()).toBe('')
        })

        it('renders empty state message when provided', () => {
            const wrapper = mount(StatGrid, {
                slots: {
                    default: '<p class="empty">Nenhum dado disponível</p>',
                },
            })

            expect(wrapper.find('.empty').exists()).toBe(true)
            expect(wrapper.text()).toContain('Nenhum dado disponível')
        })
    })
})
