const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const defaultFfmpeg = path.resolve(
  projectRoot,
  '..',
  'audio-tools',
  'imageio_ffmpeg',
  'binaries',
  'ffmpeg-win-x86_64-v7.1.exe'
);
const defaultInstructions = [
  'Speak in natural American English to one school-age child, as if having a friendly face-to-face conversation.',
  'Use a warm, bright, upbeat, gently cheerful tone, as if smiling while speaking.',
  'Sound encouraging, lively, and confident, but never exaggerated.',
  'Keep the pace relaxed and unhurried, at about 85 percent of normal adult conversational speed.',
  'Use clear pronunciation without over-enunciating.',
  'Use natural conversational rhythm, sentence stress, intonation, and gentle short pauses.',
  'Pause naturally after the two-part question before giving the answer.',
  'Do not sound like a teacher giving a lesson, a textbook recording, a formal presentation, or mechanical TTS.',
  'The child will listen and imitate the pronunciation.'
].join(' ');

function usage() {
  return [
    'Usage: npm run audio:speaking -- <speaking###.txt>',
    '       npm run audio:speaking-missing',
    '',
    'Options:',
    '  --voice NAME    OpenAI voice (default: marin)',
    '  --instructions  Override the fixed speaking-style prompt',
    '  --gap SECONDS   Silence between Q/A segments (default: 0.75)',
    '  --dry-run       Parse and print segments without calling the API',
    '  --all-missing   Generate every speaking TXT without matching audio',
    '  --force         Replace existing MP3/cues (does not remove M4A/OGG)',
    '  --ffmpeg PATH   Override the bundled ffmpeg executable',
    '',
    'Requires OPENAI_API_KEY unless --dry-run is used.'
  ].join('\n');
}

function parseArgs(argv) {
  const options = {
    input:'', voice:'marin', gap:0.75, dryRun:false, force:false, allMissing:false,
    ffmpeg:defaultFfmpeg, instructions:defaultInstructions
  };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (!arg.startsWith('-') && !options.input) options.input = arg;
    else if (arg === '--voice') options.voice = argv[++index];
    else if (arg === '--instructions') options.instructions = argv[++index];
    else if (arg === '--gap') options.gap = Number(argv[++index]);
    else if (arg === '--ffmpeg') options.ffmpeg = path.resolve(argv[++index]);
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--all-missing') options.allMissing = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.help && !options.input && !options.allMissing) {
    throw new Error('A speaking###.txt path or --all-missing is required.');
  }
  if (options.input && options.allMissing) {
    throw new Error('Use either a speaking###.txt path or --all-missing, not both.');
  }
  if (!Number.isFinite(options.gap) || options.gap < 0) {
    throw new Error('--gap must be zero or greater.');
  }
  return options;
}

