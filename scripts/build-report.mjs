import { build } from 'vite'

process.env.ANALYZE = 'true'

try {
  await build({ mode: 'production' })
  console.log('[32mBundle report generado en dist/report.html[39m')
} catch (error) {
  console.error('\u001b[31mFallo al generar el bundle report:\u001b[39m', error)
  process.exitCode = 1
}