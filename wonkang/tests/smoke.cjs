const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const root = path.resolve(__dirname, '../..');
(async () => {
    const server = http.createServer((req, res) => {
        const requested = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
        const file = path.resolve(root, '.' + requested + (requested.endsWith('/') ? 'index.html' : ''));
        if (!file.startsWith(root + path.sep)) {
            res.writeHead(403).end();
            return;
        }
        fs.readFile(file, (err, data) => {
            if (err) {
                res.writeHead(404).end();
                return;
            }
            const mime = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.svg': 'image/svg+xml',
                '.woff2': 'font/woff2',
            };
            res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
            res.end(data);
        });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    server.unref();
    const baseUrl = 'http://127.0.0.1:' + server.address().port + '/wonkang/';
    const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    const results = {
        date: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }),
        browser: 'Microsoft Edge / Chromium',
        viewports: [],
        interactions: [],
        imageMetadata: [],
    };
    const sizes = [
        [1920, 1080],
        [1440, 900],
        [1024, 900],
        [768, 1024],
        [390, 844],
        [360, 800],
    ];
    for (const [width, height] of sizes) {
        const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
        const errors = [],
            failed = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('response', (r) => {
            if (r.status() >= 400 && !r.url().includes('favicon')) failed.push({ url: r.url(), status: r.status() });
        });
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        await page.evaluate(async () => {
            await document.fonts.ready;
            document.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
            await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
        });
        const inspection = await page.evaluate(() => ({
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
            broken: [...document.images]
                .filter((i) => !i.complete || !i.naturalWidth)
                .map((i) => i.getAttribute('src')),
            anchors: [...document.querySelectorAll('a[href^="#"]')]
                .filter((a) => !document.querySelector(a.hash))
                .map((a) => a.outerHTML),
            h1: document.querySelectorAll('h1').length,
            sections: [...document.querySelectorAll('main>section,.site-footer')].map((s) => ({
                id: s.id,
                class: s.className,
                top: s.getBoundingClientRect().top,
                height: s.getBoundingClientRect().height,
            })),
            overflow: [...document.querySelectorAll('h1,h2,h3,p,figcaption,address,.footer-navigation a')]
                .filter((e) => !e.classList.contains('sr-only') && e.scrollWidth > e.clientWidth + 2)
                .map((e) => ({ text: e.textContent.trim(), client: e.clientWidth, scroll: e.scrollWidth })),
            assets: [...document.images].map((i) => ({
                src: i.getAttribute('src'),
                width: i.getBoundingClientRect().width,
                height: i.getBoundingClientRect().height,
                naturalWidth: i.naturalWidth,
                naturalHeight: i.naturalHeight,
                fit: getComputedStyle(i).objectFit,
            })),
        }));
        assert.equal(inspection.scrollWidth, width, 'page overflow at ' + width);
        assert.deepEqual(inspection.broken, [], 'broken image at ' + width);
        assert.deepEqual(inspection.anchors, [], 'dead anchors at ' + width);
        assert.deepEqual(errors, [], 'JavaScript error');
        assert.deepEqual(failed, [], 'failed resource');
        assert.equal(inspection.h1, 1);
        assert.deepEqual(inspection.overflow, [], 'visible text overflow at ' + width);
        results.viewports.push({ ...inspection, errors, failed });

        if (width === 1920) {
            await page.getByRole('button', { name: '회사소개', exact: true }).hover();
            assert.equal(await page.locator('.site-nav__submenu').first().isVisible(), true);
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('.site-nav__submenu').first().isVisible(), false);
            results.interactions.push('Desktop hover menu / Escape');
            const second = page.locator('.swiper-pagination-bullet').nth(1);
            await second.click();
            assert.equal(await page.locator('.hero-sec>.swiper').evaluate((el) => el.swiper.realIndex), 1);
            await page.locator('.swiper-pagination-bullet').nth(2).click();
            assert.equal(await page.locator('.hero-sec>.swiper').evaluate((el) => el.swiper.realIndex), 2);
            assert.equal(await page.locator('h1').isVisible(), true);
            results.interactions.push('All hero thumbnail controls / persistent headline');
            for (const btn of await page.locator('[data-product]').all()) {
                await btn.locator('xpath=ancestor::article').hover();
                await btn.click();
                assert.equal(await page.locator('dialog').evaluate((e) => e.open), true);
                assert.equal(await page.locator('dialog a[href^="mailto:"]').count(), 1);
                await page.keyboard.press('Escape');
                assert.equal(await btn.evaluate((e) => e === document.activeElement), true);
            }
            results.interactions.push('4 product details / email link / Escape focus return');
            await page.locator('.product-panel').first().hover();
            await page.locator('[data-info="catalog"]').first().click();
            assert.match(await page.locator('#dialog-body').innerText(), /현재 제공되지/);
            await page.locator('.dialog-close').click();
            results.interactions.push('Catalog request information / close');
            const first = page.locator('.certificate-card').first();
            await first.click();
            assert.equal(await first.getAttribute('aria-pressed'), 'true');
            await page.keyboard.press('ArrowRight');
            assert.equal(await page.locator('.certificate-card').nth(1).getAttribute('aria-pressed'), 'true');
            await page.keyboard.press('End');
            assert.equal(await page.locator('.certificate-card').last().getAttribute('aria-pressed'), 'true');
            await page.keyboard.press('Home');
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('dialog').evaluate((e) => e.open), true);
            await page.keyboard.press('Escape');
            results.interactions.push('Certificate selection / arrows / Home / End / zoom');
        }
        if (width === 390) {
            await page.getByRole('button', { name: '전체 메뉴 펼치기' }).click();
            assert.equal(await page.locator('#main-navigation').isVisible(), true);
            await page.locator('#nav-company').click();
            await page.locator('.site-nav__submenu a[href="#partners"]').click();
            assert.equal(await page.locator('#main-navigation').isVisible(), false);
            results.interactions.push('Mobile menu / section navigation / close');
        }
        await page.close();
    }
    const noJs = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    await noJs.goto(baseUrl);
    assert.equal(await noJs.locator('.stat-value').first().innerText(), '1988');
    assert.equal(await noJs.locator('.process-item').count(), 8);
    assert.equal(await noJs.locator('.partner-list li').count(), 12);
    results.interactions.push('Without JS: content, metrics, gallery and partner logos remain present');
    const normal = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const normalErrors = [];
    normal.on('pageerror', (e) => normalErrors.push(e.message));
    await normal.goto(baseUrl);
    await normal.locator('.company-achievements').scrollIntoViewIfNeeded();
    await normal.waitForTimeout(3200);
    assert.equal(await normal.locator('.stat-roller').count(), 3);
    assert.deepEqual(normalErrors, []);
    results.interactions.push('Normal motion: achievement counters build and finish without errors');
    // 실적 숫자 구간을 한 번의 휠 입력 분량만큼 잠시 붙잡고 다시 정상 스크롤합니다.
    // scrollIntoViewIfNeeded 같은 보조 자동 스크롤은 고정 위치 검증에서 사용하지 않습니다.
    const metrics = await normal.locator('.company-achievements').evaluate((section) => {
        const frame = section.querySelector('.company-achievements__frame');
        return {
            top: section.getBoundingClientRect().top + scrollY,
            hold: section.offsetHeight - frame.offsetHeight,
            framePosition: getComputedStyle(frame).position,
            viewportHeight: innerHeight,
        };
    });
    assert.equal(metrics.framePosition, 'sticky', 'achievements frame must be sticky with normal motion');
    assert.ok(metrics.hold >= 100 && metrics.hold <= 160, 'hold lasts about one wheel step');
    const readFrameTop = () => normal.locator('.company-achievements__frame')
        .evaluate((frame) => frame.getBoundingClientRect().top);
    await normal.evaluate((top) => scrollTo({ top, behavior: 'instant' }), metrics.top);
    await normal.waitForTimeout(80);
    assert.ok(Math.abs(await readFrameTop()) < 2, 'frame sits at viewport top when pinned');
    await normal.evaluate((top) => scrollTo({ top, behavior: 'instant' }), metrics.top + metrics.hold / 2);
    await normal.waitForTimeout(80);
    assert.ok(Math.abs(await readFrameTop()) < 2, 'frame remains pinned during short hold');
    await normal.evaluate((top) => scrollTo({ top, behavior: 'instant' }), metrics.top + metrics.hold + 90);
    await normal.waitForTimeout(80);
    assert.ok((await readFrameTop()) < -60, 'frame is released to the next section after hold');
    results.interactions.push('Short achievements sticky hold / wheel-distance release');

    const reducedFrame = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
    });
    await reducedFrame.goto(baseUrl);
    assert.notEqual(
        await reducedFrame.locator('.company-achievements__frame').evaluate((el) => getComputedStyle(el).position),
        'sticky',
        'reduced motion leaves achievements in regular document flow'
    );
    await reducedFrame.close();

    const sources = ['wonkang/index.html', 'wonkang/css/main.css', 'wonkang/js/main.js']
        .map((source) => fs.readFileSync(path.join(root, source), 'utf8'))
        .join('\n');
    for (const file of fs.readdirSync(path.join(root, 'wonkang/img/figma'))) {
        const stat = fs.statSync(path.join(root, 'wonkang/img/figma', file));
        assert.ok(stat.size > 0);
        assert.ok(sources.includes(file), 'Figma asset has no code callsite: ' + file);
        results.imageMetadata.push({ file, bytes: stat.size });
    }
    fs.writeFileSync(path.join(root, 'wonkang/reports/verification.json'), JSON.stringify(results, null, 2));
    console.log(
        JSON.stringify(
            {
                viewports: results.viewports.map((v) => ({
                    width: v.width,
                    height: v.height,
                    overflow: v.overflow,
                    sections: v.width === 1920 ? v.sections : undefined,
                })),
                interactions: results.interactions,
                assets: results.imageMetadata.length,
            },
            null,
            2
        )
    );
    await browser.close();
    server.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
