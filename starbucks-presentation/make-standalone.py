"""Bundle index.html into one self-contained file for presenting offline.
Usage: python3 make-standalone.py <compiled tailwind css>   → export/Starbucks_Storytelling_Masterclass.html
The Tailwind CDN script is replaced by the compiled stylesheet and every image is embedded
as a data URI. The Google Fonts link stays (fonts load when online; system fallbacks otherwise)."""
import base64, pathlib, re, sys

here = pathlib.Path(__file__).parent
css = pathlib.Path(sys.argv[1]).read_text(encoding="utf8")
html = (here / "index.html").read_text(encoding="utf8")

html, n = re.subn(r'<script src="https://cdn\.tailwindcss\.com/3\.4\.17"></script>\s*<script>.*?</script>',
                  lambda m: "<style>" + css + "</style>", html, count=1, flags=re.S)
assert n == 1, "tailwind block not found"

def inline(m):
    p = here / m.group(1)
    mime = "image/png" if p.suffix == ".png" else "image/jpeg"
    return 'src="data:%s;base64,%s"' % (mime, base64.b64encode(p.read_bytes()).decode())
html = re.sub(r'src="(assets/[^"]+)"', inline, html)
assert 'src="assets/' not in html

out = here / "export" / "Starbucks_Storytelling_Masterclass.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf8")
print("wrote", out, f"{out.stat().st_size / 1024:.0f} KB")
