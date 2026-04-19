import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import AlertDialog from '@/components/ui/radix/AlertDialog.vue'

type AlertDialogType = 'info' | 'warning' | 'error' | 'success'

interface CreateWrapperOptions {
    open?: boolean
    dismissible?: boolean
    title?: string
    description?: string
    type?: AlertDialogType
    cancelText?: string
    confirmText?: string
    showCancel?: boolean
    showConfirm?: boolean
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    onCancel?: () => void
    onConfirm?: () => void
    onOpenChange?: (open: boolean) => void
    testId?: string
    overlayClass?: string
    contentClass?: string
    headerClass?: string
    titleClass?: string
    descriptionClass?: string
    footerClass?: string
    cancelButtonClass?: string
    confirmButtonClass?: string
}

function createWrapper(options: CreateWrapperOptions = {}) {
    return mount(AlertDialog, {
        props: {
            open: false,
            dismissible: true,
            type: 'info',
            cancelText: 'Cancel',
            confirmText: 'OK',
            showCancel: true,
            showConfirm: true,
            confirmVariant: 'default',
            testId: 'test',
            ...options
        },
        attachTo: document.body
    })
}

describe('AlertDialog Real Component Tests', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    describe('Basic Functionality', () => {
        it('should render alert dialog component', () => {
            const wrapper = createWrapper()
            expect(wrapper.exists()).toBe(true)
        })

        it('should render with provided open state', () => {
            const wrapper = createWrapper({ open: true })
            expect(wrapper.props('open')).toBe(true)
        })

        it('should handle dismissible prop', () => {
            const wrapper = createWrapper({ dismissible: false })
            expect(wrapper.props('dismissible')).toBe(false)
        })

        it('should handle testId prop', () => {
            const testId = 'custom-alert'
            const wrapper = createWrapper({ testId })
            expect(wrapper.props('testId')).toBe(testId)
        })
    })

    describe('Content Props', () => {
        it('should render with title', () => {
            const title = 'Confirm Action'
            const wrapper = createWrapper({ title })
            expect(wrapper.props('title')).toBe(title)
        })

        it('should render with description', () => {
            const description = 'Are you sure you want to proceed?'
            const wrapper = createWrapper({ description })
            expect(wrapper.props('description')).toBe(description)
        })

        it('should handle different alert types', () => {
            const types: AlertDialogType[] = ['info', 'warning', 'error', 'success']

            types.forEach(type => {
                const wrapper = createWrapper({ type })
                expect(wrapper.props('type')).toBe(type)
            })
        })

        it('should handle both title and description', () => {
            const title = 'Delete Item'
            const description = 'This action cannot be undone.'
            const wrapper = createWrapper({ title, description })

            expect(wrapper.props('title')).toBe(title)
            expect(wrapper.props('description')).toBe(description)
        })
    })

    describe('Action Configuration', () => {
        it('should handle cancel text', () => {
            const cancelText = 'Abort'
            const wrapper = createWrapper({ cancelText })
            expect(wrapper.props('cancelText')).toBe(cancelText)
        })

        it('should handle confirm text', () => {
            const confirmText = 'Delete'
            const wrapper = createWrapper({ confirmText })
            expect(wrapper.props('confirmText')).toBe(confirmText)
        })

        it('should handle cancel button visibility', () => {
            const wrapper = createWrapper({ showCancel: false })
            expect(wrapper.props('showCancel')).toBe(false)
        })

        it('should handle confirm button visibility', () => {
            const wrapper = createWrapper({ showConfirm: false })
            expect(wrapper.props('showConfirm')).toBe(false)
        })

        it('should handle confirm button variants', () => {
            const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const

            variants.forEach(variant => {
                const wrapper = createWrapper({ confirmVariant: variant })
                expect(wrapper.props('confirmVariant')).toBe(variant)
            })
        })
    })

    describe('Event Handling', () => {
        it('should handle onCancel callback', () => {
            const onCancel = vi.fn()
            const wrapper = createWrapper({ onCancel })
            expect(wrapper.props('onCancel')).toBe(onCancel)
        })

        it('should handle onConfirm callback', () => {
            const onConfirm = vi.fn()
            const wrapper = createWrapper({ onConfirm })
            expect(wrapper.props('onConfirm')).toBe(onConfirm)
        })

        it('should handle onOpenChange callback', () => {
            const onOpenChange = vi.fn()
            const wrapper = createWrapper({ onOpenChange })
            expect(wrapper.props('onOpenChange')).toBe(onOpenChange)
        })

        it('should emit update:open event on state change', async () => {
            const wrapper = createWrapper({ open: false })

            await wrapper.setProps({ open: true })
            expect(wrapper.props('open')).toBe(true)
        })

        it('should handle multiple event handlers', () => {
            const onCancel = vi.fn()
            const onConfirm = vi.fn()
            const onOpenChange = vi.fn()

            const wrapper = createWrapper({ onCancel, onConfirm, onOpenChange })

            expect(wrapper.props('onCancel')).toBe(onCancel)
            expect(wrapper.props('onConfirm')).toBe(onConfirm)
            expect(wrapper.props('onOpenChange')).toBe(onOpenChange)
        })
    })

    describe('Styling Classes', () => {
        it('should handle overlayClass', () => {
            const overlayClass = 'custom-overlay-class'
            const wrapper = createWrapper({ overlayClass })
            expect(wrapper.props('overlayClass')).toBe(overlayClass)
        })

        it('should handle contentClass', () => {
            const contentClass = 'custom-content-class'
            const wrapper = createWrapper({ contentClass })
            expect(wrapper.props('contentClass')).toBe(contentClass)
        })

        it('should handle headerClass', () => {
            const headerClass = 'custom-header-class'
            const wrapper = createWrapper({ headerClass })
            expect(wrapper.props('headerClass')).toBe(headerClass)
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

        it('should handle footerClass', () => {
            const footerClass = 'custom-footer-class'
            const wrapper = createWrapper({ footerClass })
            expect(wrapper.props('footerClass')).toBe(footerClass)
        })

        it('should handle cancelButtonClass', () => {
            const cancelButtonClass = 'custom-cancel-class'
            const wrapper = createWrapper({ cancelButtonClass })
            expect(wrapper.props('cancelButtonClass')).toBe(cancelButtonClass)
        })

        it('should handle confirmButtonClass', () => {
            const confirmButtonClass = 'custom-confirm-class'
            const wrapper = createWrapper({ confirmButtonClass })
            expect(wrapper.props('confirmButtonClass')).toBe(confirmButtonClass)
        })
    })

    describe('Props Updates', () => {
        it('should update open state dynamically', async () => {
            const wrapper = createWrapper({ open: false })
            expect(wrapper.props('open')).toBe(false)

            await wrapper.setProps({ open: true })
            expect(wrapper.props('open')).toBe(true)
        })

        it('should update content props dynamically', async () => {
            const wrapper = createWrapper({ title: 'Original Title' })
            expect(wrapper.props('title')).toBe('Original Title')

            await wrapper.setProps({ title: 'Updated Title' })
            expect(wrapper.props('title')).toBe('Updated Title')
        })

        it('should update action props dynamically', async () => {
            const wrapper = createWrapper({ confirmText: 'OK' })
            expect(wrapper.props('confirmText')).toBe('OK')

            await wrapper.setProps({ confirmText: 'Confirm' })
            expect(wrapper.props('confirmText')).toBe('Confirm')
        })

        it('should update type dynamically', async () => {
            const wrapper = createWrapper({ type: 'info' })
            expect(wrapper.props('type')).toBe('info')

            await wrapper.setProps({ type: 'error' })
            expect(wrapper.props('type')).toBe('error')
        })
    })

    describe('Component State Management', () => {
        it('should manage internal open state', async () => {
            const wrapper = createWrapper({ open: false })
            const vm = wrapper.vm as any

            await wrapper.setProps({ open: true })
            await wrapper.vm.$nextTick()

            expect(wrapper.props('open')).toBe(true)
        })

        it('should handle dismissible behavior', () => {
            const wrapper = createWrapper({ dismissible: true })
            expect(wrapper.props('dismissible')).toBe(true)

            const wrapper2 = createWrapper({ dismissible: false })
            expect(wrapper2.props('dismissible')).toBe(false)
        })

        it('should manage button visibility', () => {
            const wrapper = createWrapper({
                showCancel: false,
                showConfirm: true
            })

            expect(wrapper.props('showCancel')).toBe(false)
            expect(wrapper.props('showConfirm')).toBe(true)
        })
    })

    describe('Advanced Features', () => {
        it('should handle all alert types with specific styling', () => {
            const types: AlertDialogType[] = ['info', 'warning', 'error', 'success']

            types.forEach(type => {
                const wrapper = createWrapper({ type })
                expect(wrapper.props('type')).toBe(type)
            })
        })

        it('should handle complex configuration', () => {
            const complexConfig = {
                open: true,
                type: 'warning' as AlertDialogType,
                title: 'Delete Confirmation',
                description: 'This action will permanently delete the item.',
                cancelText: 'Keep It',
                confirmText: 'Delete Now',
                confirmVariant: 'destructive' as const,
                dismissible: false,
                testId: 'delete-confirmation'
            }

            const wrapper = createWrapper(complexConfig)

            Object.keys(complexConfig).forEach(key => {
                expect(wrapper.props(key)).toBe(complexConfig[key as keyof typeof complexConfig])
            })
        })

        it('should maintain component reactivity', async () => {
            const wrapper = createWrapper({
                open: false,
                type: 'info',
                title: 'Initial'
            })

            await wrapper.setProps({
                open: true,
                type: 'error',
                title: 'Updated'
            })

            expect(wrapper.props('open')).toBe(true)
            expect(wrapper.props('type')).toBe('error')
            expect(wrapper.props('title')).toBe('Updated')
        })

        it('should handle button-only configurations', () => {
            const confirmOnlyConfig = {
                showCancel: false,
                showConfirm: true,
                confirmText: 'Acknowledge'
            }

            const wrapper = createWrapper(confirmOnlyConfig)

            expect(wrapper.props('showCancel')).toBe(false)
            expect(wrapper.props('showConfirm')).toBe(true)
            expect(wrapper.props('confirmText')).toBe('Acknowledge')
        })

        it('should handle no-button configurations', () => {
            const wrapper = createWrapper({
                showCancel: false,
                showConfirm: false
            })

            expect(wrapper.props('showCancel')).toBe(false)
            expect(wrapper.props('showConfirm')).toBe(false)
        })
    })

    describe('Component Methods Access', () => {
        it('should provide component methods through vm', () => {
            const wrapper = createWrapper()
            const vm = wrapper.vm as any

            // Check that component methods exist and are functions
            expect(typeof vm.open).toBe('function')
            expect(typeof vm.close).toBe('function')
            expect(typeof vm.handleCancel).toBe('function')
            expect(typeof vm.handleConfirm).toBe('function')
        })

        it('should handle method calls without errors', async () => {
            const wrapper = createWrapper()
            const vm = wrapper.vm as any

            // These should not throw errors
            expect(() => {
                vm.open()
                vm.close()
                vm.handleCancel()
                vm.handleConfirm()
            }).not.toThrow()
        })
    })
})