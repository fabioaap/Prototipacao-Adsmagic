# Guia de Padronização de Modais

## Visão Geral

Este documento descreve a padronização de todos os modais da aplicação usando o novo **ModalV2** e o composable **useModal**. Esta migração visa:

- ✅ **Consistência visual** seguindo design system
- ✅ **Melhor experiência de usuário** com animações e acessibilidade
- ✅ **DX melhorada** com API padronizada e tipagem
- ✅ **Manutenibilidade** com padrões unificados

## Componentes Criados

### 1. ModalV2.vue

Componente base padronizado que substitui `Modal.vue` e `Dialog.vue`.

**Features principais:**
- Suporte completo a `v-model`
- Acessibilidade (ARIA, focus trap, ESC key)
- Lock de scroll corporal
- Animações suaves
- Responsivo (fullscreen em mobile)
- Slots para customização (header, body, footer)

### 2. useModal() composable

Gerencia estado e comportamento de modais de forma padronizada.

**Features principais:**
- Estado reativo (`isOpen`, `isLoading`, `data`)
- Callbacks de ciclo de vida (`onOpen`, `onClose`)
- Controle de loading state
- Prevenção de fechamento durante operações

### 3. useFormModal() composable

Extensão do `useModal` especificamente para modais de formulário.

**Features adicionais:**
- Estado de salvamento (`isSaving`)
- Callbacks de sucesso/erro (`onSaveSuccess`, `onSaveError`)
- Método `saveAndClose()`
- Reset automático

## Padrão de Migração

### ❌ Antes (Modal antigo)

```vue
<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue'

const isOpen = ref(false)
const isSubmitting = ref(false)

const handleClose = () => {
  isOpen.value = false
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await saveData()
    isOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Modal
    :open="isOpen"
    title="Formulário"
    @update:open="isOpen = $event"
  >
    <form @submit.prevent="handleSubmit">
      <!-- campos -->
      <Button :disabled="isSubmitting" @click="handleSubmit">
        Salvar
      </Button>
    </form>
  </Modal>
</template>
```

### ✅ Depois (Novo padrão)

```vue
<script setup lang="ts">
import ModalV2 from '@/components/ui/ModalV2.vue'
import { useFormModal } from '@/composables/useModal'

const modalState = useFormModal({
  onSaveSuccess: (result) => {
    emit('success', result)
    toast({ title: 'Salvo com sucesso!' })
  },
  onSaveError: (error) => {
    toast({ title: 'Erro ao salvar', variant: 'destructive' })
  }
})

const handleSubmit = async () => {
  modalState.startSaving()
  try {
    const result = await saveData()
    await modalState.saveAndClose(result)
  } catch (error) {
    modalState.stopSaving()
  }
}
</script>

<template>
  <ModalV2
    v-model="modalState.isOpen.value"
    title="Formulário"
    :persistent="modalState.isLoading.value"
  >
    <form @submit.prevent="handleSubmit">
      <!-- campos -->
    </form>
    
    <template #footer>
      <Button variant="outline" @click="modalState.close()">
        Cancelar
      </Button>
      <Button 
        :loading="modalState.isSaving.value"
        @click="handleSubmit"
      >
        Salvar
      </Button>
    </template>
  </ModalV2>
</template>
```

## API Reference

### ModalV2 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-----------|
| `modelValue` | `boolean` | `false` | Controla abertura (v-model) |
| `title` | `string` | - | Título do modal |
| `description` | `string` | - | Descrição/subtítulo |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'md'` | Tamanho do modal |
| `persistent` | `boolean` | `false` | Previne fechamento (ESC/overlay) |
| `showCloseButton` | `boolean` | `true` | Mostra botão X |
| `closeOnOverlayClick` | `boolean` | `true` | Fecha ao clicar fora |
| `noPadding` | `boolean` | `false` | Remove padding do body |
| `zIndex` | `number` | `50` | Z-index do modal |

### ModalV2 Events

| Event | Payload | Descrição |
|-------|---------|-----------|
| `update:modelValue` | `boolean` | v-model |
| `open` | - | Modal iniciando abertura |
| `close` | - | Modal iniciando fechamento |
| `opened` | - | Modal completamente aberto |
| `closed` | - | Modal completamente fechado |

### ModalV2 Slots

| Slot | Descrição |
|------|-----------|
| `default` | Conteúdo principal |
| `header` | Header customizado |
| `footer` | Footer com ações |

### useModal() Options

```typescript
interface UseModalOptions<T = any> {
  onOpen?: (data?: T) => void | Promise<void>
  onClose?: (data?: T) => void | Promise<void>
  defaultOpen?: boolean
  preventCloseWhileLoading?: boolean
}
```

### useModal() Return

```typescript
interface UseModalReturn<T = any> {
  isOpen: Ref<boolean>
  isLoading: Ref<boolean>
  data: Ref<T | null>
  open: (contextData?: T) => Promise<void>
  close: () => Promise<void>
  toggle: () => Promise<void>
  startLoading: () => void
  stopLoading: () => void
  canClose: Ref<boolean>
}
```

### useFormModal() Adicional

```typescript
interface FormModalReturn extends UseModalReturn {
  isSaving: Ref<boolean>
  startSaving: () => void
  stopSaving: () => void
  saveAndClose: (result?: any) => Promise<void>
}
```

## Casos de Uso Comuns

### 1. Modal de Confirmação Simples

```vue
<script setup lang="ts">
import { useModal } from '@/composables/useModal'

