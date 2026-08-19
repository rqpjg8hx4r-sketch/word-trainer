const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

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

test('app shell and offline worker versions stay aligned', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const htmlVersion = html.match(/id="appVersion"[^>]*>v([\d.]+)</)?.[1];
  const workerVersion = worker.match(/word-trainer-v([\d.]+)/)?.[1];
  assert.ok(htmlVersion);
  assert.equal(workerVersion, htmlVersion);
  const packageVersion = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version.replace(/\.0$/, '');
  assert.equal(packageVersion, htmlVersion);
});
