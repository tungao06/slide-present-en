"""Restyle the English deck slides (s1..s8) to a Notion look: white page, Inter, flat
bordered blocks, gray callouts, pastel tags, emoji instead of icon tiles.
Run once on the brand-styled files; then run make-thai.py to rebuild t1..t8."""
import re, pathlib, json

ROOT = pathlib.Path(__file__).parent / "project"
SL = ROOT / "slides"
EMOJI = {"Users": "👥", "Star": "⭐", "Lightning": "⚡", "Lightbulb": "💡", "Globe": "🌍", "CheckCircle": "✅", "Home": "🏠", "Chat": "💬"}
TAGS = [("Warm lighting", "#FDECC8", "#402C1B"), ("Wooden textures", "#E8DEEE", "#412454"), ("Acoustic music", "#D3E5EF", "#183347"), ("Welcoming aroma", "#DBEDDB", "#1C3829")]

GLOBAL = [
  # page + type
  ("background:#F7F5F0;color:#191919;font-family:'DM Sans', Arial, sans-serif", "background:#FFFFFF;color:#37352F;font-family:'Inter', Arial, sans-serif"),
  ("background:#006241;color:#F7F5F0;font-family:'DM Sans', Arial, sans-serif", "background:#FFFFFF;color:#37352F;font-family:'Inter', Arial, sans-serif"),
  ("font-family:'Fraunces', Georgia, serif", "font-family:'Inter', Arial, sans-serif"),
  ("font-family:'DM Sans', Arial, sans-serif", "font-family:'Inter', Arial, sans-serif"),
  ("font-size:72px;font-weight:600;line-height:1.08", "font-size:72px;font-weight:700;line-height:1.12"),
  ("font-size:64px;font-weight:600;line-height:1.1", "font-size:60px;font-weight:700;line-height:1.15"),
  # eyebrows + small labels: quiet gray
  ("font-size:24px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#006241", "font-size:22px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#787774"),
  ("font-size:24px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#006241", "font-size:22px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#787774"),
  ("font-size:24px;letter-spacing:2px;text-transform:uppercase;color:#6B6A63", "font-size:22px;letter-spacing:1px;text-transform:uppercase;color:#787774"),
  # emphasis
  ('<span style="color:#006241"><b>', '<span style="color:#448361"><b>'),
  ('<span style="color:#D4E9E2"><b>', '<span style="color:#448361"><b>'),
  ('<span style="color:#CBA258"><b>', '<span style="color:#448361"><b>'),
  # blocks: flat, hairline border, small radius
  ("border:1px solid #E6E2D6;border-radius:16px;box-shadow:0 1px 2px rgba(25,25,25,0.06)", "border:1px solid #E9E9E7;border-radius:8px"),
  ("border-radius:16px;box-shadow:0 1px 2px rgba(0,0,0,0.12)", "border:1px solid #E9E9E7;border-radius:8px"),
  ("border:1px solid #E6E2D6", "border:1px solid #E9E9E7"),
  # green "Next" callout → gray callout with an arrow emoji
  ("background:#006241;padding:22px 32px;border-radius:16px", "background:#F1F1EF;padding:22px 32px;border-radius:8px"),
  ('<p style="font-size:24px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#CBA258">Next</p>', '<p style="font-size:30px;line-height:1.3">➡️</p>'),
  ('<p style="font-size:22px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#787774">Next</p>', '<p style="font-size:30px;line-height:1.3">➡️</p>'),
  ("font-size:28px;line-height:1.35;color:#F7F5F0", "font-size:28px;line-height:1.35;color:#37352F"),
  # hand-off chip: Notion yellow tag
  ("font-size:24px;font-weight:700;letter-spacing:1px;text-align:center;white-space:nowrap;background:#CBA258;color:#191919;padding:10px 24px;border-radius:50%", "font-size:24px;font-weight:600;text-align:center;white-space:nowrap;background:#FDECC8;color:#402C1B;padding:10px 24px;border-radius:6px"),
  # footer
  ("width:36px;height:12px;background:#CBA258;border-radius:50%", "width:36px;height:12px;background:#37352F;border-radius:6px"),
  ("width:12px;height:12px;background:#006241;border-radius:50%", "width:12px;height:12px;background:#787774;border-radius:50%"),
  ("width:12px;height:12px;background:#C5D8D0;border-radius:50%", "width:12px;height:12px;background:#E3E2E0;border-radius:50%"),
  ("width:12px;height:12px;background:#2E7D5F;border-radius:50%", "width:12px;height:12px;background:#E3E2E0;border-radius:50%"),
  ("color:#D4E9E2;font-variant-numeric", "color:#787774;font-variant-numeric"),
  ("color:#6B6A63;font-variant-numeric", "color:#787774;font-variant-numeric"),
  # text colors
  ("color:#191919", "color:#37352F"), ("color:#3A3A36", "color:#37352F"), ("color:#6B6A63", "color:#787774"),
  # bullets (gold dots) → text bullets
  ('<div style="width:12px;height:12px;background:#CBA258;border-radius:50%"></div>', '<p style="font-size:28px;color:#37352F">•</p>'),
]

