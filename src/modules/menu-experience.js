import menuSource from '../../data/raw/carta-menu.html?raw'

let menuCache

const fallbackPairings = {
  bebidas: {
    maridaje: 'Refréscate con Kellerbier en copa helada',
    recomendacion: 'Ideal para acompañar nuestros cachopos ahumados.'
  },
  'categoria-de-restaurante': {
    maridaje: 'Entrada mediterránea con giros germanos',
    recomendacion: 'Reinventa el antipasto con quesos asturianos curados.'
  },
  aperitivos: {
    maridaje: 'Sidra natural servida en cascada',
    recomendacion: 'Inicia la experiencia con croquetas cremosas y trufa.'
  },
  'tapas-calientes': {
    maridaje: 'Bock ahumada al estilo bávaro',
    recomendacion: 'Fusióna queso de cabra caramelizado con mostaza dulce.'
  },
  'antipasti-entrantes': {
    maridaje: 'Riesling joven ligeramente dulce',
    recomendacion: 'Experimenta con carpaccio y brotes de lúpulo fresco.'
  },
  'comida-latinoamericana': {
    maridaje: 'Cóctel de ron especiado y sidra',
    recomendacion: 'La paella se eleva con mantequillas europeas aromáticas.'
  },
  aperitivo: {
    maridaje: 'Gin tonic con enebro astur',
    recomendacion: 'Tempura crujiente con sirope de miel riojana.'
  },
  'ingredientes-utilizados': {
    maridaje: 'Selección de quesos y miel artesanal',
    recomendacion: 'Diseña tu propio plato combinando mango y bacon crocante.'
  },
  'este-tipo-de-platos-se-sirven': {
    maridaje: 'Cerveza negra cremosa estilo dunkel',
    recomendacion: 'Un postre tibio con helado especiado te hará levitar.'
  }
}

