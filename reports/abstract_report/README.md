# Abstract report (ENG 501) — layout source

`content.json` holds the report text (five articles, English + Thai, references) parsed from the original
`TungAo-ABSTRACT_REPORT.docx`; `build.js` lays it out with docx-js (cover, overview table, one section
per article, references, running header and page numbers). Body font is TH SarabunPSK, as in the original.

```bash
node build.js                 # writes out.docx
FONT=Sarabun node build.js    # same layout with the Google "Sarabun" face (for previews on machines without TH SarabunPSK)
```
