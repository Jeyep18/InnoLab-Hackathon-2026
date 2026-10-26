// Fails if any demonstration-only teacher file is tracked by Git or copied anywhere it could be
// bundled or shared: dist/, public/, src/ or sample-packs/. Copies are matched by content, so a
// renamed copy is still caught.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')
const files = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { recursive: true })
        .map((p) => path.join(dir, String(p)))
        .filter((p) => statSync(p).isFile())
    : []

const problems = []
const tracked = execFileSync('git', ['ls-files', '--', 'demo-assets'], { encoding: 'utf8' }).trim()
if (tracked) problems.push(`Teacher files are tracked by Git (run: git rm --cached -r demo-assets):\n${tracked}`)

const teacher = new Map(files('demo-assets').map((f) => [hash(f), f]))
for (const dir of ['dist', 'public', 'src', 'sample-packs']) {
  for (const file of files(dir)) {
    const match = teacher.get(hash(file))
    if (match) problems.push(`${file} is a copy of teacher file ${match}`)
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`OK: no teacher files tracked by Git or copied into dist/, public/, src/ or sample-packs/ (${teacher.size} teacher file(s) checked).`)
