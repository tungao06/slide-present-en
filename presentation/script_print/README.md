# Printable presenter script

`content.json` is the presentation script exported from the Claude Docs version (overview, full script,
fast version, hand-off keywords, Q&A, checklist). `build.js` lays it out for printing: A4 landscape,
one slide per page with the slide banner repeated on continuation pages, big click numbers,
Thai and English side by side, click and pause cues highlighted.

```bash
node build.js                 # writes out.docx (TH SarabunPSK)
FONT=Sarabun node build.js    # same layout with Google "Sarabun" (used for the PDF)
```
