// ---------------------------------------------------------------------------
// Cute SVG characters + backgrounds, rasterised to PNG (base64) for the deck.
// All drawings are generated here, so they can be re-coloured from build.js.
// ---------------------------------------------------------------------------
const sharp = require("sharp");

async function png(svg, width) {
  const buf = await sharp(Buffer.from(svg)).resize({ width }).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---- Robot mascot ----------------------------------------------------------
// pose: "wave" | "search" | "chart" | "confused" | "shop" | "shake" | "idea"
function robotSvg(pose, c) {
  const { navy, teal, body, mint } = c;
  const eyes = {
    happy: `<path d="M78 86 q12 -14 24 0" stroke="${teal}" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M118 86 q12 -14 24 0" stroke="${teal}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    normal: `<circle cx="90" cy="84" r="8" fill="${teal}"/><circle cx="130" cy="84" r="8" fill="${teal}"/>
             <circle cx="93" cy="81" r="2.5" fill="#fff"/><circle cx="133" cy="81" r="2.5" fill="#fff"/>`,
    confused: `<circle cx="90" cy="86" r="8" fill="${teal}"/><circle cx="131" cy="84" r="5" fill="${teal}"/>
               <path d="M78 70 l24 6" stroke="${teal}" stroke-width="5" stroke-linecap="round"/>
               <path d="M118 74 l24 -6" stroke="${teal}" stroke-width="5" stroke-linecap="round"/>`,
    star: `<path d="M90 74 l3.5 7 7.5 1 -5.5 5.5 1.5 7.5 -7 -4 -7 4 1.5 -7.5 -5.5 -5.5 7.5 -1z" fill="${teal}"/>
           <path d="M130 74 l3.5 7 7.5 1 -5.5 5.5 1.5 7.5 -7 -4 -7 4 1.5 -7.5 -5.5 -5.5 7.5 -1z" fill="${teal}"/>`,
  };
  const mouths = {
    smile: `<path d="M94 102 q16 12 32 0" stroke="${teal}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    flat: `<path d="M98 104 h24" stroke="${teal}" stroke-width="5" stroke-linecap="round"/>`,
    o: `<circle cx="110" cy="104" r="6" fill="none" stroke="${teal}" stroke-width="4"/>`,
    grin: `<path d="M92 100 q18 18 36 0 z" fill="${teal}"/>`,
  };
  const P = {
    wave: { eye: "happy", mouth: "grin", armL: "down", armR: "up" },
    search: { eye: "normal", mouth: "o", armL: "down", armR: "magnifier" },
    chart: { eye: "star", mouth: "grin", armL: "card", armR: "up" },
    confused: { eye: "confused", mouth: "flat", armL: "down", armR: "scratch" },
    shop: { eye: "normal", mouth: "smile", armL: "down", armR: "phone" },
    shake: { eye: "happy", mouth: "smile", armL: "shake", armR: "down" },
    idea: { eye: "normal", mouth: "smile", armL: "down", armR: "point" },
  }[pose];

  const arm = (side, kind) => {
    const stroke = `stroke="${navy}" stroke-width="13" fill="none" stroke-linecap="round"`;
    const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="${body}" stroke="${navy}" stroke-width="6"/>`;
    if (side === "L") {
      if (kind === "down") return `<path d="M60 168 q-28 14 -24 48" ${stroke}/>${hand(36, 218)}`;
      if (kind === "card") return `<path d="M60 168 q-30 6 -40 30" ${stroke}/>${hand(18, 200)}
        <g transform="translate(-28 150)"><rect x="0" y="0" width="64" height="52" rx="8" fill="#fff" stroke="${navy}" stroke-width="5"/>
        <rect x="10" y="30" width="9" height="14" fill="${teal}"/><rect x="24" y="20" width="9" height="24" fill="${teal}"/><rect x="38" y="10" width="9" height="34" fill="${navy}"/></g>`;
      if (kind === "shake") return `<path d="M60 170 q-34 0 -56 10" ${stroke}/>`;
    } else {
      if (kind === "down") return `<path d="M160 168 q28 14 24 48" ${stroke}/>${hand(184, 218)}`;
      if (kind === "up") return `<path d="M160 162 q34 -16 36 -60" ${stroke}/>${hand(197, 100)}`;
      if (kind === "scratch") return `<path d="M160 162 q40 -30 22 -100" ${stroke}/>${hand(180, 58)}`;
      if (kind === "point") return `<path d="M160 164 q40 -6 56 -30" ${stroke}/>${hand(218, 132)}`;
      if (kind === "magnifier") return `<path d="M160 164 q36 -10 44 -44" ${stroke}/>${hand(204, 118)}
        <g transform="translate(196 50)"><circle cx="22" cy="22" r="22" fill="${mint}" fill-opacity="0.5" stroke="${navy}" stroke-width="6"/>
        <path d="M38 38 l22 22" stroke="${navy}" stroke-width="10" stroke-linecap="round"/></g>`;
      if (kind === "phone") return `<path d="M160 164 q36 -10 44 -44" ${stroke}/>${hand(204, 118)}
        <g transform="translate(192 70)"><rect x="0" y="0" width="34" height="56" rx="7" fill="${navy}"/><rect x="4" y="6" width="26" height="40" rx="3" fill="${mint}"/>
        <path d="M9 18 h16 M9 26 h12 M9 34 h16" stroke="${navy}" stroke-width="3" stroke-linecap="round"/></g>`;
    }
    return "";
  };
  const bubble = pose === "confused"
    ? `<circle cx="206" cy="30" r="20" fill="${teal}"/><text x="206" y="39" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#fff" text-anchor="middle">?</text>`
    : pose === "idea"
    ? `<circle cx="208" cy="30" r="20" fill="${teal}"/><path d="M208 18 v8 M198 24 l6 4 M218 24 l-6 4 M202 40 h12 M204 46 h8" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="208" cy="31" r="6" fill="none" stroke="#fff" stroke-width="3.5"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 0 300 260">
  <line x1="110" y1="38" x2="110" y2="18" stroke="${navy}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="110" cy="13" r="9" fill="${teal}"/>
  <rect x="33" y="70" width="14" height="30" rx="6" fill="${teal}"/><rect x="173" y="70" width="14" height="30" rx="6" fill="${teal}"/>
  <rect x="45" y="36" width="130" height="98" rx="30" fill="${body}" stroke="${navy}" stroke-width="6"/>
  <rect x="62" y="54" width="96" height="64" rx="18" fill="${navy}"/>
  ${eyes[P.eye]}${mouths[P.mouth]}
  <rect x="98" y="132" width="24" height="12" fill="${navy}"/>
  ${arm("L", P.armL)}
  <rect x="58" y="142" width="104" height="88" rx="26" fill="${body}" stroke="${navy}" stroke-width="6"/>
  <circle cx="110" cy="182" r="13" fill="${teal}"/><circle cx="110" cy="182" r="5" fill="#fff"/>
  ${arm("R", P.armR)}
  <rect x="74" y="228" width="24" height="24" rx="9" fill="${navy}"/><rect x="122" y="228" width="24" height="24" rx="9" fill="${navy}"/>
  ${bubble}
</svg>`;
}

// ---- Human character (entrepreneur / consultant) ----------------------------
function humanSvg(pose, c) {
  const { navy, teal, skin, shirt } = c;
  const armR = pose === "shake"
    ? `<path d="M140 150 q34 0 56 10" stroke="${skin}" stroke-width="13" fill="none" stroke-linecap="round"/>`
    : pose === "phone"
    ? `<path d="M140 150 q36 -8 40 -44" stroke="${skin}" stroke-width="13" fill="none" stroke-linecap="round"/>
       <g transform="translate(166 60)"><rect x="0" y="0" width="34" height="56" rx="7" fill="${navy}"/><rect x="4" y="6" width="26" height="40" rx="3" fill="#DDF3EE"/>
       <path d="M9 18 h16 M9 26 h12 M9 34 h16" stroke="${navy}" stroke-width="3" stroke-linecap="round"/></g>`
    : `<path d="M140 150 q28 14 24 48" stroke="${skin}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 0 260 260">
  <circle cx="100" cy="72" r="40" fill="${skin}"/>
  <path d="M60 68 q0 -46 40 -46 q40 0 40 46 q-10 -22 -40 -22 q-30 0 -40 22z" fill="${navy}"/>
  <circle cx="86" cy="78" r="4.5" fill="${navy}"/><circle cx="114" cy="78" r="4.5" fill="${navy}"/>
  <path d="M88 92 q12 10 24 0" stroke="${navy}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M60 140 q-28 14 -24 48" stroke="${skin}" stroke-width="13" fill="none" stroke-linecap="round"/>
  <rect x="58" y="118" width="84" height="100" rx="26" fill="${shirt}"/>
  <path d="M100 118 l-10 16 h20z" fill="#fff" fill-opacity="0.7"/>
  ${armR}
  <rect x="68" y="214" width="26" height="36" rx="10" fill="${navy}"/><rect x="106" y="214" width="26" height="36" rx="10" fill="${navy}"/>
</svg>`;
}

// ---- Backgrounds -------------------------------------------------------------
function seededRandom(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

function networkSvg({ w, h, color, opacity, seed = 7, n = 28, spread = [0, 1, 0, 1] }) {
  const rnd = seededRandom(seed);
  const pts = Array.from({ length: n }, () => ({ x: (spread[0] + rnd() * (spread[1] - spread[0])) * w, y: (spread[2] + rnd() * (spread[3] - spread[2])) * h, r: 3 + rnd() * 5 }));
  let edges = "";
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    if (d < w * 0.16) edges += `<line x1="${pts[i].x}" y1="${pts[i].y}" x2="${pts[j].x}" y2="${pts[j].y}" stroke="${color}" stroke-width="1.5" stroke-opacity="${opacity * 0.6}"/>`;
  }
  const nodes = pts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${color}" fill-opacity="${opacity}"/>`).join("");
  return edges + nodes;
}

function darkBgSvg(c) {
  const w = 1920, h = 1080;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.navy}"/><stop offset="1" stop-color="${c.navyDeep}"/></linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.5"><stop offset="0" stop-color="${c.teal}" stop-opacity="0.45"/><stop offset="1" stop-color="${c.teal}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow2" cx="0.1" cy="0.95" r="0.4"><stop offset="0" stop-color="${c.teal}" stop-opacity="0.25"/><stop offset="1" stop-color="${c.teal}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" fill="url(#glow2)"/>
  ${networkSvg({ w, h, color: "#FFFFFF", opacity: 0.35, seed: 11, n: 34, spread: [0.45, 1, 0, 0.75] })}
</svg>`;
}

function lightBgSvg(c) {
  const w = 1920, h = 1080;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs><radialGradient id="glow" cx="0.95" cy="0.05" r="0.45"><stop offset="0" stop-color="${c.teal}" stop-opacity="0.16"/><stop offset="1" stop-color="${c.teal}" stop-opacity="0"/></radialGradient></defs>
  <rect width="${w}" height="${h}" fill="#FFFFFF"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${networkSvg({ w, h, color: c.teal, opacity: 0.28, seed: 5, n: 22, spread: [0.62, 1, 0, 0.3] })}
</svg>`;
}

// ---- Jagged frontier illustration ------------------------------------------
function frontierSvg(c, labels) {
  const w = 640, h = 300;
  const pts = [[0, 150], [80, 95], [160, 170], [240, 60], [320, 140], [400, 100], [480, 190], [560, 70], [640, 130]];
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.teal}" stop-opacity="0.35"/><stop offset="1" stop-color="${c.teal}" stop-opacity="0.08"/></linearGradient></defs>
  <rect width="${w}" height="${h}" rx="18" fill="#FFFFFF"/>
  <path d="${line} L640 300 L0 300 Z" fill="url(#in)"/>
  <path d="${line}" stroke="${c.teal}" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  ${pts.slice(1, -1).map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#fff" stroke="${c.teal}" stroke-width="4"/>`).join("")}
  <text x="24" y="38" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${c.gray}">${labels.outside}</text>
  <text x="24" y="276" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${c.teal}">${labels.inside}</text>
</svg>`;
}

// ---- Centaur / Cyborg glyphs --------------------------------------------------
function centaurSvg(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
  <circle cx="34" cy="40" r="26" fill="${c.skin}"/><path d="M14 38 q0 -28 20 -28 q20 0 20 28 q-6 -14 -20 -14 q-14 0 -20 14z" fill="${c.navy}"/>
  <circle cx="27" cy="44" r="3" fill="${c.navy}"/><circle cx="41" cy="44" r="3" fill="${c.navy}"/>
  <line x1="60" y1="10" x2="60" y2="70" stroke="${c.gray}" stroke-width="3" stroke-dasharray="6 6"/>
  <rect x="64" y="16" width="48" height="48" rx="14" fill="#fff" stroke="${c.navy}" stroke-width="4"/><rect x="72" y="26" width="32" height="24" rx="8" fill="${c.navy}"/>
  <circle cx="82" cy="38" r="4" fill="${c.teal}"/><circle cx="94" cy="38" r="4" fill="${c.teal}"/><circle cx="88" cy="9" r="4" fill="${c.teal}"/>
</svg>`;
}
function cyborgSvg(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
  <clipPath id="l"><rect x="0" y="0" width="60" height="80"/></clipPath><clipPath id="r"><rect x="60" y="0" width="60" height="80"/></clipPath>
  <circle cx="60" cy="42" r="30" fill="${c.skin}" clip-path="url(#l)"/><path d="M30 40 q0 -30 30 -30 v30z" fill="${c.navy}" clip-path="url(#l)"/>
  <rect x="30" y="12" width="60" height="60" rx="16" fill="#fff" stroke="${c.navy}" stroke-width="4" clip-path="url(#r)"/>
  <rect x="60" y="26" width="24" height="24" rx="6" fill="${c.navy}" clip-path="url(#r)"/><circle cx="72" cy="38" r="4" fill="${c.teal}"/>
  <circle cx="50" cy="44" r="3.5" fill="${c.navy}"/><circle cx="75" cy="6" r="4" fill="${c.teal}"/>
  <line x1="60" y1="8" x2="60" y2="76" stroke="${c.teal}" stroke-width="3"/>
</svg>`;
}

module.exports = { png, robotSvg, humanSvg, darkBgSvg, lightBgSvg, frontierSvg, centaurSvg, cyborgSvg };
