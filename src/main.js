import '@styles/main.css'
import 'aos/dist/aos.css'

import { initializeApp } from './modules/app.js'
import { setupNavigationBehavior } from './modules/navigation.js'
import { registerCloudServiceWorker } from './modules/pwa.js'
import { initializeThemeToggle } from './modules/theme.js'
import { initPerformanceBudget } from './modules/performance.js'

const scheduleIdleTask = (task) => {
  if (typeof window === 'undefined') {
    task()
    return
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      (deadline) => {
        if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
          task()
        } else {
          window.setTimeout(task, 0)
        }
      },
      { timeout: 1500 }
    )
    return
  }

  window.setTimeout(task, 200)
}

const createLazyModule = (loader) => {
  let loadPromise
  return () => {
    if (!loadPromise) {
      loadPromise = loader().catch((error) => {
        console.error('Fallo al cargar módulo diferido:', error)
        loadPromise = undefined
      })
    }
    return loadPromise
  }
}

const observeAndLoad = (element, load) => {
  if (!element) return
  if (typeof window === 'undefined') {
    load()
    return
  }

  const triggerLoad = () => {
    scheduleIdleTask(load)
  }

  const fallbackTimeout = window.setTimeout(triggerLoad, 8000)

  if (!('IntersectionObserver' in window)) {
    window.clearTimeout(fallbackTimeout)
    triggerLoad()
    return
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        obs.disconnect()
        window.clearTimeout(fallbackTimeout)
        triggerLoad()
      }
    })
  }, { rootMargin: '0px 0px 200px 0px', threshold: 0.1 })

  observer.observe(element)
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
  setupNavigationBehavior()
  initializeThemeToggle()

  const loadMenuExperience = createLazyModule(async () => {
    const { initializeMenuExperience } = await import('./modules/menu-experience.js')
    initializeMenuExperience()
  })

  const loadReservationsExperience = createLazyModule(async () => {
    const { initializeReservationsExperience } = await import('./modules/reservas-experience.js')
    initializeReservationsExperience()
  })

  const loadHeroCinematics = createLazyModule(async () => {
    const { initializeHeroCinematics } = await import('./modules/hero-animations.js')
    await initializeHeroCinematics()
  })

  const menuSection = document.getElementById('menu')
  const reservasSection = document.getElementById('reservas')
  const skipLink = document.querySelector('[data-skip-link]')

  observeAndLoad(menuSection, loadMenuExperience)
  observeAndLoad(reservasSection, loadReservationsExperience)

  if (skipLink) {
    skipLink.addEventListener('click', () => {
      loadMenuExperience()
      if (menuSection) {
        menuSection.focus({ preventScroll: true })
      }
    })
  }

  // El héroe se difiere para liberar el hilo principal inmediatamente tras la carga inicial
  scheduleIdleTask(loadHeroCinematics)
})

window.addEventListener('load', () => {
  registerCloudServiceWorker()
  initPerformanceBudget()
})
