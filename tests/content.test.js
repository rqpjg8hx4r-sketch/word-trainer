const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { parseArgs, spokenForm, wavDuration, wavPeakDb, partFilename } = require('../scripts/generate-word-audio');
const {
  parseArgs:parseSpeakingArgs,
  parseSpeaking,
  parseWritingAnswer,
  normalizeSpeechText,
  partFilename:speakingPartFilename,
  inspectAudioState
} = require('../scripts/generate-speaking-audio');
const { parseWritingMaterial } = require('../writing-material');
const { startPreview } = require('../scripts/start-preview');
const http = require('node:http');
const {
  parseArgs:parseParaphraseAudioArgs,
  spokenPhrase,
  parseParaphrases:parseParaphraseAudio,
  uniquePhrases:uniqueParaphrasePhrases,
  partFilename:paraphrasePartFilename
} = require('../scripts/generate-paraphrase-audio');

const root = path.resolve(__dirname, '..');
const homeworkDir = path.join(root, 'english', 'word');
const speakingDir = path.join(root, 'english', 'speaking');
function materialPath(name) {
  return path.join(/^speaking/i.test(name) ? speakingDir : homeworkDir, name);
}

function read(file) {
  return fs.readFileSync(materialPath(file), 'utf8');
}

function fileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(materialPath(file))).digest('hex');
}

test('writing sections stop at each # field and audio contains only the answer', () => {
  const source = '\uFEFF#title: Writing 901 | Email about games\r\n\r\n#question\r\nWhat do you play?\r\n\r\n#answer\r\nHi Jay,\r\nI like Eggy Party.\r\n\r\n#tip\r\n回答 → 理由\r\n#notes\r\nPrivate notes.';
  assert.deepEqual(parseWritingMaterial(source), {
    question:'What do you play?', answer:'Hi Jay,\nI like Eggy Party.', tips:'回答 → 理由'
  });
  assert.deepEqual(parseWritingAnswer(source), [{ index:0, key:'a1', text:'Hi Jay, I like Eggy Party.' }]);
  assert.deepEqual(parseWritingAnswer('#question\nDo this.\n#tip\nA tip.'), []);
  assert.deepEqual(parseWritingAnswer('#answer\nOnly this.\n#unknown\nNever read this.'), [{ index:0, key:'a1', text:'Only this.' }]);
  assert.equal(parseWritingMaterial('QUESTION\nOld question\nANSWER\nOld answer\nWRITING TIP\nOld tip').answer, 'Old answer');
  assert.equal(parseWritingMaterial('#QUESTION:\nQ\n#ANSWER: Inline answer\n#TIP\nT').answer, 'Inline answer');
});

