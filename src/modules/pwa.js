export async function registerCloudServiceWorker () {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no están soportados en este navegador.')
    return
  }

  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  } catch (error) {
    console.error('Error al registrar el Service Worker:', error)
  }
}
