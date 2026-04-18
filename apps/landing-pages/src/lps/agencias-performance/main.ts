import { createApp } from 'vue'
import { getLandingPageById } from '@/lib/manifest'
import '../../style.css'
import AgenciasPerformanceLandingView from './AgenciasPerformanceLandingView.vue'

const landingPage = getLandingPageById('lp-para-agencias')

document.title = landingPage.seoTitle ?? landingPage.name

createApp(AgenciasPerformanceLandingView).mount('#app')