function normalizeSpeechText(text) {
  return String(text || '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSpeaking(text) {
  const items = [];
  const contentLines = [];
  let current = null;
  let field = '';
  let nextNumber = 1;

  function availableNumber() {
    while (items.some(item => item.number === nextNumber)) nextNumber++;
    return nextNumber++;
  }

  text.replace(/^\uFEFF/, '').split(/\r?\n/).forEach(rawLine => {
    const line = rawLine.trim();
    if (/^#\s*([^:：]+)\s*[:：]\s*(.*)$/.test(line)) return;
    contentLines.push(rawLine.trimEnd());
    if (!line) return;

    const question = line.match(/^Q(\d*)\s*[:：]\s*(.*)$/i);
    if (question) {
      const number = question[1] ? Number(question[1]) : availableNumber();
      nextNumber = Math.max(nextNumber, number + 1);
      current = items.find(item => item.number === number);
      if (!current) {
        current = { number, question:'', answer:'' };
        items.push(current);
      }
      current.question = question[2].trim();
      field = 'question';
      return;
    }

    const answer = line.match(/^A(\d*)\s*[:：]\s*(.*)$/i);
    if (answer) {
      const number = answer[1]
        ? Number(answer[1])
        : current && !current.answer ? current.number : availableNumber();
      nextNumber = Math.max(nextNumber, number + 1);
      current = items.find(item => item.number === number);
      if (!current) {
        current = { number, question:'', answer:'' };
        items.push(current);
      }
      current.answer = answer[2].trim();
      field = 'answer';
      return;
    }

    if (current && field) current[field] += `${current[field] ? ' ' : ''}${line}`;
  });

  const segments = [];
  items
    .filter(item => item.question || item.answer)
    .sort((left, right) => left.number - right.number)
    .forEach(item => {
      if (item.question) segments.push({ key:`q${item.number}`, text:normalizeSpeechText(item.question) });
      if (item.answer) segments.push({ key:`a${item.number}`, text:normalizeSpeechText(item.answer) });
    });
  if (!segments.length) {
    const plainText = normalizeSpeechText(contentLines.join('\n'));
    if (plainText) segments.push({ key:'text1', text:plainText });
  }
  return segments.map((segment, index) => ({ index, ...segment }));
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function wavInfo(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('The speech API did not return a valid WAV file.');
  }
  let offset = 12;
  let audioFormat = 0;
  let bitsPerSample = 0;
  let byteRate = 0;
  let dataOffset = 0;
  let dataSize = 0;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ' && size >= 16) {
      audioFormat = buffer.readUInt16LE(offset + 8);
      byteRate = buffer.readUInt32LE(offset + 16);
      bitsPerSample = buffer.readUInt16LE(offset + 22);
    }
    if (id === 'data') {
      dataOffset = offset + 8;
      dataSize = Math.min(size, buffer.length - dataOffset);
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (audioFormat !== 1 || bitsPerSample !== 16 || !byteRate || !dataSize) {
    throw new Error('Expected a 16-bit PCM WAV response.');
  }
  return { byteRate, dataOffset, dataSize };
}

function wavDuration(buffer) {
  const info = wavInfo(buffer);
  return info.dataSize / info.byteRate;
}

function wavPeakDb(buffer) {
  const { dataOffset, dataSize } = wavInfo(buffer);
  let peak = 0;
  const end = dataOffset + dataSize - (dataSize % 2);
  for (let position = dataOffset; position < end; position += 2) {
    peak = Math.max(peak, Math.abs(buffer.readInt16LE(position)));
  }
  return peak ? 20 * Math.log10(peak / 32768) : -Infinity;
}

async function requestSpeech(apiKey, input, voice, instructions) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method:'POST',
    headers:{ Authorization:`Bearer ${apiKey}`, 'Content-Type':'application/json' },
    body:JSON.stringify({
      model:'gpt-4o-mini-tts',
      voice,
      input,
      instructions,
      response_format:'wav'
    })
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`OpenAI speech request failed (${response.status}): ${detail}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function runFfmpeg(executable, args) {
  const result = spawnSync(executable, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    encoding:'utf8', windowsHide:true
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${(result.stderr || '').trim()}`);
}

function concatPath(file) {
  return file.replaceAll('\\', '/').replaceAll("'", "'\\''");
}

function partFilename(segment) {
  const slug = segment.text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 44) || 'speech';
  return `${String(segment.index + 1).padStart(3, '0')}-${segment.key}-${slug}.wav`;
}

function existingAudio(basePath) {
  return ['.mp3', '.m4a', '.ogg'].map(extension => `${basePath}${extension}`).find(fs.existsSync);
}

