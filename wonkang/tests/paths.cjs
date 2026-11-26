/* Read-only static QA for Cloudflare deployment. Node built-ins only. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const docs = [
 'index.html','company/about.html','company/achievements.html','company/partners.html',
 'company/certifications.html','company/directions.html','company/ci.html',
 'factory/locations.html','factory/process.html','factory/technology.html',
 'factory/equipment.html','factory/certifications.html','products/index.html',
 'products/general.html','products/pressure.html','products/valve.html','products/machinery.html','customer/contact.html','customer/catalog.html'
].map(name=>'wonkang/'+name);
const subpages=docs.filter(name=>name!=='wonkang/index.html');
const cssFiles=[
 'wonkang/css/main.css','wonkang/css/subpage.css','wonkang/css/subpage-layout.css','wonkang/customer/customer.css','wonkang/company/about.css',
 'wonkang/company/ci.css','wonkang/products/products.css','CSS/default.css','font/default/css/notosanskr.css'
];
const jsFiles=['wonkang/js/main.js','wonkang/js/subpage.js','wonkang/js/subpage-layout.js','wonkang/customer/customer.js','wonkang/company/about.js','wonkang/products/products.js'];
const errors=[];
let localReferences=0,cssAssets=0,anchors=0;
const exists=rel=>fs.existsSync(path.join(root,rel));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const external=val=>/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(val);
function destination(file,href){
 const name=href.split(/[?#]/)[0];
 if(!name)return file;
 return path.posix.normalize(path.posix.join(path.posix.dirname(file),name.replace(/^\/+/,'')));
}
const idCache=new Map();
function ids(file){
 if(!idCache.has(file)){
  const t=exists(file)?read(file):'';
  const arr=[...t.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m=>m[1]);
  if(arr.length!==new Set(arr).size)errors.push(file+': duplicate IDs');
  idCache.set(file,new Set(arr));
 }
 return idCache.get(file);
}
for(const file of docs){
 if(!exists(file)){errors.push('missing HTML: '+file);continue;}
 const html=read(file);
 ids(file);
 const gnb=html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0]||'';
 const utility=html.match(/<a class="site-support"[^>]*href="([^"]+)"[^>]*>고객문의<\/a>/);
 if((gnb.match(/class="site-nav__group"/g)||[]).length!==3||gnb.includes('nav-customer'))errors.push(file+': expected three primary GNB groups');
 if(!utility||destination(file,utility[1])!=='wonkang/customer/contact.html')errors.push(file+': missing customer utility link');
 if(subpages.includes(file)){
  const banner=html.match(/<section\b[^>]*class="[^"]*\bsubpage-banner\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0]||'';
  const nav=banner.match(/<nav class="subpage-depth"[\s\S]*?<\/nav>/)?.[0]||'';
  const dropdown=nav.match(/<details class="subpage-depth__dropdown"[\s\S]*?<\/details>/)?.[0]||'';
  if(!dropdown.includes('<summary>')||!dropdown.includes('<ul>'))errors.push(file+': missing integrated depth menu');
  if(!html.includes('subpage-layout.css')||!html.includes('subpage-layout.js'))errors.push(file+': missing shared subpage assets');
  const group=path.posix.dirname(file);
  const expected=subpages.filter(page=>path.posix.dirname(page)===group);
  const links=[...dropdown.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(m=>({href:m[1].match(/href="([^"]+)"/)?.[1],current:/aria-current="page"/.test(m[1]),label:m[2].trim()}));
  const destinations=links.map(link=>destination(file,link.href||''));
  if(destinations.length!==expected.length||new Set(destinations).size!==expected.length||expected.some(page=>!destinations.includes(page)))errors.push(file+': inconsistent depth menu destinations');
  const selected=links.filter(link=>link.current);
  if(selected.length!==1||destination(file,selected[0]?.href||'')!==file)errors.push(file+': selected depth link mismatch');
  const heading=banner.match(/<h1\b[^>]*>([^<]+)<\/h1>/)?.[1]?.trim();
  const summary=dropdown.match(/<summary>([^<]+)/)?.[1]?.trim();
  if(!heading||heading!==summary||heading!==selected[0]?.label)errors.push(file+': inconsistent page title and depth label');
  if(/<nav class="(?:detail-siblings|depth-nav|about-section-nav|customer-catalog-nav)"/.test(html))errors.push(file+': duplicate or legacy subpage navigation');
 }
 for(const m of html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/g)){
  const href=m[2].trim();
  if(!href||external(href))continue;
  localReferences++;
  const target=destination(file,href);
  if(!exists(target)){errors.push(file+': missing resource '+href+' -> '+target);continue;}
  const fragment=href.includes('#')?href.slice(href.indexOf('#')+1):'';
  if(fragment&&target.endsWith('.html')){
   anchors++;
   try{if(!ids(target).has(decodeURIComponent(fragment)))errors.push(file+': missing anchor '+href);}
   catch{errors.push(file+': malformed anchor '+href);}
  }
 }
}
for(const file of cssFiles){
 if(!exists(file)){errors.push('missing CSS: '+file);continue;}
 const css=read(file);
 for(const m of css.matchAll(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g)){
  const href=m[1];
  if(!href||external(href)||href.startsWith('#'))continue;
  cssAssets++;
  const target=destination(file,href);
  if(!exists(target))errors.push(file+': missing CSS url '+href+' -> '+target);
 }
}
for(const file of jsFiles){
 if(!exists(file)){errors.push('missing JS: '+file);continue;}
 const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});
 if(result.status!==0)errors.push(file+': JS syntax: '+result.stderr.trim());
}
console.log(JSON.stringify({pages:docs.length,localReferences,anchors,cssAssets,jsFiles:jsFiles.length,errors},null,2));
if(errors.length)process.exitCode=1;
