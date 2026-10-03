const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createTestServer } = require('./test-server');

let testServer;
const homeworkDir = path.resolve(__dirname, '..', 'english', 'word');
const expectedWordMaterials = new Set(
  fs.readdirSync(homeworkDir)
    .map(file => file.match(/^(?:word|paraphrase)(\d{3})\./i)?.[1])
    .filter(Boolean)
).size;

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

test('cube fullscreen includes playback controls, resizes the canvas and preserves the current step', async ({ page }) => {
  await page.goto('/games/cube.html');
  await expect(page.locator('#cubeCanvasContainer canvas')).toBeVisible();
  const initial = await page.locator('#cubeCanvasContainer').boundingBox();
  await page.getByRole('button', { name:'⛶ 全屏', exact:true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('cubePractice');
  await expect(page.locator('#btnFullscreen')).toHaveText('⛶ 退出全屏');
  await expect(page.locator('#btnPlayPause')).toBeVisible();
  await expect(page.locator('#tokensStream')).toBeVisible();
  await expect.poll(() => page.locator('#cubeCanvasContainer').evaluate(container => container.clientHeight)).toBeGreaterThan(initial.height);
  await expect.poll(() => page.locator('#cubeCanvasContainer').evaluate(container =>
    container.querySelector('canvas').clientHeight === container.clientHeight
    && container.querySelector('canvas').clientWidth === container.clientWidth
  )).toBe(true);
  await page.getByRole('button', { name:'❯', exact:true }).click();
  await expect(page.locator('#stepCounterDisplay')).toContainText('1 /');
  await page.locator('#btnFullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null);
  await expect(page.locator('#btnFullscreen')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#stepCounterDisplay')).toContainText('1 /');
  await expect.poll(() => page.locator('#cubeCanvasContainer').evaluate(container => container.clientHeight)).toBe(initial.height);
  await page.locator('#btnFullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('cubePractice');
  await page.evaluate(() => document.exitFullscreen());
  await expect(page.locator('#btnFullscreen')).toHaveText('⛶ 全屏');
});

for (const [mode, viewport] of [['missing', { width:390, height:844 }], ['rejected', { width:844, height:390 }]]) {
  test(`cube fullscreen fallback works when the browser API is ${mode}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto('/games/cube.html');
    await expect(page.locator('#cubeCanvasContainer canvas')).toBeVisible();
    await page.evaluate(mode => {
      document.body.style.overflow = 'auto';
      const panel = document.getElementById('cubePractice');
      panel.requestFullscreen = mode === 'missing' ? undefined : () => Promise.reject(new Error('Fullscreen unavailable'));
      panel.webkitRequestFullscreen = undefined;
    }, mode);
    await page.locator('#btnFullscreen').click();
    await expect(page.locator('#cubePractice')).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('#btnFullscreen')).toHaveText('⛶ 退出全屏');
    const bounds = await page.locator('#cubePractice').boundingBox();
    expect(bounds).toEqual({ x:0, y:0, width:viewport.width, height:viewport.height });
    await expect(page.locator('#btnPlayPause')).toBeVisible();
    await expect.poll(() => page.locator('#cubeCanvasContainer').evaluate(container =>
      container.querySelector('canvas').clientHeight === container.clientHeight
      && container.querySelector('canvas').clientWidth === container.clientWidth
    )).toBe(true);
    await page.locator('#btnFullscreen').click();
    await expect(page.locator('#btnFullscreen')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#cubePractice')).not.toHaveAttribute('aria-modal');
    await page.locator('#btnFullscreen').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#btnFullscreen')).toHaveText('⛶ 全屏');
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('auto');
    expect(await page.locator('.topbar').evaluate(element => element.inert)).toBe(false);
    await context.close();
  });
}

test('English categories still load through an already running legacy preview server', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/__english-index.json?category=*', route => route.fulfill({ status:404, body:'Not found' }));
  await page.goto('/index.html');
  await expect(page.locator('#librarySelect option')).toHaveCount(expectedWordMaterials);
  await page.getByRole('tab', { name:/听力/ }).click();
  await expect(page.locator('#listeningSelect option')).toHaveCount(4);
  await expect(page.locator('#listeningStatus')).not.toContainText('404');
  await page.getByRole('tab', { name:/口语/ }).click();
  await expect(page.locator('#speakingSelect option')).toHaveCount(14);
  await expect(page.locator('#speakingLibraryStatus')).toContainText('共 14 份');
  await page.getByRole('tab', { name:/写作/ }).click();
  await expect(page.locator('#writingSelect option')).toHaveCount(8);
  await expect(page.locator('#writingTitle')).toContainText('A bike accident');
  await expect(page.locator('#writingStatus')).not.toContainText('404');
  await context.close();
});

test('all four homepages keep the same navigation and content width', async ({ browser }) => {
  for (const viewport of [{ width:1200, height:900 }, { width:390, height:844 }]) {
    const context = await browser.newContext({ viewport, serviceWorkers:'block' });
    const page = await context.newPage();
    const sizes = [];
    for (const url of ['/index.html', '/games/index.html', '/math/index.html', '/coding/index.html']) {
      await page.goto(url);
      sizes.push(await page.evaluate(() => {
        const bounds = document.querySelector('.container').getBoundingClientRect();
        const nav = document.querySelector('.site-nav').getBoundingClientRect();
        return { left:bounds.left, width:bounds.width, navLeft:nav.left, navWidth:nav.width, overflow:document.documentElement.scrollWidth > innerWidth };
      }));
    }
    for (const size of sizes) {
      expect(size).toEqual(sizes[0]);
      expect(size.navLeft).toBe(size.left);
      expect(size.navWidth).toBe(size.width);
      expect(size.overflow).toBe(false);
    }
    if (viewport.width === 1200) expect(sizes[0].width).toBe(900);
    await context.close();
  }
});

async function waitForDayReady(page, day) {
  await expect(page.locator('#offlineStatus')).toContainText(`Day ${day} 离线已就绪`, { timeout:15_000 });
}

test('existing word and speaking workflows remain available', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#appVersion')).toHaveText('v2.30');
  await expect(page).toHaveTitle('每日英语');
  await expect(page.locator('#librarySelect option')).toHaveCount(expectedWordMaterials);
  await page.locator('#librarySelect').selectOption('word007.txt');
  await page.getByRole('tab', { name:/词汇/ }).click();
  await expect(page.locator('#appSyncStatus')).toContainText(/^同步：(今天|\d{2}\/\d{2})/);
  await expect(page.locator('.header .streak-badge')).toHaveCount(0);

  const widths = await page.evaluate(() => ({
    words:document.querySelector('#wordsArea').getBoundingClientRect().width,
    tabs:document.querySelector('.main-tabs').getBoundingClientRect().width,
    card:document.querySelector('#learnSection .study-card').getBoundingClientRect().width
  }));
  expect(Math.abs(widths.words - widths.tabs)).toBeLessThanOrEqual(1);
  expect(Math.abs(widths.card - widths.words)).toBeLessThanOrEqual(1);
  await expect(page.locator('.group-selector')).toHaveCount(0);
  await expect(page.locator('#learnPosition')).toHaveText('1/60');
  expect(await page.evaluate(() => activeList.length)).toBe(60);
  await page.getByRole('button', { name:'后跳10个' }).click();
  await expect(page.locator('#learnPosition')).toHaveText('11/60');
  await page.getByRole('button', { name:'前跳10个' }).click();
  await expect(page.locator('#learnPosition')).toHaveText('1/60');
  await page.getByRole('button', { name:'← 上一个' }).click();
  await expect(page.locator('#learnPosition')).toHaveText('1/60');
  await page.getByRole('button', { name:'下一个 →' }).click();
  await expect(page.locator('#learnPosition')).toHaveText('2/60');

  const firstWord = await page.locator('#learnWord').innerText();
  await page.getByRole('button', { name:'⏱ 自动：关' }).click();
  await page.getByRole('button', { name:'2秒' }).click();
  await expect(page.getByRole('button', { name:'⏱ 自动：开' })).toBeVisible();
  await expect.poll(() => page.locator('#learnWord').innerText(), { timeout:3_500 }).not.toBe(firstWord);
  await page.getByRole('button', { name:'⏱ 自动：开' }).click();

  await page.getByRole('button', { name:'🎯 选义测试' }).click();
  await expect(page.locator('#quizSection')).toBeVisible();
  await expect(page.locator('#quizSection .streak-badge')).toHaveText('🔥 连对 0');
  await page.getByRole('button', { name:'🔤 键盘拼写' }).click();
  await expect(page.locator('#spellSection')).toBeVisible();
  await expect(page.locator('#spellSection .streak-badge')).toHaveText('🔥 连对 0');

  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking006.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(9);
  await page.getByRole('button', { name:'▶ 听问题' }).nth(1).click();
  const q2Time = await page.locator('#speakingAudio').evaluate(audio => audio.currentTime);
  expect(q2Time).toBeGreaterThanOrEqual(12.042);
  expect(q2Time).toBeLessThan(14.5);

  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking004.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('How do you like to travel');
});

test('paraphrase-only homework opens as a reversible phrase exercise', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('day014');

  await expect(page.getByRole('tab', { name:/词汇/ })).toBeEnabled();
  await expect(page.getByRole('button', { name:'🔁 同义转换' })).toBeVisible();
  await expect(page.getByRole('button', { name:'🔁 同义转换' })).toHaveClass(/active/);
  await expect(page.getByRole('button', { name:'📖 学习模式' })).toBeDisabled();
  await expect(page.getByRole('button', { name:'🎯 选义测试' })).toBeDisabled();
  await expect(page.getByRole('button', { name:'🔤 键盘拼写' })).toBeDisabled();
  await expect(page.getByRole('button', { name:'打印默写' })).toBeDisabled();
  await expect(page.getByRole('button', { name:'单词打字' })).toBeDisabled();

  await expect(page.locator('#paraphrasePosition')).toHaveText('1/42');
  await expect(page.locator('#paraphrasePromptEnglish')).toHaveText('famous');
  await expect(page.locator('#paraphrasePromptChinese')).toHaveText('有名的');
  await expect(page.locator('#paraphraseAnswer')).toBeVisible();
  await expect(page.locator('#paraphraseAnswerEnglish')).toHaveText('well-known');
  await page.getByRole('button', { name:'隐藏答案' }).click();
  await expect(page.locator('#paraphraseAnswer')).toBeHidden();
  await page.getByRole('button', { name:'⇄ A → B' }).click();
  await expect(page.locator('#paraphrasePromptEnglish')).toHaveText('well-known');
  await expect(page.locator('#paraphraseAnswer')).toBeVisible();
  await page.getByRole('button', { name:'下一个 →' }).click();
  await expect(page.locator('#paraphrasePosition')).toHaveText('2/42');
  await expect(page.locator('#paraphraseAnswer')).toBeVisible();

  const spoken = await page.evaluate(() => {
    paraphraseAudioLoadRequestId++;
    clearParaphraseAudio();
    window.__ttsSpoken = [];
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = utterance => window.__ttsSpoken.push(utterance.text);
    paraphraseIdx = paraphraseItems.findIndex(item => item.aEn === 'get / have a cold');
    paraphraseReverse = false;
    renderParaphrase();
    speakParaphraseSide('prompt');
    return window.__ttsSpoken;
  });
  expect(spoken).toEqual(['get / have a cold']);

  await page.locator('#librarySelect').selectOption('word013.txt');
  await expect(page.getByRole('button', { name:'🔁 同义转换' })).toBeHidden();
  await expect(page.getByRole('button', { name:'📖 学习模式' })).toBeEnabled();
  await expect(page.getByRole('button', { name:'单词打字' })).toBeEnabled();
});

test('paraphrase buttons prefer recorded A/B ranges and fall back when a range is missing', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  const textBytes = fs.readFileSync(path.join(homeworkDir, 'paraphrase014.txt'));
  const audioBytes = fs.readFileSync(path.join(homeworkDir, 'word010.mp3'));
  const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
  await page.route('**/english/word/paraphrase014.cues.json', route => route.fulfill({
    status:200,
    contentType:'application/json',
    body:JSON.stringify({
      audio:'paraphrase014.mp3',
      sourceHash:hash(textBytes),
      audioHash:hash(audioBytes),
      segments:{ a1:{ start:1, end:2 }, b1:{ start:2.75, end:3.5 } }
    })
  }));
  await page.route('**/english/word/paraphrase014.mp3', route => route.fulfill({
    status:200,
    contentType:'audio/mpeg',
    body:audioBytes
  }));
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('day014');
  await expect.poll(() => page.evaluate(() => paraphraseAudioCues.size)).toBe(2);

  const result = await page.evaluate(async () => {
    window.__ttsSpoken = [];
    window.__recordedStarts = [];
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = utterance => window.__ttsSpoken.push(utterance.text);
    paraphraseAudio.play = () => {
      window.__recordedStarts.push(paraphraseAudio.currentTime);
      return Promise.resolve();
    };
    paraphraseIdx = 0;
    paraphraseReverse = false;
    speakParaphraseSide('prompt');
    speakParaphraseSide('answer');
    paraphraseIdx = 1;
    speakParaphraseSide('prompt');
    return { starts:window.__recordedStarts, tts:window.__ttsSpoken };
  });
  expect(result.starts[0]).toBeCloseTo(0.75, 3);
  expect(result.starts[1]).toBeCloseTo(2.5, 3);
  expect(result.tts).toEqual(['receive']);
  await context.close();
});

test('paraphrase continuous playback reads both sides and advances to the next pair', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('day015');
  await page.evaluate(() => {
    paraphraseAudioLoadRequestId++;
    clearParaphraseAudio();
    window.__autoParaphraseSpoken = [];
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.speak = utterance => {
      window.__autoParaphraseSpoken.push(utterance.text);
      setTimeout(() => utterance.onend?.(), 0);
    };
    paraphraseIdx = 0;
    paraphraseReverse = false;
    renderParaphrase();
  });

  await page.getByRole('button', { name:'▶ 连续播放' }).click();
  await expect(page.locator('#paraphrasePosition')).toHaveText('2/40');
  await expect(page.getByRole('button', { name:'⏹ 停止连续播放' })).toBeVisible();
  expect(await page.evaluate(() => window.__autoParaphraseSpoken.slice(0, 2))).toEqual([
    'prize',
    'something the winner gets'
  ]);
  await page.getByRole('button', { name:'⏹ 停止连续播放' }).click();
  await expect(page.getByRole('button', { name:'▶ 连续播放' })).toBeVisible();
});

test('the vocabulary typing entry opens a playable game for the selected material', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word010.txt');

  expect(await page.locator('.main-tab').allTextContents()).toEqual(['📚 词汇', '🎧 听力', '🗣️ 口语', '✍️ 写作']);
  const tabXs = [];
  for (const name of [/词汇/, /听力/, /口语/, /写作/]) {
    await page.getByRole('tab', { name }).click();
    tabXs.push((await page.locator('.main-tabs').boundingBox()).x);
  }
  expect(Math.max(...tabXs)-Math.min(...tabXs)).toBeLessThanOrEqual(1);
  await page.getByRole('tab', { name:/词汇/ }).click();
  const gameButton = page.getByRole('button', { name:'单词打字' });
  await gameButton.click();
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
    const matches = await Promise.all(names.map(name => cache.match(`english/word/${name}`)));
    return matches.every(Boolean);
  }), { timeout:15_000 }).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await page.locator('#librarySelect').selectOption('word011.txt');
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
  await page.getByRole('tab', { name:/词汇/ }).click();

  await expect(page.locator('#wordsArea .toolbar')).toHaveCount(0);
  await expect(page.getByText('手动导入词库（备用）')).toHaveCount(0);
  await expect(page.getByRole('button', { name:'🕘 历史' })).toBeVisible();

  await page.evaluate(() => {
    window.__printCalled = false;
    window.print = () => { window.__printCalled = true; };
  });
  await page.getByRole('button', { name:'打印默写' }).click();

  await expect(page.locator('#printSheetTitle')).toHaveText('第 2 天单词默写（94词）');
  await expect(page.locator('#printWordList .print-item')).toHaveCount(94);
  await expect(page.locator('#printWordList')).toContainText('n. 地址');
  await expect(page.locator('#printWordList')).not.toContainText('address');
  await expect.poll(() => page.evaluate(() => window.__printCalled)).toBe(true);
});

test('missing cue file falls back to same-name complete audio', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/english/speaking/speaking005.cues.json', route => route.fulfill({ status:404, body:'Not found' }));
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking005.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  await expect(page.locator('#speakingAudio')).toBeHidden();
  await expect(page.locator('#speakingPlayer')).toBeVisible();
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(0);
  await expect(page.locator('#speakingAudioStatus')).toContainText('可播放完整录音');
  await context.close();
});

test('changed speaking text rejects stale cues and audio', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/english/speaking/speaking005.txt', route => route.fulfill({
    status:200,
    contentType:'text/plain',
    body:'Q1: This is newly updated text.\nA1: The old recording must not play.'
  }));
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking005.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  await expect(page.locator('#speakingHomeworkItems')).toContainText('newly updated text');
  await expect(page.locator('#speakingAudio')).toBeHidden();
  await expect(page.locator('#speakingHomeworkItems button')).toHaveCount(0);
  await expect(page.locator('#speakingAudioStatus')).toContainText('录音尚未更新');
  await context.close();
});

test('visited speaking materials reopen and seek while offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking005.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('What is your favourite subject');
  await expect.poll(() => page.evaluate(async () => {
    const cache = await caches.open('word-trainer-homework-v1');
    return !!await cache.match('english/speaking/speaking005.mp3');
  }), { timeout:15_000 }).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking005.txt');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('What is your favourite subject');
  await expect(page.locator('#speakingPlayer')).toBeVisible();
  await page.getByRole('button', { name:'▶ 听问题' }).first().click();
  await expect.poll(() => page.locator('#speakingAudio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
  await context.close();
});

test('a slower previous day cannot overwrite the latest selection', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/english/speaking/speaking005.m4a', async route => {
    const response = await route.fetch();
    await new Promise(resolve => setTimeout(resolve, 800));
    await route.fulfill({ response });
  });
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking005.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking006.txt');
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
  await page.route('**/english/speaking/speaking007.txt', async route => {
    markDay7Requested();
    await new Promise(resolve => setTimeout(resolve, 800));
    await route.fulfill({ status:404, body:'Not found' });
  });
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking007.txt');
  await day7Requested;
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking005.txt');
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 5');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('What is your favourite subject');
  await page.waitForTimeout(1_000);
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 5');
  await context.close();
});

test('spelling skips fixed punctuation and supports previous and next navigation', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#librarySelect option')).toHaveCount(expectedWordMaterials);
  await page.locator('#librarySelect').selectOption('word004.txt');
  await page.getByRole('tab', { name:/词汇/ }).click();
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
  await page.locator('#qwertyKeyboard').getByRole('button', { name:'下一个 →' }).click();
  await expect(page.locator('#spellMeaning')).toHaveText('阿姨；姑妈');
  await page.locator('#qwertyKeyboard').getByRole('button', { name:'← 上一个' }).click();
  await expect(page.locator('#spellMeaning')).toHaveText('古典音乐');
  await page.locator('#qwertyKeyboard').getByRole('button', { name:'下一个 →' }).click();
  await expect(page.locator('#spellMeaning')).toHaveText('阿姨；姑妈');
});

test('speaking accepts Q and A labels without numbers', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/english/speaking/speaking007.txt', route => route.fulfill({
    status:200,
    contentType:'text/plain',
    body:'Q: What is your favourite programme?\nA: I like animal programmes.\n\nQ: Why?\nA: Because I can learn about animals.'
  }));
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking007.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  await expect(page.locator('#speakingHomeworkItems')).toContainText('Q1: What is your favourite programme?');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('A2: Because I can learn about animals.');
  await context.close();
});

test('speaking displays the complete text when there are no Q or A labels', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/english/speaking/speaking007.txt', route => route.fulfill({
    status:200,
    contentType:'text/plain',
    body:'Listen to this short story.\n\nThe cat sat by the window.\nThen it went outside to play.'
  }));
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking007.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  await expect(page.locator('#speakingHomeworkItems')).toContainText('Listen to this short story.');
  await expect(page.locator('#speakingHomeworkItems')).toContainText('Then it went outside to play.');
  await expect(page.locator('#speakingHomeworkItems strong')).toHaveCount(0);
  await context.close();
});

test('speaking automatically displays and removes an optional same-name image', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking007.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  const image = page.locator('#speakingHomeworkImage');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(element => element.naturalWidth)).toBeGreaterThan(0);

  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking006.txt');
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
  await expect(image).toBeHidden();
});

test('listening uses independent long-term materials', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word008.txt');
  await page.getByRole('tab', { name:/听力/ }).click();
  await expect(page.locator('#listeningSelect option')).toHaveCount(4);
  await page.locator('#listeningSelect').selectOption('general002 About school');
  await expect(page.locator('#listeningAudio')).toHaveAttribute('src','english/listening/general002 About school.m4a');
  await expect(page.locator('#listeningPlayer')).toBeVisible();
  await page.locator('#listeningPlayer .speed-btn[data-speed="1"]').click();
  await expect.poll(() => page.locator('#listeningAudio').evaluate(audio => audio.playbackRate)).toBe(1);
  await page.getByRole('tab', { name:/词汇/ }).click();
  await page.locator('#librarySelect').selectOption('word007.txt');
  await page.getByRole('tab', { name:/听力/ }).click();
  await expect(page.locator('#listeningSelect')).toHaveValue('general002 About school');
  await expect(page.locator('#listeningAudio')).toHaveAttribute('src','english/listening/general002 About school.m4a');
  await context.close();
});

test('listening automatically supports audio-only and text with cue segments', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/__english-index.json?category=listening', route => route.fulfill({
    status:200,
    contentType:'application/json',
    body:JSON.stringify({ files:[
      'general001.m4a',
      'general001.txt',
      'general001.cues.json',
      'listening001.mp3'
    ] })
  }));
  await page.route('**/english/listening/general001.txt', route => route.fulfill({
    status:200,
    contentType:'text/plain',
    body:'# Title: Everyday Conversation\n\nQ1: How are you?\nA1: I am great, thank you.'
  }));
  await page.route('**/english/listening/general001.cues.json', route => route.fulfill({
    status:200,
    contentType:'application/json',
    body:JSON.stringify({
      audio:'general001.m4a',
      segments:{ q1:{ start:0.2, end:1.1 }, a1:{ start:1.3, end:2.8 } }
    })
  }));
  const sampleAudio = path.resolve(__dirname, '..', 'english', 'speaking', 'speaking001.m4a');
  await page.route('**/english/listening/general001.m4a', route => route.fulfill({ status:200, contentType:'audio/mp4', path:sampleAudio }));
  await page.route('**/english/listening/listening001.mp3', route => route.fulfill({ status:200, contentType:'audio/mpeg', path:sampleAudio }));

  await page.goto('/index.html');
  await page.getByRole('tab', { name:/听力/ }).click();
  await expect(page.locator('#listeningSelect option')).toHaveCount(2);
  await expect(page.locator('#listeningTitle')).toContainText('Everyday Conversation');
  await expect(page.locator('#listeningBadge')).toHaveText('可分段');
  await expect(page.locator('#listeningItems')).toContainText('Q1: How are you?');
  await expect(page.locator('#listeningItems button')).toHaveCount(3);
  await expect(page.locator('#listeningAudio')).toBeHidden();
  await expect(page.locator('#listeningPlayer')).toBeVisible();
  await expect(page.locator('#listeningPlayer .speed-btn')).toHaveCount(4);
  await expect(page.locator('#listeningPlayer .player-btn')).toHaveCount(4);
  await page.locator('#listeningRepeatBtn').click();
  await expect(page.locator('#listeningRepeatBtn')).toContainText('循环开启');

  await page.locator('#listeningSelect').selectOption('listening001');
  await expect(page.locator('#listeningBadge')).toHaveText('纯音频');
  await expect(page.locator('#listeningItems')).toBeEmpty();
  await expect(page.locator('#listeningAudio')).toHaveAttribute('src', 'english/listening/listening001.mp3');
  await context.close();
});

test('speaking and vocabulary selections remain independent', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#librarySelect').selectOption('word004.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  await page.locator('#speakingSelect').selectOption('speaking006.txt');
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
  await page.getByRole('tab', { name:/词汇/ }).click();
  await expect(page.locator('#librarySelect')).toHaveValue('word004.txt');
  await page.locator('#librarySelect').selectOption('word007.txt');
  await page.getByRole('tab', { name:/口语/ }).click();
  await expect(page.locator('#speakingSelect')).toHaveValue('speaking006.txt');
  await expect(page.locator('#speakingHomeworkBadge')).toContainText('Day 6');
});

test('writing displays question, reference and tips with an optional same-name image', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/__english-index.json?category=writing', route => route.fulfill({
    contentType:'application/json', body:JSON.stringify({ files:['writing901.txt','writing901.png','writing902.txt'] })
  }));
  const text = '#title: Writing 901 | Email: A cinema invitation\n\n#question\n\nInvite your friend to the cinema.\n\n#answer\n\nHi Jay, would you like to come with me?\n\n#tip\n\nInvite → Suggest → Reason → End';
  await page.route('**/english/writing/writing901.txt', route => route.fulfill({ contentType:'text/plain', body:text }));
  await page.route('**/english/writing/writing902.txt', route => route.fulfill({ contentType:'text/plain', body:'QUESTION\nWrite about your favourite sport.\n\nANSWER\nI like fencing.' }));
  await page.route('**/english/writing/writing901.png', route => route.fulfill({
    contentType:'image/png', body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII=', 'base64')
  }));
  await page.goto('/index.html');
  await expect(page.locator('#mainTabWords')).toHaveAttribute('aria-selected','true');
  await page.getByRole('tab', { name:/写作/ }).click();
  await page.locator('#writingSelect').selectOption('writing901.txt');
  await expect(page.locator('#writingItems')).toContainText('Invite your friend to the cinema.');
  await expect(page.locator('#writingTitle')).toHaveText('✍️ Writing 901 | Email: A cinema invitation');
  await expect(page.locator('#writingItems')).toContainText('Invite → Suggest → Reason → End');
  const answer = page.locator('#writingItems details').filter({ has:page.locator('summary', { hasText:'参考答案' }) });
  await expect(answer.locator('.material-text')).toBeHidden();
  await answer.locator('summary').click();
  await expect(answer.locator('.material-text')).toContainText('Hi Jay');
  await expect(page.locator('#writingImage')).toBeVisible();
  await expect.poll(() => page.locator('#writingImage').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await page.locator('#writingSelect').selectOption('writing902.txt');
  await expect(page.locator('#writingItems')).toContainText('favourite sport');
  await expect(page.locator('#writingImage')).toBeHidden();
  await context.close();
});

test('directory migration keeps old records and downloaded content, and defaults to vocabulary', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/type.html?day=001');
  const stats = { 'day-001--001':{ learn:3, quizCorrect:2, quizWrong:1, spellCorrect:4, spellWrong:0, lastAt:1234 } };
  await page.evaluate(async stats => {
    localStorage.setItem('wordTrainerV1', JSON.stringify({ days:{ 'day-001':{
      title:'Existing lesson', createdAt:1234, words:[{ id:'day-001--001', w:'example', pos:'n.', m:'例子' }], stats
    } } }));
    localStorage.setItem('wordTrainerMainArea','speaking');
    const cache = await caches.open('word-trainer-homework-v1');
    await cache.put('homework/word999.mp3', new Response('old word recording'));
    await cache.put('homework/speaking999.txt', new Response('old speaking text'));
    await cache.put('practice/archive.txt', new Response('old listening text'));
  }, stats);
  await page.goto('/index.html');
  await expect(page.locator('#mainTabWords')).toHaveAttribute('aria-selected','true');
  await expect.poll(() => page.evaluate(async () => {
    const cache = await caches.open('word-trainer-homework-v1');
    return !!await cache.match('english/word/word999.mp3');
  })).toBe(true);
  const preserved = await page.evaluate(async () => {
    const cache = await caches.open('word-trainer-homework-v1');
    const paths = ['english/word/word999.mp3', 'english/speaking/speaking999.txt', 'english/listening/archive.txt'];
    const contents = await Promise.all(paths.map(async path => (await cache.match(path)).text()));
    return { stats:JSON.parse(localStorage.getItem('wordTrainerV1')).days['day-001'].stats, contents };
  });
  expect(preserved.stats).toEqual(stats);
  expect(preserved.contents).toEqual(['old word recording','old speaking text','old listening text']);
  await context.close();
});

test('writing answer speech reuses player controls and stops when leaving writing', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  await page.route('**/__english-index.json?category=writing', route => route.fulfill({
    contentType:'application/json', body:JSON.stringify({ files:['writing001.txt'] })
  }));
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/写作/ }).click();
  await page.locator('#writingSelect').selectOption('writing001.txt');
  await page.locator('#writingAnswerSection summary').click();
  await page.evaluate(() => {
    window.__writingSpoken = [];
    window.__writingPauses = 0;
    window.speechSynthesis.cancel = () => {};
    window.speechSynthesis.pause = () => window.__writingPauses++;
    window.speechSynthesis.resume = () => {};
    window.speechSynthesis.speak = utterance => {
      window.__writingUtterance = utterance;
      window.__writingSpoken.push({ text:utterance.text, rate:utterance.rate });
    };
  });
  await page.locator('#writingPlayer').getByRole('button', { name:'▶ 听答案' }).click();
  const first = await page.evaluate(() => window.__writingSpoken[0]);
  expect(first.text).toContain('Hi Jay,');
  expect(first.text).not.toContain('QUESTION');
  expect(first.text).not.toContain('Invite:');
  expect(first.rate).toBeCloseTo(0.85, 5);
  await page.locator('#writingPlayer .speed-btn[data-speed="1.25"]').click();
  expect(await page.evaluate(() => window.__writingSpoken.at(-1).rate)).toBe(1.25);
  await page.locator('#writingPauseBtn').click();
  await expect(page.locator('#writingPauseBtn')).toHaveText('▶ 继续');
  expect(await page.evaluate(() => window.__writingPauses)).toBe(1);
  await page.locator('#writingPauseBtn').click();
  await expect(page.locator('#writingPauseBtn')).toHaveText('⏸ 暂停');
  await page.locator('#writingRepeatBtn').click();
  await page.evaluate(() => window.__writingUtterance.onend());
  expect(await page.evaluate(() => window.__writingSpoken.length)).toBe(3);
  await page.getByRole('tab', { name:/词汇/ }).click();
  await page.evaluate(() => window.__writingUtterance.onend());
  expect(await page.evaluate(() => window.__writingSpoken.length)).toBe(3);
  await context.close();
});

test('writing prefers matching answer recordings and seeks to the answer cue', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers:'block' });
  const page = await context.newPage();
  const text = 'QUESTION\nInvite a friend.\n\nANSWER\nHi Jay, come to the cinema with me.\n\nWRITING TIP\nGive a reason.';
  const audio = fs.readFileSync(path.resolve(__dirname, '..', 'english', 'speaking', 'speaking001.m4a'));
  await page.route('**/__english-index.json?category=writing', route => route.fulfill({
    contentType:'application/json', body:JSON.stringify({ files:['writing901.txt','writing901.m4a','writing901.cues.json'] })
  }));
  await page.route('**/english/writing/writing901.txt', route => route.fulfill({ contentType:'text/plain', body:text }));
  await page.route('**/english/writing/writing901.m4a', route => route.fulfill({ contentType:'audio/mp4', body:audio }));
  await page.route('**/english/writing/writing901.cues.json', route => route.fulfill({
    contentType:'application/json', body:JSON.stringify({
      audio:'writing901.m4a', sourceHash:crypto.createHash('sha256').update(text).digest('hex'),
      audioHash:crypto.createHash('sha256').update(audio).digest('hex'), segments:{ a1:{ start:1.25, end:2.5 } }
    })
  }));
  await page.goto('/index.html');
  await page.getByRole('tab', { name:/写作/ }).click();
  await expect(page.locator('#writingAudioStatus')).toContainText('播放答案片段');
  await page.locator('#writingAnswerSection summary').click();
  await page.evaluate(() => {
    window.__writingRecordedStarts = [];
    document.getElementById('writingAudio').play = () => {
      window.__writingRecordedStarts.push(document.getElementById('writingAudio').currentTime);
      return Promise.resolve();
    };
    window.speechSynthesis.speak = () => { throw new Error('Recording should be preferred'); };
  });
  await page.locator('#writingPlayer').getByRole('button', { name:'▶ 听答案' }).click();
  expect(await page.evaluate(() => window.__writingRecordedStarts)).toEqual([1.25]);
  await context.close();
});
