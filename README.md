# thegallitanostudio.com

The live site for The Gallitano Studio, served by GitHub Pages from this repository.
Every change to the main branch goes live in about a minute.

## The one file to edit

`config.js` holds the booking links and the contact email. Change a value, commit, done.

## Everything else

The pages are built from the locked design boards on the homepage canvas (Home v4, Products v1,
Programs v1, the sponsor page, Founder v2, Book v2, Referred v2, Accelerator v2 and its one-pager,
Live v2, The Five Prompts), with a small runtime (`dc.js`) that keeps the toggles and motion working,
and a layout layer (`site.css`) that reflows them for tablets and phones.

To change copy or layout, change the boards, then rebuild and re-upload the whole folder.
The build tools and the steps live in the project notes (claude/site-build.md).

Fonts: Fraunces and Outfit, self-hosted under `fonts/` (SIL Open Font License, licenses included).
