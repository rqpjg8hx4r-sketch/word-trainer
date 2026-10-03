# 英语内容设计规范

本文档是词汇、听力、口语和写作素材的唯一内容规范。网页、本地音频生成工具、离线缓存和部署构建都必须与本文保持一致。

## 目标

- 默认进入英语的词汇分类，每次打开都从词汇开始。
- 四类材料独立发现、独立选择；一种缺失或加载失败不会影响其他分类。
- Day 是词汇或口语材料的编号标签，不再将不同分类绑定到同一天。
- 保留现有词汇学习历史的存储键、数据结构和统计行为。
- 听力使用原 practice 目录的长期素材，旧 listening008.mp3 作业已移除。
- 配套录音属于可选增强；单词录音缺失或校验失败时使用系统英文 TTS。
- API Key 不得出现在仓库、网页、生成文件或日志中。

## 目录与命名

所有英语素材统一放在 english/，按用途分四个目录：

```text
english/
  word/
    word010.txt
    word010.mp3
    word010.cues.json
    paraphrase014.txt
    paraphrase014.mp3
    paraphrase014.cues.json
  listening/
    general001 Greeting and introduction.m4a
    general001 Greeting and introduction.txt
    irregular-verbs.txt
    irregular-verbs.mp3
    irregular-verbs.cues.json
  speaking/
    speaking010.txt
    speaking010.jpg
    speaking010.mp3
    speaking010.cues.json
  writing/
    writing001.txt
    writing001.jpg
```

三位编号继续保留，迁移不修改 TXT、音频或 cues 文件内容。相同 basename 的 TXT、音频、cues 和图片组成一份材料；文件不能跨分类配套。

### 输入文件

- 词汇：word###.txt 和 paraphrase###.txt。
- 口语：speaking###.txt，可配同名 JPG、JPEG、PNG 或 WebP 图片以及 MP3、M4A 或 OGG 录音。
- 听力：MP3、M4A 或 OGG 音频是必需文件；同名 TXT、cues 和图片可选，允许 basename 含空格。
- 写作：writing###.txt，可配同名 JPG、JPEG、PNG 或 WebP 图片，以及可选 MP3、M4A、OGG 答案录音；不需要 cues。
- 写作 TXT 使用 `#title: Writing 001 | Email: A cinema invitation` 作为内容标题，正文分为独占一行的 `#question`、`#answer`、`#tip`。网页读取 title 显示标题；参考答案默认折叠，写作提示默认展开，原文完整保留。仍兼容旧版 QUESTION、ANSWER、WRITING TIP 标题。
- 参考答案后复用通用播放器，支持变速、暂停、重听与循环。没有录音时使用系统英文 TTS；系统朗读与 AI 录音生成器共用 writing-material.js，只读 `#answer` 正文，到下一个 `#` 字段停止，不读标题、题目或提示。TTS 重听从当前句开始，录音重听回退约两秒。
- 配套写作录音只包含答案，网页直接整段播放同名音频，不读取 cues，也不校验 TXT 与录音的指纹关系。清理换行、修改题目或提示后仍可播放原录音。录音缺失或播放失败时回退系统英文朗读。
- 没有图片的材料正常显示文字；缺少 TXT 的独立图片不会形成一份写作或口语材料。

### 生成文件与索引

单词和口语录音仍采用一个完整音频加分段 cues。音频生成命令在对应分类中输出文件，不改变 basename。

源码目录无需手工维护 index.json，启动脚本和构建会自动更新四个分类的同源索引。本地预览通过 /__english-index.json?category=word（或 listening、speaking、writing）扫描对应目录；已运行的旧预览服务不认识新接口时，网页回退读取 english/分类/index.json。启动脚本验证并复用当前项目的服务，固定 8765 端口，保留原浏览器学习记录。启动实现位于仓库内 start-word-trainer.cmd 和 scripts/start-preview.js，父目录原启动入口调用它们。GitHub Pages 使用 Contents API 发现 english/分类，其他静态部署使用 npm run build 自动生成的 dist/english/分类/index.json。

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
npm run audio:words -- english/word/word010.txt
```

不带 `--limit` 时生成 TXT 中的全部词条。如果同名 `word010.mp3` 已存在，命令会直接跳过，不调用语音 API，也不覆盖 MP3 或 cues，适合在自动化流程中重复执行。

`alex-english` 目录下运行 `word2mp3` 时，会扫描所有 `word###.txt` 并且只生成缺少同名 MP3 的日期；`word2mp3 010` 仍只处理 Day 010。自动化环境可以直接使用仓库内的 `npm run audio:missing`。

常用选项：

