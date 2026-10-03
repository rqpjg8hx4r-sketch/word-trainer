const englishCategories = ['word', 'listening', 'writing', 'speaking'];

async function readEnglishFileList(category) {
  if (!englishCategories.includes(category)) throw new Error('未知英语分类');
  const directory = `english/${category}`;
  const cacheKey = `englishFilesV1:${category}`;
  try {
    let files;
    if (location.hostname.endsWith('.github.io')) {
      const info = githubRepoInfo();
      const response = await fetchWithTimeout(
        `https://api.github.com/repos/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}/contents/${directory}`,
        { headers:{ Accept:'application/vnd.github+json' }, cache:'no-store' }
      );
      if (!response.ok) throw new Error(`材料目录读取失败：${response.status}`);
      files = (await response.json()).filter(file => file.type === 'file');
    } else {
      let response;
      if (!githubRepoInfo()) {
        response = await fetchWithTimeout(`/__english-index.json?category=${category}`, { cache:'no-store' });
      }
      if (!response?.ok) response = await fetchWithTimeout(`${directory}/index.json`, { cache:'no-store' });
      if (!response.ok) throw new Error(`材料目录读取失败：${response.status}`);
      files = (await response.json()).files.map(name => ({ name, download_url:`${directory}/${name}` }));
    }
    files = files.filter(file => typeof file.name === 'string' && !/[\\/]/.test(file.name));
    try { localStorage.setItem(cacheKey, JSON.stringify(files)); } catch (error) {}
    return files;
  } catch (error) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (Array.isArray(cached)) return cached;
    } catch (cacheError) {}
    throw error;
  }
}

let speakingLibrary = [];
let speakingLibraryRequestId = 0;
let writingLibrary = [];
let writingLoadRequestId = 0;
let writingLibraryRequestId = 0;

async function refreshSpeakingLibrary() {
  const requestId = ++speakingLibraryRequestId;
  const select = document.getElementById('speakingSelect');
  const previous = select.value;
  const status = document.getElementById('speakingLibraryStatus');
  status.textContent = '正在读取口语材料…';
  try {
    const files = await readEnglishFileList('speaking');
    if (requestId !== speakingLibraryRequestId) return;
    speakingLibrary = files.filter(file => /^speaking\d{3}\.txt$/i.test(file.name))
      .sort((a, b) => b.name.localeCompare(a.name));
    if (!speakingLibrary.length) throw new Error('暂无口语材料');
    select.innerHTML = speakingLibrary.map(file =>
      `<option value="${escapeHtml(file.name)}">口语 · Day ${Number(file.name.match(/\d{3}/)[0])}</option>`
    ).join('');
    select.value = speakingLibrary.some(file => file.name === previous) ? previous : speakingLibrary[0].name;
    status.textContent = `共 ${speakingLibrary.length} 份口语材料`;
    await loadSpeakingHomework(select.value);
  } catch (error) {
    if (requestId !== speakingLibraryRequestId) return;
    speakingLoadRequestId++;
    select.innerHTML = '<option value="">暂无口语材料</option>';
    status.textContent = error.message;
    document.getElementById('speakingHomeworkBadge').textContent = '暂无素材';
    document.getElementById('speakingHomeworkItems').textContent = '口语材料上传后会显示在这里。';
    document.getElementById('speakingAudio').pause();
    document.getElementById('speakingPlayer').style.display = 'none';
    clearSpeakingImage();
  }
}

async function refreshWritingLibrary() {
  const requestId = ++writingLibraryRequestId;
  const select = document.getElementById('writingSelect');
  const previous = select.value;
  const status = document.getElementById('writingStatus');
  try {
    const files = await readEnglishFileList('writing');
    if (requestId !== writingLibraryRequestId) return;
    writingLibrary = files.filter(file => /^writing\d{3}\.txt$/i.test(file.name))
      .sort((a, b) => b.name.localeCompare(a.name));
    writingLibrary.forEach(file => {
      const basename = file.name.replace(/\.txt$/i, '').toLowerCase();
      file.image = ['jpg', 'jpeg', 'png', 'webp'].map(extension =>
        files.find(candidate => candidate.name.toLowerCase() === `${basename}.${extension}`)
      ).find(Boolean) || null;
      file.audio = ['mp3', 'm4a', 'ogg'].map(extension =>
        files.find(candidate => candidate.name.toLowerCase() === `${basename}.${extension}`)
      ).find(Boolean) || null;
    });
    if (!writingLibrary.length) throw new Error('暂无写作材料');
    select.innerHTML = writingLibrary.map(file =>
      `<option value="${escapeHtml(file.name)}">写作 ${Number(file.name.match(/\d{3}/)[0])}</option>`
    ).join('');
    select.value = writingLibrary.some(file => file.name === previous) ? previous : writingLibrary[0].name;
    await selectWritingItem(select.value);
  } catch (error) {
    if (requestId !== writingLibraryRequestId) return;
    writingLoadRequestId++;
    writingLibrary = [];
    clearWritingDisplay();
    const image = document.getElementById('writingImage');
    image.style.display = 'none';
    image.removeAttribute('src');
    select.innerHTML = '<option value="">暂无写作材料</option>';
    document.getElementById('writingBadge').textContent = '暂无素材';
    status.textContent = error.message;
  }
}

async function selectWritingItem(name) {
  const requestId = ++writingLoadRequestId;
  const item = writingLibrary.find(file => file.name === name);
  if (!item) return;
  const image = document.getElementById('writingImage');
  image.style.display = 'none';
  image.removeAttribute('src');
  clearWritingDisplay();
  const badge = document.getElementById('writingBadge');
  const status = document.getElementById('writingStatus');
  badge.textContent = '正在读取…';
  status.textContent = '正在读取写作材料…';
  try {
    const url = `english/writing/${item.name}`;
    const response = await fetchWithTimeout(url, { cache:'no-store' });
    if (!response.ok) throw new Error(`写作材料读取失败：${response.status}`);
    const bytes = await response.arrayBuffer();
    const text = new TextDecoder().decode(bytes);
    if (requestId !== writingLoadRequestId) return;
    const parts = parseWritingMaterial(text);
    const title = parseLibraryMeta(text, item.name).title || `写作 ${Number(item.name.match(/\d{3}/)[0])}`;
    const option = [...document.getElementById('writingSelect').options].find(option => option.value === item.name);
    if (option) option.textContent = title;
    document.getElementById('writingTitle').textContent = `✍️ ${title}`;
    for (const [key, id] of [['question', 'Question'], ['answer', 'Answer'], ['tips', 'Tips']]) {
      document.getElementById(`writing${id}Section`).style.display = parts[key] ? 'block' : 'none';
      document.getElementById(`writing${id}Text`).textContent = parts[key];
    }
    writingAnswer = parts.answer;
    if (item.image) {
      image.onload = () => { if (requestId === writingLoadRequestId) image.style.display = 'block'; };
      image.onerror = () => { image.style.display = 'none'; };
      image.alt = `${title} 题目图片`;
      image.src = `english/writing/${item.image.name}`;
    }
    badge.textContent = '写作材料';
    status.textContent = `共 ${writingLibrary.length} 份材料 · 先读题目，再展开参考答案和写作提示。`;
    cacheDayForOffline(Number(item.name.match(/\d{3}/)[0]), [{ url, sha256:await sha256Hex(bytes) }]);
    await loadWritingRecording(item, requestId);
  } catch (error) {
    if (requestId !== writingLoadRequestId) return;
    badge.textContent = '读取失败';
    status.textContent = error.message;
  }
}
