import { createApp } from 'vue'
import { getLandingPageById } from '@/lib/manifest'
import '../../style.css'
import VendasWhatsappLandingView from './VendasWhatsappLandingView.vue'

const landingPage = getLandingPageById('lp-vendas-whatsapp')

document.title = landingPage.seoTitle ?? landingPage.name

createApp(VendasWhatsappLandingView).mount('#app')