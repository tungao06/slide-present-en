// Generates the deck's illustrations (flat, warm-minimalist, brand palette) as PNGs.
// Run: NODE_PATH=<dir with sharp> node make-art.js   → writes ../assets/*.png
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "assets");
fs.mkdirSync(OUT, { recursive: true });
const G = "#006241", G2 = "#00754A", DG = "#1E3932", CREAM = "#F7F5F0", MINT = "#D4E9E2", GOLD = "#CBA258", INK = "#191919", WOOD = "#8B5E3C", WOOD2 = "#A9754F", WHITE = "#FFFFFF", TAN = "#E8DCC8";

const svgs = {};

// 1. The brand mark is NOT drawn: assets/starbucks-logo.png is rendered from the official Starbucks siren
//    vector (simple-icons, icons/starbucks.svg) in Starbucks green. See README.

// 2. Coffee cup with emblem and steam.
svgs["coffee-cup"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<g fill="none" stroke="${G2}" stroke-width="10" stroke-linecap="round" opacity="0.7">
  <path d="M150 70c-14 20 14 30 0 50"/><path d="M200 50c-14 20 14 30 0 50"/><path d="M250 70c-14 20 14 30 0 50"/>
</g>
<path d="M100 150h200l-16 180a30 30 0 0 1-30 26H146a30 30 0 0 1-30-26z" fill="${WHITE}" stroke="${TAN}" stroke-width="4"/>
<rect x="92" y="130" width="216" height="34" rx="10" fill="${CREAM}" stroke="${TAN}" stroke-width="4"/>
<rect x="112" y="186" width="176" height="92" fill="${G}"/>
<circle cx="200" cy="232" r="34" fill="${CREAM}"/>
<circle cx="200" cy="232" r="24" fill="${G}"/>
<path d="M186 220l6 10 8-14 8 14 6-10 2 14h-32z" fill="${CREAM}"/><ellipse cx="200" cy="246" rx="8" ry="9" fill="${CREAM}"/>
</svg>`;

// 3. Pike Place storefront, 1971.
svgs["pike-place"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<rect width="800" height="500" fill="${CREAM}"/>
<rect x="0" y="400" width="800" height="100" fill="${TAN}"/>
<rect x="80" y="80" width="640" height="330" fill="${WOOD}"/>
<rect x="80" y="80" width="640" height="24" fill="${DG}"/>
<rect x="110" y="120" width="580" height="70" rx="6" fill="${DG}"/>
<text x="400" y="168" font-family="Georgia, serif" font-size="40" font-weight="700" fill="${CREAM}" text-anchor="middle" letter-spacing="6">STARBUCKS COFFEE</text>
<g fill="${G}"><path d="M80 200h640l-20 50H100z"/></g>
<g fill="${CREAM}"><rect x="100" y="200" width="40" height="50"/><rect x="180" y="200" width="40" height="50"/><rect x="260" y="200" width="40" height="50"/><rect x="340" y="200" width="40" height="50"/><rect x="420" y="200" width="40" height="50"/><rect x="500" y="200" width="40" height="50"/><rect x="580" y="200" width="40" height="50"/><rect x="660" y="200" width="40" height="50"/></g>
<rect x="120" y="270" width="200" height="130" fill="${MINT}" stroke="${DG}" stroke-width="8"/>
<rect x="480" y="270" width="200" height="130" fill="${MINT}" stroke="${DG}" stroke-width="8"/>
<rect x="350" y="270" width="100" height="140" fill="${DG}"/><rect x="362" y="284" width="76" height="80" fill="${MINT}"/><circle cx="428" cy="350" r="5" fill="${GOLD}"/>
<g fill="${WOOD2}"><ellipse cx="170" cy="400" rx="34" ry="22"/><ellipse cx="240" cy="400" rx="34" ry="22"/><ellipse cx="560" cy="400" rx="34" ry="22"/><ellipse cx="630" cy="400" rx="34" ry="22"/></g>
<g fill="${DG}"><ellipse cx="170" cy="384" rx="22" ry="8"/><ellipse cx="240" cy="384" rx="22" ry="8"/><ellipse cx="560" cy="384" rx="22" ry="8"/><ellipse cx="630" cy="384" rx="22" ry="8"/></g>
<rect x="300" y="40" width="200" height="30" rx="15" fill="${GOLD}"/>
<text x="400" y="62" font-family="Georgia, serif" font-size="20" font-weight="700" fill="${INK}" text-anchor="middle" letter-spacing="3">SEATTLE · 1971</text>
</svg>`;

// 4. Milan espresso bar.
svgs["milan-espresso"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<rect width="800" height="500" fill="${CREAM}"/>
<rect x="0" y="0" width="800" height="300" fill="#EFE7D8"/>
<g stroke="${TAN}" stroke-width="2"><line x1="0" y1="60" x2="800" y2="60"/><line x1="0" y1="120" x2="800" y2="120"/><line x1="0" y1="180" x2="800" y2="180"/><line x1="0" y1="240" x2="800" y2="240"/></g>
<rect x="0" y="300" width="800" height="200" fill="${WOOD}"/>
<rect x="0" y="300" width="800" height="26" fill="${DG}"/>
<g><rect x="470" y="150" width="220" height="150" rx="14" fill="#C9CBCF"/><rect x="490" y="170" width="180" height="50" rx="8" fill="${DG}"/><rect x="520" y="240" width="40" height="40" fill="#9EA2A8"/><rect x="600" y="240" width="40" height="40" fill="#9EA2A8"/><circle cx="520" cy="195" r="8" fill="${GOLD}"/><circle cx="640" cy="195" r="8" fill="${GOLD}"/></g>
<g fill="${WHITE}" stroke="${TAN}" stroke-width="3"><path d="M120 250h60l-6 44h-48z"/><path d="M220 250h60l-6 44h-48z"/><path d="M320 250h60l-6 44h-48z"/></g>
<g fill="none" stroke="${G2}" stroke-width="6" stroke-linecap="round" opacity="0.7"><path d="M150 230c-8 12 8 18 0 30" transform="translate(0,-30)"/><path d="M250 230c-8 12 8 18 0 30" transform="translate(0,-30)"/><path d="M350 230c-8 12 8 18 0 30" transform="translate(0,-30)"/></g>
<g><rect x="60" y="40" width="300" height="70" rx="10" fill="${WHITE}" stroke="${TAN}" stroke-width="3"/><rect x="60" y="40" width="100" height="70" rx="10" fill="#1B8A3C" opacity="0.9"/><rect x="260" y="40" width="100" height="70" rx="10" fill="#C8102E" opacity="0.9"/><text x="210" y="84" font-family="Georgia, serif" font-size="30" font-weight="700" fill="${INK}" text-anchor="middle" letter-spacing="4">MILANO</text></g>
<g fill="${DG}"><circle cx="140" cy="200" r="22"/><circle cx="240" cy="200" r="22"/><circle cx="340" cy="200" r="22"/></g>
<g fill="${INK}"><rect x="126" y="222" width="28" height="30" rx="6"/><rect x="226" y="222" width="28" height="30" rx="6"/><rect x="326" y="222" width="28" height="30" rx="6"/></g>
</svg>`;

// 5. Third place: cosy interior.
svgs["third-place"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<rect width="800" height="500" fill="#F1E9DA"/>
<rect x="0" y="380" width="800" height="120" fill="${WOOD}"/>
<rect x="80" y="60" width="220" height="200" rx="8" fill="${MINT}" stroke="${DG}" stroke-width="8"/>
<line x1="190" y1="60" x2="190" y2="260" stroke="${DG}" stroke-width="8"/><line x1="80" y1="160" x2="300" y2="160" stroke="${DG}" stroke-width="8"/>
<circle cx="560" cy="110" r="46" fill="${GOLD}" opacity="0.5"/>
<rect x="556" y="20" width="8" height="50" fill="${DG}"/><path d="M510 110h100l-16 40h-68z" fill="${CREAM}" stroke="${DG}" stroke-width="4"/>
<g><rect x="360" y="250" width="260" height="130" rx="30" fill="${G}"/><rect x="340" y="230" width="60" height="150" rx="24" fill="${DG}"/><rect x="580" y="230" width="60" height="150" rx="24" fill="${DG}"/><rect x="400" y="200" width="180" height="80" rx="24" fill="${G2}"/></g>
<rect x="120" y="300" width="180" height="20" rx="6" fill="${DG}"/><rect x="200" y="320" width="20" height="60" fill="${DG}"/>
<g fill="${WHITE}" stroke="${TAN}" stroke-width="3"><path d="M150 262h40l-4 34h-32z"/><path d="M230 262h40l-4 34h-32z"/></g>
<g fill="none" stroke="${G2}" stroke-width="5" stroke-linecap="round" opacity="0.7"><path d="M170 232c-6 10 6 14 0 24"/><path d="M250 232c-6 10 6 14 0 24"/></g>
<g><rect x="660" y="180" width="80" height="200" fill="${WOOD2}"/><g fill="${CREAM}"><rect x="672" y="200" width="56" height="34"/><rect x="672" y="250" width="56" height="34"/><rect x="672" y="300" width="56" height="34"/></g><rect x="676" y="204" width="48" height="4" fill="${G}"/><rect x="676" y="254" width="48" height="4" fill="${GOLD}"/><rect x="676" y="304" width="48" height="4" fill="${DG}"/></g>
<g fill="${DG}" opacity="0.8"><path d="M600 40 q8 10 0 20 q-8 10 0 20" fill="none" stroke="${DG}" stroke-width="3"/></g>
</svg>`;

// 6. Cup with a customer's name written on it.
svgs["named-cup"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<path d="M100 140h200l-16 200a30 30 0 0 1-30 26H146a30 30 0 0 1-30-26z" fill="${WHITE}" stroke="${TAN}" stroke-width="4"/>
<rect x="92" y="120" width="216" height="34" rx="10" fill="${CREAM}" stroke="${TAN}" stroke-width="4"/>
<path d="M92 92h216v30H92z" fill="${DG}"/><rect x="92" y="92" width="216" height="30" rx="8" fill="${DG}"/>
<rect x="112" y="176" width="176" height="110" fill="${G}"/>
<circle cx="240" cy="231" r="22" fill="${CREAM}"/><circle cx="240" cy="231" r="15" fill="${G}"/>
<text x="166" y="240" font-family="'Brush Script MT', 'Segoe Script', cursive" font-size="40" fill="${CREAM}" text-anchor="middle">Mia</text>
<g stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M128 302h60"/><path d="M128 318h40"/></g>
<circle cx="214" cy="310" r="10" fill="${GOLD}"/>
</svg>`;

// 7. Phone with the rewards app.
svgs["phone-app"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
<rect x="70" y="20" width="260" height="560" rx="40" fill="${INK}"/>
<rect x="84" y="40" width="232" height="520" rx="30" fill="${CREAM}"/>
<rect x="150" y="48" width="100" height="14" rx="7" fill="${INK}"/>
<rect x="84" y="80" width="232" height="120" fill="${G}"/>
<text x="110" y="130" font-family="Georgia, serif" font-size="22" font-weight="700" fill="${CREAM}">Good morning</text>
<text x="110" y="162" font-family="Arial, sans-serif" font-size="16" fill="${MINT}">Rewards · 138 stars</text>
<rect x="104" y="220" width="192" height="60" rx="14" fill="${WHITE}" stroke="${TAN}" stroke-width="2"/>
<text x="120" y="256" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="${INK}">Order ahead</text>
<circle cx="268" cy="250" r="14" fill="${G}"/><path d="M262 250l5 5 9-10" stroke="${CREAM}" stroke-width="3" fill="none" stroke-linecap="round"/>
<rect x="104" y="296" width="192" height="60" rx="14" fill="${WHITE}" stroke="${TAN}" stroke-width="2"/>
<text x="120" y="332" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="${INK}">Pay in store</text>
<rect x="104" y="372" width="192" height="120" rx="14" fill="${MINT}"/>
<text x="120" y="404" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${G}">RECOMMENDED FOR YOU</text>
<text x="120" y="434" font-family="Georgia, serif" font-size="18" font-weight="700" fill="${INK}">Iced Matcha Latte</text>
<rect x="120" y="450" width="120" height="10" rx="5" fill="${G}" opacity="0.4"/>
<g fill="${GOLD}"><path d="M130 530l6 12 14 2-10 10 2 14-12-6-12 6 2-14-10-10 14-2z"/><path d="M200 530l6 12 14 2-10 10 2 14-12-6-12 6 2-14-10-10 14-2z"/><path d="M270 530l6 12 14 2-10 10 2 14-12-6-12 6 2-14-10-10 14-2z"/></g>
</svg>`;

// 8. Globe with store dots.
svgs["globe"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<circle cx="200" cy="200" r="170" fill="${MINT}"/>
<g fill="none" stroke="${G}" stroke-width="3" opacity="0.7"><circle cx="200" cy="200" r="170"/><ellipse cx="200" cy="200" rx="70" ry="170"/><ellipse cx="200" cy="200" rx="130" ry="170"/><line x1="30" y1="200" x2="370" y2="200"/><ellipse cx="200" cy="200" rx="170" ry="70"/><ellipse cx="200" cy="200" rx="170" ry="130"/></g>
<g fill="${G}" opacity="0.35"><path d="M90 130c30-30 70-30 90-10 10 20-10 40-30 50-30 10-60-10-60-40z"/><path d="M230 110c30-10 70 0 80 30 10 30-10 60-40 70-30 0-50-30-50-60 0-20 0-30 10-40z"/><path d="M150 230c20-10 50 0 60 20 10 30-10 60-40 60-30-10-40-50-20-80z"/><path d="M260 240c20 0 40 10 40 30 0 20-20 30-40 30-20-10-20-50 0-60z"/></g>
<g fill="${GOLD}" stroke="${CREAM}" stroke-width="3"><circle cx="120" cy="140" r="9"/><circle cx="170" cy="120" r="9"/><circle cx="260" cy="150" r="9"/><circle cx="300" cy="190" r="9"/><circle cx="180" cy="250" r="9"/><circle cx="240" cy="280" r="9"/><circle cx="290" cy="260" r="9"/><circle cx="140" cy="200" r="9"/><circle cx="220" cy="200" r="9"/></g>
</svg>`;

// 9. Handshake / connection mark for the closing quote.
svgs["connection"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<g fill="${CREAM}"><circle cx="120" cy="120" r="46"/><circle cx="280" cy="120" r="46"/></g>
<g fill="${MINT}"><path d="M40 260c0-50 36-80 80-80s80 30 80 80z"/><path d="M200 260c0-50 36-80 80-80s80 30 80 80z"/></g>
<path d="M150 200c20-20 80-20 100 0" fill="none" stroke="${GOLD}" stroke-width="10" stroke-linecap="round"/>
<g fill="${G}"><circle cx="108" cy="114" r="5"/><circle cx="132" cy="114" r="5"/><circle cx="268" cy="114" r="5"/><circle cx="292" cy="114" r="5"/></g>
<g fill="none" stroke="${G}" stroke-width="4" stroke-linecap="round"><path d="M108 134q12 10 24 0"/><path d="M268 134q12 10 24 0"/></g>
</svg>`;

(async () => {
  for (const [name, svg] of Object.entries(svgs)) {
    const m = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
    const w = Number(m[1]) * 2; // 2x for crisp slides
    await sharp(Buffer.from(svg)).resize({ width: w }).png().toFile(path.join(OUT, name + ".png"));
    console.log("wrote", name + ".png");
  }
})();