```powershell
# 只生成前 10 个词
npm run audio:words -- english/word/word010.txt --limit 10

# 只检查解析结果，不调用 API、不覆盖文件
npm run audio:words -- english/word/word010.txt --dry-run

# 临时覆盖声音或提示词
npm run audio:words -- english/word/word010.txt --voice marin --instructions "自定义提示词"

# 明确需要重新生成时，强制覆盖已有 MP3 和 cues
npm run audio:words -- english/word/word010.txt --force
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

生成器逐词调用语音 API。发送前会清理括号、零宽字符、异常空格、弯引号、特殊连字符和末尾标点，例如 `enter (a competition)` 发送为 `enter a competition`，`sport(s)` 发送为 `sports`。生成器以 WAV 的实际数据长度计算时长，并在拼接前检查 16 位 PCM 峰值。低于 -40 dB 的近静音响应会自动重试，最多尝试 3 次；仍为静音时终止生成且不覆盖原 MP3。验证通过后再插入静音并合并为一个 MP3。API Key 只能通过 `OPENAI_API_KEY` 环境变量提供。

调试阶段保留中间文件，目录位于仓库上一级的 `temp/day###/`，例如 `alex-english/temp/day009/007-block.wav`。目录中同时保留 `gap.wav`、`concat.txt`、临时合并的 `output.mp3` 和记录生成参数、时长、峰值的 `generation.json`。近静音响应另存为 `007-block.silent-attempt1.wav` 等文件，方便排查。重新生成同一个 Day 会覆盖同名文件，但不会自动删除该目录。

## 本地口语录音生成命令

在 `alex-english` 目录运行：

```bat
speaking2mp3 014
```

命令读取 `word-trainer/english/speaking/speaking014.txt`，生成同目录的 `speaking014.mp3` 和 `speaking014.cues.json`。TXT 中的 `Q1/A1`、`Q/A` 及跨行答案使用与网页一致的解析规则；问题和完整答案分别生成 WAV，再直接拼接为一个 MP3，并写入 `q1`、`a1` 等精确时间范围。

不带 Day 时，`speaking2mp3` 会扫描全部 `speaking###.txt`，生成缺少录音或 cues 中 `sourceHash` 已与 TXT 不一致的日期。已有录音且 TXT、cues、音频指纹全部匹配时直接跳过，避免重复调用 API；TXT 修改后则自动重新生成，不必额外传 `--force`。批量模式会保护没有可验证 cues 的旧手工录音，因为程序无法判断 TXT 是否变化；明确运行 `speaking2mp3 001` 时则会为这个 Day 生成新版 MP3 和 cues。Day 参数必须是三位数字。

也可以在 `word-trainer` 目录直接运行：

```powershell
npm run audio:speaking -- english/speaking/speaking014.txt
npm run audio:speaking -- english/speaking/speaking014.txt --dry-run
npm run audio:speaking -- english/speaking/speaking014.txt --force
npm run audio:speaking-missing
```

口语生成器固定使用 `gpt-4o-mini-tts`、`marin`、24 kHz 单声道 96 kbps MP3，并在问题和答案片段之间插入 0.75 秒静音。`--force` 可以生成 MP3 替换版本，但不会删除已有 M4A 或 OGG；新 cues 会明确指向生成的 MP3。中间 WAV、拼接清单和生成记录保留在 `alex-english/temp/speaking-day###/`，便于定位问题。

## 本地写作答案录音生成命令

在 `alex-english` 目录运行 `writing2mp3 001` 生成一份，或运行 `writing2mp3` 生成全部缺失或过期的写作录音。在 `word-trainer` 目录也可以运行：

```powershell
npm run audio:writing -- english/writing/writing001.txt --dry-run
npm run audio:writing -- english/writing/writing001.txt
npm run audio:writing-missing
```

TXT 格式示例：

```text
#title: Writing 001 | Email: A cinema invitation

#question
Write an email to invite your friend to the cinema.

#answer
Hi Jay,
Would you like to go to the cinema with me on Saturday?
See you soon!
Alex

#tip
Invite → Suggest → Reason → End
```

写作复用口语录音生成器和声音设置，但只朗读 `#answer` 内容。缺少或为空的答案会报错，禁止回退朗读整份 TXT。只输出同名答案 MP3，不生成 cues，网页自动整段播放；中间文件保留在 `temp/writing-day###/`。`--dry-run` 仅显示将要朗读的答案，不调用 API。

写作生成器发现同名 MP3、M4A 或 OGG 就直接跳过，不依赖 cues；修改 TXT 后已有录音继续保留，避免因清理排版重复调用 API。旧写作 cues 不再使用，可自行删除。真正修改答案并需要重录时，运行 `npm run audio:writing -- english/writing/writing001.txt --force`。口语生成器保留原来的 TXT 指纹检查。

## 本地同义转换录音生成命令

