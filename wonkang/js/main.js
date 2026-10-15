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
const company=[...document.querySelectorAll(".company-item")];
company.forEach(item=>{
 const control=item.querySelector(".company-toggle");
 control.addEventListener("click",()=>{
  company.forEach(other=>{
   const on=other===item;other.classList.toggle("is-open",on);
   other.querySelector(".company-toggle").setAttribute("aria-expanded",String(on));
   other.querySelector(".company-toggle .sign").textContent=on?"−":"+";
   const body=other.querySelector(".company-body");body.setAttribute("aria-hidden",String(!on));
  });
 });
});
document.querySelectorAll(".cert-button").forEach(button=>{
 button.addEventListener("click",()=>{
  document.querySelectorAll(".cert-button").forEach(other=>{
   const active=button===other;other.classList.toggle("active",active);
   other.setAttribute("aria-pressed",String(active));
  });
  button.scrollIntoView({block:"nearest",inline:"nearest",behavior:"smooth"});
 });
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
