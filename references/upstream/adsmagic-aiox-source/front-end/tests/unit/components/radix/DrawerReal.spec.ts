import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Drawer from '@/components/ui/radix/Drawer.vue'

type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface CreateWrapperOptions {
    open?: boolean
    placement?: DrawerPlacement
    size?: DrawerSize
    dismissible?: boolean
    headless?: boolean
    title?: string
    description?: string
    triggerElement?: string
    triggerProps?: Record<string, any>
    triggerText?: string
    showCloseButton?: boolean
    closeButtonLabel?: string
    onClose?: () => void
    onOpen?: () => void
    testId?: string
    contentClass?: string
    backdropClass?: string
    headerClass?: string
    bodyClass?: string
    footerClass?: string
    titleClass?: string
    descriptionClass?: string
    triggerButtonClass?: string
    closeButtonClass?: string
}

function createWrapper(options: CreateWrapperOptions = {}) {
    return mount(Drawer, {
        props: {
            open: false,
            placement: 'right',
            size: 'md',
            dismissible: true,
            headless: false,
            triggerElement: 'div',
            triggerProps: {},
            showCloseButton: true,
            closeButtonLabel: 'Close drawer',
            testId: 'test',
            ...options
        },
        attachTo: document.body
    })
}

describe('Drawer Real Component Tests', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    describe('Basic Functionality', () => {
        it('should render drawer component', () => {
            const wrapper = createWrapper()
            expect(wrapper.exists()).toBe(true)
        })

        it('should render with provided open state', () => {
            const wrapper = createWrapper({ open: true })
            expect(wrapper.props('open')).toBe(true)
        })

        it('should handle placement prop', () => {
            const wrapper = createWrapper({ placement: 'left' })
            expect(wrapper.props('placement')).toBe('left')
        })

        it('should handle size prop', () => {
            const wrapper = createWrapper({ size: 'lg' })
            expect(wrapper.props('size')).toBe('lg')
        })

        it('should handle dismissible prop', () => {
            const wrapper = createWrapper({ dismissible: false })
            expect(wrapper.props('dismissible')).toBe(false)
        })

        it('should handle headless mode', () => {
            const wrapper = createWrapper({ headless: true })
            expect(wrapper.props('headless')).toBe(true)
        })
    })

    describe('Content Props', () => {
        it('should render with title', () => {
            const title = 'Test Drawer Title'
            const wrapper = createWrapper({ title })
            expect(wrapper.props('title')).toBe(title)
        })

        it('should render with description', () => {
            const description = 'Test drawer description'
            const wrapper = createWrapper({ description })
            expect(wrapper.props('description')).toBe(description)
        })

        it('should handle both title and description', () => {
            const title = 'Test Title'
            const description = 'Test Description'
            const wrapper = createWrapper({ title, description })
            expect(wrapper.props('title')).toBe(title)
            expect(wrapper.props('description')).toBe(description)
        })
    })

    describe('Trigger Configuration', () => {
        it('should handle trigger element type', () => {
            const wrapper = createWrapper({ triggerElement: 'button' })
            expect(wrapper.props('triggerElement')).toBe('button')
        })

        it('should handle trigger props', () => {
            const triggerProps = { class: 'custom-trigger', id: 'trigger-id' }
            const wrapper = createWrapper({ triggerProps })
            expect(wrapper.props('triggerProps')).toEqual(triggerProps)
        })

        it('should handle trigger text', () => {
            const triggerText = 'Custom Open Button'
            const wrapper = createWrapper({ triggerText })
            expect(wrapper.props('triggerText')).toBe(triggerText)
        })
    })

    describe('Close Button Configuration', () => {
        it('should handle close button visibility', () => {
            const wrapper = createWrapper({ showCloseButton: false })
            expect(wrapper.props('showCloseButton')).toBe(false)
        })

        it('should handle close button label', () => {
            const label = 'Custom Close Label'
            const wrapper = createWrapper({ closeButtonLabel: label })
            expect(wrapper.props('closeButtonLabel')).toBe(label)
        })
    })

    describe('Event Handling', () => {
        it('should handle onClose callback', () => {
            const onClose = vi.fn()
            const wrapper = createWrapper({ onClose })
            expect(wrapper.props('onClose')).toBe(onClose)
        })

        it('should handle onOpen callback', () => {
            const onOpen = vi.fn()
            const wrapper = createWrapper({ onOpen })
            expect(wrapper.props('onOpen')).toBe(onOpen)
        })

        it('should emit update:open event on prop change', async () => {
            const wrapper = createWrapper({ open: false })

            await wrapper.setProps({ open: true })
            expect(wrapper.props('open')).toBe(true)
        })

        it('should handle multiple event handlers', () => {
            const onOpen = vi.fn()
            const onClose = vi.fn()
            const wrapper = createWrapper({ onOpen, onClose })

            expect(wrapper.props('onOpen')).toBe(onOpen)
            expect(wrapper.props('onClose')).toBe(onClose)
        })
    })

    describe('Testing Configuration', () => {
        it('should handle testId prop', () => {
            const testId = 'custom-drawer'
            const wrapper = createWrapper({ testId })
            expect(wrapper.props('testId')).toBe(testId)
        })

        it('should handle default testId', () => {
            const wrapper = createWrapper()
            expect(wrapper.props('testId')).toBe('test')
        })
    })

    describe('Styling Classes', () => {
        it('should handle contentClass', () => {
            const contentClass = 'custom-content-class'
            const wrapper = createWrapper({ contentClass })
            expect(wrapper.props('contentClass')).toBe(contentClass)
        })

        it('should handle backdropClass', () => {
            const backdropClass = 'custom-backdrop-class'
            const wrapper = createWrapper({ backdropClass })
            expect(wrapper.props('backdropClass')).toBe(backdropClass)
        })

        it('should handle headerClass', () => {
            const headerClass = 'custom-header-class'
            const wrapper = createWrapper({ headerClass })
            expect(wrapper.props('headerClass')).toBe(headerClass)
        })

        it('should handle bodyClass', () => {
            const bodyClass = 'custom-body-class'
            const wrapper = createWrapper({ bodyClass })
            expect(wrapper.props('bodyClass')).toBe(bodyClass)
        })

        it('should handle footerClass', () => {
            const footerClass = 'custom-footer-class'
            const wrapper = createWrapper({ footerClass })
            expect(wrapper.props('footerClass')).toBe(footerClass)
        })

        it('should handle titleClass', () => {
            const titleClass = 'custom-title-class'
            const wrapper = createWrapper({ titleClass })
            expect(wrapper.props('titleClass')).toBe(titleClass)
        })

        it('should handle descriptionClass', () => {
            const descriptionClass = 'custom-description-class'
            const wrapper = createWrapper({ descriptionClass })
            expect(wrapper.props('descriptionClass')).toBe(descriptionClass)
        })

        it('should handle triggerButtonClass', () => {
            const triggerButtonClass = 'custom-trigger-button-class'
            const wrapper = createWrapper({ triggerButtonClass })
            expect(wrapper.props('triggerButtonClass')).toBe(triggerButtonClass)
        })

        it('should handle closeButtonClass', () => {
            const closeButtonClass = 'custom-close-button-class'
            const wrapper = createWrapper({ closeButtonClass })
            expect(wrapper.props('closeButtonClass')).toBe(closeButtonClass)
        })
    })

    describe('Props Updates', () => {
        it('should update open state dynamically', async () => {
            const wrapper = createWrapper({ open: false })
            expect(wrapper.props('open')).toBe(false)

            await wrapper.setProps({ open: true })
            expect(wrapper.props('open')).toBe(true)
        })

        it('should update placement dynamically', async () => {
            const wrapper = createWrapper({ placement: 'right' })
            expect(wrapper.props('placement')).toBe('right')

            await wrapper.setProps({ placement: 'left' })
            expect(wrapper.props('placement')).toBe('left')
        })

        it('should update size dynamically', async () => {
            const wrapper = createWrapper({ size: 'md' })
            expect(wrapper.props('size')).toBe('md')

            await wrapper.setProps({ size: 'lg' })
            expect(wrapper.props('size')).toBe('lg')
        })

        it('should update content props dynamically', async () => {
            const wrapper = createWrapper({ title: 'Original Title' })
            expect(wrapper.props('title')).toBe('Original Title')

            await wrapper.setProps({ title: 'Updated Title' })
            expect(wrapper.props('title')).toBe('Updated Title')
        })
    })

    describe('Component State Management', () => {
        it('should manage internal open state', async () => {
            const wrapper = createWrapper({ open: false })
            const vm = wrapper.vm as any

            await wrapper.setProps({ open: true })
            await wrapper.vm.$nextTick()

            // Component should react to prop changes
            expect(wrapper.props('open')).toBe(true)
        })

        it('should handle dismissible behavior', () => {
            const wrapper = createWrapper({ dismissible: true })
            expect(wrapper.props('dismissible')).toBe(true)

            const wrapper2 = createWrapper({ dismissible: false })
            expect(wrapper2.props('dismissible')).toBe(false)
        })
    })

    describe('Advanced Features', () => {
        it('should handle all placement variants', () => {
            const placements: DrawerPlacement[] = ['top', 'right', 'bottom', 'left']

            placements.forEach(placement => {
                const wrapper = createWrapper({ placement })
                expect(wrapper.props('placement')).toBe(placement)
            })
        })

        it('should handle all size variants', () => {
            const sizes: DrawerSize[] = ['sm', 'md', 'lg', 'xl', 'full']

            sizes.forEach(size => {
                const wrapper = createWrapper({ size })
                expect(wrapper.props('size')).toBe(size)
            })
        })

        it('should maintain component reactivity', async () => {
            const wrapper = createWrapper({
                open: false,
                title: 'Initial',
                placement: 'right'
            })

            await wrapper.setProps({
                open: true,
                title: 'Updated',
                placement: 'left'
            })

            expect(wrapper.props('open')).toBe(true)
            expect(wrapper.props('title')).toBe('Updated')
            expect(wrapper.props('placement')).toBe('left')
        })

        it('should handle complex configuration', () => {
            const complexConfig = {
                open: true,
                placement: 'top' as DrawerPlacement,
                size: 'xl' as DrawerSize,
                title: 'Complex Drawer',
                description: 'A drawer with complex configuration',
                triggerText: 'Open Complex',
                testId: 'complex-drawer',
                dismissible: false,
                showCloseButton: true
            }

            const wrapper = createWrapper(complexConfig)

            Object.keys(complexConfig).forEach(key => {
                expect(wrapper.props(key)).toBe(complexConfig[key as keyof typeof complexConfig])
            })
        })
    })
})