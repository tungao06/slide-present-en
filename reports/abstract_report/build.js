const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel,
  PageBreak, Header, Footer, PageNumber, BorderStyle, ShadingType, TabStopType, LevelFormat, VerticalAlign, PageNumberSeparator,
} = require("docx");

const C = JSON.parse(fs.readFileSync(__dirname + "/content.json", "utf8"));
const NAVY = "1B2A4A", TEAL = "2E8B86", GRAY = "6B7280", LIGHT = "EEF1F5", MINT = "E6F3F1", RULE = "D9DFE7";
const FONT = process.env.FONT || "TH SarabunPSK"; // the font the original report uses (Thai academic standard)
const fonts = { ascii: FONT, hAnsi: FONT, cs: FONT, eastAsia: FONT };
const SZ = 32; // 16 pt body (Sarabun convention)

const run = (text, o = {}) => new TextRun({ text, font: fonts, size: o.size || SZ, bold: o.bold, italics: o.italics, color: o.color, ...o });
const p = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [run(children)], ...o });
const spacer = (after = 120) => new Paragraph({ children: [], spacing: { after } });
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const cellMargins = { top: 70, bottom: 70, left: 140, right: 140 };

function sectionHeading(text, o = {}) {
  // navy heading with a teal rule beneath
  return new Paragraph({
    heading: o.level || HeadingLevel.HEADING_2,
    children: [run(text, { bold: true, size: o.size || 40, color: NAVY })],
    spacing: { before: o.before ?? 240, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 4 } },
    keepNext: true,
  });
}
function label(text) {
  // small teal caps-style label
  return new Paragraph({ children: [run(text, { bold: true, size: 26, color: TEAL, characterSpacing: 20 })], spacing: { before: 200, after: 80 }, keepNext: true });
}
function body(text, o = {}) {
  return new Paragraph({ children: [run(text, o)], alignment: AlignmentType.THAI_DISTRIBUTE, spacing: { after: 140, line: 320 }, widowControl: true });
}
function runIn(labelText, text) {
  // structured abstract item: bold run-in label, then text
  return new Paragraph({
    children: [run(labelText + ": ", { bold: true, color: NAVY }), run(text)],
    alignment: AlignmentType.THAI_DISTRIBUTE, spacing: { after: 120, line: 320 }, indent: { left: 360 }, widowControl: true,
  });
}

function metaTable(fields, doi) {
  const W = 9360, L = 2300, R = W - L;
  const rows = fields.map(([k, v], i) => new TableRow({
    children: [
      new TableCell({ width: { size: L, type: WidthType.DXA }, shading: { fill: LIGHT, type: ShadingType.CLEAR, color: "auto" }, margins: cellMargins, verticalAlign: VerticalAlign.CENTER,
        children: [p([run(k, { bold: true, color: NAVY, size: 28 })], { keepNext: true })] }),
      new TableCell({ width: { size: R, type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.CENTER,
        borders: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE } },
        children: [p([run(v, { size: 28 })], { keepNext: true })] }),
    ],
    cantSplit: true,
  }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [L, R], rows, borders: noBorders });
}

