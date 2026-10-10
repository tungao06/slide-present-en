# Export — ready to present

| File | Use it when |
| --- | --- |
| `Starbucks_Storytelling_Masterclass.pptx` | Presenting from PowerPoint. 16 slides (1–8 English, 9–16 Thai), every block builds on click in the same order as the web version, and the gold hand-off chip travels to the next slide with the Morph transition (PowerPoint 2019 / Microsoft 365; older versions fall back to Fade). Speaker notes are in the notes pane. |
| `Starbucks_Storytelling_Masterclass.html` | Presenting from any browser, no install. Single file with all images embedded: double-click, press F for full screen, → / ← to move. Reveals and the flying hand-off chip are built in. Needs internet once for the web fonts; falls back to system fonts offline. |
| `Starbucks_Presentation_Script.docx` | The presenter script (Word, A4 landscape): team assignment on the cover, one brief page per speaker, one page per slide with click-by-click lines in English and Thai, Q&A prep and a checklist. Built by `../script/build.js` from `../script/content.js`. |
| `fonts/` | Install these (Inter, Noto Sans Thai — SIL Open Font License) on the presenting PC before opening the .pptx so PowerPoint shows the same type as the design. |

Rebuild after editing the deck source (`../deck/`) or `../index.html`:

```bash
node ../deck2pptx.js                               # needs pptxgenjs, playwright, react, react-dom, react-icons, sharp, jszip
python3 ../make-standalone.py <compiled tailwind css>
```
