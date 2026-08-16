const { defineConfig } = require('@playwright/test');
const fs = require('node:fs');

const localChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || (fs.existsSync(localChrome) ? localChrome : undefined);

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'browser.test.js',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:8770',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 820, height: 1180 },
    launchOptions: executablePath ? { executablePath } : {}
  }
});
