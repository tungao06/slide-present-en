// Printable presenter copy of the ENG 501 presentation script.
// A4 landscape, one slide per page, big click numbers, Thai and English side by side.
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel,
  PageOrientation, Header, Footer, PageNumber, BorderStyle, ShadingType, TabStopType, VerticalAlign, PageBreak,
  LevelFormat,
} = require("docx");

const D = JSON.parse(fs.readFileSync(__dirname + "/content.json", "utf8"));
const NAVY = "1B2A4A", TEAL = "2E8B86", GRAY = "6B7280", LIGHT = "F1F4F7", MINT = "E6F3F1", RULE = "CFD6DF";
const FONT = process.env.FONT || "TH SarabunPSK";
const F = { ascii: FONT, hAnsi: FONT, cs: FONT, eastAsia: FONT };

// A4 landscape: pass portrait dimensions + LANDSCAPE. Content width = 16838 - 2*850.
const PAGE = { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 850, bottom: 800, left: 850, right: 850, header: 420, footer: 420 } };
const CW = 16838 - 2 * 850; // 15138

const T = (text, o = {}) => new TextRun({ text, font: F, size: o.size || 32, bold: o.bold, italics: o.italics, color: o.color, shading: o.shading, characterSpacing: o.cs });
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const clean = (s) => s.replace(/\s*\n\s*/g, " ").trim();

// Turn one cell's runs into TextRuns, making click and pause cues stand out.
const CUE = /(\((?:คลิก|click|หยุด|pause|หยุด คลิก|pause, click)\))/g;
function styled(runs, base) {
  const out = [];
  for (const r of runs) {
    for (const part of r.t.split(CUE)) {
      if (!part) continue;
      if (/^\((?:คลิก|click)\)$/.test(part)) out.push(T(` ${part.slice(1, -1).toUpperCase() === "CLICK" ? "CLICK" : "คลิก"} ▸ `, { ...base, bold: true, color: "FFFFFF", shading: { type: ShadingType.CLEAR, fill: TEAL, color: "auto" }, size: base.size - 4 }));
      else if (/^\((?:หยุด คลิก|pause, click)\)$/.test(part)) {
        const th = part.includes("หยุด");
        out.push(T(th ? " ‖ หยุด " : " ‖ pause ", { ...base, bold: true, italics: true, color: "B45309", size: base.size - 4 }));
        out.push(T(th ? " คลิก ▸ " : " CLICK ▸ ", { ...base, bold: true, color: "FFFFFF", shading: { type: ShadingType.CLEAR, fill: TEAL, color: "auto" }, size: base.size - 4 }));
      } else if (/^\((?:หยุด|pause)\)$/.test(part)) out.push(T(` ‖ ${part.slice(1, -1)} `, { ...base, bold: true, italics: true, color: "B45309", size: base.size - 4 }));
      else out.push(T(part, { ...base, bold: base.bold || r.b, italics: base.italics || r.i, color: r.b && base.boldColor ? base.boldColor : base.color }));
    }
  }
  return out;
}
const textOf = (runs) => runs.map((r) => r.t).join("").trim();

function cell(children, width, o = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA }, verticalAlign: o.v || VerticalAlign.TOP,
    margins: { top: o.mt ?? 70, bottom: o.mb ?? 70, left: 120, right: 120 },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined,
    borders: { top: none, left: none, right: o.rightRule ? { style: BorderStyle.SINGLE, size: 4, color: RULE } : none, bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE } },
    children,
  });
}
const para = (children, o = {}) => new Paragraph({ children, spacing: { after: o.after ?? 0, line: o.line ?? 276 }, alignment: o.align, keepNext: o.keepNext, keepLines: true });

