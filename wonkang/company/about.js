// 회사소개 서브페이지: 기존 main.js에서 헤더/GNB 로직만 분리해 재사용합니다.
// 메인 전용 카드·인증서·숫자 애니메이션은 이 페이지에서 실행하지 않습니다.
'use strict';
function initializeNavigation() {
    const header = document.querySelector('.site-header');
    const hero = document.querySelector('.about-hero');
    const logo = header.querySelector('.site-logo');
    const navigation = header.querySelector('.site-nav');
    const groups = [...navigation.querySelectorAll('.site-nav__group')];
    const buttons = groups.map((group) => group.querySelector('.site-nav__expand'));
    const topLinks = groups.map((group) => group.querySelector('.site-nav__item'));
    const submenus = groups.map((group) => group.querySelector('.site-nav__submenu'));
    const toggle = header.querySelector('.menu-toggle');
    const compact = window.matchMedia('(max-width: 850px)');
    const narrow = window.matchMedia('(max-width: 600px)');
    let activeButton = topLinks[0];
    let scrollReference = Math.max(0, window.scrollY);
    let scrollHidesHeader = false;
    let pointerNearHeader = false;

    function hasKeyboardFocusInside() {
        return header.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    }

    function updateHeaderVisibility() {
        const keepVisible =
            window.scrollY <= logo.offsetHeight ||
            pointerNearHeader ||
            header.classList.contains('mega-open') ||
            hasKeyboardFocusInside();
        header.classList.toggle('is-hidden', scrollHidesHeader && !keepVisible);
    }

    function updateHeaderAppearance() {
        // 다음 영역이 고정 헤더에 닿는 순간 밝은 배경으로 전환합니다.
        header.classList.toggle('is-scrolled', hero.getBoundingClientRect().bottom <= logo.offsetHeight);
    }

    function updateHeaderOnScroll() {
        // 화면 끝의 튕김과 작은 흔들림을 제외하고 8px 이동으로 방향을 판단합니다.
        const scrollTop = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - innerHeight));
        const distance = scrollTop - scrollReference;
        if (scrollTop <= logo.offsetHeight) {
            scrollHidesHeader = false;
            scrollReference = scrollTop;
        } else if (Math.abs(distance) >= 8) {
            scrollHidesHeader = distance > 0;
            scrollReference = scrollTop;
        }
        updateHeaderAppearance();
        updateHeaderVisibility();
    }

    function setGroupOpen(index, open) {
        groups[index].classList.toggle('is-expanded', open);
        buttons[index].setAttribute('aria-expanded', String(open));
        submenus[index].inert = !open;
    }

    function setMenuOpen(open) {
        header.classList.toggle('mega-open', open);
        groups.forEach((group, index) => setGroupOpen(index, open && !compact.matches));
        navigation.inert = compact.matches && !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '전체 메뉴 접기' : '전체 메뉴 펼치기');
        updateHeaderVisibility();
    }

    // The category name is a real link. Only the separate disclosure button expands a category on mobile.
    groups.forEach((group, index) => {
        const button = buttons[index];
        const link = topLinks[index];

        button.addEventListener('click', () => {
            activeButton = button;
            if (!compact.matches) return;
            const nextOpen = button.getAttribute('aria-expanded') !== 'true';
            if (!header.classList.contains('mega-open')) setMenuOpen(true);
            setGroupOpen(index, nextOpen);
        });

        // Keyboard users can open the desktop megamenu from the top-level link.
        [link, button].forEach((control) => {
            control.addEventListener('keydown', (event) => {
                if (event.key !== 'ArrowDown') return;
                event.preventDefault();
                activeButton = control;
                if (!header.classList.contains('mega-open')) setMenuOpen(true);
                setGroupOpen(index, true);
                const first = submenus[index].querySelector('a');
                if (first) first.focus();
            });
        });

        group.addEventListener('focusin', (event) => {
            activeButton = event.target instanceof HTMLElement ? event.target : link;
            if (!compact.matches && event.target.matches(':focus-visible')) {
                setMenuOpen(true);
            }
        });
    });

    navigation.addEventListener('mouseenter', () => {
        if (!compact.matches) setMenuOpen(true);
    });

    header.addEventListener('mouseleave', () => {
        if (!compact.matches && !hasKeyboardFocusInside()) setMenuOpen(false);
    });

    header.addEventListener('focusin', updateHeaderVisibility);
    header.addEventListener('focusout', (event) => {
        if (!header.contains(event.relatedTarget)) setMenuOpen(false);
    });

    document.addEventListener(
        'pointermove',
        (event) => {
            if (event.pointerType !== 'mouse') return;
            const nearHeader = event.clientY <= logo.offsetHeight + 16 || header.contains(event.target);
            if (nearHeader === pointerNearHeader) return;
            pointerNearHeader = nearHeader;
            updateHeaderVisibility();
        },
        { passive: true }
    );
    document.addEventListener('pointerout', (event) => {
        if (event.pointerType !== 'mouse' || event.relatedTarget !== null) return;
        pointerNearHeader = false;
        updateHeaderVisibility();
    });

    toggle.addEventListener('click', () => setMenuOpen(!header.classList.contains('mega-open')));
    logo.addEventListener('click', () => setMenuOpen(false));

    navigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
            const target = link.hash && link.pathname === window.location.pathname ? document.getElementById(link.hash.slice(1)) : null;
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) setMenuOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !header.classList.contains('mega-open')) return;
        setMenuOpen(false);
        (compact.matches ? toggle : activeButton).focus();
    });

    compact.addEventListener('change', () => setMenuOpen(false));
    narrow.addEventListener('change', () => setMenuOpen(false));
    window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
    const headerAppearanceObserver = new ResizeObserver(() => {
        updateHeaderAppearance();
        updateHeaderVisibility();
    });
    headerAppearanceObserver.observe(hero);
    headerAppearanceObserver.observe(logo);
    updateHeaderAppearance();
    setMenuOpen(false);
}

