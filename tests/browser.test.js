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
  await expect(page.locator('#appVersion')).toHaveText('v2.17');
  await expect(page.locator('#appSyncStatus')).toContainText(/^同步：(今天|\d{2}\/\d{2})/);
  await expect(page).toHaveTitle('每日英语');
  await expect(page.locator('#librarySelect option')).toHaveCount(3);

  const widths = await page.evaluate(() => ({
    words:document.querySelector('#wordsArea').getBoundingClientRect().width,
    tabs:document.querySelector('.main-tabs').getBoundingClientRect().width,
    card:document.querySelector('#learnSection .study-card').getBoundingClientRect().width
  }));
  expect(Math.abs(widths.words - widths.tabs)).toBeLessThanOrEqual(1);
  expect(widths.card).toBeLessThanOrEqual(480);

  const firstWord = await page.locator('#learnWord').innerText();
  await page.getByRole('button', { name:'⏱ 自动：关' }).click();
  await page.getByRole('button', { name:'2秒' }).click();
  await expect(page.getByRole('button', { name:'⏱ 自动：开' })).toBeVisible();
  await expect.poll(() => page.locator('#learnWord').innerText(), { timeout:3_500 }).not.toBe(firstWord);
  await page.getByRole('button', { name:'⏱ 自动：开' }).click();

  await page.getByRole('button', { name:'📥 手动导入（备用）' }).click();
  await expect(page.locator('#importPanel')).toBeVisible();
  await page.getByRole('button', { name:'🎯 选义测试' }).click();
  await expect(page.locator('#quizSection')).toBeVisible();
  await page.getByRole('button', { name:'🔤 键盘拼写' }).click();
  await expect(page.locator('#spellSection')).toBeVisible();

  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(9);
  await page.getByRole('button', { name:'▶ 听问题' }).nth(1).click();
  await expect.poll(() => page.locator('#speakingAudio').evaluate(audio => audio.currentTime)).toBeCloseTo(12.042, 2);

  await page.locator('#librarySelect').selectOption('word004.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('How do you like to travel');
});

test('missing cue file falls back to same-name complete audio', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/homework/speaking005.cues.json', route => route.fulfill({ status:404, body:'Not found' }));
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word005.txt');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingAudio')).toBeHidden();
  await expect(page.locator('#speakingPlayer')).toBeVisible();
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
  await page.locator('#librarySelect').selectOption('word005.txt');
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
  await waitForDayReady(page, 6);
  await page.locator('#librarySelect').selectOption('word004.txt');
  await waitForDayReady(page, 4);
  await page.locator('#librarySelect').selectOption('word005.txt');
  await waitForDayReady(page, 5);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#learnWord')).toContainText('accident');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(9);
  await page.getByRole('button', { name:'▶ 听问题' }).nth(1).click();
  await expect.poll(() => page.locator('#speakingAudio').evaluate(audio => audio.currentTime)).toBeCloseTo(12.042, 2);
  await page.locator('#librarySelect').selectOption('word005.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('What is your favourite subject');
  await page.locator('#librarySelect').selectOption('word004.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('How do you like to travel');
  await context.close();
});

test('a slower previous day cannot overwrite the latest selection', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/homework/speaking005.m4a', async route => {
    const response = await route.fetch();
    await new Promise(resolve => setTimeout(resolve, 800));
    await route.fulfill({ response });
  });
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word005.txt');
  await page.locator('#librarySelect').selectOption('word006.txt');
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('Is there a sports centre near your home');
  await page.waitForTimeout(1_000);
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
  await context.close();
});

test('a missing latest speaking day cannot overwrite an older selection', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  let markDay6Requested;
  const day6Requested = new Promise(resolve => { markDay6Requested = resolve; });
  await page.route('**/homework/speaking006.txt', async route => {
    markDay6Requested();
    await new Promise(resolve => setTimeout(resolve, 800));
    await route.fulfill({ status:404, body:'Not found' });
  });
  await page.goto('/index.html');
  await day6Requested;
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await page.locator('#librarySelect').selectOption('word005.txt');
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 5');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('What is your favourite subject');
  await page.waitForTimeout(1_000);
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 5');
  await context.close();
});

test('spelling skips fixed punctuation and always allows moving on', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#librarySelect option')).toHaveCount(3);
  await page.locator('#librarySelect').selectOption('word004.txt');
  await page.evaluate(() => {
    const words = remoteLibraryCache['word004.txt'].words;
    const punctuated = words.find(item => item.w === 'classical (music)');
    const next = words.find(item => item.w === 'aunt');
    activeList = [punctuated, next];
    spellPool = [punctuated, next];
    currentMode = 'spell';
    document.getElementById('spellSection').style.display = 'block';
    renderSpell();
  });

  await expect(page.locator('#spellSlots .fixed')).toHaveCount(2);
  for (const letter of ['C', 'L', 'A', 'S', 'S', 'I', 'C', 'A', 'L', 'M', 'U', 'S', 'I', 'C']) {
    await page.locator('#qwertyKeyboard').getByRole('button', { name:letter, exact:true }).click();
  }
  await expect(page.locator('#spellMeaning')).toHaveText('阿姨；姑妈');

  await page.evaluate(() => {
    const words = remoteLibraryCache['word004.txt'].words;
    spellPool = [words.find(item => item.w === 'classical (music)'), words.find(item => item.w === 'aunt')];
    renderSpell();
  });
  await page.getByRole('button', { name:'跳过此词 ➜' }).click();
  await expect(page.locator('#spellMeaning')).toHaveText('阿姨；姑妈');
});
