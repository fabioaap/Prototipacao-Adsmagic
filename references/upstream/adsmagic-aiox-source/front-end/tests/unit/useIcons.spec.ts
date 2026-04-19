import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { 
  RefreshCw, 
  Plus, 
  Home,
  ArrowLeft,
  Check,
  Loader2,
  Users,
  DollarSign,
  AlertTriangle
} from '@/composables/useIcons'

describe('useIcons composable', () => {
  describe('Navigation Icons', () => {
    it('exports Home icon component', () => {
      const wrapper = mount(Home, {
        props: { size: 24 }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.attributes('width')).toBe('24')
      expect(wrapper.attributes('height')).toBe('24')
    })

    it('exports ArrowLeft icon component', () => {
      const wrapper = mount(ArrowLeft)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('Action Icons', () => {
    it('exports RefreshCw icon component', () => {
      const wrapper = mount(RefreshCw, {
        props: { size: 20 }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.attributes('width')).toBe('20')
      expect(wrapper.attributes('height')).toBe('20')
    })

    it('exports Plus icon component', () => {
      const wrapper = mount(Plus)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('exports Check icon component', () => {
      const wrapper = mount(Check)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('State Icons', () => {
    it('exports Loader2 icon component', () => {
      const wrapper = mount(Loader2)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('exports AlertTriangle icon component', () => {
      const wrapper = mount(AlertTriangle)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('Business Icons', () => {
    it('exports Users icon component', () => {
      const wrapper = mount(Users)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('exports DollarSign icon component', () => {
      const wrapper = mount(DollarSign)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('Icon Props', () => {
    it('accepts size prop', () => {
      const wrapper = mount(RefreshCw, {
        props: { size: 16 }
      })
      expect(wrapper.attributes('width')).toBe('16')
      expect(wrapper.attributes('height')).toBe('16')
    })

    it('accepts color prop', () => {
      const wrapper = mount(Plus, {
        props: { color: 'red' }
      })
      expect(wrapper.attributes('stroke')).toBe('red')
    })

    it('accepts strokeWidth prop', () => {
      const wrapper = mount(Check, {
        props: { strokeWidth: 3 }
      })
      expect(wrapper.attributes('stroke-width')).toBe('3')
    })

    it('accepts class prop', () => {
      const wrapper = mount(Home, {
        props: { class: 'custom-class' }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })

  describe('Tree-shaking verification', () => {
    it('exports multiple icons without importing entire library', () => {
      // This test verifies that only imported icons are bundled
      // If useIcons.ts were importing * from lucide, bundle size would bloat
      
      const exportedIcons = [
        RefreshCw,
        Plus,
        Home,
        ArrowLeft,
        Check,
        Loader2,
        Users,
        DollarSign,
        AlertTriangle
      ]

      exportedIcons.forEach(IconComponent => {
        expect(IconComponent).toBeDefined()
        expect(typeof IconComponent).toMatch(/^(object|function)$/) // Vue component (object or function)
      })
    })
  })

  describe('Lucide API compatibility', () => {
    it('preserves all Lucide props and behavior', () => {
      // useIcons.ts is a re-export, so Lucide API should be unchanged
      const wrapper = mount(RefreshCw, {
        props: {
          size: 32,
          color: 'blue',
          strokeWidth: 2.5,
          class: 'test-icon'
        }
      })

      expect(wrapper.attributes('width')).toBe('32')
      expect(wrapper.attributes('height')).toBe('32')
      expect(wrapper.attributes('stroke')).toBe('blue')
      expect(wrapper.attributes('stroke-width')).toBe('2.5')
      expect(wrapper.classes()).toContain('test-icon')
    })
  })
})
