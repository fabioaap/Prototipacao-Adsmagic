/**
 * Testes para useModal.ts
 * 
 * Valida funcionalidade do composable para gerenciamento de modais
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useModal, useFormModal } from '@/composables/useModal'
import { nextTick } from 'vue'

describe('useModal', () => {
    it('deve inicializar com estado fechado por padrão', () => {
        const modal = useModal()

        expect(modal.isOpen.value).toBe(false)
        expect(modal.isLoading.value).toBe(false)
        expect(modal.data.value).toBe(null)
        expect(modal.canClose.value).toBe(true)
    })

    it('deve inicializar com estado aberto quando defaultOpen for true', () => {
        const modal = useModal({ defaultOpen: true })

        expect(modal.isOpen.value).toBe(true)
    })

    it('deve abrir modal com dados', async () => {
        const onOpen = vi.fn()
        const modal = useModal({ onOpen })

        const testData = { id: '1', name: 'Teste' }
        await modal.open(testData)

        expect(modal.isOpen.value).toBe(true)
        expect(modal.data.value).toEqual(testData)
        expect(onOpen).toHaveBeenCalledWith(testData)
    })

    it('deve fechar modal e limpar dados', async () => {
        const onClose = vi.fn()
        const modal = useModal({ onClose })

        await modal.open({ id: '1', name: 'Teste' })
        expect(modal.isOpen.value).toBe(true)
        expect(modal.data.value).toBeTruthy()

        await modal.close()

        expect(modal.isOpen.value).toBe(false)
        expect(modal.data.value).toBe(null)
        expect(modal.isLoading.value).toBe(false)
        expect(onClose).toHaveBeenCalled()
    })

    it('deve gerenciar estado de loading', () => {
        const modal = useModal()

        expect(modal.isLoading.value).toBe(false)

        modal.startLoading()
        expect(modal.isLoading.value).toBe(true)

        modal.stopLoading()
        expect(modal.isLoading.value).toBe(false)
    })

    it('deve prevenir fechamento durante loading quando configurado', async () => {
        const modal = useModal({ preventCloseWhileLoading: true })

        await modal.open()
        modal.startLoading()

        expect(modal.canClose.value).toBe(false)

        // Tentar fechar durante loading
        await modal.close()
        expect(modal.isOpen.value).toBe(true) // Deve continuar aberto

        modal.stopLoading()
        expect(modal.canClose.value).toBe(true)

        await modal.close()
        expect(modal.isOpen.value).toBe(false) // Agora deve fechar
    })

    it('deve fazer toggle do estado', async () => {
        const modal = useModal()

        expect(modal.isOpen.value).toBe(false)

        await modal.toggle()
        expect(modal.isOpen.value).toBe(true)

        await modal.toggle()
        expect(modal.isOpen.value).toBe(false)
    })

    it('deve tratar erros nos callbacks', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

        const onOpen = vi.fn().mockRejectedValue(new Error('Erro no onOpen'))
        const modal = useModal({ onOpen })

        await modal.open()

        // Deve continuar fechado devido ao erro
        expect(modal.isOpen.value).toBe(false)
        expect(consoleError).toHaveBeenCalled()

        consoleError.mockRestore()
    })
})

describe('useFormModal', () => {
    it('deve herdar funcionalidade do useModal', async () => {
        const formModal = useFormModal()

        expect(formModal.isOpen.value).toBe(false)
        expect(formModal.isSaving.value).toBe(false)

        await formModal.open({ id: '1' })
        expect(formModal.isOpen.value).toBe(true)
    })

    it('deve gerenciar estado de salvamento', () => {
        const formModal = useFormModal()

        expect(formModal.isSaving.value).toBe(false)
        expect(formModal.isLoading.value).toBe(false)

        formModal.startSaving()

        expect(formModal.isSaving.value).toBe(true)
        expect(formModal.isLoading.value).toBe(true)

        formModal.stopSaving()

        expect(formModal.isSaving.value).toBe(false)
        expect(formModal.isLoading.value).toBe(false)
    })

    it('deve salvar e fechar com sucesso', async () => {
        const onSaveSuccess = vi.fn()
        const formModal = useFormModal({ onSaveSuccess })

        await formModal.open({ id: '1' })

        const result = { id: '1', name: 'Salvo' }
        await formModal.saveAndClose(result)

        expect(onSaveSuccess).toHaveBeenCalledWith(result)
        expect(formModal.isOpen.value).toBe(false)
    })

    it('deve tratar erros de salvamento', async () => {
        const onSaveError = vi.fn()
        const onSaveSuccess = vi.fn().mockRejectedValue(new Error('Erro no save'))

        const formModal = useFormModal({ onSaveSuccess, onSaveError })

        await formModal.open({ id: '1' })

        try {
            await formModal.saveAndClose('resultado')
        } catch (error) {
            expect(onSaveError).toHaveBeenCalledWith(error)
            expect(formModal.isSaving.value).toBe(false)
        }
    })

    it('deve limpar estado de saving ao fechar', async () => {
        const formModal = useFormModal()

        await formModal.open()
        formModal.startSaving()

        expect(formModal.isSaving.value).toBe(true)

        // Para saving antes de fechar (necessário porque preventCloseWhileLoading é true por padrão)
        formModal.stopSaving()
        await formModal.close()

        expect(formModal.isSaving.value).toBe(false)
        expect(formModal.isOpen.value).toBe(false)
    })
})