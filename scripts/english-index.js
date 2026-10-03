const fs = require('node:fs');
const path = require('node:path');

const categories = ['word', 'listening', 'writing', 'speaking'];
const projectRoot = path.resolve(__dirname, '..');

function englishFiles(category, root = projectRoot) {
  if (!categories.includes(category)) throw new Error('Invalid English category');
  const directory = path.join(root, 'english', category);
  return fs.existsSync(directory) ? fs.readdirSync(directory, { withFileTypes:true })
    .filter(entry => entry.isFile() && !entry.name.startsWith('.') && entry.name !== 'index.json')
    .map(entry => entry.name).sort((a, b) => a.localeCompare(b, 'en')) : [];
}

function writeEnglishIndexes(root = projectRoot) {
  for (const category of categories) {
    const directory = path.join(root, 'english', category);
    fs.mkdirSync(directory, { recursive:true });
    const indexPath = path.join(directory, 'index.json');
    const body = `${JSON.stringify({ files:englishFiles(category, root) }, null, 2)}\n`;
    if (!fs.existsSync(indexPath) || fs.readFileSync(indexPath, 'utf8') !== body) fs.writeFileSync(indexPath, body, 'utf8');
  }
}

if (require.main === module) {
  writeEnglishIndexes();
  console.log('Updated all four English material indexes.');
}

module.exports = { categories, englishFiles, writeEnglishIndexes };
