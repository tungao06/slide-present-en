"""Build a printable A4 PDF of the MGT520 study guide (MGT520/study-guide/*.md).

  pip install markdown pymdown-extensions playwright
  python MGT520/tools/build_pdf.py --fonts <dir with the .woff2 files>

Fonts (SIL OFL, e.g. from the npm packages @fontsource/ibm-plex-sans-thai-looped,
@fontsource/mali, @fontsource/ibm-plex-mono): body IBM Plex Sans Thai Looped, headings Mali,
diagrams IBM Plex Mono. Emoji come from the system's Noto Color Emoji.
Chromium comes from Playwright (PLAYWRIGHT_BROWSERS_PATH) or --chromium.
"""

import argparse
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # MGT520/
GUIDE = ROOT / "study-guide"

CSS = r"""
@font-face { font-family: Body; font-weight: 400; src: url(FONTS/ibm-plex-sans-thai-looped-thai-400-normal.woff2), url(FONTS/ibm-plex-sans-thai-looped-latin-400-normal.woff2); }
@font-face { font-family: BodyT; font-weight: 400; src: url(FONTS/ibm-plex-sans-thai-looped-thai-400-normal.woff2); unicode-range: U+0E00-0E7F; }
@font-face { font-family: BodyT; font-weight: 600; src: url(FONTS/ibm-plex-sans-thai-looped-thai-600-normal.woff2); unicode-range: U+0E00-0E7F; }
@font-face { font-family: BodyT; font-weight: 700; src: url(FONTS/ibm-plex-sans-thai-looped-thai-700-normal.woff2); unicode-range: U+0E00-0E7F; }
@font-face { font-family: BodyL; font-weight: 400; src: url(FONTS/ibm-plex-sans-thai-looped-latin-400-normal.woff2); }
@font-face { font-family: BodyL; font-weight: 600; src: url(FONTS/ibm-plex-sans-thai-looped-latin-600-normal.woff2); }
@font-face { font-family: BodyL; font-weight: 700; src: url(FONTS/ibm-plex-sans-thai-looped-latin-700-normal.woff2); }
@font-face { font-family: Head; font-weight: 500; src: url(FONTS/mali-thai-500-normal.woff2); unicode-range: U+0E00-0E7F; }
@font-face { font-family: Head; font-weight: 600; src: url(FONTS/mali-thai-600-normal.woff2); unicode-range: U+0E00-0E7F; }
@font-face { font-family: Head; font-weight: 700; src: url(FONTS/mali-thai-700-normal.woff2); unicode-range: U+0E00-0E7F; }
@font-face { font-family: HeadL; font-weight: 600; src: url(FONTS/mali-latin-600-normal.woff2); }
@font-face { font-family: HeadL; font-weight: 700; src: url(FONTS/mali-latin-700-normal.woff2); }
@font-face { font-family: Mono; font-weight: 400; src: url(FONTS/ibm-plex-mono-latin-400-normal.woff2); }
@font-face { font-family: Mono; font-weight: 600; src: url(FONTS/ibm-plex-mono-latin-600-normal.woff2); }
@font-face { font-family: MonoT; src: url(FONTS/ibm-plex-sans-thai-looped-thai-400-normal.woff2); unicode-range: U+0E00-0E7F; }

:root {
  --ink: #3b3a4a; --soft: #6d6a80; --line: #e7e3ef;
  --pink: #fde7ef; --pink-d: #e0789f;
  --blue: #e5f0fb; --blue-d: #5b8fd1;
  --green: #e6f5e9; --green-d: #5aa86c;
  --yellow: #fff6d8; --yellow-d: #d6a62b;
  --orange: #ffecdc; --orange-d: #e58a3c;
  --lilac: #f1ecfb; --lilac-d: #8c74c9;
}
@page { size: A4; margin: 18mm 17mm 20mm 17mm; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: BodyT, BodyL, "Noto Color Emoji", sans-serif; font-size: 11pt; line-height: 1.85;
       color: var(--ink); margin: 0; }
p, li { orphans: 3; widows: 3; }
p { margin: 0 0 .7em; }
strong { font-weight: 700; color: #2c2b3a; }
a { color: var(--blue-d); text-decoration: none; word-break: break-all; }

h1, h2, h3, h4 { font-family: Head, HeadL, "Noto Color Emoji", sans-serif; line-height: 1.45;
                 break-after: avoid; page-break-after: avoid; }
h1 { font-size: 22pt; font-weight: 700; color: #4b3f72; margin: 0 0 .5em; padding: 14px 18px;
     background: linear-gradient(120deg, var(--pink), var(--lilac) 55%, var(--blue)); border-radius: 18px; }
h2 { font-size: 15.5pt; font-weight: 700; color: #5a4a8a; margin: 1.6em 0 .6em; padding: 6px 14px;
     background: var(--lilac); border-radius: 12px; }
h3 { font-size: 13pt; font-weight: 600; color: #4f6fae; margin: 1.4em 0 .5em; padding-bottom: 4px;
     border-bottom: 2.5px dotted #c9d7f0; }
h4 { font-size: 11.5pt; font-weight: 600; color: #5d8a68; margin: 1.1em 0 .4em; }
.chapter { break-before: page; }
.chapter:first-of-type { break-before: auto; }

ul, ol { padding-left: 1.4em; margin: .2em 0 .8em; }
li { margin: .18em 0; }
li::marker { color: var(--pink-d); }
hr { border: none; border-top: 2px dashed var(--line); margin: 1.4em 0; }

blockquote { margin: .9em 0; padding: 10px 14px 6px; border-radius: 14px; background: #f7f6fb;
             border-left: 6px solid #cfc8e3; break-inside: avoid; page-break-inside: avoid; }
blockquote p:last-child { margin-bottom: .3em; }
blockquote.focus  { background: var(--pink);   border-left-color: var(--pink-d); }
blockquote.mental { background: var(--blue);   border-left-color: var(--blue-d); }
blockquote.apply  { background: var(--green);  border-left-color: var(--green-d); }
blockquote.warn   { background: var(--orange); border-left-color: var(--orange-d); }
blockquote.note   { background: var(--yellow); border-left-color: var(--yellow-d); }

table { width: 100%; border-collapse: separate; border-spacing: 0; margin: .8em 0 1.1em; font-size: 9.8pt;
        line-height: 1.6; border: 1.5px solid var(--line); border-radius: 12px; overflow: hidden; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th { background: var(--lilac); color: #4b3f72; font-weight: 700; text-align: left; padding: 7px 9px; }
td { padding: 6px 9px; border-top: 1px solid var(--line); vertical-align: top; }
tbody tr:nth-child(even) td { background: #fbfaff; }

code { font-family: Mono, MonoT, monospace; font-size: .9em; background: #f3f0f8; padding: 1px 5px; border-radius: 5px; }
pre { font-family: Mono, MonoT, "Noto Color Emoji", monospace; background: #fbf9f3; border: 1.5px solid #efe6cc;
      border-radius: 14px; padding: 12px 14px; line-height: 1.55; white-space: pre; overflow: hidden;
      break-inside: avoid; page-break-inside: avoid; margin: .9em 0 1.1em; }
pre code { background: none; padding: 0; font-size: inherit; }
pre .c { display: inline-block; width: 1ch; text-align: center; }
pre .w { display: inline-block; width: 2ch; text-align: center; }

figure { margin: 1em auto 1.2em; text-align: center; break-inside: avoid; page-break-inside: avoid; }
figure img { max-width: 100%; max-height: 95mm; border-radius: 12px; border: 1.5px solid var(--line);
             box-shadow: 0 2px 6px rgba(80, 60, 120, .12); }
figcaption { font-size: 9pt; color: var(--soft); margin-top: 5px; }

.cover { height: 250mm; display: flex; flex-direction: column; justify-content: center; align-items: center;
         text-align: center; border-radius: 28px;
         background: linear-gradient(150deg, var(--pink) 0%, var(--lilac) 40%, var(--blue) 75%, var(--green) 100%); }
.cover .t1 { font-family: Head, HeadL; font-size: 40pt; font-weight: 700; color: #4b3f72; line-height: 1.3; }
.cover .t2 { font-family: Head, HeadL; font-size: 18pt; font-weight: 600; color: #5a4a8a; margin-top: 10px; }
.cover .t3 { font-size: 12pt; color: var(--soft); margin-top: 26px; line-height: 1.9; }
.cover .deco { font-size: 30pt; margin: 18px 0; letter-spacing: 8px; font-family: "Noto Color Emoji"; }
.toc { break-before: page; }
.toc ol { list-style: none; padding: 0; }
.toc li { font-family: Head, HeadL; font-size: 14pt; padding: 10px 16px; margin: 9px 0; border-radius: 14px; background: var(--lilac); }
.toc li:nth-child(2) { background: var(--pink); } .toc li:nth-child(3) { background: var(--blue); }
.toc li:nth-child(4) { background: var(--green); } .toc li:nth-child(5) { background: var(--yellow); }
.toc li small { display: block; font-family: BodyT, BodyL; font-size: 10pt; color: var(--soft); }
"""