function inspectAudioState(basePath, sourceBytes) {
  const audio = existingAudio(basePath);
  if (!audio) return { status:'missing', audio:'' };
  const cuesPath = `${basePath}.cues.json`;
  if (!fs.existsSync(cuesPath)) return { status:'untracked', audio, reason:'matching cues file is missing' };
  let cues;
  try {
    cues = JSON.parse(fs.readFileSync(cuesPath, 'utf8'));
  } catch (error) {
    return { status:'untracked', audio, reason:'matching cues file is invalid' };
  }
  if (!/^[a-f0-9]{64}$/i.test(cues.sourceHash || '')) {
    return { status:'untracked', audio, reason:'matching cues have no source fingerprint' };
  }
  if (cues.sourceHash.toLowerCase() !== sha256(sourceBytes)) {
    return { status:'stale', audio, reason:'speaking TXT has changed' };
  }
  const expectedAudioName = path.basename(basePath);
  if (!new RegExp(`^${expectedAudioName}\\.(mp3|m4a|ogg)$`, 'i').test(cues.audio || '')) {
    return { status:'stale', audio, reason:'cues point to a different audio file' };
  }
  const cueAudio = path.join(path.dirname(basePath), cues.audio);
  if (!fs.existsSync(cueAudio)) return { status:'stale', audio, reason:'cues audio file is missing' };
  if (/^[a-f0-9]{64}$/i.test(cues.audioHash || '')
      && cues.audioHash.toLowerCase() !== sha256(fs.readFileSync(cueAudio))) {
    return { status:'stale', audio, reason:'audio fingerprint has changed' };
  }
  return { status:'up-to-date', audio:cueAudio };
}

