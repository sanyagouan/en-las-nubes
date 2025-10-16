const THEME_STORAGE_KEY = 'enlasnubes-theme'

export function initializeThemeToggle () {
  const existingToggle = document.querySelector('.theme-toggle')

  if (!existingToggle) return

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme) {
    document.documentElement.dataset.theme = storedTheme
  }

  existingToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme || 'light'
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
    document.documentElement.dataset.theme = nextTheme
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  })
}
