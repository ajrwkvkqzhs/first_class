// 원강금속 메인: 기존 Swiper와 숫자 릴을 유지하고 실제 콘텐츠로 연결합니다.
'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsObservation = 'IntersectionObserver' in window;
const heroPaginationItems = [
    { image: 'img/figma/hero-thumb-casting.png', title: '금속의 가치를 만드는 정밀 주조 기술' },
    { image: 'img/figma/hero-thumb-quality.png', title: '첨단 기술로 완성하는 정밀 품질 관리' },
    { image: 'img/figma/hero-thumb-solution.png', title: '산업의 미래를 연결하는 주조 솔루션' }
];

if (typeof Swiper !== 'undefined') {
    new Swiper('.hero-sec > .swiper', {
        direction: 'horizontal',
        loop: true,
        speed: reducedMotion ? 0 : 500,
        keyboard: { enabled: true, onlyInViewport: true },
        a11y: {
            enabled: true,
            prevSlideMessage: '이전 슬라이드',
            nextSlideMessage: '다음 슬라이드',
            paginationBulletMessage: '{{index}}번 슬라이드로 이동',
            slideLabelMessage: '전체 {{slidesLength}}개 중 {{index}}번 슬라이드'
        },
        pagination: {
            el: '.hero-sec .swiper-pagination',
            clickable: true,
            renderBullet(index, className) {
                const item = heroPaginationItems[index];
                return '<button class="' + className + '" type="button" aria-label="' + item.title + ' 슬라이드로 이동">' +
                    '<img class="hero-thumb" src="' + item.image + '" alt="">' +
                    '<span class="hero-thumb-title">' + item.title + '</span>' +
                    '<span class="hero-pagination-index">' + String(index + 1).padStart(2, '0') + '</span></button>';
            }
        },
        scrollbar: { el: '.hero-sec .swiper-scrollbar', draggable: true, snapOnRelease: true, hide: false }
    });
}

// 카드의 겹침은 CSS sticky가 담당하고, 번호 버튼과 현재 카드만 JS로 연결합니다.
const cardStack = document.querySelector('.card-stack');
const steelCards = [...cardStack.querySelectorAll('.steel-service')];
const cardNavButtons = [...cardStack.querySelectorAll('.card-stack__nav')];
let cardFramePending = false;

function cardScrollPosition(index) {
    const sectionTop = cardStack.getBoundingClientRect().top + window.scrollY;
    return sectionTop + steelCards.slice(0, index).reduce((height, card) => height + card.offsetHeight, 0);
}

function updateCardNavigation() {
    cardFramePending = false;
    let activeIndex = 0;
    steelCards.forEach((card, index) => {
        if (window.scrollY + window.innerHeight * .4 >= cardScrollPosition(index)) activeIndex = index;
    });
    cardNavButtons.forEach((button, index) => {
        const active = index === activeIndex;
        button.classList.toggle('is-current', active);
        if (active) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
    });
}

function requestCardNavigationUpdate() {
    if (cardFramePending) return;
    cardFramePending = true;
    window.requestAnimationFrame(updateCardNavigation);
}

cardNavButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        window.scrollTo({top: cardScrollPosition(index), behavior: reducedMotion ? 'instant' : 'smooth'});
    });
});
window.addEventListener('scroll', requestCardNavigationUpdate, {passive: true});
window.addEventListener('resize', requestCardNavigationUpdate, {passive: true});
requestCardNavigationUpdate();

// 사용자 요청: 같은 간격의 좌우 사진이 뷰포트에 들어올 때 아래에서 위로 등장합니다.
// JS가 없거나 모션 감소를 선택한 경우에는 원래 콘텐츠를 그대로 보여 줍니다.
if (supportsObservation && !reducedMotion) {
    const processTargets = document.querySelectorAll('.process-gallery > h2, .process-item');
    const processObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
        });
    }, {rootMargin: '0px 0px -10% 0px', threshold: 0});
    processTargets.forEach(target => {
        target.classList.add('scroll-reveal');
        processObserver.observe(target);
    });
}

// 마우스, 키보드, 모바일 메뉴에서 같은 열림 상태를 사용합니다.
const siteHeader = document.querySelector('.site-header');
const siteNav = siteHeader.querySelector('.site-nav');
const siteNavButtons = [...siteNav.querySelectorAll('.site-nav__item')];
const megaMenu = siteHeader.querySelector('.mega-menu');
const menuButton = siteHeader.querySelector('.menu-toggle');
const compactNavigation = window.matchMedia('(max-width: 850px)');
let suppressFocusOpen = false;

