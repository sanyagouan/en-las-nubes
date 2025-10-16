let isInitialized = false

export function setupNavigationBehavior () {
  if (isInitialized) return

  const handleScroll = () => {
    const navbar = document.querySelector('.navbar-cloud')
    if (!navbar) return

    if (window.scrollY > 80) {
      navbar.classList.add('navbar-scrolled')
    } else {
      navbar.classList.remove('navbar-scrolled')
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  isInitialized = true
}