function articleBlock(n) {
  const a = C.articles[n], en = a.en, th = a.th;
  const out = [];
  const title = en.fields.find((f) => /^Title/.test(f[0]))[1];
  const thTitle = th.fields.find((f) => /ชื่อบทความ/.test(f[0]))[1].replace(/\s*\(.*\)\s*$/, "");
  // Article banner
  out.push(new Paragraph({
    children: [run(`ARTICLE ${n}  ·  บทความที่ ${n}`, { bold: true, size: 26, color: "FFFFFF", characterSpacing: 30 })],
    shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" }, spacing: { before: 0, after: 0 }, indent: { left: 200, right: 200 },
    border: { top: { style: BorderStyle.SINGLE, size: 24, color: NAVY, space: 6 }, bottom: { style: BorderStyle.SINGLE, size: 24, color: NAVY, space: 6 } },
  }));
  out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(title, { bold: true, size: 36, color: NAVY })], spacing: { before: 200, after: 60 }, keepNext: true }));
  out.push(new Paragraph({ children: [run(thTitle, { size: 30, color: GRAY })], spacing: { after: 160 }, keepNext: true }));
  out.push(metaTable(en.fields.filter((f) => !/^Title/.test(f[0])).map(([k, v]) => [k === "Journal/Issue" ? "Journal / Issue" : k, v])));

  // English abstract
  out.push(label("ABSTRACT  ·  ENGLISH"));
  if (en.abstract) out.push(body(en.abstract));
  for (const [k, v] of en.sub) out.push(runIn(k, v));

  // Thai abstract
  out.push(label("บทคัดย่อ  ·  ฉบับภาษาไทย"));
  out.push(new Paragraph({ children: [run(thTitle, { bold: true, color: NAVY, size: 30 })], spacing: { after: 100 }, keepNext: true }));
  if (th.abstract) out.push(body(th.abstract));
  for (const [k, v] of th.sub) out.push(runIn(k, v));
  return out;
}

