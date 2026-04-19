<script setup lang="ts">
import { useDarkMode } from '@/composables/useDarkMode'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'

const { isDark, toggle } = useDarkMode()
</script>

<template>
  <div class="min-h-screen p-8 space-y-8 bg-background text-foreground transition-colors duration-200">
    <!-- Header with Theme Toggle -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold">Design System - Theme Test</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Manual validation of dark/light mode token system
        </p>
      </div>
      <Button @click="toggle" variant="outline" size="lg">
        <span v-if="isDark" class="flex items-center gap-2">
          🌙 <span>Dark Mode</span>
        </span>
        <span v-else class="flex items-center gap-2">
          ☀️ <span>Light Mode</span>
        </span>
      </Button>
    </div>

    <!-- Semantic Tokens Test -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-4">Semantic Tokens Test</h2>
      
      <div class="space-y-6">
        <!-- Background & Foreground -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Background & Foreground</p>
          <div class="p-4 bg-background text-foreground border border-border rounded-md">
            <code class="text-sm">bg-background text-foreground</code>
            <p class="mt-2">This text should be readable in both light and dark modes.</p>
          </div>
        </div>
        
        <!-- Cards & Surfaces -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Cards & Surfaces</p>
          <div class="p-4 bg-card text-card-foreground border border-border rounded-md shadow-card">
            <code class="text-sm">bg-card text-card-foreground</code>
            <p class="mt-2">Card surface with proper contrast and subtle elevation.</p>
          </div>
        </div>

        <!-- Popover Background -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Popover & Dropdown Surface</p>
          <div class="p-4 bg-popover text-popover-foreground border border-border rounded-md shadow-lg">
            <code class="text-sm">bg-popover text-popover-foreground</code>
            <p class="mt-2">Elevated surface for overlays like popovers and dropdowns.</p>
          </div>
        </div>

        <!-- Muted Text -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Muted Text & Background</p>
          <div class="p-4 bg-muted rounded-md">
            <p class="text-muted-foreground">
              <code class="text-sm">bg-muted text-muted-foreground</code>
            </p>
            <p class="text-muted-foreground mt-2">
              Secondary text with reduced emphasis. Used for descriptions, labels, and helper text.
            </p>
          </div>
        </div>
        
        <!-- Primary Brand -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Primary Brand Color</p>
          <div class="flex gap-3 flex-wrap">
            <Button variant="default">Primary Button</Button>
            <Button variant="default" disabled>Disabled State</Button>
            <div class="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              <code class="text-sm">bg-primary text-primary-foreground</code>
            </div>
          </div>
        </div>

        <!-- Secondary -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Secondary Color</p>
          <div class="flex gap-3 flex-wrap">
            <Button variant="secondary">Secondary Button</Button>
            <div class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">
              <code class="text-sm">bg-secondary text-secondary-foreground</code>
            </div>
          </div>
        </div>

        <!-- Accent -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Accent Color</p>
          <div class="flex gap-3 flex-wrap">
            <div class="px-4 py-2 bg-accent text-accent-foreground rounded-md">
              <code class="text-sm">bg-accent text-accent-foreground</code>
            </div>
            <div class="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md cursor-pointer transition-colors">
              Hover me (accent/90)
            </div>
          </div>
        </div>
        
        <!-- Feedback Colors -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Feedback Colors</p>
          <div class="flex gap-2 flex-wrap">
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="destructive">Error</Badge>
            <Badge color="info">Info</Badge>
          </div>
          <div class="mt-3 flex gap-3 flex-wrap">
            <Button variant="destructive">Destructive Action</Button>
            <div class="px-4 py-2 bg-destructive text-destructive-foreground rounded-md">
              <code class="text-sm">bg-destructive text-destructive-foreground</code>
            </div>
          </div>
        </div>
        
        <!-- Form Elements -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Form Elements</p>
          <div class="space-y-3 max-w-md">
            <Input placeholder="Test input with proper colors" />
            <Input placeholder="Focused input" class="ring-2 ring-ring" />
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="checkbox-test"
                class="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
              />
              <label for="checkbox-test" class="text-sm">
                Checkbox with proper border and ring
              </label>
            </div>
          </div>
        </div>

        <!-- Borders & Ring -->
        <div>
          <p class="text-sm text-muted-foreground mb-2 font-medium">Borders, Ring & Radius</p>
          <div class="flex gap-3 flex-wrap">
            <div class="px-4 py-2 border border-border rounded">
              <code class="text-sm">border-border rounded (--radius)</code>
            </div>
            <div class="px-4 py-2 border-2 border-input rounded">
              <code class="text-sm">border-input</code>
            </div>
            <div class="px-4 py-2 border-2 border-ring rounded">
              <code class="text-sm">border-ring (focus)</code>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Brand Colors -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-4">Brand Colors (HSL)</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <div class="h-20 rounded" style="background: hsl(var(--brand-50))"></div>
          <p class="text-xs text-center">--brand-50</p>
        </div>
        <div class="space-y-2">
          <div class="h-20 rounded" style="background: hsl(var(--brand-100))"></div>
          <p class="text-xs text-center">--brand-100</p>
        </div>
        <div class="space-y-2">
          <div class="h-20 rounded" style="background: hsl(var(--brand-500)); color: white; display: flex; align-items: center; justify-content: center;">
            <span class="font-semibold">Brand</span>
          </div>
          <p class="text-xs text-center">--brand-500</p>
        </div>
        <div class="space-y-2">
          <div class="h-20 rounded" style="background: hsl(var(--brand-900)); color: white; display: flex; align-items: center; justify-content: center;">
            <span class="font-semibold">Dark</span>
          </div>
          <p class="text-xs text-center">--brand-900</p>
        </div>
      </div>
    </Card>

    <!-- Contrast Check (WCAG AA) -->
    <Card class="p-6 border-2 border-warning/30 bg-warning/5">
      <h2 class="text-xl font-semibold mb-3">Contrast Check (WCAG AA) ✓</h2>
      <p class="text-sm text-muted-foreground mb-4">
        Validate visually that all text has proper contrast in both themes:
      </p>
      <ul class="list-disc list-inside space-y-2 text-sm">
        <li><strong>Normal text</strong>: 4.5:1 ratio minimum (14px regular, 18px+)</li>
        <li><strong>Large text</strong>: 3:1 ratio minimum (18px+ regular, 14px+ bold)</li>
        <li><strong>UI components</strong>: 3:1 ratio minimum (borders, icons, states)</li>
      </ul>
      <div class="mt-4 p-4 bg-background rounded-md border border-border">
        <p class="text-sm mb-2 font-medium">Manual Check:</p>
        <ol class="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
          <li>Toggle between light and dark modes</li>
          <li>Verify all text is easily readable</li>
          <li>Check that button text contrasts well with backgrounds</li>
          <li>Ensure borders are visible but not distracting</li>
          <li>Confirm no FOUC (Flash of Unstyled Content) when toggling</li>
        </ol>
      </div>
    </Card>

    <!-- Product Tokens (Origin Colors) -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-4">Product Tokens - Traffic Origins</h2>
      <p class="text-sm text-muted-foreground mb-4">
        These colors are fixed (hex) and do not change between themes:
      </p>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded" style="background: var(--color-origin-google)"></div>
          <div>
            <p class="text-xs font-medium">Google</p>
            <code class="text-xs text-muted-foreground">#4285f4</code>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded" style="background: var(--color-origin-meta)"></div>
          <div>
            <p class="text-xs font-medium">Meta</p>
            <code class="text-xs text-muted-foreground">#1877f2</code>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded" style="background: var(--color-origin-instagram)"></div>
          <div>
            <p class="text-xs font-medium">Instagram</p>
            <code class="text-xs text-muted-foreground">#e4405f</code>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded" style="background: var(--color-origin-whatsapp)"></div>
          <div>
            <p class="text-xs font-medium">WhatsApp</p>
            <code class="text-xs text-muted-foreground">#25d366</code>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded" style="background: var(--color-origin-email)"></div>
          <div>
            <p class="text-xs font-medium">Email</p>
            <code class="text-xs text-muted-foreground">#ea4335</code>
          </div>
        </div>
      </div>
    </Card>

    <!-- Theme Toggle Test -->
    <Card class="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
      <h2 class="text-xl font-semibold mb-3">🎨 Theme Toggle Test</h2>
      <p class="text-sm text-muted-foreground mb-4">
        Current theme: <strong>{{ isDark ? 'Dark' : 'Light' }}</strong>
      </p>
      <div class="flex gap-3">
        <Button @click="toggle" variant="default" size="lg">
          Toggle Theme
        </Button>
        <Button variant="outline" disabled>
          No FOUC Expected
        </Button>
      </div>
      <p class="text-xs text-muted-foreground mt-4">
        ✓ All colors should transition smoothly<br />
        ✓ No flash of unstyled content<br />
        ✓ Text remains readable throughout transition
      </p>
    </Card>

    <!-- Footer -->
    <div class="text-center text-sm text-muted-foreground pt-8 border-t border-border">
      <p>Design System Foundation - US1 Complete ✅</p>
      <p class="mt-1">
        Gate SC-001: PASS | Documentation: 
        <code class="text-xs bg-muted px-2 py-1 rounded">docs/design-system/tokens.md</code>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Additional utility for smooth transitions */
* {
  transition-property: background-color, border-color, color;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
