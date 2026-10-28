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

// GNB는 디자인 시연용으로 클릭 효과만 표시합니다.
document.querySelectorAll('.site-nav button').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.add('nav-pressed');
        window.setTimeout(() => button.classList.remove('nav-pressed'), 220);
    });
});

// 대표 제품의 상세 페이지가 구현되기 전까지 클릭 효과만 표시합니다.
document.querySelectorAll('.product-panel button').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.add('is-clicked');
        window.setTimeout(() => button.classList.remove('is-clicked'), 240);
    });
});

const siteHeader = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');

menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    siteHeader.classList.toggle('menu-open', !isOpen);
});

document.addEventListener('scroll', () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 30);
}, { passive: true });
