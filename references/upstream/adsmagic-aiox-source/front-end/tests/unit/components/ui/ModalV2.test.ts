/**
 * Testes para ModalV2.vue
 * 
 * Valida funcionalidade do novo componente de modal padronizado
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModalV2 from '@/components/ui/ModalV2.vue'
import Button from '@/components/ui/Button.vue'

describe('ModalV2', () => {
    let wrapper: any

    beforeEach(() => {
        // Mock do Teleport
        global.document.body.innerHTML = ''
    })

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount()
        }
    })

    it('deve renderizar o modal quando modelValue for true', async () => {
        wrapper = mount(ModalV2, {
            props: {
                modelValue: true,
                title: 'Teste Modal',
            },
            global: {
                stubs: {
                    Teleport: {
                        template: '<div><slot /></div>',
                    },
                },
            },
        })

        await nextTick()

        expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('Teste Modal')
    })

    it('não deve renderizar o modal quando modelValue for false', () => {
        wrapper = mount(ModalV2, {
            props: {
                modelValue: false,
                title: 'Teste Modal',
            },
            global: {
                stubs: {
                    Teleport: {
                        template: '<div><slot /></div>',
                    },
                },
            },
        })

        expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    })

    it('deve emitir update:modelValue ao clicar no botão fechar', async () => {
        wrapper = mount(ModalV2, {
            props: {
                modelValue: true,
                title: 'Teste Modal',
                showCloseButton: true,
            },
            global: {
                stubs: {
                    Teleport: {
                        template: '<div><slot /></div>',
                    },
                },
                components: {
                    Button,
                },
            },
        })

        await nextTick()

        const closeButton = wrapper.findComponent(Button)
        await closeButton.trigger('click')

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('deve aplicar tamanhos corretos', async () => {
        const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const

        for (const size of sizes) {
            wrapper = mount(ModalV2, {
                props: {
                    modelValue: true,
                    size,
                },
                global: {
                    stubs: {
                        Teleport: {
                            template: '<div><slot /></div>',
                        },
                    },
                },
            })

            await nextTick()

            const dialog = wrapper.find('[role="dialog"]')
            const expectedClass = size === 'full' ? 'max-w-[calc(100vw-2rem)]' : `max-w-${size}`
            expect(dialog.classes()).toContain(expectedClass)

            wrapper.unmount()
        }
    })

    it('deve renderizar slots corretamente', async () => {
        wrapper = mount(ModalV2, {
            props: {
                modelValue: true,
                title: 'Teste Modal',
            },
            slots: {
                default: '<p>Conteúdo do modal</p>',
                header: '<h3>Header customizado</h3>',
                footer: '<button>Ação personalizada</button>',
            },
            global: {
                stubs: {
                    Teleport: {
                        template: '<div><slot /></div>',
                    },
                },
            },
        })

        await nextTick()

        expect(wrapper.text()).toContain('Conteúdo do modal')
        expect(wrapper.text()).toContain('Header customizado')
        expect(wrapper.text()).toContain('Ação personalizada')
    })

    it('deve respeitar prop persistent', async () => {
        wrapper = mount(ModalV2, {
            props: {
                modelValue: true,
                persistent: true,
            },
            global: {
                stubs: {
                    Teleport: {
                        template: '<div><slot /></div>',
                    },
                },
            },
        })

        await nextTick()

        // Simular clique no overlay
        const overlay = wrapper.find('.fixed.inset-0')
        await overlay.trigger('click')

        // Não deve emitir update:modelValue para modal persistente
        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('deve emitir eventos de ciclo de vida', async () => {
        wrapper = mount(ModalV2, {
            props: {
                modelValue: false,
            },
            global: {
                stubs: {
                    Teleport: {
                        template: '<div><slot /></div>',
                    },
                },
            },
        })

        // Abrir modal
        await wrapper.setProps({ modelValue: true })
        await nextTick()

        expect(wrapper.emitted('open')).toBeTruthy()

        // Fechar modal
        await wrapper.setProps({ modelValue: false })
        await nextTick()

        expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve ter acessibilidade adequada', async () => {
        wrapper = mount(ModalV2, {
            props: {
                modelValue: true,
                title: 'Teste Modal',
                description: 'Descrição do modal',
            },
            global: {
                stubs: {
                    Teleport: {
                        template: '<div><slot /></div>',
                    },
                },
            },
        })

        await nextTick()

        const dialog = wrapper.find('[role="dialog"]')

        expect(dialog.attributes('aria-modal')).toBe('true')
        expect(dialog.attributes('aria-labelledby')).toBe('modal-title')
        expect(dialog.attributes('aria-describedby')).toBe('modal-description')
        expect(dialog.attributes('tabindex')).toBe('-1')
    })
})