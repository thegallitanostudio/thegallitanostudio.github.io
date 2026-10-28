# thegallitanostudio.com

The live site for The Gallitano Studio, served by GitHub Pages from this repository.
Every change to the main branch goes live in about a minute.

## The one file to edit

`config.js` holds the booking link and the contact email. Change a value, commit, done.

## What's here

Eleven pages, written by hand: Home (`index.html`), `work-with-me/` (with `first-look/` and `executive/`),
`for-companies/` (with `business-case/`), `executiveos/`, `about/`, `questions/`, `contact/` and `book/`.
Four one-page fact sheets are in `fact-sheets/` (for-companies, executiveos, known-for-first-look,
known-for-executive). `llms.txt`, `sitemap.xml` and `robots.txt` are at the root.

Each page loads one stylesheet, `css/bundle-<page>.css`, built by `python3 -I _build/bundle.py` from the
`css-manifest` comment in that page's head. Edit a source file, then rebuild; a source edit alone does
nothing on the live site.

Styles are in `css/`; new work goes in a new file added at the end of the manifest, and the older files
are not edited. Scripts are in `js/`. Photos are in `assets/`,
fonts in `fonts/` (Instrument Sans, SIL Open Font License, license included).

The old paths (`products/`, `programs/`, `corporate/`, `founder/`, `referred/`, `accelerator/`,
`work-with-me/accelerator/`, `live/`)
are redirect pages that send visitors to the right new page. Keep them so old links still work.
