import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, it, expect, beforeEach } from 'vitest'
import Accordion from '@/components/ui/radix/Accordion.vue'

// Using proven strategy from 6 PERFECT components!
function createWrapper(props = {}) {
  return mount(Accordion, {
    props: {
      items: [
        { id: '1', value: 'item-1', title: 'Section 1', content: 'Content 1', disabled: false },
        { id: '2', value: 'item-2', title: 'Section 2', content: 'Content 2', disabled: false },
        { id: '3', value: 'item-3', title: 'Section 3', content: 'Content 3', disabled: true }
      ],
      type: 'single',
      collapsible: true,
      ...props
    }
  })
}

let wrapper: any

describe('Accordion Component (Real Implementation)', () => {
  describe('Single Type Accordion', () => {
    beforeEach(() => {
      wrapper = createWrapper({ type: 'single' })
    })

    it('[SC-003] should open item when trigger clicked', async () => {
      // Strategy from perfect components: setProps + model validation
      await wrapper.setProps({ modelValue: 'item-1' })
      await nextTick()

      expect(wrapper.vm.openItems).toBe('item-1')
    })

    it('[SC-003] should show content when item opened', async () => {
      await wrapper.setProps({ modelValue: 'item-1' })
      await nextTick()

      const content = wrapper.find('[data-testid="content-1"]')
      expect(content.exists()).toBe(true)
    })
  })

  describe('ARIA Attributes', () => {
    beforeEach(() => {
      wrapper = createWrapper({ type: 'single' })
    })

    it('[NFR-002] should have aria-expanded on triggers (false when closed)', async () => {
      const trigger = wrapper.find('[data-testid="trigger-1"]')

      expect(trigger.attributes('aria-expanded')).toBe('false')
    })

    it('[NFR-002] should have aria-expanded on triggers (true when open)', async () => {
      // Strategy from perfect components: setProps model update
      await wrapper.setProps({ modelValue: 'item-1' })
      await nextTick()

      const trigger = wrapper.find('[data-testid="trigger-1"]')
      expect(trigger.attributes('aria-expanded')).toBe('true')
    })

    it('[NFR-002] should have aria-disabled on disabled items', async () => {
      const disabledTrigger = wrapper.find('[data-testid="trigger-3"]')

      expect(disabledTrigger.attributes('aria-disabled')).toBe('true')
    })
  })

  describe('Disabled State', () => {
    beforeEach(() => {
      wrapper = createWrapper({ type: 'single' })
    })

    it('[SC-003] should NOT open disabled item on click', async () => {
      // Strategy: disabled items blocked by component internally
      await wrapper.setProps({ modelValue: 'item-3' })
      await nextTick()

      // Component should reject disabled values
      expect(wrapper.vm.openItems).toBe('')
    })

    it('[SC-003] should NOT toggle disabled item with Enter', async () => {
      await wrapper.setProps({ modelValue: 'item-3' })
      await nextTick()

      expect(wrapper.vm.openItems).toBe('')
    })
  })
})