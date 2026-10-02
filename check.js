/* Render every page at desktop and phone width, report console errors,
   horizontal overflow and leftover placeholders, and save screenshots. */
'use strict';
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
const SHOTS = path.join(__dirname, 'shots');
const PAGES = JSON.parse(fs.readFileSync(path.join(__dirname, 'pages.json'), 'utf8'));
const only = process.argv[2];

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.xml': 'text/xml', '.txt': 'text/plain', '.pdf': 'application/pdf' };
function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(OUT, p);
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
      res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, () => resolve(srv));
  });
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await chromium.launch();
  const report = [];
  for (const pg of PAGES) {
    if (only && !pg.out.startsWith(only)) continue;
    for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push('pageerror: ' + e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
      page.on('requestfailed', r => { if (!/fonts\.g|cal\.com/.test(r.url())) errors.push('request failed: ' + r.url()); });
      const url = base + '/' + pg.out.replace(/index\.html$/, '');
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(900);
      const info = await page.evaluate(() => {
        const de = document.documentElement;
        const over = de.scrollWidth - de.clientWidth;
        const wide = [];
        if (over > 2) {
          document.querySelectorAll('body *').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > de.clientWidth + 2 && r.width > 40 && getComputedStyle(el).position !== 'fixed') wide.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ' ' + Math.round(r.width) + 'w right=' + Math.round(r.right) + ' :: ' + (el.getAttribute('style') || '').slice(0, 90));
          });
        }
        const text = document.body.innerText;
        const leftovers = (text.match(/\[[A-Z][A-Z :,'’a-z0-9-]{3,}\]/g) || []).filter(x => !/\[(Your|your|yourname|year|Company|Former|Health|Health System|Title|segment|topic|a board|Name|CLIENT|name)\b/.test(x));
        return { over, wide: wide.slice(0, 12), height: de.scrollHeight, leftovers: [...new Set(leftovers)].slice(0, 10), roots: document.querySelectorAll('[data-dc-root]').length, empty: [...document.querySelectorAll('[data-dc-root]')].filter(r => !r.children.length).length, dashes: (text.match(/—/g) || []).length };
      });
      const shot = path.join(SHOTS, pg.out.replace(/\//g, '_').replace('index.html', label) + '.png');
      await page.screenshot({ path: shot, fullPage: true });
      report.push({ page: pg.out, label, errors, ...info, shot });
      await ctx.close();
    }
  }
  await browser.close();
  srv.close();
  for (const r of report) {
    console.log(`\n== ${r.page} [${r.label}] height=${r.height} overflow=${r.over} roots=${r.roots} empty=${r.empty} emdashes=${r.dashes}`);
    r.errors.forEach(e => console.log('   ! ' + e));
    r.wide.forEach(w => console.log('   > ' + w));
    if (r.leftovers.length) console.log('   leftovers: ' + r.leftovers.join(' | '));
  }
})();