function setMegaMenuOpen(open) {
    siteHeader.classList.toggle('mega-open', open);
    siteNavButtons.forEach(button => button.setAttribute('aria-expanded', String(open)));
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '전체 메뉴 접기' : '전체 메뉴 펼치기');
    megaMenu.inert = !open;
}

siteNav.addEventListener('mouseenter', () => {
    if (!compactNavigation.matches) setMegaMenuOpen(true);
});
siteHeader.addEventListener('mouseleave', () => {
    if (!compactNavigation.matches && !siteHeader.contains(document.activeElement)) setMegaMenuOpen(false);
});
siteNavButtons.forEach(button => button.addEventListener('click', () => setMegaMenuOpen(!siteHeader.classList.contains('mega-open'))));
menuButton.addEventListener('click', () => setMegaMenuOpen(!siteHeader.classList.contains('mega-open')));
siteHeader.addEventListener('focusin', event => {
    if (!compactNavigation.matches && !suppressFocusOpen && (siteNav.contains(event.target) || megaMenu.contains(event.target))) setMegaMenuOpen(true);
});
siteHeader.addEventListener('focusout', event => {
    if (!siteHeader.contains(event.relatedTarget)) setMegaMenuOpen(false);
});
megaMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    setMegaMenuOpen(false);
    const target = document.querySelector(link.hash);
    if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
    }
}));
document.addEventListener('click', event => {
    if (!siteHeader.contains(event.target)) setMegaMenuOpen(false);
});
document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !siteHeader.classList.contains('mega-open')) return;
    setMegaMenuOpen(false);
    suppressFocusOpen = true;
    (compactNavigation.matches ? menuButton : siteNavButtons[0]).focus();
    suppressFocusOpen = false;
});
compactNavigation.addEventListener('change', () => setMegaMenuOpen(false));
setMegaMenuOpen(false);

// 브라우저 기본 dialog: 포커스 제한, Escape, 배경 클릭, 닫은 뒤 포커스 복귀.
const detailDialog = document.querySelector('#detail-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogBody = document.querySelector('#dialog-body');
let dialogTrigger = null;

function showDetail(title, content, trigger, certificate = false) {
    dialogTrigger = trigger;
    dialogTitle.textContent = title;
    dialogBody.replaceChildren(...content);
    detailDialog.classList.toggle('detail-dialog--certificate', certificate);
    detailDialog.showModal();
    detailDialog.scrollTop = 0;
    document.body.classList.add('dialog-open');
    detailDialog.querySelector('.dialog-close').focus();
}

function paragraph(text) {
    const element = document.createElement('p');
    element.textContent = text;
    return element;
}

function contactLinks(subject) {
    const links = document.createElement('div');
    links.className = 'dialog-contact';
    const email = document.createElement('a');
    email.href = 'mailto:jmlee@wonkangmetal.com?subject=' + encodeURIComponent(subject);
    email.textContent = '이메일로 문의';
    const phone = document.createElement('a');
    phone.href = 'tel:0328111653';
    phone.textContent = '영업소 전화 연결';
    links.append(email, phone);
    return links;
}

document.querySelector('.dialog-close').addEventListener('click', () => detailDialog.close());
detailDialog.addEventListener('click', event => {
    const rect = detailDialog.getBoundingClientRect();
    if (event.target === detailDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) detailDialog.close();
});
detailDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (dialogTrigger && document.contains(dialogTrigger)) dialogTrigger.focus({ preventScroll: true });
});

document.querySelectorAll('[data-product]').forEach(button => {
    button.addEventListener('click', () => {
        const panel = button.closest('.product-panel');
        const title = panel.querySelector('h2').textContent;
        const image = panel.querySelector('.product-panel__image').cloneNode();
        image.removeAttribute('class');
        image.loading = 'eager';
        showDetail(title, [image, paragraph(panel.querySelector('p').innerText), paragraph('도면, 재질, 규격, 수량 등 문의 내용을 이메일로 보내 주시거나 영업소로 연락해 주세요.'), contactLinks(title + ' 문의')], button);
    });
});

const information = {
    catalog: ['카탈로그 요청', '카탈로그 파일은 현재 제공되지 않았습니다. 필요한 제품명을 적어 원강금속 영업소에 요청해 주세요.'],
    privacy: ['개인정보 취급방침', '개인정보 취급방침 원문은 원강금속에 문의해 주세요.'],
    email: ['이메일 무단수집거부', '이 페이지에 게시된 이메일 주소의 무단 수집을 거부합니다.']
};
document.querySelectorAll('[data-info]').forEach(button => {
    button.addEventListener('click', () => {
        const [title, description] = information[button.dataset.info];
        showDetail(title, [paragraph(description), contactLinks(title + ' 문의')], button);
    });
});

