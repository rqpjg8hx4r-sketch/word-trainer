const { test, expect } = require('@playwright/test');
const path = require('node:path');
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
  await expect(page.locator('#appVersion')).toHaveText('v2.26');
  await expect(page).toHaveTitle('每日英语');
  await expect(page.locator('#librarySelect option')).toHaveCount(11);
  await page.locator('#librarySelect').selectOption('word007.txt');
  await page.getByRole('tab', { name:/背单词/ }).click();
  await expect(page.locator('#appSyncStatus')).toContainText(/^同步：(今天|\d{2}\/\d{2})/);

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

  await page.locator('#librarySelect').selectOption('word006.txt');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(9);
  await page.getByRole('button', { name:'▶ 听问题' }).nth(1).click();
  const q2Time = await page.locator('#speakingAudio').evaluate(audio => audio.currentTime);
  expect(q2Time).toBeGreaterThanOrEqual(12.042);
  expect(q2Time).toBeLessThan(14.5);

  await page.locator('#librarySelect').selectOption('word004.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('How do you like to travel');
});

test('the compact TT entry opens a playable typing game for the selected day', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word010.txt');

  const printButton = page.getByRole('button', { name:'🖨️ 打印默写' });
  const typingButton = page.getByRole('button', { name:'⌨️ TT' });
  await expect(typingButton).toBeVisible();
  const [printBox, typingBox] = await Promise.all([printButton.boundingBox(), typingButton.boundingBox()]);
  expect(typingBox.x).toBeLessThan(printBox.x);
  expect(typingBox.width).toBeLessThan(printBox.width);

  await typingButton.click();
  await expect(page).toHaveURL(/\/type\.html\?day=010$/);
  await expect(page.locator('#dayBadge')).toHaveText('Day 10');
  await expect(page.locator('#poolStatus')).toContainText('71 个单词');
  await expect(page.locator('#startButton')).toBeEnabled();

  await page.locator('#startButton').click();
  await expect(page.locator('.falling-word')).toHaveCount(4);
  const target = await page.evaluate(() => [...falling].sort((a,b) => b.y-a.y)[0].word.target);
  await page.locator('#typingInput').pressSequentially(target[0]);
  const lockedTarget = await page.evaluate(() => active.word.target);
  const wrongCharacter = target[1] === 'z' ? 'x' : 'z';
  await page.locator('#typingInput').pressSequentially(wrongCharacter);
  expect(await page.evaluate(() => active.word.target)).toBe(lockedTarget);
  await page.locator('#typingInput').pressSequentially(target.slice(1));
  await expect(page.locator('#scoreValue')).toHaveText('1/10');
  await expect(page.locator('#feedbackWord')).toHaveText(target);

  await page.locator('#restartButton').click();
  const missedTarget = await page.evaluate(() => {
    const item = [...falling].sort((a,b) => b.y-a.y)[0];
    active = item;
    item.element.classList.add('active');
    missWord(item);
    return item.word.target;
  });
  await expect(page.locator('#lifeValue')).toHaveText('♥♥♥♥');
  await expect(page.locator('#feedbackWord')).toHaveText(missedTarget);
  await expect(page.locator('#feedbackMeaning')).toContainText('漏掉了：');
  await expect(page.locator('.falling-word.missed')).toHaveCount(1);
  expect(await page.evaluate(() => active)).toBeNull();
  await expect(page.locator('.falling-word.missed')).toHaveCount(0, { timeout:1_000 });

  await page.evaluate(() => {
    score = 9;
    currentCombo = 4;
    bestCombo = 4;
    correctKeys = 90;
    wrongKeys = 0;
    hitWord(falling[0]);
  });
  await expect(page.locator('#overlay')).toBeVisible();
  await expect(page.locator('#overlayTitle')).toHaveText('闯关成功！');
  await expect(page.locator('#scoreValue')).toHaveText('10/10');
  await expect(page.locator('#comboValue')).toHaveText('×5');
  await expect(page.locator('#resultStars .earned')).toHaveCount(3);
  await expect(page.locator('#resultStars')).toHaveAttribute('aria-label', '获得 3 颗星');
  await expect(page.locator('#overlayText')).toContainText('最高连击 5');

  await page.locator('#startButton').click();
  await expect(page.locator('#overlay')).toBeHidden();
  await expect(page.locator('#scoreValue')).toHaveText('0/10');
  await expect(page.locator('#lifeValue')).toHaveText('♥♥♥♥♥');
});

