const fs = require('node:fs');
const path = require('node:path');
const {
  defaultFfmpeg,
  defaultInstructions,
  sha256,
  wavDuration,
  wavPeakDb,
  requestSpeech,
  runFfmpeg,
  concatPath
} = require('./generate-word-audio');

const projectRoot = path.resolve(__dirname, '..');

function usage() {
  return [
    'Usage: npm run audio:paraphrase -- <paraphrase###.txt>',
    '       npm run audio:paraphrase-missing',
    '',
    'Options:',
    '  --voice NAME    OpenAI voice (default: marin)',
    '  --instructions  Override the fixed pronunciation prompt',
    '  --gap SECONDS   Silence between unique phrases (default: 0.75)',
    '  --dry-run       Parse and print A/B segments without calling the API',
    '  --all-missing   Generate every missing or stale paraphrase recording',
    '  --force         Replace an existing MP3 and cues file',
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
    throw new Error('A paraphrase###.txt path or --all-missing is required.');
  }
  if (options.input && options.allMissing) {
    throw new Error('Use either a paraphrase###.txt path or --all-missing, not both.');
  }
  if (!Number.isFinite(options.gap) || options.gap < 0) {
    throw new Error('--gap must be zero or greater.');
  }
  return options;
}

function spokenPhrase(text) {
  return String(text || '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/\s*\/\s*/g, ' or ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseParaphrases(text) {
  const segments = [];
  let pairIndex = 0;
  for (const rawLine of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const fields = line.split('|').map(field => field.trim());
    if (fields.length !== 4 || fields.some(field => !field)) {
      throw new Error(`Invalid four-column paraphrase row: ${line}`);
    }
    pairIndex++;
    segments.push({ key:`a${pairIndex}`, pairIndex, side:'a', sourceText:fields[0], spokenText:spokenPhrase(fields[0]) });
    segments.push({ key:`b${pairIndex}`, pairIndex, side:'b', sourceText:fields[2], spokenText:spokenPhrase(fields[2]) });
  }
  return segments.map((segment, index) => ({ index, ...segment }));
}

function uniquePhrases(segments) {
  const byText = new Map();
  const unique = [];
  segments.forEach(segment => {
    const identity = segment.spokenText.toLocaleLowerCase('en-US');
    let phrase = byText.get(identity);
    if (!phrase) {
      phrase = { index:unique.length, spokenText:segment.spokenText, keys:[] };
      byText.set(identity, phrase);
      unique.push(phrase);
    }
    phrase.keys.push(segment.key);
    segment.phraseIndex = phrase.index;
  });
  return unique;
}

function partFilename(phrase) {
  const slug = phrase.spokenText
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 44) || 'phrase';
  return `${String(phrase.index + 1).padStart(3, '0')}-${phrase.keys[0]}-${slug}.wav`;
}

function inspectAudioState(basePath, sourceBytes) {
  const audioPath = `${basePath}.mp3`;
  const cuesPath = `${basePath}.cues.json`;
  if (!fs.existsSync(audioPath)) return { status:'missing' };
  if (!fs.existsSync(cuesPath)) return { status:'stale', reason:'matching cues file is missing' };
  try {
    const cues = JSON.parse(fs.readFileSync(cuesPath, 'utf8'));
    if (cues.sourceHash !== sha256(sourceBytes)) return { status:'stale', reason:'paraphrase TXT has changed' };
    if (cues.audio !== path.basename(audioPath)) return { status:'stale', reason:'cues point to a different audio file' };
    if (cues.audioHash !== sha256(fs.readFileSync(audioPath))) return { status:'stale', reason:'audio fingerprint has changed' };
    return { status:'up-to-date' };
  } catch (error) {
    return { status:'stale', reason:'matching cues file is invalid' };
  }
}

async function generate(options) {
  const inputPath = path.resolve(options.input);
  if (!/^paraphrase\d{3}\.txt$/i.test(path.basename(inputPath))) {
    throw new Error('Input filename must match paraphrase###.txt.');
  }
  const sourceBytes = fs.readFileSync(inputPath);
  const segments = parseParaphrases(sourceBytes.toString('utf8'));
  if (!segments.length) throw new Error('No paraphrase pairs were found.');
  const phrases = uniquePhrases(segments);
  if (options.dryRun) {
    process.stdout.write(`${JSON.stringify({ input:inputPath, pairs:segments.length / 2, segments, uniquePhrases:phrases }, null, 2)}\n`);
    return;
  }

  const basePath = inputPath.slice(0, -path.extname(inputPath).length);
  const outputMp3 = `${basePath}.mp3`;
  const outputCues = `${basePath}.cues.json`;
  const state = inspectAudioState(basePath, sourceBytes);
  if (state.status === 'up-to-date' && !options.force) {
    process.stdout.write(`Skipped up-to-date ${outputMp3}\n`);
    return;
  }
  if (state.status === 'stale' && !options.force) {
    process.stdout.write(`Regenerating ${path.basename(basePath)}: ${state.reason}.\n`);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set.');
  if (!fs.existsSync(options.ffmpeg)) throw new Error(`ffmpeg was not found: ${options.ffmpeg}`);

  const day = path.basename(inputPath).match(/paraphrase(\d{3})\.txt/i)[1];
  const tempDir = path.resolve(projectRoot, '..', 'temp', `paraphrase-day${day}`);
  fs.mkdirSync(tempDir, { recursive:true });
  process.stdout.write(`Keeping intermediate files in ${tempDir}\n`);

  const wavFiles = [];
  for (const phrase of phrases) {
    process.stdout.write(`[${phrase.index + 1}/${phrases.length}] ${phrase.keys.join(',')}: ${phrase.spokenText}\n`);
    const finalPartName = partFilename(phrase);
    let wav;
    let peakDb = -Infinity;
    for (let attempt = 1; attempt <= 3; attempt++) {
      wav = await requestSpeech(apiKey, phrase.spokenText, options.voice, options.instructions);
      peakDb = wavPeakDb(wav);
      if (peakDb >= -40) break;
      const silentName = finalPartName.replace(/\.wav$/, `.silent-attempt${attempt}.wav`);
      fs.writeFileSync(path.join(tempDir, silentName), wav);
      if (attempt === 3) throw new Error(`TTS returned silent audio for "${phrase.spokenText}" after 3 attempts.`);
      process.stdout.write(`  silent response (${peakDb.toFixed(1)} dB), retrying ${attempt}/2\n`);
    }
    phrase.duration = wavDuration(wav);
    phrase.peakDb = peakDb;
    phrase.partFile = finalPartName;
    const wavFile = path.join(tempDir, finalPartName);
    fs.writeFileSync(wavFile, wav);
    wavFiles.push(wavFile);
  }

  const concatFiles = [];
  let gapFile = '';
  if (options.gap > 0 && phrases.length > 1) {
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
  phrases.forEach(phrase => {
    phrase.start = cursor;
    phrase.end = cursor + phrase.duration;
    cursor = phrase.end + options.gap;
  });
  const cueSegments = {};
  segments.forEach(segment => {
    const phrase = phrases[segment.phraseIndex];
    cueSegments[segment.key] = {
      sourceText:segment.sourceText,
      spokenText:segment.spokenText,
      start:Number(phrase.start.toFixed(3)),
      end:Number(phrase.end.toFixed(3))
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
    phrases:phrases.map(phrase => ({
      keys:phrase.keys,
      spokenText:phrase.spokenText,
      file:phrase.partFile,
      duration:Number(phrase.duration.toFixed(3)),
      peakDb:Number(phrase.peakDb.toFixed(1))
    }))
  }, null, 2)}\n`, 'utf8');
  process.stdout.write(`Created ${outputMp3}\nCreated ${outputCues}\nKept intermediates in ${tempDir}\n`);
}

async function generateAllMissing(options) {
  const homeworkDir = path.join(projectRoot, 'homework');
  const inputs = fs.readdirSync(homeworkDir)
    .filter(file => /^paraphrase\d{3}\.txt$/i.test(file))
    .sort((left, right) => left.localeCompare(right, 'en'));
  const pending = inputs.filter(file => {
    const inputPath = path.join(homeworkDir, file);
    const basePath = inputPath.slice(0, -path.extname(inputPath).length);
    return inspectAudioState(basePath, fs.readFileSync(inputPath)).status !== 'up-to-date';
  });
  if (!pending.length) {
    process.stdout.write(`All ${inputs.length} paraphrase audio files are up to date.\n`);
    return;
  }
  process.stdout.write(`Generating ${pending.length} missing or stale paraphrase audio file(s): ${pending.join(', ')}\n`);
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

module.exports = { parseArgs, spokenPhrase, parseParaphrases, uniquePhrases, partFilename, inspectAudioState, generateAllMissing };
