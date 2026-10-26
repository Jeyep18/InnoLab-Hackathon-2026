// Fails if any demonstration-only teacher file is tracked by Git or ended up in dist/.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'

const tracked = execFileSync('git', ['ls-files', '--', 'demo-assets'], { encoding: 'utf8' }).trim()
const inDist = existsSync('dist') && readdirSync('dist', { recursive: true }).some((p) => String(p).includes('demo-assets'))
if (tracked || inDist) {
  if (tracked) console.error(`Teacher files are tracked by Git:\n${tracked}\nRun: git rm --cached -r demo-assets`)
  if (inDist) console.error('dist/ contains demo-assets. Delete dist/ and rebuild.')
  process.exit(1)
}
console.log('OK: no teacher files tracked by Git or included in dist/.')
