const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const homeworkDir = path.join(projectRoot, 'homework');
const outputFile = path.join(homeworkDir, 'index.json');

const files = fs.readdirSync(homeworkDir, { withFileTypes:true })
  .filter(entry => entry.isFile() && entry.name !== 'index.json')
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b, 'en'));

fs.writeFileSync(outputFile, `${JSON.stringify({ files }, null, 2)}\n`, 'utf8');
console.log(`Generated homework/index.json with ${files.length} files.`);
