# Homework content architecture

This document is the source of truth for daily word, speaking, and listening homework. Keep `index.html`, local tooling, and GitHub Actions compatible with this contract.

## Goals

- A parent can upload daily homework from a phone.
- A day may contain words, speaking, listening, or any combination of them.
- The website discovers valid days automatically and ignores missing or empty inputs.
- Speaking uses one compact audio file per day, not many permanent clips.
- Questions and answers can be played independently by seeking within the daily audio.
- A day may contain question-only, answer-only, or question-and-answer exercises.
- API credentials never appear in the repository, website, generated files, or logs.

## Flat directory layout

All daily content lives in `homework/`:

```text
homework/
  word005.txt
  speaking005.txt
  speaking005.jpg
  speaking005.m4a
  speaking005.cues.json
  listening008.mp3
```

The three-digit number is the shared day identifier. Do not mix forms such as `day-005`, `day005`, and `005` in filenames.

### Daily inputs

- `word###.txt`: the word list for a day.
- `speaking###.txt`: the speaking text for a day.
- `speaking###.jpg`, `.jpeg`, `.png`, or `.webp`: an optional picture prompt displayed above the speaking text.
- `listening###.mp3`, `.m4a`, or `.ogg`: an optional complete listening exercise.

An empty or missing input is ignored. A Day may contain only one homework type; for example, `listening008.mp3` creates a valid listening-only Day 8 even when `word008.txt` does not exist.

### Generated outputs

- `speaking###.mp3`, `.m4a`, or `.ogg`: one complete audio file for the day.
- `speaking###.cues.json`: optional time ranges for individual Q/A segments.

MP3 is the preferred automated output for broad compatibility. Existing AAC/M4A audio remains supported. Temporary per-segment audio may be created during generation, but must not be committed.

## Word TXT format

Metadata lines are optional. Word rows retain the existing pipe-delimited format:

```text
# Day: 5
# Topics: Food & Drink

apple | n. | 苹果
banana | n. | 香蕉
```

## Speaking TXT format

Numbered `Q<number>:` and `A<number>:` labels remain supported. Plain `Q:` and `A:` pairs are numbered automatically, and a file with no Q/A labels is displayed in full as one speaking passage. Either side may be omitted:

```text
# Day: 5
# Title: 今日口语作业

Q1: What is your favourite subject?
A1: My favourite subject is mathematics.

Q2: What do you do after school?
```

Continuation lines belong to the preceding Q or A. Empty files are ignored.

## Cue file format

```json
{
  "version": 1,
  "audio": "speaking005.mp3",
  "sourceHash": "sha256-of-speaking005.txt",
  "audioHash": "sha256-of-speaking005.mp3",
  "segments": {
    "q1": { "start": 0.5, "end": 2.8 },
    "a1": { "start": 3.2, "end": 8.9 }
  }
}
```

Times are seconds from the start of the daily audio. `sourceHash` and `audioHash` are lowercase SHA-256 values that bind the cue file to the exact text and audio. A missing segment means that no audio button is shown for that Q or A. When both exist, the UI also offers continuous Q+A playback.

## Website behavior

The interface has three focus-preserving top-level tabs: **背单词**, **口语练习**, and **听力练习**. Only one learning area is visible at a time, while the Day selector remains shared. The last selected top-level tab is remembered locally. A listening-only Day disables the word tab and opens Listening automatically.

Speaking uses child-focused controls instead of the browser's native audio controls: 0.75×, 0.85×, 1.0×, and 1.25× speed choices; pause/resume; a two-second rewind for repeating the most recent word; and optional looping of the active Q, A, Q+A, or full recording.

The word-study area uses the full iPad content width for toolbars, mode selectors, and the on-screen keyboard while keeping reading cards centered at a comfortable width. Learn mode optionally advances and speaks words every 2, 5, or 10 seconds (5 seconds by default); this automation stops when leaving Learn mode, switching to Speaking, or putting the page in the background.

The header keeps a small application version for troubleshooting and shows the selected Day's last complete device-sync time. This timestamp advances only after both the online word library and the matching speaking bundle are confirmed; offline reopening displays the stored time rather than the current clock.

1. Discover Days from the union of `word###.txt`, `speaking###.txt`, and `listening###` audio files.
2. Sort by day number and open the largest valid Day by default.
3. When the selected Day changes, load every matching content type that exists.
4. Load `speaking###.txt`, the optional same-name image and cue file, and matching daily audio.
5. Seek the shared speaking audio element to the requested segment and stop at its end.
6. Load listening audio through the browser's native streaming controls; do not proactively cache it.
7. Hide controls for missing content or cue segments, and keep failures in one homework type from breaking the others.

Remote discovery and individual content reads stop waiting after 60 seconds. If a local library cache exists, the website immediately keeps using it; otherwise it shows a clear read-failure message instead of waiting indefinitely.

Filename matching is the baseline binding rule. When no fingerprints exist, a matching MP3, M4A, or OGG remains playable; without cues, only the complete recording is offered. When both cue fingerprints exist, the website additionally requires the TXT and audio hashes to match. A mismatch means only part of a fingerprinted set changed, so text remains visible while stale audio and segment buttons stay hidden.

The local one-click preview exposes a read-only `/__homework-index.json` endpoint so the same Day selector can discover local files. GitHub Pages uses the GitHub Contents API instead. Cloudflare Workers Static Assets reads the same-origin `homework/index.json` generated inside a clean `dist/` directory. Configure Cloudflare with build command `npm run build` and deploy command `npx wrangler deploy`; `wrangler.jsonc` publishes only `dist/`.

## Offline behavior

- A Service Worker caches the application shell so the site can reopen without a network connection.
- After a verified speaking Day loads successfully, its TXT, optional picture, cue JSON, and complete daily audio are cached as one versioned set.
- Listening exercises are intentionally streamed and excluded from the managed offline set because they may be large.
- Cached file hashes are compared before writing. Unchanged resources are not rewritten; changed resources replace the old set only after every expected hash has been verified.
- The UI reports `离线已就绪` only after the complete matching set is available.
- During a Service Worker version change, offline saving waits for the active worker and retries up to three times before asking the user to refresh.
- Word libraries retain the existing `localStorage` offline cache and learning history remains local.
- Cached audio must support HTTP Range responses so Q/A seeking continues to work offline.
- Navigation checks the network first and falls back to the cached app shell; this allows new deployments to replace old UI code when online.
- Users should add the GitHub Pages site to the iPad Home Screen and periodically open it online. Browser storage can still be removed if the user clears site data or the operating system is under storage pressure.

## Future automation

A GitHub Actions workflow may run when `homework/speaking###.txt` changes:

1. Parse the speaking TXT.
2. Generate Q and A segments separately with the OpenAI Audio API.
3. Concatenate temporary segments into one daily MP3.
4. Record exact segment durations in the cue JSON.
5. Delete temporary segment files.
6. Commit only the daily audio and cue JSON.

Store `OPENAI_API_KEY` only as a GitHub Actions Secret and expose it to the generator as an environment variable. The workflow must never echo the key or embed it in files.

## Current manual audio

`speaking004.m4a` and `speaking005.m4a` are preserved full recordings. Their cue boundaries were derived from detected pauses and should be checked by listening before publication.