function parseMenuFromSource () {
  if (menuCache) return menuCache

  if (typeof DOMParser === 'undefined') {
    menuCache = []
    return menuCache
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(menuSource, 'text/html')
  const rawSections = [...doc.querySelectorAll('li[id]')]

  menuCache = rawSections.map((section) => {
    const id = section.getAttribute('id') || ''
    const title = section.querySelector('h3')?.textContent?.trim() || id
    const items = [...section.querySelectorAll('div.divide-y > div, .divide-y > div')]
      .map((entry) => {
        const link = entry.querySelector('a.text-base')
        const image = entry.querySelector('img')

        return {
          name: link?.textContent?.trim() || image?.alt || 'Delicia en las nubes',
          sourceUrl: link?.getAttribute('href') || null,
          image: image?.getAttribute('src') || null,
          alt: image?.getAttribute('alt') || null
        }
      })
      .filter((item) => Boolean(item.name))

    return {
      id,
      title,
      items
    }
  }).filter((section) => section.items.length > 0)

  return menuCache
}

function createCategoryButton (category, isActive, onSelect) {
  const button = document.createElement('button')
  button.className = 'menu-experience__filter'
  button.type = 'button'
  button.textContent = category.title
  button.dataset.category = category.id
  button.setAttribute('aria-pressed', String(isActive))
  button.addEventListener('click', () => {
    onSelect(category)
  })
  return button
}

function createMenuCard (item) {
  const card = document.createElement('article')
  card.className = 'menu-experience__card'

  if (item.image) {
    const figure = document.createElement('figure')
    figure.className = 'menu-experience__card-media'
    const img = document.createElement('img')
    img.loading = 'lazy'
    img.decoding = 'async'
    img.src = item.image
    img.alt = item.alt || item.name
    figure.appendChild(img)
    card.appendChild(figure)
  }

  const body = document.createElement('div')
  body.className = 'menu-experience__card-body'

  const title = document.createElement('h3')
  title.textContent = item.name
  body.appendChild(title)

  if (item.sourceUrl) {
    const action = document.createElement('a')
    action.href = item.sourceUrl
    action.target = '_blank'
    action.rel = 'noopener'
    action.className = 'menu-experience__card-link'
    action.textContent = 'Ver ficha original'
    body.appendChild(action)
  }

  card.appendChild(body)
  return card
}

function renderCategory (category, container, query = '') {
  container.innerHTML = ''

  const filteredItems = query
    ? category.items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    : category.items

  if (!filteredItems.length) {
    const empty = document.createElement('p')
    empty.className = 'menu-experience__empty'
    empty.textContent = 'No encontramos coincidencias. Ajusta tu búsqueda o explora otra categoría.'
    container.appendChild(empty)
    return
  }

  const fragment = document.createDocumentFragment()
  filteredItems.forEach((item) => {
    fragment.appendChild(createMenuCard(item))
  })
  container.appendChild(fragment)
}

function updatePairingInsight (category, pairingContainer) {
  const insight = fallbackPairings[category.id] || {
    maridaje: 'Explora maridajes exclusivos con cerveza artesanal alemana y sidras asturianas.',
    recomendacion: 'Pide recomendaciones in situ para sorprenderte con combinaciones únicas.'
  }

  pairingContainer.querySelector('[data-pairing-maridaje]').textContent = insight.maridaje
  pairingContainer.querySelector('[data-pairing-recomendacion]').textContent = insight.recomendacion
}

export function initializeMenuExperience () {
  const container = document.getElementById('menu-experience')
  if (!container) return

  const menuData = parseMenuFromSource()
  if (!menuData.length) {
    container.textContent = 'No se pudo cargar la carta interactiva en este momento.'
    return
  }

  const state = {
    activeCategory: menuData[0],
    query: ''
  }

  container.classList.add('menu-experience--ready')

  const filters = document.createElement('div')
  filters.className = 'menu-experience__filters'
  filters.setAttribute('role', 'tablist')
  filters.setAttribute('aria-label', 'Categorías de la carta')

  const searchWrapper = document.createElement('div')
  searchWrapper.className = 'menu-experience__search'
  const searchLabel = document.createElement('label')
  searchLabel.textContent = 'Buscar plato o ingrediente'
  searchLabel.setAttribute('for', 'menu-search-input')
  const searchInput = document.createElement('input')
  searchInput.id = 'menu-search-input'
  searchInput.type = 'search'
  searchInput.placeholder = 'Ej. cachopo, miel, paella...'
  searchInput.autocomplete = 'off'

  searchWrapper.appendChild(searchLabel)
  searchWrapper.appendChild(searchInput)

  const cardsContainer = document.createElement('div')
  cardsContainer.className = 'menu-experience__grid'
  cardsContainer.setAttribute('role', 'tabpanel')
  cardsContainer.setAttribute('aria-live', 'polite')

  const pairingAside = document.createElement('aside')
  pairingAside.className = 'menu-experience__insights'
  pairingAside.innerHTML = `
    <div class="menu-experience__summary">
      <span class="menu-experience__summary-count">${menuData.reduce((total, cat) => total + cat.items.length, 0)} referencias</span>
      <p>Datos reales recopilados de fuentes verificadas y sincronizados para resaltar lo mejor de la casa.</p>
    </div>
    <div class="menu-experience__pairing">
      <h3>Maridaje recomendado</h3>
      <p data-pairing-maridaje></p>
      <p data-pairing-recomendacion></p>
    </div>
    <div class="menu-experience__callout">
      <h4>Tip cinematográfico</h4>
      <p>Comparte mesa y pide al equipo un "plato secreto": cada semana hay un cameo limitado.</p>
    </div>
  `

  const render = () => {
    filters.querySelectorAll('.menu-experience__filter').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.category === state.activeCategory.id))
      button.classList.toggle('menu-experience__filter--active', button.dataset.category === state.activeCategory.id)
    })

    renderCategory(state.activeCategory, cardsContainer, state.query)
    updatePairingInsight(state.activeCategory, pairingAside)
  }

  const handleCategorySelect = (category) => {
    state.activeCategory = category
    render()
  }

  menuData.forEach((category, index) => {
    filters.appendChild(createCategoryButton(category, index === 0, handleCategorySelect))
  })

  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value.trim()
    render()
  })

  const structure = document.createElement('div')
  structure.className = 'menu-experience__layout'
  structure.appendChild(searchWrapper)
  structure.appendChild(filters)
  structure.appendChild(cardsContainer)
  structure.appendChild(pairingAside)

  container.innerHTML = ''
  container.appendChild(structure)

  render()
}
