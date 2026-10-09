# AI and Work Performance — ENG 501 presentation

Editable 16:9 PowerPoint deck (10 slides: 1–5 English, 6–10 Thai) built from
Article 2 (Dell'Acqua et al., 2023) and Article 5 (Otis et al., 2026).

- `AI_Work_Performance_ENG501.pptx` — the deck, a one-to-one PowerPoint copy of the web version designed in Claude Slides (same layout, mascots, click order and hand-off chips). Every text box, card and bar is editable.
- `webdeck/` — the web deck's source (`project/deck.json`, one HTML file per slide in `project/slides/`, artwork in `art/`). This is the single source of truth for the slides.
- `webdeck2pptx.js` — converts `webdeck/` into the .pptx: lays each slide out in Chromium, copies every element at its rendered position, then hands over to `animate.js`.
- `animate.js` — PowerPoint click animations and slide transitions. `data-build-in` order from the web deck becomes one click per step; `data-transition="magic"` becomes a Morph transition so the hand-off chips travel between slides.
- `content.js`, `build.js`, `mascot.js` — the earlier, separately designed deck (`AI_Work_Performance_ENG501_classic.pptx`), kept for reference.

Each slide carries a speaker script in its notes pane (English on 1–5, Thai on 6–10).

## Animations

Every slide builds in the same order as the web version: each click reveals the next block
(mascot → question → article cards …). Effects used: Fade, Float In (rise), Zoom (pop) and
Wipe from left (bars). Slides with hand-off chips use the Morph transition (PowerPoint 2019 /
Microsoft 365) so the chip travels to the next slide; older versions fall back to Fade. Open the
Animation Pane in PowerPoint to see or reorder them.

## Rebuild after editing

Edit the slide HTML under `webdeck/project/slides/` (or re-download the files from the Claude Slides artifact), then:

```bash
npm install pptxgenjs playwright react-icons react react-dom sharp jszip   # once; Chromium path via CHROME=… if not the default
node webdeck2pptx.js                                                       # writes AI_Work_Performance_ENG501.pptx with animations
```

`node build.js` still builds the older classic design as a separate file.

## Fonts (install before opening)

- English slides: **Poppins** · Thai slides: **Prompt** (both free, SIL Open Font License, from Google Fonts).
- Install the `.ttf` files in `fonts/` (double-click → Install) on the computer that will present, otherwise PowerPoint substitutes another font and the layout shifts.
- To change fonts, edit `FONT_EN` / `FONT_TH` at the top of `build.js` and rebuild.