FILES = {
  "s1-title": [
    ("color:#D4E9E2;width:1240px\">MBA", "color:#787774;width:1240px\">MBA"),
    ("color:#F7F5F0;width:1240px\">Crafting", "color:#37352F;width:1240px\">Crafting"),
    ("color:#D4E9E2;width:1240px\">How", "color:#787774;width:1240px\">How"),
    ("background:#F7F5F0;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.18)", "background:#F7F7F5;border:1px solid #E9E9E7;border-radius:50%;display:flex;align-items:center;justify-content:center"),
    ("font-style:italic;color:#F7F5F0\">Now", "font-style:italic;color:#37352F\">Now"),
  ],
  "s2-origin": [
    ("background:#F7F5F0;border:1px solid #E9E9E7;padding:8px 20px;border-radius:50%", "background:#E3E2E0;color:#32302C;padding:8px 20px;border-radius:6px"),
  ],
  "s3-milan": [
    ("background:#CBA258;border-radius:2px", "background:#E3E2E0;border-radius:2px"),
    ("background:#006241;color:#F7F5F0;padding:6px 22px;border-radius:50%", "background:#E3E2E0;color:#32302C;padding:6px 22px;border-radius:6px"),
    ("background:#CBA258;color:#37352F;padding:6px 22px;border-radius:50%", "background:#FDECC8;color:#402C1B;padding:6px 22px;border-radius:6px"),
  ],
  "s4-third-place": [
    ("background:#F7F5F0;padding:16px 24px;border-radius:12px", "background:#F7F7F5;padding:16px 24px;border-radius:8px"),
    ("background:#006241;padding:16px 24px;border-radius:12px", "background:#DBEDDB;padding:16px 24px;border-radius:8px"),
    ("color:#D4E9E2\">3rd Place", "color:#1C3829\">3rd Place"),
    ("color:#F7F5F0\">Starbucks", "color:#1C3829\">Starbucks"),
    ("background:#CBA258\"></x-shape>", "background:#B9B9B7\"></x-shape>"),
  ] + [(f'<p style="font-size:28px;background:#D4E9E2;color:#37352F;padding:8px 20px;border-radius:50%">{t}</p>', f'<p style="font-size:28px;background:{bg};color:{fg};padding:8px 20px;border-radius:6px">{t}</p>') for t, bg, fg in TAGS],
  "s5-touchpoints": [],
  "s6-digital": [],
  "s7-global": [
    ("background:#006241;padding:28px 40px;border-radius:16px", "background:#F7F7F5;border:1px solid #E9E9E7;padding:28px 40px;border-radius:8px"),
    ("color:#F7F5F0;font-variant-numeric:tabular-nums", "color:#37352F;font-variant-numeric:tabular-nums"),
    ("color:#D4E9E2\">Stores", "color:#787774\">Stores"), ("color:#D4E9E2\">Global", "color:#787774\">Global"),
  ],
  "s8-takeaways": [
    ("align-items:center;background:#006241;padding:28px 48px;border-radius:16px", "align-items:center;background:#F7F7F5;border-left:6px solid #37352F;padding:28px 48px;border-radius:0 8px 8px 0"),
    ("line-height:1;color:#CBA258\">“", "line-height:1;color:#B9B9B7\">“"),
    ("font-style:italic;line-height:1.35;color:#F7F5F0", "font-style:italic;line-height:1.35;color:#37352F"),
    ('<x-icon name="Chat" style="width:36px;height:36px;color:#006241"></x-icon>', '<p style="font-size:34px;line-height:1.2">💬</p>'),
    ("font-size:30px;font-weight:700;color:#006241\">Thank", "font-size:30px;font-weight:600;color:#37352F\">Thank"),
  ],
}

ICON_TILE = re.compile(r'<div style="width:(56|64)px;height:\1px;background:#D4E9E2;border-radius:1[24]px;display:flex;align-items:center;justify-content:center"><x-icon name="(\w+)"[^>]*></x-icon></div>')

for sid, extra in FILES.items():
  p = SL / f"{sid}.html"
  s = p.read_text(encoding="utf8")
  for a, b in GLOBAL + extra:
    if a in s:
      s = s.replace(a, b)
  s = ICON_TILE.sub(lambda m: f'<p style="font-size:{"40" if m.group(1) == "56" else "46"}px;line-height:1.3">{EMOJI[m.group(2)]}</p>', s)
  left = re.findall(r"#(?:006241|CBA258|D4E9E2|F7F5F0|191919|3A3A36|6B6A63|E6E2D6|2E7D5F|C5D8D0)", s)
  if left: print(sid, "still brand colours:", sorted(set(left)))
  if "x-icon" in s: print(sid, "x-icon left")
  p.write_text(s, encoding="utf8")

deck = json.loads((ROOT / "deck.json").read_text(encoding="utf8"))
deck["faces"] = {
  "inter": {"family": "Inter", "href": "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..700;1,14..32,400..700&display=swap"},
  "noto-sans-thai": {"family": "Noto Sans Thai", "href": "https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"},
}
(ROOT / "deck.json").write_text(json.dumps(deck, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
print("notionized")
