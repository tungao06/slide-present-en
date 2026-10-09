// ---------------------------------------------------------------------------
// WEB DECK → POWERPOINT. Converts the Claude Slides web deck in ./webdeck/project
// (1920×1080 slide HTML) into an editable .pptx that matches it one-to-one:
// same layout, text, mascots, click-build order and hand-off chips (Morph).
// Each slide is laid out by Chromium (Playwright); every text box, card, bar,
// image and icon is copied at its rendered position, then animate.js adds the
// click animations from the data-build-in order.
// Run:  node webdeck2pptx.js        (writes AI_Work_Performance_ENG501.pptx)
// ---------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { chromium } = require("playwright");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Fi = require("react-icons/fi");
const sharp = require("sharp");
const { animateAuto } = require("./animate");

const ROOT = path.join(__dirname, "webdeck");
const OUT = path.join(__dirname, "AI_Work_Performance_ENG501.pptx");
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const deck = JSON.parse(fs.readFileSync(path.join(ROOT, "project/deck.json"), "utf8"));

// Uploaded images (/_blob/<id>) → files in webdeck/art
const BLOB = {
  "8ada14a1e08ee53503caf08625840538": "bg-dark.jpg", "de347ea5e94ba2d7b60f2a0c0e60a463": "robot-wave-dark.png",
  "222883d00c94b6d75131da1e14b01ef1": "robot-search.png", "0dbf1fe15003e89aa3818ba1f28ff5ca": "frontier.png",
  "ffe0d3f5833d4c5170e92c88aa542a85": "robot-confused-dark.png", "9b8fbdf71fc1c7ef03a6c1c7038e3f9d": "centaur.png",
  "7072166c40fc18173b318d9467b09ef4": "cyborg.png", "31650c3a8cab2ac19be1654f82be2bdd": "robot-shop-dark.png",
  "191bfff74ac551d5ab38e6c4a6054bda": "human-phone.png", "43b562a7979c6b397832a355410a1bc3": "human-shake-teal.png",
  "1156fbaf3b0137da7a11547f15a230dd": "robot-shake-teal.png",
};
// Slides <x-icon name> → Feather icon
const ICON = { Users: "FiUsers", Activity: "FiActivity", Globe: "FiGlobe", Chat: "FiMessageCircle", Chart: "FiBarChart2", Warning: "FiAlertTriangle", Check: "FiCheck" };

const IN = 10 / 1920;           // px → inches (10in wide slide)
const PT = 0.375;               // px → points
const BASE_CSS = `*{box-sizing:border-box;margin:0}body{margin:0}section{position:relative;width:1920px;height:1080px;overflow:hidden}
h1{font-size:96px;font-weight:600;line-height:1.1}h2{font-size:64px;font-weight:600;line-height:1.15}h3{font-size:44px;font-weight:600;line-height:1.2}p{font-size:32px;line-height:1.4}
table{border-collapse:collapse;width:100%}td,th{padding:.35em .6em;border-bottom:1px solid #d8dee6;vertical-align:middle;text-align:left}th{font-weight:600}
x-icon{display:inline-block}img{display:block}aside{display:none}`;