test('word cues play recorded ranges and missing ranges fall back to system TTS', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word010.txt');
  await expect.poll(() => page.evaluate(() => wordAudioCues.size)).toBeGreaterThan(0);

  const recorded = await page.evaluate(async () => {
    window.__ttsSpoken = [];
    window.__recordedStarts = [];
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = utterance => window.__ttsSpoken.push(utterance.text);
    wordAudio.play = () => {
      window.__recordedStarts.push(wordAudio.currentTime);
      return Promise.resolve();
    };
    [...wordAudioCues.keys()].forEach(speak);
    return {
      starts:[...window.__recordedStarts],
      cueStarts:[...wordAudioCues.values()].map(cue => Math.max(0, cue.start - WORD_AUDIO_PREROLL_SECONDS)),
      tts:[...window.__ttsSpoken]
    };
  });
  expect(recorded.starts.length).toBeGreaterThan(0);
  expect(recorded.starts).toHaveLength(recorded.cueStarts.length);
  recorded.starts.forEach((start, index) => expect(start).toBeCloseTo(recorded.cueStarts[index], 3));
  if (recorded.starts.length > 1) expect(recorded.starts[1]).toBeGreaterThan(0);
  expect(recorded.tts).toEqual([]);

  await context.close();
});

test('missing optional word audio falls back to system TTS', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word008.txt');
  await expect.poll(() => page.evaluate(() => wordAudioCues.size)).toBe(0);
  const spoken = await page.evaluate(() => {
    window.__ttsSpoken = [];
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = utterance => window.__ttsSpoken.push(utterance.text);
    speak(remoteLibraryCache['word008.txt'].words[0].w);
    return window.__ttsSpoken;
  });
  expect(spoken).toHaveLength(1);
  await context.close();
});

test('a missing word cue falls back to system TTS while other recorded words remain available', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word009.txt');
  await expect.poll(() => page.evaluate(() => wordAudioCues.size)).toBeGreaterThan(0);
  const result = await page.evaluate(() => {
    window.__ttsSpoken = [];
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = utterance => window.__ttsSpoken.push(utterance.text);
    const hasRecordedEntrance = wordAudioCues.has('entrance');
    const hasRecordedBlock = wordAudioCues.has('block');
    speak('block');
    return { hasRecordedEntrance, hasRecordedBlock, tts:window.__ttsSpoken };
  });
  expect(result.hasRecordedEntrance).toBe(true);
  expect(result.hasRecordedBlock).toBe(false);
  expect(result.tts).toEqual(['block']);
  await context.close();
});

test('visited word recordings remain available offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word011.txt');
  await expect.poll(() => page.evaluate(() => wordAudioCues.size)).toBeGreaterThan(0);
  const onlineCueCount = await page.evaluate(() => wordAudioCues.size);
  await expect.poll(() => page.evaluate(async () => {
    const cache = await caches.open('word-trainer-homework-v1');
    const names = ['word011.txt', 'word011.cues.json', 'word011.mp3'];
    const matches = await Promise.all(names.map(name => cache.match(`homework/${name}`)));
    return matches.every(Boolean);
  }), { timeout:15_000 }).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect.poll(() => page.evaluate(() => wordAudioCues.size)).toBe(onlineCueCount);
  const playback = await page.evaluate(() => {
    window.__ttsSpoken = [];
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = utterance => window.__ttsSpoken.push(utterance.text);
    wordAudio.play = () => Promise.resolve();
    speak('luck');
    return { currentTime:wordAudio.currentTime, tts:window.__ttsSpoken };
  });
  expect(playback.currentTime).toBeGreaterThan(0);
  expect(playback.tts).toEqual([]);
  await context.close();
});

