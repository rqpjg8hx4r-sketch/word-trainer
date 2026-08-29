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
  normalizeSpeechText,
  partFilename:speakingPartFilename,
  inspectAudioState
} = require('../scripts/generate-speaking-audio');
const {
  parseArgs:parseParaphraseAudioArgs,
  spokenPhrase,
  parseParaphrases:parseParaphraseAudio,
  uniquePhrases:uniqueParaphrasePhrases,
  partFilename:paraphrasePartFilename
} = require('../scripts/generate-paraphrase-audio');

const root = path.resolve(__dirname, '..');
const homeworkDir = path.join(root, 'homework');

function read(file) {
  return fs.readFileSync(path.join(homeworkDir, file), 'utf8');
}

function fileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(homeworkDir, file))).digest('hex');
}

test('homework TXT files use supported flat three-digit day names', () => {
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
  assert.equal(parseSpeakingArgs(['homework/speaking014.txt', '--dry-run']).dryRun, true);
  const output = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'generate-speaking-audio.js'),
    path.join(homeworkDir, 'speaking014.txt'),
    '--dry-run'
  ], { encoding:'utf8' });
  const result = JSON.parse(output);
  assert.equal(result.count, 2);
  assert.deepEqual(result.segments.map(segment => segment.key), ['q1', 'a1']);
  assert.match(result.segments[1].text, /I like running outdoors/);
});

test('speaking audio command skips an existing M4A without requiring the API', () => {
  const env = { ...process.env };
  delete env.OPENAI_API_KEY;
  const output = execFileSync(process.execPath, [
    path.join(root, 'scripts', 'generate-speaking-audio.js'),
    path.join(homeworkDir, 'speaking006.txt')
  ], { encoding:'utf8', env });
  assert.match(output, /Skipped existing .*speaking006\.m4a/i);
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
  const files = fs.readdirSync(homeworkDir).filter(file => /^speaking\d{3}\.txt$/.test(file));
  for (const file of files) {
    const content = read(file).replace(/^\uFEFF/, '').split(/\r?\n/)
      .filter(line => !/^\s*#/.test(line))
      .join('\n').trim();
    assert.ok(content.length > 0, `${file} has no displayable text`);
  }
});

test('listening audio uses a flat three-digit day name', () => {
  const files = fs.readdirSync(homeworkDir).filter(file => /^listening/i.test(file));
  for (const file of files) assert.match(file, /^listening\d{3}\.(mp3|m4a|ogg)$/i);
});

test('cue files point to existing audio and contain valid ranges', () => {
  const files = fs.readdirSync(homeworkDir).filter(file => /^speaking\d{3}\.cues\.json$/.test(file));
  for (const file of files) {
    const day = file.match(/\d{3}/)[0];
    const cues = JSON.parse(read(file));
    assert.match(cues.audio, new RegExp(`^speaking${day}\\.(mp3|m4a|ogg)$`, 'i'));
    assert.ok(fs.existsSync(path.join(homeworkDir, cues.audio)), `${cues.audio} is missing`);
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
    assert.ok(fs.existsSync(path.join(homeworkDir, cues.audio)), `${cues.audio} is missing`);
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
    assert.ok(fs.existsSync(path.join(homeworkDir, cues.audio)), `${cues.audio} is missing`);
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

test('build creates a deployment index for the optional practice directory', () => {
  execFileSync(process.execPath, [path.join(root, 'scripts', 'build-site.js')]);
  assert.ok(fs.existsSync(path.join(root, 'dist', 'type.html')));
  const index = JSON.parse(fs.readFileSync(path.join(root, 'dist', 'practice', 'index.json'), 'utf8'));
  assert.ok(Array.isArray(index.files));
  assert.ok(index.files.every(file => file !== 'index.json'));
});
