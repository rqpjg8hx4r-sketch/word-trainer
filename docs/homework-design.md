# 作业内容设计规范

本文档是每日单词、口语、听力作业和长期日常练习的唯一内容规范。`index.html`、本地生成工具、离线缓存和部署流程都必须与本文保持一致。

## 目标

- 家长可以从手机上传每日作业。
- 同一天可以包含单词、口语、听力中的任意一种或多种内容。
- 网页自动发现有效 Day，缺失或空文件不会影响其他作业类型。
- 单词和口语录音每天只保留一个完整音频，通过 cues 时间点播放局部片段。
- 配套录音属于可选增强；没有录音、cues 无效或播放失败时，单词继续使用系统 TTS。
- API Key 不得出现在仓库、网页、生成文件或日志中。
- 长期素材统一放在 `practice/`，网页根据同名配套文件自动决定只播放音频、显示文字或启用分段播放。

## 目录与命名

所有每日内容平铺在 `homework/`：

```text
homework/
  word010.txt
  word010.mp3
  word010.cues.json
  speaking010.txt
  speaking010.jpg
  speaking010.m4a
  speaking010.cues.json
  listening010.mp3
```

三位数字是共享的 Day 编号。文件名中不得混用 `day-010`、`day010` 和 `010` 等其他形式。

长期练习不占用 Day 编号，统一放在 `practice/`，例如：

```text
practice/
  general001.m4a
  general001.txt
  general001.cues.json
  general001.jpg
  listening001.mp3
```

音频是每项长期练习唯一的必需文件。网页自动寻找同名 TXT、cues 和图片：只有音频时显示完整播放器；有 TXT 时同时显示文字；再有 cues 时提供 Q、A 和 Q+A 分段按钮；同名图片也会自动显示。

源码目录不需要人工维护 `index.json`。本地预览服务器自动扫描目录，GitHub Pages 使用 GitHub Contents API，`npm run build` 则自动生成 `dist/practice/index.json`。

### 输入文件

- `word###.txt`：当日单词表。
- `speaking###.txt`：当日口语文本。
- `speaking###.jpg`、`.jpeg`、`.png` 或 `.webp`：可选口语题目图片。
- `listening###.mp3`、`.m4a` 或 `.ogg`：可选完整听力练习。

缺失或空文件会被忽略。某个 Day 可以只有一种作业，例如只有 `listening008.mp3` 也能形成有效的 Day 8。

### 生成文件

- `word###.mp3`：当日全部单词或短语合并后的录音。
- `word###.cues.json`：各单词在 MP3 中的时间范围及版本指纹。
- `speaking###.mp3`、`.m4a` 或 `.ogg`：当日完整口语录音。
- `speaking###.cues.json`：各问题和答案的时间范围。

自动生成优先使用 MP3，以获得较广的浏览器兼容性；已有 AAC/M4A 口语录音继续支持。生成过程中产生的分段 WAV 等临时文件不得提交。

## 单词 TXT 格式

元数据行可选。单词行使用竖线分隔：

```text
# Day: 10
# Topics: Services | Shopping | Weather

bank | n. | 银行
cafe / café | n. | 咖啡馆；小餐馆
```

每行第一列是网页显示和拼写训练使用的原始词条。生成语音时，普通斜线变体默认选择第一个；如果变体中含有重音字符，则优先选择该形式，例如 `cafe / café` 读作 `café`。

## 口语 TXT 格式

支持带编号的 `Q<number>:`、`A<number>:`，也支持不带编号的 `Q:`、`A:`，后者会自动编号。没有 Q/A 标签的文件会作为一段完整文本显示。问题或答案可以单独存在：

```text
# Day: 5
# Title: 今日口语作业

Q1: What is your favourite subject?
A1: My favourite subject is mathematics.

Q2: What do you do after school?
```

连续行归入前一个 Q 或 A；空文件会被忽略。

## 单词 cues 格式

