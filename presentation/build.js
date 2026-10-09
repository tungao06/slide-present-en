// ---------------------------------------------------------------------------
// STYLING + LAYOUT (minimal version). Slide text lives in content.js; drawings in mascot.js.
// Run:  node build.js            (writes AI_Work_Performance_ENG501.pptx)
// ---------------------------------------------------------------------------
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Fi = require("react-icons/fi");
const sharp = require("sharp");
const { EN, TH, PRESENTER } = require("./content");
const art = require("./mascot");

const APPLY_THEME = process.env.APPLY_THEME_JS; // path to pptx skill's apply_theme.js (optional)
const OUT = path.join(__dirname, "AI_Work_Performance_ENG501.pptx");

// ---- Fonts & theme ------------------------------------------------------------
const FONT_EN = "Poppins"; // geometric sans for English slides (Google Fonts, free)
const FONT_TH = "Prompt";  // Thai + Latin geometric sans for Thai slides (Google Fonts, free)
let FONT = FONT_EN;        // switched to FONT_TH before the Thai slides are built
const THEME = {
  name: "AI Navy Teal Minimal",
  headFontFace: FONT_EN,
  bodyFontFace: FONT_EN,
  colors: {
    dk1: "1B2A4A", lt1: "FFFFFF", dk2: "6B7280", lt2: "F3F5F8",
    accent1: "2E8B86", accent2: "1B2A4A", accent3: "A3ADBB", accent4: "BFE6E0", accent5: "E3E8EE", accent6: "2A3D63",
    hlink: "2E8B86", folHlink: "6B7280",
  },
};
const HEX = THEME.colors;
const ART = { navy: "#1B2A4A", navyDeep: "#0E3340", teal: "#2E8B86", mint: "#BFE6E0", body: "#F3F5F8", skin: "#F1CFAF", shirt: "#2E8B86", gray: "#6B7280" };
const ART_DARK = { ...ART, navy: "#C9D6E2", body: "#FFFFFF", screen: "#1B2A4A" }; // mascot variant for dark backgrounds
let BUMP = 0; // +1pt on small text for Thai slides
const fz = (n) => n + (n <= 11.5 ? BUMP : 0);

// ---- Icons / art -------------------------------------------------------------
const cache = new Map();
async function icon(name, hex) {
  const key = "i" + name + hex;
  if (!cache.has(key)) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Fi[name], { size: 256, strokeWidth: 1.6 })).replace(/currentColor/g, "#" + hex);
    cache.set(key, "image/png;base64," + (await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer()).toString("base64"));
  }
  return cache.get(key);
}
async function drawing(key, svg, width) { if (!cache.has(key)) cache.set(key, await art.png(svg, width)); return cache.get(key); }
const robot = (pose, variant) => drawing("robot" + pose + (variant || ""), art.robotSvg(pose, variant === "dark" ? ART_DARK : variant === "teal" ? ART_TEAL : ART), 700);
const ART_TEAL = { ...ART, body: "#FFFFFF", shirt: "#1B2A4A", teal: "#BFE6E0" }; // characters on the teal band
const human = (pose, teal) => drawing("human" + pose + (teal ? "T" : ""), art.humanSvg(pose, teal ? ART_TEAL : ART), 600);

