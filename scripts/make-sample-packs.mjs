// Writes fictional teacher packs to sample-packs/<alias>/<Grade - Subject - [BOW] - Title>/,
// the same layout real demonstration-only packs use under demo-assets/packs/.
// These are team-made placeholders, not teacher files.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { docx, para, pdf, pptx } from './lib/office.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'sample-packs')
const NOTICE = 'Fictional placeholder made by the CherIt team for a hackathon demonstration.'

const packs = [
  {
    alias: 'Sir Ben',
    folder: 'Grade 5 - Mathematics - Term 2 Week 6 - Measuring area with the school court',
    objective: 'Learners compute the area of rectangles using the school basketball court and classroom floor tiles.',
    slides: [
      { title: 'How big is our court?', bullets: ['Guess first: how many classrooms fit on the court?', 'Today we measure, then compute area = length x width.'] },
      { title: 'Measure in groups', bullets: ['Group 1: length of the court (paces, then metres)', 'Group 2: width of the court', 'Group 3: one floor tile in the classroom'] },
      { title: 'Compute and compare', bullets: ['Area of the court = length x width', 'How many tiles would cover the court?', 'Was your guess close?'] },
    ],
    worksheet: ['Name: ____________________', '1. Length of the court: ______ m', '2. Width of the court: ______ m', '3. Area: ______ square metres', '4. Area of one tile: ______ square metres', '5. Tiles needed to cover the court: ______'],
  },
  {
    alias: "Ma'am Cora",
    folder: 'Grade 6 - English - Writing a persuasive notice for a clean barangay',
    objective: 'Learners write a short persuasive notice that asks neighbours to segregate waste, using reasons and a call to action.',
    slides: [
      { title: 'What makes people act?', bullets: ['Look at two notices. Which one would make you follow it?', 'Persuasive writing = a clear request + reasons + a call to action.'] },
      { title: 'Plan your notice', bullets: ['Who will read it?', 'What do you want them to do?', 'Give two reasons they will care about.'] },
      { title: 'Write and share', bullets: ['Write a notice of 4 to 6 sentences.', 'Swap with a partner: is the request clear?', 'Revise one sentence to make it stronger.'] },
    ],
    worksheet: null,
  },
]

rmSync(root, { recursive: true, force: true })
let count = 0
for (const pack of packs) {
  const dir = path.join(root, pack.alias, pack.folder)
  mkdirSync(dir, { recursive: true })
  const title = pack.folder.split(' - ').at(-1)
  const write = (name, data) => {
    writeFileSync(path.join(dir, name), data)
    count++
  }

  write(
    'Lesson plan.docx',
    docx([
      para(title, { bold: true, size: 32 }),
      para(`Shared by ${pack.alias} (fictional placeholder teacher).`, { size: 20 }),
      para(NOTICE, { italic: true, size: 20 }),
      para(''),
      para('Objective', { bold: true, size: 26 }),
      para(pack.objective),
      para('Procedure', { bold: true, size: 26 }),
      ...pack.slides.map((s, i) => para(`${i + 1}. ${s.title}: ${s.bullets.join(' ')}`)),
    ]),
  )
  const deck = [{ title, bullets: [pack.objective, NOTICE] }, ...pack.slides]
  write('Slides.pptx', pptx(deck))
  // A PDF copy with the same name previews in the browser; the .pptx stays the editable download.
  write('Slides.pdf', pdf(deck.map((s) => ({ title: s.title, lines: s.bullets })), { landscape: true }))
  if (pack.worksheet) write('Worksheet.pdf', pdf([{ title: `${title}: worksheet`, lines: [...pack.worksheet, '', NOTICE] }]))
}
console.log(`Wrote ${count} placeholder files to sample-packs/.`)
