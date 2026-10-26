// Generates the fictional sample .docx files in public/samples from src/data/catalogue.json.
// Uses only Node built-ins: a .docx is a zip of a few XML files, written here uncompressed.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalogue = JSON.parse(readFileSync(path.join(root, 'src/data/catalogue.json'), 'utf8'))
const outDir = path.join(root, 'public/samples')

// Left out on purpose so the demo can show the missing-file state.
const INTENTIONALLY_MISSING = new Set(['typhoon-signals-poster-template.docx'])

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function zip(entries) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8')
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // UTF-8 names
    local.writeUInt16LE(0, 8) // stored
    local.writeUInt32LE(0x00210000, 10) // fixed DOS date/time for reproducible output
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    locals.push(local, nameBuf, data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(0, 10)
    central.writeUInt32LE(0x00210000, 12)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, nameBuf)
    offset += 30 + nameBuf.length + data.length
  }
  const centralBuf = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBuf.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, centralBuf, end])
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const para = (text, { bold = false, size = 24, italic = false } = {}) =>
  `<w:p><w:r><w:rPr>${bold ? '<w:b/>' : ''}${italic ? '<w:i/>' : ''}<w:sz w:val="${size}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`

function docx(paragraphs) {
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`
  return zip([
    {
      name: '[Content_Types].xml',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`),
    },
    {
      name: '_rels/.rels',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`),
    },
    { name: 'word/document.xml', data: Buffer.from(document) },
  ])
}

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