test('writing audio dry-run uses shared answer parsing for every current material', () => {
  const writingDir = path.join(root, 'english', 'writing');
  const files = fs.readdirSync(writingDir).filter(name => /^writing\d{3}\.txt$/i.test(name));
  assert.ok(files.length >= 8);
  for (const file of files) {
    const input = path.join(writingDir, file);
    const source = fs.readFileSync(input, 'utf8');
    assert.match(source, /^#title: Writing \d{3} \| .+/);
    assert.match(source, /^#question$/m);
    assert.match(source, /^#answer$/m);
    assert.match(source, /^#tip$/m);
    const parts = parseWritingMaterial(source);
    assert.ok(parts.question && parts.answer && parts.tips);
    const parsed = JSON.parse(execFileSync(process.execPath, [path.join(root, 'scripts/generate-speaking-audio.js'), '--kind', 'writing', input, '--dry-run'], {
      encoding:'utf8', env:{ ...process.env, OPENAI_API_KEY:'' }
    }));
    assert.deepEqual(parsed.segments, [{ index:0, key:'a1', text:normalizeSpeechText(parts.answer) }], file);
  }
  assert.equal(parseSpeakingArgs(['--kind', 'writing', '--all-missing']).kind, 'writing');
  assert.equal(parseSpeakingArgs(['english/writing/writing001.txt']).kind, 'writing');
  assert.throws(() => parseSpeakingArgs(['--kind', 'word', '--all-missing']), /speaking or writing/);
});

test('writing audio rejects a missing answer before calling the speech API', () => {
  const fixture = path.join(os.tmpdir(), `writing-no-answer-${Date.now()}`);
  fs.mkdirSync(fixture);
  const input = path.join(fixture, 'writing901.txt');
  try {
    fs.writeFileSync(input, '#title: No answer\n#question\nQuestion only.\n#tip\nAdvice only.');
    assert.throws(() => execFileSync(process.execPath, [path.join(root, 'scripts/generate-speaking-audio.js'), input, '--dry-run'], {
      encoding:'utf8', stdio:'pipe', env:{ ...process.env, OPENAI_API_KEY:'' }
    }), error => /No writing #answer content/.test(error.stderr));
  } finally {
    fs.rmSync(input);
    fs.rmdirSync(fixture);
  }
});

test('vocabulary TXT files use supported three-digit material names', () => {
  const files = fs.readdirSync(homeworkDir);
  const textFiles = files.filter(file => file.endsWith('.txt'));
  assert.ok(textFiles.length > 0);
  for (const file of textFiles) {
    assert.match(file, /^(word|speaking|paraphrase)\d{3}\.txt$/);
    assert.ok(read(file).trim().length > 0, `${file} must not be empty`);
  }
});

test('paraphrase TXT files contain complete four-column pairs', () => {
  const files = fs.readdirSync(homeworkDir).filter(file => /^paraphrase\d{3}\.txt$/.test(file));
  for (const file of files) {
    const lines = read(file).replace(/^\uFEFF/, '').split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    assert.ok(lines.length > 0, `${file} must contain at least one pair`);
    for (const [index, line] of lines.entries()) {
      const fields = line.split('|').map(value => value.trim());
      assert.equal(fields.length, 4, `${file}:${index + 1} must contain four fields`);
      assert.ok(fields.every(Boolean), `${file}:${index + 1} contains an empty field`);
    }
  }
});

test('paraphrase audio command creates A/B keys and deduplicates repeated phrases', () => {
  const segments = parseParaphraseAudio([
    '# English A | 中文 A | English B | 中文 B',
    'get / have a cold | 感冒 | ill | 生病',
    'ill | 生病 | unwell | 不舒服'
  ].join('\n'));
  const phrases = uniqueParaphrasePhrases(segments);
  assert.deepEqual(segments.map(segment => segment.key), ['a1', 'b1', 'a2', 'b2']);
  assert.equal(segments[0].spokenText, 'get or have a cold');
  assert.equal(phrases.length, 3);
  assert.deepEqual(phrases.find(phrase => phrase.spokenText === 'ill').keys, ['b1', 'a2']);
  assert.equal(paraphrasePartFilename(phrases[0]), '001-a1-get-or-have-a-cold.wav');
  assert.equal(parseParaphraseAudioArgs(['--all-missing']).allMissing, true);
  assert.equal(spokenPhrase('big / small'), 'big or small');
});

test('paraphrase audio command dry-run reads both sides of a real lesson', () => {
  const output = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'generate-paraphrase-audio.js'),
    path.join(homeworkDir, 'paraphrase014.txt'),
    '--dry-run'
  ], { encoding:'utf8', maxBuffer:1024 * 1024 });
  const result = JSON.parse(output);
  assert.equal(result.pairs, 42);
  assert.equal(result.segments.length, 84);
  assert.equal(result.segments[0].key, 'a1');
  assert.equal(result.segments[1].key, 'b1');
  assert.ok(result.uniquePhrases.length < result.segments.length);
});

test('word audio command parses a requested entry limit without calling the API', () => {
  const output = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'generate-word-audio.js'),
    path.join(homeworkDir, 'word010.txt'),
    '--limit', '10',
    '--dry-run'
  ], { encoding:'utf8' });
  const result = JSON.parse(output);
  assert.equal(result.count, 10);
  assert.equal(result.items[0].spokenText, 'bank');
  assert.equal(result.items[3].spokenText, 'café');
  assert.equal(result.items[9].spokenText, 'cinema');
});

test('word audio command defaults to all entries when limit is omitted', () => {
  const output = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'generate-word-audio.js'),
    path.join(homeworkDir, 'word010.txt'),
    '--dry-run'
  ], { encoding:'utf8' });
  const result = JSON.parse(output);
  assert.ok(result.count > 10);
  assert.equal(result.count, result.items.length);
  assert.equal(result.items.at(-1).spokenText, 'windy');
});

test('word audio command supports generating all missing days', () => {
  const options = parseArgs(['--all-missing']);
  assert.equal(options.allMissing, true);
  assert.equal(options.input, '');
});

