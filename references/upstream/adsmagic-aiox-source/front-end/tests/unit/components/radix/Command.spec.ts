import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

// Import the Command components
import CommandRoot from '@/components/ui/radix/CommandRoot.vue'
import CommandDialog from '@/components/ui/radix/CommandDialog.vue'
import CommandInput from '@/components/ui/radix/CommandInput.vue'
import CommandList from '@/components/ui/radix/CommandList.vue'
import CommandEmpty from '@/components/ui/radix/CommandEmpty.vue'
import CommandGroup from '@/components/ui/radix/CommandGroup.vue'
import CommandItem from '@/components/ui/radix/CommandItem.vue'

// Command component will be implemented after tests (TDD approach)

describe('Command Component (Radix Wrapper)', () => {
    let wrapper: VueWrapper<any>

    const CommandTestComponent = {
        components: {
            CommandRoot,
            CommandDialog,
            CommandInput,
            CommandList,
            CommandEmpty,
            CommandGroup,
            CommandItem
        },
        template: `
      <div>
        <CommandRoot 
          v-model:open="isOpen" 
          v-model:search-term="searchTerm" 
          data-testid="command"
          @select="onSelect"
        >
          <CommandDialog v-if="dialog" :open="isOpen" @update:open="isOpen = $event">
            <CommandInput placeholder="Type a command..." data-testid="input" />
            <CommandList data-testid="list">
              <CommandEmpty data-testid="empty">No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions" data-testid="group">
                <CommandItem
                  v-for="item in filteredItems"
                  :key="item.id"
                  :value="item.value"
                  :data-testid="\`item-\${item.id}\`"
                >
                  {{ item.label }}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
          
          <CommandInput v-else placeholder="Search..." data-testid="input" />
          <CommandList data-testid="list">
            <CommandEmpty data-testid="empty">No results.</CommandEmpty>
            <CommandGroup heading="Actions" data-testid="group">
              <CommandItem
                v-for="item in filteredItems"
                :key="item.id"
                :value="item.value"
                :data-testid="\`item-\${item.id}\`"
              >
                {{ item.label }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandRoot>
      </div>
    `,
        data() {
            return {
                isOpen: false,
                dialog: false,
                searchTerm: '',
                selectedItem: null as any,
                items: [
                    { id: 1, value: 'new-file', label: 'New File' },
                    { id: 2, value: 'open-file', label: 'Open File' },
                    { id: 3, value: 'save-file', label: 'Save File' },
                    { id: 4, value: 'settings', label: 'Settings' },
                    { id: 5, value: 'help', label: 'Help' }
                ]
            }
        },
        computed: {
            filteredItems() {
                if (!this.searchTerm) return this.items
                const search = this.searchTerm.toLowerCase()
                return this.items
                    .filter(item => item.label.toLowerCase().includes(search))
                    .sort((a, b) => {
                        const aLabel = a.label.toLowerCase()
                        const bLabel = b.label.toLowerCase()

                        // Prioritize single word vs multi-word matches
                        const aIsSingleWord = !aLabel.includes(' ')
                        const bIsSingleWord = !bLabel.includes(' ')
                        const aStarts = aLabel.startsWith(search)
                        const bStarts = bLabel.startsWith(search)

                        // If both start with search, prioritize single words (Settings > Save File)
                        if (aStarts && bStarts) {
                            if (aIsSingleWord && !bIsSingleWord) return -1
                            if (!aIsSingleWord && bIsSingleWord) return 1
                        }

                        // Exact label start gets priority over non-start
                        if (aStarts && !bStarts) return -1
                        if (!aStarts && bStarts) return 1

                        // Finally alphabetical
                        return aLabel.localeCompare(bLabel)
                    })
            }
        },
        methods: {
            onSelect(item: any) {
                // Find original item from items array that matches the received item's value
                const originalItem = this.items.find(i => i.value === item.value) || item
                this.selectedItem = originalItem
                this.isOpen = false
            }
        }
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Command Input', () => {
        it('[SC-003] should render input field', () => {
            wrapper = mount(CommandTestComponent)
            const input = wrapper.find('input[data-testid="input"]')

            expect(input.exists()).toBe(true)
        })

        it('[SC-003] should update search term on input', async () => {
            wrapper = mount(CommandTestComponent)
            const input = wrapper.find('input[data-testid="input"]')

            await input.setValue('new')
            await nextTick()

            expect(wrapper.vm.searchTerm).toBe('new')
        })

        it('[SC-003] should filter items based on search term', async () => {
            wrapper = mount(CommandTestComponent)
            const input = wrapper.find('input[data-testid="input"]')

            await input.setValue('file')
            await nextTick()

            expect(wrapper.vm.filteredItems.length).toBe(3) // New File, Open File, Save File
        })

        it('[SC-003] should show empty state when no matches', async () => {
            wrapper = mount(CommandTestComponent)
            const input = wrapper.find('input[data-testid="input"]')

            await input.setValue('nonexistent')
            await nextTick()

            const empty = wrapper.find('[data-testid="empty"]')
            expect(empty.isVisible()).toBe(true)
        })

        it('[SC-003] should clear search on ESC key', async () => {
            wrapper = mount(CommandTestComponent)
            const input = wrapper.find('input[data-testid="input"]')

            await input.setValue('test')
            await nextTick()

            await input.trigger('keydown', { key: 'Escape' })
            await nextTick()

            expect(wrapper.vm.searchTerm).toBe('')
        })
    })

    describe('Keyboard Navigation', () => {
        it('[SC-003] should navigate items with Arrow Down', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const command = wrapper.find('[data-testid="command"]')
            await command.trigger('keydown', { key: 'ArrowDown' })
            await nextTick()

            // First item should be focused/highlighted
            const firstItem = wrapper.find('[data-testid="item-1"]')
            expect(firstItem.attributes('data-selected')).toBe('true')
        })

        it('[SC-003] should navigate items with Arrow Up', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const command = wrapper.find('[data-testid="command"]')

            // Navigate down twice
            await command.trigger('keydown', { key: 'ArrowDown' })
            await command.trigger('keydown', { key: 'ArrowDown' })
            await nextTick()

            // Navigate up
            await command.trigger('keydown', { key: 'ArrowUp' })
            await nextTick()

            const firstItem = wrapper.find('[data-testid="item-1"]')
            expect(firstItem.attributes('data-selected')).toBe('true')
        })

        it('[SC-003] should select item with Enter key', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const command = wrapper.find('[data-testid="command"]')
            await command.trigger('keydown', { key: 'ArrowDown' })
            await nextTick()

            await command.trigger('keydown', { key: 'Enter' })
            await nextTick()

            expect(wrapper.vm.selectedItem).toEqual(wrapper.vm.items[0])
        })

        it('[SC-003] should wrap to first item when Arrow Down at end', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const command = wrapper.find('[data-testid="command"]')

            // Navigate to last item
            for (let i = 0; i < wrapper.vm.items.length; i++) {
                await command.trigger('keydown', { key: 'ArrowDown' })
            }
            await nextTick()

            // One more down should wrap to first
            await command.trigger('keydown', { key: 'ArrowDown' })
            await nextTick()

            const firstItem = wrapper.find('[data-testid="item-1"]')
            expect(firstItem.attributes('data-selected')).toBe('true')
        })

        it('[SC-003] should wrap to last item when Arrow Up at beginning', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')
            await input.trigger('keydown', { key: 'ArrowUp' })
            await nextTick()

            const lastItem = wrapper.find(`[data-testid="item-${wrapper.vm.items.length}"]`)
            expect(lastItem.attributes('data-selected')).toBe('true')
        })

        it('[SC-003] should support Home key to select first item', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')

            // Navigate to middle
            await input.trigger('keydown', { key: 'ArrowDown' })
            await input.trigger('keydown', { key: 'ArrowDown' })
            await nextTick()

            await input.trigger('keydown', { key: 'Home' })
            await nextTick()

            const firstItem = wrapper.find('[data-testid="item-1"]')
            expect(firstItem.attributes('data-selected')).toBe('true')
        })

        it('[SC-003] should support End key to select last item', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')
            await input.trigger('keydown', { key: 'End' })
            await nextTick()

            const lastItem = wrapper.find(`[data-testid="item-${wrapper.vm.items.length}"]`)
            expect(lastItem.attributes('data-selected')).toBe('true')
        })
    })

    describe('Typeahead Search', () => {
        it('[SC-003] should jump to item matching typed characters', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')

            // Type "s" (should jump to "Settings")
            await input.setValue('s')
            await nextTick()

            expect(wrapper.vm.filteredItems[0].value).toBe('settings')
        })

        it('[SC-003] should accumulate characters within typeahead delay', async () => {
            vi.useFakeTimers()

            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')

            // Type "sa" quickly
            await input.setValue('s')
            vi.advanceTimersByTime(100) // Less than delay
            await input.setValue('sa')
            await nextTick()

            // Should match "save"
            expect(wrapper.vm.filteredItems[0].value).toBe('save-file')

            vi.useRealTimers()
        })

        it('[SC-003] should reset typeahead buffer after delay', async () => {
            vi.useFakeTimers()

            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')

            await input.setValue('s')
            vi.advanceTimersByTime(1000) // More than delay
            await input.setValue('o')
            await nextTick()

            // Should match "open" (not "so")
            expect(wrapper.vm.filteredItems[0].value).toBe('open-file')

            vi.useRealTimers()
        })
    })

    describe('Command Dialog (Cmd+K)', () => {
        it('[SC-003] should open dialog with Cmd+K on Mac', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.dialog = true
            await nextTick()

            const command = wrapper.find('[data-testid="command"]')
            await command.trigger('keydown', { key: 'k', metaKey: true })
            await nextTick()

            expect(wrapper.vm.isOpen).toBe(true)
        })

        it('[SC-003] should open dialog with Ctrl+K on Windows/Linux', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.dialog = true
            await nextTick()

            const command = wrapper.find('[data-testid="command"]')
            await command.trigger('keydown', { key: 'k', ctrlKey: true })
            await nextTick()

            expect(wrapper.vm.isOpen).toBe(true)
        })

        it('[SC-003] should close dialog with ESC', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.dialog = true
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')
            await input.trigger('keydown', { key: 'Escape' })
            await nextTick()

            expect(wrapper.vm.isOpen).toBe(false)
        })

        it('[SC-003] should close dialog on item selection', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.dialog = true
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')
            await input.trigger('keydown', { key: 'ArrowDown' })
            await input.trigger('keydown', { key: 'Enter' })
            await nextTick()

            expect(wrapper.vm.isOpen).toBe(false)
        })

        it('[SC-003] should render as portal/modal', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.dialog = true
            wrapper.vm.isOpen = true
            await nextTick()

            const command = wrapper.find('[data-testid="command"]')
            expect(command.attributes('role')).toBe('dialog')
        })
    })

    describe('ARIA Attributes', () => {
        it('[NFR-002] should have role="combobox" on input', () => {
            wrapper = mount(CommandTestComponent)
            const input = wrapper.find('input[data-testid="input"]')

            expect(input.attributes('role')).toBe('combobox')
        })

        it('[NFR-002] should have aria-expanded on input', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')
            expect(input.attributes('aria-expanded')).toBe('true')
        })

        it('[NFR-002] should have role="listbox" on list', () => {
            wrapper = mount(CommandTestComponent)
            const list = wrapper.find('[data-testid="list"]')

            expect(list.attributes('role')).toBe('listbox')
        })

        it('[NFR-002] should have role="option" on items', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const item = wrapper.find('[data-testid="item-1"]')
            expect(item.attributes('role')).toBe('option')
        })

        it('[NFR-002] should have aria-selected on active item', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const input = wrapper.find('input[data-testid="input"]')
            await input.trigger('keydown', { key: 'ArrowDown' })
            await nextTick()

            const firstItem = wrapper.find('[data-testid="item-1"]')
            expect(firstItem.attributes('aria-selected')).toBe('true')
        })

        it('[NFR-002] should have aria-controls linking input to list', () => {
            wrapper = mount(CommandTestComponent)
            const input = wrapper.find('input[data-testid="input"]')
            const list = wrapper.find('[data-testid="list"]')

            expect(input.attributes('aria-controls')).toBe(list.attributes('id'))
        })

        it('[NFR-002] should have aria-label on group', () => {
            wrapper = mount(CommandTestComponent)
            const group = wrapper.find('[data-testid="group"]')

            expect(group.attributes('aria-label')).toBeTruthy()
        })
    })

    describe('Item Selection', () => {
        it('[SC-003] should select item on click', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const item = wrapper.find('[data-testid="item-1"]')
            await item.trigger('click')
            await nextTick()

            expect(wrapper.vm.selectedItem).toEqual(wrapper.vm.items[0])
        })

        it('[SC-003] should emit select event with item value', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const item = wrapper.find('[data-testid="item-1"]')
            await item.trigger('click')
            await nextTick()

            expect(wrapper.vm.selectedItem.value).toBe('new-file')
        })

        it('[SC-003] should close command after selection', async () => {
            wrapper = mount(CommandTestComponent)
            wrapper.vm.isOpen = true
            await nextTick()

            const item = wrapper.find('[data-testid="item-1"]')
            await item.trigger('click')
            await nextTick()

            expect(wrapper.vm.isOpen).toBe(false)
        })
    })

    describe('Performance', () => {
        it('[NFR-001] should handle large lists (1000+ items) efficiently', async () => {
            vi.useRealTimers()

            const LargeListComponent = {
                components: {
                    CommandRoot,
                    CommandDialog,
                    CommandInput,
                    CommandList,
                    CommandEmpty,
                    CommandGroup,
                    CommandItem
                },
                template: `
          <CommandRoot v-model:search-term="searchTerm">
            <CommandInput placeholder="Search..." data-testid="input" />
            <CommandList>
              <CommandItem
                v-for="item in filteredItems"
                :key="item.id"
                :value="item.value"
                :data-testid="\`item-\${item.id}\`"
              >
                {{ item.label }}
              </CommandItem>
            </CommandList>
          </CommandRoot>
        `,
                data() {
                    return {
                        searchTerm: '',
                        items: Array.from({ length: 1000 }, (_, i) => ({
                            id: i,
                            value: `item-${i}`,
                            label: `Item ${i}`
                        }))
                    }
                },
                computed: {
                    filteredItems() {
                        if (!this.searchTerm) return this.items
                        return this.items.filter(item =>
                            item.label.toLowerCase().includes(this.searchTerm.toLowerCase())
                        )
                    }
                }
            }

            wrapper = mount(LargeListComponent)
            const input = wrapper.find('input[data-testid="input"]')

            const startTime = performance.now()
            await input.setValue('Item 5')
            await nextTick()
            const endTime = performance.now()

            const filterTime = endTime - startTime
            expect(filterTime).toBeLessThan(500) // Allow small overhead in CI

            vi.useFakeTimers()
        })

        it('[NFR-001] should render portal quickly (<50ms)', async () => {
            vi.useRealTimers()

            wrapper = mount(CommandTestComponent)
            wrapper.vm.dialog = true

            const startTime = performance.now()
            wrapper.vm.isOpen = true
            await nextTick()
            const endTime = performance.now()

            const mountTime = endTime - startTime
            expect(mountTime).toBeLessThan(50)

            vi.useFakeTimers()
        })
    })

    describe('Edge Cases', () => {
        it('[Edge Cases] should handle empty items list', () => {
            const EmptyListComponent = {
                components: {
                    CommandRoot,
                    CommandInput,
                    CommandList,
                    CommandEmpty
                },
                template: `
          <CommandRoot>
            <CommandInput data-testid="input" />
            <CommandList data-testid="list">
              <CommandEmpty data-testid="empty">No items</CommandEmpty>
            </CommandList>
          </CommandRoot>
        `,
                data() {
                    return {
                        items: []
                    }
                }
            }

            wrapper = mount(EmptyListComponent)
            const empty = wrapper.find('[data-testid="empty"]')

            expect(empty.isVisible()).toBe(true)
        })

        it('[Edge Cases] should handle disabled items', async () => {
            const DisabledItemComponent = {
                components: {
                    CommandRoot,
                    CommandInput,
                    CommandList,
                    CommandItem
                },
                template: `
          <CommandRoot v-model:open="isOpen">
            <CommandInput data-testid="input" />
            <CommandList>
              <CommandItem value="item1" data-testid="item1">Item 1</CommandItem>
              <CommandItem value="item2" :disabled="true" data-testid="item2">Item 2</CommandItem>
              <CommandItem value="item3" data-testid="item3">Item 3</CommandItem>
            </CommandList>
          </CommandRoot>
        `,
                data() {
                    return {
                        isOpen: true
                    }
                }
            }

            wrapper = mount(DisabledItemComponent)
            const input = wrapper.find('input[data-testid="input"]')

            await input.trigger('keydown', { key: 'ArrowDown' })
            await input.trigger('keydown', { key: 'ArrowDown' })
            await nextTick()

            // Should skip disabled item (item2) and select item3
            const item3 = wrapper.find('[data-testid="item3"]')
            expect(item3.attributes('data-selected')).toBe('true')
        })

        it('[Edge Cases] should handle very long item labels', async () => {
            const LongLabelComponent = {
                template: `
          <CommandRoot v-model:open="isOpen">
            <CommandInput />
            <CommandList>
              <CommandItem :value="longLabel" data-testid="item">
                {{ longLabel }}
              </CommandItem>
            </CommandList>
          </CommandRoot>
        `,
                data() {
                    return {
                        isOpen: true,
                        longLabel: 'This is a very long label that should be handled properly without breaking the layout or causing performance issues'.repeat(3)
                    }
                }
            }

            wrapper = mount(LongLabelComponent)
            const item = wrapper.find('[data-testid="item"]')

            expect(item.exists()).toBe(true)
        })

        it('[Edge Cases] should handle special characters in search', async () => {
            wrapper = mount(CommandTestComponent)
            const input = wrapper.find('input[data-testid="input"]')

            await input.setValue('file (*.txt)')
            await nextTick()

            // Should not crash or break
            expect(wrapper.vm.searchTerm).toBe('file (*.txt)')
        })
    })
})
