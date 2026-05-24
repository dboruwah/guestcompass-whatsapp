/**
 * Build workers bundle for production (compiles TS to dist-workers)
 * Requires typescript installed.
 */
const { execSync } = require('child_process')
try {
  execSync('npx tsc -p tsconfig.workers.json', { stdio: 'inherit' })
  console.log('Workers compiled to dist-workers')
} catch (err) {
  console.error('Failed to compile workers', err)
  process.exit(1)
}