const iconCache = new Map();
async function iconPng(name, hex) {
  const key = name + hex;
  if (!iconCache.has(key)) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Fi[ICON[name]] || Fi.FiCircle, { size: 256, strokeWidth: 2 })).replace(/currentColor/g, "#" + hex);
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
  const TEXT = ["P", "H1", "H2", "H3", "TD", "TH", "LI"];
  function walk(el) {
    if (el.tagName === "ASIDE") return;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const top = topOf(el);
    const base = { x: r.x, y: r.y, w: r.width, h: r.height, tag: el.tagName.toLowerCase(), build: top.dataset.buildIn || null, chip: top.id || null };
    const bg = hex(cs.backgroundColor);
    const bw = parseFloat(cs.borderTopWidth), bAll = ["Top", "Right", "Bottom", "Left"].every((s) => parseFloat(cs["border" + s + "Width"]) > 0 && cs["border" + s + "Style"] !== "none");
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    if (bg || bAll) out.push({ ...base, kind: "rect", fill: bg, radius, line: bAll ? { color: hex(cs.borderTopColor), w: bw } : null });
    else if (bw > 0 && cs.borderTopStyle !== "none" && !["TD", "TH"].includes(el.tagName)) out.push({ ...base, kind: "line", color: hex(cs.borderTopColor), w: bw, side: "top" });
    if (["TD", "TH"].includes(el.tagName) && parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none") out.push({ ...base, kind: "line", color: hex(cs.borderBottomColor), w: parseFloat(cs.borderBottomWidth), side: "bottom" });
    if (el.tagName === "IMG") {
      let { x, y, w, h } = base;
      if (cs.objectFit === "contain" && el.naturalWidth && el.naturalHeight) { const s = Math.min(w / el.naturalWidth, h / el.naturalHeight); const nw = el.naturalWidth * s, nh = el.naturalHeight * s; x += (w - nw) / 2; y += (h - nh) / 2; w = nw; h = nh; }
      out.push({ ...base, x, y, w, h, kind: "img", src: el.getAttribute("src"), alt: el.alt || "", fit: cs.objectFit });
      if (bAll) out.push({ ...base, kind: "rect", fill: null, radius, line: { color: hex(cs.borderTopColor), w: bw } });
      return;
    }
    if (el.tagName === "X-ICON") { out.push({ ...base, kind: "icon", name: el.getAttribute("name"), color: hex(cs.color) || "000000" }); return; }
    if (el.tagName === "HR") { out.push({ ...base, kind: "line", color: hex(cs.borderTopColor) || hex(cs.color), w: bw || 1, side: "top" }); return; }
    if (TEXT.includes(el.tagName)) {
      const runs = [];
      const rec = (node, st) => {
        for (const n of node.childNodes) {
          if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, " "); if (t) runs.push({ text: t, ...st }); }
          else if (n.tagName === "BR") runs.push({ br: true });
          else if (n.nodeType === 1) {
            const ncs = getComputedStyle(n), nst = { ...st };
            if (n.tagName === "B" || n.tagName === "STRONG" || parseInt(ncs.fontWeight) >= 600) nst.bold = true;
            if (n.tagName === "U" || /underline/.test(ncs.textDecorationLine)) nst.underline = true;
            if (n.tagName === "I" || n.tagName === "EM" || ncs.fontStyle === "italic") nst.italic = true;
            const c = hex(ncs.color); if (c) nst.color = c;
            rec(n, nst);
          }
        }
      };
      rec(el, { color: hex(cs.color) || "000000", bold: parseInt(cs.fontWeight) >= 600, underline: /underline/.test(cs.textDecorationLine), italic: cs.fontStyle === "italic" });
      if (runs.length && runs[0].text) runs[0].text = runs[0].text.replace(/^\s+/, "");
      if (runs.length && runs[runs.length - 1].text) runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, "");
      const size = parseFloat(cs.fontSize), lh = cs.lineHeight === "normal" ? size * 1.25 : parseFloat(cs.lineHeight);
      const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat);
      if (runs.some((q) => q.text && q.text.trim())) out.push({
        ...base, kind: "text", runs, font: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), size, lh, pad,
        align: cs.textAlign, letterSpacing: cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing), transform: cs.textTransform,
        nowrap: cs.whiteSpace === "nowrap", oneLine: r.height - pad[0] - pad[2] < lh * 1.5, cell: ["TD", "TH"].includes(el.tagName),
      });
      return;
    }
    for (const c of el.children) walk(c);
  }
  for (const c of sec.children) walk(c);
  const aside = sec.querySelector("aside");
  return { bg: hex(getComputedStyle(sec).backgroundColor) || "FFFFFF", transition: sec.dataset.transition || "fade", notes: aside ? aside.textContent.trim() : "", items: out };
}

