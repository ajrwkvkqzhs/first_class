const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = path.resolve(__dirname, '..');
const repository = path.dirname(root);
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'preparation.json'), 'utf8'));
const base = process.env.WONKANG_PREPARATION_URL || 'http://127.0.0.1:4173/';
const hash = (value) => crypto.createHash('sha256').update(String(value).replace(/\r\n/g, '\n')).digest('hex');

assert.equal(manifest.status, 'prepared-awaiting-user-approval', 'This check only verifies the untouched preparation.');
assert.deepEqual(manifest.designCommandsExecuted, [], 'Design commands must not have run before approval.');
for (const [file, expected] of Object.entries(manifest.controlSourceSha256)) {
    assert.equal(hash(fs.readFileSync(path.join(repository, file))), expected, 'Control source changed: ' + file);
}
for (const [file, expected] of Object.entries(manifest.preparedSourceSha256)) {
    assert.equal(hash(fs.readFileSync(path.join(root, file))), expected, 'Prepared source changed: ' + file);
}

async function ready(page, route) {
    await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
        document.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
        await Promise.all([document.fonts.ready, ...[...document.images].map((img) => img.decode())]);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
}

(async () => {
    const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    const results = [];
    try {
        const landing = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await landing.goto(base, { waitUntil: 'networkidle' });
        const controlLink = landing.getByRole('link', { name: 'wonkang', exact: true });
        const candidateLink = landing.getByRole('link', { name: 'UI 개선판', exact: true });
        const before = await controlLink.boundingBox();
        const after = await candidateLink.boundingBox();
        assert.ok(
            Math.abs(before.y - after.y) < 3 && after.x > before.x + before.width,
            'Links must sit side by side.'
        );
        await candidateLink.click();
        assert.equal(new URL(landing.url()).pathname.endsWith('/wonkang-ui/index.html'), true);
        await landing.close();

        fs.mkdirSync(path.join(__dirname, 'baseline'), { recursive: true });
        for (const [width, height] of [
            [1920, 1080],
            [1440, 900],
            [390, 844],
        ]) {
            const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
            const pages = [await context.newPage(), await context.newPage()];
            const errors = [];
            const failures = [];
            pages.forEach((page) => {
                page.on('pageerror', (error) => errors.push(error.message));
                page.on('response', (response) => {
                    if (response.status() >= 400 && !response.url().includes('favicon')) failures.push(response.url());
                });
            });
            await ready(pages[0], 'wonkang/index.html');
            await ready(pages[1], 'wonkang-ui/index.html');
            const screenshots = [await pages[0].screenshot(), await pages[1].screenshot()];
            const raw = await Promise.all(screenshots.map((buffer) => sharp(buffer).ensureAlpha().raw().toBuffer()));
            assert.equal(raw[0].length, raw[1].length);
            let differentPixels = 0;
            for (let pixel = 0; pixel < raw[0].length; pixel += 4) {
                if (!raw[0].subarray(pixel, pixel + 4).equals(raw[1].subarray(pixel, pixel + 4))) differentPixels++;
            }
            if (differentPixels) {
                fs.writeFileSync(path.join(__dirname, `baseline/diagnostic-control-${width}.png`), screenshots[0]);
                fs.writeFileSync(path.join(__dirname, `baseline/diagnostic-prepared-${width}.png`), screenshots[1]);
            }
            assert.equal(differentPixels, 0, 'The prepared viewport must still match the control at ' + width);
            const image = `baseline/${width}.webp`;
            await sharp(screenshots[0]).webp({ quality: 85 }).toFile(path.join(__dirname, image));
            assert.equal(await pages[1].evaluate(() => document.documentElement.scrollWidth), width);

            if (width === 1440) {
                await pages[1].locator('#nav-factory').hover();
                await pages[1].getByRole('link', { name: '생산거점', exact: true }).click();
                await pages[1].waitForURL('**/wonkang-ui/factory/locations.html');
                await pages[1].getByRole('link', { name: '메인페이지로 돌아가기' }).click();
                await pages[1].waitForURL('**/wonkang-ui/index.html');
            }
            assert.deepEqual(errors, []);
            assert.deepEqual(failures, []);
            results.push({
                width,
                height,
                differentPixels,
                referenceCapture: image,
                errors,
                failedResources: failures,
            });
            await context.close();
        }
        const report = {
            status: 'prepared-awaiting-user-approval',
            purpose:
                'Route, asset, source integrity and unchanged-baseline verification only; no design harness executed.',
            base,
            sourceHashesMatch: true,
            rootLinksAdjacent: true,
            results,
        };
        fs.writeFileSync(path.join(__dirname, 'baseline-verification.json'), JSON.stringify(report, null, 2) + '\n');
        console.log(JSON.stringify(report, null, 2));
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
