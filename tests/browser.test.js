const { test, expect } = require('@playwright/test');
const { createTestServer } = require('./test-server');

let testServer;

test.beforeAll(async () => {
  testServer = createTestServer();
  await new Promise((resolve, reject) => {
    testServer.once('error', reject);
    testServer.listen(8770, '127.0.0.1', resolve);
  });
});

test.afterAll(async () => {
  testServer.closeAllConnections();
  await new Promise(resolve => testServer.close(resolve));
});

async function waitForDayReady(page, day) {
  await expect(page.locator('#offlineStatus')).toContainText(`Day ${day} 离线已就绪`, { timeout:15_000 });
}

test('existing word and speaking workflows remain available', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#appVersion')).toHaveText('v2.11');
  await expect(page).toHaveTitle('每日英语');
  await expect(page.locator('#librarySelect option')).toHaveCount(2);

  await page.getByRole('button', { name:'📥 手动导入（备用）' }).click();
  await expect(page.locator('#importPanel')).toBeVisible();
  await page.getByRole('button', { name:'🎯 选义测试' }).click();
  await expect(page.locator('#quizSection')).toBeVisible();
  await page.getByRole('button', { name:'🔤 键盘拼写' }).click();
  await expect(page.locator('#spellSection')).toBeVisible();

  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(9);
  await page.getByRole('button', { name:'▶ 听问题' }).nth(1).click();
  await expect.poll(() => page.locator('#speakingAudio').evaluate(audio => audio.currentTime)).toBeCloseTo(12.075, 2);

  await page.locator('#librarySelect').selectOption('word004.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('How do you like to travel');
});

test('missing cue file falls back to same-name complete audio', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/homework/speaking005.cues.json', route => route.fulfill({ status:404, body:'Not found' }));
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingAudio')).toBeVisible();
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(0);
  await expect(page.locator('#speakingAudioStatus')).toContainText('可播放完整录音');
  await context.close();
});

test('changed speaking text rejects stale cues and audio', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/homework/speaking005.txt', route => route.fulfill({
    status:200,
    contentType:'text/plain',
    body:'Q1: This is newly updated text.\nA1: The old recording must not play.'
  }));
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkItems')).toContainText('newly updated text');
  await expect(page.locator('#speakingAudio')).toBeHidden();
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(0);
  await expect(page.locator('#speakingAudioStatus')).toContainText('录音尚未更新');
  await context.close();
});

test('visited days reopen and seek while offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/index.html');
  await waitForDayReady(page, 5);
  await page.locator('#librarySelect').selectOption('word004.txt');
  await waitForDayReady(page, 4);
  await page.locator('#librarySelect').selectOption('word005.txt');
  await waitForDayReady(page, 5);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#learnWord')).toContainText('can');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(9);
  await page.getByRole('button', { name:'▶ 听问题' }).nth(1).click();
  await expect.poll(() => page.locator('#speakingAudio').evaluate(audio => audio.currentTime)).toBeCloseTo(12.075, 2);
  await page.locator('#librarySelect').selectOption('word004.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('How do you like to travel');
  await context.close();
});