async function generate(options) {
  const inputPath = path.resolve(options.input);
  if (!/^speaking\d{3}\.txt$/i.test(path.basename(inputPath))) {
    throw new Error('Input filename must match speaking###.txt.');
  }
  const sourceBytes = fs.readFileSync(inputPath);
  const segments = parseSpeaking(sourceBytes.toString('utf8'));
  if (!segments.length) throw new Error('No speaking content was found.');
  if (options.dryRun) {
    process.stdout.write(`${JSON.stringify({ input:inputPath, count:segments.length, segments }, null, 2)}\n`);
    return;
  }

  const basePath = inputPath.slice(0, -path.extname(inputPath).length);
  const outputMp3 = `${basePath}.mp3`;
  const outputCues = `${basePath}.cues.json`;
  const audioState = inspectAudioState(basePath, sourceBytes);
  if (!options.force && audioState.status === 'up-to-date') {
    process.stdout.write(`Skipped existing ${audioState.audio}\n`);
    process.stdout.write('TXT, cues, and audio fingerprints are already up to date.\n');
    return;
  }
  if (!options.force && (audioState.status === 'stale' || audioState.status === 'untracked')) {
    process.stdout.write(`Regenerating ${path.basename(basePath)}: ${audioState.reason}.\n`);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set.');
  if (!fs.existsSync(options.ffmpeg)) throw new Error(`ffmpeg was not found: ${options.ffmpeg}`);

  const day = path.basename(inputPath).match(/speaking(\d{3})\.txt/i)[1];
  const tempDir = path.resolve(projectRoot, '..', 'temp', `speaking-day${day}`);
  fs.mkdirSync(tempDir, { recursive:true });
  process.stdout.write(`Keeping intermediate files in ${tempDir}\n`);

  const wavFiles = [];
  for (const segment of segments) {
    process.stdout.write(`[${segment.index + 1}/${segments.length}] ${segment.key}: ${segment.text}\n`);
    const finalPartName = partFilename(segment);
    let wav;
    let peakDb = -Infinity;
    for (let attempt = 1; attempt <= 3; attempt++) {
      wav = await requestSpeech(apiKey, segment.text, options.voice, options.instructions);
      peakDb = wavPeakDb(wav);
      if (peakDb >= -40) break;
      const silentName = finalPartName.replace(/\.wav$/, `.silent-attempt${attempt}.wav`);
      fs.writeFileSync(path.join(tempDir, silentName), wav);
      if (attempt === 3) throw new Error(`TTS returned silent audio for ${segment.key} after 3 attempts.`);
      process.stdout.write(`  silent response (${peakDb.toFixed(1)} dB), retrying ${attempt}/2\n`);
    }
    segment.duration = wavDuration(wav);
    segment.peakDb = peakDb;
    segment.partFile = finalPartName;
    const wavFile = path.join(tempDir, finalPartName);
    fs.writeFileSync(wavFile, wav);
    wavFiles.push(wavFile);
  }

  const concatFiles = [];
  let gapFile = '';
  if (options.gap > 0 && segments.length > 1) {
    gapFile = path.join(tempDir, 'gap.wav');
    runFfmpeg(options.ffmpeg, ['-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(options.gap), '-c:a', 'pcm_s16le', gapFile]);
  }
  wavFiles.forEach((file, index) => {
    concatFiles.push(file);
    if (gapFile && index < wavFiles.length - 1) concatFiles.push(gapFile);
  });
  const concatList = path.join(tempDir, 'concat.txt');
  fs.writeFileSync(concatList, concatFiles.map(file => `file '${concatPath(file)}'`).join('\n'), 'utf8');

  const tempMp3 = path.join(tempDir, 'output.mp3');
  runFfmpeg(options.ffmpeg, ['-f', 'concat', '-safe', '0', '-i', concatList, '-ar', '24000', '-ac', '1', '-b:a', '96k', tempMp3]);
  let cursor = 0;
  const cueSegments = {};
  segments.forEach(segment => {
    cueSegments[segment.key] = {
      start:Number(cursor.toFixed(3)),
      end:Number((cursor + segment.duration).toFixed(3))
    };
    cursor += segment.duration + options.gap;
  });

  const audioBytes = fs.readFileSync(tempMp3);
  fs.copyFileSync(tempMp3, outputMp3);
  fs.writeFileSync(outputCues, `${JSON.stringify({
    version:1,
    model:'gpt-4o-mini-tts',
    voice:options.voice,
    instructions:options.instructions,
    audio:path.basename(outputMp3),
    sourceHash:sha256(sourceBytes),
    audioHash:sha256(audioBytes),
    gapSeconds:options.gap,
    segments:cueSegments
  }, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(tempDir, 'generation.json'), `${JSON.stringify({
    version:1,
    day:Number(day),
    source:inputPath,
    sourceHash:sha256(sourceBytes),
    model:'gpt-4o-mini-tts',
    voice:options.voice,
    instructions:options.instructions,
    gapSeconds:options.gap,
    generatedAt:new Date().toISOString(),
    segments:segments.map(segment => ({
      key:segment.key,
      text:segment.text,
      file:segment.partFile,
      duration:Number(segment.duration.toFixed(3)),
      peakDb:Number(segment.peakDb.toFixed(1))
    }))
  }, null, 2)}\n`, 'utf8');
  process.stdout.write(`Created ${outputMp3}\nCreated ${outputCues}\nKept intermediates in ${tempDir}\n`);
}

async function generateAllMissing(options) {
  const homeworkDir = path.join(projectRoot, 'homework');
  const inputs = fs.readdirSync(homeworkDir)
    .filter(file => /^speaking\d{3}\.txt$/i.test(file))
    .sort((left, right) => left.localeCompare(right, 'en'));
  const pending = inputs.filter(file => {
    const base = path.join(homeworkDir, file.slice(0, -path.extname(file).length));
    const sourceBytes = fs.readFileSync(path.join(homeworkDir, file));
    const state = inspectAudioState(base, sourceBytes);
    return state.status === 'missing' || state.status === 'stale';
  });
  if (!pending.length) {
    process.stdout.write(`All ${inputs.length} speaking audio files are present and no tracked recording is stale.\n`);
    return;
  }
  process.stdout.write(`Generating ${pending.length} missing or stale speaking audio file(s): ${pending.join(', ')}\n`);
  for (const file of pending) {
    await generate({ ...options, input:path.join(homeworkDir, file), allMissing:false });
  }
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) return process.stdout.write(`${usage()}\n`);
    if (options.allMissing) await generateAllMissing(options);
    else await generate(options);
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${usage()}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { parseArgs, parseSpeaking, normalizeSpeechText, wavDuration, wavPeakDb, partFilename, existingAudio, inspectAudioState, generateAllMissing };
