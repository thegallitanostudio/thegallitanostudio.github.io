/* Build thegallitanostudio.com from the locked canvas boards.
   Input:  ../canvas/project/*.dc.html, ../canvas/assets/*
   Output: ./out/  (repo-ready; pre-rendered by prerender.js afterwards) */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, '..', 'canvas', 'project');
const ASSETS = path.join(ROOT, '..', 'canvas', 'assets');
const OUT = path.join(ROOT, 'out');
const SITE = 'https://thegallitanostudio.com';

const FONT_LINK = `<link rel="preload" href="/fonts/Fraunces.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/Outfit.woff2" as="font" type="font/woff2" crossorigin><style>
@font-face{font-family:'Fraunces';src:url(/fonts/Fraunces.woff2) format('woff2');font-weight:100 900;font-style:normal;font-display:swap}
@font-face{font-family:'Fraunces';src:url(/fonts/Fraunces-Italic.woff2) format('woff2');font-weight:100 900;font-style:italic;font-display:swap}
@font-face{font-family:'Outfit';src:url(/fonts/Outfit.woff2) format('woff2');font-weight:100 900;font-style:normal;font-display:swap}
</style>`;

const LINKS = {
  'Home-v4.dc.html': '/',
  'HomeContinued-v4.dc.html': '/#pace',
  'Products-v1.dc.html': '/products/',
  'ProductsContinued-v1.dc.html': '/products/#look',
  'Programs-v1.dc.html': '/programs/',
  'ForSponsors-v1.dc.html': '/corporate/',
  'Founder-v2.dc.html': '/founder/',
  'Book-v2.dc.html': '/book/',
  'Referred-v2.dc.html': '/referred/',
  'Accelerator-v2.dc.html': '/accelerator/',
  'AcceleratorOnePager-v2.dc.html': '/accelerator/one-pager/',
  'Live-v2.dc.html': '/live/',
  'FivePrompts-1.dc.html': '/five-prompts/',
  'FivePrompts-2.dc.html': '/five-prompts/#page-2',
  'FivePrompts-3.dc.html': '/five-prompts/#page-3',
  'FivePrompts-4.dc.html': '/five-prompts/#page-4',
  'FivePrompts-5.dc.html': '/five-prompts/#page-5',
  'FivePrompts-6.dc.html': '/five-prompts/#page-6',
  'FivePrompts-7.dc.html': '/five-prompts/#page-7',
};
const IMAGES = {
  '/_blob/29f81b62baf1703ea8e4966baa7432ed': { file: '29f81b62baf1703ea8e4966baa7432ed.jpg', out: 'angela-office.jpg' },
  '/_blob/5e1f6199900a942176555e01979d02c8': { file: '5e1f6199900a942176555e01979d02c8.jpg', out: 'angela-outdoors.jpg' },
  '/_blob/7630cfed80c306d850baff985bb0347d': { file: '7630cfed80c306d850baff985bb0347d.jpg', out: 'angela-seated.jpg' },
  '/_blob/0aec5aeea8c112dfd09b73f7b6de48fc': { file: '0aec5aeea8c112dfd09b73f7b6de48fc.svg', out: 'logo-stacked.svg' },
  '/_blob/1074c5d00960feba8de67e9cf69ef04a': { file: '1074c5d00960feba8de67e9cf69ef04a.svg', out: 'logo-lockup.svg' },
};

const CLUSTER = '<svg width="48" height="40" viewBox="0 0 360 300" aria-hidden="true"><circle cx="268" cy="104" r="78" fill="#F1CDE2"></circle><circle cx="150" cy="156" r="118" fill="#9F7CEF"></circle><circle cx="296" cy="228" r="46" fill="#C6CD85"></circle></svg>';

