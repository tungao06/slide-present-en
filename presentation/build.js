// ---------------------------------------------------------------------------
// STYLING + LAYOUT. Slide text lives in content.js.
// Run:  node build.js            (writes AI_Work_Performance_ENG501.pptx)
// ---------------------------------------------------------------------------
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Fi = require("react-icons/fi");
const sharp = require("sharp");
const { EN, TH, PRESENTER } = require("./content");

const APPLY_THEME = process.env.APPLY_THEME_JS; // path to pptx skill's apply_theme.js (optional)
const OUT = path.join(__dirname, "AI_Work_Performance_ENG501.pptx");

// ---- Theme ----------------------------------------------------------------
const FONT = "Tahoma"; // sans-serif, ships with Windows/Mac Office, supports Thai + English
const THEME = {
  name: "Academic Navy Teal",
  headFontFace: FONT,
  bodyFontFace: FONT,
  colors: {
    dk1: "1B2A4A", // dark navy (titles, primary text)
    lt1: "FFFFFF", // white
    dk2: "5A6472", // muted gray text
    lt2: "EEF1F5", // light gray surfaces
    accent1: "2E8B86", // muted teal
    accent2: "1B2A4A",
    accent3: "9AA5B4",
    accent4: "C9D6D4",
    accent5: "D8DEE6",
    accent6: "3C4D6E",
    hlink: "2E8B86",
    folHlink: "5A6472",
  },
};
const HEX = THEME.colors;
let BUMP = 0; // +1pt on small text for Thai slides (Thai glyphs read smaller at equal pt)
const fz = (n) => n + (n <= 11.5 ? BUMP : 0);

// ---- Icons -----------------------------------------------------------------
const iconCache = new Map();
async function icon(name, hex) {
  const key = name + hex;
  if (iconCache.has(key)) return iconCache.get(key);
  let svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Fi[name], { size: 256, strokeWidth: 1.75 }));
  svg = svg.replace(/currentColor/g, "#" + hex);
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  const data = "image/png;base64," + buf.toString("base64");
  iconCache.set(key, data);
  return data;
}

