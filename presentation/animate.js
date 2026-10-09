// ---------------------------------------------------------------------------
// ANIMATIONS. Adds native PowerPoint click-builds (entrance effects) and a fade
// slide transition to the deck written by build.js, mirroring the build order of
// the web version. pptxgenjs cannot write animations, so this edits the slide XML
// inside the .pptx afterwards. Shapes are addressed by their objectName.
// Run:  node animate.js            (rewrites AI_Work_Performance_ENG501.pptx in place)
// ---------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const FILE = path.join(__dirname, "AI_Work_Performance_ENG501.pptx");

// One step = one click. Items are objectNames (as given in build.js); "name#k" is
// the k-th shape with that name (0-based) when a name repeats on a slide.
// Effects: fade, rise (float up + fade), pop (zoom), left (wipe from left).
const STEPS = {
  intro: [
    { fx: "pop", items: ["mascot waving"] },
    { fx: "fade", items: ["central question"] },
    { fx: "rise", items: ["article card 1", "article card 2", "article label", "article title", "article meta"] },
    { fx: "fade", items: ["roadmap head", /^roadmap chip/] },
  ],
  method: [
    { fx: "rise", items: ["icon circle", /^icon Fi(?!ArrowRight)/, /^fact /] },
    { fx: "rise", items: ["conditions head", /^condition /] },
    { fx: "fade", items: ["tag concept", "tag text", "concept head", "concept body"] },
    { fx: "pop", items: ["mascot searching"] },
    { fx: "rise", items: ["frontier illustration", "outside label", "inside label"] },
    { fx: "fade", items: ["bridge text", "icon FiArrowRight"] },
  ],
  findings: [
    { fx: "fade", items: ["tag finding", "tag text"] },
    { fx: "left", items: ["findings chart"] },
    { fx: "fade", items: ["chart note"] },
    { fx: "pop", items: ["outside callout", "outside head", "outside stat", "outside unit", "outside body", "mascot confused"] },
    { fx: "fade", items: ["unit note"] },
    { fx: "rise", items: ["divider", "approach head", /^glyph /, "approach text"] },
    { fx: "fade", items: ["bridge text", "icon FiArrowRight"] },
  ],
  entrepreneurs: [
    { fx: "rise", items: ["icon circle", /^icon Fi(?!ArrowRight|MessageCircle|AlertTriangle)/, /^fact /] },
    { fx: "pop", items: ["main effect card", "tag finding#0", "tag text#0", "main head", "main body", "mascot with phone"] },
    { fx: "fade", items: ["tag finding#1", "tag text#1", "subgroup head", "zero line"] },
    { fx: "pop", items: ["entrepreneur with phone"] },
    { fx: "left", items: ["bar label 0", "bar 0"] },
    { fx: "left", items: ["bar label 1", "bar 1", "bar note"] },
    { fx: "rise", items: ["divider", "icon FiMessageCircle", "mechanism", "icon FiAlertTriangle", "caution"] },
    { fx: "fade", items: ["bridge text", "icon FiArrowRight"] },
  ],
  discussion: [
    { fx: "rise", items: ["tag finding", "tag text", "comparison table"] },
    { fx: "pop", items: ["conclusion card", "tag interp", "conclusion", "icon check", /^takeaway /, "human handshake", "mascot handshake"] },
    { fx: "fade", items: ["bridge text", "icon FiArrowRight"] },
  ],
};
const KIND_BY_SLIDE = ["intro", "method", "findings", "entrepreneurs", "discussion", "intro", "method", "findings", "entrepreneurs", "discussion"];
const DUR = { fade: 500, rise: 700, pop: 500, left: 500 };

// ---- XML builders -------------------------------------------------------------
let nextId = 1;
const id = () => nextId++;
const tgt = (spid) => `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>`;
const setVisible = (spid) =>
  `<p:set><p:cBhvr><p:cTn id="${id()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>${tgt(spid)}` +
  `<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`;
const fadeIn = (spid, dur) => `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${id()}" dur="${dur}"/>${tgt(spid)}</p:cBhvr></p:animEffect>`;
const floatUp = (spid, dur) =>
  `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${id()}" dur="${dur}" fill="hold"/>${tgt(spid)}` +
  `<p:attrNameLst><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst>` +
  `<p:tav tm="0"><p:val><p:strVal val="#ppt_y+.08"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="#ppt_y"/></p:val></p:tav></p:tavLst></p:anim>`;
const zoom = (spid, dur) =>
  `<p:animScale><p:cBhvr><p:cTn id="${id()}" dur="${dur}" fill="hold"/>${tgt(spid)}</p:cBhvr><p:from x="0" y="0"/><p:to x="100000" y="100000"/></p:animScale>`;
const wipeLeft = (spid, dur) => `<p:animEffect transition="in" filter="wipe(left)"><p:cBhvr><p:cTn id="${id()}" dur="${dur}"/>${tgt(spid)}</p:cBhvr></p:animEffect>`;

