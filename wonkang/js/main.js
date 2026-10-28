// 원강금속 리뉴얼: 슬라이더와 프로토타입 인터랙션
const heroPaginationItems = [
    {
        image: 'img/wonkang_hero_pc.png',
        title: '금속의 가치를 만드는 정밀 주조 기술'
    },
    {
        image: 'img/wonkang_hero2_pc.jpg',
        title: '첨단 기술로 완성하는 정밀 품질 관리'
    },
    {
        image: 'img/wonkang_hero.jpg',
        title: '산업의 미래를 연결하는 주조 솔루션'
    }
];

if (typeof Swiper !== 'undefined') {
    new Swiper('.hero-sec > .swiper', {
        direction: 'horizontal',
        loop: true,
        keyboard: { enabled: true },
        pagination: {
            el: '.hero-sec .swiper-pagination',
            clickable: true,
            renderBullet(index, className) {
                const item = heroPaginationItems[index];
                const number = String(index + 1).padStart(2, '0');
                return `<button class="${className}" type="button" aria-label="${item.title} 슬라이드로 이동">
                    <img class="hero-thumb" src="${item.image}" alt="" loading="lazy">
                    <span class="hero-thumb-title">${item.title}</span>
                    <span class="hero-pagination-index">${number}</span>
                </button>`;
            }
        },
        scrollbar: {
            el: '.hero-sec .swiper-scrollbar',
            draggable: true,
            snapOnRelease: true,
            hide: false
        }
    });
}

// 원본 이미지가 저장소에 없으면 임시 대체 이미지를 표시합니다.
document.querySelectorAll('img[data-fallback]').forEach(img => {
    const loadFallback = () => {
        const fallback = img.dataset.fallback;
        if (!fallback) return;
        img.removeAttribute('data-fallback');
        img.src = fallback;
    };

    // 로컬 파일이 이미 오류 처리된 경우에도 대체 이미지를 적용합니다.
    if (img.complete && img.naturalWidth === 0) {
        loadFallback();
    } else {
        img.addEventListener('error', loadFallback, { once: true });
    }
});

// GNB: 기본 상태는 닫힘, 데스크톱은 주 메뉴 호버/키보드 포커스 중 열림.
// 모바일에서는 메뉴 버튼으로 열고 닫습니다. 하위 메뉴는 시안 확인용입니다.
const siteHeader = document.querySelector('.site-header');
const siteNav = siteHeader.querySelector('.site-nav');
const siteNavButtons = Array.from(siteNav.querySelectorAll('.site-nav__item'));
const megaMenu = siteHeader.querySelector('.mega-menu');
const submenuButtons = Array.from(megaMenu.querySelectorAll('button'));
const menuButton = siteHeader.querySelector('.menu-toggle');
const siteLangButton = siteHeader.querySelector('.site-lang');
const compactNavigation = window.matchMedia('(max-width: 850px)');

function setMegaMenuOpen(open) {
    siteHeader.classList.toggle('mega-open', open);

    siteNavButtons.forEach(button => {
        button.setAttribute('aria-expanded', String(open));
    });

    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '전체 메뉴 접기' : '전체 메뉴 펼치기');
}

function flashNavButton(button) {
    button.classList.add('nav-pressed');
    window.setTimeout(() => button.classList.remove('nav-pressed'), 220);
}

// 데스크톱: 히어로 위 내비게이션 영역에 호버하면 배경과 로고를 바꾸고
// 메가 메뉴를 펼칩니다. 하위 메뉴로 마우스를 이동해도 닫히지 않습니다.
siteHeader.addEventListener('mouseenter', () => {
    if (!compactNavigation.matches) setMegaMenuOpen(true);
});

// 내비게이션 영역을 완전히 벗어날 때 원래의 투명 상태로 복귀합니다.
siteHeader.addEventListener('mouseleave', () => {
    if (!compactNavigation.matches) setMegaMenuOpen(false);
});

// 클릭은 페이지 전환 없이 피드백만 표시합니다.
siteNavButtons.forEach(button => {
    button.addEventListener('click', () => {
        flashNavButton(button);
        if (compactNavigation.matches) setMegaMenuOpen(true);
    });
});
submenuButtons.forEach(button => {
    button.addEventListener('click', () => flashNavButton(button));
});
siteLangButton.addEventListener('click', () => flashNavButton(siteLangButton));

// 키보드 조작 시에도 열린 메뉴에 접근할 수 있도록 처리합니다.
siteHeader.addEventListener('focusin', event => {
    if (compactNavigation.matches) return;
    if (siteNav.contains(event.target) || megaMenu.contains(event.target)) {
        setMegaMenuOpen(true);
    }
});
siteHeader.addEventListener('focusout', event => {
    if (compactNavigation.matches) return;
    const next = event.relatedTarget;
    if (!next || (!siteNav.contains(next) && !megaMenu.contains(next))) {
        setMegaMenuOpen(false);
    }
});

menuButton.addEventListener('click', () => {
    setMegaMenuOpen(!siteHeader.classList.contains('mega-open'));
});

// 화면 크기가 바뀌어도 처음부터 메뉴를 펼쳐 놓지 않습니다.
compactNavigation.addEventListener('change', () => setMegaMenuOpen(false));
setMegaMenuOpen(false);

// 대표 제품의 상세 페이지가 구현되기 전까지 클릭 효과만 표시합니다.
document.querySelectorAll('.product-panel button').forEach(button => {
    button.addEventListener('click', () => flashNavButton(button));
});

// 카드 겹침은 CSS position: sticky가 담당합니다.
// JavaScript는 현재 카드 표시, 진행률, 번호 버튼 이동만 처리합니다.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsObservation = 'IntersectionObserver' in window;
const cardStack = document.querySelector('.card-stack');
const steelCards = cardStack ? Array.from(cardStack.querySelectorAll('.steel-service')) : [];
const cardNavButtons = cardStack ? Array.from(cardStack.querySelectorAll('.card-stack__nav')) : [];
let cardFramePending = false;

function updateCardNavigation() {
    cardFramePending = false;
    if (!cardStack || steelCards.length === 0) return;

    const sectionTop = window.scrollY + cardStack.getBoundingClientRect().top;
    const sectionHeight = cardStack.offsetHeight;
    const activeIndex = Math.min(steelCards.length - 1, Math.max(0, Math.floor(
        (window.scrollY - sectionTop + window.innerHeight * .35) /
        Math.max(sectionHeight / steelCards.length, 1)
    )));

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

if (cardStack && steelCards.length) {
    cardNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.cardIndex);
            const sectionTop = window.scrollY + cardStack.getBoundingClientRect().top;
            const cardHeight = cardStack.offsetHeight / steelCards.length;
            window.scrollTo({
                top: sectionTop + cardHeight * index,
                behavior: reducedMotion ? 'auto' : 'smooth'
            });
        });
    });

    window.addEventListener('scroll', requestCardNavigationUpdate, { passive: true });
    window.addEventListener('resize', requestCardNavigationUpdate, { passive: true });
    requestCardNavigationUpdate();
}

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
