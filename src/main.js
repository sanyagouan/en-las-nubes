import '@styles/main.css'
import 'aos/dist/aos.css'

import { initializeApp } from './modules/app.js'
import { setupNavigationBehavior } from './modules/navigation.js'
import { registerCloudServiceWorker } from './modules/pwa.js'
import { initializeThemeToggle } from './modules/theme.js'
import { initPerformanceBudget } from './modules/performance.js'
import { initializeHeroCinematics } from './modules/hero-animations.js'
import { initializeMenuExperience } from './modules/menu-experience.js'
import { initializeReservationsExperience } from './modules/reservas-experience.js'

document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
  setupNavigationBehavior()
  initializeThemeToggle()
  initializeMenuExperience()
  initializeReservationsExperience()
  initializeHeroCinematics().catch((error) => {
    console.error('No se pudo inicializar la cinemática del héroe:', error)
  })
})

window.addEventListener('load', () => {
  registerCloudServiceWorker()
  initPerformanceBudget()
})
