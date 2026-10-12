# Fact sheet source

The five PDFs in `fact-sheets/` are built from here (layout approved Oct 12, 2026). This folder is not published.

1. `python3 gen.py` writes one HTML file per sheet (edit the wording in `gen.py`).
2. `node r.js known-for-executive known-for-first-look known-for-accelerator for-companies executiveos` renders each to a one-page letter PDF (needs Playwright).
3. Copy the PDFs into `fact-sheets/`.

The paths inside `gen.py`, `base.css` and `r.js` point at a working folder; change them to where the repository is cloned.