// ---- Cover ----------------------------------------------------------------
const cover = [
  spacer(1800),
  new Paragraph({ children: [run("ENG 501  ·  ENGLISH FOR MASTER'S DEGREE", { bold: true, size: 24, color: TEAL, characterSpacing: 40 })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
  new Paragraph({ children: [run("ABSTRACT REPORT", { bold: true, size: 72, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
  new Paragraph({ children: [run("รายงานสรุปบทคัดย่อบทความวิจัย", { size: 36, color: GRAY })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
  new Paragraph({ children: [run("Five research articles on generative AI, work and consumer behaviour", { size: 28, color: GRAY, italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 12 } } }),
  spacer(900),
  new Paragraph({ children: [run("Presented by", { size: 26, color: TEAL, bold: true, characterSpacing: 30 })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
  new Paragraph({ children: [run("Mr. Chayanun Sungsa-ard", { size: 34, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [run("Student ID: 691401708", { size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [run("Master of Business Administration (MBA)", { size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 480 } }),
  new Paragraph({ children: [run("Submitted to", { size: 26, color: TEAL, bold: true, characterSpacing: 30 })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
  new Paragraph({ children: [run("Sarinrat Sertpunya, Ph.D.", { size: 34, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 480 } }),
  new Paragraph({ children: [run("Course", { size: 26, color: TEAL, bold: true, characterSpacing: 30 })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
  new Paragraph({ children: [run("ENG 501 English for master's degree", { size: 30 })], alignment: AlignmentType.CENTER }),
];

// ---- Overview page ----------------------------------------------------------
const W = 9360, cw = [800, 4860, 2800, 900];
const head = ["No", "Article", "Journal / Source", "Year"];
const overviewRows = [new TableRow({ tableHeader: true, children: head.map((h, i) => new TableCell({
  width: { size: cw[i], type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" }, margins: cellMargins,
  children: [p([run(h, { bold: true, color: "FFFFFF", size: 28 })], { alignment: i === 0 || i === 3 ? AlignmentType.CENTER : AlignmentType.LEFT })] })) })];
for (const n of [1, 2, 3, 4, 5]) {
  const en = C.articles[n].en;
  const title = en.fields.find((f) => /^Title/.test(f[0]))[1];
  const authors = en.fields.find((f) => /^Authors/.test(f[0]))[1];
  const journal = en.fields.find((f) => /^Journal/.test(f[0]))[1];
  const year = (journal.match(/(20\d\d)/) || ["", ""])[1];
  const fill = n % 2 === 0 ? LIGHT : "FFFFFF";
  const cells = [
    [p([run(String(n), { bold: true, color: TEAL, size: 30 })], { alignment: AlignmentType.CENTER })],
    [p([run(title, { bold: true, size: 26, color: NAVY }), run("  —  " + authors.replace(/,.*$/, " et al."), { size: 24, color: GRAY })])],
    [p([run(journal.replace(/,?\s*20\d\d.*$/, ""), { size: 26 })])],
    [p([run(year, { size: 26 })], { alignment: AlignmentType.CENTER })],
  ];
  overviewRows.push(new TableRow({ cantSplit: true, children: cells.map((c, i) => new TableCell({ width: { size: cw[i], type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.CENTER,
    shading: { fill, type: ShadingType.CLEAR, color: "auto" }, borders: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE } }, children: c })) }));
}
const overview = [
  sectionHeading("Overview  ·  ภาพรวมบทความทั้ง 5 เรื่อง", { before: 0 }),
  body("Five recent research articles on generative AI and its effects on persuasion, knowledge work, software development, hospitality services and entrepreneurship. Each article has its own section: bibliographic details, the original English abstract and a Thai translation.  ·  บทความวิจัย 5 เรื่อง แต่ละบทความแยกเป็นส่วนของตนเอง ประกอบด้วยข้อมูลบรรณานุกรม บทคัดย่อต้นฉบับภาษาอังกฤษ และฉบับแปลภาษาไทย"),
  spacer(40),
  new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cw, rows: overviewRows, borders: noBorders }),
];

// ---- References ------------------------------------------------------------------
const refs = [sectionHeading("References  ·  รายการอ้างอิง", { before: 0 })];
C.refs.forEach((r, i) => {
  const [cite, title = ""] = r.cite.split(/ ชื่อเรื่อง: /);
  refs.push(new Paragraph({
    children: [run(`${i + 1}.  `, { bold: true, color: TEAL }), run(cite, { bold: true, color: NAVY }), run(title ? `  ·  ${title}` : "")],
    spacing: { before: 160, after: 40 }, indent: { left: 500, hanging: 500 }, keepNext: true,
  }));
  refs.push(new Paragraph({ children: [run("DOI / Reference: ", { bold: true, size: 26, color: GRAY }), run(r.doi, { size: 26, color: GRAY })], indent: { left: 500 }, spacing: { after: 120 } }));
});

// ---- Document --------------------------------------------------------------------
const pageSetup = { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1300, left: 1440, header: 600, footer: 600 } } };
const header = new Header({ children: [new Paragraph({
  children: [run("ABSTRACT REPORT", { bold: true, size: 20, color: NAVY, characterSpacing: 30 }), run("\tENG 501 English for Master's Degree  ·  Chayanun Sungsa-ard  ·  691401708", { size: 20, color: GRAY })],
  tabStops: [{ type: TabStopType.RIGHT, position: 9360 }], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 4 } },
}) ] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
  run("Page ", { size: 20, color: GRAY }), new TextRun({ children: [PageNumber.CURRENT], font: fonts, size: 20, color: GRAY }), run(" of ", { size: 20, color: GRAY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: fonts, size: 20, color: GRAY }),
] }) ] });

const sections = [
  { properties: { ...pageSetup, titlePage: true }, headers: { default: header, first: new Header({ children: [] }) }, footers: { default: footer, first: new Footer({ children: [] }) }, children: cover },
  { properties: { ...pageSetup }, headers: { default: header }, footers: { default: footer }, children: overview },
];
for (const n of [1, 2, 3, 4, 5]) sections.push({ properties: { ...pageSetup }, headers: { default: header }, footers: { default: footer }, children: articleBlock(n) });
sections.push({ properties: { ...pageSetup }, headers: { default: header }, footers: { default: footer }, children: refs });

const doc = new Document({
  creator: "Chayanun Sungsa-ard", title: "Abstract Report — ENG 501",
  styles: { default: { document: { run: { font: fonts, size: SZ } } }, paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: fonts, size: 36, bold: true, color: NAVY }, paragraph: { outlineLevel: 0 } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: fonts, size: 40, bold: true, color: NAVY }, paragraph: { outlineLevel: 1 } },
  ] },
  sections,
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(__dirname + "/out.docx", b); console.log("wrote out.docx"); });
