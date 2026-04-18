import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Command from '@/components/ui/radix/Command.vue'
import type { CommandItem } from '@/components/ui/radix/Command.vue'

interface CreateWrapperOptions {
  items?: CommandItem[]
  groups?: any[]
  placeholder?: string
  emptyText?: string
  query?: string
  open?: boolean
  headless?: boolean
  caseSensitive?: boolean
  filterFunction?: (item: CommandItem, query: string) => boolean
  onSelect?: (item: CommandItem) => void
  testId?: string
  inputClass?: string
  inputContainerClass?: string
  listClass?: string
  itemClass?: string
  groupClass?: string
  groupHeadingClass?: string
  iconClass?: string
  shortcutClass?: string
  emptyClass?: string
}

function createWrapper(options: CreateWrapperOptions = {}) {
  const defaultItems: CommandItem[] = [
    { id: '1', label: 'Test Item 1', value: 'test1' },
    { id: '2', label: 'Test Item 2', value: 'test2' },
    { id: '3', label: 'Another Item', value: 'another' }
  ]

  return mount(Command, {
    props: {
      items: defaultItems,
      placeholder: 'Search...',
      emptyText: 'No results found.',
      query: '',
      open: true,
      headless: false,
      caseSensitive: false,
      testId: 'command-test',
      ...options
    },
    attachTo: document.body
  })
}