// ---- Slide script table: Click | On screen | พูด (TH) | Say (EN) -------------------
function slideTable(rows, sizes, keepTogether, banner, note) {
  const W = [1000, 2300, 6338, 5500];
  const bannerRow = new TableRow({ tableHeader: true, cantSplit: true, children: [
    new TableCell({ columnSpan: 3, width: { size: W[0] + W[1] + W[2], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" }, margins: { top: 110, bottom: 110, left: 200, right: 140 }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
      children: [para([T(banner.version + "   ", { bold: true, color: "9FD8D2", size: 24, cs: 20 }), T(banner.label, { bold: true, color: "FFFFFF", size: 40 })])] }),
    new TableCell({ width: { size: W[3], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: TEAL, color: "auto" }, margins: { top: 110, bottom: 110, left: 140, right: 200 }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
      children: [para([T("เวลา  ", { color: "E6F3F1", size: 26 }), T(banner.time, { bold: true, color: "FFFFFF", size: 44 })], { align: AlignmentType.RIGHT })] }),
  ] });
  const head = new TableRow({ tableHeader: true, cantSplit: true, children: ["คลิก", "บนจอ", "พูด (ภาษาไทย)", "Say (English)"].map((h, i) =>
    cell([para([T(h, { bold: true, color: "FFFFFF", size: 26 })], { align: i === 0 ? AlignmentType.CENTER : undefined })], W[i], { fill: "33466B", mt: 50, mb: 50 })) });
  const noteRow = note ? [new TableRow({ cantSplit: true, children: [new TableCell({ columnSpan: 4, width: { size: CW, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: MINT, color: "auto" }, margins: { top: 80, bottom: 80, left: 200, right: 200 }, borders: noBorders,
    children: [para([T("ท่าทาง · Stage   ", { bold: true, color: TEAL, size: 26 }), ...styled(note, { size: 27, color: GRAY, italics: true })], { line: 300 })] })] })] : [];
  const body = rows.slice(1).map((r, idx) => {
    const click = textOf(r[0]);
    const isOpen = /เปิด/.test(click);
    const last = idx === rows.length - 2;
    const kn = keepTogether && !last;
    const clickPara = isOpen
      ? para([T("เปิดหน้า", { bold: true, color: NAVY, size: 26 })], { align: AlignmentType.CENTER, keepNext: kn })
      : para([T(click.replace(/\s*·\s*/g, " · "), { bold: true, color: TEAL, size: click.length > 3 ? 34 : 44 })], { align: AlignmentType.CENTER, keepNext: kn });
    const fill = idx % 2 ? LIGHT : undefined;
    return new TableRow({ cantSplit: true, children: [
      cell([clickPara], W[0], { fill, v: VerticalAlign.CENTER, rightRule: true }),
      cell([para(styled(r[1], { size: sizes.screen, color: GRAY, boldColor: TEAL }), { keepNext: kn, line: 300 })], W[1], { fill, rightRule: true }),
      cell([para(styled(r[2], { size: sizes.th, color: "111827", boldColor: NAVY }), { keepNext: kn, line: 330 })], W[2], { fill, rightRule: true }),
      cell([para(styled(r[3], { size: sizes.en, color: "374151", boldColor: NAVY }), { keepNext: kn, line: 300 })], W[3], { fill }),
    ] });
  });
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: W, rows: [bannerRow, head, ...noteRow, ...body], borders: noBorders });
}

// ---- Generic table (overview, hand-off, Q&A) --------------------------------------
function genericTable(rows, W, sizes) {
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: W, borders: noBorders, rows: rows.map((r, ri) => new TableRow({
    tableHeader: ri === 0, cantSplit: true,
    children: r.map((c, ci) => ri === 0
      ? cell([para([T(textOf(c), { bold: true, color: "FFFFFF", size: 26 })])], W[ci], { fill: NAVY, mt: 60, mb: 60 })
      : cell([para(styled(c, { size: sizes[ci] || 28, color: ci === 0 ? NAVY : "1F2937", bold: ci === 0, boldColor: NAVY }), { line: 310 })], W[ci], { fill: ri % 2 === 0 ? LIGHT : undefined, rightRule: ci < r.length - 1 })),
  })) });
}

// ---- Building blocks -----------------------------------------------------------------
function slideBanner(h3, time, version) {
  // "Slide 1 / 6 · Title · หน้าปก (1:00)" → banner with the time on the right
  const h = clean(h3);
  const m = h.match(/^(.*?)(?:\s*\((\d+:\d+)\))?$/);
  const label = m[1].replace(/\s*·\s*(\d+:\d+)$/, "");
  const t = m[2] || (h.match(/(\d+:\d+)\s*$/) || [])[1] || time || "";
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW - 3200, 3200], borders: noBorders, rows: [new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: CW - 3200, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" }, margins: { top: 120, bottom: 120, left: 240, right: 140 }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
      children: [para([T(version + "   ", { bold: true, color: "9FD8D2", size: 24, cs: 20 }), T(label.toUpperCase().replace(/^SLIDE/, "SLIDE"), { bold: true, color: "FFFFFF", size: 40 })], { keepNext: true })] }),
    new TableCell({ width: { size: 3200, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: TEAL, color: "auto" }, margins: { top: 120, bottom: 120, left: 140, right: 240 }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
      children: [para([T("เวลา  ", { color: "E6F3F1", size: 26 }), T(t, { bold: true, color: "FFFFFF", size: 44 })], { align: AlignmentType.RIGHT, keepNext: true })] }),
  ] })] });
}
const stageNote = (runs) => new Paragraph({ children: [T("ท่าทาง · Stage   ", { bold: true, color: TEAL, size: 26 }), ...styled(runs, { size: 28, color: GRAY, italics: true })],
  spacing: { before: 120, after: 120 }, keepNext: true, shading: { type: ShadingType.CLEAR, fill: MINT, color: "auto" }, indent: { left: 120, right: 120 } });
