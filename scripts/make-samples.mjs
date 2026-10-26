// Generates the fictional sample .docx files in public/samples from src/data/catalogue.json.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { docx, para } from './lib/office.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalogue = JSON.parse(readFileSync(path.join(root, 'src/data/catalogue.json'), 'utf8'))
const outDir = path.join(root, 'public/samples')

// Left out on purpose so the demo can show the missing-file state.
const INTENTIONALLY_MISSING = new Set(['typhoon-signals-poster-template.docx'])

function contentFor(resource, file) {
  const contributor = catalogue.personas.find((p) => p.id === resource.contributorId)
  const lesson = resource.lesson
  const out = [
    para(`${resource.title}: ${file.label}`, { bold: true, size: 32 }),
    para(`${resource.grade} ${resource.subject}. Version ${resource.version.label}. Shared by ${contributor.alias} (demo persona).`, { size: 20 }),
    para(`Illustrative competency ${resource.competency.code} (example, not official alignment): ${resource.competency.text}`, { size: 20 }),
    para('Fictional sample created by the CherIt team for a hackathon demonstration. Edit freely.', { italic: true, size: 20 }),
    para(''),
  ]
  if (file.id === 'lesson') {
    out.push(para('Objective', { bold: true, size: 26 }), para(lesson.objective))
    for (const section of lesson.sections) {
      out.push(para(section.heading, { bold: true, size: 26 }))
      section.items.forEach((item, i) => out.push(para(section.heading === 'Procedure' ? `${i + 1}. ${item}` : `• ${item}`)))
    }
  } else if (file.id === 'wordbank') {
    out.push(para('Bikol–English word bank', { bold: true, size: 26 }), para('Placeholder vocabulary for the demonstration. Check words with a Bikol speaker before teaching.', { italic: true, size: 20 }))
    for (const [bikol, english] of [['init', 'heat'], ['panganuron', 'cloud'], ['uran', 'rain'], ['salog', 'river'], ['dagat', 'sea']]) out.push(para(`${bikol}: ${english}`))
  } else if (file.id === 'answers') {
    out.push(para('Answer key', { bold: true, size: 26 }), para('1. Evaporation: water warms and rises as vapour.'), para('2. Condensation: vapour cools into cloud droplets over Mayon.'), para('3. Precipitation: rain falls on the slopes and flows to the Yawa River.'))
  } else {
    out.push(para('Name: ______________________    Date: ____________'), para(''), para(lesson.objective, { bold: true }))
    const assessment = lesson.sections.find((s) => s.heading === 'Assessment')
    ;(assessment?.items ?? []).forEach((item, i) => out.push(para(`${i + 1}. ${item}`), para('______________________________________________')))
    out.push(para(''), para('Write or draw your answer below.'), para(''), para(''))
  }
  return out
}

mkdirSync(outDir, { recursive: true })
let count = 0
for (const resource of catalogue.resources) {
  for (const file of resource.files) {
    if (file.source.type !== 'url' || INTENTIONALLY_MISSING.has(file.name)) continue
    writeFileSync(path.join(outDir, file.name), docx(contentFor(resource, file)))
    count++
  }
}
console.log(`Wrote ${count} sample files to public/samples (skipped ${INTENTIONALLY_MISSING.size} on purpose).`)
