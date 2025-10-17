/**
 * Controles de accesibilidad WCAG 2.1 AAA para En las Nubes Restobar
 * Implementación completa de mejoras de accesibilidad
 */

class AccessibilityControls {
  constructor () {
    this.init()
  }

  init () {
    this.createAccessibilityPanel()
    this.setupKeyboardNavigation()
    this.setupAriaLiveRegions()
    this.setupFocusManagement()
    this.setupReducedMotion()
    this.setupHighContrast()
  }

  createAccessibilityPanel () {
    const panel = document.createElement('div')
    panel.id = 'accessibility-panel'
    panel.setAttribute('role', 'region')
    panel.setAttribute('aria-label', 'Controles de accesibilidad')
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      right: -300px;
      transform: translateY(-50%);
      width: 280px;
      background: linear-gradient(135deg, rgba(26, 32, 44, 0.98), rgba(45, 55, 72, 0.95));
      color: rgba(226, 232, 240, 0.95);
      padding: 1.5rem;
      border-radius: 0.5rem 0 0 0.5rem;
      z-index: 1000;
      transition: right 0.3s ease;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(12px);
    `

    const toggle = document.createElement('button')
    toggle.id = 'accessibility-toggle'
    toggle.setAttribute('aria-label', 'Abrir panel de accesibilidad')
    toggle.setAttribute('aria-expanded', 'false')
    toggle.style.cssText = `
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      width: 48px;
      height: 96px;
      background: linear-gradient(135deg, #4299E1, #667eea);
      color: white;
      border: none;
      border-radius: 0.5rem 0 0 0.5rem;
      cursor: pointer;
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: all 0.3s ease;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
    `
    toggle.innerHTML = '♿'
    toggle.title = 'Accesibilidad'

    panel.innerHTML = `
      <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 600;">
        Accesibilidad
      </h3>

      <div style="display: grid; gap: 1rem;">
        <div class="access-control">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="high-contrast-mode" style="width: 18px; height: 18px;">
            <span>Alto contraste</span>
          </label>
        </div>

        <div class="access-control">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="reduce-motion" style="width: 18px; height: 18px;">
            <span>Reducir movimiento</span>
          </label>
        </div>

        <div class="access-control">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="large-text" style="width: 18px; height: 18px;">
            <span>Texto grande</span>
          </label>
        </div>

        <div class="access-control">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="dyslexia-font" style="width: 18px; height: 18px;">
            <span>Fuentes disléxicas</span>
          </label>
        </div>

        <div class="access-control">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="focus-indicators" checked style="width: 18px; height: 18px;">
            <span>Indicadores de foco</span>
          </label>
        </div>

        <div class="access-control">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="screen-reader-mode" style="width: 18px; height: 18px;">
            <span>Modo lector de pantalla</span>
          </label>
        </div>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(226, 232, 240, 0.2);">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 600;">Atajos de teclado</h4>
        <ul style="margin: 0; padding-left: 1rem; font-size: 0.85rem; line-height: 1.4;">
          <li><kbd>Alt</kbd> + <kbd>0</kbd> - Panel accesibilidad</li>
          <li><kbd>Alt</kbd> + <kbd>1</kbd> - Ir al contenido</li>
          <li><kbd>Alt</kbd> + <kbd>2</kbd> - Ir al menú</li>
          <li><kbd>Alt</kbd> + <kbd>3</kbd> - Ir a reservas</li>
          <li><kbd>Alt</kbd> + <kbd>S</kbd> - Saltar navegación</li>
        </ul>
      </div>
    `

    document.body.appendChild(panel)
    document.body.appendChild(toggle)

    // Event listeners
    toggle.addEventListener('click', () => this.togglePanel())

    // Accesibilidad controls
    document.getElementById('high-contrast-mode').addEventListener('change', (e) => {
      this.toggleHighContrast(e.target.checked)
    })

    document.getElementById('reduce-motion').addEventListener('change', (e) => {
      this.toggleReducedMotion(e.target.checked)
    })

    document.getElementById('large-text').addEventListener('change', (e) => {
      this.toggleLargeText(e.target.checked)
    })

    document.getElementById('dyslexia-font').addEventListener('change', (e) => {
      this.toggleDyslexiaFont(e.target.checked)
    })

    document.getElementById('focus-indicators').addEventListener('change', (e) => {
      this.toggleFocusIndicators(e.target.checked)
    })

    document.getElementById('screen-reader-mode').addEventListener('change', (e) => {
      this.toggleScreenReaderMode(e.target.checked)
    })

    // Keyboard shortcuts
    this.setupKeyboardShortcuts()
  }

  togglePanel () {
    const panel = document.getElementById('accessibility-panel')
    const toggle = document.getElementById('accessibility-toggle')
    const isOpen = panel.style.right === '0px'

    if (isOpen) {
      panel.style.right = '-300px'
      toggle.setAttribute('aria-expanded', 'false')
    } else {
      panel.style.right = '0px'
      toggle.setAttribute('aria-expanded', 'true')
    }
  }

  toggleHighContrast (enabled) {
    if (enabled) {
      document.documentElement.style.setProperty('--high-contrast-filter', 'contrast(1.5) brightness(0.9)')
      document.body.classList.add('high-contrast')
      this.addHighContrastStyles()
    } else {
      document.documentElement.style.removeProperty('--high-contrast-filter')
      document.body.classList.remove('high-contrast')
      this.removeHighContrastStyles()
    }
  }

  addHighContrastStyles () {
    const style = document.createElement('style')
    style.id = 'high-contrast-styles'
    style.textContent = `
      .high-contrast * {
        border-color: #000000 !important;
        box-shadow: none !important;
      }
      .high-contrast .hero-text-gradient,
      .high-contrast .cloud-text-gradient {
        background: #000000 !important;
        -webkit-background-clip: unset !important;
        background-clip: unset !important;
        color: #000000 !important;
      }
      .high-contrast input,
      .high-contrast button,
      .high-contrast a {
        border: 2px solid #000000 !important;
      }
      .high-contrast .navbar-cloud {
        background: #FFFFFF !important;
        border-bottom: 2px solid #000000 !important;
      }
    `
    document.head.appendChild(style)
  }

  removeHighContrastStyles () {
    const style = document.getElementById('high-contrast-styles')
    if (style) style.remove()
  }

  toggleReducedMotion (enabled) {
    if (enabled) {
      document.documentElement.style.setProperty('--transition-base', '0s')
      document.documentElement.style.setProperty('--transition-slow', '0s')
      this.addReducedMotionStyles()
    } else {
      document.documentElement.style.removeProperty('--transition-base')
      document.documentElement.style.removeProperty('--transition-slow')
      this.removeReducedMotionStyles()
    }
  }

  addReducedMotionStyles () {
    const style = document.createElement('style')
    style.id = 'reduced-motion-styles'
    style.textContent = `
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      .hero-particles {
        display: none !important;
      }
      .hero-layer {
        animation: none !important;
      }
    `
    document.head.appendChild(style)
  }

  removeReducedMotionStyles () {
    const style = document.getElementById('reduced-motion-styles')
    if (style) style.remove()
  }

  toggleLargeText (enabled) {
    if (enabled) {
      document.documentElement.style.fontSize = '118%'
      document.body.classList.add('large-text')
    } else {
      document.documentElement.style.fontSize = ''
      document.body.classList.remove('large-text')
    }
  }

  toggleDyslexiaFont (enabled) {
    if (enabled) {
      document.body.classList.add('dyslexia-font')
      this.addDyslexiaFontStyles()
    } else {
      document.body.classList.remove('dyslexia-font')
      this.removeDyslexiaFontStyles()
    }
  }

  addDyslexiaFontStyles () {
    const style = document.createElement('style')
    style.id = 'dyslexia-font-styles'
    style.textContent = `
      .dyslexia-font {
        font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important;
        line-height: 1.8 !important;
        letter-spacing: 0.1em !important;
        word-spacing: 0.2em !important;
      }
      .dyslexia-font h1, .dyslexia-font h2, .dyslexia-font h3 {
        letter-spacing: 0.15em !important;
      }
    `
    document.head.appendChild(style)
  }

  removeDyslexiaFontStyles () {
    const style = document.getElementById('dyslexia-font-styles')
    if (style) style.remove()
  }

  toggleFocusIndicators (enabled) {
    if (enabled) {
      document.body.classList.add('enhanced-focus')
      this.addEnhancedFocusStyles()
    } else {
      document.body.classList.remove('enhanced-focus')
      this.removeEnhancedFocusStyles()
    }
  }

  addEnhancedFocusStyles () {
    const style = document.createElement('style')
    style.id = 'enhanced-focus-styles'
    style.textContent = `
      .enhanced-focus *:focus-visible {
        outline: 3px solid #4299E1 !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
        box-shadow: 0 0 0 5px rgba(66, 153, 225, 0.3) !important;
      }
      .enhanced-focus a:focus-visible,
      .enhanced-focus button:focus-visible {
        outline: 3px solid #667eea !important;
        box-shadow: 0 0 0 5px rgba(102, 126, 234, 0.3) !important;
      }
    `
    document.head.appendChild(style)
  }

  removeEnhancedFocusStyles () {
    const style = document.getElementById('enhanced-focus-styles')
    if (style) style.remove()
  }

  toggleScreenReaderMode (enabled) {
    if (enabled) {
      document.body.classList.add('screen-reader-mode')
      this.addScreenReaderStyles()
    } else {
      document.body.classList.remove('screen-reader-mode')
      this.removeScreenReaderStyles()
    }
  }

  addScreenReaderStyles () {
    const style = document.createElement('style')
    style.id = 'screen-reader-styles'
    style.textContent = `
      .screen-reader-mode .hero-particles,
      .screen-reader-mode .hero-layer {
        display: none !important;
      }
      .screen-reader-mode *:not(.sr-only) {
        position: static !important;
      }
    `
    document.head.appendChild(style)
  }

  removeScreenReaderStyles () {
    const style = document.getElementById('screen-reader-styles')
    if (style) style.remove()
  }

  setupKeyboardNavigation () {
    // Navegación por teclado mejorada
    document.addEventListener('keydown', (e) => {
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation')
    })

    // Skip links mejorados
    this.enhanceSkipLinks()
  }

  enhanceSkipLinks () {
    const skipLinks = document.querySelectorAll('.skip-link')
    skipLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const target = document.querySelector(link.getAttribute('href'))
        if (target) {
          target.setAttribute('tabindex', '-1')
          target.focus()
          setTimeout(() => {
            target.removeAttribute('tabindex')
          }, 1000)
        }
      })
    })
  }

  setupAriaLiveRegions () {
    // Crear región para anuncios dinámicos
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.id = 'accessibility-announcements'
    document.body.appendChild(liveRegion)
  }

  announce (message) {
    const liveRegion = document.getElementById('accessibility-announcements')
    if (liveRegion) {
      liveRegion.textContent = message
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  setupFocusManagement () {
    // Trampas de foco para modales
    this.setupFocusTraps()
  }

  setupFocusTraps () {
    // Implementar trampas de foco para cualquier elemento con role="dialog"
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.getAttribute('role') === 'dialog') {
            this.createFocusTrap(node)
          }
        })
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  createFocusTrap (element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    })
  }

  setupReducedMotion () {
    // Detectar preferencia de movimiento reducido del usuario
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.toggleReducedMotion(true)
      document.getElementById('reduce-motion').checked = true
    }
  }

  setupHighContrast () {
    // Detectar preferencia de alto contraste
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.toggleHighContrast(true)
      document.getElementById('high-contrast-mode').checked = true
    }
  }

  setupKeyboardShortcuts () {
    document.addEventListener('keydown', (e) => {
      if (e.altKey) {
        switch (e.key) {
          case '0':
            e.preventDefault()
            this.togglePanel()
            break
          case '1':
            e.preventDefault()
            document.getElementById('hero')?.focus()
            this.announce('Navegando al contenido principal')
            break
          case '2':
            e.preventDefault()
            document.getElementById('menu')?.focus()
            this.announce('Navegando al menú')
            break
          case '3':
            e.preventDefault()
            document.getElementById('reservas')?.focus()
            this.announce('Navegando a reservas')
            break
          case 's':
          case 'S':
            e.preventDefault()
            document.querySelector('.skip-link')?.click()
            break
        }
      }
    })
  }
}

// Clase de ayuda para contenido oculto
export class ScreenReaderOnly {
  static create (text) {
    const element = document.createElement('span')
    element.className = 'sr-only'
    element.textContent = text
    element.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    return element
  }
}

// Inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityControls = new AccessibilityControls()
  })
}

export default AccessibilityControls
