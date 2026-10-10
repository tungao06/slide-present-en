// Printable presenter script for "The Starbucks Brand & Storytelling Journey".
// A4 landscape. One brief page per speaker, then one page per slide with
// Click | On screen | Say (English) | พูด (ไทย). Run:  node build.js  → ../export/Starbucks_Presentation_Script.docx
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel,
  PageOrientation, Header, Footer, PageNumber, BorderStyle, ShadingType, TabStopType, VerticalAlign, PageBreak, LineRuleType,
} = require("docx");
const C = require("./content");

const FOREST = "006241", GOLD = "CBA258", DEEP = "1E3932", CHAR = "191919", INK = "3A3A36", MUTED = "6B6A63", LATTE = "F7F5F0", MINT = "D4E9E2", RULE = "E6E2D6", WHITE = "FFFFFF";
const FONT = process.env.FONT || "Sarabun";
const F = { ascii: FONT, hAnsi: FONT, cs: FONT, eastAsia: FONT };
// A4 landscape: portrait dimensions + LANDSCAPE. Content width = 16838 - 2*800.
const PAGE = { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 800, bottom: 760, left: 800, right: 800, header: 400, footer: 400 } };
const CW = 16838 - 1600;

const T = (text, o = {}) => new TextRun({ text, font: F, size: o.size || 28, bold: o.bold, italics: o.italics, color: o.color || CHAR, shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined, characterSpacing: o.cs });
const none = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const para = (children, o = {}) => new Paragraph({ children, spacing: { before: o.before ?? 0, after: o.after ?? 0, line: o.line ?? 240, lineRule: LineRuleType.AUTO }, alignment: o.align, keepNext: o.keepNext, keepLines: true, indent: o.indent, shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined, border: o.border });
const spacer = (after = 120) => new Paragraph({ children: [], spacing: { after } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// **bold** inside a script line → bold run; "[CLICK]" / "[คลิก]" / "[PAUSE]" / "[หยุด]" → cue badges.
function rich(text, base) {
  const out = [];
  for (const part of text.split(/(\*\*[^*]+\*\*|\[(?:CLICK|คลิก|PAUSE|หยุด|NEXT)\])/g)) {
    if (!part) continue;
    if (/^\*\*/.test(part)) out.push(T(part.slice(2, -2), { ...base, bold: true, color: base.boldColor || FOREST }));
    else if (/^\[(CLICK|คลิก|NEXT)\]$/.test(part)) out.push(T(` ${part.slice(1, -1)} ▸ `, { ...base, bold: true, color: WHITE, fill: FOREST, size: base.size - 4 }));
    else if (/^\[(PAUSE|หยุด)\]$/.test(part)) out.push(T(` ‖ ${part.slice(1, -1).toLowerCase()} `, { ...base, bold: true, italics: true, color: "9A6B00", size: base.size - 4 }));
    else out.push(T(part, base));
  }
  return out;
}

function cell(children, width, o = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA }, verticalAlign: o.v || VerticalAlign.TOP, columnSpan: o.span,
    margins: { top: o.mt ?? 60, bottom: o.mb ?? 60, left: o.ml ?? 130, right: o.mr ?? 130 },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined,
    borders: o.borders || { top: none, left: none, right: o.rule ? { style: BorderStyle.SINGLE, size: 4, color: RULE } : none, bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE } },
    children,
  });
}
const table = (rows, W) => new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: W, rows, borders: noBorders });

// ---- Banners ------------------------------------------------------------------------------
function banner(left, right, o = {}) {
  const W = [CW - (o.wide || 3400), o.wide || 3400];
  return table([new TableRow({ cantSplit: true, children: [
    cell([para(left, { keepNext: o.keep })], W[0], { fill: o.fill || FOREST, mt: 130, mb: 130, ml: 240, borders: noBorders, v: VerticalAlign.CENTER }),
    cell([para(right, { align: AlignmentType.RIGHT, keepNext: o.keep })], W[1], { fill: o.fill2 || DEEP, mt: 130, mb: 130, mr: 240, borders: noBorders, v: VerticalAlign.CENTER }),
  ] })], W);
}
const h1 = (text, sub) => [
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [T(text, { bold: true, color: FOREST, size: 48 })], spacing: { after: 40 }, keepNext: true }),
  ...(sub ? [para([T(sub, { color: MUTED, size: 26 })], { after: 160, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 6 } } })] : []),
];
const chip = (text, o = {}) => T(` ${text} `, { bold: true, color: CHAR, fill: GOLD, size: o.size || 24 });

