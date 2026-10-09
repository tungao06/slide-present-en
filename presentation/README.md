# AI and Work Performance — ENG 501 presentation

Editable 16:9 PowerPoint deck (10 slides: 1–5 English, 6–10 Thai) built from
Article 2 (Dell'Acqua et al., 2023) and Article 5 (Otis et al., 2026).

- `AI_Work_Performance_ENG501.pptx` — the deck (open in PowerPoint, Keynote, or Google Slides; all text, charts and tables are editable)
- `content.js` — every word on the slides (English `EN`, Thai `TH`, references, presenter details). Edit text here.
- `build.js` — theme colors, fonts, layouts and slide composition. Edit styling here.
- `mascot.js` — the robot mascot, human character, gradient/network backgrounds and small glyphs (generated SVG, rasterised to PNG at build time). Recolour via `ART` in `build.js`.
- `animate.js` — the click-by-click build order of every slide (PowerPoint entrance animations) and the fade slide transition. `build.js` runs it automatically; edit the `STEPS` table to change what appears on each click.

Each slide carries a speaker script in its notes pane (English on 1–5, Thai on 6–10).

## Animations

Every slide builds in the same order as the web version: each click reveals the next block
(mascot → question → article cards …). Effects used: Fade, Float In (rise), Zoom (pop) and
Wipe from left (bars/chart). Slides change with a Fade transition. Open the Animation Pane in
PowerPoint to see or reorder them; Keynote and Google Slides import them as well, with minor
differences in timing.

## Rebuild after editing

```bash
npm install pptxgenjs react-icons react react-dom sharp   # once
node build.js                                            # writes AI_Work_Performance_ENG501.pptx (animations included)
node animate.js                                          # re-apply animations only, to an already built file
```

## Fonts (install before opening)

- English slides: **Poppins** · Thai slides: **Prompt** (both free, SIL Open Font License, from Google Fonts).
- Install the `.ttf` files in `fonts/` (double-click → Install) on the computer that will present, otherwise PowerPoint substitutes another font and the layout shifts.
- To change fonts, edit `FONT_EN` / `FONT_TH` at the top of `build.js` and rebuild.
