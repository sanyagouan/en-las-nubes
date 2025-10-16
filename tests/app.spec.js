import { describe, it, expect, beforeEach } from 'vitest'
import { initializeApp } from '@/modules/app.js'

describe('initializeApp', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('renderiza contenido introductorio', () => {
    initializeApp()

    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    expect(header?.textContent).toContain('En las Nubes Restobar')
  })
})
