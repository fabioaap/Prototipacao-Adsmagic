import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockContacts, type Contact } from '@/data/contacts'

export const useContactsStore = defineStore('contacts', () => {
  const contacts = ref<Contact[]>(mockContacts)
  const search = ref('')
  const statusFilter = ref<string>('all')

  const filtered = computed(() => {
    return contacts.value.filter(c => {
      const matchSearch = !search.value ||
        c.name.toLowerCase().includes(search.value.toLowerCase()) ||
        c.email.toLowerCase().includes(search.value.toLowerCase())
      const matchStatus = statusFilter.value === 'all' || c.status === statusFilter.value
      return matchSearch && matchStatus
    })
  })

  return { contacts, search, statusFilter, filtered }
})
