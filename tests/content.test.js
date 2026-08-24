const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { spokenForm, wavDuration, wavPeakDb, partFilename } = require('../scripts/generate-word-audio');

const root = path.resolve(__dirname, '..');
const homeworkDir = path.join(root, 'homework');

function read(file) {
  return fs.readFileSync(path.join(homeworkDir, file), 'utf8');
}

function fileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(homeworkDir, file))).digest('hex');
}

test('word and speaking TXT files use flat three-digit day names', () => {
  const files = fs.readdirSync(homeworkDir);
  const textFiles = files.filter(file => file.endsWith('.txt'));
  assert.ok(textFiles.length > 0);
  for (const file of textFiles) {
    assert.match(file, /^(word|speaking)\d{3}\.txt$/);
    assert.ok(read(file).trim().length > 0, `${file} must not be empty`);
  }
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