initializeNavigation();

// 기존 푸터의 안내 대화상자와 접근성 동작을 동일하게 유지합니다.
const detailDialog = document.querySelector('#detail-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogBody = document.querySelector('#dialog-body');
let lastTrigger = null;
const notices = {
    privacy: ['개인정보 취급방침', '개인정보 취급방침 원문은 원강금속에 문의해 주세요.'],
    email: ['이메일 무단수집거부', '현재 이 웹사이트에는 확인된 이메일 연락처를 게시하지 않습니다.']
};
function closeDetail() { if (detailDialog.open) detailDialog.close(); }
document.querySelector('.dialog-close').addEventListener('click', closeDetail);
detailDialog.addEventListener('click', (event) => {
    const rect = detailDialog.getBoundingClientRect();
    if (event.target === detailDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDetail();
});
detailDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({preventScroll: true});
});
document.querySelectorAll('[data-info]').forEach(button => {
    button.addEventListener('click', () => {
        const info = notices[button.dataset.info];
        if (!info) return;
        lastTrigger = button;
        dialogTitle.textContent = info[0];
        dialogBody.replaceChildren();
        const description = document.createElement('p');
        description.textContent = info[1];
        dialogBody.append(description);
        detailDialog.showModal();
        document.body.classList.add('dialog-open');
        document.querySelector('.dialog-close').focus();
    });
});


// 서브페이지 목차: 선택된 섹션(aria-current)과 키보드 포커스는 서로 다른 상태입니다.
// 기존 구현은 부드러운 앵커 이동 중에도 스크롤 이벤트가 이전 섹션을 다시 활성화했고,
// 고정 헤더가 숨을 때 기준선이 달라져 이전 메뉴에 밑줄이 남을 수 있었습니다.
const sectionNavigation = document.querySelector('.about-section-nav');
const sectionLinks = [...sectionNavigation.querySelectorAll('a[href^="#"]')];
const sectionPairs = sectionLinks.map(link => ({
    link,
    section: document.getElementById(link.hash.slice(1))
})).filter(({section}) => Boolean(section));
let sectionUpdateScheduled = false;
let activeSectionId = null;
let pendingSectionId = null;
let navigationSettledTimer = null;

