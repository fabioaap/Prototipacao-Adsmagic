<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import Toast from './Toast.vue'

const toastStore = useToastStore()

const handleRemove = (id: string) => {
  toastStore.removeToast(id)
}
</script>

<template>
  <div class="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-2">
    <Transition
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      enter-active-class="transform transition ease-in-out duration-200"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transform transition ease-in-out duration-200"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <Toast
        :toast="toast"
        @remove="handleRemove"
      />
    </Transition>
  </div>
</template>