function objectName(it, suffix) {
  const b = it.build ? (() => { const m = /^(\w+)\s+(\d+)/.exec(it.build); return m ? `b${m[2]}:${m[1]}` : "static"; })() : "static";
  return (it.chip ? `!!${it.chip}-${suffix} ` : "") + b;
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = deck.title;
  pres.author = "Chayanun Sungsa-ard";
  const sectionStarts = Object.fromEntries(Object.values(deck.sections).map((s) => [s.start, s.description]));
  const transitions = [];

  for (const sid of deck.order) {
    const html = fs.readFileSync(path.join(ROOT, "project/slides", sid + ".html"), "utf8").replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => "file://" + path.join(ROOT, "art", BLOB[id]));
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>${html}</body></html>`);
    await page.waitForTimeout(300);
    const data = await page.evaluate(extract);
    if (sectionStarts[sid]) pres.addSection({ title: sectionStarts[sid] });
    const slide = pres.addSlide({ sectionTitle: Object.values(deck.sections).find((s) => deck.order.indexOf(s.start) <= deck.order.indexOf(sid))?.description });
    slide.background = { color: data.bg };
    transitions.push(data.transition);
    let k = 0;
    for (const it of data.items) {
      k += 1;
      const g = { x: it.x * IN, y: it.y * IN, w: Math.max(it.w, 1) * IN, h: Math.max(it.h, 1) * IN };
      const name = objectName(it, k);
      if (it.kind === "rect") {
        const radius = Math.min(it.radius, it.h / 2, it.w / 2);
        slide.addShape(radius > 0 ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
          ...g, rectRadius: radius > 0 ? radius * IN : undefined,
          fill: it.fill ? { color: it.fill } : { type: "none" },
          line: it.line ? { color: it.line.color || "000000", width: Math.max(it.line.w * PT, 0.5) } : { type: "none" },
          objectName: name,
        });
      } else if (it.kind === "line") {
        const y = it.side === "bottom" ? (it.y + it.h) * IN : it.y * IN;
        slide.addShape(pres.shapes.LINE, { x: g.x, y, w: g.w, h: 0, line: { color: it.color || "000000", width: Math.max(it.w * PT, 0.5) }, objectName: name });
      } else if (it.kind === "img") {
        const file = it.src.replace("file://", "");
        slide.addImage({ path: file, ...g, objectName: name + (it.alt ? ` (${it.alt})` : "") });
      } else if (it.kind === "icon") {
        slide.addImage({ data: await iconPng(it.name, it.color), ...g, objectName: name + " icon " + it.name });
      } else if (it.kind === "text") {
        const runs = it.runs.map((r) => r.br ? { text: "", options: { breakLine: true } } : {
          text: it.transform === "uppercase" ? r.text.toUpperCase() : r.text,
          options: { bold: !!r.bold, underline: r.underline ? { style: "sng" } : undefined, italic: !!r.italic, color: r.color },
        });
        // PowerPoint wraps a little earlier than Chromium: give wrapping boxes 2% slack on the open side.
        let x = it.x, w = it.w;
        if (!it.nowrap && !it.oneLine) { const d = w * 0.02; w += d; if (it.align === "right") x -= d; else if (it.align === "center") x -= d / 2; }
        slide.addText(runs, {
          x: x * IN, y: it.y * IN, w: w * IN, h: it.h * IN,
          fontFace: it.font, fontSize: +(it.size * PT).toFixed(2), lineSpacing: +(it.lh * PT).toFixed(2), // exact spacing = CSS line-height
          charSpacing: it.letterSpacing ? +(it.letterSpacing * PT).toFixed(2) : undefined,
          align: it.align === "start" ? "left" : it.align, valign: it.oneLine || it.cell ? "middle" : "top",
          // pptxgenjs margin order is [left, right, bottom, top]; CSS pad is [top, right, bottom, left]
          margin: [it.pad[3] * PT, it.pad[1] * PT, it.oneLine || it.cell ? 0 : it.pad[2] * PT, it.oneLine || it.cell ? 0 : it.pad[0] * PT],
          wrap: !it.nowrap, isTextBox: true, autoFit: false, objectName: name,
        });
      }
    }
    if (data.notes) slide.addNotes(data.notes);
    console.log(sid, data.items.length, "items,", data.items.filter((i) => i.build).length, "animated");
  }
  await browser.close();
  await pres.writeFile({ fileName: OUT });
  await animateAuto(OUT, transitions);
  console.log("wrote", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
