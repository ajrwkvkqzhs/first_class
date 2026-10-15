"use strict";
const header=document.getElementById("siteHeader");
const toggle=document.getElementById("menuToggle");
const mobile=document.getElementById("mobileLinks");
function scrollHeader(){header.classList.toggle("is-sticky",window.scrollY>40)}
window.addEventListener("scroll",scrollHeader,{passive:true});scrollHeader();
if(toggle&&mobile){
 toggle.addEventListener("click",()=>{
  const opened=toggle.getAttribute("aria-expanded")==="true";
  toggle.setAttribute("aria-expanded",String(!opened));
  toggle.setAttribute("aria-label",opened?"메뉴 열기":"메뉴 닫기");
  mobile.hidden=opened;
 });
 mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobile.hidden=true;toggle.setAttribute("aria-expanded","false")}));
}
/* GNB is a design mockup: click animation only, never navigate/scroll. */
document.querySelectorAll(".gnb-button").forEach(button=>{
 let feedbackTimer;
 button.addEventListener("click",()=>{
  window.clearTimeout(feedbackTimer);
  button.classList.remove("is-clicked");
  void button.offsetWidth; // Re-run the short pressed animation on repeated clicks.
  button.classList.add("is-clicked");
  feedbackTimer=window.setTimeout(()=>button.classList.remove("is-clicked"),360);
 });
});
/* 1. Company: section stays in place while normal scrolling progressively
   opens the next card. Clicking a heading is the accessible fallback. */
const company=[...document.querySelectorAll(".company-item")];
const scrollTrack=document.getElementById("companyScroll");
const companyFrame=scrollTrack?.querySelector(".company-frame");
const scrollDriven=window.matchMedia("(min-width:1101px) and (min-height:881px)");
const reduceMotion=window.matchMedia("(prefers-reduced-motion:reduce)");
let selectedCompany=-1;
function activateCompany(index){
 if(!company.length||index===selectedCompany)return;
 selectedCompany=index;
 company.forEach((item,i)=>{
  const selected=i===index;
  item.classList.toggle("is-open",selected);
  item.querySelector(".company-toggle").setAttribute("aria-expanded",String(selected));
  item.querySelector(".company-toggle .sign").textContent=selected?"−":"+";
  const body=item.querySelector(".company-body");
  body.setAttribute("aria-hidden",String(!selected));
  body.inert=!selected;
 });
}
function companyScrollRange(){
 return Math.max(1,scrollTrack.offsetHeight-companyFrame.offsetHeight);
}
function synchronizeCompanyScroll(){
 if(!scrollDriven.matches||!scrollTrack||!companyFrame)return;
 const top=scrollTrack.getBoundingClientRect().top;
 const progress=Math.max(0,Math.min(1,(105-top)/companyScrollRange()));
 activateCompany(Math.min(company.length-1,Math.floor(progress*company.length)));
}
company.forEach((item,index)=>{
 const control=item.querySelector(".company-toggle");
 control.addEventListener("click",()=>{
  activateCompany(index);
  if(!scrollDriven.matches)return;
  const top=scrollTrack.getBoundingClientRect().top+window.scrollY;
  const y=top+index/(company.length-1)*companyScrollRange()-105;
  window.scrollTo({top:y,behavior:reduceMotion.matches?"instant":"smooth"});
 });
});
activateCompany(0);
let scrollPending=false;
function requestCompanySync(){
 if(scrollPending)return;
 scrollPending=true;
 requestAnimationFrame(()=>{scrollPending=false;synchronizeCompanyScroll();});
}
window.addEventListener("scroll",requestCompanySync,{passive:true});
window.addEventListener("resize",requestCompanySync);
requestCompanySync();

/* 2. Certificates: hover/focus enlarges panel, tap/click also works. */
const certificates=[...document.querySelectorAll(".cert-button")];
function activateCertificate(chosen,fromClick=false){
 certificates.forEach(item=>{
  const active=item===chosen;
  item.classList.toggle("active",active);
  item.setAttribute("aria-pressed",String(active));
 });
 if(fromClick&&window.matchMedia("(max-width:760px)").matches){
  chosen.scrollIntoView({block:"nearest",inline:"nearest",behavior:reduceMotion.matches?"instant":"smooth"});
 }
}
certificates.forEach(button=>{
 button.addEventListener("pointerenter",()=>activateCertificate(button));
 button.addEventListener("focus",()=>activateCertificate(button));
 button.addEventListener("click",()=>activateCertificate(button,true));
});
document.querySelectorAll("img[data-official]").forEach(image=>{
 const failed=()=>{
  image.closest(".hero-photo,.company-photo,.company-wide,.product-photo,.process-visual,.partner")?.classList.add("image-failed");
  image.setAttribute("data-image-status","공식 이미지 주소를 불러올 수 없음");
  if(image.closest(".partner")) image.nextElementSibling.hidden=false;
 };
 image.addEventListener("error",failed,{once:true});
 if(image.complete&&!image.naturalWidth)failed();
});
