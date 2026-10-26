// Tiny writers for fictional sample files: .docx, .pptx and .pdf, using only Node built-ins.
import { writeZip } from './zip.mjs'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const xml = (s) => Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${s}`)

// ---------- Word ----------

export const para = (text, { bold = false, size = 24, italic = false } = {}) =>
  `<w:p><w:r><w:rPr>${bold ? '<w:b/>' : ''}${italic ? '<w:i/>' : ''}<w:sz w:val="${size}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`

export function docx(paragraphs) {
  return writeZip([
    {
      name: '[Content_Types].xml',
      data: xml(
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
      ),
    },
    {
      name: '_rels/.rels',
      data: xml(
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      ),
    },
    {
      name: 'word/document.xml',
      data: xml(
        `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`,
      ),
    },
  ])
}

// ---------- PowerPoint ----------

const P_NS =
  'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"'
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const EMPTY_TREE =
  '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'

const THEME = `<a:theme ${P_NS} name="CherIt sample"><a:themeElements><a:clrScheme name="CherIt"><a:dk1><a:srgbClr val="332C27"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="6E655F"/></a:dk2><a:lt2><a:srgbClr val="FAF7F2"/></a:lt2><a:accent1><a:srgbClr val="8C6D79"/></a:accent1><a:accent2><a:srgbClr val="7A8B68"/></a:accent2><a:accent3><a:srgbClr val="EFECE6"/></a:accent3><a:accent4><a:srgbClr val="6F5560"/></a:accent4><a:accent5><a:srgbClr val="9B2C2C"/></a:accent5><a:accent6><a:srgbClr val="B9AEA4"/></a:accent6><a:hlink><a:srgbClr val="8C6D79"/></a:hlink><a:folHlink><a:srgbClr val="6F5560"/></a:folHlink></a:clrScheme><a:fontScheme name="CherIt"><a:majorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="CherIt"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="28575"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`

function textBox(id, name, { x, y, cx, cy }, lines, { size, bold = false, color = '332C27' }) {
  const paras = lines
    .map(
      (line) =>
        `<a:p><a:r><a:rPr lang="en-US" sz="${size}"${bold ? ' b="1"' : ''}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:rPr><a:t>${esc(line)}</a:t></a:r></a:p>`,
    )
    .join('')
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr wrap="square" rtlCol="0"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paras}</p:txBody></p:sp>`
}

/** slides: [{ title, bullets: string[] }] on a 16:9 canvas with a cream background. */
export function pptx(slides) {
  const files = [
    {
      name: '[Content_Types].xml',
      data: xml(
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${slides
          .map(
            (_, i) =>
              `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
          )
          .join('')}</Types>`,
      ),
    },
    {
      name: '_rels/.rels',
      data: xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="ppt/presentation.xml"/></Relationships>`,
      ),
    },
    {
      name: 'ppt/presentation.xml',
      data: xml(
        `<p:presentation ${P_NS}><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slides
          .map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 3}"/>`)
          .join('')}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`,
      ),
    },
    {
      name: 'ppt/_rels/presentation.xml.rels',
      data: xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="${REL}/theme" Target="theme/theme1.xml"/>${slides
          .map((_, i) => `<Relationship Id="rId${i + 3}" Type="${REL}/slide" Target="slides/slide${i + 1}.xml"/>`)
          .join('')}</Relationships>`,
      ),
    },
    {
      name: 'ppt/slideMasters/slideMaster1.xml',
      data: xml(
        `<p:sldMaster ${P_NS}><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FAF7F2"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${EMPTY_TREE}</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`,
      ),
    },
    {
      name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels',
      data: xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="${REL}/theme" Target="../theme/theme1.xml"/></Relationships>`,
      ),
    },
    {
      name: 'ppt/slideLayouts/slideLayout1.xml',
      data: xml(
        `<p:sldLayout ${P_NS} type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>${EMPTY_TREE}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`,
      ),
    },
    {
      name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
      data: xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`,
      ),
    },
    { name: 'ppt/theme/theme1.xml', data: xml(THEME) },
  ]
  slides.forEach((slide, i) => {
    const shapes =
      textBox(2, 'Title', { x: 685800, y: 457200, cx: 10820400, cy: 1143000 }, [slide.title], { size: 4000, bold: true, color: '8C6D79' }) +
      textBox(3, 'Body', { x: 685800, y: 1828800, cx: 10820400, cy: 4343400 }, slide.bullets, { size: 2400 })
    files.push(
      {
        name: `ppt/slides/slide${i + 1}.xml`,
        data: xml(`<p:sld ${P_NS}><p:cSld><p:spTree>${EMPTY_TREE}${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`),
      },
      {
        name: `ppt/slides/_rels/slide${i + 1}.xml.rels`,
        data: xml(
          `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`,
        ),
      },
    )
  })
  return writeZip(files)
}

// ---------- PDF ----------

const ascii = (s) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/₱/g, 'PHP ')
    .replace(/[^\x20-\x7e]/g, '')
const pdfText = (s) => ascii(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

function wrap(text, max) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max) {
      lines.push(line)
      line = word
    } else line = (line + ' ' + word).trim()
  }
  if (line) lines.push(line)
  return lines
}

/**
 * pages: [{ title, lines: string[] }]. Landscape pages suit slide copies; portrait suits worksheets.
 * Uses the standard Helvetica font, so no font files are embedded.
 */
export function pdf(pages, { landscape = false } = {}) {
  const [w, h] = landscape ? [842, 595] : [595, 842]
  const objects = []
  const add = (body) => objects.push(body) // object number = index + 1
  add('<< /Type /Catalog /Pages 2 0 R >>')
  add('') // pages, filled below
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  const kids = []
  for (const page of pages) {
    const ops = [`0.98 0.97 0.95 rg 0 0 ${w} ${h} re f`, '0.55 0.43 0.47 rg', `BT /F2 ${landscape ? 30 : 20} Tf 56 ${h - 80} Td (${pdfText(page.title)}) Tj ET`, '0.2 0.17 0.15 rg']
    let y = h - (landscape ? 140 : 120)
    const size = landscape ? 18 : 12
    for (const raw of page.lines) {
      for (const line of wrap(raw, landscape ? 70 : 85)) {
        ops.push(`BT /F1 ${size} Tf 56 ${y} Td (${pdfText(line)}) Tj ET`)
        y -= size * 1.6
      }
    }
    const stream = ops.join('\n')
    add(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`)
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${objects.length} 0 R >>`)
    kids.push(`${objects.length} 0 R`)
  }
  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${kids.length} >>`
  let out = '%PDF-1.4\n'
  const offsets = []
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out))
    out += `${i + 1} 0 obj\n${body}\nendobj\n`
  })
  const xrefAt = Buffer.byteLength(out)
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}
