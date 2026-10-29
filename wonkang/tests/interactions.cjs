const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.env.WONKANG_URL || 'http://127.0.0.1:4173/wonkang/';
const output = path.resolve(__dirname, '../reports/interaction-verification.json');

(async () => {
    const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const sequence = await page.locator('.card-stack').evaluate((el) => ({
        top: el.getBoundingClientRect().top + scrollY,
        step: (el.offsetHeight - el.querySelector('.card-stack__deck').offsetHeight) / 2,
        enabled: el.classList.contains('is-enhanced'),
    }));
    assert.equal(sequence.enabled, true, 'desktop enables the scroll-driven service sequence');
    const sample = () => page.locator('.steel-service').evaluateAll((cards) =>
        cards.map((card) => ({
            visible: getComputedStyle(card).visibility === 'visible',
            background: getComputedStyle(card).backgroundColor,
            opacity: Number(getComputedStyle(card).opacity),
            y: new DOMMatrix(getComputedStyle(card).transform).m42,
            ariaHidden: card.getAttribute('aria-hidden'),
        }))
    );
    const goToPhase = async (phase) => {
        await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), sequence.top + sequence.step * phase);
        await page.waitForTimeout(100);
        return sample();
    };
    const first = await goToPhase(0);
    assert.ok(first[0].visible && !first[1].visible && first[0].y === 0, 'first scene starts visible');

    const holding = await goToPhase(0.1);
    assert.ok(holding[0].visible && !holding[1].visible, 'first scene stays before the transition');

    const midway = await goToPhase(0.5);
    assert.ok(midway[0].visible && midway[1].visible, 'incoming scene layers over outgoing scene');
    assert.ok(midway[1].y > 0 && midway[1].y < 900, 'incoming scene rises from below');
    assert.equal(midway[0].y, 0, 'outgoing scene remains behind rather than fading upward');
    assert.equal(midway[0].opacity, 1, 'outgoing scene is not faded');
    assert.equal(midway[1].opacity, 1, 'incoming scene is not faded');
    assert.notEqual(midway[1].background, 'rgba(0, 0, 0, 0)', 'incoming scene has opaque backing');

    const second = await goToPhase(1);
    assert.ok(!second[0].visible && second[1].visible && !second[2].visible, 'second scene fully covers first');
    assert.equal(second[1].y, 0, 'new scene settles at its original position');

    const thirdIncoming = await goToPhase(1.5);
    assert.ok(thirdIncoming[1].visible && thirdIncoming[2].visible && thirdIncoming[2].y > 0, 'third scene overlays second');

    const back = await goToPhase(0.5);
    assert.ok(back[0].visible && back[1].visible && back[1].y > 0, 'scrolling upward reveals the previous scene');

    const navigation = await page.locator('.card-stack__navigation').boundingBox();
    assert.ok(navigation.y >= 0 && navigation.y + navigation.height <= 900, 'scene controls stay visible');
    await page.locator('[data-card-index="2"]').click();
    await page.waitForFunction(() =>
        document.querySelector('[data-card-index="2"]')?.getAttribute('aria-current') === 'true' &&
        document.querySelector('.steel-service--stainless')?.getAttribute('aria-hidden') === 'false'
    );
    await page.locator('[data-card-index="0"]').click();
    await page.waitForFunction(() =>
        document.querySelector('[data-card-index="0"]')?.getAttribute('aria-current') === 'true' &&
        document.querySelector('.steel-service--casting')?.getAttribute('aria-hidden') === 'false'
    );

    await page.locator('#products').evaluate((el) => scrollTo({ top: el.offsetTop - 80, behavior: 'instant' }));
    await page.mouse.move(5, 5);
    assert.equal(
        await page
            .locator('.product-panel__reveal')
            .first()
            .evaluate((el) => getComputedStyle(el).visibility),
        'hidden'
    );
    for (const panel of await page.locator('.product-panel').all()) {
        await panel.hover({ position: { x: 100, y: 40 } });
        await page.waitForFunction(
            (el) => getComputedStyle(el).opacity === '1',
            await panel.locator('.product-panel__reveal').elementHandle()
        );
        assert.equal(await panel.locator('button,a').count(), 3, 'every CTA has detail, contact and catalog');
        assert.equal(await panel.locator('[data-product]').isVisible(), true);
        assert.equal(await panel.locator('a[href^="mailto:"]').isVisible(), true);
        assert.equal(await panel.locator('[data-info="catalog"]').isVisible(), true);
    }
    await page.mouse.move(5, 5);
    await page.waitForFunction(() =>
        [...document.querySelectorAll('.product-panel__reveal')].every(
            (el) => getComputedStyle(el).visibility === 'hidden'
        )
    );
    await page.locator('.product-panel').first().focus();
    await page.waitForFunction(
        () => getComputedStyle(document.querySelector('.product-panel__reveal')).visibility === 'visible'
    );
    await page.keyboard.press('Tab');
    assert.equal(
        await page.locator('[data-product="machinery"]').evaluate((el) => el === document.activeElement),
        true,
        'keyboard can reach a revealed detail button'
    );

    const firstFigure = page.locator('.process-item').first();
    assert.equal(
        await firstFigure.evaluate((el) => getComputedStyle(el).opacity),
        '0',
        'offscreen gallery starts hidden'
    );
    const before = await firstFigure.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);
    assert.ok(before > 0, 'gallery begins below its final position');
    await firstFigure.evaluate((el) =>
        scrollTo({ top: el.getBoundingClientRect().top + scrollY - 600, behavior: 'instant' })
    );
    await page.waitForFunction((el) => el.classList.contains('is-revealed'), await firstFigure.elementHandle());
    await page.waitForFunction(
        (el) =>
            getComputedStyle(el).opacity === '1' &&
            Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m42) < 0.1,
        await firstFigure.elementHandle()
    );
    const figures = [];
    for (const figure of await page.locator('.process-item').all()) {
        await figure.evaluate((el) =>
            scrollTo({ top: el.getBoundingClientRect().top + scrollY - 450, behavior: 'instant' })
        );
        await page.waitForFunction(
            (el) => el.classList.contains('is-revealed') && getComputedStyle(el).opacity === '1',
            await figure.elementHandle()
        );
        figures.push(
            await figure.evaluate((el) => {
                const r = el.getBoundingClientRect();
                return { id: el.id, x: r.x, top: r.top + scrollY, bottom: r.bottom + scrollY };
            })
        );
    }
    const gaps = figures.slice(1).map((figure, i) => figure.top - figures[i].bottom);
    assert.ok(
        gaps.every((gap) => gap > 0 && Math.abs(gap - gaps[0]) < 1),
        'all gallery gaps must be equal'
    );
    assert.ok(
        figures.every((figure, i) => (i % 2 === 0 ? figure.x < 720 : figure.x > 720)),
        'gallery alternates left and right'
    );
    assert.deepEqual(errors, []);

    const touch = await browser.newPage({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        reducedMotion: 'no-preference',
    });
    await touch.goto(baseUrl, { waitUntil: 'networkidle' });
    assert.equal(
        await touch
            .locator('.product-panel__reveal')
            .first()
            .evaluate((el) => getComputedStyle(el).visibility),
        'visible',
        'touch devices show actions without hover'
    );
    await touch.locator('[data-info="catalog"]').nth(2).click();
    assert.equal(await touch.locator('dialog').evaluate((el) => el.open), true);
    await touch.locator('.dialog-close').click();

    const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await reduced.goto(baseUrl, { waitUntil: 'networkidle' });
    assert.equal(
        await reduced
            .locator('.process-item')
            .first()
            .evaluate((el) => getComputedStyle(el).opacity),
        '1'
    );
    assert.equal(
        await reduced.locator('.card-stack').evaluate((el) => el.classList.contains('is-enhanced')),
        false,
        'reduced motion disables the pinned sequence'
    );
    assert.equal(
        await reduced.locator('.steel-service').first().evaluate((el) => getComputedStyle(el).position),
        'relative'
    );
    assert.equal(await reduced.locator('.steel-service').count(), 3, 'all three sections remain in document flow');
    const result = {
        date: '2026-10-29',
        url: baseUrl,
        checks: [
            'service scenes overlay from below with an opaque background, without fading',
            'scroll direction reverses the overlay to reveal the preceding scene',
            'service number controls jump forward and backward',
            'all 4 CTA panels reveal 3 controls on hover',
            'CTA controls hide on mouseleave and reveal with keyboard focus',
            'gallery slides from below into its final position',
            '8 gallery figures alternate left/right with equal gaps',
            'touch controls work without hover',
            'reduced motion keeps content visible',
        ],
        galleryGaps: gaps,
        errors,
    };
    fs.writeFileSync(output, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    await browser.close();
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
