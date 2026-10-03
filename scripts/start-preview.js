const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { writeEnglishIndexes, categories, englishFiles } = require('./english-index');

const projectRoot = path.resolve(__dirname, '..');

async function inspectPreview(baseUrl) {
  let response;
  try {
    response = await fetch(`${baseUrl}/index.html`, { signal:AbortSignal.timeout(2000) });
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return false;
    throw new Error(`Cannot reach preview server: ${error.message}`);
  }
  if (!response.ok || await response.text() !== fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8')) {
    throw new Error('Port is occupied by another website. The existing server was left running.');
  }
  // Old preview processes still serve updated files, so static indexes let them
  // support the new English directories without changing the origin/history.
  for (const category of categories) {
    const index = await fetch(`${baseUrl}/english/${category}/index.json`, { signal:AbortSignal.timeout(2000) });
    if (!index.ok || JSON.stringify((await index.json()).files) !== JSON.stringify(englishFiles(category))) {
      throw new Error(`The existing preview cannot serve the current ${category} material index.`);
    }
  }
  return true;
}

async function startPreview(port = Number(process.env.WORD_TRAINER_PORT || 8765)) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid preview port');
  writeEnglishIndexes();
  const baseUrl = `http://127.0.0.1:${port}`;
  if (await inspectPreview(baseUrl)) {
    console.log(`Reusing local preview: ${baseUrl}/index.html`);
    return { baseUrl, startedPid:null };
  }
  const child = spawn(process.execPath, [path.join(__dirname, 'local-preview-server.js')], {
    cwd:projectRoot, detached:true, stdio:'ignore', windowsHide:true,
    env:{ ...process.env, WORD_TRAINER_PORT:String(port) }
  });
  let spawnError;
  child.on('error', error => { spawnError = error; });
  child.unref();
  for (let attempt = 0; attempt < 40; attempt++) {
    if (spawnError) throw spawnError;
    await new Promise(resolve => setTimeout(resolve, 100));
    if (await inspectPreview(baseUrl)) {
      console.log(`Started local preview (PID ${child.pid}): ${baseUrl}/index.html`);
      return { baseUrl, startedPid:child.pid };
    }
  }
  throw new Error('The local preview server did not become ready.');
}

if (require.main === module) startPreview().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

module.exports = { startPreview };
