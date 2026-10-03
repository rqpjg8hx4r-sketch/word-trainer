const fs = require('node:fs');
const path = require('node:path');
const { categories, englishFiles, writeEnglishIndexes } = require('./english-index');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'dist');
const outputCoding = path.join(outputDir, 'coding');
const outputGames = path.join(outputDir, 'games');
const outputMath = path.join(outputDir, 'math');

if (path.dirname(outputDir) !== projectRoot) throw new Error('Invalid build directory');
fs.rmSync(outputDir, { recursive:true, force:true });
fs.mkdirSync(outputCoding, { recursive:true });
fs.mkdirSync(outputGames, { recursive:true });
fs.mkdirSync(outputMath, { recursive:true });

for (const filename of ['index.html', 'type.html', 'site-nav.css', 'english-library.js', 'writing-material.js', 'writing-player.js', 'manifest.webmanifest', 'service-worker.js']) {
  fs.copyFileSync(path.join(projectRoot, filename), path.join(outputDir, filename));
}

const codingDir = path.join(projectRoot, 'coding');
if (fs.existsSync(codingDir)) {
  const codingFiles = fs.readdirSync(codingDir, { withFileTypes:true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name);
  for (const filename of codingFiles) {
    fs.copyFileSync(path.join(codingDir, filename), path.join(outputCoding, filename));
  }
}

const gamesDir = path.join(projectRoot, 'games');
if (fs.existsSync(gamesDir)) {
  fs.cpSync(gamesDir, outputGames, { recursive: true });
}

const mathDir = path.join(projectRoot, 'math');
if (fs.existsSync(mathDir)) {
  fs.cpSync(mathDir, outputMath, { recursive: true });
}

let totalFiles = 0;
writeEnglishIndexes();
for (const category of categories) {
  const source = path.join(projectRoot, 'english', category);
  const target = path.join(outputDir, 'english', category);
  fs.mkdirSync(target, { recursive:true });
  const files = englishFiles(category);
  for (const file of files) fs.copyFileSync(path.join(source, file), path.join(target, file));
  fs.writeFileSync(path.join(target, 'index.json'), `${JSON.stringify({ files }, null, 2)}\n`, 'utf8');
  totalFiles += files.length;
}
console.log(`Built dist/ with four English categories and ${totalFiles} material files.`);