test('word audio command skips an existing MP3 without requiring the API', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'word-audio-skip-'));
  const input = path.join(tempDir, 'word999.txt');
  const output = path.join(tempDir, 'word999.mp3');
  const marker = Buffer.from('existing audio');
  fs.writeFileSync(input, 'example | n. | 例子\n');
  fs.writeFileSync(output, marker);
  const env = { ...process.env };
  delete env.OPENAI_API_KEY;
  try {
    const message = execFileSync(process.execPath, [
      path.join(root, 'scripts', 'generate-word-audio.js'), input
    ], { encoding:'utf8', env });
    assert.match(message, /Skipped existing/);
    assert.deepEqual(fs.readFileSync(output), marker);
  } finally {
    fs.rmSync(tempDir, { recursive:true, force:true });
  }
});

test('word audio command handles streaming WAV unknown-length headers', () => {
  const wav = Buffer.alloc(44 + 48_000);
  wav.write('RIFF', 0, 'ascii');
  wav.writeUInt32LE(0xffffffff, 4);
  wav.write('WAVE', 8, 'ascii');
  wav.write('fmt ', 12, 'ascii');
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(24_000, 24);
  wav.writeUInt32LE(48_000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36, 'ascii');
  wav.writeUInt32LE(0xffffffff, 40);
  assert.equal(wavDuration(wav), 1);
  assert.equal(wavPeakDb(wav), -Infinity);
  wav.writeInt16LE(16_384, 44);
  assert.ok(Math.abs(wavPeakDb(wav) - -6.02) < 0.02);
});

test('word audio parts use stable numbered filenames', () => {
  assert.equal(partFilename({ index:6, spokenText:'block' }), '007-block.wav');
  assert.equal(partFilename({ index:3, spokenText:'café' }), '004-cafe.wav');
  assert.equal(spokenForm('v / versus'), 'versus');
  assert.equal(spokenForm('enter (a competition)'), 'enter a competition');
  assert.equal(spokenForm('sport(s)'), 'sports');
  assert.equal(spokenForm('  children’s   race!  '), "children's race");
});

test('speaking audio command parses numbered, unnumbered, and multiline Q/A text', () => {
  const segments = parseSpeaking([
    '# Day: 14',
    'Q: Do you like it?',
    'A: Yes, I do.',
    'This continuation belongs to the answer.',
    '',
    'Q2: Why?',
    'A2: Because it is fun.'
  ].join('\n'));
  assert.deepEqual(segments.map(segment => segment.key), ['q1', 'a1', 'q2', 'a2']);
  assert.equal(segments[1].text, 'Yes, I do. This continuation belongs to the answer.');
  assert.equal(normalizeSpeechText('I don’t use mechanical TTS — ever.'), "I don't use mechanical TTS - ever.");
  assert.match(speakingPartFilename(segments[0]), /^001-q1-do-you-like-it\.wav$/);
});

test('speaking audio command supports all-missing and dry-run modes', () => {
  assert.equal(parseSpeakingArgs(['--all-missing']).allMissing, true);
  assert.equal(parseSpeakingArgs(['english/speaking/speaking014.txt', '--dry-run']).dryRun, true);
  const output = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'generate-speaking-audio.js'),
    path.join(speakingDir, 'speaking014.txt'),
    '--dry-run'
  ], { encoding:'utf8' });
  const result = JSON.parse(output);
  assert.equal(result.count, 2);
  assert.deepEqual(result.segments.map(segment => segment.key), ['q1', 'a1']);
  assert.match(result.segments[1].text, /I like running outdoors/);
});

test('speaking audio command skips an existing M4A without requiring the API', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'speaking-audio-skip-'));
  const input = path.join(tempDir, 'speaking999.txt');
  const audio = path.join(tempDir, 'speaking999.m4a');
  const text = Buffer.from('Q1: How are you?\nA1: I am fine.');
  const recording = Buffer.from('existing recording');
  fs.writeFileSync(input, text);
  fs.writeFileSync(audio, recording);
  fs.writeFileSync(path.join(tempDir, 'speaking999.cues.json'), JSON.stringify({
    audio:'speaking999.m4a',
    sourceHash:crypto.createHash('sha256').update(text).digest('hex'),
    audioHash:crypto.createHash('sha256').update(recording).digest('hex')
  }));
  const env = { ...process.env };
  delete env.OPENAI_API_KEY;
  try {
    const output = execFileSync(process.execPath, [
      path.join(root, 'scripts', 'generate-speaking-audio.js'), input
    ], { encoding:'utf8', env });
    assert.match(output, /Skipped existing .*speaking999\.m4a/i);
    assert.deepEqual(fs.readFileSync(audio), recording);
  } finally {
    assert.equal(path.dirname(tempDir), path.resolve(os.tmpdir()));
    fs.rmSync(tempDir, { recursive:true, force:true });
  }
});

