/* Run with Node 18+ and Playwright installed:
 *   node wonkang/tests/navigation-smoke.cjs
 * Set PLAYWRIGHT_CHANNEL=chromium if Edge is not installed.
 * Read-only smoke check: does not change site content or repository files.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '../..');
const paths = [
  'index.html','company/about.html','company/achievements.html','company/partners.html',
  'company/certifications.html','company/directions.html','company/ci.html',
  'factory/locations.html','factory/process.html','factory/technology.html',
  'factory/equipment.html','factory/certifications.html',
  'products/index.html','products/general.html','products/pressure.html',
  'products/valve.html','products/machinery.html'
];
const homePaths = {
  'nav-company': 'company/about.html',
  'nav-factory': 'factory/locations.html',
  'nav-products': 'products/index.html'
};
async function serve() {
  const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
    '.js':'application/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg',
    '.svg':'image/svg+xml','.woff2':'font/woff2' };
  const server = http.createServer((req,res)=>{
    let requested;
    try { requested = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
    catch { res.writeHead(400).end(); return; }
    const file = path.resolve(root, '.' + requested + (requested.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file,(err,data)=>{
      if(err){ res.writeHead(404).end(); return; }
      res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise((resolve)=>server.listen(0,'127.0.0.1',resolve));
  return { server, base:'http://127.0.0.1:'+server.address().port+'/wonkang/' };
}
(async()=>{
  const {server,base}=await serve();
  const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const issues=[];
  let tested=0;
  try {
    for(const width of [1440,768,390]){
      for(const url of paths){
        const page=await browser.newPage({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});
        const errors=[];const resources=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))resources.push(r.url()+' '+r.status());});
        try{
          await page.goto(base+url,{waitUntil:'networkidle',timeout:30000});
          assert.equal(await page.locator('h1').count(),1,'exactly one H1');
          assert.equal(await page.locator('.site-header.nav-ready').count(),1,'navigation initialized');
          const summary=await page.evaluate(()=>{
            const full=document.documentElement.scrollWidth;
            const imgs=[...document.querySelectorAll('img')];
            for(const image of imgs)image.loading='eager';
            return {width:innerWidth,scrollWidth:full,heading:document.querySelector('h1')?.textContent};
          });
          assert.ok(summary.scrollWidth<=summary.width+2,'horizontal overflow: '+summary.scrollWidth+' > '+summary.width);
          for(const [id,destination] of Object.entries(homePaths)){
            const link=page.locator('#'+id);
            assert.equal(await link.count(),1,'top-level link '+id);
            const target=new URL(await link.getAttribute('href'),base+url).pathname;
            assert.ok(target.endsWith('/wonkang/'+destination),'wrong top-level href '+id+': '+target);
            assert.equal(await page.locator('.site-nav__expand[aria-controls="submenu-'+id.slice(4)+'"]').count(),1,'disclosure missing');
          }
          if(width>850){
            await page.locator('#nav-company').hover();
            assert.equal(await page.locator('#submenu-company').isVisible(),true,'desktop hover expands submenu');
            await page.mouse.move(1,500);
          }else{
            await page.getByRole('button',{name:'전체 메뉴 펼치기'}).click();
            assert.equal(await page.locator('#main-navigation').isVisible(),true,'hamburger opens');
            const disclosure=page.locator('.site-nav__expand[aria-controls="submenu-factory"]');
            await disclosure.click();
            assert.equal(await page.locator('#submenu-factory').isVisible(),true,'disclosure expands');
            assert.match(await disclosure.getAttribute('aria-label'),/접기/,'expanded accessible name');
            await disclosure.click();
            assert.equal(await page.locator('#submenu-factory').isVisible(),false,'disclosure collapses');
            assert.match(await disclosure.getAttribute('aria-label'),/펼치기/,'closed accessible name');
          }
          assert.deepEqual(errors,[],'JS runtime errors');
          assert.deepEqual(resources,[],'HTTP 4xx/5xx resources');
          tested++;
        }catch(error){issues.push({page:url,width,error:String(error),errors,resources});}
        finally{await page.close();}
      }
    }
    const product=await browser.newPage({viewport:{width:390,height:844}});
    try{
      for(const item of ['general','pressure','valve','machinery']){
        await product.goto(base+'products/index.html#'+item,{waitUntil:'networkidle'});
        assert.equal(await product.locator('#'+item).count(),1,'missing deep-link target');
        assert.equal(await product.locator('#tab-'+item).getAttribute('aria-selected'),'true','tab not selected for '+item);
        assert.equal(await product.locator('#panel-'+item).isVisible(),true,'panel not visible');
      }
      await product.goto(base+'products/index.html',{waitUntil:'networkidle'});
      const fallback=await product.locator('[data-product-link="general"]').getAttribute('href');
      assert.equal(fallback,'general.html','product card lacks static fallback link');
      tested+=5;
    }catch(err){issues.push({page:'products/index.html',test:'hash-routing',error:String(err)});}
    await product.close();
    const noJs=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
    try {
      await noJs.goto(base+'index.html',{waitUntil:'domcontentloaded'});
      assert.equal(await noJs.locator('.site-nav').isVisible(),true,'no-JS navigation hidden');
      assert.equal(await noJs.locator('#submenu-company').isVisible(),true,'no-JS submenu hidden');
      tested++;
    }catch(err){issues.push({page:'index.html',test:'no-JS-fallback',error:String(err)});}
    await noJs.close();
  }finally{await browser.close();server.close();}
  console.log(JSON.stringify({pages:paths.length,widths:[1440,768,390],testsPassed:tested,issues},null,2));
  if(issues.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