```json
{
  "version": 1,
  "model": "gpt-4o-mini-tts",
  "voice": "marin",
  "instructions": "完整的固定语音提示词",
  "audio": "word010.mp3",
  "sourceHash": "word010.txt 的小写 SHA-256",
  "audioHash": "word010.mp3 的小写 SHA-256",
  "gapSeconds": 0.75,
  "items": [
    {
      "index": 0,
      "sourceText": "bank",
      "spokenText": "bank",
      "start": 0.0,
      "end": 0.85
    }
  ]
}
```

- `start`、`end` 的单位为秒，均从完整 MP3 开头计算。
- `sourceHash` 和 `audioHash` 将 cues 绑定到精确的 TXT 与 MP3 版本。
- `instructions` 保存实际生成时使用的完整提示词，便于追溯和重复生成。
- `sourceText` 必须与 TXT 第一列对应；`spokenText` 是实际发送给 TTS 的内容。
- 允许 cues 只覆盖部分单词；没有时间点的单词自动使用系统 TTS。

## 口语 cues 格式

```json
{
  "version": 1,
  "audio": "speaking005.mp3",
  "sourceHash": "speaking005.txt 的小写 SHA-256",
  "audioHash": "speaking005.mp3 的小写 SHA-256",
  "segments": {
    "q1": { "start": 0.5, "end": 2.8 },
    "a1": { "start": 3.2, "end": 8.9 }
  }
}
```

缺少某个 segment 时，不显示对应的分段按钮；Q 和 A 同时存在时，网页另外提供 Q+A 连续播放。

## 本地单词录音生成命令

在 `word-trainer` 目录运行：

```powershell
$env:OPENAI_API_KEY="你的 API Key"
npm run audio:words -- homework/word010.txt
```

不带 `--limit` 时生成 TXT 中的全部词条，并覆盖同目录下的 `word010.mp3` 和 `word010.cues.json`。

常用选项：

```powershell
# 只生成前 10 个词
npm run audio:words -- homework/word010.txt --limit 10

# 只检查解析结果，不调用 API、不覆盖文件
npm run audio:words -- homework/word010.txt --dry-run

# 临时覆盖声音或提示词
npm run audio:words -- homework/word010.txt --voice marin --instructions "自定义提示词"
```

默认设置：

- 模型：`gpt-4o-mini-tts`
- 声音：`marin`
- 分段输出：WAV
- 最终输出：24 kHz、单声道、96 kbps MP3
- 相邻词固定插入 0.75 秒静音

0.75 秒静音完整插在前一个分词 WAV 结束与下一个分词 WAV 开始之间，即“单词 WAV → 固定静音 → 下一个单词 WAV”。TTS 返回的 WAV 自身可能含少量首尾静音，因此实际听感间隔可能略长于 0.75 秒。

当前固定单词提示词：

```text
Pronounce only the supplied English word or phrase once. Speak in a cheerful and positive tone. Use clear, natural American English and do not add any other words.
```

生成器逐词调用语音 API，以 WAV 的实际数据长度计算时长，并在拼接前检查 16 位 PCM 峰值。低于 -40 dB 的近静音响应会自动重试，最多尝试 3 次；仍为静音时终止生成且不覆盖原 MP3。验证通过后再插入静音并合并为一个 MP3。API Key 只能通过 `OPENAI_API_KEY` 环境变量提供。

调试阶段保留中间文件，目录位于仓库上一级的 `temp/day###/`，例如 `alex-english/temp/day009/007-block.wav`。目录中同时保留 `gap.wav`、`concat.txt`、临时合并的 `output.mp3` 和记录生成参数、时长、峰值的 `generation.json`。近静音响应另存为 `007-block.silent-attempt1.wav` 等文件，方便排查。重新生成同一个 Day 会覆盖同名文件，但不会自动删除该目录。

## 网页行为

网页有四个顶层区域：**背单词**、**口语练习**、**听力练习**、**日常练习**。前三个区域共享 Day 选择器；日常练习拥有独立素材选择器，不跟随 Day。一次只显示一个区域，并在本地记住上次选择。只有听力内容的 Day 会禁用单词页并自动打开听力页。