// 인증서: 원본의 펼침 배치를 유지하고 클릭·방향키·확대를 지원합니다.
const certificateList = document.querySelector('.certificate-list');
const certificates = [...certificateList.querySelectorAll('.certificate-card')];
const certificateMobile = window.matchMedia('(max-width: 600px)');

function selectCertificate(card, scroll = true) {
    certificates.forEach(item => {
        item.classList.toggle('is-active', item === card);
        item.setAttribute('aria-pressed', String(item === card));
    });
    if (scroll && certificateMobile.matches) {
        certificateList.scrollTo({
            left: card.offsetLeft - certificateList.offsetLeft - (certificateList.clientWidth - card.clientWidth) / 2,
            behavior: reducedMotion ? 'instant' : 'smooth'
        });
    }
}

certificates.forEach((card, index) => {
    card.addEventListener('click', () => {
        if (!card.classList.contains('is-active')) {
            selectCertificate(card);
            return;
        }
        const image = card.querySelector('img').cloneNode();
        image.loading = 'eager';
        showDetail(image.alt, [image], card, true);
    });
    card.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % certificates.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + certificates.length - 1) % certificates.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = certificates.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        selectCertificate(certificates[next]);
        certificates[next].focus({ preventScroll: true });
    });
});

// 실적 숫자: 섹션에 진입하면 위로 드러나고 각 자리 숫자가
// 0~9를 여러 번 지나간 뒤 Figma에 표시된 최종 값에 정지합니다.
const achievements = document.querySelector('.company-achievements');

function buildNumberReels() {
    const tracks = [];
    const values = achievements.querySelectorAll('.stat-value');

    values.forEach((value, groupIndex) => {
        const finalText = value.dataset.value || value.textContent.trim();
        const visual = document.createElement('span');

        visual.className = 'stat-roller';
        visual.setAttribute('aria-hidden', 'true');

        // 값의 의미를 보존하고 음성 안내에서 변화하는 자릿수를 반복 낭독하지 않도록 합니다.
        value.textContent = '';

        // 실제 값은 스크린리더 전용 텍스트에 유지하고 숫자 릴은 장식으로 처리합니다.
        const accessibleValue = document.createElement('span');
        accessibleValue.className = 'sr-only';
        accessibleValue.textContent = finalText;
        value.appendChild(accessibleValue);

        let digitIndex = 0;

        for (const char of finalText) {
            if (!/[0-9]/.test(char)) {
                const staticChar = document.createElement('span');
                staticChar.className = 'stat-static';
                staticChar.textContent = char;
                visual.appendChild(staticChar);
                continue;
            }

            const viewport = document.createElement('span');
            const strip = document.createElement('span');

            viewport.className = 'stat-digit';
            strip.className = 'stat-digit__strip';

            // 여러 바퀴를 회전시킨 다음 정확한 숫자로 멈춥니다.
            const turns = 3 + ((digitIndex + groupIndex) % 2);
            const finalIndex = turns * 10 + Number(char);

            for (let i = 0; i <= finalIndex; i++) {
                const step = document.createElement('span');
                step.className = 'stat-digit__step';
                step.textContent = String(i % 10);
                strip.appendChild(step);
            }

            viewport.appendChild(strip);
            visual.appendChild(viewport);
            tracks.push({
                strip,
                finalIndex,
                delay: groupIndex * 190 + digitIndex * 95,
                duration: 1500 + (digitIndex % 3) * 210
            });

            digitIndex++;
        }

        value.appendChild(visual);
    });

    return tracks;
}

if (achievements && supportsObservation && !reducedMotion) {
    achievements.classList.add('achievements--animated');

    const achievementsObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.unobserve(achievements);

        const tracks = buildNumberReels();

        // 시작 위치를 브라우저가 먼저 계산하도록 두 프레임에 나누어 적용합니다.
        window.requestAnimationFrame(() => {
            achievements.classList.add('achievements--visible');

            window.requestAnimationFrame(() => {
                tracks.forEach(({ strip, finalIndex, delay, duration }) => {
                    strip.style.transition =
                        'transform ' + duration + 'ms cubic-bezier(.12,.72,.13,1) ' + delay + 'ms';
                    strip.style.transform = 'translate3d(0, -' + finalIndex + 'em, 0)';
                });
            });
        });
    }, { threshold: 0.25 });

    achievementsObserver.observe(achievements);
}
