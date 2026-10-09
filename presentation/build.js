// ---------------------------------------------------------------------------
// STYLING + LAYOUT. Slide text lives in content.js; drawings in mascot.js.
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

// ---- Theme ----------------------------------------------------------------
const FONT = "Tahoma"; // sans-serif, ships with Windows/Mac Office, supports Thai + English
const THEME = {
  name: "AI Navy Teal",
  headFontFace: FONT,
  bodyFontFace: FONT,
  colors: {
    dk1: "1B2A4A", lt1: "FFFFFF", dk2: "5A6472", lt2: "EEF1F5",
    accent1: "2E8B86", accent2: "1B2A4A", accent3: "9AA5B4", accent4: "BFE6E0", accent5: "D8DEE6", accent6: "2A3D63",
    hlink: "2E8B86", folHlink: "5A6472",
  },
};
const HEX = THEME.colors;
const ART = { navy: "#1B2A4A", navyDeep: "#0E3340", teal: "#2E8B86", mint: "#BFE6E0", body: "#F3F5F8", skin: "#F1CFAF", shirt: "#2E8B86", gray: "#5A6472" };
let BUMP = 0; // +1pt on small text for Thai slides
const fz = (n) => n + (n <= 11.5 ? BUMP : 0);
const shadow = () => ({ type: "outer", color: "1B2A4A", blur: 8, offset: 2, angle: 90, opacity: 0.12 });

// ---- Icons / art -------------------------------------------------------------
const cache = new Map();
async function icon(name, hex) {
  const key = "i" + name + hex;
  if (!cache.has(key)) {
    let svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Fi[name], { size: 256, strokeWidth: 1.75 })).replace(/currentColor/g, "#" + hex);
    cache.set(key, "image/png;base64," + (await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer()).toString("base64"));
  }
  return cache.get(key);
}
async function drawing(key, svg, width) {
  if (!cache.has(key)) cache.set(key, await art.png(svg, width));
  return cache.get(key);
}
const robot = (pose) => drawing("robot" + pose, art.robotSvg(pose, ART), 700);
const human = (pose) => drawing("human" + pose, art.humanSvg(pose, ART), 600);

