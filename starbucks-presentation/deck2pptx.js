// ---------------------------------------------------------------------------
// Converts deck/ (the Claude Slides source) into an editable PowerPoint file with
// native click animations and Morph hand-offs, using the same approach as
// ../presentation/webdeck2pptx.js: each slide is laid out in Chromium, every element is
// copied at its rendered position, then ../presentation/animate.js adds the timing XML.
// Run:  NODE_PATH=<modules> node deck2pptx.js      → export/Starbucks_Storytelling_Masterclass.pptx
// ---------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { chromium } = require("playwright");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Fi = require("react-icons/fi");
const Bs = require("react-icons/bs");
const sharp = require("sharp");
const { animateAuto } = require("../presentation/animate");

const ROOT = path.join(__dirname, "deck");
const ASSETS = path.join(__dirname, "assets");
const OUT = path.join(__dirname, "export", "Starbucks_Storytelling_Masterclass.pptx");
const TMP = path.join(__dirname, "export", ".tmp");
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const deck = JSON.parse(fs.readFileSync(path.join(ROOT, "project/deck.json"), "utf8"));

// Uploaded images (/_blob/<id>) → files in assets/
const BLOB = { b91cead099c8e786cc3480308fde4cff: "starbucks-logo.png", f28b4dfa0620890c29f09fae2c0d12be: "phone-app.png", "56f119c9e5e1eded07848c624f700ef1": "globe.png" };
// Slides <x-icon name> → icon component
const ICON = { Users: Fi.FiUsers, Globe: Fi.FiGlobe, Chat: Fi.FiMessageCircle, Star: Fi.FiStar, Lightning: Fi.FiZap, Lightbulb: Bs.BsLightbulb, CheckCircle: Fi.FiCheckCircle, Home: Fi.FiHome };

const IN = 10 / 1920;           // px → inches (10in wide slide)
const PT = 0.375;               // px → points
const BASE_CSS = `*{box-sizing:border-box;margin:0}body{margin:0}section{position:relative;width:1920px;height:1080px;overflow:hidden}
h1{font-size:96px;font-weight:600;line-height:1.1}h2{font-size:64px;font-weight:600;line-height:1.15}h3{font-size:44px;font-weight:600;line-height:1.2}p{font-size:32px;line-height:1.4}
x-icon{display:inline-block}x-shape{display:inline-block}img{display:block}aside{display:none}
/* Load the deck faces as web fonts so Chromium applies the variable weight axis exactly (fontconfig
   would pick a named instance). Weight 600 is laid out as 700: PowerPoint only has a bold flag. */
@font-face{font-family:Inter;src:url(FONTS/Inter[opsz,wght].ttf);font-weight:100 900}@font-face{font-family:Inter;src:url(FONTS/Inter-Italic[opsz,wght].ttf);font-weight:100 900;font-style:italic}
@font-face{font-family:"Noto Sans Thai";src:url(FONTS/NotoSansThai[wdth,wght].ttf);font-weight:100 900}
[style*="font-weight:600"],[style*="font-weight:700"]{font-weight:700!important}`.replace(/FONTS\//g, "file://" + path.join(__dirname, "export", "fonts") + "/");

const iconCache = new Map();
async function iconPng(name, hex) {
  const key = name + hex;
  if (!iconCache.has(key)) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(ICON[name] || Fi.FiCircle, { size: 256, strokeWidth: 2 })).replace(/currentColor/g, "#" + hex);
    iconCache.set(key, "image/png;base64," + (await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer()).toString("base64"));
  }
  return iconCache.get(key);
}

