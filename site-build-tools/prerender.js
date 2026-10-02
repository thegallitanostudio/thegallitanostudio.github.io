/* Pre-render each page's roots into static HTML (for no-JS visitors and link previews)
   and print the letter-size sheets to PDF. Run after build.js. */
'use strict';
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
const PAGES = JSON.parse(fs.readFileSync(path.join(__dirname, 'pages.json'), 'utf8'));
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(OUT, p);
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await chromium.launch();
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const url = base + '/' + pg.out.replace(/index\.html$/, '');
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const roots = await page.evaluate(() => [...document.querySelectorAll('[data-dc-root]')].map(r => ({ id: r.getAttribute('data-dc-root'), html: r.innerHTML })));
    const file = path.join(OUT, pg.out);
    let html = fs.readFileSync(file, 'utf8');
    for (const r of roots) {
      const empty = `<div data-dc-root="${r.id}"></div>`;
      if (html.indexOf(empty) < 0) throw new Error('root not found ' + r.id + ' in ' + pg.out);
      html = html.replace(empty, `<div data-dc-root="${r.id}">${r.html}</div>`);
    }
    fs.writeFileSync(file, html);
    if (pg.sheet && pg.pdf) {
      await page.emulateMedia({ media: 'print' });
      const pdfPath = path.join(OUT, path.dirname(pg.out), pg.pdf);
      await page.pdf({ path: pdfPath, width: '8.5in', height: '11in', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      console.log('pdf', pdfPath, fs.statSync(pdfPath).size);
    }
    console.log('prerendered', pg.out, roots.map(r => r.html.length).join('+'));
    await ctx.close();
  }
  await browser.close();
  srv.close();
})();
