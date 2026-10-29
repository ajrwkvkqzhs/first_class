const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.WONKANG_URL || 'http://127.0.0.1:4173/wonkang/';

async function expectHeader(page, visible) {
    try {
        await page.waitForFunction(
            (expected) => {
                const header = document.querySelector('.site-header');
                const rect = header.getBoundingClientRect();
                return expected
                    ? !header.classList.contains('is-hidden') && Math.abs(rect.top) < 1
                    : header.classList.contains('is-hidden') && rect.bottom <= 0;
            },
            visible,
            { timeout: 5000 }
        );
    } catch (error) {
        console.error(
            await page.evaluate(() => ({
                scroll: scrollY,
                header: document.querySelector('.site-header').className,
                focus: document.activeElement.id,
            }))
        );
        throw error;
    }
}

async function scrollTo(page, top) {
    await page.evaluate(async (position) => {
        window.scrollTo({ top: position, behavior: 'instant' });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, top);
}

(async () => {
    const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    const results = [];
    try {
        for (const [width, height] of [
            [1920, 1080],
            [1440, 900],
            [1024, 768],
            [851, 568],
            [768, 1024],
            [390, 844],
            [320, 568],
        ]) {
            const page = await browser.newPage({
                viewport: { width, height },
                hasTouch: width <= 850,
                isMobile: width <= 850,
                reducedMotion: width === 320 ? 'reduce' : 'no-preference',
            });
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.mouse.move(width - 20, height - 20);
            await expectHeader(page, true);

            await scrollTo(page, 400);
            await expectHeader(page, false);
            await scrollTo(page, 1600);
            await expectHeader(page, false);
            const stickyCards = await page
                .locator('.steel-service')
                .first()
                .evaluate((el) => getComputedStyle(el).position === 'sticky');
            if (stickyCards) {
                assert.equal(
                    await page.evaluate(
                        () => !!document.elementFromPoint(innerWidth / 2, 2)?.closest('.steel-service')
                    ),
                    true,
                    'a pinned card must cover the top edge without a leftover header gap'
                );
            }
            await scrollTo(page, 1536);
            await expectHeader(page, true);
            await scrollTo(page, 1540);
            await expectHeader(page, true);
            await scrollTo(page, 1536);

            await scrollTo(page, 1800);
            await expectHeader(page, false);
            await page.mouse.move(20, 8);
            await expectHeader(page, true);
            await page.mouse.move(width - 20, height - 20);
            await expectHeader(page, false);

            // Tab must bring an offscreen header back before the user operates it.
            await page.locator('.skip-link').evaluate((el) => el.focus({ preventScroll: true }));
            await page.keyboard.press('Tab');
            await expectHeader(page, true);
            assert.equal(await page.locator('.site-logo').evaluate((el) => el === document.activeElement), true);
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('.site-header').evaluate((el) => el.classList.contains('mega-open')), true);
            await scrollTo(page, 2200);
            await expectHeader(page, true);
            await page.keyboard.press('Escape');
            await expectHeader(page, true);
            await page.locator('#main-content').evaluate((el) => el.focus({ preventScroll: true }));
            await expectHeader(page, false);

            await scrollTo(page, 2136);
            await expectHeader(page, true);
            if (width > 850) {
                await page.locator('#nav-company').click();
                await page.locator('#submenu-company a').first().hover();
                await scrollTo(page, 2400);
                await expectHeader(page, true);
                await page.mouse.move(width - 20, height - 20);
            } else {
                await page.locator('.menu-toggle').tap();
                if (width <= 600) await page.locator('#nav-company').tap();
                await scrollTo(page, 2400);
                await expectHeader(page, true);
                const outside = await page.locator('.site-header').evaluate((el) => ({
                    x: innerWidth - 20,
                    y: Math.min(innerHeight - 20, el.getBoundingClientRect().bottom + 60),
                }));
                await page.touchscreen.tap(outside.x, outside.y);
            }
            await expectHeader(page, false);
            assert.equal(await page.locator('#submenu-company').isVisible(), false);

            await scrollTo(page, 0);
            await expectHeader(page, true);
            await page.waitForFunction(
                () => getComputedStyle(document.querySelector('.site-header')).backgroundColor === 'rgba(0, 0, 0, 0)'
            );
            assert.deepEqual(errors, []);
            results.push({
                width,
                height,
                downHides: true,
                upReveals: true,
                smallScrollStable: true,
                pointerReveals: true,
                keyboardReveals: true,
                activeMenuStaysVisible: true,
                returnsTransparentAtTop: true,
                cardTopEdgeCovered: stickyCards ? true : null,
                errors,
            });
            await page.close();
        }
        fs.writeFileSync(
            path.resolve(__dirname, '../reports/header-visibility-verification.json'),
            JSON.stringify({ url, results }, null, 2)
        );
        console.log(JSON.stringify(results, null, 2));
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