// Runs in the browser: flattens one slide into paint items with rendered geometry.
function extract() {
  const sec = document.querySelector("section");
  const hex = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); if (!m) return null; const [r, g, b, a] = m[1].split(",").map(parseFloat); if (a === 0) return null; return [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase(); };
  const topOf = (el) => { let e = el; while (e && e.parentElement !== sec) e = e.parentElement; return e; };
  const out = [];
  const TEXT = ["P", "H1", "H2", "H3", "LI"];
  function walk(el) {
    if (el.tagName === "ASIDE") return;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const top = topOf(el);
    const base = { x: r.x, y: r.y, w: r.width, h: r.height, tag: el.tagName.toLowerCase(), build: top.dataset.buildIn || null, chip: top.id || null };
    const bg = hex(cs.backgroundColor);
    const bw = parseFloat(cs.borderTopWidth), bAll = ["Top", "Right", "Bottom", "Left"].every((s) => parseFloat(cs["border" + s + "Width"]) > 0 && cs["border" + s + "Style"] !== "none");
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    if (el.tagName === "X-SHAPE") { out.push({ ...base, kind: "shape", shape: el.getAttribute("kind"), fill: bg || "000000" }); return; }
    if (bg || bAll) out.push({ ...base, kind: "rect", fill: bg, radius, line: bAll ? { color: hex(cs.borderTopColor), w: bw } : null, shadow: cs.boxShadow !== "none" });
    if (el.tagName === "IMG") {
      let { x, y, w, h } = base;
      if (cs.objectFit === "contain" && el.naturalWidth && el.naturalHeight) { const s = Math.min(w / el.naturalWidth, h / el.naturalHeight); const nw = el.naturalWidth * s, nh = el.naturalHeight * s; x += (w - nw) / 2; y += (h - nh) / 2; w = nw; h = nh; }
      out.push({ ...base, x, y, w, h, kind: "img", src: el.getAttribute("src"), alt: el.alt || "" });
      return;
    }
    if (el.tagName === "X-ICON") { out.push({ ...base, kind: "icon", name: el.getAttribute("name"), color: hex(cs.color) || "000000" }); return; }
    if (TEXT.includes(el.tagName)) {
      const runs = [];
      const rec = (node, st) => {
        for (const n of node.childNodes) {
          if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, " "); if (t) runs.push({ text: t, ...st }); }
          else if (n.tagName === "BR") runs.push({ br: true });
          else if (n.nodeType === 1) {
            const ncs = getComputedStyle(n), nst = { ...st };
            if (n.tagName === "B" || n.tagName === "STRONG" || parseInt(ncs.fontWeight) >= 600) nst.bold = true;
            if (n.tagName === "I" || n.tagName === "EM" || ncs.fontStyle === "italic") nst.italic = true;
            const c = hex(ncs.color); if (c) nst.color = c;
            rec(n, nst);
          }
        }
      };
      rec(el, { color: hex(cs.color) || "000000", bold: parseInt(cs.fontWeight) >= 600, italic: cs.fontStyle === "italic" });
      if (runs.length && runs[0].text) runs[0].text = runs[0].text.replace(/^\s+/, "");
      if (runs.length && runs[runs.length - 1].text) runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, "");
      const size = parseFloat(cs.fontSize), lh = cs.lineHeight === "normal" ? size * 1.25 : parseFloat(cs.lineHeight);
      const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat);
      if (runs.some((q) => q.text && q.text.trim())) out.push({
        ...base, kind: "text", runs, font: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), size, lh, pad,
        align: cs.textAlign, letterSpacing: cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing), transform: cs.textTransform,
        nowrap: cs.whiteSpace === "nowrap", oneLine: r.height - pad[0] - pad[2] < lh * 1.5,
      });
      return;
    }
    for (const c of el.children) walk(c);
  }
  for (const c of sec.children) walk(c);
  const aside = sec.querySelector("aside");
  return { bg: hex(getComputedStyle(sec).backgroundColor) || "FFFFFF", transition: sec.dataset.transition || "fade", notes: aside ? aside.textContent.trim() : "", items: out };
}

const buildTag = (it) => { const m = it.build && /^(\w+)\s+(\d+)/.exec(it.build); return m ? `b${m[2]}:${m[1]}` : "static"; };
// Shapes of a hand-off chip are named "!!<chip id>-<n>" on BOTH slides (identical names are how
// PowerPoint's Morph pairs them); their build step is passed to animate.js separately.
function objectName(it, chipCounter, chipBuilds) {
  if (!it.chip) return buildTag(it);
  chipCounter[it.chip] = (chipCounter[it.chip] || 0) + 1;
  const name = `!!${it.chip}-${chipCounter[it.chip]}`;
  chipBuilds[name] = buildTag(it);
  return name;
}

