// Shared, progressive scroll-entry feedback for secondary content.
// Content remains in the accessibility tree; nothing is hidden without JS support.
'use strict';
(() => {
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const selectorByPage = {
        'detail-page': [
            '.detail-section__heading', '.detail-split', '.detail-step',
            '.detail-rule-card', '.detail-stat', '.detail-timeline__row',
            '.detail-product-feature', '.detail-certificate-grid',
            '.detail-logo-grid', '.detail-info-grid'
        ],
        'about-page': [
            '.about-overview__body', '.about-process__heading',
            '.about-process__item', '.about-proof__heading', '.about-proof__grid',
            '.about-belief__intro', '.about-belief__item',
            '.about-history__intro', '.about-history__item',
            '.about-contact__layout'
        ],
        'products-page': [
            '.products-catalog__heading', '.products-card',
            '.products-contact__inner'
        ]
    };
    const page = Object.keys(selectorByPage).find(name => document.body.classList.contains(name));
    if (!page) return;

    const targets = document.querySelectorAll(selectorByPage[page].join(','));
    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('page-reveal-visible');
            observer.unobserve(entry.target);
        }
    }, { threshold: 0.01, rootMargin: '0px 0px -24px 0px' });

    for (const target of targets) {
        const rect = target.getBoundingClientRect();
        // Keep initially visible, above-the-fold, restored-scroll and hidden-tab
        // content intact. The motion belongs only to content not yet reached.
        if (rect.height < 1 || rect.top < window.innerHeight - 24) continue;
        target.classList.add('page-reveal-pending');
        observer.observe(target);
    }
})();