单词区工具栏提供较小的 **⌨️ TT** 入口，位于“打印默写”左侧，并使用与其他工具按钮相同的配色。入口把当前 Day 带到独立的 `type.html?day=###` 打字页。

### 单词发音

1. 选择 Day 后，网页尝试读取同名 `word###.cues.json` 和其中指定的 `word###.mp3`。
2. TXT、MP3 与 cues 的 SHA-256 必须全部匹配，才启用录音片段。
3. 学习、选义测试和键盘拼写共用同一个发音入口。
4. 当前词有 cue 时，从 `start` 前最多 0.25 秒的静音处开始预滚，并在 `end` 停止。预滚用于避免 iPad Safari 在 MP3 非零时间点起播时截掉首音；第一个词最低从 0 秒开始。
5. cues 或 MP3 缺失、指纹不匹配、当前词没有 cue、浏览器播放失败时，自动回退系统英文 TTS。
6. 键盘拼写默认静音，只有点击喇叭时发音；“上一个”和“下一个”循环浏览未完成词条，不记为拼写错误。

### 口语与听力

- 口语区按时间点播放 Q、A 或 Q+A，支持 0.75×、0.85×、1.0×、1.25×，以及暂停、回退约两秒和片段循环。
- 没有 cues 的同名口语录音仍可整段播放。
- 听力与口语区复用同款控制条，支持 0.75×、0.85×、1.0×、1.25×、整段播放、暂停/继续、回退约两秒和循环；不主动加入受管离线缓存。

### 日常练习

- 从 `practice/` 中的 MP3、M4A 和 OGG 音频发现练习项目，同一 basename 只形成一项。
- 没有同名 TXT 时只显示完整播放器，适合磨耳朵素材。
- 有同名 TXT 时使用与每日口语相同的 Q/A 或纯文本解析规则。
- 有同名 cues 时使用与每日口语相同的 `segments.q1`、`segments.a1` 时间点显示分段按钮；cues 指定的音频文件名或 TXT 指纹不匹配时禁用分段，但仍保留文字和完整播放。
- 可选同名 JPG、JPEG、PNG 或 WEBP 图片。
- 完整播放使用与每日口语相同的速度、暂停、回退和循环控件；Q/A 分段按钮控制同一个播放器。
- 日常练习在线播放，不加入受管离线缓存。

### TT 打字练习

- `type.html` 读取查询参数中的 Day，并直接复用 `homework/word###.txt` 词库，不维护第二份单词数据。
- 点击开始后，英文单词从上方向下落；键入正确前缀时对应字母变绿，完整命中后单词消失并显示中文释义。
- 命中后优先使用通过时间定位文件找到的 `word###.mp3` 片段；没有录音、没有对应 cue 或播放失败时使用系统英文 TTS。
- 每局目标为命中 10 个词，顶部显示 `当前命中/10`、五次生命、WPM、准确率和当前连击，并提供下落速度、暂停与重新开始。
- 正确命中会累积连击，输错字母或漏词会中断连击；3、5、10 连击显示短暂庆祝提示。
- 命中 10 个词后立即结算：完成关卡获得第一颗星、准确率达到 90% 获得第二颗星、最高连击达到 5 获得第三颗星。结算卡显示命中进度、准确率、最高连击和下一颗星的明确目标。
- 单词掉到底部时，卡片变红并短暂左右晃动，同时播放柔和提示音，随后优先用录音片段朗读漏词，失败时回退系统 TTS；连续漏词不会叠加播放。
- `type.html` 属于应用外壳，可离线打开；单词内容和发音继续沿用原有 Day 的缓存策略。

### 内容发现与部署

