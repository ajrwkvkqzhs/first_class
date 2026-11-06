const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.WONKANG_URL || 'http://127.0.0.1:4173/wonkang/';

(async () => {
    const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    const results = [];
    for (const [width, height] of [
        [320, 568],
        [390, 240],
        [600, 360],
        [601, 320],
        [768, 360],
        [850, 320],
        [851, 320],
        [900, 240],
        [1024, 568],
        [1440, 900],
    ]) {
        const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(url, { waitUntil: 'networkidle' });
        if (width <= 600) {
            const heroLayout = await page.evaluate(() => ({
                heroBottom: document.querySelector('.hero-sec').getBoundingClientRect().bottom,
                descriptionBottom: document.querySelector('.hero-solution-description').getBoundingClientRect().bottom,
                titleBottom: document.querySelector('.hero-copy').getBoundingClientRect().bottom,
                controlsTop: document.querySelector('.swiper-controls').getBoundingClientRect().top,
            }));
            assert.ok(heroLayout.descriptionBottom <= heroLayout.heroBottom - 12, 'hero description is not clipped');
            assert.ok(heroLayout.titleBottom + 20 <= heroLayout.controlsTop, 'hero title clears the controls');
        }
        if (width <= 850) {
            const toggle = page.locator('.menu-toggle');
            const toggleHit = await toggle.evaluate((el) => {
                const r = el.getBoundingClientRect();
                return !!document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.menu-toggle');
            });
            assert.equal(toggleHit, true, 'menu toggle must not be covered');
            await toggle.click();
            if (width <= 600) {
                assert.equal(await page.locator('#submenu-company').isVisible(), false, 'phone menu starts collapsed');
                await page.locator('#nav-company').click();
            }
        } else {
            await page.locator('#nav-company').click();
            assert.equal(
                await page.locator('#submenu-company').isVisible(),
                true,
                'pointer click must keep the hovered menu open'
            );
            await page.locator('#nav-factory').click();
            assert.equal(
                await page.locator('#submenu-factory').isVisible(),
                true,
                'switching primary menus must not close the menu'
            );
        }
        const lastLink = page.locator('#submenu-company a[href="#contact"]');
        await lastLink.scrollIntoViewIfNeeded();
        const reachability = await lastLink.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return {
                top: r.top,
                bottom: r.bottom,
                hit: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('a') === el,
                navScroll: document.querySelector('.site-nav').scrollTop,
                pageScroll: scrollY,
            };
        });
        assert.ok(reachability.top >= 0 && reachability.bottom <= height, 'last submenu link must fit the viewport');
        assert.equal(reachability.hit, true, 'last submenu link must be clickable');
        assert.equal(reachability.pageScroll, 0, 'menu scroll must not move the page behind it');
        await lastLink.click();
        assert.equal(await page.locator('.site-header').evaluate((el) => el.classList.contains('mega-open')), false);
        assert.deepEqual(errors, []);
        results.push({ width, height, reachability, errors });
        await page.close();
    }

    const resize = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await resize.goto(url, { waitUntil: 'networkidle' });
    for (const width of [1440, 850, 600, 320, 601, 851, 1440]) {
        await resize.setViewportSize({ width, height: 568 });
        // Wait for CSS media changes and their focus updates before operating the next menu.
        await resize.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        );
        if (width <= 850) {
            const toggle = resize.locator('.menu-toggle');
            if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
            await toggle.click();
            if (width <= 600) await resize.locator('#nav-products').click();
        } else {
            await resize.locator('#nav-products').click();
        }
        assert.equal(
            await resize.locator('#submenu-products').isVisible(),
            true,
            'menu works after resizing to ' + width
        );
        assert.equal(await resize.locator('#submenu-products').evaluate((el) => el.inert), false);
    }

    for (const [width, height] of [
        [1024, 568],
        [390, 320],
    ]) {
        const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.locator('.certificate-card').first().click();
        assert.equal(await page.locator('dialog').evaluate((el) => el.open), true, 'one click opens the certificate');
        await page.locator('#dialog-body img').evaluate((img) => img.decode());
        await page.locator('dialog').evaluate((el) => (el.scrollTop = el.scrollHeight));
        const close = await page.locator('.dialog-close').evaluate((el) => {
            const r = el.getBoundingClientRect();
            return {
                scroll: document.querySelector('dialog').scrollTop,
                top: r.top,
                bottom: r.bottom,
                hit: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('button') === el,
            };
        });
        assert.ok(close.scroll > 0);
        assert.ok(close.top >= 0 && close.bottom <= height, 'dialog close stays visible after scrolling');
        assert.equal(close.hit, true);
        await page.locator('.dialog-close').click();
        assert.equal(await page.locator('dialog').evaluate((el) => el.open), false);
        results.push({ width, height, dialogClose: close });
        await page.close();
    }
    fs.writeFileSync(
        path.resolve(__dirname, '../reports/responsive-verification.json'),
        JSON.stringify({ url, results, resizeSequence: [1440, 850, 600, 320, 601, 851, 1440] }, null, 2)
    );
    console.log(JSON.stringify(results, null, 2));
    await browser.close();
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
