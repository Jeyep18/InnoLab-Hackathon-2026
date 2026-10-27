// Generates the lesson .docx files in public/samples from src/data/catalogue.json.
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
    para(`${resource.grade} · ${resource.subject} · ${[resource.bow.quarter, resource.bow.week].filter(Boolean).join(', ')}`, { size: 20 }),
    para(`Prepared by ${contributor.alias}${contributor.school ? `, ${contributor.school}` : ''}. Version ${resource.version.label}.`, { size: 20 }),
    para(`Competency: ${resource.competency.text} (${resource.competency.code})`, { size: 20 }),
    para(''),
  ]
  if (file.id === 'lesson') {
    out.push(para('Objective', { bold: true, size: 26 }), para(lesson.objective))
    for (const section of lesson.sections) {
      out.push(para(section.heading, { bold: true, size: 26 }))
      section.items.forEach((item, i) => out.push(para(section.heading === 'Procedure' ? `${i + 1}. ${item}` : `• ${item}`)))
    }
  } else if (file.id === 'wordbank') {
    out.push(para('Bikol–English word bank', { bold: true, size: 26 }), para('Read each Bikol word aloud first, then its English meaning.', { italic: true, size: 20 }))
    for (const [bikol, english] of [['init', 'heat'], ['panganuron', 'cloud'], ['uran', 'rain'], ['salog', 'river'], ['dagat', 'sea']]) out.push(para(`${bikol}: ${english}`))
  } else if (file.id === 'answers') {
    out.push(para('Answer key', { bold: true, size: 26 }), para('1. Evaporation: water warms and rises as vapour.'), para('2. Condensation: vapour cools into cloud droplets over Mayon.'), para('3. Precipitation: rain falls on the slopes and flows to the Yawa River.'))
  } else if (file.id === 'rubric') {
    out.push(para('Rubric', { bold: true, size: 26 }))
    for (const [criterion, levels] of [['Map shows the main roads and landmarks', '4 all · 3 most · 2 some · 1 few'], ['Hazard areas marked with the correct symbols', '4 all · 3 most · 2 some · 1 few'], ['Legend is complete and readable', '4 complete · 3 minor gaps · 2 several gaps · 1 missing'], ['Group explains one way to prepare', '4 clear · 3 mostly clear · 2 unclear · 1 none']]) out.push(para(`${criterion}: ${levels}`))
  } else if (file.id === 'quiz') {
    out.push(para('Quiz', { bold: true, size: 26 }))
    ;['What type of volcano is Mayon?', 'Name the three main parts of a volcano.', 'What does Alert Level 3 mean for residents?', 'Why is Bulusan’s eruption style different from Mayon’s?', 'Give one safety step before an eruption.'].forEach((q, i) => out.push(para(`${i + 1}. ${q}`), para('______________________________________________')))
    out.push(para('Answer key', { bold: true, size: 26 }), para('1. Stratovolcano. 2. Magma chamber, vent, crater. 3. Magmatic unrest; prepare to evacuate. 4. Different magma and vent activity. 5. Know your evacuation route.'))
  } else if (file.id === 'slides') {
    out.push(para('Slide notes', { bold: true, size: 26 }))
    lesson.sections.find((s) => s.heading === 'Procedure')?.items.forEach((item, i) => out.push(para(`Slide ${i + 1}: ${item}`)))
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