const sectionTitle = (text, sub) => [
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [T(text, { bold: true, color: NAVY, size: 52 })], spacing: { after: 40 }, keepNext: true }),
  ...(sub ? [new Paragraph({ children: [T(sub, { color: GRAY, size: 28 })], spacing: { after: 160 }, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 6 } } })] : []),
];
const bodyPara = (runs, o = {}) => new Paragraph({ children: styled(runs, { size: o.size || 30, color: o.color || "1F2937", boldColor: NAVY }), spacing: { after: 120, line: 320 } });
const spacer = (a = 120) => new Paragraph({ children: [], spacing: { after: a } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const sec = (name) => D.sections.find((s) => s.h.replace(/\s+/g, " ").startsWith(name));

// ---- Cover / quick reference ---------------------------------------------------------
const ov = sec("Overview"), full = sec("Script"), fast = sec("Fast version"), hand = sec("Hand-off"), qa = sec("Anticipated"), chk = sec("Delivery");
const ovParas = ov.items.filter((i) => i.type === "p");
const ovTable = ov.items.find((i) => i.type === "table");
const cover = [
  new Paragraph({ children: [T("ENG 501  ·  ENGLISH FOR MASTER'S DEGREE", { bold: true, color: TEAL, size: 26, cs: 30 })], spacing: { after: 60 } }),
  new Paragraph({ children: [T("Presentation Script", { bold: true, color: NAVY, size: 64 })], spacing: { after: 0 } }),
  new Paragraph({ children: [T("AI and Work Performance  ·  สคริปต์นำเสนอ (ไทย / อังกฤษ)", { color: GRAY, size: 34 })], spacing: { after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 8 } } }),
  new Paragraph({ children: [T("Chayanun Sungsa-ard", { bold: true, color: NAVY, size: 32 }), T("   ·   Student ID 691401708   ·   MBA", { color: GRAY, size: 30 })], spacing: { after: 160 } }),
  new Paragraph({ children: [T("ภาพรวมเวลา · Timing at a glance", { bold: true, color: NAVY, size: 32 })], spacing: { after: 60 }, keepNext: true }),
  genericTable(ovTable.rows, [2600, 1300, 1300, CW - 5200], [26, 26, 26, 25]),
  spacer(60),
  ...ovParas.map((p) => new Paragraph({ children: styled(p.runs, { size: 23, color: "374151", boldColor: NAVY }), spacing: { after: 80, line: 290 } })),
  new Paragraph({ children: [
    T("วิธีอ่าน · How to read   ", { bold: true, color: TEAL, size: 26 }),
    T(" คลิก ▸ ", { bold: true, color: "FFFFFF", size: 24, shading: { type: ShadingType.CLEAR, fill: TEAL, color: "auto" } }), T("  = กดคลิกตรงนี้ / click here      ", { size: 26, color: GRAY }),
    T(" ‖ หยุด ", { bold: true, italics: true, color: "B45309", size: 24 }), T("  = หยุดหายใจหนึ่งจังหวะ / pause one breath      ", { size: 26, color: GRAY }),
    T("ตัวหนาสีเขียว", { bold: true, color: TEAL, size: 26 }), T("  = ป้ายคำส่งต่อบนจอ / hand-off chip", { size: 26, color: GRAY }),
  ], spacing: { before: 60 }, shading: { type: ShadingType.CLEAR, fill: MINT, color: "auto" }, indent: { left: 120, right: 120 } }),
];

// ---- Script pages: one slide per page ----------------------------------------------------
function scriptPages(section, version, sizes, keepTogether, newPagePerSlide) {
  const out = [];
  const intro = section.items.filter((i, k) => i.type === "p" && k < section.items.findIndex((x) => x.type === "h3"));
  let first = true, pendingNote = null, h3 = null;
  for (const it of section.items) {
    if (it.type === "h3") { h3 = it.h; continue; }
    if (it.type === "p" && !h3) continue; // section intro, handled below
    if (it.type === "p" && h3) { pendingNote = it.runs; continue; }
    if (it.type === "table" && h3) {
      if (!first && newPagePerSlide) out.push(pageBreak());
      if (first) {
        out.push(...sectionTitle(version === "FULL" ? "สคริปต์ฉบับเต็ม · Full script" : "ฉบับนำเสนอไว · Fast version", clean(intro.map((p) => textOf(p.runs)).slice(-1)[0] || "")));
      } else if (!newPagePerSlide) out.push(spacer(200));
      const h = clean(h3);
      const time = (h.match(/(\d+:\d+)\)?\s*$/) || [])[1] || "";
      const label = h.replace(/\s*\(\d+:\d+\)\s*$/, "").replace(/\s*·\s*\d+:\d+\s*$/, "").toUpperCase();
      out.push(slideTable(it.rows, sizes, keepTogether, { version: version, label, time }, pendingNote));
      first = false; pendingNote = null; h3 = null;
    }
  }
  // trailing note (e.g. "If you have only two minutes…")
  const tail = section.items[section.items.length - 1];
  if (tail.type === "p") out.push(spacer(140), new Paragraph({ children: styled(tail.runs, { size: 28, color: NAVY, bold: true }), shading: { type: ShadingType.CLEAR, fill: MINT, color: "auto" }, indent: { left: 120, right: 120 } }));
  return out;
}