async function main() {
  fs.mkdirSync(TMP, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = deck.title;
  pres.author = "Chayanun Sungsa-ard";
  const sectionStarts = Object.fromEntries(Object.values(deck.sections).map((s) => [s.start, s.description]));
  const transitions = [], chipBuilds = [];

  for (const sid of deck.order) {
    const html = fs.readFileSync(path.join(ROOT, "project/slides", sid + ".html"), "utf8").replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => "file://" + path.join(ASSETS, BLOB[id]));
    const tmp = path.join(TMP, sid + ".html");
    fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>${html}</body></html>`);
    await page.goto("file://" + tmp);
    await page.evaluate(() => Promise.all([...document.images].map((im) => im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; }))));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    const data = await page.evaluate(extract);
    if (sectionStarts[sid]) pres.addSection({ title: sectionStarts[sid] });
    const slide = pres.addSlide({ sectionTitle: Object.values(deck.sections).filter((s) => deck.order.indexOf(s.start) <= deck.order.indexOf(sid)).pop()?.description });
    slide.background = { color: data.bg };
    transitions.push(data.transition);
    const chipCounter = {}, builds = {};
    chipBuilds.push(builds);
    for (const it of data.items) {
      const g = { x: it.x * IN, y: it.y * IN, w: Math.max(it.w, 1) * IN, h: Math.max(it.h, 1) * IN };
      const name = objectName(it, chipCounter, builds);
      if (it.kind === "rect") {
        const radius = Math.min(it.radius, it.h / 2, it.w / 2);
        slide.addShape(radius > 0 ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
          ...g, rectRadius: radius > 0 ? radius * IN : undefined,
          fill: it.fill ? { color: it.fill } : { type: "none" },
          line: it.line ? { color: it.line.color || "000000", width: Math.max(it.line.w * PT, 0.5) } : { type: "none" },
          shadow: it.shadow ? { type: "outer", blur: 3, offset: 1, angle: 90, color: "000000", opacity: 0.12 } : undefined,
          objectName: name,
        });
      } else if (it.kind === "shape") {
        slide.addShape(pres.shapes.RIGHT_ARROW, { ...g, fill: { color: it.fill }, line: { type: "none" }, objectName: name });
      } else if (it.kind === "img") {
        slide.addImage({ path: it.src.replace("file://", ""), ...g, objectName: name + (it.alt ? ` (${it.alt})` : "") });
      } else if (it.kind === "icon") {
        slide.addImage({ data: await iconPng(it.name, it.color), ...g, objectName: name + " icon " + it.name });
      } else if (it.kind === "text") {
        const runs = it.runs.map((r) => r.br ? { text: "", options: { breakLine: true } } : {
          text: it.transform === "uppercase" ? r.text.toUpperCase() : r.text,
          options: { bold: !!r.bold, italic: !!r.italic, color: r.color },
        });
        // PowerPoint measures text slightly differently from Chromium: one-line text stays on one
        // line, wrapping paragraphs get 4% slack on the open side so no word drops to an extra line.
        let x = it.x, w = it.w;
        const single = it.nowrap || it.oneLine;
        // One-line boxes also get 8% so a renderer with wider metrics does not break the line.
        if (!it.nowrap) { const d = w * (single ? 0.08 : 0.04); w += d; if (it.align === "right") x -= d; else if (it.align === "center") x -= d / 2; }
        slide.addText(runs, {
          x: x * IN, y: it.y * IN, w: w * IN, h: it.h * IN,
          fontFace: it.font, fontSize: +(it.size * PT).toFixed(2), lineSpacing: +(it.lh * PT).toFixed(2),
          charSpacing: it.letterSpacing ? +(it.letterSpacing * PT).toFixed(2) : undefined,
          align: it.align === "start" ? "left" : it.align, valign: it.oneLine ? "middle" : "top",
          // pptxgenjs margin order is [left, right, bottom, top]; CSS pad is [top, right, bottom, left]
          margin: [it.pad[3] * PT, it.pad[1] * PT, it.oneLine ? 0 : it.pad[2] * PT, it.oneLine ? 0 : it.pad[0] * PT],
          wrap: !single, isTextBox: true, autoFit: false, objectName: name,
        });
      }
    }
    if (data.notes) slide.addNotes(data.notes);
    console.log(sid, data.items.length, "items,", data.items.filter((i) => i.build).length, "animated");
  }
  await browser.close();
  await pres.writeFile({ fileName: OUT });
  await animateAuto(OUT, transitions, chipBuilds);
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log("wrote", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
