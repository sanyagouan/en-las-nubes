/**
 * Cookie Consent Manager para GDPR/LOPD compliance
 * Implementación completa para En las Nubes Restobar
 */

class CookieConsent {
  constructor () {
    this.consentGiven = false
    this.preferences = {
      necessary: true, // Cookies esenciales (siempre activas)
      analytics: false, // Google Analytics, etc.
      marketing: false, // Redes sociales, publicidad
      functional: false // Google Fonts, mapas, etc.
    }
    this.init()
  }

  init () {
    // Verificar si ya hay consentimiento guardado
    const saved = localStorage.getItem('cookie-consent')
    if (saved) {
      this.preferences = JSON.parse(saved)
      this.consentGiven = true
      this.applyConsent()
    } else {
      // Mostrar banner de consentimiento
      setTimeout(() => this.showConsentBanner(), 1000)
    }
  }

  showConsentBanner () {
    const banner = document.createElement('div')
    banner.id = 'cookie-banner'
    banner.setAttribute('role', 'alertdialog')
    banner.setAttribute('aria-labelledby', 'cookie-title')
    banner.setAttribute('aria-describedby', 'cookie-description')
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, rgba(26, 32, 44, 0.98), rgba(45, 55, 72, 0.95));
      color: rgba(226, 232, 240, 0.95);
      padding: 1.5rem;
      z-index: 9999;
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(226, 232, 240, 0.1);
      transform: translateY(100%);
      transition: transform 0.4s ease;
    `

    banner.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; display: grid; gap: 1rem; grid-template-columns: 1fr auto;">
        <div>
          <h3 id="cookie-title" style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600;">
            🍪 Privacidad y Cookies
          </h3>
          <p id="cookie-description" style="margin: 0; line-height: 1.5; font-size: 0.95rem;">
            Utilizamos cookies esenciales para el funcionamiento básico del sitio.
            Para análisis y contenido personalizado, necesitamos tu consentimiento.
            Puedes cambiar tus preferencias en cualquier momento.
            <a href="#politica-privacidad" style="color: rgba(144, 205, 244, 0.9); text-decoration: underline;">Ver política completa</a>
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <button id="customize-cookies" style="
            padding: 0.65rem 1.2rem;
            border: 1px solid rgba(226, 232, 240, 0.3);
            background: rgba(255, 255, 255, 0.1);
            color: rgba(226, 232, 240, 0.9);
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          " aria-label="Personalizar cookies">
            Personalizar
          </button>
          <button id="accept-all-cookies" style="
            padding: 0.65rem 1.5rem;
            background: var(--sunset-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
          " aria-label="Aceptar todas las cookies">
            Aceptar todas
          </button>
          <button id="reject-all-cookies" style="
            padding: 0.65rem 1.2rem;
            border: 1px solid rgba(226, 232, 240, 0.3);
            background: transparent;
            color: rgba(226, 232, 240, 0.7);
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          " aria-label="Rechazar cookies no esenciales">
            Rechazar
          </button>
        </div>
      </div>
    `

    document.body.appendChild(banner)

    // Animar entrada
    setTimeout(() => {
      banner.style.transform = 'translateY(0)'
    }, 100)

    // Event listeners
    document.getElementById('accept-all-cookies').addEventListener('click', () => {
      this.acceptAll()
    })

    document.getElementById('reject-all-cookies').addEventListener('click', () => {
      this.rejectAll()
    })

