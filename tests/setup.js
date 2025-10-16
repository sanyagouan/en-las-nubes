import { expect } from 'vitest'

expect.extend({
  toBeAccessible (received) {
    if (!(received instanceof HTMLElement)) {
      return {
        pass: false,
        message: () => 'El elemento proporcionado no es un HTMLElement válido.'
      }
    }

    const ariaHidden = received.getAttribute('aria-hidden')
    const isHidden = ariaHidden === 'true' || received.style.display === 'none'

    return {
      pass: !isHidden,
      message: () => `Se esperaba que el elemento fuera accesible, pero tiene aria-hidden="${ariaHidden}".`
    }
  }
})