// ---- Geometry (LAYOUT_16x9 = 10in x 5.625in) ------------------------------
const W = 10, H = 5.625, M = 0.5;
const TITLE_Y = 0.38, TITLE_H = 0.78;
const BODY_Y = 1.28;
const FOOT_Y = 5.22;

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = PRESENTER.en.name;
  pres.title = "Artificial Intelligence and Work Performance";
  pres.subject = "ENG 501 English for Master's Degree";
  const C = pres.SchemeColor;

  // ---- Layouts -------------------------------------------------------------
  pres.defineSlideMaster({
    title: "TITLE_DARK",
    background: { color: HEX.dk1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.55, w: W - 2 * M, h: 1.0, fontSize: fz(34), bold: true, color: C.background1, align: "left", margin: 0, valign: "bottom" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 1.6, w: W - 2 * M, h: 0.45, fontSize: fz(15), color: C.accent4, align: "left", margin: 0, valign: "top" }, text: "" } },
    ],
    slideNumber: { x: W - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.3, fontSize: fz(9), color: HEX.accent3, align: "right" },
  });
  for (const lang of ["EN", "TH"]) {
    const footer = (lang === "EN" ? EN : TH).footer;
    pres.defineSlideMaster({
      title: "CONTENT_" + lang,
      background: { color: HEX.lt1 },
      objects: [
        { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.16, w: W - 2 * M, h: 0.26, fontSize: fz(10.5), bold: true, color: C.accent1, align: "left", margin: 0, valign: "middle", charSpacing: 1 }, text: "" } },
        { placeholder: { options: { name: "title", type: "title", x: M, y: TITLE_Y, w: W - 2 * M, h: TITLE_H, fontSize: fz(26), bold: true, color: C.text1, align: "left", margin: 0, valign: "middle", fit: "shrink" }, text: "" } },
        { text: { text: footer, options: { x: M, y: FOOT_Y, w: 6, h: 0.3, fontSize: fz(9), color: HEX.accent3, margin: 0, valign: "middle" } } },
      ],
      slideNumber: { x: W - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.3, fontSize: fz(9), color: HEX.accent3, align: "right" },
    });
  }

  // ---- Helpers -------------------------------------------------------------
  const tagStyle = {
    finding: { fill: HEX.accent1, color: C.background1 },
    interp: { fill: HEX.lt2, color: C.text2 },
    concept: { fill: HEX.lt2, color: C.text2 },
  };
  function tag(slide, kind, text, x, y, w) {
    const s = tagStyle[kind];
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.24, fill: { color: s.fill }, line: { color: s.fill, width: 0 }, rectRadius: 0.12, objectName: "tag " + kind });
    slide.addText(text, { x, y, w, h: 0.24, fontSize: fz(8), bold: true, color: s.color, align: "center", valign: "middle", margin: 0, isTextBox: true, charSpacing: 1, objectName: "tag text" });
  }
  function card(slide, x, y, w, h, opts = {}) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: opts.fill || HEX.lt2 }, line: { color: opts.fill || HEX.lt2, width: 0 }, rectRadius: 0.08, objectName: opts.name || "card" });
  }
  function refLine(slide, text) {
    slide.addText(text, { x: M, y: 4.84, w: W - 2 * M, h: 0.34, fontSize: 7.5, color: C.text2, italic: true, margin: 0, valign: "top", isTextBox: true, objectName: "reference" });
  }
  async function iconRow(slide, items, x, y, w, rowH, hex) {
    for (let i = 0; i < items.length; i++) {
      const yy = y + i * rowH;
      slide.addShape(pres.shapes.OVAL, { x, y: yy, w: 0.42, h: 0.42, fill: { color: HEX.accent1 }, line: { color: HEX.accent1, width: 0 }, objectName: "icon circle" });
      slide.addImage({ data: await icon(items[i].icon, "FFFFFF"), x: x + 0.09, y: yy + 0.09, w: 0.24, h: 0.24, objectName: "icon " + items[i].icon });
      slide.addText([
        { text: items[i].head, options: { bold: true, fontSize: fz(11.5), color: C.text1, breakLine: true } },
        { text: items[i].body, options: { fontSize: fz(10.5), color: C.text2 } },
      ], { x: x + 0.56, y: yy - 0.04, w: w - 0.56, h: rowH - 0.06, margin: 0, valign: "top", isTextBox: true, objectName: "fact " + items[i].head });
    }
  }

  // ---- Slide builders --------------------------------------------------------
  function slideIntro(T, lang, section) {
    const P = PRESENTER[lang];
    const s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: section });
    s.addText(T.s1.title, { placeholder: "title" });
    s.addText(T.s1.subtitle, { placeholder: "body" });
    s.addText(T.s1.question, { x: M, y: 2.12, w: W - 2 * M, h: 0.42, fontSize: fz(13), bold: true, color: HEX.accent4, margin: 0, valign: "middle", isTextBox: true, objectName: "central question" });
    const cw = (W - 2 * M - 0.3) / 2;
    T.s1.articles.forEach((a, i) => {
      const x = M + i * (cw + 0.3), y = 2.7, h = 1.6;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h, fill: { color: HEX.accent6 }, line: { color: HEX.accent6, width: 0 }, rectRadius: 0.08, objectName: "article card " + (i + 1) });
      s.addText(a.label, { x: x + 0.22, y: y + 0.14, w: cw - 0.44, h: 0.24, fontSize: fz(9.5), bold: true, color: HEX.accent1, charSpacing: 1, margin: 0, isTextBox: true, objectName: "article label" });
      s.addText(a.title, { x: x + 0.22, y: y + 0.4, w: cw - 0.44, h: 0.78, fontSize: fz(10.5), bold: true, color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "article title" });
      s.addText(a.meta, { x: x + 0.22, y: y + 1.18, w: cw - 0.44, h: 0.36, fontSize: fz(8.5), color: HEX.accent4, margin: 0, valign: "top", isTextBox: true, objectName: "article meta" });
    });
    s.addText([
      { text: P.name, options: { bold: true, color: "FFFFFF", fontSize: fz(11), breakLine: true } },
      { text: `${P.id}  |  ${P.degree}  |  ${P.course}`, options: { color: HEX.accent4, fontSize: fz(9.5) } },
    ], { x: M, y: 4.5, w: W - 2 * M, h: 0.55, margin: 0, valign: "top", isTextBox: true, objectName: "presenter" });
  }

  async function slideMethod(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s2.kicker, { placeholder: "kicker" });
    s.addText(T.s2.title, { placeholder: "title" });
    s.addText(T.s2.byline, { x: M, y: 1.16, w: W - 2 * M, h: 0.24, fontSize: fz(9), color: C.text2, margin: 0, isTextBox: true, objectName: "byline" });
    const leftW = 4.45;
    await iconRow(s, T.s2.facts, M, 1.56, leftW, 0.62, "FFFFFF");
    // Three conditions as a numbered flow
    s.addText(T.s2.condHead, { x: M, y: 3.48, w: leftW, h: 0.26, fontSize: fz(11.5), bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "conditions head" });
    const bw = (leftW - 0.2) / 3;
    T.s2.conditions.forEach((c, i) => {
      const x = M + i * (bw + 0.1);
      card(s, x, 3.78, bw, 0.98, { fill: i === 0 ? HEX.lt2 : HEX.dk1, name: "condition " + (i + 1) });
      s.addText(String(i + 1), { x: x + 0.1, y: 3.84, w: 0.3, h: 0.3, fontSize: fz(14), bold: true, color: i === 0 ? HEX.accent1 : HEX.accent4, margin: 0, isTextBox: true, objectName: "condition number" });
      s.addText(c, { x: x + 0.1, y: 4.12, w: bw - 0.2, h: 0.6, fontSize: fz(9.5), color: i === 0 ? C.text1 : "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "condition text" });
    });
    // Right: concept card + jagged frontier diagram
    const rx = M + leftW + 0.35, rw = W - M - rx;
    card(s, rx, 1.56, rw, 3.18, { name: "concept card" });
    tag(s, "concept", T.tags.concept, rx + 0.2, 1.72, 1.3);
    s.addText(T.s2.conceptHead, { x: rx + 0.2, y: 2.02, w: rw - 0.4, h: 0.3, fontSize: fz(12), bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "concept head" });
    s.addText(T.s2.conceptBody, { x: rx + 0.2, y: 2.34, w: rw - 0.4, h: 0.95, fontSize: fz(9.5), color: C.text2, margin: 0, valign: "top", isTextBox: true, objectName: "concept body" });
    // diagram: band of tasks, jagged frontier line
    const dx = rx + 0.2, dy = 3.32, dw = rw - 0.4, dh = 1.22;
    s.addShape(pres.shapes.RECTANGLE, { x: dx, y: dy, w: dw, h: dh, fill: { color: "FFFFFF" }, line: { color: HEX.accent5, width: 0.75 }, objectName: "diagram frame" });
    const pts = [0.55, 0.3, 0.7, 0.35, 0.8, 0.45, 0.25, 0.6]; // frontier height fraction per segment
    const segW = dw / (pts.length - 1);
    for (let i = 0; i < pts.length - 1; i++) {
      const y1 = dy + dh * (1 - pts[i]), y2 = dy + dh * (1 - pts[i + 1]);
      const top = Math.min(y1, y2), hh = Math.max(Math.abs(y2 - y1), 0.01);
      s.addShape(pres.shapes.LINE, { x: dx + i * segW, y: top, w: segW, h: hh, line: { color: HEX.accent1, width: 2.25 }, flipV: y2 < y1, objectName: "frontier segment" });
    }
    s.addText(T.s2.diagram.inside, { x: dx + 0.08, y: dy + dh - 0.3, w: dw - 0.16, h: 0.22, fontSize: fz(8), bold: true, color: HEX.accent1, margin: 0, isTextBox: true, objectName: "inside label" });
    s.addText(T.s2.diagram.outside, { x: dx + 0.08, y: dy + 0.06, w: dw - 0.16, h: 0.22, fontSize: fz(8), bold: true, color: C.text2, align: "right", margin: 0, isTextBox: true, objectName: "outside label" });
    s.addText(T.s2.diagram.axis, { x: dx, y: dy + dh + 0.02, w: dw, h: 0.18, fontSize: fz(7.5), italic: true, color: C.text2, align: "center", margin: 0, isTextBox: true, objectName: "axis label" });
    refLine(s, T.s2.ref);
  }

  async function slideFindings(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s3.kicker, { placeholder: "kicker" });
    s.addText(T.s3.title, { placeholder: "title" });
    const chartW = 5.3;
    tag(s, "finding", T.tags.finding, M, 1.24, 2.5);
    s.addChart(pres.charts.BAR, [{ name: "Change (%)", labels: T.s3.chart.labels, values: T.s3.chart.values }], {
      x: M, y: 1.5, w: chartW, h: 2.25,
      barDir: "bar", barGapWidthPct: 45,
      chartColors: [HEX.accent1, HEX.accent1, HEX.accent1, HEX.dk1, HEX.dk1],
      showTitle: true, title: T.s3.chartTitle, titleFontSize: 9.5, titleColor: HEX.dk1, titleFontFace: "+mn-lt",
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '+0.0"%"', dataLabelFontSize: 9, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
      catAxisLabelFontSize: 8.5, catAxisLabelColor: HEX.dk2, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin",
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      valAxisMinVal: 0, valAxisMaxVal: 55,
      showLegend: false, objectName: "findings chart",
    });
    s.addText(T.s3.chartNote, { x: M, y: 3.74, w: chartW, h: 0.4, fontSize: fz(7.5), italic: true, color: C.text2, margin: 0, valign: "top", isTextBox: true, objectName: "chart note" });
    // Right: outside-frontier callout
    const rx = M + chartW + 0.3, rw = W - M - rx;
    card(s, rx, 1.24, rw, 1.9, { fill: HEX.dk1, name: "outside callout" });
    s.addText(T.s3.outsideHead, { x: rx + 0.2, y: 1.34, w: rw - 0.4, h: 0.26, fontSize: fz(10), bold: true, color: HEX.accent4, charSpacing: 1, margin: 0, isTextBox: true, objectName: "outside head" });
    s.addText(T.s3.outsideStat, { x: rx + 0.2, y: 1.56, w: rw - 0.4, h: 0.5, fontSize: 40, bold: true, color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, objectName: "outside stat" });
    s.addText(T.s3.outsideUnit, { x: rx + 0.2, y: 2.06, w: rw - 0.4, h: 0.22, fontSize: fz(9.5), color: HEX.accent4, margin: 0, valign: "middle", isTextBox: true, objectName: "outside unit" });
    s.addText(T.s3.outsideBody, { x: rx + 0.2, y: 2.32, w: rw - 0.4, h: 0.78, fontSize: fz(9), color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "outside body" });
    card(s, rx, 3.24, rw, 0.9, { name: "unit note card" });
    s.addText(T.s3.unitNote, { x: rx + 0.15, y: 3.3, w: rw - 0.3, h: 0.78, fontSize: fz(8), color: C.text2, margin: 0, valign: "middle", isTextBox: true, objectName: "unit note" });
    // Bottom: Centaurs / Cyborgs
    s.addText(T.s3.approachHead, { x: M, y: 4.2, w: 4, h: 0.22, fontSize: fz(10.5), bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "approach head" });
    const aw = (W - 2 * M - 0.3) / 2;
    for (let i = 0; i < T.s3.approaches.length; i++) {
      const a = T.s3.approaches[i], x = M + i * (aw + 0.3), y = 4.44;
      card(s, x, y, aw, 0.42, { name: "approach " + a.head });
      s.addImage({ data: await icon(a.icon, HEX.accent1), x: x + 0.1, y: y + 0.09, w: 0.24, h: 0.24, objectName: "icon " + a.icon });
      s.addText([
        { text: a.head + "  ", options: { bold: true, fontSize: fz(9.5), color: C.text1 } },
        { text: a.body, options: { fontSize: fz(8.5), color: C.text2 } },
      ], { x: x + 0.42, y, w: aw - 0.5, h: 0.42, margin: 0, valign: "middle", isTextBox: true, objectName: "approach text" });
    }
    refLine(s, T.s3.ref);
  }

  async function slideEntrepreneurs(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s4.kicker, { placeholder: "kicker" });
    s.addText(T.s4.title, { placeholder: "title" });
    s.addText(T.s4.byline, { x: M, y: 1.16, w: W - 2 * M, h: 0.24, fontSize: fz(9), color: C.text2, margin: 0, isTextBox: true, objectName: "byline" });
    const leftW = 4.2;
    await iconRow(s, T.s4.facts, M, 1.56, leftW, 0.64, "FFFFFF");
    // main finding card
    card(s, M, 3.5, leftW, 1.28, { fill: HEX.dk1, name: "main effect card" });
    tag(s, "finding", T.tags.finding, M + 0.18, 3.62, 2.5);
    s.addText(T.s4.mainHead, { x: M + 0.18, y: 3.9, w: leftW - 0.36, h: 0.24, fontSize: fz(10.5), bold: true, color: HEX.accent4, margin: 0, isTextBox: true, objectName: "main head" });
    s.addText(T.s4.mainBody, { x: M + 0.18, y: 4.14, w: leftW - 0.36, h: 0.6, fontSize: fz(9.5), color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "main body" });
    // Right: subgroup diverging bars
    const rx = M + leftW + 0.35, rw = W - M - rx;
    card(s, rx, 1.5, rw, 2.1, { name: "subgroup card" });
    tag(s, "finding", T.tags.finding, rx + 0.18, 1.62, 2.5);
    s.addText(T.s4.subHead, { x: rx + 0.18, y: 1.9, w: rw - 0.36, h: 0.26, fontSize: fz(11), bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "subgroup head" });
    const zeroX = rx + rw * 0.5, scale = (rw * 0.4) / 15; // inches per percent (illustrative)
    const barY0 = 2.46, barH = 0.26, gap = 0.6;
    s.addShape(pres.shapes.LINE, { x: zeroX, y: barY0 - 0.06, w: 0, h: gap * 2 - 0.08, line: { color: HEX.accent3, width: 0.75, dashType: "dash" }, objectName: "zero line" });
    T.s4.bars.forEach((b, i) => {
      const y = barY0 + i * gap;
      const len = Math.abs(b.value) * scale;
      const neg = b.value < 0;
      s.addText([
        { text: b.label + "  ", options: { bold: true, fontSize: fz(9), color: C.text1 } },
        { text: b.text, options: { bold: true, fontSize: fz(9), color: neg ? HEX.dk2 : HEX.accent1 } },
      ], { x: rx + 0.18, y: y - 0.26, w: rw - 0.36, h: 0.24, margin: 0, valign: "middle", isTextBox: true, objectName: "bar label " + i });
      s.addShape(pres.shapes.RECTANGLE, { x: neg ? zeroX - len : zeroX, y, w: len, h: barH, fill: { color: neg ? HEX.accent3 : HEX.accent1 }, line: { color: neg ? HEX.accent3 : HEX.accent1, width: 0 }, objectName: "bar " + i });
    });
    s.addText(T.s4.barNote, { x: rx + 0.18, y: barY0 + gap * 2 - 0.1, w: rw - 0.36, h: 0.18, fontSize: fz(7.5), italic: true, color: C.text2, align: "right", margin: 0, isTextBox: true, objectName: "bar note" });
    // mechanism + caution
    card(s, rx, 3.72, rw, 0.5, { name: "mechanism card" });
    s.addText(T.s4.mechanism, { x: rx + 0.15, y: 3.74, w: rw - 0.3, h: 0.46, fontSize: fz(8.5), color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "mechanism" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: 4.32, w: rw, h: 0.46, fill: { color: "FFFFFF" }, line: { color: HEX.accent1, width: 1 }, rectRadius: 0.08, objectName: "caution card" });
    s.addImage({ data: await icon("FiAlertTriangle", HEX.accent1), x: rx + 0.12, y: 4.43, w: 0.24, h: 0.24, objectName: "icon FiAlertTriangle" });
    s.addText(T.s4.caution, { x: rx + 0.44, y: 4.34, w: rw - 0.56, h: 0.42, fontSize: fz(8), color: C.text2, margin: 0, valign: "middle", isTextBox: true, objectName: "caution" });
    refLine(s, T.s4.ref);
  }

  async function slideDiscussion(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s5.kicker, { placeholder: "kicker" });
    s.addText(T.s5.title, { placeholder: "title" });
    tag(s, "finding", T.tags.finding, M, 1.22, 2.5);
    const head = T.s5.tableHead.map((h, i) => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: HEX.dk1 }, fontSize: fz(9.5), align: i === 0 ? "left" : "left", valign: "middle" } }));
    const rows = T.s5.rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { fontSize: fz(9.5), bold: ci === 0, color: ci === 0 ? HEX.dk1 : HEX.dk2, fill: { color: ri % 2 === 0 ? "FFFFFF" : HEX.lt2 }, valign: "middle" } })));
    s.addTable([head, ...rows], { x: M, y: 1.5, w: W - 2 * M, colW: [1.7, 3.65, 3.65], rowH: [0.34, 0.5, 0.56, 0.56], border: { type: "solid", color: HEX.accent5, pt: 0.75 }, margin: 0.08, fontFace: FONT, objectName: "comparison table" });
    // Conclusion band
    const cy = 3.62, ch = 1.14;
    card(s, M, cy, W - 2 * M, ch, { fill: HEX.accent1, name: "conclusion card" });
    tag(s, "interp", T.tags.interp, M + 0.2, cy + 0.12, 1.5);
    s.addText(T.s5.conclusionHead, { x: M + 0.2, y: cy + 0.4, w: 2.2, h: 0.26, fontSize: fz(11), bold: true, color: "FFFFFF", margin: 0, isTextBox: true, objectName: "conclusion head" });
    s.addText(T.s5.conclusion, { x: M + 0.2, y: cy + 0.66, w: 4.3, h: 0.44, fontSize: fz(10), color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "conclusion" });
    const tx = M + 4.8, tw = W - M - tx - 0.2;
    for (let i = 0; i < T.s5.takeaways.length; i++) {
      const y = cy + 0.14 + i * 0.32;
      s.addImage({ data: await icon("FiCheckCircle", "FFFFFF"), x: tx, y: y + 0.04, w: 0.2, h: 0.2, objectName: "icon check" });
      s.addText(T.s5.takeaways[i], { x: tx + 0.3, y, w: tw - 0.3, h: 0.28, fontSize: fz(9.5), color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, objectName: "takeaway " + (i + 1) });
    }
    refLine(s, T.s5.refs.join("   |   "));
  }

  // ---- Build 10 slides -------------------------------------------------------
  pres.addSection({ title: "English (Slides 1-5)" });
  slideIntro(EN, "en", "English (Slides 1-5)");
  await slideMethod(EN, "EN", "English (Slides 1-5)");
  await slideFindings(EN, "EN", "English (Slides 1-5)");
  await slideEntrepreneurs(EN, "EN", "English (Slides 1-5)");
  await slideDiscussion(EN, "EN", "English (Slides 1-5)");
  BUMP = 1;
  pres.addSection({ title: "ภาษาไทย (Slides 6-10)" });
  slideIntro(TH, "th", "ภาษาไทย (Slides 6-10)");
  await slideMethod(TH, "TH", "ภาษาไทย (Slides 6-10)");
  await slideFindings(TH, "TH", "ภาษาไทย (Slides 6-10)");
  await slideEntrepreneurs(TH, "TH", "ภาษาไทย (Slides 6-10)");
  await slideDiscussion(TH, "TH", "ภาษาไทย (Slides 6-10)");

  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) {
    const { applyTheme } = require(APPLY_THEME);
    await applyTheme(OUT, THEME);
  }
  console.log("wrote", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