const PAGES = [
  { out: 'index.html', boards: ['Home-v4', 'HomeContinued-v4'], title: 'The Gallitano Studio · Be known for who you actually are', desc: 'Executive story and presence advisory in Huntsville and Madison, Alabama. Angela Gallitano helps executives tell their story in their own words, so the leader people meet online and in the room is the one they actually are.' },
  { out: 'products/index.html', boards: ['Products-v1', 'ProductsContinued-v1'], title: 'What you\'ll own · The Gallitano Studio', desc: 'The seven Known For products: Story, LinkedIn, ExecutiveOS, Website, Look, Scorecard and Search. What each one is, why it matters, and which program includes it.' },
  { out: 'programs/index.html', boards: ['Programs-v1'], title: 'Programs · The Gallitano Studio', desc: 'Known For Executive, Accelerator, Next, Live and Corporate. Every program runs on The Known For Method. What changes is the depth, the time and who\'s in the room.' },
  { out: 'corporate/index.html', boards: ['ForSponsors-v1'], title: 'Known For Corporate · For the person paying', desc: 'Investing in one of your leaders? Outcomes, confidentiality, how progress is reported, and invoicing. Progress you can count.' },
  { out: 'founder/index.html', boards: ['Founder-v2'], title: 'My story · Angela Gallitano', desc: 'I learned to read a room long before I ever sat in a boardroom. The story behind The Gallitano Studio.' },
  { out: 'book/index.html', boards: ['Book-v2'], title: 'Book a conversation · The Gallitano Studio', desc: 'Twenty minutes. Tell me what\'s changing. We decide together if it\'s a fit.' },
  { out: 'referred/index.html', boards: ['Referred-v2'], title: 'Referred · The Gallitano Studio', desc: 'Someone you trust sent you here. Tell me who, and you\'ll get my first open slot.' },
  { out: 'accelerator/index.html', boards: ['Accelerator-v2'], title: 'Known For Accelerator · The Gallitano Studio', desc: 'For when you need it done, and done well, fast. One to two weeks, start to finish.' },
  { out: 'accelerator/one-pager/index.html', boards: ['AcceleratorOnePager-v2'], title: 'Known For Accelerator · one-pager', desc: 'The Known For Accelerator on one page: five steps, what to have ready, what you walk away with.', sheet: true, pdf: 'known-for-accelerator.pdf' },
  { out: 'live/index.html', boards: ['Live-v2'], title: 'Known For Live · The Gallitano Studio', desc: 'Leading a leadership team? I\'ll come to you. Headline, Chapter and Full Story formats for leadership teams.' },
  { out: 'five-prompts/index.html', boards: ['FivePrompts-1', 'FivePrompts-2', 'FivePrompts-3', 'FivePrompts-4', 'FivePrompts-5', 'FivePrompts-6', 'FivePrompts-7'], title: 'The Five Prompts · a free guide from The Gallitano Studio', desc: 'Whether it\'s 3am or 3pm, anyone can ask AI who you are. Five prompts to check what it says, and what to do about it.', sheet: true, pdf: 'the-five-prompts.pdf', sheetIds: true },
];