test('word dictation prints the complete day with Chinese cues only', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word002.txt');
  await page.getByRole('tab', { name:/背单词/ }).click();

  const toolbarLabels = await page.locator('#wordsArea .toolbar button').allTextContents();
  expect(toolbarLabels).toEqual(['📥 手动导入（备用）', '📊 学习历史', '⌨️ TT', '🖨️ 打印默写']);

  await page.evaluate(() => {
    window.__printCalled = false;
    window.print = () => { window.__printCalled = true; };
  });
  await page.getByRole('button', { name:'🖨️ 打印默写' }).click();

  await expect(page.locator('#printSheetTitle')).toHaveText('第 2 天单词默写（94词）');
  await expect(page.locator('#printWordList .print-item')).toHaveCount(94);
  await expect(page.locator('#printWordList')).toContainText('n. 地址');
  await expect(page.locator('#printWordList')).not.toContainText('address');
  await expect.poll(() => page.evaluate(() => window.__printCalled)).toBe(true);
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
  await page.locator('#librarySelect').selectOption('word007.txt');
  await waitForDayReady(page, 7);
  await page.locator('#librarySelect').selectOption('word004.txt');
  await waitForDayReady(page, 4);
  await page.locator('#librarySelect').selectOption('word005.txt');
  await waitForDayReady(page, 5);
  await page.locator('#librarySelect').selectOption('word006.txt');
  await waitForDayReady(page, 6);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#learnWord')).toContainText('ball');
  await page.locator('#librarySelect').selectOption('word007.txt');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkImage')).toBeVisible();
  await page.locator('#librarySelect').selectOption('word006.txt');
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(9);
  await page.getByRole('button', { name:'▶ 听问题' }).nth(1).click();
  const offlineQ2Time = await page.locator('#speakingAudio').evaluate(audio => audio.currentTime);
  expect(offlineQ2Time).toBeGreaterThanOrEqual(12.042);
  expect(offlineQ2Time).toBeLessThan(14.5);
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
  let markDay7Requested;
  const day7Requested = new Promise(resolve => { markDay7Requested = resolve; });
  await page.route('**/homework/speaking007.txt', async route => {
    markDay7Requested();
    await new Promise(resolve => setTimeout(resolve, 800));
    await route.fulfill({ status:404, body:'Not found' });
  });
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word007.txt');
  await day7Requested;
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await page.locator('#librarySelect').selectOption('word005.txt');
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 5');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('What is your favourite subject');
  await page.waitForTimeout(1_000);
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 5');
  await context.close();
});

test('spelling skips fixed punctuation and supports previous and next navigation', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#librarySelect option')).toHaveCount(11);
  await page.locator('#librarySelect').selectOption('word004.txt');
  await page.getByRole('tab', { name:/背单词/ }).click();
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
  await page.getByRole('button', { name:'下一个 →' }).click();
  await expect(page.locator('#spellMeaning')).toHaveText('阿姨；姑妈');
  await page.getByRole('button', { name:'← 上一个' }).click();
  await expect(page.locator('#spellMeaning')).toHaveText('古典音乐');
  await page.getByRole('button', { name:'下一个 →' }).click();
  await expect(page.locator('#spellMeaning')).toHaveText('阿姨；姑妈');
});

test('speaking accepts Q and A labels without numbers', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/homework/speaking007.txt', route => route.fulfill({
    status:200,
    contentType:'text/plain',
    body:'Q: What is your favourite programme?\nA: I like animal programmes.\n\nQ: Why?\nA: Because I can learn about animals.'
  }));
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word007.txt');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkItems')).toContainText('Q1: What is your favourite programme?');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('A2: Because I can learn about animals.');
  await context.close();
});

test('speaking displays the complete text when there are no Q or A labels', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/homework/speaking007.txt', route => route.fulfill({
    status:200,
    contentType:'text/plain',
    body:'Listen to this short story.\n\nThe cat sat by the window.\nThen it went outside to play.'
  }));
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word007.txt');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  await expect(page.locator('#speakingHomeworkItems')).toContainText('Listen to this short story.');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('Then it went outside to play.');
  await expect(page.locator('#speakingHomeworkItems strong')).toHaveCount(0);
  await context.close();
});