// ---- Cover ---------------------------------------------------------------------------------
function cover() {
  const W = [1900, 3600, 2000, 4238, 1500, 2000];
  const rows = [
    new TableRow({ tableHeader: true, cantSplit: true, children: ["ผู้พูด", "ชื่อ (เขียนเอง)", "สไลด์", "ตอน · Part", "เวลา", "ส่งต่อให้"].map((h, i) => cell([para([T(h, { bold: true, color: WHITE, size: 24 })])], W[i], { fill: FOREST, mt: 70, mb: 70 })) }),
    ...C.speakers.map((s, i) => new TableRow({ cantSplit: true, children: [
      cell([para([T(`Speaker ${s.n}`, { bold: true, color: FOREST, size: 30 })])], W[0], { fill: i % 2 ? LATTE : undefined, rule: true, v: VerticalAlign.CENTER }),
      cell([para([T("____________________", { color: RULE, size: 28 })])], W[1], { fill: i % 2 ? LATTE : undefined, rule: true, v: VerticalAlign.CENTER }),
      cell([para([T(s.slides, { bold: true, size: 28 })])], W[2], { fill: i % 2 ? LATTE : undefined, rule: true, v: VerticalAlign.CENTER }),
      cell([para([T(s.part, { size: 26 })])], W[3], { fill: i % 2 ? LATTE : undefined, rule: true, v: VerticalAlign.CENTER }),
      cell([para([T(s.time, { bold: true, size: 28 })])], W[4], { fill: i % 2 ? LATTE : undefined, rule: true, v: VerticalAlign.CENTER }),
      cell([para([s.gives ? chip(s.gives, { size: 20 }) : T("Q&A ทั้งทีม", { size: 24, color: MUTED })])], W[5], { fill: i % 2 ? LATTE : undefined, v: VerticalAlign.CENTER }),
    ] })),
  ];
  return [
    para([T("MBA BUSINESS CLASS  ·  GROUP PRESENTATION", { bold: true, color: GOLD, size: 24, cs: 30 })], { after: 120 }),
    para([T("Presentation Script", { bold: true, color: FOREST, size: 64 })], { line: 220 }),
    para([T("The Starbucks Brand & Storytelling Journey  ·  สคริปต์นำเสนอ (อังกฤษ / ไทย)", { color: MUTED, size: 32 })], { after: 120, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 8 } } }),
    para([T("การแบ่งส่วน · Team assignment", { bold: true, color: FOREST, size: 30 })], { after: 60, keepNext: true }),
    table(rows, W),
    spacer(100),
    para([T("รวม 20 นาที + ถาม-ตอบ 5 นาที  ·  ", { bold: true, size: 26, color: FOREST }), T("แต่ละคนพูด 2 สไลด์ สไลด์ละ 2–3 นาที สลับลำดับได้โดยแก้ตารางนี้ตารางเดียว เพราะบนสไลด์ไม่มีชื่อผู้พูด", { size: 26, color: INK })], { after: 60, line: 240 }),
    para([T("จุดส่งต่อ (Hand-off)  ·  ", { bold: true, size: 26, color: FOREST }), T("ป้ายสีทองมุมขวาล่างของสไลด์สุดท้ายของคุณคือคำส่งต่อ: พูดคำบนป้ายเป็นประโยคสุดท้าย กด Next แล้วป้ายจะบินไปมุมขวาบนของสไลด์ถัดไป ผู้พูดคนต่อไปเริ่มจากคำนั้นทันที ไม่ต้องแนะนำตัวยาว", { size: 26, color: INK })], { after: 60, line: 240 }),
    para([T("วิธีอ่านตารางสคริปต์  ·  ", { bold: true, size: 26, color: FOREST }),
      T(" CLICK ▸ ", { bold: true, color: WHITE, fill: FOREST, size: 22 }), T("  = กดคลิกตรงนี้   ", { size: 24, color: MUTED }),
      T(" ‖ pause ", { bold: true, italics: true, color: "9A6B00", size: 22 }), T("  = หยุดหนึ่งจังหวะ   ", { size: 24, color: MUTED }),
      T("ตัวหนาสีเขียว", { bold: true, color: FOREST, size: 24 }), T("  = คำสำคัญที่ต้องเน้นเสียง   ", { size: 24, color: MUTED }),
      chip("ป้ายทอง", { size: 20 }), T("  = ป้ายส่งต่อบนจอ", { size: 24, color: MUTED }),
    ], { before: 60, fill: MINT, indent: { left: 120, right: 120 }, line: 250 }),
    spacer(80),
    para([T("หลักการพูด  ·  ", { bold: true, size: 26, color: FOREST }), T("พูดประโยคก่อน แล้วค่อยคลิก ให้ผู้ฟังได้ยินประเด็นก่อนเห็นตัวอักษร  ·  ภาษาอังกฤษกับภาษาไทยในตารางมีความหมายเดียวกัน เลือกพูดภาษาเดียวตลอดการนำเสนอ (สไลด์ 1–8 อังกฤษ / สไลด์ 9–16 ไทย)", { size: 26, color: INK })], { line: 240 }),
  ];
}