在 `alex-english` 目录运行：

```bat
paraphrase2mp3 014
```

命令读取 `word-trainer/english/word/paraphrase014.txt` 的英文 A、英文 B 两列，生成 `paraphrase014.mp3` 和 `paraphrase014.cues.json`。时间点使用 `a1`、`b1`、`a2`、`b2` 等键。相同英文在同一个 Day 内只生成一次，所有对应键共用同一段录音；`get / have a cold` 等斜杠短语会转换为 `get or have a cold` 后朗读。

不带 Day 时，`paraphrase2mp3` 会生成所有缺失或 TXT/MP3 指纹已变化的同义转换录音。指纹全部一致时自动跳过。也可以在 `word-trainer` 目录运行：

```powershell
npm run audio:paraphrase -- english/word/paraphrase014.txt
npm run audio:paraphrase -- english/word/paraphrase014.txt --dry-run
npm run audio:paraphrase -- english/word/paraphrase014.txt --force
npm run audio:paraphrase-missing
```

生成器复用单词录音的模型、固定提示词、WAV 峰值检查、静音重试和 ffmpeg 拼接逻辑。默认使用 `gpt-4o-mini-tts`、`marin`，相邻的唯一短语间插入 0.75 秒静音。中间文件保留在 `alex-english/temp/paraphrase-day###/`。

## 网页行为

英语导航固定为词汇、听力、口语和写作。每类都有自己的材料选择器，一次只显示一类。词汇与口语各自按编号选择最新有效材料，互不改变对方选择；听力按素材名称独立选择，写作按编号选择最新素材。分类切换时暂停离开的音频和连续播放。

英语、游戏、数学、编程四个首页共用 site-nav.css 的 900px 内容宽度、12px 手机边距与滚动条占位，切换板块时导航和内容左右边界一致。

跨板块导航仅在这四个首页显示。魔方、具体游戏、数学专题、编程关卡和单词打字页保留各自返回板块首页的入口，以及页面内的阶段、模式或关卡导航。

单词打字入口位于词汇材料选择器旁，将当前词汇 Day 带到 type.html?day=###。学习记录仍保留在词汇模式栏。

词句练习中的单词模式默认使用当前 Day 的完整词库，不再划分“第 1 页、第 2 页、全本”。学习卡显示 `当前位置/总词数`，提供上一个、下一个、前跳 10 个和后跳 10 个导航；到达词库首尾时停止，不循环。打印默写入口位于 Day 选择器旁。学习、选义和拼写卡片与顶层区域保持同宽。历史模式继续保留在模式栏中。

### 同义转换

- 同义转换素材使用 `english/word/paraphrase###.txt`，每个非注释行固定为 `英文 A | 中文 A | 英文 B | 中文 B`。
- `paraphrase###.txt` 与同目录单词材料按三位 Day 编号合并发现；即使没有同日 `word###.txt`，该 Day 也会出现在选择器中。
- 当天有同义转换素材时，词句练习的模式栏动态显示“🔁 同义转换”；旧 Day 没有素材时不显示，不改变原单词流程。
- 卡片一次显示一组，默认同时显示题目和答案，也可手动隐藏答案；支持 A→B、B→A 切换、上一组、下一组，并可分别朗读题目或答案的完整英文。
- 网页优先读取同名 `paraphrase###.mp3` 和 cues，两个喇叭分别定位 A/B 片段；TXT、MP3 与 cues 指纹必须全部一致。文件缺失、当前侧没有时间点或播放失败时自动回退系统英文 TTS。
- 只有同义转换而没有单词的 Day 会默认进入同义转换，同时禁用学习、选义、拼写、打印和游戏。首版不提供测验、拼写或独立统计。

页面固定预留纵向滚动条空间，避免在内容长度不同的顶层区域之间切换时整体横向跳动。“连对”只显示在选义和拼写卡片右上角，不占用全局标题区域。

### 单词发音

1. 选择 Day 后，网页尝试读取同名 `word###.cues.json` 和其中指定的 `word###.mp3`。
2. TXT、MP3 与 cues 的 SHA-256 必须全部匹配，才启用录音片段。
3. 学习、选义测试和键盘拼写共用同一个发音入口。
4. 当前词有 cue 时，从 `start` 前最多 0.25 秒的静音处开始预滚，并在 `end` 停止。预滚用于避免 iPad Safari 在 MP3 非零时间点起播时截掉首音；第一个词最低从 0 秒开始。
5. cues 或 MP3 缺失、指纹不匹配、当前词没有 cue、浏览器播放失败时，自动回退系统英文 TTS。
6. 键盘拼写默认静音，只有点击喇叭时发音；“上一个”和“下一个”循环浏览未完成词条，不记为拼写错误。

