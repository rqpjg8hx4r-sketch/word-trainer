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
  'Pronounce only the supplied English word or phrase once.',
  'Speak in a cheerful and positive tone.',
  'Use clear, natural American English and do not add any other words.'
].join(' ');

function usage() {
  return [
    'Usage: npm run audio:words -- <word###.txt> [--limit N]',
    '       npm run audio:words -- --all-missing',
    '',
    'Options:',
    '  --limit N       Generate only the first N entries (default: all)',
    '  --voice NAME    OpenAI voice (default: marin)',
    '  --instructions  Override the speaking-style prompt',
    '  --gap SECONDS   Silence between entries (default: 0.75)',
    '  --dry-run       Parse and print entries without calling the API',
    '  --all-missing   Generate every homework/word###.txt without an MP3',
    '  --force         Replace an existing MP3 and cues file',
    '  --ffmpeg PATH   Override the bundled ffmpeg executable',
    '',
    'Requires OPENAI_API_KEY unless --dry-run is used.'
  ].join('\n');
}

function parseArgs(argv) {
  const options = {
    input:'', limit:Infinity, voice:'marin', gap:0.75, dryRun:false, force:false, allMissing:false,
    ffmpeg:defaultFfmpeg, instructions:defaultInstructions
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('-') && !options.input) options.input = arg;
    else if (arg === '--limit') options.limit = Number(argv[++i]);
    else if (arg === '--voice') options.voice = argv[++i];
    else if (arg === '--instructions') options.instructions = argv[++i];
    else if (arg === '--gap') options.gap = Number(argv[++i]);
    else if (arg === '--ffmpeg') options.ffmpeg = path.resolve(argv[++i]);
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--all-missing') options.allMissing = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.help && !options.input && !options.allMissing) {
    throw new Error('A word###.txt path or --all-missing is required.');
  }
  if (options.input && options.allMissing) throw new Error('Use either a word###.txt path or --all-missing, not both.');
  if (options.limit !== Infinity && (!Number.isInteger(options.limit) || options.limit <= 0)) {
    throw new Error('--limit must be a positive integer.');
  }
  if (!Number.isFinite(options.gap) || options.gap < 0) throw new Error('--gap must be zero or greater.');
  return options;
}

