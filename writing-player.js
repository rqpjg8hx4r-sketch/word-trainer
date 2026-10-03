let writingAnswer = '';
let writingAudioObjectUrl = '';
let writingSpeech = null;
let writingSpeechRequestId = 0;
let writingSpeechPosition = 0;
let writingSpeechPaused = false;
let writingSpeechNeedsRestart = false;

function stopWritingPlayback() {
  writingSpeechRequestId++;
  if (writingSpeech && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  writingSpeech = null;
  writingSpeechPaused = false;
  writingSpeechNeedsRestart = false;
  document.getElementById('writingAudio')?.pause();
  const button = document.getElementById('writingPauseBtn');
  if (button) button.textContent = '⏸ 暂停';
}

function clearWritingDisplay() {
  stopWritingPlayback();
  writingAnswer = '';
  writingSpeechPosition = 0;
  const audio = document.getElementById('writingAudio');
  audio.removeAttribute('src');
  if (writingAudioObjectUrl) URL.revokeObjectURL(writingAudioObjectUrl);
  writingAudioObjectUrl = '';
  libraryPlayerStates.writing.defaultRange = null;
  resetLibraryPlayerSegment('writing');
  for (const key of ['Question', 'Answer', 'Tips']) {
    document.getElementById(`writing${key}Section`).style.display = 'none';
    document.getElementById(`writing${key}Text`).textContent = '';
  }
  document.getElementById('writingAnswerSection').open = false;
  document.getElementById('writingTipsSection').open = true;
  document.getElementById('writingAudioStatus').textContent = '';
}

function writingSentenceStart() {
  const before = writingAnswer.slice(0, writingSpeechPosition);
  const boundaries = [...before.matchAll(/[.!?]\s+/g)];
  const last = boundaries[boundaries.length - 1];
  return last ? last.index + last[0].length : 0;
}

function playWritingSpeech(start = 0) {
  const status = document.getElementById('writingAudioStatus');
  if (!writingAnswer) return;
  if (!('speechSynthesis' in window)) {
    status.textContent = '当前浏览器不支持英文朗读，可添加同名录音。';
    return;
  }
  stopWritingPlayback();
  const requestId = writingSpeechRequestId;
  writingSpeechPosition = start;
  const utterance = new SpeechSynthesisUtterance(writingAnswer.slice(start));
  writingSpeech = utterance;
  if (!targetVoice) loadVoices();
  if (targetVoice) utterance.voice = targetVoice;
  utterance.lang = 'en-US';
  utterance.rate = libraryPlayerStates.writing.speed;
  utterance.onboundary = event => {
    if (requestId === writingSpeechRequestId) writingSpeechPosition = start + event.charIndex;
  };
  utterance.onend = () => {
    if (requestId !== writingSpeechRequestId) return;
    writingSpeech = null;
    if (libraryPlayerStates.writing.repeat && currentMainArea === 'writing') playWritingSpeech();
    else status.textContent = '答案朗读完成。';
  };
  utterance.onerror = event => {
    if (requestId !== writingSpeechRequestId || event.error === 'canceled' || event.error === 'interrupted') return;
    writingSpeech = null;
    status.textContent = '英文朗读暂不可用，请检查系统英文语音或添加同名录音。';
  };
  status.textContent = '正在使用系统英文语音朗读参考答案。';
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}

const writingSpeechAdapter = {
  stop:() => stopWritingPlayback(),
  play:() => playWritingSpeech(),
  pause:() => {
    if (!writingSpeech) { playWritingSpeech(); return; }
    if (writingSpeechPaused) {
      if (writingSpeechNeedsRestart) { playWritingSpeech(writingSentenceStart()); return; }
      window.speechSynthesis.resume();
      writingSpeechPaused = false;
    } else {
      window.speechSynthesis.pause();
      writingSpeechPaused = true;
    }
    document.getElementById('writingPauseBtn').textContent = writingSpeechPaused ? '▶ 继续' : '⏸ 暂停';
    document.getElementById('writingAudioStatus').textContent = writingSpeechPaused ? '答案朗读已暂停。' : '正在朗读参考答案。';
  },
  replay:() => playWritingSpeech(writingSentenceStart()),
  setSpeed:() => {
    if (!writingSpeech) return;
    if (writingSpeechPaused) writingSpeechNeedsRestart = true;
    else playWritingSpeech(writingSentenceStart());
  }
};

async function loadWritingRecording(item, textBytes, requestId) {
  const status = document.getElementById('writingAudioStatus');
  status.textContent = '点击听答案可使用系统英文朗读。';
  if (!item.audio) return;
  try {
    let cues = null;
    const directory = 'english/writing/';
    if (item.cues) {
      const response = await fetchWithTimeout(directory + item.cues.name, { cache:'no-store' });
      if (response.ok) cues = await response.json();
    }
    if (cues?.sourceHash && cues.sourceHash.toLowerCase() !== await sha256Hex(textBytes)) throw new Error('录音与文字版本不一致');
    const audioName = cues?.audio || item.audio.name;
    const base = item.name.replace(/\.txt$/i, '').toLowerCase();
    if (!['mp3','m4a','ogg'].some(extension => audioName.toLowerCase() === `${base}.${extension}`)) throw new Error('录音文件名不匹配');
    const response = await fetchWithTimeout(directory + audioName, { cache:'no-store' });
    if (!response.ok) throw new Error('录音读取失败');
    const bytes = await response.arrayBuffer();
    const hash = await sha256Hex(bytes);
    if (cues?.audioHash && cues.audioHash.toLowerCase() !== hash) throw new Error('录音版本不匹配');
    if (requestId !== writingLoadRequestId) return;
    const audio = document.getElementById('writingAudio');
    writingAudioObjectUrl = URL.createObjectURL(new Blob([bytes], { type:response.headers.get('content-type') || 'audio/mpeg' }));
    audio.src = writingAudioObjectUrl;
    audio.playbackRate = libraryPlayerStates.writing.speed;
    const range = cues?.segments?.a1 || cues?.segments?.answer;
    libraryPlayerStates.writing.defaultRange = validListeningCue(range) ? { start:Number(range.start), end:Number(range.end) } : null;
    audio.load();
    status.textContent = range && validListeningCue(range) ? '配套录音已加载，播放答案片段。' : '配套答案录音已加载。';
    cacheDayForOffline(Number(item.name.match(/\d{3}/)[0]), [{ url:directory + audioName, sha256:hash }]);
  } catch (error) {
    if (requestId === writingLoadRequestId) status.textContent = `${error.message}，点击听答案可使用系统英文朗读。`;
  }
}