test('speaking audio state detects a changed TXT from its cues fingerprint', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'speaking-audio-state-'));
  const base = path.join(tempDir, 'speaking999');
  const oldText = Buffer.from('Q: Old question.\nA: Old answer.\n');
  const newText = Buffer.from('Q: New question.\nA: New answer.\n');
  const audio = Buffer.from('existing audio');
  fs.writeFileSync(`${base}.m4a`, audio);
  fs.writeFileSync(`${base}.cues.json`, JSON.stringify({
    audio:'speaking999.m4a',
    sourceHash:crypto.createHash('sha256').update(oldText).digest('hex'),
    audioHash:crypto.createHash('sha256').update(audio).digest('hex'),
    segments:{ q1:{ start:0, end:1 }, a1:{ start:1.75, end:3 } }
  }));
  try {
    assert.equal(inspectAudioState(base, oldText).status, 'up-to-date');
    assert.equal(inspectAudioState(base, newText).status, 'stale');
  } finally {
    fs.rmSync(tempDir, { recursive:true, force:true });
  }
});

test('speaking TXT files contain displayable text', () => {
  const files = fs.readdirSync(speakingDir).filter(file => /^speaking\d{3}\.txt$/.test(file));
  for (const file of files) {
    const content = read(file).replace(/^\uFEFF/, '').split(/\r?\n/)
      .filter(line => !/^\s*#/.test(line))
      .join('\n').trim();
    assert.ok(content.length > 0, `${file} has no displayable text`);
  }
});

test('old daily listening is removed and long-term audio is available', () => {
  assert.ok(!fs.existsSync(path.join(root,'homework')));
  assert.ok(!fs.existsSync(path.join(root,'practice')));
  const files=fs.readdirSync(path.join(root,'english','listening'));
  assert.ok(files.some(file => /\.(mp3|m4a|ogg)$/i.test(file)));
  assert.ok(!files.includes('listening008.mp3'));
});

test('cue files point to existing audio and contain valid ranges', () => {
  const files = fs.readdirSync(speakingDir).filter(file => /^speaking\d{3}\.cues\.json$/.test(file));
  for (const file of files) {
    const day = file.match(/\d{3}/)[0];
    const cues = JSON.parse(read(file));
    assert.match(cues.audio, new RegExp(`^speaking${day}\\.(mp3|m4a|ogg)$`, 'i'));
    assert.ok(fs.existsSync(materialPath(cues.audio)), `${cues.audio} is missing`);
    assert.equal(cues.sourceHash, fileHash(`speaking${day}.txt`), `${file}: sourceHash is stale`);
    assert.equal(cues.audioHash, fileHash(cues.audio), `${file}: audioHash is stale`);
    for (const [name, range] of Object.entries(cues.segments || {})) {
      assert.match(name, /^[qa]\d+$/);
      assert.ok(Number.isFinite(range.start) && Number.isFinite(range.end));
      assert.ok(range.start >= 0 && range.end > range.start, `${file}: invalid ${name} range`);
    }
  }
});

test('word cue files match their text and audio and contain valid items', () => {
  const files = fs.readdirSync(homeworkDir).filter(file => /^word\d{3}\.cues\.json$/.test(file));
  for (const file of files) {
    const day = file.match(/\d{3}/)[0];
    const cues = JSON.parse(read(file));
    assert.equal(cues.audio, `word${day}.mp3`);
    assert.equal(typeof cues.instructions, 'string', `${file}: instructions are missing`);
    assert.ok(cues.instructions.trim(), `${file}: instructions are empty`);
    assert.ok(fs.existsSync(materialPath(cues.audio)), `${cues.audio} is missing`);
    assert.equal(cues.sourceHash, fileHash(`word${day}.txt`), `${file}: sourceHash is stale`);
    assert.equal(cues.audioHash, fileHash(cues.audio), `${file}: audioHash is stale`);
    assert.ok(Array.isArray(cues.items) && cues.items.length > 0, `${file}: items are missing`);
    for (const item of cues.items) {
      assert.equal(typeof item.sourceText, 'string');
      assert.ok(item.sourceText.trim(), `${file}: sourceText is empty`);
      assert.ok(Number.isFinite(item.start) && Number.isFinite(item.end));
      assert.ok(item.start >= 0 && item.end > item.start, `${file}: invalid item range`);
    }
  }
});

test('paraphrase cue files match their text and audio and contain valid A/B ranges', () => {
  const files = fs.readdirSync(homeworkDir).filter(file => /^paraphrase\d{3}\.cues\.json$/.test(file));
  for (const file of files) {
    const day = file.match(/\d{3}/)[0];
    const cues = JSON.parse(read(file));
    assert.equal(cues.audio, `paraphrase${day}.mp3`);
    assert.ok(fs.existsSync(materialPath(cues.audio)), `${cues.audio} is missing`);
    assert.equal(cues.sourceHash, fileHash(`paraphrase${day}.txt`), `${file}: sourceHash is stale`);
    assert.equal(cues.audioHash, fileHash(cues.audio), `${file}: audioHash is stale`);
    for (const [key, range] of Object.entries(cues.segments || {})) {
      assert.match(key, /^[ab]\d+$/);
      assert.equal(typeof range.sourceText, 'string');
      assert.equal(typeof range.spokenText, 'string');
      assert.ok(Number.isFinite(range.start) && Number.isFinite(range.end));
      assert.ok(range.start >= 0 && range.end > range.start, `${file}: invalid ${key} range`);
    }
  }
});

test('app shell and offline worker versions stay aligned', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const typingHtml = fs.readFileSync(path.join(root, 'type.html'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const htmlVersion = html.match(/id="appVersion"[^>]*>v([\d.]+)</)?.[1];
  const workerVersion = worker.match(/word-trainer-v([\d.]+)/)?.[1];
  assert.ok(htmlVersion);
  assert.equal(workerVersion, htmlVersion);
  const packageVersion = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version.replace(/\.0$/, '');
  assert.equal(packageVersion, htmlVersion);
  assert.match(html, /type\.html\?day=/);
  assert.match(typingHtml, /TT 单词入侵/);
  assert.doesNotMatch(typingHtml, /重新开始会继续使用 Day|已掌握/);
  assert.match(worker, /'\.\/type\.html'/);
});

test('build indexes all four English categories and excludes former paths', () => {
  execFileSync(process.execPath, [path.join(root, 'scripts', 'build-site.js')]);
  assert.ok(fs.existsSync(path.join(root, 'dist', 'type.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist', 'english-library.js')));
  for(const category of ['word','listening','writing','speaking']) {
    const index=JSON.parse(fs.readFileSync(path.join(root,'dist','english',category,'index.json'),'utf8'));
    assert.ok(Array.isArray(index.files));
    assert.ok(index.files.every(file=>file!=='index.json'));
    assert.ok(index.files.length>0);
  }
  assert.ok(!fs.existsSync(path.join(root,'dist','homework')));
  assert.ok(!fs.existsSync(path.join(root,'dist','practice')));
});

test('preview launcher starts once and serves all four English categories on the same origin', async () => {
  const reservation = http.createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const preview = await startPreview(port);
  assert.ok(preview.startedPid);
  try {
    for (const category of ['word', 'listening', 'speaking', 'writing']) {
      const response = await fetch(`${preview.baseUrl}/__english-index.json?category=${category}`);
      assert.equal(response.status, 200, category);
      const { files } = await response.json();
      assert.ok(files.length > 0, category);
      assert.ok(!files.includes('index.json'));
      const staticIndex = await fetch(`${preview.baseUrl}/english/${category}/index.json`);
      assert.deepEqual((await staticIndex.json()).files, files);
    }
    const second = await startPreview(port);
    assert.equal(second.startedPid, null);
    assert.equal(second.baseUrl, preview.baseUrl);
  } finally {
    process.kill(preview.startedPid);
  }
});

test('preview launcher leaves a different website on the requested port running', async () => {
  const other = http.createServer((request, response) => response.end('Another website'));
  await new Promise(resolve => other.listen(0, '127.0.0.1', resolve));
  const port = other.address().port;
  try {
    await assert.rejects(startPreview(port), /occupied by another website/);
    assert.equal(await (await fetch(`http://127.0.0.1:${port}/index.html`)).text(), 'Another website');
  } finally {
    other.closeAllConnections();
    await new Promise(resolve => other.close(resolve));
  }
});
