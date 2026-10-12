const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
for(const f of process.argv.slice(2)){const p=await b.newPage({viewport:{width:816,height:1056},deviceScaleFactor:1.5});await p.goto('file:///home/claude/work/fs/'+f+'.html');await p.evaluate(()=>document.fonts.ready);
const m=await p.evaluate(()=>{const pg=document.querySelector('.page');const k=[...pg.children];const ft=k[k.length-1].getBoundingClientRect();const prev=k[k.length-2].getBoundingClientRect();return {sh:pg.scrollHeight,gapAboveFoot:Math.round(ft.top-prev.bottom),footBottom:Math.round(ft.bottom)}});console.log(f,JSON.stringify(m));
await p.screenshot({path:f+'.png'});await p.pdf({path:f+'.pdf',width:'8.5in',height:'11in',printBackground:true});}
await b.close()})()
