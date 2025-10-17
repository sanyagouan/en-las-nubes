export function initializeApp () {
  const root = document.getElementById('app')

  if (!root) {
    console.error('No se encontró el contenedor principal #app.')
    return
  }

  root.innerHTML = `
    <div class="cloud-frame" data-page="en-las-nubes">
      <a class="skip-link" href="#menu" data-skip-link>Saltar al contenido principal</a>
      <header class="navbar-cloud" role="banner">
        <div class="cloud-container navbar-cloud__inner">
          <a class="brand-cloud" href="#hero" aria-label="Inicio En las Nubes">
            <span class="brand-cloud__mark" aria-hidden="true">☁️</span>
            <span class="brand-cloud__text">En las Nubes Restobar</span>
          </a>
          <nav class="navbar-cloud__links" aria-label="Principal">
            <a href="#hero" class="navbar-cloud__link">Inicio</a>
            <a href="#menu" class="navbar-cloud__link">Carta</a>
            <a href="#reservas" class="navbar-cloud__link">Reservas</a>
            <a href="#experiencia" class="navbar-cloud__link">Experiencia</a>
          </nav>
          <div class="navbar-cloud__actions">
            <button class="theme-toggle" type="button" aria-label="Cambiar modo de color">
              <span class="theme-toggle__icon" aria-hidden="true"></span>
            </button>
            <a class="navbar-cloud__cta" href="#reservas">Reservar</a>
          </div>
        </div>
      </header>

      <main>
        <section id="hero" class="hero-cloud" aria-labelledby="hero-title">
          <div class="hero-parallax" aria-hidden="true">
            <div class="hero-layer hero-layer--glow" data-depth="0.08"></div>
            <div class="hero-layer hero-layer--clouds" data-depth="0.12"></div>
            <div class="hero-layer hero-layer--sunset" data-depth="0.16"></div>
            <canvas class="hero-particles" aria-hidden="true"></canvas>
          </div>

          <div class="cloud-container hero-cloud__grid">
            <div class="hero-cloud__content">
              <span class="hero-eyebrow">Cachopos asturianos elevados &middot; precisión alemana</span>
              <h1 id="hero-title" class="hero-title cloud-text-gradient">Sabores que flotan entre mundos</h1>
              <p class="hero-lead">
                Vive una travesía cinematográfica: texturas crujientes, cerveza artesanal y un ambiente
                envolvente que combina la calidez asturiana con la vanguardia germana.
              </p>
              <div class="hero-cta-group" role="group" aria-label="Acciones principales">
                <a class="cta-cloud" href="#reservas">Reservar experiencia</a>
                <button class="hero-secondary" type="button" data-scroll-target="#menu">
                  Ver carta interactiva
                </button>
              </div>
              <dl class="hero-metrics" aria-label="Destacados del restaurante">
                <div class="hero-metrics__item">
                  <dt>Valoración global</dt>
                  <dd>
                    <span class="hero-metrics__value">4.3</span>
                    <span class="hero-metrics__detail">1566 reseñas verificadas</span>
                  </dd>
                </div>
                <div class="hero-metrics__item">
                  <dt>Aforo cinematográfico</dt>
                  <dd>
                    <span class="hero-metrics__value">99</span>
                    <span class="hero-metrics__detail">personas entre terrazas y salón</span>
                  </dd>
                </div>
                <div class="hero-metrics__item">
                  <dt>Especialidades</dt>
                  <dd>
                    <span class="hero-metrics__value">Cachopos &amp; Kellerbier</span>
                    <span class="hero-metrics__detail">Maridaje Asturias x Baviera</span>
                  </dd>
                </div>
              </dl>
            </div>
            <aside class="hero-showcase" aria-label="Escena destacada entre nubes">
              <div class="hero-showcase__card">
                <div class="hero-showcase__badge">Escena en vivo</div>
                <figure>
                  <img
                    src="https://weur-cdn.carta.menu/storage/media/company_gallery/77833123/conversions/contribution_gallery.jpg"
                    alt="Cachopo dorado servido con cerveza artesanal"
                    loading="lazy"
                  />
                  <figcaption>
                    Cachopo premium de ternera asturiana, queso ahumado y guarnición bávara.
                  </figcaption>
                </figure>
                <ul class="hero-showcase__details">
                  <li>
                    <span class="label">Tiempo promedio</span>
                    <span class="value">45 min</span>
                  </li>
                  <li>
                    <span class="label">Reserva inteligente</span>
                    <span class="value">+34 941 57 84 51</span>
                  </li>
                  <li>
                    <span class="label">Servicio</span>
                    <span class="value">Terraza climatizada</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
          <div class="hero-scroll-hint" aria-hidden="true">
            <span class="hero-scroll-hint__icon"></span>
            <span>Desliza para descubrir</span>
          </div>
        </section>

        <section id="menu" class="cloud-section cloud-section--menu" aria-labelledby="menu-title" tabindex="-1">
          <div class="cloud-container">
            <header class="section-heading">
              <span class="section-eyebrow">Carta viva</span>
              <h2 id="menu-title">Experiencia gastronómica interactiva</h2>
              <p class="section-lead">
                Sumérgete en cada categoría con detalles, sugerencias de maridaje y fotografías vanguardistas,
                extraídas de fuentes verificadas en tiempo real.
              </p>
            </header>
            <div id="menu-experience" class="menu-experience" role="region" aria-live="polite"></div>
          </div>
        </section>

        <section id="reservas" class="cloud-section cloud-section--reservas" aria-labelledby="reservas-title" tabindex="-1">
          <div class="cloud-container">
            <header class="section-heading">
              <span class="section-eyebrow">Acceso directo al cielo</span>
              <h2 id="reservas-title">Reserva inteligente y contacto inmediato</h2>
              <p class="section-lead">
                Elige entre nuestra agenda inteligente, WhatsApp o llamada directa. Nos adaptamos a tu ritmo para
                garantizar la mejor experiencia posible.
              </p>
            </header>
            <div id="reservas-experience" class="reservas-experience"></div>
          </div>
        </section>

        <section id="experiencia" class="cloud-section cloud-section--experience" aria-labelledby="experiencia-title">
          <div class="cloud-container">
            <header class="section-heading">
              <span class="section-eyebrow">Atmosfera 360º</span>
              <h2 id="experiencia-title">Tan envolvente como una película entre nubes</h2>
              <p class="section-lead">
                Próximamente: recorridos virtuales, sonido binaural y storytelling de temporada.</p>
            </header>
            <div class="experience-preview">
              <div class="experience-preview__card">
                <h3>Audio inmersivo</h3>
                <p>Playlists curadas con jazz europeo y folk asturiano sincronizados con la ambientación.</p>
              </div>
              <div class="experience-preview__card">
                <h3>Ken Burns Gallery</h3>
                <p>Secuencias fotográficas con movimiento cinematográfico y fichas técnicas del plato.</p>
              </div>
              <div class="experience-preview__card">
                <h3>Storytelling Estacional</h3>
                <p>Ingredientes de temporada narrados como escenas: del prado asturiano a la mesa riojana.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="cloud-footer" aria-label="Información legal y de contacto">
        <div class="cloud-container cloud-footer__grid">
          <div>
            <h2>En las Nubes Restobar</h2>
            <p>María Teresa Gil de Gárate, 16 · Logroño · Tel: <a href="tel:+34941578451">+34 941 57 84 51</a></p>
          </div>
          <div>
            <span>Horario extendido</span>
            <p>Martes a domingo · 13:00 - 16:30 &middot; 20:00 - 00:30</p>
          </div>
          <div>
            <span>Legal y privacidad</span>
            <div class="cloud-footer__legal">
              <a href="/politica-privacidad.html" rel="noopener">Política de privacidad</a>
              <a href="/terminos-servicio.html" rel="noopener">Términos y condiciones</a>
              <button id="cookie-settings" style="background: none; border: none; color: rgba(144, 205, 244, 0.9); text-decoration: underline; cursor: pointer; font-size: inherit;">Configurar cookies</button>
            </div>
          </div>
          <div class="cloud-footer__social">
            <a href="https://carta.menu/restaurants/logrono/en-las-nubes-restobar" target="_blank" rel="noopener">Ficha oficial</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener">Instagram</a>
            <a href="https://wa.me/34941578451" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  `
}