// ---- Speaker brief -----------------------------------------------------------------------------
function brief(s) {
  const W2 = [CW / 2, CW / 2];
  const list = (title, items, color) => [
    para([T(title, { bold: true, color, size: 28 })], { after: 60, keepNext: true }),
    ...items.map((t) => para([T("•  ", { color: GOLD, size: 28, bold: true }), ...rich(t, { size: 26, color: INK })], { after: 50, line: 240, indent: { left: 360, hanging: 360 } })),
  ];
  return [
    banner([T(`SPEAKER ${s.n}   `, { bold: true, color: GOLD, size: 44 }), T(s.part, { bold: true, color: WHITE, size: 34 })], [T("สไลด์ ", { color: MINT, size: 26 }), T(s.slides, { bold: true, color: WHITE, size: 40 }), T("    เวลา ", { color: MINT, size: 26 }), T(s.time, { bold: true, color: WHITE, size: 40 })], { wide: 5200 }),
    spacer(140),
    table([new TableRow({ children: [
      cell([
        para([T("คุณรับช่วงจาก", { bold: true, color: FOREST, size: 26 })], { after: 40 }),
        para(s.takes ? [chip(s.takes), T(`   ${s.takesFrom}`, { size: 24, color: MUTED })] : [T("— เปิดการนำเสนอ ไม่มีคนส่งต่อ", { size: 26, color: MUTED })], { after: 160 }),
        para([T("คุณส่งต่อให้", { bold: true, color: FOREST, size: 26 })], { after: 40 }),
        para(s.gives ? [chip(s.gives), T(`   ${s.givesTo}`, { size: 24, color: MUTED })] : [T("— ปิดการนำเสนอ แล้วเปิด Q&A ทั้งทีม", { size: 26, color: MUTED })], { after: 160 }),
        ...list("สิ่งที่ผู้ฟังต้องจำได้ (Key messages)", s.keys, FOREST),
      ], W2[0], { fill: LATTE, borders: noBorders, mt: 160, mb: 160, ml: 220, mr: 220 }),
      cell([
        ...list("ตัวเลขและชื่อที่ต้องพูดให้ถูก", s.facts, FOREST),
        spacer(80),
        ...list("ระวัง", s.watch, "9A6B00"),
        spacer(80),
        para([T("Q&A ที่คุณเป็นคนตอบหลัก", { bold: true, color: FOREST, size: 28 })], { after: 60 }),
        ...s.qa.map((q) => para([T("?  ", { color: GOLD, size: 28, bold: true }), T(q, { size: 26, color: INK })], { after: 50, line: 240, indent: { left: 360, hanging: 360 } })),
      ], W2[1], { borders: noBorders, mt: 160, mb: 160, ml: 220, mr: 220 }),
    ] })], W2),
  ];
}

// ---- Slide page ---------------------------------------------------------------------------------
function slidePage(sl, s) {
  const W = [1050, 2500, 5700, 5988];
  const head = new TableRow({ tableHeader: true, cantSplit: true, children: ["คลิก", "บนจอ · On screen", "Say (English)", "พูด (ภาษาไทย)"].map((h, i) =>
    cell([para([T(h, { bold: true, color: WHITE, size: 24 })], { align: i === 0 ? AlignmentType.CENTER : undefined })], W[i], { fill: DEEP, mt: 60, mb: 60 })) });
  const body = sl.rows.map((r, idx) => {
    const fill = idx % 2 ? LATTE : undefined;
    const clickPara = r.click === "open"
      ? para([T("เปิดหน้า", { bold: true, color: FOREST, size: 24 })], { align: AlignmentType.CENTER })
      : para([T(String(r.click), { bold: true, color: FOREST, size: 44 })], { align: AlignmentType.CENTER });
    return new TableRow({ cantSplit: true, children: [
      cell([clickPara], W[0], { fill, v: VerticalAlign.CENTER, rule: true }),
      cell([para(rich(r.screen, { size: 23, color: MUTED }), { line: 225 })], W[1], { fill, rule: true }),
      cell([para(rich(r.en, { size: 26, color: INK }), { line: 235 })], W[2], { fill, rule: true }),
      cell([para(rich(r.th, { size: 28, color: CHAR }), { line: 250 })], W[3], { fill }),
    ] });
  });
  return [
    banner([T(`SPEAKER ${s.n}   `, { bold: true, color: GOLD, size: 26, cs: 20 }), T(`SLIDE ${sl.no} / 8  ·  ${sl.title}`, { bold: true, color: WHITE, size: 34 })], [T("เวลา  ", { color: MINT, size: 26 }), T(sl.time, { bold: true, color: WHITE, size: 44 })]),
    para([T("ท่าทาง · Stage   ", { bold: true, color: FOREST, size: 24 }), ...rich(sl.stage, { size: 25, color: INK, italics: true })], { before: 100, after: 100, fill: MINT, indent: { left: 120, right: 120 }, line: 240 }),
    table([head, ...body], W),
    ...(sl.handoff ? [para([T("ส่งต่อ · Hand-off   ", { bold: true, color: FOREST, size: 24 }), chip(sl.handoff), T(`   พูดคำบนป้ายเป็นคำสุดท้าย แล้วกด Next — ป้ายจะบินไปต้นสไลด์ ${sl.no + 1} ให้ Speaker ${sl.handoffTo} รับช่วง`, { size: 24, color: INK })], { before: 120, fill: LATTE, indent: { left: 120, right: 120 }, line: 240 })] : []),
  ];
}

