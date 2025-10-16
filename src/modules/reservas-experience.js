const RESERVATION_PHONE = '+34941578451'
const RESERVATION_WHATSAPP = '34941578451'

const formatDateForMessage = (value) => {
  if (!value) return 'fecha a confirmar'
  try {
    const date = new Date(value)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  } catch {
    return value
  }
}

const buildWhatsappMessage = (state) => {
  const dateLabel = formatDateForMessage(state.date)
  const timeLabel = state.time || 'horario abierto'
  const dinersLabel = state.diners ? `${state.diners} personas` : 'grupo por definir'
  const mood = state.mood ? `Preferencia: ${state.mood}.` : ''

  return `Hola, me gustaría reservar en En las Nubes Restobar para ${dinersLabel} el ${dateLabel} a las ${timeLabel}. ${mood} ¿Hay disponibilidad?`
}

function setupPlannerInteractions (form, preview, whatsappLink) {
  const state = {
    date: form.elements.date?.value || '',
    time: form.elements.time?.value || '',
    diners: form.querySelector('[data-diners][aria-pressed="true"]')?.dataset.diners || '',
    mood: form.elements.mood?.value || ''
  }

  const refresh = () => {
    const message = buildWhatsappMessage(state)
    preview.textContent = message
    if (whatsappLink) {
      whatsappLink.href = `https://wa.me/${RESERVATION_WHATSAPP}?text=${encodeURIComponent(message)}`
    }
  }

  form.addEventListener('input', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) return

    if (target.name === 'date') state.date = target.value
    if (target.name === 'time') state.time = target.value
    if (target.name === 'mood') state.mood = target.value

    refresh()
  })

  form.querySelectorAll('[data-diners]').forEach((button) => {
    button.addEventListener('click', () => {
      form.querySelectorAll('[data-diners]').forEach((item) => {
        item.setAttribute('aria-pressed', 'false')
        item.classList.remove('is-active')
      })
      button.setAttribute('aria-pressed', 'true')
      button.classList.add('is-active')
      state.diners = button.dataset.diners || ''
      refresh()
    })
  })

  const copyButton = form.querySelector('[data-copy-message]')
  if (copyButton) {
    copyButton.addEventListener('click', async (event) => {
      event.preventDefault()
      try {
        await navigator.clipboard.writeText(buildWhatsappMessage(state))
        copyButton.dataset.feedback = 'copiado'
        copyButton.classList.add('is-success')
        setTimeout(() => {
          copyButton.classList.remove('is-success')
          delete copyButton.dataset.feedback
        }, 1600)
      } catch (error) {
        console.warn('No se pudo copiar el mensaje de reserva:', error)
      }
    })
  }

  refresh()
}

function renderReservationLayout (container) {
  container.classList.add('reservas-experience--ready')
  container.innerHTML = `
    <div class="reservas-experience__layout">
      <section class="reservas-experience__planner" aria-labelledby="reservas-planner-title">
        <header>
          <h3 id="reservas-planner-title">Reserva cinematográfica en 3 pasos</h3>
          <p>Configura tu escena ideal y envía la solicitud instantáneamente por WhatsApp.</p>
        </header>
        <form class="reservas-experience__form" autocomplete="off">
          <div class="reservas-experience__form-group">
            <label for="reserva-date">Fecha</label>
            <input id="reserva-date" name="date" type="date" required min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="reservas-experience__form-group">
            <label for="reserva-time">Horario preferido</label>
            <input id="reserva-time" name="time" type="time" required step="900">
          </div>
          <div class="reservas-experience__form-group reservas-experience__form-group--inline" role="group" aria-label="Tamaño de la reserva">
            <span>Personas</span>
            <div class="reservas-experience__badge-group">
              <button type="button" data-diners="2" aria-pressed="true" class="is-active">2</button>
              <button type="button" data-diners="4" aria-pressed="false">4</button>
              <button type="button" data-diners="6" aria-pressed="false">6</button>
              <button type="button" data-diners="8" aria-pressed="false">8+</button>
            </div>
          </div>
          <div class="reservas-experience__form-group">
            <label for="reserva-mood">Ambiente deseado</label>
            <select id="reserva-mood" name="mood">
              <option value="">Sorprendedme</option>
              <option value="Mesa íntima con iluminación cálida">Mesa íntima con iluminación cálida</option>
              <option value="Terraza climatizada">Terraza climatizada</option>
              <option value="Zona con ambientación musical">Zona con ambientación musical</option>
              <option value="Espacio para grupo y maridaje guiado">Espacio para grupo y maridaje guiado</option>
            </select>
          </div>
          <div class="reservas-experience__preview" aria-live="polite"></div>
          <div class="reservas-experience__actions">
            <a class="reservas-experience__cta" target="_blank" rel="noopener" href="https://wa.me/${RESERVATION_WHATSAPP}">Enviar por WhatsApp</a>
            <button type="button" data-copy-message class="reservas-experience__ghost">Copiar mensaje</button>
          </div>
        </form>
      </section>
      <section class="reservas-experience__channels" aria-labelledby="reservas-canales-title">
        <h3 id="reservas-canales-title">Canales directos</h3>
        <div class="reservas-experience__channel-grid">
          <article class="reservas-experience__channel-card">
            <h4>Teléfono inteligente</h4>
            <p>Atención personalizada para confirmar disponibilidad o coordinar eventos privados.</p>
            <a class="reservas-experience__link" href="tel:${RESERVATION_PHONE}">Llamar al ${RESERVATION_PHONE}</a>
          </article>
          <article class="reservas-experience__channel-card">
            <h4>Agenda en la nube</h4>
            <p>Recibe un recordatorio inteligente en tu calendario con la reserva confirmada.</p>
            <a class="reservas-experience__link" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reserva+En+las+Nubes+Restobar&details=Coordenada+gastro+entre+nubes.&location=Mar%C3%ADa+Teresa+Gil+de+G%C3%A1rate,+16+Logro%C3%B1o&dates=20250101T200000/20250101T220000" target="_blank" rel="noopener">Añadir a tu calendario</a>
          </article>
          <article class="reservas-experience__channel-card">
            <h4>Ubicación precisa</h4>
            <p>Activa la navegación hasta María Teresa Gil de Gárate, 16 y llega flotando sobre Logroño.</p>
            <a class="reservas-experience__link" href="https://maps.app.goo.gl/4cmkf1do29VQdLFn7" target="_blank" rel="noopener">Abrir en Google Maps</a>
          </article>
        </div>
      </section>
      <section class="reservas-experience__highlights" aria-labelledby="reservas-highlights-title">
        <h3 id="reservas-highlights-title">Momentos para encuadrar</h3>
        <ul>
          <li>Valoración global 4.3 ★ con más de 1.500 reseñas verificadas.</li>
          <li>Aforo cinematográfico de 99 personas entre salón y terrazas climatizadas.</li>
          <li>Cachopos asturianos con maridajes de Kellerbier y sidra premium.</li>
          <li>Experiencias temáticas por temporada y playlist binaural personalizada.</li>
        </ul>
      </section>
    </div>
  `

  const form = container.querySelector('form')
  const preview = container.querySelector('.reservas-experience__preview')
  const whatsappLink = container.querySelector('.reservas-experience__cta')

  if (form && preview && whatsappLink) {
    setupPlannerInteractions(form, preview, whatsappLink)
  }
}

export function initializeReservationsExperience () {
  const container = document.getElementById('reservas-experience')
  if (!container) return

  renderReservationLayout(container)
}
