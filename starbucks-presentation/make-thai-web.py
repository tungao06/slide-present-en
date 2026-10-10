"""Regenerate the Thai slides (9–16) of index.html from the English sections (1–8),
using the same dictionary as deck/make-thai.py plus the few web-only strings.
Usage: python3 make-thai-web.py   (rewrites index.html in place)"""
import re, pathlib

here = pathlib.Path(__file__).parent
MK = here / "deck" / "make-thai.py"
src = MK.read_text(encoding="utf8")
ns = {"__file__": str(MK)}
exec(src[:src.index("# Layout tweaks")], ns)          # COMMON, T, ASIDE only
COMMON, T = ns["COMMON"], ns["T"]

WEB = {
  "s1-title": [("Now, let's look at where it all began in 1971…", "ต่อไป มาดูกันว่าทุกอย่างเริ่มต้นที่ไหนในปี 1971…")],
  "s2-origin": [("What it symbolized", "สิ่งที่สื่อความหมาย")],
  "s3-milan": [("Schultz didn't just want to sell coffee; he wanted to create a new space in human life…", "Schultz ไม่ได้แค่อยากขายกาแฟ เขาอยากสร้างพื้นที่ใหม่ในชีวิตของผู้คน…")],
  "s4-third-place": [("“We aren't in the coffee business serving people; we're in the people business serving coffee.”", "“เราไม่ได้อยู่ในธุรกิจกาแฟที่ให้บริการผู้คน แต่เราอยู่ในธุรกิจผู้คนที่ให้บริการกาแฟ”")],
  "s5-touchpoints": [('As customer lifestyles changed, Starbucks had to bring "The Third Place" into the digital age…', 'เมื่อ Lifestyle ของลูกค้าเปลี่ยนไป Starbucks ต้องพา "The Third Place" เข้าสู่ยุค Digital…')],
  "s6-digital": [],
  "s7-global": [("So what can business leaders learn from this story?", "แล้ว Business Leader เรียนรู้อะไรได้บ้างจากเรื่องราวนี้?")],
  "s8-takeaways": [],
}
CHAP = [("Introduction", "บทนำ"), ("Chapter 1 · Brand Origin", "บทที่ 1 · Brand Origin"), ("Chapter 2 · The Turning Point", "บทที่ 2 · Turning Point"),
        ("Chapter 3 · The Third Place", "บทที่ 3 · The Third Place"), ("Chapter 4 · Touchpoints", "บทที่ 4 · Touchpoints"), ("Chapter 5 · Digital Third Place", "บทที่ 5 · Digital Third Place"),
        ("Chapter 6 · Global Reach", "บทที่ 6 · Global Reach"), ("Conclusion · MBA Takeaways", "บทสรุป · MBA Takeaways")]
TAG = r"(?:<[^>]+>)+"

def apply(t, en, th):
    """Replace en by th; runs of tags in en match any run of tags in t and are carried over."""
    if "<" not in en:
        return t.replace(en, th)
    parts = re.split(r"((?:<[^>]+>)+)", en)
    rx = "".join(r"(" + TAG + ")" if p.startswith("<") else re.escape(p) for p in parts if p)
    tparts = [p for p in re.split(r"((?:<[^>]+>)+)", th) if p]
    def sub(m):
        out, g = [], 1
        for p in tparts:
            if p.startswith("<"): out.append(m.group(g)); g += 1
            else: out.append(p)
        return "".join(out)
    return re.sub(rx, sub, t)

MARK = "    <!-- ===================== ฉบับภาษาไทย · THAI VERSION ===================== -->\n"
html = (here / "index.html").read_text(encoding="utf8")
a = html.index("    <!-- Slide 1 -->")
b = html.index(MARK) if MARK in html else html.index("  </main>")
end = html.index("  </main>")
secs = [x for x in re.split(r"(?=    <!-- Slide \d -->)", html[a:b]) if "<section" in x]
ids = ["s1-title", "s2-origin", "s3-milan", "s4-third-place", "s5-touchpoints", "s6-digital", "s7-global", "s8-takeaways"]
assert len(secs) == 8
th = []
for n, (sid, sec) in enumerate(zip(ids, secs), 1):
    t = sec
    for en, tr in COMMON + T[sid] + WEB[sid]:
        t = apply(t, en, tr)
    for en, tr in CHAP:
        t = t.replace(f'data-chapter="{en}"', f'data-chapter="{tr}"')
    t = t.replace(f"<!-- Slide {n} -->", f"<!-- Slide {n+8} · Thai -->")
    t = re.sub(r'aria-label="(Slide \d of 16|สไลด์ \d จาก 8)"', f'aria-label="Slide {n+8} of 16 (ภาษาไทย)"', t)
    t = t.replace('<section class="slide', '<section lang="th" class="slide lang-th', 1)
    th.append(t)
out = html[:b] + MARK + "".join(th) + html[end:]
(here / "index.html").write_text(out, encoding="utf8")
print("thai sections:", out.count('<section lang="th"'))