// ---- Geometry (LAYOUT_16x9 = 10in x 5.625in) ------------------------------
const W = 10, M = 0.5;
const FOOT_Y = 5.22, REF_Y = 4.84;

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = PRESENTER.en.name;
  pres.title = "Artificial Intelligence and Work Performance";
  pres.subject = "ENG 501 English for Master's Degree";
  const C = pres.SchemeColor;
  const BG_DARK = await drawing("bgdark", art.darkBgSvg(ART), 1920);
  const BG_LIGHT = await drawing("bglight", art.lightBgSvg(ART), 1920);

  // ---- Layouts -------------------------------------------------------------
  pres.defineSlideMaster({
    title: "TITLE_DARK",
    background: { data: BG_DARK },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.3, w: 6.9, h: 1.25, fontSize: 32, bold: true, color: C.background1, align: "left", margin: 0, valign: "bottom" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 1.6, w: 6.9, h: 0.4, fontSize: 14, color: C.accent4, align: "left", margin: 0, valign: "top" }, text: "" } },
    ],
    slideNumber: { x: W - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.3, fontSize: 9, color: HEX.accent3, align: "right" },
  });
  for (const lang of ["EN", "TH"]) {
    pres.defineSlideMaster({
      title: "CONTENT_" + lang,
      background: { data: BG_LIGHT },
      objects: [
        { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.18, w: 6.5, h: 0.26, fontSize: 10.5, bold: true, color: C.accent1, align: "left", margin: 0, valign: "middle", charSpacing: 1 }, text: "" } },
        { placeholder: { options: { name: "title", type: "title", x: M, y: 0.4, w: W - 2 * M, h: 0.78, fontSize: 26, bold: true, color: C.text1, align: "left", margin: 0, valign: "middle", fit: "shrink" }, text: "" } },
        { text: { text: (lang === "EN" ? EN : TH).footer, options: { x: M, y: FOOT_Y, w: 6, h: 0.3, fontSize: 9, color: HEX.accent3, margin: 0, valign: "middle" } } },
      ],
      slideNumber: { x: W - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.3, fontSize: 9, color: HEX.accent3, align: "right" },
    });
  }

  // ---- Helpers -------------------------------------------------------------
  const tagStyle = { finding: { fill: HEX.accent1, color: "FFFFFF" }, interp: { fill: HEX.lt2, color: C.text2 }, concept: { fill: HEX.lt2, color: C.text2 } };
  function tag(slide, kind, text, x, y, w) {
    const s = tagStyle[kind];
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.24, fill: { color: s.fill }, line: { color: s.fill, width: 0 }, rectRadius: 0.12, objectName: "tag " + kind });
    slide.addText(text, { x, y, w, h: 0.24, fontSize: fz(8), bold: true, color: s.color, align: "center", valign: "middle", margin: 0, isTextBox: true, charSpacing: 1, objectName: "tag text" });
  }
  function card(slide, x, y, w, h, o = {}) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: o.fill || HEX.lt2 }, line: { color: o.line || o.fill || HEX.lt2, width: o.line ? 1 : 0 }, rectRadius: 0.1, shadow: o.shadow ? shadow() : undefined, objectName: o.name || "card" });
  }
  function progress(slide, T, step) {
    const n = T.steps.length, dw = 0.12, gap = 0.08, x0 = W - M - (n * dw + (n - 1) * gap);
    for (let i = 0; i < n; i++) {
      const on = i + 1 === step, past = i + 1 < step;
      slide.addShape(pres.shapes.OVAL, { x: x0 + i * (dw + gap), y: 0.25, w: dw, h: dw, fill: { color: on ? HEX.accent1 : past ? HEX.accent4 : HEX.accent5 }, line: { color: on ? HEX.accent1 : past ? HEX.accent4 : HEX.accent5, width: 0 }, objectName: "progress dot " + (i + 1) });
    }
    slide.addText(T.steps[step - 1], { x: x0 - 2.3, y: 0.18, w: 2.2, h: 0.26, fontSize: fz(8), color: C.text2, align: "right", margin: 0, valign: "middle", isTextBox: true, objectName: "progress label" });
  }
  async function bottomRow(slide, T, ref, bridge) {
    slide.addText(ref, { x: M, y: REF_Y, w: bridge ? 5.6 : W - 2 * M, h: 0.34, fontSize: 7.5, color: C.text2, italic: true, margin: 0, valign: "top", isTextBox: true, objectName: "reference" });
    if (bridge) {
      const bx = M + 5.8, bw = W - M - bx;
      card(slide, bx, REF_Y - 0.02, bw, 0.36, { fill: HEX.accent4, name: "bridge card" });
      slide.addImage({ data: await icon("FiArrowRight", HEX.dk1), x: bx + bw - 0.3, y: REF_Y + 0.06, w: 0.2, h: 0.2, objectName: "icon FiArrowRight" });
      slide.addText([{ text: T.nextLabel + ":  ", options: { bold: true, color: HEX.accent1 } }, { text: bridge, options: { color: HEX.dk1 } }],
        { x: bx + 0.12, y: REF_Y - 0.02, w: bw - 0.46, h: 0.36, fontSize: fz(8), margin: 0, valign: "middle", isTextBox: true, objectName: "bridge text" });
    }
  }
  async function iconRow(slide, items, x, y, w, rowH) {
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

  // ---- Slide 1 / 6: hero ----------------------------------------------------------
  async function slideIntro(T, lang, section) {
    const P = PRESENTER[lang];
    const s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: section });
    s.addText(T.s1.title, { placeholder: "title" });
    s.addText(T.s1.subtitle, { placeholder: "body" });
    s.addImage({ data: await robot("wave"), x: 7.55, y: 0.35, w: 2.1, h: 1.82, objectName: "mascot waving" });
    s.addText(T.s1.question, { x: M, y: 2.1, w: W - 2 * M, h: 0.4, fontSize: fz(12.5), bold: true, color: HEX.accent4, margin: 0, valign: "middle", isTextBox: true, objectName: "central question" });
    const cw = (W - 2 * M - 0.3) / 2;
    T.s1.articles.forEach((a, i) => {
      const x = M + i * (cw + 0.3), y = 2.6, h = 1.42;
      card(s, x, y, cw, h, { fill: HEX.accent6, name: "article card " + (i + 1) });
      s.addText(a.label, { x: x + 0.22, y: y + 0.12, w: cw - 0.44, h: 0.24, fontSize: fz(9.5), bold: true, color: HEX.accent4, charSpacing: 1, margin: 0, isTextBox: true, objectName: "article label" });
      s.addText(a.title, { x: x + 0.22, y: y + 0.36, w: cw - 0.44, h: 0.7, fontSize: fz(10), bold: true, color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "article title" });
      s.addText(a.meta, { x: x + 0.22, y: y + 1.04, w: cw - 0.44, h: 0.34, fontSize: fz(8), color: HEX.accent4, margin: 0, valign: "top", isTextBox: true, objectName: "article meta" });
    });
    // roadmap chips
    s.addText(T.s1.roadmapHead, { x: M, y: 4.16, w: 1.15, h: 0.3, fontSize: fz(9), bold: true, color: HEX.accent4, margin: 0, valign: "middle", isTextBox: true, objectName: "roadmap head" });
    const chipW = (W - 2 * M - 1.25 - 0.4) / 5;
    for (let i = 0; i < T.steps.length; i++) {
      const x = M + 1.25 + i * (chipW + 0.1);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.16, w: chipW, h: 0.3, fill: { color: i === 0 ? HEX.accent1 : HEX.accent6 }, line: { color: HEX.accent1, width: i === 0 ? 0 : 0.75 }, rectRadius: 0.15, objectName: "roadmap chip " + (i + 1) });
      s.addText(`${i + 1}  ${T.steps[i]}`, { x, y: 4.16, w: chipW, h: 0.3, fontSize: 7.5, bold: true, color: "FFFFFF", align: "center", margin: 0, valign: "middle", isTextBox: true, objectName: "roadmap chip text" });
    }
    s.addText([
      { text: P.name, options: { bold: true, color: "FFFFFF", fontSize: fz(11), breakLine: true } },
      { text: `${P.id}  |  ${P.degree}  |  ${P.course}`, options: { color: HEX.accent4, fontSize: fz(9) } },
    ], { x: M, y: 4.62, w: W - 2 * M, h: 0.5, margin: 0, valign: "top", isTextBox: true, objectName: "presenter" });
    s.addNotes(T.s1.notes);
  }

  // ---- Slide 2 / 7: method -----------------------------------------------------
  async function slideMethod(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s2.kicker, { placeholder: "kicker" });
    s.addText(T.s2.title, { placeholder: "title" });
    progress(s, T, 2);
    s.addText(T.s2.byline, { x: M, y: 1.16, w: W - 2 * M, h: 0.24, fontSize: fz(9), color: C.text2, margin: 0, isTextBox: true, objectName: "byline" });
    const leftW = 4.45;
    await iconRow(s, T.s2.facts, M, 1.56, leftW, 0.62);
    s.addText(T.s2.condHead, { x: M, y: 3.46, w: leftW, h: 0.26, fontSize: fz(11.5), bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "conditions head" });
    const bw = (leftW - 0.5) / 3;
    for (let i = 0; i < T.s2.conditions.length; i++) {
      const x = M + i * (bw + 0.25);
      card(s, x, 3.78, bw, 0.96, { fill: i === 0 ? HEX.lt2 : HEX.dk1, name: "condition " + (i + 1), shadow: true });
      s.addText(String(i + 1), { x: x + 0.1, y: 3.84, w: 0.3, h: 0.3, fontSize: 14, bold: true, color: i === 0 ? HEX.accent1 : HEX.accent4, margin: 0, isTextBox: true, objectName: "condition number" });
      s.addText(T.s2.conditions[i], { x: x + 0.1, y: 4.12, w: bw - 0.2, h: 0.58, fontSize: fz(9), color: i === 0 ? C.text1 : "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "condition text" });
      if (i < 2) s.addImage({ data: await icon("FiChevronRight", HEX.accent3), x: x + bw + 0.03, y: 4.16, w: 0.2, h: 0.2, objectName: "icon FiChevronRight" });
    }
    // Right: concept card + frontier illustration + searching robot
    const rx = M + leftW + 0.35, rw = W - M - rx;
    card(s, rx, 1.5, rw, 3.24, { name: "concept card", shadow: true });
    tag(s, "concept", T.tags.concept, rx + 0.2, 1.66, 1.3);
    s.addText(T.s2.conceptHead, { x: rx + 0.2, y: 1.96, w: rw - 1.25, h: 0.3, fontSize: fz(10.5), bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "concept head" });
    s.addText(T.s2.conceptBody, { x: rx + 0.2, y: 2.28, w: rw - 1.25, h: 0.98, fontSize: fz(9), color: C.text2, margin: 0, valign: "top", isTextBox: true, objectName: "concept body" });
    s.addImage({ data: await robot("search"), x: rx + rw - 1.18, y: 1.72, w: 1.1, h: 0.95, objectName: "mascot searching" });
    const dx = rx + 0.2, dy = 3.3, dw = rw - 0.4, dh = 1.18;
    s.addImage({ data: await drawing("frontier", art.frontierSvg(ART, { inside: "", outside: "" }), 1280), x: dx, y: dy, w: dw, h: dh, objectName: "frontier illustration" });
    s.addText(T.s2.diagram.outside, { x: dx + 0.1, y: dy + 0.05, w: dw - 0.2, h: 0.2, fontSize: fz(7.5), bold: true, color: C.text2, align: "right", margin: 0, isTextBox: true, objectName: "outside label" });
    s.addText(T.s2.diagram.inside, { x: dx + 0.1, y: dy + dh - 0.26, w: dw - 0.2, h: 0.2, fontSize: fz(7.5), bold: true, color: HEX.accent1, margin: 0, isTextBox: true, objectName: "inside label" });
    s.addText(T.s2.diagram.axis, { x: dx, y: dy + dh + 0.01, w: dw, h: 0.16, fontSize: fz(7), italic: true, color: C.text2, align: "center", margin: 0, isTextBox: true, objectName: "axis label" });
    await bottomRow(s, T, T.s2.ref, T.s2.bridge);
    s.addNotes(T.s2.notes);
  }

  // ---- Slide 3 / 8: findings ---------------------------------------------------
  async function slideFindings(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s3.kicker, { placeholder: "kicker" });
    s.addText(T.s3.title, { placeholder: "title" });
    progress(s, T, 3);
    const chartW = 5.3;
    tag(s, "finding", T.tags.finding, M, 1.24, 2.5);
    s.addChart(pres.charts.BAR, [{ name: "Change (%)", labels: T.s3.chart.labels, values: T.s3.chart.values }], {
      x: M, y: 1.5, w: chartW, h: 2.25, barDir: "bar", barGapWidthPct: 45,
      chartColors: [HEX.accent1, HEX.accent1, HEX.accent1, HEX.dk1, HEX.dk1],
      showTitle: true, title: T.s3.chartTitle, titleFontSize: 9.5, titleColor: HEX.dk1, titleFontFace: "+mn-lt",
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '+0.0"%"', dataLabelFontSize: 9, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
      catAxisLabelFontSize: 8.5, catAxisLabelColor: HEX.dk2, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin",
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 55,
      showLegend: false, objectName: "findings chart",
    });
    s.addText(T.s3.chartNote, { x: M, y: 3.74, w: chartW, h: 0.4, fontSize: fz(7.5), italic: true, color: C.text2, margin: 0, valign: "top", isTextBox: true, objectName: "chart note" });
    const rx = M + chartW + 0.3, rw = W - M - rx;
    card(s, rx, 1.24, rw, 1.92, { fill: HEX.dk1, name: "outside callout", shadow: true });
    s.addText(T.s3.outsideHead, { x: rx + 0.2, y: 1.34, w: rw - 0.4, h: 0.26, fontSize: fz(10), bold: true, color: HEX.accent4, charSpacing: 1, margin: 0, isTextBox: true, objectName: "outside head" });
    s.addText(T.s3.outsideStat, { x: rx + 0.2, y: 1.56, w: 1.6, h: 0.5, fontSize: 40, bold: true, color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, objectName: "outside stat" });
    s.addText(T.s3.outsideUnit, { x: rx + 0.2, y: 2.06, w: rw - 1.4, h: 0.22, fontSize: fz(9.5), color: HEX.accent4, margin: 0, valign: "middle", isTextBox: true, objectName: "outside unit" });
    s.addImage({ data: await robot("confused"), x: rx + rw - 1.22, y: 1.44, w: 1.1, h: 0.95, objectName: "mascot confused" });
    s.addText(T.s3.outsideBody, { x: rx + 0.2, y: 2.34, w: rw - 0.4, h: 0.76, fontSize: fz(9), color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "outside body" });
    card(s, rx, 3.26, rw, 0.88, { name: "unit note card" });
    s.addText(T.s3.unitNote, { x: rx + 0.15, y: 3.3, w: rw - 0.3, h: 0.8, fontSize: fz(8), color: C.text2, margin: 0, valign: "middle", isTextBox: true, objectName: "unit note" });
    s.addText(T.s3.approachHead, { x: M, y: 4.2, w: 5, h: 0.22, fontSize: fz(10.5), bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "approach head" });
    const aw = (W - 2 * M - 0.3) / 2;
    const glyphs = [await drawing("centaur", art.centaurSvg(ART), 480), await drawing("cyborg", art.cyborgSvg(ART), 480)];
    for (let i = 0; i < T.s3.approaches.length; i++) {
      const a = T.s3.approaches[i], x = M + i * (aw + 0.3), y = 4.44;
      card(s, x, y, aw, 0.4, { name: "approach " + a.head });
      s.addImage({ data: glyphs[i], x: x + 0.08, y: y + 0.05, w: 0.45, h: 0.3, objectName: "glyph " + a.head });
      s.addText([{ text: a.head + "  ", options: { bold: true, fontSize: fz(9.5), color: C.text1 } }, { text: a.body, options: { fontSize: fz(8.5), color: C.text2 } }],
        { x: x + 0.62, y, w: aw - 0.7, h: 0.4, margin: 0, valign: "middle", isTextBox: true, objectName: "approach text" });
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
    s.addText(T.s4.byline, { x: M, y: 1.16, w: W - 2 * M, h: 0.24, fontSize: fz(9), color: C.text2, margin: 0, isTextBox: true, objectName: "byline" });
    const leftW = 4.2;
    await iconRow(s, T.s4.facts, M, 1.56, leftW, 0.64);
    card(s, M, 3.5, leftW, 1.26, { fill: HEX.dk1, name: "main effect card", shadow: true });
    tag(s, "finding", T.tags.finding, M + 0.18, 3.62, 2.5);
    s.addText(T.s4.mainHead, { x: M + 0.18, y: 3.9, w: leftW - 1.3, h: 0.24, fontSize: fz(10.5), bold: true, color: HEX.accent4, margin: 0, isTextBox: true, objectName: "main head" });
    s.addText(T.s4.mainBody, { x: M + 0.18, y: 4.14, w: leftW - 1.3, h: 0.6, fontSize: fz(9), color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "main body" });
    s.addImage({ data: await robot("shop"), x: M + leftW - 1.15, y: 3.74, w: 1.05, h: 0.9, objectName: "mascot with phone" });
    const rx = M + leftW + 0.35, rw = W - M - rx;
    card(s, rx, 1.5, rw, 2.16, { name: "subgroup card", shadow: true });
    tag(s, "finding", T.tags.finding, rx + 0.18, 1.62, 2.5);
    s.addText(T.s4.subHead, { x: rx + 0.18, y: 1.9, w: rw - 1.2, h: 0.26, fontSize: fz(10), bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "subgroup head" });
    s.addImage({ data: await human("phone"), x: rx + rw - 1.12, y: 1.56, w: 1.0, h: 1.05, objectName: "entrepreneur with phone" });
    const chartW = rw - 1.25, zeroX = rx + 0.18 + chartW * 0.5, scale = (chartW * 0.42) / 15;
    const barY0 = 2.46, barH = 0.26, gap = 0.6;
    s.addShape(pres.shapes.LINE, { x: zeroX, y: barY0 - 0.06, w: 0, h: gap * 2 - 0.08, line: { color: HEX.accent3, width: 0.75, dashType: "dash" }, objectName: "zero line" });
    T.s4.bars.forEach((b, i) => {
      const y = barY0 + i * gap, len = Math.abs(b.value) * scale, neg = b.value < 0;
      s.addText([{ text: b.label + "  ", options: { bold: true, fontSize: fz(9), color: C.text1 } }, { text: b.text, options: { bold: true, fontSize: fz(9), color: neg ? HEX.dk2 : HEX.accent1 } }],
        { x: rx + 0.18, y: y - 0.26, w: rw - 0.36, h: 0.24, margin: 0, valign: "middle", isTextBox: true, objectName: "bar label " + i });
      s.addShape(pres.shapes.RECTANGLE, { x: neg ? zeroX - len : zeroX, y, w: len, h: barH, fill: { color: neg ? HEX.accent3 : HEX.accent1 }, line: { color: neg ? HEX.accent3 : HEX.accent1, width: 0 }, objectName: "bar " + i });
    });
    s.addText(T.s4.barNote, { x: rx + 0.18, y: barY0 + gap * 2 - 0.2, w: rw - 0.36, h: 0.18, fontSize: fz(7.5), italic: true, color: C.text2, align: "right", margin: 0, isTextBox: true, objectName: "bar note" });
    card(s, rx, 3.72, rw, 0.5, { name: "mechanism card" });
    s.addText(T.s4.mechanism, { x: rx + 0.15, y: 3.74, w: rw - 0.3, h: 0.46, fontSize: fz(8.5), color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "mechanism" });
    card(s, rx, 4.3, rw, 0.46, { fill: "FFFFFF", line: HEX.accent1, name: "caution card" });
    s.addImage({ data: await icon("FiAlertTriangle", HEX.accent1), x: rx + 0.12, y: 4.41, w: 0.24, h: 0.24, objectName: "icon FiAlertTriangle" });
    s.addText(T.s4.caution, { x: rx + 0.44, y: 4.32, w: rw - 0.56, h: 0.42, fontSize: fz(8), color: C.text2, margin: 0, valign: "middle", isTextBox: true, objectName: "caution" });
    await bottomRow(s, T, T.s4.ref, T.s4.bridge);
    s.addNotes(T.s4.notes);
  }

  // ---- Slide 5 / 10: discussion ---------------------------------------------------
  async function slideDiscussion(T, lang, section) {
    const s = pres.addSlide({ masterName: "CONTENT_" + lang, sectionTitle: section });
    s.addText(T.s5.kicker, { placeholder: "kicker" });
    s.addText(T.s5.title, { placeholder: "title" });
    progress(s, T, 5);
    tag(s, "finding", T.tags.finding, M, 1.22, 2.5);
    const head = T.s5.tableHead.map((h) => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: HEX.dk1 }, fontSize: fz(9.5), valign: "middle" } }));
    const rows = T.s5.rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { fontSize: fz(9.5), bold: ci === 0, color: ci === 0 ? HEX.dk1 : HEX.dk2, fill: { color: ri % 2 === 0 ? "FFFFFF" : HEX.lt2 }, valign: "middle" } })));
    s.addTable([head, ...rows], { x: M, y: 1.5, w: W - 2 * M, colW: [1.7, 3.65, 3.65], rowH: [0.34, 0.5, 0.56, 0.56], border: { type: "solid", color: HEX.accent5, pt: 0.75 }, margin: 0.08, fontFace: FONT, objectName: "comparison table" });
    const cy = 3.62, ch = 1.14;
    card(s, M, cy, W - 2 * M, ch, { fill: HEX.accent1, name: "conclusion card", shadow: true });
    tag(s, "interp", T.tags.interp, M + 0.2, cy + 0.12, 1.5);
    s.addText(T.s5.conclusionHead, { x: M + 0.2, y: cy + 0.4, w: 2.2, h: 0.26, fontSize: fz(11), bold: true, color: "FFFFFF", margin: 0, isTextBox: true, objectName: "conclusion head" });
    s.addText(T.s5.conclusion, { x: M + 0.2, y: cy + 0.64, w: 4.15, h: 0.48, fontSize: fz(9), color: "FFFFFF", margin: 0, valign: "top", isTextBox: true, objectName: "conclusion" });
    const tx = M + 4.45, tw = 2.75;
    for (let i = 0; i < T.s5.takeaways.length; i++) {
      const y = cy + 0.14 + i * 0.32;
      s.addImage({ data: await icon("FiCheckCircle", "FFFFFF"), x: tx, y: y + 0.04, w: 0.2, h: 0.2, objectName: "icon check" });
      s.addText(T.s5.takeaways[i], { x: tx + 0.3, y, w: tw - 0.3, h: 0.28, fontSize: fz(9), color: "FFFFFF", margin: 0, valign: "middle", isTextBox: true, objectName: "takeaway " + (i + 1) });
    }
    s.addImage({ data: await human("shake"), x: W - M - 1.95, y: cy + 0.1, w: 0.95, h: 1.0, objectName: "human handshake" });
    s.addImage({ data: await robot("shake"), x: W - M - 1.12, y: cy + 0.1, w: 1.02, h: 1.0, objectName: "mascot handshake" });
    await bottomRow(s, T, T.s5.refs.join("   |   "), T.s5.closing);
    s.addNotes(T.s5.notes);
  }

  // ---- Build 10 slides -------------------------------------------------------
  const EN_SEC = "English (Slides 1-5)", TH_SEC = "ภาษาไทย (Slides 6-10)";
  pres.addSection({ title: EN_SEC });
  await slideIntro(EN, "en", EN_SEC); await slideMethod(EN, "EN", EN_SEC); await slideFindings(EN, "EN", EN_SEC); await slideEntrepreneurs(EN, "EN", EN_SEC); await slideDiscussion(EN, "EN", EN_SEC);
  BUMP = 1;
  pres.addSection({ title: TH_SEC });
  await slideIntro(TH, "th", TH_SEC); await slideMethod(TH, "TH", TH_SEC); await slideFindings(TH, "TH", TH_SEC); await slideEntrepreneurs(TH, "TH", TH_SEC); await slideDiscussion(TH, "TH", TH_SEC);

  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) { const { applyTheme } = require(APPLY_THEME); await applyTheme(OUT, THEME); }
  console.log("wrote", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