// ---- Q&A + checklist -----------------------------------------------------------------------------
function qaPage() {
  const W = [3400, 5900, 5438, 1500];
  const rows = [
    new TableRow({ tableHeader: true, cantSplit: true, children: ["คำถามที่คาดว่าจะเจอ", "Answer (English)", "คำตอบ (ไทย)", "ใครตอบ"].map((h, i) => cell([para([T(h, { bold: true, color: WHITE, size: 24 })])], W[i], { fill: DEEP, mt: 60, mb: 60 })) }),
    ...C.qa.map((q, i) => new TableRow({ cantSplit: true, children: [
      cell([para([T(q.q, { bold: true, color: FOREST, size: 25 })], { line: 230 })], W[0], { fill: i % 2 ? LATTE : undefined, rule: true }),
      cell([para([T(q.en, { size: 24, color: INK })], { line: 230 })], W[1], { fill: i % 2 ? LATTE : undefined, rule: true }),
      cell([para([T(q.th, { size: 26 })], { line: 245 })], W[2], { fill: i % 2 ? LATTE : undefined, rule: true }),
      cell([para([T(q.who, { bold: true, size: 26, color: FOREST })], { align: AlignmentType.CENTER })], W[3], { fill: i % 2 ? LATTE : undefined, v: VerticalAlign.CENTER }),
    ] })),
  ];
  return [
    ...h1("ถาม-ตอบ · Q&A prep", "คนที่สไลด์โดนถามตอบก่อน คนอื่นเสริมได้หนึ่งประโยค ตัวเลขที่ไม่อยู่บนสไลด์ให้พูดว่า \"ประมาณ\" หรือขอติดตามให้หลังคลาส"),
    table(rows, W),
    spacer(200),
    ...h1("เช็กลิสต์ก่อนขึ้นพูด · Checklist"),
    ...C.checklist.map((t) => para([T("☐  ", { size: 30, color: GOLD }), ...rich(t, { size: 26, color: INK })], { after: 60, line: 240, indent: { left: 480, hanging: 480 } })),
  ];
}

// ---- Assemble -----------------------------------------------------------------------------------------
const header = (label) => new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: CW }], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 4 } },
  children: [T("PRESENTATION SCRIPT", { bold: true, color: FOREST, size: 20, cs: 30 }), T(`\tThe Starbucks Brand & Storytelling Journey  ·  ${label}`, { color: MUTED, size: 20 })] })] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
  T("หน้า ", { size: 22, color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], font: F, size: 22, color: MUTED, bold: true }), T(" / ", { size: 22, color: MUTED }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: F, size: 22, color: MUTED })] })] });
const S = (children, label) => ({ properties: { page: PAGE }, headers: { default: header(label) }, footers: { default: footer }, children });

const sections = [S(cover(), "ภาพรวมทีม")];
// One section per page: a section starts on a new page, so no page-break paragraph can spill over.
for (const s of C.speakers) {
  sections.push(S(brief(s), `Speaker ${s.n}  ·  ${s.part}`));
  for (const sl of C.slides.filter((x) => x.speaker === s.n)) sections.push(S(slidePage(sl, s), `Speaker ${s.n}  ·  ${s.part}`));
}
sections.push(S(qaPage(), "Q&A"));

const doc = new Document({
  creator: "MBA group", title: "Presentation Script — The Starbucks Brand & Storytelling Journey",
  styles: { default: { document: { run: { font: F, size: 28 } } }, paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: F, size: 48, bold: true, color: FOREST }, paragraph: { outlineLevel: 0 } },
  ] },
  sections,
});
const OUT = path.join(__dirname, "..", "export", "Starbucks_Presentation_Script.docx");
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("wrote", OUT); });
