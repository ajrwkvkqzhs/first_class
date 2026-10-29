const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.WONKANG_URL || 'http://127.0.0.1:4173/wonkang/';

(async () => {
    const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    const results = [];
    for (const width of [1920, 1440, 1024, 851, 768, 390, 360]) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const structure = await page.evaluate(() => {
            const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
            return {
                duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
                missingControls: [...document.querySelectorAll('[aria-controls]')].filter(
                    (el) => !document.getElementById(el.getAttribute('aria-controls'))
                ).length,
                groups: document.querySelectorAll('.site-nav__list > .site-nav__group').length,
                nestedControls: document.querySelectorAll('button button, button a, a button, a a').length,
                leftoverInlineStyles: document.querySelectorAll('.process-item[style], .partner-list img[style]')
                    .length,
                productHeadings: document.querySelectorAll('#products > h2, .product-panel h3').length,
            };
        });
        assert.deepEqual(structure.duplicateIds, []);
        assert.equal(structure.missingControls, 0);
        assert.equal(structure.groups, 3);
        assert.equal(structure.nestedControls, 0);
        assert.equal(structure.leftoverInlineStyles, 0);
        assert.equal(structure.productHeadings, 5);
        if (width > 850) {
            await page.locator('.site-nav__item').first().click();
            await page.mouse.move(width - 20, 700);
            assert.equal(
                await page.locator('.site-nav__submenu').first().isVisible(),
                false,
                'clicked menu must close when the pointer leaves at ' + width
            );
            await page.locator('.site-nav__item').first().hover();
        } else {
            await page.getByRole('button', { name: '전체 메뉴 펼치기' }).click();
            if (width <= 600) {
                for (const button of await page.locator('.site-nav__item').all()) await button.click();
            }
        }
        const alignment = await page.locator('.site-nav__group').evaluateAll((groups) =>
            groups.map((group) => {
                const button = group.querySelector('.site-nav__item').getBoundingClientRect();
                const submenu = group.querySelector('.site-nav__submenu').getBoundingClientRect();
                return {
                    name: group.querySelector('button').textContent.trim(),
                    primaryX: button.x,
                    submenuX: submenu.x,
                    width: button.width,
                    delta: Math.abs(button.x + button.width / 2 - submenu.x - submenu.width / 2),
                };
            })
        );
        assert.ok(
            alignment.every((group) => group.delta < 1),
            'primary and submenu columns must align at ' + width
        );
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        if (width === 1440) {
            await page.keyboard.press('Escape');
            await page.locator('.site-nav__item').first().focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('.site-nav__submenu').first().isVisible(), true);
            await page.keyboard.press('ArrowDown');
            assert.equal(
                await page
                    .locator('#submenu-company a')
                    .first()
                    .evaluate((el) => el === document.activeElement),
                true
            );
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('#nav-company').evaluate((el) => el === document.activeElement), true);
            assert.equal(await page.locator('.site-nav__submenu').first().isVisible(), false);
        }
        if (width === 390) {
            await page.locator('#nav-company').click();
            assert.equal(await page.locator('#submenu-company').isVisible(), false);
            assert.equal(await page.locator('#submenu-factory').isVisible(), true);
            await page.locator('#nav-company').click();
            await page.locator('#submenu-company a[href="#partners"]').click();
            assert.equal(await page.locator('#main-navigation').isVisible(), false);
            assert.equal(await page.evaluate(() => document.activeElement.id), 'partners');
        }
        assert.deepEqual(errors, []);
        results.push({ width, structure, alignment, errors });
        await page.close();
    }
    fs.writeFileSync(
        path.resolve(__dirname, '../reports/navigation-verification.json'),
        JSON.stringify({ url, results }, null, 2)
    );
    console.log(
        JSON.stringify(
            results.map(({ width, alignment }) => ({
                width,
                maxAlignmentError: Math.max(...alignment.map((group) => group.delta)),
            })),
            null,
            2
        )
    );
    await browser.close();
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