# grid cells for diagrams: Thai combining marks stay with their base character
SEGMENT_JS = r"""
for (const pre of document.querySelectorAll('pre')) {
  const text = pre.textContent;
  if (!/[\u0E00-\u0E7F\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2B50]/u.test(text)) continue;
  const seg = new Intl.Segmenter('th', {granularity: 'grapheme'});
  const out = [];
  for (const {segment: g} of seg.segment(text)) {
    if (g === '\n') { out.push('\n'); continue; }
    const esc = g.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const wide = /[\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2B50\u2B06\u2194-\u21FF]/u.test(g) && /\p{Extended_Pictographic}/u.test(g);
    out.push(`<span class="${wide ? 'w' : 'c'}">${esc}</span>`);
  }
  pre.innerHTML = out.join('');
}
// shrink wide diagrams until they fit the page width instead of clipping them
for (const pre of document.querySelectorAll('pre')) {
  let size = parseFloat(getComputedStyle(pre).fontSize);
  while (pre.scrollWidth > pre.clientWidth + 1 && size > 5.5) {
    size -= 0.25;
    pre.style.fontSize = size + 'px';
  }
}
"""


def classify_quotes(body):
    """Colour the 🎯 / 🧠 / 🛠️ / 🍊 / 💛 call-out boxes."""
    kinds = [("🎯", "focus"), ("🧠", "mental"), ("🛠", "apply"), ("🍊", "warn"), ("⚠", "warn"), ("💛", "note")]

    def tag(m):
        inner = m.group(1)
        head = re.sub(r"<[^>]+>", "", inner)[:40]
        cls = next((c for k, c in kinds if k in head), "")
        return f'<blockquote class="{cls}">{inner}</blockquote>' if cls else m.group(0)
    return re.sub(r"<blockquote>(.*?)</blockquote>", tag, body, flags=re.S)