function setActiveSection(id) {
    if (activeSectionId === id) return;
    activeSectionId = id;
    for (const {link, section} of sectionPairs) {
        if (section.id === id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    }
}

function getReadingLine() {
    // 화면에서 실제 차지하는 고정 목차의 하단을 사용합니다.
    const navBottom = sectionNavigation.getBoundingClientRect().bottom;
    // html의 scroll-padding-top + 섹션의 scroll-margin-top은 브라우저의
    // 앵커 이동 착지점입니다. 이 값이 화면 기준선보다 아래일 수 있습니다.
    const docStyle = getComputedStyle(document.documentElement);
    const sectionStyle = getComputedStyle(sectionPairs[0].section);
    const anchorLanding = (parseFloat(docStyle.scrollPaddingTop) || 0) +
        (parseFloat(sectionStyle.scrollMarginTop) || 0);
    return Math.max(navBottom + 12, anchorLanding + 12);
}

function scrollSectionFromViewport() {
    if (!sectionPairs.length) return null;
    const line = getReadingLine();
    if (sectionPairs[0].section.getBoundingClientRect().top > line) return null;
    let current = sectionPairs[0].section.id;
    for (const {section} of sectionPairs) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
    }
    // 문서 마지막에 도달하면 마지막 섹션이 기준선까지 올라오지 못해도 표시합니다.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3) {
        current = sectionPairs[sectionPairs.length - 1].section.id;
    }
    return current;
}

function updateSectionHighlight() {
    sectionUpdateScheduled = false;
    if (!sectionPairs.length) return;
    // 메뉴를 누른 뒤 부드러운 스크롤 도중 이전 섹션이 선택을 덮어쓰지 못하게 합니다.
    if (pendingSectionId !== null) return;
    setActiveSection(scrollSectionFromViewport());
}

function scheduleSectionHighlight() {
    if (sectionUpdateScheduled) return;
    sectionUpdateScheduled = true;
    window.requestAnimationFrame(updateSectionHighlight);
}

function finishSectionNavigation() {
    if (pendingSectionId === null) return;
    pendingSectionId = null;
    clearTimeout(navigationSettledTimer);
    navigationSettledTimer = null;
    scheduleSectionHighlight();
}

if (sectionPairs.length) {
    for (const {link, section} of sectionPairs) {
        link.addEventListener('click', () => {
            pendingSectionId = section.id;
            setActiveSection(section.id); // 클릭 즉시 새 항목 하나만 활성화합니다.
            clearTimeout(navigationSettledTimer);
        });
    }
    window.addEventListener('scroll', () => {
        if (pendingSectionId !== null) {
            // 'scrollend' 미지원 브라우저: 마지막 스크롤 이벤트 이후 확정합니다.
            clearTimeout(navigationSettledTimer);
            navigationSettledTimer = setTimeout(finishSectionNavigation, 160);
        }
        scheduleSectionHighlight();
    }, {passive: true});
    // 최신 브라우저는 네이티브 스크롤 종료 이벤트를 사용합니다.
    if ('onscrollend' in window) window.addEventListener('scrollend', finishSectionNavigation);
    // 사용자가 직접 스크롤을 시작하면 클릭 이동 잠금을 해제합니다.
    window.addEventListener('wheel', finishSectionNavigation, {passive: true});
    window.addEventListener('touchstart', finishSectionNavigation, {passive: true});
    window.addEventListener('resize', scheduleSectionHighlight, {passive: true});
    window.addEventListener('hashchange', scheduleSectionHighlight);
    window.addEventListener('load', scheduleSectionHighlight);
    document.querySelector('.site-header').addEventListener('transitionend', scheduleSectionHighlight);
    updateSectionHighlight();
}
