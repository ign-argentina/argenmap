const puppeteer = require('puppeteer');

const SHOW_BROWSER = false;

const ON_TRAVIS = process.env.TRAVIS;

before (async function () {
    let args = [];
    if (ON_TRAVIS) {
        // See https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-fails-due-to-sandbox-issues
        console.log('Disabling Chrome sandbox on Travis CI');
        args.push('--no-sandbox');
        args.push('--disable-setuid-sandbox');
    };
    let options = {
        devtools: SHOW_BROWSER,
        args: args,
    };
    global.browser = await puppeteer.launch(options);
    global.assert = require('chai').assert;
});

after (function () {
    if (!SHOW_BROWSER) {
        browser.close();
    }
});

beforeEach(async function () {
    global.page = await browser.newPage();
    await page.goto('file://' + __dirname + '/tests.html');
});

afterEach(async function () {
    if (!SHOW_BROWSER) {
        await page.close();
    }
});