// ---- Geometry (LAYOUT_16x9 = 10in x 5.625in) ------------------------------
const W = 10, M = 0.55;
const FOOT_Y = 5.22, REF_Y = 4.9;

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = PRESENTER.en.name;
  pres.title = "Artificial Intelligence and Work Performance";
  pres.subject = "ENG 501 English for Master's Degree";
  const C = pres.SchemeColor;
  const BG_DARK = await drawing("bgdark", art.darkBgSvg(ART), 1920);

  // ---- Layouts -------------------------------------------------------------
  for (const lang of ["EN", "TH"]) {
    const LF = lang === "EN" ? FONT_EN : FONT_TH;
    pres.defineSlideMaster({
      title: "TITLE_DARK_" + lang,
      background: { data: BG_DARK },
      objects: [
        { placeholder: { options: { name: "title", type: "title", x: M, y: 0.3, w: 6.9, h: 1.25, fontSize: 32, bold: true, color: C.background1, align: "left", margin: 0, valign: "bottom", fontFace: LF }, text: "" } },
        { placeholder: { options: { name: "body", type: "body", x: M, y: 1.6, w: 6.9, h: 0.4, fontSize: 14, color: C.accent4, align: "left", margin: 0, valign: "top", fontFace: LF }, text: "" } },
      ],
      slideNumber: { x: W - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.3, fontSize: 9, color: HEX.accent3, align: "right", fontFace: LF },
    });
    pres.defineSlideMaster({
      title: "CONTENT_" + lang,
      background: { color: HEX.lt1 },
      objects: [
        { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.3, w: 6.5, h: 0.26, fontSize: 10, bold: true, color: C.accent1, align: "left", margin: 0, valign: "middle", charSpacing: 1.5, fontFace: LF }, text: "" } },
        { placeholder: { options: { name: "title", type: "title", x: M, y: 0.56, w: W - 2 * M, h: 0.8, fontSize: 26, bold: true, color: C.text1, align: "left", margin: 0, valign: "middle", fit: "shrink", fontFace: LF }, text: "" } },
        { text: { text: (lang === "EN" ? EN : TH).footer, options: { x: M, y: FOOT_Y, w: 6, h: 0.3, fontSize: 8.5, color: HEX.accent3, margin: 0, valign: "middle", fontFace: LF } } },
      ],
      slideNumber: { x: W - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.3, fontSize: 8.5, color: HEX.accent3, align: "right", fontFace: LF },
    });
  }

  // ---- Helpers -------------------------------------------------------------
  const tagStyle = { finding: { fill: HEX.accent4, color: HEX.dk1 }, interp: { fill: "FFFFFF", color: HEX.dk1 }, concept: { fill: HEX.lt2, color: HEX.dk2 } };
  function tag(slide, kind, text, x, y) {
    const s = tagStyle[kind], w = 1.25;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.22, fill: { color: s.fill }, line: { color: s.fill, width: 0 }, rectRadius: 0.11, objectName: "tag " + kind });
    slide.addText(text, { x, y, w, h: 0.22, fontSize: fz(7.5), bold: true, color: s.color, align: "center", valign: "middle", margin: 0, isTextBox: true, fontFace: FONT, charSpacing: 1.5, objectName: "tag text" });
  }
  function card(slide, x, y, w, h, o = {}) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: o.fill || HEX.lt2 }, line: { color: o.line || o.fill || HEX.lt2, width: o.line ? 1 : 0 }, rectRadius: 0.12, objectName: o.name || "card" });
  }
  function progress(slide, T, step) {
    const n = T.steps.length, dw = 0.11, gap = 0.09, x0 = W - M - (n * dw + (n - 1) * gap);
    for (let i = 0; i < n; i++) {
      const col = i + 1 === step ? HEX.accent1 : i + 1 < step ? HEX.accent4 : HEX.accent5;
      slide.addShape(pres.shapes.OVAL, { x: x0 + i * (dw + gap), y: 0.375, w: dw, h: dw, fill: { color: col }, line: { color: col, width: 0 }, objectName: "progress dot " + (i + 1) });
    }
    slide.addText(`${step} / ${n}`, { x: x0 - 0.8, y: 0.3, w: 0.7, h: 0.26, fontSize: fz(8), color: HEX.accent3, align: "right", margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "progress label" });
  }
  async function bottomRow(slide, T, ref, bridge) {
    slide.addText(ref, { x: M, y: REF_Y, w: 5.4, h: 0.3, fontSize: 7, color: HEX.accent3, margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "reference" });
    if (bridge) {
      const bw = 3.3, bx = W - M - bw;
      slide.addText([{ text: T.nextLabel + "  ", options: { bold: true, color: HEX.accent1 } }, { text: bridge, options: { color: HEX.dk1 } }],
        { x: bx, y: REF_Y - 0.04, w: bw - 0.3, h: 0.34, fontSize: fz(8.5), align: "right", margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "bridge text" });
      slide.addImage({ data: await icon("FiArrowRight", HEX.accent1), x: W - M - 0.22, y: REF_Y + 0.02, w: 0.22, h: 0.22, objectName: "icon FiArrowRight" });
    }
  }
  async function iconRow(slide, items, x, y, w, rowH) {
    for (let i = 0; i < items.length; i++) {
      const yy = y + i * rowH;
      slide.addShape(pres.shapes.OVAL, { x, y: yy, w: 0.4, h: 0.4, fill: { color: HEX.lt2 }, line: { color: HEX.lt2, width: 0 }, objectName: "icon circle" });
      slide.addImage({ data: await icon(items[i].icon, HEX.accent1), x: x + 0.09, y: yy + 0.09, w: 0.22, h: 0.22, objectName: "icon " + items[i].icon });
      slide.addText([
        { text: items[i].head, options: { bold: true, fontSize: fz(11), color: C.text1, breakLine: true } },
        { text: items[i].body, options: { fontSize: fz(10), color: C.text2 } },
      ], { x: x + 0.55, y: yy - 0.05, w: w - 0.55, h: rowH - 0.05, margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "fact " + items[i].head });
    }
  }
  function rule(slide, x, y, w) {
    slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: HEX.accent5, width: 0.75 }, objectName: "divider" });
  }

  // ---- Slide 1 / 6: hero ----------------------------------------------------------
  async function slideIntro(T, lang, section) {
    const P = PRESENTER[lang];
    const s = pres.addSlide({ masterName: "TITLE_DARK_" + lang.toUpperCase(), sectionTitle: section });
    s.addText(T.s1.title, { placeholder: "title" });
    s.addText(T.s1.subtitle, { placeholder: "body" });
    s.addImage({ data: await robot("wave", "dark"), x: 7.5, y: 0.35, w: 2.1, h: 1.82, objectName: "mascot waving" });
    s.addText(T.s1.question, { x: M, y: 2.12, w: W - 2 * M, h: 0.4, fontSize: fz(13), bold: true, color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "central question" });
    const cw = (W - 2 * M - 0.3) / 2;
    T.s1.articles.forEach((a, i) => {
      const x = M + i * (cw + 0.3), y = 2.66, h = 1.38;
      card(s, x, y, cw, h, { fill: HEX.accent6, name: "article card " + (i + 1) });
      s.addText(a.label, { x: x + 0.22, y: y + 0.12, w: cw - 0.44, h: 0.22, fontSize: fz(8.5), bold: true, color: HEX.accent4, charSpacing: 1.5, margin: 0, isTextBox: true, fontFace: FONT, objectName: "article label" });
      s.addText(a.title, { x: x + 0.22, y: y + 0.36, w: cw - 0.44, h: 0.66, fontSize: fz(9.5), bold: true, color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "article title" });
      s.addText(a.meta, { x: x + 0.22, y: y + 1.02, w: cw - 0.44, h: 0.32, fontSize: fz(7.5), color: HEX.accent4, margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "article meta" });
    });
    s.addText(T.s1.roadmapHead, { x: M, y: 4.2, w: 1.15, h: 0.28, fontSize: fz(8.5), bold: true, color: HEX.accent4, margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "roadmap head" });
    const chipW = (W - 2 * M - 1.25 - 0.4) / 5;
    for (let i = 0; i < T.steps.length; i++) {
      const x = M + 1.25 + i * (chipW + 0.1);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.2, w: chipW, h: 0.28, fill: { color: i === 0 ? HEX.accent1 : HEX.accent6 }, line: { color: i === 0 ? HEX.accent1 : HEX.accent6, width: 0 }, rectRadius: 0.14, objectName: "roadmap chip " + (i + 1) });
      s.addText(`${i + 1}  ${T.steps[i]}`, { x, y: 4.2, w: chipW, h: 0.28, fontSize: 7.5, bold: true, color: "FFFFFF", align: "center", margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "roadmap chip text" });
    }
    s.addText([
      { text: P.name, options: { bold: true, color: "FFFFFF", fontSize: fz(11), breakLine: true } },
      { text: `${P.id}  ·  ${P.degree}  ·  ${P.course}`, options: { color: HEX.accent4, fontSize: fz(9) } },
    ], { x: M, y: 4.66, w: W - 2 * M, h: 0.5, margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "presenter" });
    s.addNotes(T.s1.notes);
  }

  // ---- Slide 2 / 7: method -----------------------------------------------------
  async function slideMethod(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s2.kicker, { placeholder: "kicker" });
    s.addText(T.s2.title, { placeholder: "title" });
    progress(s, T, 2);
    const leftW = 4.3;
    await iconRow(s, T.s2.facts, M, 1.62, leftW, 0.64);
    s.addText(T.s2.condHead, { x: M, y: 3.58, w: leftW, h: 0.26, fontSize: fz(10.5), bold: true, color: C.text1, margin: 0, isTextBox: true, fontFace: FONT, objectName: "conditions head" });
    const bw = (leftW - 0.3) / 3;
    for (let i = 0; i < T.s2.conditions.length; i++) {
      const x = M + i * (bw + 0.15);
      card(s, x, 3.9, bw, 0.82, { fill: i === 2 ? HEX.dk1 : HEX.lt2, name: "condition " + (i + 1) });
      s.addText(String(i + 1), { x: x + 0.12, y: 3.95, w: 0.3, h: 0.26, fontSize: 12, bold: true, color: i === 2 ? HEX.accent4 : HEX.accent1, margin: 0, isTextBox: true, fontFace: FONT, objectName: "condition number" });
      s.addText(T.s2.conditions[i], { x: x + 0.12, y: 4.2, w: bw - 0.24, h: 0.48, fontSize: fz(8.5), color: i === 2 ? "FFFFFF" : C.text1, margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "condition text" });
    }
    const rx = M + leftW + 0.5, rw = W - M - rx;
    rule(s, rx - 0.25, 1.62, 0); // vertical divider
    s.addShape(pres.shapes.LINE, { x: rx - 0.25, y: 1.62, w: 0, h: 3.1, line: { color: HEX.accent5, width: 0.75 }, objectName: "column divider" });
    tag(s, "concept", T.tags.concept, rx, 1.62);
    s.addText(T.s2.conceptHead, { x: rx, y: 1.92, w: rw - 1.2, h: 0.3, fontSize: fz(11.5), bold: true, color: C.text1, margin: 0, isTextBox: true, fontFace: FONT, objectName: "concept head" });
    s.addText(T.s2.conceptBody, { x: rx, y: 2.24, w: rw - 1.25, h: 0.8, fontSize: fz(9.5), color: C.text2, margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "concept body" });
    s.addImage({ data: await robot("search"), x: rx + rw - 1.15, y: 1.62, w: 1.1, h: 0.95, objectName: "mascot searching" });
    const dx = rx, dy = 3.2, dw = rw, dh = 1.5;
    s.addImage({ data: await drawing("frontier", art.frontierSvg(ART, { inside: "", outside: "" }), 1280), x: dx, y: dy, w: dw, h: dh, objectName: "frontier illustration" });
    s.addText(T.s2.diagram.outside, { x: dx + 0.12, y: dy + 0.08, w: dw - 0.24, h: 0.2, fontSize: fz(7.5), bold: true, color: C.text2, align: "right", margin: 0, isTextBox: true, fontFace: FONT, objectName: "outside label" });
    s.addText(T.s2.diagram.inside, { x: dx + 0.12, y: dy + dh - 0.3, w: dw - 0.24, h: 0.2, fontSize: fz(7.5), bold: true, color: HEX.accent1, margin: 0, isTextBox: true, fontFace: FONT, objectName: "inside label" });
    await bottomRow(s, T, T.s2.ref, T.s2.bridge);
    s.addNotes(T.s2.notes);
  }

  // ---- Slide 3 / 8: findings ---------------------------------------------------
  async function slideFindings(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s3.kicker, { placeholder: "kicker" });
    s.addText(T.s3.title, { placeholder: "title" });
    progress(s, T, 3);
    const chartW = 5.2;
    tag(s, "finding", T.tags.finding, M, 1.5);
    s.addChart(pres.charts.BAR, [{ name: "Change (%)", labels: T.s3.chart.labels, values: T.s3.chart.values }], {
      x: M, y: 1.76, w: chartW, h: 2.3, barDir: "bar", barGapWidthPct: 40,
      chartColors: [HEX.accent1, HEX.accent1, HEX.accent1, HEX.dk1, HEX.dk1],
      showTitle: true, title: T.s3.chartTitle, titleFontSize: 9, titleColor: HEX.dk1, titleFontFace: FONT,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '+0.0"%"', dataLabelFontSize: 9, dataLabelColor: HEX.dk1, dataLabelFontFace: FONT,
      catAxisLabelFontSize: 8, catAxisLabelColor: HEX.dk2, catAxisLabelFontFace: FONT, catAxisOrientation: "maxMin",
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 55,
      showLegend: false, objectName: "findings chart",
    });
    s.addText(T.s3.chartNote, { x: M, y: 4.08, w: chartW, h: 0.36, fontSize: fz(7.5), color: HEX.accent3, margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "chart note" });
    const rx = M + chartW + 0.4, rw = W - M - rx;
    card(s, rx, 1.5, rw, 2.0, { fill: HEX.dk1, name: "outside callout" });
    s.addText(T.s3.outsideHead, { x: rx + 0.25, y: 1.64, w: rw - 0.5, h: 0.24, fontSize: fz(9), bold: true, color: HEX.accent4, charSpacing: 1, margin: 0, isTextBox: true, fontFace: FONT, objectName: "outside head" });
    s.addText(T.s3.outsideStat, { x: rx + 0.25, y: 1.88, w: 1.6, h: 0.56, fontSize: 44, bold: true, color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "outside stat" });
    s.addText(T.s3.outsideUnit, { x: rx + 0.25, y: 2.44, w: rw - 1.4, h: 0.22, fontSize: fz(8.5), color: HEX.accent4, margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "outside unit" });
    s.addImage({ data: await robot("confused", "dark"), x: rx + rw - 1.25, y: 1.74, w: 1.1, h: 0.95, objectName: "mascot confused" });
    s.addText(T.s3.outsideBody, { x: rx + 0.25, y: 2.72, w: rw - 0.5, h: 0.7, fontSize: fz(9), color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "outside body" });
    s.addText(T.s3.unitNote, { x: rx, y: 3.56, w: rw, h: 0.34, fontSize: fz(8), color: HEX.dk2, margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "unit note" });
    rule(s, rx, 4.0, rw);
    s.addText(T.s3.approachHead, { x: rx, y: 4.06, w: rw, h: 0.22, fontSize: fz(9.5), bold: true, color: C.text1, margin: 0, isTextBox: true, fontFace: FONT, objectName: "approach head" });
    const glyphs = [await drawing("centaur", art.centaurSvg(ART), 480), await drawing("cyborg", art.cyborgSvg(ART), 480)];
    for (let i = 0; i < T.s3.approaches.length; i++) {
      const a = T.s3.approaches[i], y = 4.3 + i * 0.26;
      s.addImage({ data: glyphs[i], x: rx, y: y + 0.02, w: 0.36, h: 0.24, objectName: "glyph " + a.head });
      s.addText([{ text: a.head + "  ", options: { bold: true, fontSize: fz(9), color: C.text1 } }, { text: a.body, options: { fontSize: fz(8.5), color: C.text2 } }],
        { x: rx + 0.46, y, w: rw - 0.46, h: 0.28, margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "approach text" });
    }
    await bottomRow(s, T, T.s3.ref, T.s3.bridge);
    s.addNotes(T.s3.notes);
  }

  // ---- Slide 4 / 9: entrepreneurs ----------------------------------------------
  async function slideEntrepreneurs(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s4.kicker, { placeholder: "kicker" });
    s.addText(T.s4.title, { placeholder: "title" });
    progress(s, T, 4);
    const leftW = 4.1;
    await iconRow(s, T.s4.facts, M, 1.62, leftW, 0.64);
    card(s, M, 3.6, leftW, 1.2, { fill: HEX.dk1, name: "main effect card" });
    tag(s, "finding", T.tags.finding, M + 0.22, 3.76);
    s.addText(T.s4.mainHead, { x: M + 0.22, y: 4.0, w: leftW - 1.4, h: 0.22, fontSize: fz(9), bold: true, color: HEX.accent4, charSpacing: 1, margin: 0, isTextBox: true, fontFace: FONT, objectName: "main head" });
    s.addText(T.s4.mainBody, { x: M + 0.22, y: 4.2, w: leftW - 1.4, h: 0.56, fontSize: fz(9), color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "main body" });
    s.addImage({ data: await robot("shop", "dark"), x: M + leftW - 1.2, y: 3.78, w: 1.05, h: 0.9, objectName: "mascot with phone" });
    const rx = M + leftW + 0.5, rw = W - M - rx;
    s.addShape(pres.shapes.LINE, { x: rx - 0.25, y: 1.62, w: 0, h: 3.1, line: { color: HEX.accent5, width: 0.75 }, objectName: "column divider" });
    tag(s, "finding", T.tags.finding, rx, 1.62);
    s.addText(T.s4.subHead, { x: rx, y: 1.92, w: rw - 1.2, h: 0.28, fontSize: fz(11.5), bold: true, color: C.text1, margin: 0, isTextBox: true, fontFace: FONT, objectName: "subgroup head" });
    s.addImage({ data: await human("phone"), x: rx + rw - 1.05, y: 1.56, w: 1.0, h: 1.05, objectName: "entrepreneur with phone" });
    const chartW = rw - 1.2, zeroX = rx + chartW * 0.5, scale = (chartW * 0.44) / 15;
    const barY0 = 2.56, barH = 0.24, gap = 0.6;
    s.addShape(pres.shapes.LINE, { x: zeroX, y: barY0 - 0.06, w: 0, h: gap * 2 - 0.1, line: { color: HEX.accent3, width: 0.75, dashType: "dash" }, objectName: "zero line" });
    T.s4.bars.forEach((b, i) => {
      const y = barY0 + i * gap, len = Math.abs(b.value) * scale, neg = b.value < 0;
      s.addText([{ text: b.label + "  ", options: { bold: true, fontSize: fz(9), color: C.text1 } }, { text: b.text, options: { fontSize: fz(9), color: neg ? HEX.dk2 : HEX.accent1, bold: true } }],
        { x: rx, y: y - 0.27, w: rw, h: 0.24, margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "bar label " + i });
      s.addShape(pres.shapes.RECTANGLE, { x: neg ? zeroX - len : zeroX, y, w: len, h: barH, fill: { color: neg ? HEX.accent3 : HEX.accent1 }, line: { color: neg ? HEX.accent3 : HEX.accent1, width: 0 }, objectName: "bar " + i });
    });
    s.addText(T.s4.barNote, { x: rx, y: barY0 + gap * 2 - 0.22, w: rw, h: 0.18, fontSize: fz(7), color: HEX.accent3, align: "right", margin: 0, isTextBox: true, fontFace: FONT, objectName: "bar note" });
    rule(s, rx, 3.68, rw);
    s.addImage({ data: await icon("FiMessageCircle", HEX.accent1), x: rx, y: 3.8, w: 0.24, h: 0.24, objectName: "icon FiMessageCircle" });
    s.addText(T.s4.mechanism, { x: rx + 0.36, y: 3.74, w: rw - 0.36, h: 0.42, fontSize: fz(8.5), color: C.text1, margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "mechanism" });
    s.addImage({ data: await icon("FiAlertTriangle", HEX.accent1), x: rx, y: 4.34, w: 0.24, h: 0.24, objectName: "icon FiAlertTriangle" });
    s.addText(T.s4.caution, { x: rx + 0.36, y: 4.28, w: rw - 0.36, h: 0.42, fontSize: fz(8.5), color: C.text2, margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "caution" });
    await bottomRow(s, T, T.s4.ref, T.s4.bridge);
    s.addNotes(T.s4.notes);
  }

  // ---- Slide 5 / 10: discussion ---------------------------------------------------
  async function slideDiscussion(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s5.kicker, { placeholder: "kicker" });
    s.addText(T.s5.title, { placeholder: "title" });
    progress(s, T, 5);
    tag(s, "finding", T.tags.finding, M, 1.5);
    const head = T.s5.tableHead.map((h) => ({ text: h, options: { bold: true, color: HEX.dk1, fill: { color: "FFFFFF" }, fontSize: fz(9.5), valign: "middle", border: [{ type: "none" }, { type: "none" }, { type: "solid", color: HEX.dk1, pt: 1 }, { type: "none" }] } }));
    const rows = T.s5.rows.map((r) => r.map((c, ci) => ({ text: c, options: { fontSize: fz(9.5), bold: ci === 0, color: ci === 0 ? HEX.dk1 : HEX.dk2, fill: { color: "FFFFFF" }, valign: "middle", border: [{ type: "none" }, { type: "none" }, { type: "solid", color: HEX.accent5, pt: 0.75 }, { type: "none" }] } })));
    s.addTable([head, ...rows], { x: M, y: 1.78, w: W - 2 * M, colW: [1.6, 3.65, 3.65], rowH: [0.36, 0.44, 0.52, 0.52], margin: [0.06, 0.1, 0.06, 0.02], fontFace: FONT, objectName: "comparison table" });
    const cy = 3.78, ch = 1.02;
    card(s, M, cy, W - 2 * M, ch, { fill: HEX.accent1, name: "conclusion card" });
    tag(s, "interp", T.tags.interp, M + 0.25, cy + 0.14);
    s.addText(T.s5.conclusion, { x: M + 0.25, y: cy + 0.42, w: 4.55, h: 0.52, fontSize: fz(9.5), bold: true, color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, fontFace: FONT, objectName: "conclusion" });
    const tx = M + 4.9, tw = 2.3;
    for (let i = 0; i < T.s5.takeaways.length; i++) {
      const y = cy + 0.14 + i * 0.27;
      s.addImage({ data: await icon("FiCheck", "FFFFFF"), x: tx, y: y + 0.04, w: 0.18, h: 0.18, objectName: "icon check" });
      s.addText(T.s5.takeaways[i], { x: tx + 0.28, y, w: tw - 0.28, h: 0.26, fontSize: fz(8.5), color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, fontFace: FONT, objectName: "takeaway " + (i + 1) });
    }
    s.addImage({ data: await human("shake", true), x: W - M - 1.72, y: cy + 0.1, w: 0.82, h: 0.86, objectName: "human handshake" });
    s.addImage({ data: await robot("shake", "teal"), x: W - M - 0.98, y: cy + 0.1, w: 0.9, h: 0.86, objectName: "mascot handshake" });
    await bottomRow(s, T, T.s5.refs.join("   ·   "), T.s5.closing);
    s.addNotes(T.s5.notes);
  }

  // ---- Build 10 slides -------------------------------------------------------
  const EN_SEC = "English (Slides 1-5)", TH_SEC = "ภาษาไทย (Slides 6-10)";
  pres.addSection({ title: EN_SEC });
  await slideIntro(EN, "en", EN_SEC); await slideMethod(EN, "EN", EN_SEC); await slideFindings(EN, "EN", EN_SEC); await slideEntrepreneurs(EN, "EN", EN_SEC); await slideDiscussion(EN, "EN", EN_SEC);
  BUMP = 1; FONT = FONT_TH;
  pres.addSection({ title: TH_SEC });
  await slideIntro(TH, "th", TH_SEC); await slideMethod(TH, "TH", TH_SEC); await slideFindings(TH, "TH", TH_SEC); await slideEntrepreneurs(TH, "TH", TH_SEC); await slideDiscussion(TH, "TH", TH_SEC);

  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) { const { applyTheme } = require(APPLY_THEME); await applyTheme(OUT, THEME); }
  console.log("wrote", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
