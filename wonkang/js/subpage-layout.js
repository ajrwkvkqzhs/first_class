/* Shared native dropdown behavior across all subpages. */
document.querySelectorAll('.subpage-depth__dropdown').forEach(dropdown => {
    document.addEventListener('click', event => {
        if (!dropdown.contains(event.target)) dropdown.open = false;
    });
    dropdown.addEventListener('keydown', event => {
        if (event.key === 'Escape' && dropdown.open) {
            dropdown.open = false;
            dropdown.querySelector('summary').focus();
        }
    });
});


/* Normalize internal CTA arrows without changing link destinations. */
(() => {
    const selector = '.hero-solution-link, .certifications__link, .detail-link, .about-text-link, .about-contact__primary, .products-card__link, .products-detail__cta, .products-contact__link, .customer-primary, .customer-secondary';
    const makeArrow = () => {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', 'wk-button-arrow');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.5');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M4 12h15m-6-6 6 6-6 6');
        svg.append(path);
        return svg;
    };
    document.querySelectorAll(selector).forEach(control => {
        if (control.querySelector('.wk-button-arrow')) return;
        if (control instanceof HTMLAnchorElement && (control.origin !== location.origin || control.target === '_blank' || control.hasAttribute('download'))) return;
        if (control.id === 'print-catalog') return;
        const area = control.querySelector('.products-card__action') || control;
        const marker = Array.from(area.children).find(el => /^[→↗]$/.test(el.textContent.trim()));
        if (marker) {
            marker.replaceWith(makeArrow());
            return;
        }
        const tail = Array.from(area.childNodes).reverse().find(node => node.nodeType === Node.TEXT_NODE && /[→↗]\s*$/.test(node.textContent));
        if (tail) {
            tail.textContent = tail.textContent.replace(/[→↗]\s*$/, '').trimEnd() + ' ';
            area.append(makeArrow());
        } else if (control.matches('.hero-solution-link')) {
            area.append(makeArrow());
        }
    });
})();
