const performanceTargets = {
  FCP: 1200,
  LCP: 2000,
  FID: 100,
  CLS: 0.1,
  TTI: 3000,
  TBT: 200,
  SpeedIndex: 2500
}

export function initPerformanceBudget () {
  if (!('performance' in window) || !('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'largest-contentful-paint' && entry.renderTime > performanceTargets.LCP) {
          console.warn('LCP fuera del presupuesto objetivo:', entry.renderTime)
        }
      })
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (error) {
    console.warn('PerformanceObserver no disponible:', error)
  }
}

export { performanceTargets }
