"use strict";

(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopStory = window.matchMedia("(min-width: 1024px) and (min-height: 760px)");
  const mobileLayout = window.matchMedia("(max-width: 900px)");
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("menuToggle");
  const mobile = document.getElementById("mobileLinks");
  const hero = document.querySelector(".hero");
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const headerHeight = () => header?.getBoundingClientRect().height || 0;

  function closeMenu(restoreFocus = false) {
    if (!toggle || !mobile) return;
    mobile.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "메뉴 열기");
    header?.classList.remove("menu-open");
    if (restoreFocus) toggle.focus();
  }
  if (toggle && mobile) {
    toggle.addEventListener("click", () => {
      const opening = mobile.hidden;
      mobile.hidden = !opening;
      toggle.setAttribute("aria-expanded", String(opening));
      toggle.setAttribute("aria-label", opening ? "메뉴 닫기" : "메뉴 열기");
      header?.classList.toggle("menu-open", opening);
    });
    mobile.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !mobile.hidden) closeMenu(true);
    });
    document.addEventListener("click", event => {
      if (!mobile.hidden && !header.contains(event.target)) closeMenu();
    });
    mobileLayout.addEventListener("change", event => { if (!event.matches) closeMenu(); });
  }

  // Enhancement is opt-in: a script failure never hides the base document.
  const reveals = [...document.querySelectorAll("[data-reveal]")];
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    reveals.forEach(element => revealObserver.observe(element));
    root.classList.add("motion-ready");
  }

  const counters = [...document.querySelectorAll("[data-count]")];
  const formatCounter = (value, target) => target === 1988 ? String(value) : value.toLocaleString("en-US");
  let counterFrames = [];
  function finishCounters() {
    counterFrames.forEach(cancelAnimationFrame);
    counterFrames = [];
    counters.forEach(counter => { const target = Number(counter.dataset.count); counter.textContent = formatCounter(target, target); });
  }
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        if (reducedMotion.matches) return;
        const target = Number(entry.target.dataset.count);
        const start = target === 1988 ? 1980 : Math.round(target * .8);
        const startedAt = performance.now();
        entry.target.parentElement.setAttribute("aria-label", entry.target.parentElement.textContent);
        entry.target.setAttribute("aria-hidden", "true");
        function tick(now) {
          if (reducedMotion.matches) return;
          const progress = clamp((now - startedAt) / 1100);
          const value = Math.round(start + (target - start) * (1 - Math.pow(1 - progress, 3)));
          entry.target.textContent = formatCounter(value, target);
          if (progress < 1) counterFrames.push(requestAnimationFrame(tick));
        }
        counterFrames.push(requestAnimationFrame(tick));
      });
    }, { threshold: .5 });
    counters.forEach(counter => counterObserver.observe(counter));
  }

  const showcase = document.getElementById("productShowcase");
  const productButtons = [...document.querySelectorAll(".product-choice")];
  const productPanels = [...document.querySelectorAll(".product-panel")];
  function selectProduct(index) {
    productButtons.forEach((button, i) => {
      const active = index === i;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      productPanels[i].classList.toggle("is-active", active);
      productPanels[i].setAttribute("aria-hidden", String(!active));
      productPanels[i].inert = !active;
    });
    // Keep the selected product when returning from its catalog page.
    try {
      if (history.state?.wonkangProduct !== index) history.replaceState({ ...history.state, wonkangProduct: index }, "");
    } catch { /* Product browsing still works when history storage is restricted. */ }
  }
  if (showcase && productButtons.length === productPanels.length && productButtons.length) {
    const controls = showcase.querySelector(".product-controls");
    controls.setAttribute("role", "tablist");
    controls.setAttribute("aria-orientation", "vertical");
    productButtons.forEach((button, index) => {
      button.setAttribute("role", "tab");
      productPanels[index].setAttribute("role", "tabpanel");
      button.addEventListener("click", () => selectProduct(index));
      button.addEventListener("focus", () => selectProduct(index));
      button.addEventListener("pointerenter", event => {
        if (event.pointerType !== "mouse") return;
        // Do not hide a link that currently owns the keyboard focus.
        if (productPanels.some(panel => panel.contains(document.activeElement))) return;
        selectProduct(index);
      });
      button.addEventListener("keydown", event => {
        let next = index;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % productButtons.length;
        else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + productButtons.length) % productButtons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = productButtons.length - 1;
        else return;
        event.preventDefault();
        productButtons[next].focus({ preventScroll: true });
      });
    });
    const savedProduct = history.state?.wonkangProduct;
    selectProduct(Number.isInteger(savedProduct) && savedProduct >= 0 && savedProduct < productButtons.length ? savedProduct : 0);
    window.addEventListener("popstate", () => {
      const previous = history.state?.wonkangProduct;
      if (Number.isInteger(previous) && previous >= 0 && previous < productButtons.length) selectProduct(previous);
    });
    showcase.classList.add("products-ready");
  }

  const scrollTrack = document.getElementById("processScroll");
  const processStage = scrollTrack?.querySelector(".process-stage");
  const steps = [...document.querySelectorAll(".process-step")];
  const stepLinks = [...document.querySelectorAll("[data-step]")];
  let currentStep = -1;
  function activateStep(index, pinned) {
    if (index === currentStep && pinned) return;
    currentStep = index;
    steps.forEach((step, i) => {
      const active = i === index;
      step.classList.toggle("is-active", active);
      if (pinned) step.setAttribute("aria-hidden", String(!active));
      else step.removeAttribute("aria-hidden");
      step.inert = pinned && !active;
      if (active) stepLinks[i]?.setAttribute("aria-current", "step");
      else stepLinks[i]?.removeAttribute("aria-current");
    });
    scrollTrack?.style.setProperty("--process-progress", (index + 1) / Math.max(1, steps.length));
  }
  function storyEnabled() { return Boolean(scrollTrack && desktopStory.matches && !reducedMotion.matches); }
  function storyRange() { return Math.max(1, scrollTrack.offsetHeight - processStage.offsetHeight); }
  function synchronizeStory() {
    if (!scrollTrack || !steps.length) return;
    const pinned = storyEnabled();
    if (pinned) {
      const progress = clamp((headerHeight() - scrollTrack.getBoundingClientRect().top) / storyRange());
      activateStep(Math.round(progress * (steps.length - 1)), true);
    }
  }
  function configureStory() {
    if (!scrollTrack) return;
    const enabled = storyEnabled();
    scrollTrack.classList.toggle("story-ready", enabled);
    currentStep = -1;
    activateStep(0, enabled);
    synchronizeStory();
  }
  stepLinks.forEach((link, index) => link.addEventListener("click", event => {
    if (!storyEnabled()) return;
    event.preventDefault();
    const trackTop = scrollTrack.getBoundingClientRect().top + window.scrollY;
    const top = trackTop - headerHeight() + index / Math.max(1, steps.length - 1) * storyRange();
    window.scrollTo({ top, behavior: "smooth" });
  }));
  desktopStory.addEventListener("change", configureStory);
  reducedMotion.addEventListener("change", () => {
    root.classList.toggle("motion-ready", !reducedMotion.matches && "IntersectionObserver" in window);
    if (reducedMotion.matches) {
      reveals.forEach(element => element.classList.add("is-visible"));
      finishCounters();
      hero?.style.setProperty("--hero-progress", 0);
    }
    configureStory();
    scheduleScroll();
  });
  configureStory();

  // Main and catalog use their actual section positions, including direct hash entry.
  const catalogSections = [...document.querySelectorAll(".catalog-detail")];
  const navSections = ["company", "factory", "products", "certification"].map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = [...document.querySelectorAll(".gnb-link")];
  const catalogLinks = [...document.querySelectorAll("[data-catalog]")];
  let previousCatalog = "";
  function setCurrent(links, value, attribute) {
    links.forEach(link => {
      if (link.dataset[attribute] === value) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  function updateNavigation() {
    if (catalogSections.length) {
      const offset = Math.max(headerHeight() + 110, window.innerHeight * .3);
      let current = catalogSections[0].id;
      catalogSections.forEach(section => { if (section.getBoundingClientRect().top <= offset) current = section.id; });
      setCurrent(catalogLinks, current, "catalog");
      if (current !== previousCatalog) {
        previousCatalog = current;
        const link = catalogLinks.find(item => item.dataset.catalog === current);
        const rail = link?.parentElement;
        if (rail && rail.scrollWidth > rail.clientWidth) {
          const left = link.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft - (rail.clientWidth - link.clientWidth) / 2;
          rail.scrollTo({ left, behavior: reducedMotion.matches ? "auto" : "smooth" });
        }
      }
      setCurrent(navLinks, "products", "section");
    } else {
      let current = "";
      let currentTop = -Infinity;
      navSections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        if (top <= headerHeight() + 150 && top > currentTop) { current = section.id; currentTop = top; }
      });
      setCurrent(navLinks, current, "section");
    }
  }
  const statement = document.querySelector(".statement");
  let scrollPending = false;
  function synchronizeScroll() {
    scrollPending = false;
    header?.classList.toggle("is-sticky", window.scrollY > 25);
    const range = document.documentElement.scrollHeight - window.innerHeight;
    header?.style.setProperty("--reading", range > 0 ? clamp(window.scrollY / range) : 0);
    if (hero && !reducedMotion.matches) {
      hero.style.setProperty("--hero-progress", clamp(-hero.getBoundingClientRect().top / hero.offsetHeight));
    }
    if (statement) statement.classList.toggle("is-emphasized", statement.getBoundingClientRect().top < window.innerHeight * .64);
    synchronizeStory();
    updateNavigation();
  }
  function scheduleScroll() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(synchronizeScroll);
  }
  window.addEventListener("scroll", scheduleScroll, { passive: true });
  window.addEventListener("resize", scheduleScroll);
  window.addEventListener("hashchange", scheduleScroll);
  window.addEventListener("pageshow", scheduleScroll);
  if (document.fonts?.ready) document.fonts.ready.then(scheduleScroll);
  synchronizeScroll();

  // Native dialog provides focus trapping and Escape support; links work without it.
  const dialog = document.getElementById("certificateDialog");
  const dialogImage = document.getElementById("certificateImage");
  const dialogTitle = document.getElementById("certificateTitle");
  const dialogOriginal = document.getElementById("certificateOriginal");
  const dialogError = dialog?.querySelector(".dialog-image-error");
  let dialogTrigger = null;
  if (dialog && typeof dialog.showModal === "function") {
    document.querySelectorAll("[data-certificate]").forEach(link => {
      link.addEventListener("click", event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        dialogTrigger = link;
        dialogTitle.textContent = link.dataset.certificate;
        dialogImage.alt = link.dataset.certificate + " 공식 공개 인증자료";
        dialogImage.hidden = false;
        dialogError.hidden = true;
        dialogImage.src = link.href;
        dialogOriginal.href = link.dataset.original || link.href;
        dialog.showModal();
        document.body.classList.add("dialog-open");
        dialog.querySelector(".dialog-close").focus({ preventScroll: true });
      });
    });
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      dialogTrigger?.focus({ preventScroll: true });
    });
    dialogImage.addEventListener("error", () => {
      dialogImage.hidden = true;
      dialogError.hidden = false;
    });
  }

  document.querySelectorAll("img").forEach(image => {
    if (image === dialogImage) return;
    function failed() {
      const holder = image.closest("figure, .partner, .certificate-image, .hero-photo");
      if (!holder) return;
      holder.classList.add("image-failed");
      const fallback = holder.querySelector(".image-fallback");
      if (fallback) fallback.hidden = false;
    }
    image.addEventListener("error", failed, { once: true });
    if (image.complete && !image.naturalWidth) failed();
  });
})();
