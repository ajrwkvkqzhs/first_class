"use strict";

(() => {
  const body = document.body;
  const header = document.getElementById("siteHeader");
  const menu = document.getElementById("megaMenu");
  const navLinks = [...document.querySelectorAll("[data-menu]")];
  const toggle = document.getElementById("menuToggle");
  const mobile = document.getElementById("mobileLinks");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const wide = matchMedia("(min-width:360px) and (min-height:720px)");
  const small = matchMedia("(max-width:900px)");
  const clamp = (value, min=0, max=1) => Math.max(min, Math.min(max,value));
  let closeTimer;
  let lastMenu = navLinks[0];
  let restoringMenuFocus = false;

  function closeMega(restoreFocus=false) {
    clearTimeout(closeTimer);
    header.classList.remove("mega-open");
    if (menu) { menu.inert=true; menu.setAttribute("aria-hidden","true"); }
    navLinks.forEach(link => link.setAttribute("aria-expanded","false"));
    if (restoreFocus) {
      restoringMenuFocus=true;
      lastMenu?.focus({preventScroll:true});
      restoringMenuFocus=false;
    }
  }
  function openMega(link) {
    if (small.matches || !menu) return;
    clearTimeout(closeTimer);
    lastMenu=link;
    header.classList.add("mega-open");
    menu.inert=false;
    menu.setAttribute("aria-hidden","false");
    navLinks.forEach(item => item.setAttribute("aria-expanded",String(item===link)));
    menu.querySelectorAll("[data-column]").forEach(column => column.classList.toggle("is-active",column.dataset.column===link.dataset.menu));
  }
  navLinks.forEach(link => {
    link.addEventListener("pointerenter",event => { if(event.pointerType!=="touch") openMega(link); });
    link.addEventListener("focus",()=>{if(!restoringMenuFocus)openMega(link);});
    link.addEventListener("click",()=>closeMega());
  });
  header.addEventListener("pointerenter",()=>clearTimeout(closeTimer));
  header.addEventListener("pointerleave",()=>{ closeTimer=setTimeout(()=>closeMega(),160); });
  header.addEventListener("focusout",event=>{ if(!header.contains(event.relatedTarget)) closeMega(); });
  menu?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>closeMega()));

  function closeMobile(restoreFocus=false) {
    if(!mobile || !toggle) return;
    mobile.hidden=true;
    header.classList.remove("mobile-open");
    toggle.setAttribute("aria-expanded","false");
    toggle.setAttribute("aria-label","메뉴 열기");
    if(restoreFocus) toggle.focus({preventScroll:true});
  }
  toggle?.addEventListener("click",()=>{
    const opening=mobile.hidden;
    mobile.hidden=!opening;
    header.classList.toggle("mobile-open",opening);
    toggle.setAttribute("aria-expanded",String(opening));
    toggle.setAttribute("aria-label",opening?"메뉴 닫기":"메뉴 열기");
  });
  mobile?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>closeMobile()));
  document.addEventListener("keydown",event=>{
    if(event.key!=="Escape") return;
    if(mobile&&!mobile.hidden) closeMobile(true);
    else if(header.classList.contains("mega-open")) closeMega(true);
  });
  document.addEventListener("pointerdown",event=>{
    if(!header.contains(event.target)) { closeMega(); closeMobile(); }
  });
  small.addEventListener("change",()=>{closeMega();closeMobile();});

  // The original company accordion remains the only pinned scroll narrative.
  const track=document.getElementById("companyScroll");
  const frame=track?.querySelector(".company-frame");
  const company=[...document.querySelectorAll(".company-item")];
  let companyIndex=-1;
  let manualTarget=null;
  function activateCompany(index) {
    if(index===companyIndex) return;
    companyIndex=index;
    company.forEach((item,i)=>{
      const selected=i===index;
      item.classList.toggle("is-open",selected);
      const control=item.querySelector(".company-toggle");
      const panel=item.querySelector(".company-body");
      panel.id="company-panel-"+(i+1);
      control.setAttribute("aria-controls",panel.id);
      control.setAttribute("aria-expanded",String(selected));
      control.querySelector(".sign").textContent=selected?"−":"+";
      panel.setAttribute("aria-hidden",String(!selected));
      panel.inert=!selected;
    });
  }
  function configureCompany() {
    if(!track||!frame) return;
    track.classList.remove("is-scroll-driven");
    track.style.removeProperty("--company-panel-height");
    const pinTop=small.matches?94:102;
    // Two panels may be animating at once when fonts or the viewport change.
    // Remove every panel's current height to measure the stable accordion rows.
    const panels=[...frame.querySelectorAll(".company-body")];
    const chrome=frame.getBoundingClientRect().height-panels.reduce((sum,panel)=>sum+panel.getBoundingClientRect().height,0);
    const mobilePanel=innerWidth<=600;
    const panelHeight=Math.min(mobilePanel?440:350,innerHeight-pinTop-28-chrome);
    const minimumPanel=mobilePanel?Math.max(360,...company.map(item=>item.querySelector('.company-copy').getBoundingClientRect().height+120)):260;
    const enabled=wide.matches&&!reduce.matches&&panelHeight>=minimumPanel;
    if(enabled){
      track.style.setProperty("--company-panel-height",panelHeight+"px");
      track.style.setProperty("--company-pin-top",pinTop+"px");
      track.classList.add("is-scroll-driven");
    }
    track.style.setProperty("--company-frame-height",frame.getBoundingClientRect().height+"px");
    manualTarget=null;
    scheduleScroll();
  }
  function companyRange() {return Math.max(1,track.offsetHeight-frame.offsetHeight);}
  function synchronizeCompany() {
    if(!track?.classList.contains("is-scroll-driven")) return;
    if(manualTarget) {
      if(Math.abs(scrollY-manualTarget.y)>3&&performance.now()<manualTarget.until) return;
      manualTarget=null;
    }
    const pinTop=small.matches?94:102;
    const progress=clamp((pinTop-track.getBoundingClientRect().top)/companyRange());
    frame.style.setProperty("--company-progress",progress);
    activateCompany(Math.round(progress*(company.length-1)));
  }
  company.forEach((item,index)=>item.querySelector(".company-toggle").addEventListener("click",()=>{
    activateCompany(index);
    if(!track.classList.contains("is-scroll-driven")) return;
    const y=track.getBoundingClientRect().top+scrollY-(small.matches?94:102)+index/Math.max(1,company.length-1)*companyRange();
    manualTarget={y,until:performance.now()+1400};
    window.scrollTo({top:y,behavior:reduce.matches?"instant":"smooth"});
  }));
  window.addEventListener("wheel",()=>{manualTarget=null;},{passive:true});
  window.addEventListener("touchstart",()=>{manualTarget=null;},{passive:true});
  window.addEventListener("keydown",event=>{if(["PageDown","PageUp","Home","End","ArrowDown","ArrowUp"].includes(event.key))manualTarget=null;});
  activateCompany(0);
  wide.addEventListener("change",configureCompany);

  // Entry motion does not alter the alternating layout or the four-card product grid.
  const revealTargets=[...document.querySelectorAll(".process-step,.product-card,.manifesto")];
  if("IntersectionObserver" in window) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }),{threshold:.1,rootMargin:"0px 0px -20px 0px"});
    revealTargets.forEach(element=>observer.observe(element));
    if(!reduce.matches) body.classList.add("motion-ready");
  }

  const counters=[...document.querySelectorAll("[data-count]")];
  const counterFrames=new Map();
  const format=(value,target)=>target===1988?String(value):value.toLocaleString("en-US");
  if("IntersectionObserver" in window) {
    const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      if(reduce.matches) return;
      const target=Number(entry.target.dataset.count);
      const start=target===1988?1980:0;
      const started=performance.now();
      entry.target.parentElement.setAttribute("aria-label",entry.target.parentElement.textContent);
      entry.target.setAttribute("aria-hidden","true");
      function tick(now) {
        if(reduce.matches) return;
        const progress=clamp((now-started)/1050);
        entry.target.textContent=format(Math.round(start+(target-start)*(1-Math.pow(1-progress,3))),target);
        if(progress<1) counterFrames.set(entry.target,requestAnimationFrame(tick));
        else counterFrames.delete(entry.target);
      }
      counterFrames.set(entry.target,requestAnimationFrame(tick));
    }),{threshold:.65});
    counters.forEach(counter=>counterObserver.observe(counter));
  }

  // Keep the reference's horizontal A4 accordion. Links open the official detail.
  const certificates=[...document.querySelectorAll(".cert-button")];
  const certRail=document.getElementById("certAccordion");
  function bringCertificateIntoView(chosen) {
    if(!certRail||certRail.scrollWidth<=certRail.clientWidth) return;
    const left=chosen.getBoundingClientRect().left-certRail.getBoundingClientRect().left+certRail.scrollLeft;
    certRail.scrollTo({left,behavior:reduce.matches?"instant":"smooth"});
  }
  function activateCertificate(chosen) {
    certificates.forEach(panel=>{
      const selected=panel===chosen;
      panel.classList.toggle("active",selected);
      if(selected) panel.setAttribute("aria-current","true");
      else panel.removeAttribute("aria-current");
      panel.querySelector(".cert-detail")?.setAttribute("aria-hidden",String(!selected));
    });
    if(reduce.matches) bringCertificateIntoView(chosen);
  }
  certificates.forEach((panel,index)=>{
    panel.addEventListener("pointerenter",event=>{if(event.pointerType!=="touch")activateCertificate(panel);});
    panel.addEventListener("focus",()=>activateCertificate(panel));
    panel.addEventListener("pointerdown",()=>activateCertificate(panel));
    panel.addEventListener("transitionend",event=>{if(event.propertyName.startsWith("flex")&&panel.classList.contains("active"))bringCertificateIntoView(panel);});
    panel.addEventListener("keydown",event=>{
      if(event.key!=="ArrowRight"&&event.key!=="ArrowLeft")return;
      event.preventDefault();
      const next=(index+(event.key==="ArrowRight"?1:-1)+certificates.length)%certificates.length;
      certificates[next].focus({preventScroll:true});
    });
  });
  if(certificates.length) activateCertificate(certificates[0]);

  const sections=["company","numbers","products","factory","certification","partners"].map(id=>document.getElementById(id)).filter(Boolean);
  const hero=document.querySelector(".hero");
  let pending=false;
  function synchronizeScroll() {
    pending=false;
    header.classList.toggle("is-sticky",scrollY>40);
    const range=document.documentElement.scrollHeight-innerHeight;
    header.style.setProperty("--reading",range>0?clamp(scrollY/range):0);
    if(hero&&!reduce.matches)hero.style.setProperty("--hero-progress",clamp(-hero.getBoundingClientRect().top/hero.offsetHeight));
    if(!reduce.matches)document.querySelectorAll(".process-step").forEach(step=>{
      const rect=step.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight)return;
      const progress=clamp((innerHeight-rect.top)/(innerHeight+rect.height));
      step.style.setProperty("--image-shift",((progress-.5)*36).toFixed(2)+"px");
    });
    let active="";
    sections.forEach(section=>{if(section.getBoundingClientRect().top<=180)active=section.id;});
    const group={company:"company",numbers:"company",partners:"company",products:"products",factory:"factory",certification:"factory"}[active];
    navLinks.forEach(link=>{if(link.dataset.menu===group)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});
    synchronizeCompany();
  }
  function scheduleScroll() {if(!pending){pending=true;requestAnimationFrame(synchronizeScroll);}}
  window.addEventListener("scroll",scheduleScroll,{passive:true});
  let resizeTimer;
  window.addEventListener("resize",()=>{scheduleScroll();clearTimeout(resizeTimer);resizeTimer=setTimeout(configureCompany,180);});
  window.addEventListener("pageshow",scheduleScroll);
  reduce.addEventListener("change",()=>{
    body.classList.toggle("motion-ready",!reduce.matches&&"IntersectionObserver" in window);
    if(reduce.matches){
      revealTargets.forEach(element=>element.classList.add("is-visible"));
      counterFrames.forEach(cancelAnimationFrame);counterFrames.clear();
      counters.forEach(counter=>{const n=Number(counter.dataset.count);counter.textContent=format(n,n);});
      hero?.style.setProperty("--hero-progress",0);
    }
    configureCompany();
  });
  if(document.fonts?.ready)document.fonts.ready.then(configureCompany);
  configureCompany();
  synchronizeScroll();

  document.querySelectorAll(".partner").forEach(partner=>{
    const name=partner.querySelector("img")?.alt.replace(/ 로고$/,"");
    if(name){partner.title=name;partner.tabIndex=0;partner.setAttribute("aria-label",name);}
  });
  document.querySelectorAll("img").forEach(image=>{
    function failed(){
      const holder=image.closest(".hero-photo,.company-photo,.company-wide,.product-photo,.process-visual,.partner,.catalog-photo");
      holder?.classList.add("image-failed");
      const fallback=holder?.querySelector("span[hidden]");
      if(fallback)fallback.hidden=false;
    }
    image.addEventListener("error",failed,{once:true});
    if(image.complete&&!image.naturalWidth)failed();
  });
})();