    document.getElementById('customize-cookies').addEventListener('click', () => {
      this.showCustomizationPanel()
    })
  }

  showCustomizationPanel () {
    const panel = document.createElement('div')
    panel.id = 'cookie-customization'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-labelledby', 'custom-title')
    panel.setAttribute('aria-modal', 'true')
    panel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      backdrop-filter: blur(4px);
    `

    panel.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(26, 32, 44, 0.98), rgba(45, 55, 72, 0.95));
        border-radius: 1rem;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        border: 1px solid rgba(226, 232, 240, 0.1);
      ">
        <h2 id="custom-title" style="margin: 0 0 1.5rem 0; font-size: 1.3rem; font-weight: 700;">
          Configuración de Cookies
        </h2>

        <div style="display: grid; gap: 1.5rem;">
          <div class="cookie-option">
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
              <input type="checkbox" id="necessary-cookies" checked disabled style="margin-top: 0.25rem;">
              <div style="flex: 1;">
                <label for="necessary-cookies" style="font-weight: 600; display: block; margin-bottom: 0.25rem;">
                  Cookies Esenciales
                </label>
                <p style="margin: 0; font-size: 0.9rem; color: rgba(226, 232, 240, 0.7); line-height: 1.4;">
                  Necesarias para el funcionamiento básico del sitio (sesión, carrito, seguridad).
                </p>
              </div>
            </div>
          </div>

          <div class="cookie-option">
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
              <input type="checkbox" id="analytics-cookies" style="margin-top: 0.25rem;">
              <div style="flex: 1;">
                <label for="analytics-cookies" style="font-weight: 600; display: block; margin-bottom: 0.25rem;">
                  Cookies de Análisis
                </label>
                <p style="margin: 0; font-size: 0.9rem; color: rgba(226, 232, 240, 0.7); line-height: 1.4;">
                  Nos ayudan a entender cómo usas el sitio para mejorarlo (Google Analytics).
                </p>
              </div>
            </div>
          </div>

          <div class="cookie-option">
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
              <input type="checkbox" id="functional-cookies" style="margin-top: 0.25rem;">
              <div style="flex: 1;">
                <label for="functional-cookies" style="font-weight: 600; display: block; margin-bottom: 0.25rem;">
                  Cookies Funcionales
                </label>
                <p style="margin: 0; font-size: 0.9rem; color: rgba(226, 232, 240, 0.7); line-height: 1.4;">
                  Mejoran la experiencia (fuentes personalizadas, mapas, contenido externo).
                </p>
              </div>
            </div>
          </div>

          <div class="cookie-option">
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
              <input type="checkbox" id="marketing-cookies" style="margin-top: 0.25rem;">
              <div style="flex: 1;">
                <label for="marketing-cookies" style="font-weight: 600; display: block; margin-bottom: 0.25rem;">
                  Cookies de Marketing
                </label>
                <p style="margin: 0; font-size: 0.9rem; color: rgba(226, 232, 240, 0.7); line-height: 1.4;">
                  Para publicidad personalizada y redes sociales.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(226, 232, 240, 0.1);">
          <button id="save-cookie-preferences" style="
            padding: 0.75rem 1.5rem;
            background: var(--sunset-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
          ">
            Guardar preferencias
          </button>
        </div>
      </div>
    `

    document.body.appendChild(panel)

    // Event listeners
    document.getElementById('save-cookie-preferences').addEventListener('click', () => {
      this.saveCustomPreferences()
    })

    // Cerrar al hacer clic fuera
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        this.closeCustomizationPanel()
      }
    })
  }

  closeCustomizationPanel () {
    const panel = document.getElementById('cookie-customization')
    if (panel) {
      panel.remove()
    }
  }

  saveCustomPreferences () {
    this.preferences.analytics = document.getElementById('analytics-cookies').checked
    this.preferences.functional = document.getElementById('functional-cookies').checked
    this.preferences.marketing = document.getElementById('marketing-cookies').checked

    this.saveConsent()
    this.applyConsent()
    this.closeCustomizationPanel()
    this.hideBanner()
  }

  acceptAll () {
    this.preferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true
    }
    this.saveConsent()
    this.applyConsent()
    this.hideBanner()
  }

  rejectAll () {
    this.preferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false
    }
    this.saveConsent()
    this.applyConsent()
    this.hideBanner()
  }

  saveConsent () {
    this.consentGiven = true
    localStorage.setItem('cookie-consent', JSON.stringify(this.preferences))

    // Guardar timestamp para cumplimiento LOPD
    localStorage.setItem('cookie-consent-timestamp', new Date().toISOString())
  }

  applyConsent () {
    // Aplicar preferencias de cookies
    if (!this.preferences.analytics) {
      // Bloquear Google Analytics
      window['ga-disable-GA_MEASUREMENT_ID'] = true
    }

    if (!this.preferences.functional) {
      // Cargar fuentes locales en lugar de Google Fonts
      this.loadLocalFonts()
    }

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('cookie-consent-applied', {
      detail: this.preferences
    }))
  }

  loadLocalFonts () {
    // Implementar fallback de fuentes locales
    const style = document.createElement('style')
    style.textContent = `
      @font-face {
        font-family: 'Playfair Display';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Georgia'), local('Times New Roman');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Arial'), local('Helvetica');
      }
    `
    document.head.appendChild(style)
  }

  hideBanner () {
    const banner = document.getElementById('cookie-banner')
    if (banner) {
      banner.style.transform = 'translateY(100%)'
      setTimeout(() => banner.remove(), 400)
    }
  }

  // Método para mostrar panel de preferencias después
  showPreferences () {
    this.showCustomizationPanel()
  }
}

// Inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent()
  })
}

export default CookieConsent
