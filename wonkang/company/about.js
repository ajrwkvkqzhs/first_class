// 회사소개 서브페이지: 기존 main.js에서 헤더/GNB 로직만 분리해 재사용합니다.
// 메인 전용 카드·인증서·숫자 애니메이션은 이 페이지에서 실행하지 않습니다.
'use strict';
function initializeNavigation() {
    const header = document.querySelector('.site-header');
    const hero = document.querySelector('.about-hero');
    const logo = header.querySelector('.site-logo');
    const navigation = header.querySelector('.site-nav');
    const groups = [...navigation.querySelectorAll('.site-nav__group')];
    const buttons = groups.map((group) => group.querySelector('.site-nav__item'));
    const submenus = groups.map((group) => group.querySelector('.site-nav__submenu'));
    const toggle = header.querySelector('.menu-toggle');
    const compact = window.matchMedia('(max-width: 850px)');
    const narrow = window.matchMedia('(max-width: 600px)');
    let activeButton = buttons[0];
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
        groups.forEach((group, index) => setGroupOpen(index, open && !narrow.matches));
        navigation.inert = compact.matches && !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '전체 메뉴 접기' : '전체 메뉴 펼치기');
        updateHeaderVisibility();
    }

    groups.forEach((group, index) => {
        const button = buttons[index];
        button.addEventListener('click', (event) => {
            activeButton = button;
            if (compact.matches) {
                setGroupOpen(index, button.getAttribute('aria-expanded') !== 'true');
            } else {
                // Pointer entry already opens the menu; its following click must not close it again.
                setMenuOpen(event.detail > 0 || !header.classList.contains('mega-open'));
            }
        });

        button.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowDown') return;
            event.preventDefault();
            activeButton = button;
            if (!header.classList.contains('mega-open')) setMenuOpen(true);
            setGroupOpen(index, true);
            submenus[index].querySelector('a').focus();
        });

        group.addEventListener('focusin', () => {
            activeButton = button;
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
