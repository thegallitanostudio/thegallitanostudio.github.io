const { chromium } = require('playwright'); const http=require('http'); const fs=require('fs'); const path=require('path');
const OUT=path.join(__dirname,'out');
const srv=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/'))p+='index.html'; const f=path.join(OUT,p); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;} res.writeHead(200,{'content-type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.jpg':'image/jpeg','.svg':'image/svg+xml'}[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(res);});
srv.listen(0, async()=>{const base='http://127.0.0.1:'+srv.address().port; const b=await chromium.launch(); const page=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
await page.goto(base+'/'); await page.waitForTimeout(500);
const before=await page.textContent('#hook');
await page.click('button:has-text("After we work together")'); await page.waitForTimeout(1200);
const after=await page.textContent('#hook');
console.log('hook toggle changed:', before!==after, after.includes('after we work together'));
await page.click('button:has-text("3am")'); await page.waitForTimeout(300);
console.log('3am pressed:', await page.getAttribute('button:has-text("3am")','aria-pressed'));
await page.click('#li-url'); await page.keyboard.type('https://www.linkedin.com/in/angela'); await page.waitForTimeout(400);
console.log('input keeps focus+value:', await page.evaluate(()=>document.activeElement.id==='li-url'), await page.inputValue('#li-url'));
console.log('help text:', await page.textContent('#search >> text=/No email needed|Got it/'));
await page.click('button:has-text("Claude")'); await page.waitForTimeout(300);
console.log('tool switched:', (await page.textContent('#search')).includes('Paste this into Claude'));
await page.click('text=Heading to the boardroom >> nth=1').catch(()=>{}); await page.waitForTimeout(500);
// method stepper
await page.click('button:has-text("The deep dive")'); await page.waitForTimeout(300);
console.log('stepper:', (await page.textContent('#method')).includes('Step 2'));
// site controls
await page.click('.gsctl button[title="Next section"]'); await page.waitForTimeout(800);
console.log('scrolled:', await page.evaluate(()=>window.scrollY>100));
// pace toggle on home continued
const pace=await page.$('#pace button'); if(pace){await pace.click(); await page.waitForTimeout(300); console.log('pace ok');}
// products chooser
await page.goto(base+'/products/'); await page.waitForTimeout(400);
await page.click('[aria-label="Choose a program"] button:has-text("Accelerator")'); await page.waitForTimeout(600);
console.log('products chooser:', (await page.textContent('#matrix')).includes('Not included'));
await page.click('text=Known For Look >> nth=0').catch(()=>{}); await page.waitForTimeout(300);
console.log('products anchor url:', page.url());
// programs doors
await page.goto(base+'/programs/'); await page.waitForTimeout(400);
const doors=await page.$$('#doors button'); if(doors[2]){await doors[2].click(); await page.waitForTimeout(400);} console.log('doors clicked', doors.length);
// referred form
await page.goto(base+'/referred/'); await page.fill('#ref-who','Jane'); await page.fill('#ref-name','Sam'); await page.fill('#ref-email','s@x.com');
await page.click('button:has-text("Request my first open slot")'); await page.waitForTimeout(400);
console.log('referred sent msg:', (await page.textContent('form')).includes('Your email app'));
// book page
await page.goto(base+'/book/'); await page.waitForTimeout(600);
console.log('book embed host:', !!(await page.$('#gs-cal')), 'fallback link:', !!(await page.$('a[href*="cal.com"]')));
console.log('page errors:', errs);
await b.close(); srv.close();});
