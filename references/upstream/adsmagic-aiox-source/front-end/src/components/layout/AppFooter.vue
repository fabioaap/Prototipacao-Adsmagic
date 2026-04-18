<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface Props {
  showLinks?: boolean
  companyName?: string
}

withDefaults(defineProps<Props>(), {
  showLinks: true,
  companyName: 'AdsMagic',
})

const { t } = useI18n()

const currentYear = computed(() => new Date().getFullYear())

const links: FooterLink[] = [
  { label: t('footer.privacy'), href: '/privacy', external: false },
  { label: t('footer.terms'), href: '/terms', external: false },
  { label: t('footer.help'), href: '/help', external: false },
  { label: t('footer.contact'), href: '/contact', external: false },
]

const handleLinkClick = (link: FooterLink) => {
  if (link.external) {
    window.open(link.href, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <footer class="border-t bg-card text-card-foreground py-4 px-6">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Copyright -->
      <div class="text-sm text-muted-foreground">
        © {{ currentYear }} {{ companyName }}. {{ t('footer.allRightsReserved') }}
      </div>

      <!-- Links -->
      <nav v-if="showLinks" class="flex items-center gap-4">
        <template v-for="link in links" :key="link.href">
          <a
            v-if="link.external"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            @click="handleLinkClick(link)"
          >
            {{ link.label }}
          </a>
          <router-link
            v-else
            :to="link.href"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {{ link.label }}
          </router-link>
        </template>
      </nav>
    </div>
  </footer>
</template>