// presetID/presetSubtype are PowerPoint's catalogue numbers so the Animation Pane names the effect.
const FX = {
  fade: { preset: 'presetID="10" presetClass="entr" presetSubtype="0"', body: (s, d) => setVisible(s) + fadeIn(s, d) },
  rise: { preset: 'presetID="42" presetClass="entr" presetSubtype="0"', body: (s, d) => setVisible(s) + fadeIn(s, d) + floatUp(s, d) },
  pop: { preset: 'presetID="23" presetClass="entr" presetSubtype="16"', body: (s, d) => setVisible(s) + zoom(s, d) + fadeIn(s, d) },
  left: { fx: "left", preset: 'presetID="22" presetClass="entr" presetSubtype="8"', body: (s, d) => setVisible(s) + wipeLeft(s, d) },
};

function effectNode(fx, spid, nodeType) {
  const f = FX[fx];
  return `<p:par><p:cTn id="${id()}" ${f.preset} fill="hold" grpId="0" nodeType="${nodeType}"><p:stCondLst><p:cond delay="0"/></p:stCondLst>` +
    `<p:childTnLst>${f.body(spid, DUR[fx])}</p:childTnLst></p:cTn></p:par>`;
}

function clickStep(fx, spids) {
  const effects = spids.map((s, i) => effectNode(fx, s, i === 0 ? "clickEffect" : "withEffect")).join("");
  return `<p:par><p:cTn id="${id()}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>` +
    `<p:par><p:cTn id="${id()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${effects}</p:childTnLst></p:cTn></p:par>` +
    `</p:childTnLst></p:cTn></p:par>`;
}

function timingXml(steps, shapes) {
  nextId = 1;
  const root = id(), seq = id(); // ids 1 and 2
  const pars = steps.map((st) => clickStep(st.fx, st.spids)).join("");
  const bld = shapes.map((s) => s.kind === "graphicFrame"
    ? `<p:bldGraphic spid="${s.spid}" grpId="0"><p:bldAsOne/></p:bldGraphic>`
    : s.kind === "sp" ? `<p:bldP spid="${s.spid}" grpId="0" animBg="1"/>` : "").join("");
  return `<p:timing><p:tnLst><p:par><p:cTn id="${root}" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>` +
    `<p:seq concurrent="1" nextAc="seek"><p:cTn id="${seq}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${pars}</p:childTnLst></p:cTn>` +
    `<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>` +
    `<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>` +
    `</p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>${bld}</p:bldLst></p:timing>`;
}

// ---- Slide processing ------------------------------------------------------------
function renumberAndIndex(xml) {
  // pptxgenjs can repeat cNvPr ids (e.g. the slide-number placeholder); give every shape a unique id.
  const shapes = [];
  let n = 1;
  const out = xml.replace(/<p:(sp|pic|graphicFrame|cxnSp|grpSp|nvGrpSpPr)>([\s\S]*?)<p:cNvPr id="\d+"( name="([^"]*)")?/g, (m, kind, between, _n, name) => {
    if (kind === "nvGrpSpPr") return `<p:${kind}>${between}<p:cNvPr id="1"${_n || ""}`; // the shape tree root keeps id 1
    n += 1;
    shapes.push({ spid: n, name: name || "", kind });
    return `<p:${kind}>${between}<p:cNvPr id="${n}"${_n || ""}`;
  });
  return { xml: out, shapes };
}

function resolveSteps(kind, shapes, slideNo) {
  const used = new Set();
  const byName = {};
  shapes.forEach((s) => (byName[s.name] = byName[s.name] || []).push(s));
  const steps = STEPS[kind].map((st) => {
    const picked = [];
    for (const item of st.items) {
      let hits;
      if (item instanceof RegExp) hits = shapes.filter((s) => item.test(s.name));
      else {
        const m = item.match(/^(.*)#(\d+)$/);
        hits = m ? [byName[m[1]] && byName[m[1]][+m[2]]].filter(Boolean) : byName[item] || [];
      }
      if (!hits.length) console.warn(`slide ${slideNo}: no shape matches ${item}`);
      for (const h of hits) {
        if (used.has(h.spid)) throw new Error(`slide ${slideNo}: shape "${h.name}" (${h.spid}) is in two steps`);
        used.add(h.spid); picked.push(h);
      }
    }
    return { fx: st.fx, spids: picked.map((p) => p.spid), shapes: picked };
  });
  return steps;
}

async function animate(file = FILE) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  for (let i = 1; i <= KIND_BY_SLIDE.length; i++) {
    const p = `ppt/slides/slide${i}.xml`;
    let xml = await zip.file(p).async("string");
    xml = xml.replace(/<p:transition[\s\S]*?<\/p:transition>/, "").replace(/<p:timing>[\s\S]*?<\/p:timing>/, "");
    const r = renumberAndIndex(xml);
    const steps = resolveSteps(KIND_BY_SLIDE[i - 1], r.shapes, i);
    const animated = steps.flatMap((s) => s.shapes);
    const extra = `<p:transition spd="med"><p:fade/></p:transition>` + timingXml(steps, animated);
    xml = r.xml.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + extra);
    if (!xml.includes("<p:timing>")) throw new Error(`slide ${i}: could not insert timing`);
    zip.file(p, xml);
    console.log(`slide ${i}: ${steps.length} clicks, ${animated.length} animated shapes`);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { animate };
if (require.main === module) animate().then(() => console.log("animated", FILE)).catch((e) => { console.error(e); process.exit(1); });