test('speaking automatically displays and removes an optional same-name image', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word007.txt');
  await page.getByRole('tab', { name:/口语练习/ }).click();
  const image = page.locator('#speakingHomeworkImage');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(element => element.naturalWidth)).toBeGreaterThan(0);

  await page.locator('#librarySelect').selectOption('word006.txt');
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
  await expect(image).toBeHidden();
});

test('a day loads its matching listening audio', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.goto('/index.html');
  await expect(page.locator('#librarySelect option')).toHaveCount(11);
  await page.locator('#librarySelect').selectOption('word008.txt');
  await page.getByRole('tab', { name:/听力练习/ }).click();
  await expect(page.locator('#listeningBadge')).toContainText('Day 8 · 听力');
  await expect(page.locator('#listeningAudio')).toBeHidden();
  await expect(page.locator('#listeningPlayer')).toBeVisible();
  await expect(page.locator('#listeningPlayer .speed-btn')).toHaveCount(4);
  await expect(page.locator('#listeningPlayer .player-btn')).toHaveCount(4);
  await expect(page.locator('#listeningAudio')).toHaveAttribute('src', 'homework/listening008.mp3');
  await page.locator('#listeningPlayer .speed-btn[data-speed="1"]').click();
  await expect.poll(() => page.locator('#listeningAudio').evaluate(audio => audio.playbackRate)).toBe(1);

  await page.locator('#librarySelect').selectOption('word007.txt');
  await expect(page.locator('#listeningBadge')).toContainText('Day 7 · 暂无听力');
  await expect(page.locator('#listeningPlayer')).toBeHidden();
  await context.close();
});

test('practice automatically supports audio-only and text with cue segments', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/__practice-index.json', route => route.fulfill({
    status:200,
    contentType:'application/json',
    body:JSON.stringify({ files:[
      'general001.m4a',
      'general001.txt',
      'general001.cues.json',
      'listening001.mp3'
    ] })
  }));
  await page.route('**/practice/general001.txt', route => route.fulfill({
    status:200,
    contentType:'text/plain',
    body:'# Title: Everyday Conversation\n\nQ1: How are you?\nA1: I am great, thank you.'
  }));
  await page.route('**/practice/general001.cues.json', route => route.fulfill({
    status:200,
    contentType:'application/json',
    body:JSON.stringify({
      audio:'general001.m4a',
      segments:{ q1:{ start:0.2, end:1.1 }, a1:{ start:1.3, end:2.8 } }
    })
  }));
  const sampleAudio = path.resolve(__dirname, '..', 'homework', 'speaking001.m4a');
  await page.route('**/practice/general001.m4a', route => route.fulfill({ status:200, contentType:'audio/mp4', path:sampleAudio }));
  await page.route('**/practice/listening001.mp3', route => route.fulfill({ status:200, contentType:'audio/mpeg', path:sampleAudio }));

  await page.goto('/index.html');
  await page.getByRole('tab', { name:/日常练习/ }).click();
  await expect(page.locator('#practiceSelect option')).toHaveCount(2);
  await expect(page.locator('#practiceTitle')).toContainText('Everyday Conversation');
  await expect(page.locator('#practiceBadge')).toHaveText('可分段');
  await expect(page.locator('#practiceItems')).toContainText('Q1: How are you?');
  await expect(page.locator('#practiceItems button')).toHaveCount(3);
  await expect(page.locator('#practiceAudio')).toBeHidden();
  await expect(page.locator('#practicePlayer')).toBeVisible();
  await expect(page.locator('#practicePlayer .speed-btn')).toHaveCount(4);
  await expect(page.locator('#practicePlayer .player-btn')).toHaveCount(4);
  await page.locator('#practiceRepeatBtn').click();
  await expect(page.locator('#practiceRepeatBtn')).toContainText('循环开启');

  await page.locator('#practiceSelect').selectOption('listening001');
  await expect(page.locator('#practiceBadge')).toHaveText('纯音频');
  await expect(page.locator('#practiceItems')).toBeEmpty();
  await expect(page.locator('#practiceAudio')).toHaveAttribute('src', 'practice/listening001.mp3');
  await context.close();
});