function spokenForm(sourceText) {
  const variants = sourceText.replaceAll('(h)', 'h').split('/').map(value => value.trim()).filter(Boolean);
  const accented = variants.find(value => /[^\x00-\x7f]/.test(value));
  const expandedAbbreviation = variants.length > 1 && /^[a-z]$/i.test(variants[0]) ? variants[1] : '';
  return (accented || expandedAbbreviation || variants[0] || sourceText.trim())
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/[()[\]{}]/g, '')
    .replace(/[.,;:!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseWords(text, limit=Infinity) {
  const items = [];
  for (const rawLine of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sourceText = line.split('|')[0].trim();
    if (!sourceText) continue;
    items.push({ index:items.length, sourceText, spokenText:spokenForm(sourceText) });
    if (items.length >= limit) break;
  }
  return items;
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function wavDuration(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('The speech API did not return a valid WAV file.');
  }
  let offset = 12;
  let byteRate = 0;
  let dataSize = 0;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ' && size >= 12) byteRate = buffer.readUInt32LE(offset + 16);
    // Streaming WAV responses may use 0xFFFFFFFF as an unknown-length placeholder.
    // In that case the received buffer length is the authoritative payload size.
    if (id === 'data') { dataSize = Math.min(size, buffer.length - (offset + 8)); break; }
    offset += 8 + size + (size % 2);
  }
  if (!byteRate || !dataSize) throw new Error('Unable to read WAV duration.');
  return dataSize / byteRate;
}

function wavPeakDb(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('The speech API did not return a valid WAV file.');
  }
  let offset = 12;
  let audioFormat = 0;
  let bitsPerSample = 0;
  let dataOffset = 0;
  let dataSize = 0;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ' && size >= 16) {
      audioFormat = buffer.readUInt16LE(offset + 8);
      bitsPerSample = buffer.readUInt16LE(offset + 22);
    }
    if (id === 'data') {
      dataOffset = offset + 8;
      dataSize = Math.min(size, buffer.length - dataOffset);
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (audioFormat !== 1 || bitsPerSample !== 16 || !dataSize) {
    throw new Error('Expected 16-bit PCM WAV audio.');
  }
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

function partFilename(item) {
  const slug = item.spokenText
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'word';
  return `${String(item.index + 1).padStart(3, '0')}-${slug}.wav`;
}

async function generate(options) {
  const inputPath = path.resolve(options.input);
  if (!/^word\d{3}\.txt$/i.test(path.basename(inputPath))) {
    throw new Error('Input filename must match word###.txt.');
  }
  const sourceBytes = fs.readFileSync(inputPath);
  const items = parseWords(sourceBytes.toString('utf8'), options.limit);
  if (!items.length) throw new Error('No word entries were found.');
  if (options.dryRun) {
    process.stdout.write(`${JSON.stringify({ input:inputPath, count:items.length, items }, null, 2)}\n`);
    return;
  }
  const basePath = inputPath.slice(0, -path.extname(inputPath).length);
  const outputMp3 = `${basePath}.mp3`;
  const outputCues = `${basePath}.cues.json`;
  if (fs.existsSync(outputMp3) && !options.force) {
    process.stdout.write(`Skipped existing ${outputMp3}\nUse --force to replace it.\n`);
    if (!fs.existsSync(outputCues)) {
      process.stdout.write(`Warning: matching cues file is missing: ${outputCues}\n`);
    }
    return;
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set.');
  if (!fs.existsSync(options.ffmpeg)) throw new Error(`ffmpeg was not found: ${options.ffmpeg}`);

  const day = path.basename(inputPath).match(/word(\d{3})\.txt/i)[1];
  const tempDir = path.resolve(projectRoot, '..', 'temp', `day${day}`);
  fs.mkdirSync(tempDir, { recursive:true });
  process.stdout.write(`Keeping intermediate files in ${tempDir}\n`);

  const wavFiles = [];
  for (const item of items) {
    process.stdout.write(`[${item.index + 1}/${items.length}] ${item.spokenText}\n`);
    let wav;
    let peakDb = -Infinity;
    const finalPartName = partFilename(item);
    for (let attempt = 1; attempt <= 3; attempt++) {
      wav = await requestSpeech(apiKey, item.spokenText, options.voice, options.instructions);
      peakDb = wavPeakDb(wav);
      if (peakDb >= -40) break;
      const silentName = finalPartName.replace(/\.wav$/, `.silent-attempt${attempt}.wav`);
      fs.writeFileSync(path.join(tempDir, silentName), wav);
      if (attempt === 3) {
        throw new Error(`TTS returned silent audio for "${item.spokenText}" after 3 attempts.`);
      }
      process.stdout.write(`  silent response (${peakDb.toFixed(1)} dB), retrying ${attempt}/2\n`);
    }
    item.duration = wavDuration(wav);
    item.peakDb = peakDb;
    item.partFile = finalPartName;
    const wavFile = path.join(tempDir, finalPartName);
    fs.writeFileSync(wavFile, wav);
    wavFiles.push(wavFile);
  }

  const concatFiles = [];
  let gapFile = '';
  if (options.gap > 0 && items.length > 1) {
    gapFile = path.join(tempDir, 'gap.wav');
    runFfmpeg(options.ffmpeg, ['-f', 'lavfi', '-i', `anullsrc=r=24000:cl=mono`, '-t', String(options.gap), '-c:a', 'pcm_s16le', gapFile]);
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
  const cueItems = items.map(item => {
    const start = cursor;
    const end = start + item.duration;
    cursor = end + options.gap;
    return {
      index:item.index,
      sourceText:item.sourceText,
      spokenText:item.spokenText,
      start:Number(start.toFixed(3)),
      end:Number(end.toFixed(3))
    };
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
    items:cueItems
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
    items:items.map(item => ({
      index:item.index,
      sourceText:item.sourceText,
      spokenText:item.spokenText,
      file:item.partFile,
      duration:Number(item.duration.toFixed(3)),
      peakDb:Number(item.peakDb.toFixed(1))
    }))
  }, null, 2)}\n`, 'utf8');
  process.stdout.write(`Created ${outputMp3}\nCreated ${outputCues}\nKept intermediates in ${tempDir}\n`);
}

async function generateAllMissing(options) {
  const homeworkDir = path.join(projectRoot, 'homework');
  const inputs = fs.readdirSync(homeworkDir)
    .filter(file => /^word\d{3}\.txt$/i.test(file))
    .sort((left, right) => left.localeCompare(right, 'en'));
  const missing = inputs.filter(file => {
    const base = file.slice(0, -path.extname(file).length);
    return !fs.existsSync(path.join(homeworkDir, `${base}.mp3`));
  });
  if (!missing.length) {
    process.stdout.write(`All ${inputs.length} word audio files already exist.\n`);
    return;
  }
  process.stdout.write(`Generating ${missing.length} missing word audio file(s): ${missing.join(', ')}\n`);
  for (const file of missing) {
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

module.exports = {
  parseArgs, parseWords, spokenForm, wavDuration, wavPeakDb, partFilename, generateAllMissing,
  defaultFfmpeg, defaultInstructions, sha256, requestSpeech, runFfmpeg, concatPath
};