1. 从 `word###.txt`、`speaking###.txt` 和 `listening###` 音频的并集发现 Day。
2. 按 Day 编号排序，默认打开最大的有效 Day。
3. 切换 Day 时，各作业类型独立加载；一种失败不得破坏其他类型。
4. 远程发现和单文件读取最多等待 60 秒；失败时优先继续使用本地词库缓存。
5. 本地一键预览通过只读 `/__homework-index.json` 发现文件。
6. GitHub Pages 使用 GitHub Contents API。
7. Cloudflare Workers Static Assets 使用构建到干净 `dist/` 目录中的同源 `homework/index.json`；构建命令为 `npm run build`，部署命令为 `npx wrangler deploy`。
8. `practice/` 使用同样的三路发现机制，本地和 GitHub Pages 无需清单，构建时自动生成 `dist/practice/index.json`。

同名文件是基础绑定规则。带有完整指纹的 cues 必须同时匹配 TXT 和音频；任何一项变化都会禁用旧录音片段，防止文本与读音错位。

## 离线缓存

- Service Worker 缓存应用外壳，使网页断网后仍能打开。
- 成功校验的单词录音以 `word###.txt`、`word###.cues.json`、`word###.mp3` 三文件版本组缓存。
- 没有单词 MP3/cues 的 Day 不会尝试缓存不存在的文件，也不会报错；单词继续使用系统 TTS。
- 成功校验的口语作业会缓存 TXT、可选图片、可选 cues 和完整录音。
- 听力文件可能较大，保持在线播放，不加入受管离线缓存。
- 写入前校验文件哈希；相同文件不重复写入，变化文件只有在预期哈希验证成功后才替换。
- 缓存音频支持 HTTP Range 响应，因此断网时仍能按时间点定位。
- Service Worker 更新时最多自动重试三次；导航在线优先、失败时回退缓存页面。
- 词库内容与学习历史继续保存在 `localStorage`。
- 用户清除网站数据或系统存储压力过大时，浏览器仍可能删除缓存。

建议在 iPad 上将 GitHub Pages 网站添加到主屏幕，并定期联网打开一次，以获取新版应用和作业资源。

## 口语 TTS 基线

口语录音与单词录音的提示词不同。口语需要完整对话节奏，当前基线为：

- 模型：`gpt-4o-mini-tts`
- 声音：`marin`
- 输出：MP3
- 参考样本：相对仓库路径 `../audio-tools/tts-samples/q1-a1-marin-bright-relaxed.mp3`
- 目标：自然美式英语；温暖、明亮、轻快；约为成人正常对话速度的 85%；像与一个孩子面对面交谈，而不是课堂朗读。

完整口语提示词：

```text
Speak in natural American English to one school-age child, as if having a friendly face-to-face conversation. Use a warm, bright, upbeat, gently cheerful tone, as if smiling while speaking. Sound encouraging, lively, and confident, but never exaggerated. Keep the pace relaxed and unhurried, at about 85 percent of normal adult conversational speed. Use clear pronunciation without over-enunciating. Use natural conversational rhythm, sentence stress, intonation, and gentle short pauses. Pause naturally after the two-part question before giving the answer. Do not sound like a teacher giving a lesson, a textbook recording, a formal presentation, or mechanical TTS. The child will listen and imitate the pronunciation.
```

发送给语音 API 的文本不得包含 `Q1:`、`A1:` 等结构标签。问题、答案和句子之间应保留自然停顿。

## 后续自动化

未来可以在 `word###.txt` 或 `speaking###.txt` 变化时运行 GitHub Actions：

1. 解析 TXT。
2. 使用 OpenAI Audio API 分段生成语音。
3. 合并为当日一个 MP3。
4. 写入精确时间点、生成参数和文件哈希。
5. 删除临时分段文件。
6. 只提交最终 MP3 和 cues JSON。

`OPENAI_API_KEY` 只能保存为 GitHub Actions Secret，工作流不得输出或写入该密钥。

## 现有手工录音

`speaking004.m4a` 和 `speaking005.m4a` 保留为完整手工录音。它们的 cues 来自静音检测，发布前仍应人工试听确认边界。