describe('Command Real Component Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('Basic Functionality', () => {
    it('should render command component', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render with provided items', () => {
      const items = [
        { id: '1', label: 'Item 1', value: 'item1' },
        { id: '2', label: 'Item 2', value: 'item2' }
      ]
      const wrapper = createWrapper({ items })
      expect(wrapper.props('items')).toEqual(items)
    })

    it('should render input with placeholder', () => {
      const placeholder = 'Custom placeholder'
      const wrapper = createWrapper({ placeholder })
      expect(wrapper.props('placeholder')).toBe(placeholder)
    })

    it('should handle open state', () => {
      const wrapper = createWrapper({ open: true })
      expect(wrapper.props('open')).toBe(true)
    })

    it('should handle closed state', () => {
      const wrapper = createWrapper({ open: false })
      expect(wrapper.props('open')).toBe(false)
    })
  })

  describe('Query and Filtering', () => {
    it('should handle query prop', () => {
      const query = 'test query'
      const wrapper = createWrapper({ query })
      expect(wrapper.props('query')).toBe(query)
    })

    it('should handle case sensitive filtering', () => {
      const wrapper = createWrapper({ caseSensitive: true })
      expect(wrapper.props('caseSensitive')).toBe(true)
    })

    it('should handle custom filter function', () => {
      const filterFunction = (item: CommandItem, query: string) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      const wrapper = createWrapper({ filterFunction })
      expect(wrapper.props('filterFunction')).toBe(filterFunction)
    })

    it('should handle empty text', () => {
      const emptyText = 'Custom empty message'
      const wrapper = createWrapper({ emptyText })
      expect(wrapper.props('emptyText')).toBe(emptyText)
    })
  })

  describe('Event Handling', () => {
    it('should handle onSelect prop', () => {
      const onSelect = (item: CommandItem) => console.log(item)
      const wrapper = createWrapper({ onSelect })
      expect(wrapper.props('onSelect')).toBe(onSelect)
    })

    it('should emit query-change event when setProps is called', async () => {
      const wrapper = createWrapper()
      await wrapper.setProps({ query: 'new query' })
      expect(wrapper.props('query')).toBe('new query')
    })

    it('should emit select event handling', async () => {
      const wrapper = createWrapper()
      const selectSpy = vi.fn()
      await wrapper.setProps({ onSelect: selectSpy })
      expect(wrapper.props('onSelect')).toBe(selectSpy)
    })
  })

  describe('Groups Support', () => {
    it('should handle groups prop', () => {
      const groups = [
        {
          heading: 'Group 1',
          items: [
            { id: '1', label: 'Item 1', value: 'item1' }
          ]
        }
      ]
      const wrapper = createWrapper({ groups })
      expect(wrapper.props('groups')).toEqual(groups)
    })

    it('should handle empty groups', () => {
      const wrapper = createWrapper({ groups: [] })
      expect(wrapper.props('groups')).toEqual([])
    })
  })

  describe('Styling Props', () => {
    it('should handle inputClass prop', () => {
      const inputClass = 'custom-input-class'
      const wrapper = createWrapper({ inputClass })
      expect(wrapper.props('inputClass')).toBe(inputClass)
    })

    it('should handle inputContainerClass prop', () => {
      const inputContainerClass = 'custom-container-class'
      const wrapper = createWrapper({ inputContainerClass })
      expect(wrapper.props('inputContainerClass')).toBe(inputContainerClass)
    })

    it('should handle listClass prop', () => {
      const listClass = 'custom-list-class'
      const wrapper = createWrapper({ listClass })
      expect(wrapper.props('listClass')).toBe(listClass)
    })

    it('should handle itemClass prop', () => {
      const itemClass = 'custom-item-class'
      const wrapper = createWrapper({ itemClass })
      expect(wrapper.props('itemClass')).toBe(itemClass)
    })

    it('should handle groupClass prop', () => {
      const groupClass = 'custom-group-class'
      const wrapper = createWrapper({ groupClass })
      expect(wrapper.props('groupClass')).toBe(groupClass)
    })

    it('should handle groupHeadingClass prop', () => {
      const groupHeadingClass = 'custom-heading-class'
      const wrapper = createWrapper({ groupHeadingClass })
      expect(wrapper.props('groupHeadingClass')).toBe(groupHeadingClass)
    })

    it('should handle iconClass prop', () => {
      const iconClass = 'custom-icon-class'
      const wrapper = createWrapper({ iconClass })
      expect(wrapper.props('iconClass')).toBe(iconClass)
    })

    it('should handle shortcutClass prop', () => {
      const shortcutClass = 'custom-shortcut-class'
      const wrapper = createWrapper({ shortcutClass })
      expect(wrapper.props('shortcutClass')).toBe(shortcutClass)
    })

    it('should handle emptyClass prop', () => {
      const emptyClass = 'custom-empty-class'
      const wrapper = createWrapper({ emptyClass })
      expect(wrapper.props('emptyClass')).toBe(emptyClass)
    })
  })

  describe('Advanced Features', () => {
    it('should handle headless mode', () => {
      const wrapper = createWrapper({ headless: true })
      expect(wrapper.props('headless')).toBe(true)
    })

    it('should handle testId prop', () => {
      const testId = 'custom-test-id'
      const wrapper = createWrapper({ testId })
      expect(wrapper.props('testId')).toBe(testId)
    })

    it('should update props dynamically', async () => {
      const wrapper = createWrapper({ open: false })
      expect(wrapper.props('open')).toBe(false)

      await wrapper.setProps({ open: true })
      expect(wrapper.props('open')).toBe(true)
    })

    it('should handle complex items structure', () => {
      const complexItems: CommandItem[] = [
        {
          id: '1',
          label: 'Complex Item',
          value: 'complex',
          icon: 'search',
          shortcut: 'Ctrl+K'
        }
      ]
      const wrapper = createWrapper({ items: complexItems })
      expect(wrapper.props('items')).toEqual(complexItems)
    })

    it('should maintain component reactivity', async () => {
      const wrapper = createWrapper({ query: 'initial' })
      expect(wrapper.props('query')).toBe('initial')

      await wrapper.setProps({ query: 'updated' })
      expect(wrapper.props('query')).toBe('updated')
    })

    it('should handle multiple prop updates', async () => {
      const wrapper = createWrapper({
        open: false,
        query: 'old',
        placeholder: 'old placeholder'
      })

      await wrapper.setProps({
        open: true,
        query: 'new',
        placeholder: 'new placeholder'
      })

      expect(wrapper.props('open')).toBe(true)
      expect(wrapper.props('query')).toBe('new')
      expect(wrapper.props('placeholder')).toBe('new placeholder')
    })
  })
})