def figures(body, base):
    """<p><img></p> -> centred figure with caption; resolve paths to file URLs."""
    def fix(m):
        src, alt = m.group("src"), html.unescape(m.group("alt") or "")
        if not src.startswith(("http:", "https:", "file:")):
            src = (base / Path(re.sub(r"%20", " ", src))).resolve().as_uri()
        cap = f"<figcaption>{html.escape(alt)}</figcaption>" if alt and not re.match(r"^[\d:\-\s]+$", alt) else ""
        return f'<figure><img src="{src}" alt="{html.escape(alt)}">{cap}</figure>'
    img = r'<img alt="(?P<alt>[^"]*)" src="(?P<src>[^"]+)"\s*/?>'
    body = re.sub(r"<p>\s*" + img + r"\s*</p>", fix, body)
    return re.sub(img, fix, body)


def chapter_html(md_file):
    import markdown

    text = md_file.read_text(encoding="utf-8")
    body = markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists", "attr_list",
                                                "pymdownx.tilde", "pymdownx.magiclink"])
    body = figures(body, md_file.parent)
    return f'<section class="chapter">{classify_quotes(body)}</section>'


def build(out_pdf, fonts, chromium):
    from playwright.sync_api import sync_playwright

    chapters = sorted(GUIDE.glob("0*.md"))
    if not chapters:
        sys.exit(f"no chapters in {GUIDE}")
    titles = []
    for c in chapters:
        first = c.read_text(encoding="utf-8").splitlines()[0].lstrip("# ").strip()
        titles.append(first)
    toc = "".join(f"<li>{html.escape(t)}</li>" for t in titles)
    cover = f"""
<section class="cover">
  <div class="deco">🌸📘🥑💛🍊</div>
  <div class="t1">MGT520<br>พฤติกรรมองค์การ</div>
  <div class="t2">สรุปเตรียมสอบปลายภาค</div>
  <div class="t3">วัฒนธรรมองค์กร · พฤติกรรมกลุ่ม · ภาวะผู้นำ · การบริหารความขัดแย้ง<br>
  เทคนิคเขียนตอบอัตนัย และข้อสอบจำลองพร้อมแนวคำตอบ</div>
</section>
<section class="toc"><h1>สารบัญ</h1><ol>{toc}</ol>
<blockquote class="note"><p><strong>💛 วิธีอ่านสัญลักษณ์</strong><br>
📌 นิยาม/แนวคิดหลัก · 📘 ทฤษฎี/โครงสร้าง · 🥑 เคส/ตัวอย่าง · 💛 เทคนิคจำ/สรุป · 🍊 จุดที่มักเสียคะแนน</p></blockquote>
<blockquote class="focus"><p><strong>🎯 FOCUS</strong> ต้องจำไปเขียนให้ตรงเป๊ะ (⭐ อ. เน้น = อ. พูดเองว่าออกสอบหรือให้เน้น)</p></blockquote>
<blockquote class="mental"><p><strong>🧠 MENTAL MODEL</strong> วิธีคิดให้เข้าใจ ไม่ต้องท่องจำ</p></blockquote>
<blockquote class="apply"><p><strong>🛠️ APPLICATION BLUEPRINT</strong> ขั้นตอนนำไปใช้กับสถานการณ์จริงและโจทย์ข้อสอบ</p></blockquote>
<p><strong>(ความรู้เสริม)</strong> = ไม่ได้มาจากสไลด์หรือคำบรรยายของ อ.</p></section>"""
    css = CSS.replace("FONTS", fonts.resolve().as_uri())
    doc = (f'<!doctype html><html lang="th"><head><meta charset="utf-8"><style>{css}</style></head>'
           f'<body>{cover}{"".join(chapter_html(c) for c in chapters)}</body></html>')
    html_path = out_pdf.with_suffix(".html")
    html_path.write_text(doc, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium) if chromium else p.chromium.launch()
        # lay out at the printed content width (A4 minus margins) so the diagram fitting
        # below measures the same widths the PDF will have
        page = browser.new_page(viewport={"width": 664, "height": 1000})
        page.emulate_media(media="print")
        page.goto(html_path.resolve().as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.evaluate(SEGMENT_JS)
        page.wait_for_timeout(500)
        page.pdf(path=str(out_pdf), format="A4", print_background=True, display_header_footer=True,
                 header_template="<span></span>",
                 footer_template='<div style="width:100%;text-align:center;font-size:8pt;color:#9a96ad;">'
                                 'MGT520 · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
                 margin={"top": "18mm", "bottom": "20mm", "left": "17mm", "right": "17mm"})
        browser.close()
    print(f"-> {out_pdf}")


def main():
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--fonts", type=Path, required=True, help="folder with the .woff2 font files")
    ap.add_argument("--out", type=Path, default=GUIDE / "MGT520-สรุปเตรียมสอบ.pdf")
    ap.add_argument("--chromium", help="path to a Chromium binary (default: Playwright's)")
    args = ap.parse_args()
    build(args.out, args.fonts, args.chromium)


if __name__ == "__main__":
    main()