### 口语

- 口语区按时间点播放 Q、A 或 Q+A，支持 0.75×、0.85×、1.0×、1.25×，以及暂停、回退约两秒和片段循环。
- 没有 cues 的同名口语录音仍可整段播放。
- 听力与口语区复用同款控制条，支持 0.75×、0.85×、1.0×、1.25×、整段播放、暂停/继续、回退约两秒和循环；不主动加入受管离线缓存。

### 听力

- 从 `english/listening/` 中的 MP3、M4A 和 OGG 音频发现练习项目，同一 basename 只形成一项。
- 没有同名 TXT 时只显示完整播放器，适合磨耳朵素材。
- 有同名 TXT 时使用与每日口语相同的 Q/A 或纯文本解析规则。
- 有同名 cues 时使用与每日口语相同的 `segments.q1`、`segments.a1` 时间点显示分段按钮；cues 指定的音频文件名或 TXT 指纹不匹配时禁用分段，但仍保留文字和完整播放。
- 可选同名 JPG、JPEG、PNG 或 WEBP 图片。
- 完整播放使用与每日口语相同的速度、暂停、回退和循环控件；Q/A 分段按钮控制同一个播放器。
- 听力素材在线播放，不加入受管离线缓存。

### TT 打字练习

- `type.html` 读取查询参数中的 Day，并直接复用 `english/word/word###.txt` 词库，不维护第二份单词数据。
- 点击开始后，英文单词从上方向下落；键入正确前缀时对应字母变绿，完整命中后单词消失并显示中文释义。
- 命中后优先使用通过时间定位文件找到的 `word###.mp3` 片段；没有录音、没有对应 cue 或播放失败时使用系统英文 TTS。
- 每局目标为命中 10 个词，顶部显示 `当前命中/10`、五次生命、WPM、准确率和当前连击，并提供下落速度、暂停与重新开始。
- 正确命中会累积连击，输错字母或漏词会中断连击；3、5、10 连击显示短暂庆祝提示。
- 命中 10 个词后立即结算：完成关卡获得第一颗星、准确率达到 90% 获得第二颗星、最高连击达到 5 获得第三颗星。结算卡显示命中进度、准确率、最高连击和下一颗星的明确目标。
- 单词掉到底部时，卡片变红并短暂左右晃动，同时播放柔和提示音，随后优先用录音片段朗读漏词，失败时回退系统 TTS；连续漏词不会叠加播放。
- `type.html` 属于应用外壳，可离线打开；单词内容和发音继续沿用原有 Day 的缓存策略。

### 内容发现与部署

1. 词汇只发现 english/word 下的单词和同义转换材料，口语只发现 english/speaking 下的 TXT，写作只发现 english/writing 下的 TXT，听力只发现 english/listening 下的音频。
2. 每次打开默认显示词汇；口语、听力和写作选择不受词汇 Day 影响。
3. 目录与材料请求最多等待 60 秒；失败时目录优先使用本地素材清单缓存。
4. 本地一键预览使用只读 /__english-index.json?category=分类。
5. GitHub Pages 使用对应分类的 GitHub Contents API，无需手工索引。
6. npm run build 生成干净 dist/ 和四个同源 english/分类/index.json，打包所有同名配套文件。

同名文件是基础绑定规则。词汇、口语和同义转换的带指纹 cues 必须匹配 TXT 与音频。写作录音只按同名文件绑定，允许 TXT 变化，不读取 cues，整段播放答案。

## 离线缓存

- Service Worker 缓存应用外壳，使网页断网后仍能打开。
- 成功校验的单词录音以 `word###.txt`、`word###.cues.json`、`word###.mp3` 三文件版本组缓存。
- 没有单词 MP3/cues 的 Day 不会尝试缓存不存在的文件，也不会报错；单词继续使用系统 TTS。
- 成功校验的口语作业会缓存 TXT、可选图片、可选 cues 和完整录音。
- 听力文件可能较大，保持在线播放，不加入受管离线缓存。
- 写入前校验文件哈希；相同文件不重复写入，变化文件只有在预期哈希验证成功后才替换。
- 缓存音频支持 HTTP Range 响应，因此断网时仍能按时间点定位。
- Service Worker 更新时迁移旧 homework 和 practice 缓存到新分类路径，保留已下载内容；导航在线优先、失败时回退缓存页面。
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
6. 只提交最终 MP3 和需要分段的 cues JSON；写作只需 MP3。

`OPENAI_API_KEY` 只能保存为 GitHub Actions Secret，工作流不得输出或写入该密钥。

## 现有手工录音

`speaking004.m4a` 和 `speaking005.m4a` 保留为完整手工录音。它们的 cues 来自静音检测，发布前仍应人工试听确认边界。
