// 회사소개 서브페이지: 기존 main.js에서 헤더/GNB 로직만 분리해 재사용합니다.
// 메인 전용 카드·인증서·숫자 애니메이션은 이 페이지에서 실행하지 않습니다.
'use strict';
function initializeNavigation() {
    const header = document.querySelector('.site-header');
    const hero = document.querySelector('.products-hero');
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



/* Category navigation: selected tab is separate from keyboard focus and hover. */
const productTabs = [...document.querySelectorAll('[data-product-tab]')];
const productPanels = new Map(productTabs.map(tab => [tab.dataset.productTab, document.getElementById('panel-' + tab.dataset.productTab)]));
const availableIds = new Set(productPanels.keys());

function activeTabId() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    return availableIds.has(hash) ? hash : 'all';
}
function showProduct(id, {updateHash = false, focus = false} = {}) {
    if (!availableIds.has(id)) id = 'all';
    for (const tab of productTabs) {
        const selected = tab.dataset.productTab === id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        productPanels.get(tab.dataset.productTab).hidden = !selected;
        if (selected && focus) tab.focus({preventScroll:true});
    }
    if (updateHash) {
        const url = new URL(window.location.href);
        url.hash = id === 'all' ? '' : id;
        window.history.pushState(null, '', url);
    }
}
productTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showProduct(tab.dataset.productTab,{updateHash:true}));
    tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % productTabs.length;
        else if (event.key === 'ArrowLeft') next = (index + productTabs.length - 1) % productTabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = productTabs.length - 1;
        else return;
        event.preventDefault();
        showProduct(productTabs[next].dataset.productTab,{updateHash:true,focus:true});
    });
});
document.querySelectorAll('[data-product-link]').forEach(link => {
    link.addEventListener('click', event => {
        const id = link.dataset.productLink;
        if (!availableIds.has(id)) return;
        event.preventDefault();
        showProduct(id,{updateHash:true});
        document.getElementById('products-catalog').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    });
});
document.querySelectorAll('.site-nav__submenu a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
        const id = link.hash.slice(1);
        if (!availableIds.has(id)) return;
        showProduct(id);
        document.getElementById('products-catalog').scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            block: 'start'
        });
    });
});
window.addEventListener('hashchange', () => showProduct(activeTabId()));
window.addEventListener('popstate', () => showProduct(activeTabId()));
showProduct(activeTabId());
