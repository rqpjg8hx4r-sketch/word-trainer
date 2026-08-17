const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'dist');
const outputHomework = path.join(outputDir, 'homework');

fs.rmSync(outputDir, { recursive:true, force:true });
fs.mkdirSync(outputHomework, { recursive:true });

for (const filename of ['index.html', 'manifest.webmanifest', 'service-worker.js']) {
  fs.copyFileSync(path.join(projectRoot, filename), path.join(outputDir, filename));
}

const homeworkDir = path.join(projectRoot, 'homework');
const homeworkFiles = fs.readdirSync(homeworkDir, { withFileTypes:true })
  .filter(entry => entry.isFile() && entry.name !== 'index.json')
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b, 'en'));

for (const filename of homeworkFiles) {
  fs.copyFileSync(path.join(homeworkDir, filename), path.join(outputHomework, filename));
}

fs.writeFileSync(
  path.join(outputHomework, 'index.json'),
  `${JSON.stringify({ files:homeworkFiles }, null, 2)}\n`,
  'utf8'
);

console.log(`Built dist/ with ${homeworkFiles.length} homework files.`);