// ---- Hand-off + Q&A + checklist --------------------------------------------------------
const handTable = hand.items.find((i) => i.type === "table");
const handParas = hand.items.filter((i) => i.type === "p");
const qaTable = qa.items.find((i) => i.type === "table");
const qaParas = qa.items.filter((i) => i.type === "p");
const handoff = [
  ...sectionTitle("คำส่งต่อระหว่างสไลด์ · Hand-off keywords", textOf(handParas[1].runs)),
  genericTable(handTable.rows, [1300, 2900, 2900, CW - 7100], [30, 28, 28, 28]),
  spacer(120),
  bodyPara(handParas[handParas.length - 1].runs, { size: 28, color: "374151" }),
];
const qaPart = [
  ...sectionTitle("คำถามที่คาดว่าจะเจอ · Anticipated Q&A", textOf(qaParas[1].runs)),
  bodyPara(qaParas[0].runs, { size: 26, color: GRAY }),
  genericTable(qaTable.rows, [3000, 6069, 6069], [27, 26, 27]),
];
const checklist = [...sectionTitle("เช็กลิสต์ก่อนนำเสนอ · Delivery checklist", textOf(chk.items[1].runs))];
for (const it of chk.items.slice(2)) {
  if (it.type === "h3") checklist.push(new Paragraph({ children: [T(clean(it.h), { bold: true, color: TEAL, size: 32 })], spacing: { before: 160, after: 80 }, keepNext: true }));
  else if (it.type === "list") for (const li of it.items) {
    const runs = li.map((r) => ({ ...r, t: r.t.replace(/^\s*\[\s*\]\s*/, "").replace(/^☐\s*/, "") }));
    checklist.push(new Paragraph({ children: [T("☐  ", { size: 30, color: TEAL }), ...styled(runs, { size: 26, color: "1F2937", boldColor: NAVY })], spacing: { after: 60, line: 300 }, indent: { left: 480, hanging: 480 }, keepLines: true }));
  } else if (it.type === "p") qaPart.push(spacer(160), new Paragraph({ children: [T("แหล่งอ้างอิง · Sources   ", { bold: true, color: TEAL, size: 24 }), ...styled(it.runs, { size: 24, color: GRAY })] }));
}

// ---- Assemble ---------------------------------------------------------------------------
const header = new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: CW }],
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 4 } },
  children: [T("PRESENTATION SCRIPT", { bold: true, color: NAVY, size: 20, cs: 30 }), T("\tAI and Work Performance  ·  ENG 501  ·  Chayanun Sungsa-ard", { color: GRAY, size: 20 })] })] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
  T("หน้า ", { size: 22, color: GRAY }), new TextRun({ children: [PageNumber.CURRENT], font: F, size: 22, color: GRAY, bold: true }), T(" / ", { size: 22, color: GRAY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: F, size: 22, color: GRAY })] })] });
const S = (children) => ({ properties: { page: PAGE }, headers: { default: header }, footers: { default: footer }, children });

const FULL_SIZES = { screen: 24, th: 32, en: 27 };   // 12 / 16 / 13.5 pt
const FAST_SIZES = { screen: 24, th: 34, en: 29 };
const doc = new Document({
  creator: "Chayanun Sungsa-ard", title: "Presentation Script — AI and Work Performance (ENG 501)",
  styles: { default: { document: { run: { font: F, size: 30 } } }, paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: F, size: 52, bold: true, color: NAVY }, paragraph: { outlineLevel: 0 } },
  ] },
  sections: [
    S(cover),
    S(scriptPages(full, "FULL", FULL_SIZES, false, true)),
    S(scriptPages(fast, "FAST", FAST_SIZES, false, true)),
    S(handoff),
    S(qaPart),
    S(checklist),
  ],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(__dirname + "/out.docx", b); console.log("wrote out.docx"); });