/* ---------- helpers ---------- */
function read(name) { return fs.readFileSync(path.join(SRC, name + '.dc.html'), 'utf8'); }
function must(str, from, to, label) {
  if (str.indexOf(from) < 0) throw new Error('Edit target not found: ' + label);
  return str.split(from).join(to);
}
function decodeEntities(s) { return s.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"'); }
function slice(src, a, b, label) {
  const i = src.indexOf(a); if (i < 0) throw new Error('missing ' + label + ' start');
  const j = src.indexOf(b, i + a.length); if (j < 0) throw new Error('missing ' + label + ' end');
  return src.slice(i + a.length, j);
}
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function esc(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function parseBoard(name) {
  let src = read(name);
  src = applyCopyEdits(name, src);
  const helmet = slice(src, '<helmet>', '</helmet>', 'helmet');
  const styles = [...helmet.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  let tpl = slice(src, '</helmet>', '</x-dc>', 'template').trim();
  const scriptTag = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(src);
  if (!scriptTag) throw new Error('no script in ' + name);
  let script = scriptTag[1].trim();
  return { name, styles, tpl, script };
}

function rewriteLinks(s) {
  // product in-page anchors (the two Products boards become one page)
  s = s.split("i >= 4 ? 'ProductsContinued-v1.dc.html' : '#' + ids[i]").join("'#' + ids[i]");
  for (const [k, v] of Object.entries(LINKS)) s = s.split(k).join(v);
  for (const [k, v] of Object.entries(IMAGES)) s = s.split(k).join('/assets/' + v.out);
  // nav: "Who it's for" and "The method" point to the home sections
  s = s.replace(/href="\/"( style="[^"]*">Who it's for<\/a>)/g, 'href="/#moments"$1');
  s = s.replace(/href="\/"( style="[^"]*">The method<\/a>)/g, 'href="/#method"$1');
  return s;
}

function convertImports(tpl) {
  return tpl.replace(/<dc-import name="SiteControls"([^>]*)><\/dc-import>/g, (m, attrs) => {
    const back = /back="([^"]*)"/.exec(attrs); const label = /back-label="([^"]*)"/.exec(attrs);
    const props = { back: back ? back[1] : '', backLabel: label ? decodeEntities(label[1]) : '' };
    return `<dc-mount data-component="SiteControls" data-props='${JSON.stringify(props).replace(/'/g, '&#39;')}'></dc-mount>`;
  });
}

function markRoot(tpl, sheet) {
  // the first element is the board root with a fixed width/height
  const m = /^<div style="([^"]*)"/.exec(tpl);
  if (!m) throw new Error('board root not found');
  let style = m[1];
  if (!sheet) {
    style = style.replace(/width:\s*1440px;\s*/, '').replace(/height:\s*\d+px;\s*/, '').replace(/overflow:\s*hidden;?\s*/, '');
  }
  const cls = sheet ? 'gs-sheet' : 'gs-board';
  return tpl.replace(m[0], `<div class="${cls}" style="${style}"`);
}

/* ---------- copy edits (Sept 29 to Oct 1 decisions) ---------- */
function applyCopyEdits(name, s) {
  if (name === 'Founder-v2') {
    s = must(s,
      'Most people spend their careers learning how to perform. I spent mine learning to read what’s underneath the performance. What isn’t being said. Who the room is actually waiting on.</p>',
      'Most people spend their careers learning how to perform. I spent mine learning to read what’s underneath the performance. What isn’t being said. Who the room is actually waiting on.</p>\n<p style="margin: 0; max-width: 560px; font-size: 22px; line-height: 1.5;">By the time I was across the table from CHROs and executive teams, I didn’t see titles. I saw people doing their very best inside systems that almost never asked who they were. And people could tell. So they told me things.</p>',
      'founder hero');
    s = must(s,
      "That’s how trust works at that level. I earn it, and then I protect it.',",
      "That’s how trust works at that level. I earn it, and then I protect it.',\n'Here’s how I know it worked. Customers tell me they’re thinking about leaving before they tell their boss. Executives call me about the conversation they can’t have inside their own company. People who are supposed to see me as the vendor bring me the question underneath the title instead. That doesn’t happen because I’m good at selling. It happens because they’ve watched what I do with what they tell me.',",
      'founder trust paragraph');
    s = must(s,
      "I’m proud of that work, and I still am. It just never had my name on it.',",
      "I’m proud of that work, and I still am. It just never had my name on it.',\n'It’s still happening. A few months into a new company, I was the one presenting to the whole org. Colleagues told me they were using the ideas we built together to help their own teams. Not long ago I stopped a negotiation cold, because the person across the table couldn’t actually say yes. I asked for thirty minutes with the one who could. Thirty minutes later, we had a commitment. That’s the whole method. Find who the room is waiting on. Ask.',\n'I keep a file of what people say about me when I’m not in the room. It’s the first thing I ask every client to start.',",
      'founder unnamed work paragraphs');
  }
  if (name === 'Home-v4') {
    // photo placeholder -> real portrait until the shoot
    s = must(s,
      /<div role="img" aria-label="Photo placeholder: Angela in a working session with an executive" style="position: absolute; right: 40px; top: 0; box-sizing: border-box; width: 400px; height: 528px; border-radius: 200px 200px 24px 24px; background: #F1CDE2; border: 2px dashed #3D524C; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px; text-align: center; color: #2F403B;">[\s\S]*?<\/div>\n/.exec(s)[0],
      '<img src="/_blob/7630cfed80c306d850baff985bb0347d" alt="Angela Gallitano, seated and smiling, in a sage striped shirtdress" style="position: absolute; right: 40px; top: 0; width: 400px; height: 528px; object-fit: cover; object-position: 50% 15%; border-radius: 200px 200px 24px 24px;">\n',
      'home photo slot');
  }
  if (name === 'Home-v4') {
    s = must(s,
      '<span style="font-size: 16px; line-height: 1.45;">I run every prompt, score what comes back and hand you a fix plan.</span>',
      '<span style="font-size: 16px; line-height: 1.45;">I run every prompt, score what comes back and hand you a fix plan.</span>\n<a class="gs-audit" href="/book/" style="display: inline-flex; align-items: center; gap: 6px; min-height: 44px; font-size: 16px; font-weight: 600; color: #6B4FD1; text-decoration: none;">Book the audit debrief<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>',
      'audit link');
  }
  if (name === 'Products-v1') {
    s = must(s, '<div style="position: relative; height: 420px; margin-top: 12px;">', '<div class="gs-cluster" style="position: relative; height: 420px; margin-top: 12px;">', 'cluster');
  }
  if (name === 'HomeContinued-v4') {
    const m = /<div role="img" aria-label="Photo placeholder: Angela on stage, or on-site with a leadership team" style="grid-column: span 5;[^"]*"[^>]*>[\s\S]*?<\/div>\n/.exec(s);
    if (!m) throw new Error('home continued photo slot');
    s = s.replace(m[0], '<img src="/_blob/5e1f6199900a942176555e01979d02c8" alt="Angela Gallitano outdoors in a pink fringe jacket and denim dress" style="grid-column: span 5; width: 100%; height: 480px; object-fit: cover; object-position: 40% 20%; border-radius: 220px 220px 24px 24px;">\n');
    // client quote placeholder comes out until a permission-cleared quote exists; the trust panel takes the full row
    const q = /<figure style="grid-column: span 6;[^"]*"><blockquote[\s\S]*?<\/figure>\n/.exec(s);
    if (!q) throw new Error('client quote figure');
    s = s.replace(q[0], '');
    s = must(s, '<div style="grid-column: 7 / span 6; box-sizing: border-box; padding: 36px 40px; border-radius: 24px; background: #F1CDE2;', '<div style="grid-column: span 12; box-sizing: border-box; padding: 36px 40px; border-radius: 24px; background: #F1CDE2;', 'trust panel span');
  }
  if (name === 'ForSponsors-v1') {
    s = must(s, '[CONFIRM: NDA language after attorney review]', 'If your company needs one, we handle it before we start.', 'nda');
    s = must(s, '[CONFIRM: vendor setup, PO and payment terms I can support]', 'Vendor setup, purchase orders and payment terms are part of the agreement, before we start.', 'po');
  }
  if (name === 'Book-v2') {
    const m = /<div style="grid-column: 7 \/ span 6; box-sizing: border-box; height: 600px; padding: 40px; border-radius: 24px; border: 2px dashed[\s\S]*?<\/div>\n<\/section>/.exec(s);
    if (!m) throw new Error('scheduler block');
    s = s.replace(m[0], `<div id="gs-booking" style="grid-column: 7 / span 6; box-sizing: border-box; min-height: 600px; border-radius: 24px; border: 1px solid rgba(61,82,76,0.28); background: #F4F0E0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; padding: 40px;">
<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3D524C" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>
<span style="font-family: 'Fraunces', Georgia, serif; font-size: 28px; color: #3D524C;">Pick a time that works for you.</span>
<span style="max-width: 380px; font-size: 16px; line-height: 1.5;">The calendar is loading. If it doesn’t appear, email me and I’ll send times.</span>
<a class="lift gs-mail" href="#" style="display: inline-flex; align-items: center; height: 56px; padding: 0 30px; border-radius: 999px; background: #3D524C; color: #F4F0E0; text-decoration: none; font-size: 17px; font-weight: 600;">Email me to book</a>
</div>
</section>`);
  }
  if (name === 'Referred-v2') {
    s = must(s, 'Who sent you?<input type="text" placeholder="Their name"', 'Who sent you?<input id="ref-who" type="text" placeholder="Their name"', 'ref who');
    s = must(s, 'Your name<input type="text"', 'Your name<input id="ref-name" type="text"', 'ref name');
    s = must(s, 'Your role<input type="text"', 'Your role<input id="ref-role" type="text"', 'ref role');
    s = must(s, 'Best email<input type="email"', 'Best email<input id="ref-email" type="email"', 'ref email');
    s = must(s, '<span style="grid-column: span 2; font-size: 15px; opacity: 0.8;">[FORM CONNECTS TO YOUR INBOX OR CRM]</span>\n', '', 'ref placeholder');
    s = must(s, 'Request sent. You’ll hear from me about your first open slot.', 'Your email app should have opened with the request. If it didn’t, email me directly and I’ll find you my first open slot.', 'ref sent');
    s = must(s, "return { sent: this.state.sent, send: function () { self.setState({ sent: true }); } };",
      `return { sent: this.state.sent, send: function () {
var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
var cfg = window.GS_CONFIG || {};
var body = 'Who sent me: ' + g('ref-who') + '\\nMy name: ' + g('ref-name') + '\\nMy role: ' + g('ref-role') + '\\nBest email: ' + g('ref-email') + '\\n';
var href = 'mailto:' + (cfg.contactEmail || '') + '?subject=' + encodeURIComponent('Referred: first open slot, please') + '&body=' + encodeURIComponent(body);
self.setState({ sent: true });
setTimeout(function () { try { window.location.href = href; } catch (e) {} }, 150); } };`, 'ref send');
  }
  if (name === 'AcceleratorOnePager-v2') {
    s = must(s, 'Book a 20-minute conversation: [BOOKING LINK]', 'Book a 20-minute conversation: thegallitanostudio.com/book', 'op book');
    s = must(s, 'Referred? Start here: [REFERRAL PAGE LINK]', 'Referred? Start here: thegallitanostudio.com/referred', 'op ref');
  }
  if (name === 'FivePrompts-7') {
    s = must(s, '[thegallitanostudio.com/book]', 'thegallitanostudio.com/book', 'fp url');
    const qr = fs.existsSync(path.join(ROOT, 'qr-book.svg')) ? fs.readFileSync(path.join(ROOT, 'qr-book.svg'), 'utf8') : '';
    const m = /<div role="img" aria-label="QR code placeholder"[^>]*>\[QR CODE\]<\/div>/.exec(s);
    if (!m) throw new Error('qr');
    s = s.replace(m[0], qr ? `<div role="img" aria-label="QR code for thegallitanostudio.com/book" style="flex-shrink: 0; width: 96px; height: 96px; box-sizing: border-box; border-radius: 12px; background: #F4F0E0; padding: 6px; display: flex; align-items: center; justify-content: center;">${qr}</div>` : '');
  }
  return s;
}

/* ---------- page assembly ---------- */
function registerScript(id, script) {
  return `window.__dc.register(${JSON.stringify(id)}, function (DCLogic) {\n${script}\nreturn Component;\n});`;
}

function buildPage(page) {
  const boards = page.boards.map(parseBoard);
  const siteControls = parseBoard('SiteControls');
  let styles = new Set();
  boards.forEach(b => styles.add(b.styles));
  styles.add(siteControls.styles);
  let needControls = false;
  let roots = '', templates = '', scripts = '';
  boards.forEach((b, i) => {
    let tpl = convertImports(rewriteLinks(b.tpl));
    tpl = markRoot(tpl, !!page.sheet);
    if (page.sheetIds) tpl = tpl.replace(/^<div class="gs-sheet"/, `<div id="page-${i + 1}" class="gs-sheet"`);
    if (i > 0) tpl = tpl.replace(/<dc-mount data-component="SiteControls"[^>]*><\/dc-mount>/g, ''); // one pill per page
    if (/data-component="SiteControls"/.test(tpl)) needControls = true;
    const id = 'b' + i;
    roots += `<div data-dc-root="${id}"></div>\n`;
    templates += `<template id="tpl-${id}">\n${tpl}\n</template>\n`;
    scripts += registerScript(id, rewriteLinks(b.script)) + '\n';
  });
  if (needControls) {
    templates += `<template id="tpl-SiteControls">\n${rewriteLinks(siteControls.tpl)}\n</template>\n`;
    scripts += registerScript('SiteControls', rewriteLinks(siteControls.script)) + '\n';
  }
  const canonical = SITE + '/' + page.out.replace(/index\.html$/, '');
  const sheetBar = page.sheet ? `<div class="gs-sheetbar"><a href="/" class="gs-sheetbar-home">${CLUSTER}<span>The Gallitano Studio</span></a><a class="gs-sheetbar-pdf" href="/${path.posix.dirname(page.out)}/${page.pdf}" download>Download the PDF</a></div>` : '';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="The Gallitano Studio">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/assets/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
${FONT_LINK}
<style>
${[...styles].join('\n')}
</style>
<link rel="stylesheet" href="/site.css?v=${Date.now().toString(36)}">
<script src="/config.js"></script>
</head>
<body class="${page.sheet ? 'gs-sheetpage' : ''}">
${sheetBar}
<main id="gs-main">
${roots}</main>
${templates}
<script src="/dc.js"></script>
<script>
${scripts}
window.__dc.mount();
</script>
<script src="/site.js"></script>
</body>
</html>
`;
  const outPath = path.join(OUT, page.out);
  mkdirp(path.dirname(outPath));
  fs.writeFileSync(outPath, html);
  return { page, boards };
}

/* ---------- static files ---------- */
function writeStatic() {
  mkdirp(path.join(OUT, 'assets'));
  for (const v of Object.values(IMAGES)) fs.copyFileSync(path.join(ASSETS, v.file), path.join(OUT, 'assets', v.out));
  for (const f of fs.readdirSync(path.join(ROOT, 'extra'))) fs.copyFileSync(path.join(ROOT, 'extra', f), path.join(OUT, 'assets', f));
  mkdirp(path.join(OUT, 'fonts'));
  for (const f of fs.readdirSync(path.join(ROOT, 'fonts'))) fs.copyFileSync(path.join(ROOT, 'fonts', f), path.join(OUT, 'fonts', f));
  fs.copyFileSync(path.join(ROOT, 'dc.js'), path.join(OUT, 'dc.js'));
  fs.copyFileSync(path.join(ROOT, 'site.css'), path.join(OUT, 'site.css'));
  fs.copyFileSync(path.join(ROOT, 'site.js'), path.join(OUT, 'site.js'));
  fs.copyFileSync(path.join(ROOT, 'config.js'), path.join(OUT, 'config.js'));
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 10 320 280"><circle cx="268" cy="104" r="78" fill="#F1CDE2"/><circle cx="150" cy="156" r="118" fill="#9F7CEF"/><circle cx="296" cy="228" r="46" fill="#C6CD85"/></svg>');
  fs.writeFileSync(path.join(OUT, 'CNAME'), 'thegallitanostudio.com\n');
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
  const urls = PAGES.map(p => `  <url><loc>${SITE}/${p.out.replace(/index\.html$/, '')}</loc></url>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, '404.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Not here · The Gallitano Studio</title>${FONT_LINK}<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F4F0E0;color:#2F403B;font-family:'Outfit',system-ui,sans-serif;padding:24px;text-align:center}h1{font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:clamp(40px,8vw,72px);letter-spacing:-0.03em;color:#3D524C;margin:16px 0}em{font-style:italic;font-weight:300;color:#6B4FD1}a.btn{display:inline-flex;align-items:center;height:56px;padding:0 30px;border-radius:999px;background:#3D524C;color:#F4F0E0;text-decoration:none;font-weight:600;margin-top:12px}</style></head>
<body><div>${CLUSTER}<h1>That page isn’t <em>here</em>.</h1><p style="font-size:18px">The story you’re looking for moved, or never existed. Start at the front door.</p><a class="btn" href="/">Back to the studio</a></div></body></html>
`);
  fs.writeFileSync(path.join(OUT, 'README.md'), `# thegallitanostudio.com

The live site for The Gallitano Studio, served by GitHub Pages from this repository.
Every change to the main branch goes live in about a minute.

## The one file to edit

\`config.js\` holds the booking links and the contact email. Change a value, commit, done.

## Everything else

The pages are built from the locked design boards on the homepage canvas (Home v4, Products v1,
Programs v1, the sponsor page, Founder v2, Book v2, Referred v2, Accelerator v2 and its one-pager,
Live v2, The Five Prompts), with a small runtime (\`dc.js\`) that keeps the toggles and motion working,
and a layout layer (\`site.css\`) that reflows them for tablets and phones.

To change copy or layout, change the boards, then rebuild and re-upload the whole folder.
The build tools and the steps live in the project notes (claude/site-build.md).

Fonts: Fraunces and Outfit, self-hosted under \`fonts/\` (SIL Open Font License, licenses included).
`);
}

/* ---------- run ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
mkdirp(OUT);
writeStatic();
const built = PAGES.map(buildPage);
fs.writeFileSync(path.join(ROOT, 'pages.json'), JSON.stringify(PAGES, null, 1));
console.log('built', built.length, 'pages');
for (const b of built) console.log(' ', b.page.out, b.boards.map(x => x.name).join(' + '));
