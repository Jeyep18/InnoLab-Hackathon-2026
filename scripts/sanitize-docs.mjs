// Copies a folder of teacher files, removing identifying document properties from the copies.
// The originals are never modified. Usage:
//   npm run sanitize -- <input folder> <output folder>
// Then check every file's *content* by eye for learner and teacher names; this script only
// handles hidden properties. Best effort: always open the copies before using them.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { readZip, writeZip } from './lib/zip.mjs'

const [input, output] = process.argv.slice(2).map((p) => p && path.resolve(p))
if (!input || !output) {
  console.error('Usage: npm run sanitize -- <input folder> <output folder>')
  process.exit(1)
}
if (!existsSync(input) || !statSync(input).isDirectory()) {
  console.error(`Input folder not found: ${input}`)
  process.exit(1)
}
if (output === input || output.startsWith(input + path.sep)) {
  console.error('Choose an output folder outside the input folder, so originals stay untouched.')
  process.exit(1)
}

const OFFICE = new Set(['.docx', '.pptx', '.xlsx'])
const blankTag = (xml, tag, found) =>
  xml.replace(new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)</${tag}>`, 'g'), (_m, attrs, value) => {
    if (value.trim()) found.push(`${tag}="${value.trim()}"`)
    return `<${tag}${attrs}></${tag}>`
  })
const blankAttr = (xml, attr, replacement, found) =>
  xml.replace(new RegExp(`(\\s${attr}=")([^"]*)(")`, 'g'), (_m, a, value, b) => {
    if (value && value !== replacement) found.push(`${attr}="${value}"`)
    return `${a}${replacement}${b}`
  })

function sanitizeOffice(buf) {
  const found = []
  const entries = readZip(buf).map(({ name, data }) => {
    if (!name.endsWith('.xml')) return { name, data }
    let xml = data.toString('utf8')
    if (name === 'docProps/core.xml') {
      for (const tag of ['dc:creator', 'cp:lastModifiedBy', 'dc:description', 'dc:subject', 'cp:keywords', 'cp:category'])
        xml = blankTag(xml, tag, found)
    } else if (name === 'docProps/app.xml') {
      for (const tag of ['Company', 'Manager', 'HyperlinkBase']) xml = blankTag(xml, tag, found)
    } else if (name === 'docProps/custom.xml') {
      xml = blankTag(xml, 'vt:lpwstr', found)
    } else {
      // Comment and tracked-change authors in Word; comment authors in PowerPoint.
      xml = blankAttr(xml, 'w:author', 'Teacher', found)
      xml = blankAttr(xml, 'w:initials', 'T', found)
      if (name === 'ppt/commentAuthors.xml') {
        xml = blankAttr(xml, 'name', 'Teacher', found)
        xml = blankAttr(xml, 'initials', 'T', found)
      }
    }
    return { name, data: Buffer.from(xml, 'utf8') }
  })
  return { data: writeZip(entries), found }
}

// PDF Info strings are blanked with spaces of the same length, so byte offsets stay valid.
function sanitizePdf(buf) {
  const found = []
  let text = buf.toString('latin1')
  text = text.replace(/\/(Author|Creator|Producer|Title|Subject|Keywords)\s*\(((?:\\.|[^\\)])*)\)/g, (m, key, value) => {
    if (value.trim()) found.push(`${key}="${value}"`)
    return m.replace(`(${value})`, `(${' '.repeat(value.length)})`)
  })
  const warnings = []
  if (/<dc:creator|<pdf:Producer|<xmp:CreatorTool/.test(text)) warnings.push('has XMP metadata; export the PDF again from the sanitized source if it names a person')
  if (/\/(Author|Creator)\s*</.test(text)) warnings.push('has hex-encoded properties this script cannot read; export the PDF again')
  return { data: Buffer.from(text, 'latin1'), found, warnings }
}

let files = 0
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name.startsWith('~$')) continue
    const from = path.join(dir, name)
    const to = path.join(output, path.relative(input, from))
    if (statSync(from).isDirectory()) {
      walk(from)
      continue
    }
    mkdirSync(path.dirname(to), { recursive: true })
    const ext = path.extname(name).toLowerCase()
    const rel = path.relative(input, from)
    files++
    try {
      if (OFFICE.has(ext)) {
        const { data, found } = sanitizeOffice(readFileSync(from))
        writeFileSync(to, data)
        console.log(`${rel}: ${found.length ? `removed ${found.join(', ')}` : 'no identifying properties found'}`)
      } else if (ext === '.pdf') {
        const { data, found, warnings } = sanitizePdf(readFileSync(from))
        writeFileSync(to, data)
        console.log(`${rel}: ${found.length ? `blanked ${found.join(', ')}` : 'no identifying properties found'}`)
        for (const w of warnings) console.log(`  CHECK ${rel}: ${w}`)
      } else {
        copyFileSync(from, to)
        const note = ['.jpg', '.jpeg', '.png'].includes(ext) ? 'copied as is; images may carry location or camera data, so prefer fresh screenshots' : 'copied as is; check it by hand'
        console.log(`${rel}: ${note}`)
      }
    } catch (error) {
      console.log(`  CHECK ${rel}: could not process (${error.message}); not copied`)
    }
  }
}

walk(input)
console.log(`\nProcessed ${files} file(s) into ${output}. Originals were not modified.`)
console.log('Next: open each copy and check the content itself for learner and teacher names.')
