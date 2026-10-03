// Shared by the page and audio generator so they use the same answer boundaries.
function parseWritingMaterial(text) {
  const sections = { question:[], answer:[], tips:[] };
  let section = 'question';
  for (const line of String(text).replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const marker = line.match(/^\s*#\s*(question|answer|tip|tips)\s*(?:[:：]\s*(.*))?\s*$/i);
    if (marker) {
      section = /^tips?$/i.test(marker[1]) ? 'tips' : marker[1].toLowerCase();
      if (marker[2]) sections[section].push(marker[2]);
      continue;
    }
    // Any other # field ends the current section; metadata must never be spoken.
    if (/^\s*#/.test(line)) { section = null; continue; }
    if (/^\s*WRITING\s+\d+\s*$/i.test(line)) continue;
    if (/^\s*(?:QUESTION(?:\s+\d+)?|题目)\s*[:：]?\s*$/i.test(line)) { section = 'question'; continue; }
    if (/^\s*(?:ANSWER|参考答案|范文)\s*[:：]?\s*$/i.test(line)) { section = 'answer'; continue; }
    if (/^\s*(?:WRITING\s+TIPS?|写作提示)\s*[:：]?\s*$/i.test(line)) { section = 'tips'; continue; }
    if (section) sections[section].push(line);
  }
  return Object.fromEntries(Object.entries(sections).map(([key, lines]) => [key, lines.join('\n').trim()]));
}

if (typeof module !== 'undefined' && module.exports) module.exports = { parseWritingMaterial };