const confirmModal = useModal({
  onOpen: () => console.log('Confirmar ação?'),
  onClose: () => console.log('Ação cancelada')
})

const handleConfirm = () => {
  // executar ação
  confirmModal.close()
}
</script>

<template>
  <ModalV2
    v-model="confirmModal.isOpen.value"
    title="Confirmar Exclusão"
    description="Esta ação não pode ser desfeita."
    size="sm"
  >
    <p>Tem certeza que deseja excluir este item?</p>
    
    <template #footer>
      <Button variant="outline" @click="confirmModal.close()">
        Cancelar
      </Button>
      <Button variant="destructive" @click="handleConfirm">
        Excluir
      </Button>
    </template>
  </ModalV2>
</template>
```

### 2. Modal de Formulário Complexo

```vue
<script setup lang="ts">
import { useFormModal } from '@/composables/useModal'

const formModal = useFormModal<User>({
  onOpen: async (user) => {
    if (user) {
      // Carregar dados para edição
      await loadUserDetails(user.id)
    }
    // Reset form baseado em user ou valores padrão
  },
  onSaveSuccess: (user) => {
    emit('success', user)
    toast({ title: 'Usuário salvo!' })
  },
  onSaveError: (error) => {
    toast({ title: 'Erro ao salvar', variant: 'destructive' })
  }
})
</script>
```

### 3. Modal com Loading States

```vue
<script setup lang="ts">
const modal = useModal({
  onOpen: async () => {
    modal.startLoading()
    try {
      await loadData()
    } finally {
      modal.stopLoading()
    }
  }
})
</script>

<template>
  <ModalV2
    v-model="modal.isOpen.value"
    :persistent="modal.isLoading.value"
  >
    <div v-if="modal.isLoading.value">
      Carregando...
    </div>
    <div v-else>
      <!-- conteúdo -->
    </div>
  </ModalV2>
</template>
```

## Migração por Fase

### Fase 1: Componentes Críticos ✅
- [x] ContactFormModal → ContactFormModalV2
- [x] SaleFormModal → SaleFormModalV2

### Fase 2: Modais de Configuração
- [ ] OriginFormModal
- [ ] CompanyFormModal
- [ ] SettingsModals

### Fase 3: Modais Específicos
- [ ] ContactImportModal
- [ ] EventDetailsModal
- [ ] QRCodeModal
- [ ] LinkFormModal
- [ ] ABTestModal

### Fase 4: Cleanup
- [ ] Remover Modal.vue antigo
- [ ] Migrar usos restantes de Dialog.vue
- [ ] Atualizar testes

## Checklist de Migração

Para cada modal migrado:

- [ ] Substitui component base por `ModalV2`
- [ ] Usa `useModal` ou `useFormModal`
- [ ] Implementa slots `#footer` para ações
- [ ] Adiciona estados de loading/saving
- [ ] Trata erros com toast
- [ ] Testa acessibilidade (Tab, ESC, screen readers)
- [ ] Testa responsividade (mobile/desktop)
- [ ] Atualiza testes unitários
- [ ] Documenta mudanças

## Benefícios Alcançados

### 🎨 **Design System Consistency**
- Todas as animações padronizadas (300ms ease-out)
- Tamanhos consistentes (xs, sm, md, lg, xl, 2xl, full)
- Cores e espaçamento seguindo tokens de design

### ♿ **Acessibilidade Melhorada**
- Focus trap automático
- ARIA labels corretos
- Suporte a ESC key
- Lock de scroll corporal
- Navegação por Tab/Shift+Tab

### 🛠️ **Developer Experience**
- API TypeScript 100% tipada
- Composables reutilizáveis
- Menos boilerplate
- Testes padronizados
- Documentação completa

### 📱 **UX Responsiva**
- Fullscreen em mobile (< 640px)
- Rounded corners em desktop
- Gestos e touch otimizados
- Animações suaves

## Próximos Passos

1. **Testar modais migrados** em ambiente real
2. **Migrar próximos modais** da lista (Fase 2)
3. **Validar acessibilidade** com screen readers
4. **Documentar edge cases** encontrados
5. **Treinar equipe** no novo padrão