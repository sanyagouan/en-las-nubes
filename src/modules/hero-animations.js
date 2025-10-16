import { gsap } from 'gsap'

let heroInitialized = false

const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || !('matchMedia' in window)) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setupHeroReveal (heroElement) {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })
  const eyebrow = heroElement.querySelector('.hero-eyebrow')
  const title = heroElement.querySelector('.hero-title')
  const lead = heroElement.querySelector('.hero-lead')
  const ctaPrimary = heroElement.querySelector('.cta-cloud')
  const ctaSecondary = heroElement.querySelector('.hero-secondary')
  const metrics = heroElement.querySelectorAll('.hero-metrics__item')
  const showcase = heroElement.querySelector('.hero-showcase__card')

  timeline.from(eyebrow, { y: 36, opacity: 0 })
  timeline.from(title, { y: 42, opacity: 0 }, '-=0.75')
  timeline.from(lead, { y: 40, opacity: 0 }, '-=0.8')
  timeline.from([ctaPrimary, ctaSecondary], { y: 30, opacity: 0, stagger: 0.12 }, '-=0.7')
  timeline.from(metrics, { y: 30, opacity: 0, stagger: 0.08 }, '-=0.6')
  timeline.from(showcase, { y: 60, opacity: 0 }, '-=0.4')
}

function setupParallaxLayers (heroElement) {
  const layers = heroElement.querySelectorAll('.hero-layer')
  if (!layers.length) return () => {}

  const moveLayers = (event) => {
    const { innerWidth, innerHeight } = window
    const offsetX = (event.clientX / innerWidth - 0.5) * 2
    const offsetY = (event.clientY / innerHeight - 0.5) * 2

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0.08)
      gsap.to(layer, {
        x: offsetX * depth * 120,
        y: offsetY * depth * 80,
        duration: 0.8,
        ease: 'power2.out'
      })
    })
  }

  const resetLayers = () => {
    layers.forEach((layer) => {
      gsap.to(layer, { x: 0, y: 0, duration: 1.1, ease: 'power3.out' })
    })
  }

  heroElement.addEventListener('pointermove', moveLayers)
  heroElement.addEventListener('pointerleave', resetLayers)

  const handleScroll = () => {
    const progress = Math.min(window.scrollY / (window.innerHeight * 0.6), 1)
    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0.08)
      gsap.to(layer, {
        y: -progress * depth * 140,
        duration: 1.2,
        ease: 'power2.out'
      })
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    heroElement.removeEventListener('pointermove', moveLayers)
    heroElement.removeEventListener('pointerleave', resetLayers)
    window.removeEventListener('scroll', handleScroll)
  }
}

async function setupHeroParticles (canvas) {
  if (!canvas || typeof window === 'undefined') return () => {}
  if (prefersReducedMotion()) return () => {}

  try {
    const {
      Scene,
      PerspectiveCamera,
      WebGLRenderer,
      BufferGeometry,
      Float32BufferAttribute,
      PointsMaterial,
      Points,
      Color,
      AdditiveBlending
    } = await import('three')

    const scene = new Scene()
    const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 1, 1000)
    camera.position.z = 320

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

    const geometry = new BufferGeometry()
    const particleCount = 480
    const positions = new Float32Array(particleCount * 3)
    const speeds = []

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 480
      positions[i * 3 + 1] = Math.random() * 260 - 130
      positions[i * 3 + 2] = (Math.random() - 0.5) * 520
      speeds.push(0.12 + Math.random() * 0.18)
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))

    const material = new PointsMaterial({
      color: new Color('#9fc9ff'),
      size: 4.2,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      blending: AdditiveBlending
    })

    const cloudParticles = new Points(geometry, material)
    scene.add(cloudParticles)

    let animationFrameId

    const render = () => {
      const { array } = geometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        array[i * 3 + 1] += speeds[i]
        if (array[i * 3 + 1] > 160) {
          array[i * 3 + 1] = -180
        }
      }

      geometry.attributes.position.needsUpdate = true
      cloudParticles.rotation.y += 0.0009
      renderer.render(scene, camera)
      animationFrameId = window.requestAnimationFrame(render)
    }

    const resize = () => {
      const { clientWidth, clientHeight } = canvas
      renderer.setSize(clientWidth, clientHeight, false)
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', resize)
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  } catch (error) {
    console.warn('No se pudieron inicializar las partículas del héroe:', error)
    return () => {}
  }
}

function setupSmoothNavigation (heroElement) {
  const secondaryButton = heroElement.querySelector('[data-scroll-target]')
  if (!secondaryButton) return

  secondaryButton.addEventListener('click', () => {
    const targetSelector = secondaryButton.dataset.scrollTarget
    if (!targetSelector) return
    const target = document.querySelector(targetSelector)
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function setupScrollHint () {
  const hint = document.querySelector('.hero-scroll-hint')
  if (!hint) return () => {}

  let hidden = false

  const handleScroll = () => {
    if (hidden) return
    if (window.scrollY > 120) {
      hidden = true
      gsap.to(hint, { autoAlpha: 0, y: 20, duration: 0.6, ease: 'power2.out' })
      window.removeEventListener('scroll', handleScroll)
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}

export async function initializeHeroCinematics () {
  if (heroInitialized) return
  if (typeof window === 'undefined') return

  const hero = document.querySelector('.hero-cloud')
  if (!hero) return

  const cleanups = []

  if (!prefersReducedMotion()) {
    setupHeroReveal(hero)
    cleanups.push(setupParallaxLayers(hero))
    const particlesCanvas = hero.querySelector('.hero-particles')
    cleanups.push(await setupHeroParticles(particlesCanvas))
  }

  setupSmoothNavigation(hero)
  cleanups.push(setupScrollHint())

  heroInitialized = true

  return () => {
    cleanups.forEach((cleanup) => {
      if (typeof cleanup === 'function') cleanup()
    })
    heroInitialized = false
  }
}

export function resetHeroCinematics () {
  heroInitialized = false
}
