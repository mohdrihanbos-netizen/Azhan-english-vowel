# Vowel Galaxy – English Vowel Phonics (I, O, U) for Class 1

A static, offline-capable phonics game. HTML + CSS + vanilla JavaScript. No backend, no build step, no login.

## Files
```
index.html  style.css  script.js  manifest.json  service-worker.js
assets/images/icon.svg      assets/audio/   (optional recordings)
```
All paths are relative, so it works on a GitHub Pages project site (`https://USER.github.io/REPO/`).

## Deploy on GitHub Pages
1. Sign in at github.com and click **New repository**. Name it (e.g. `vowel-galaxy`), set it to **Public**, click **Create repository**.
2. Click **uploading an existing file**, drag in **everything inside** this folder (keep the `assets` folder structure; `index.html` must be at the top level). Click **Commit changes**.
3. Go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**. Pick branch **main** and folder **/ (root)**, then **Save**.
5. Wait 1–2 minutes, refresh, and open the link shown at the top of the Pages screen.
6. Open it once online; afterwards the core game works offline (service worker cache). If you update files, change `C='vowel-galaxy-v1'` in `service-worker.js` to `v2` so devices fetch the new version.

### Test in a sub-path locally
Put the folder inside another folder and serve the parent: `python3 -m http.server 8000`, then open `http://localhost:8000/vowel-galaxy/`.

## Audio
Words and sounds use the browser's built-in English voice (Web Speech API), so no files are required. If a device has no voice, the text is shown on screen instead. Short-vowel sounds from a synthetic voice can be imperfect, so for the best quality add your own recordings:
1. Record mp3 files named `word-ink.mp3`, `word-insect.mp3`, `word-igloo.mp3`, `word-ox.mp3`, `word-octopus.mp3`, `word-orange.mp3`, `word-umbrella.mp3`, `word-up.mp3`, `word-under.mp3`, `sound-i.mp3`, `sound-o.mp3`, `sound-u.mp3`, `name-i.mp3`, `name-o.mp3`, `name-u.mp3`.
2. Put them in `assets/audio/`, set `USE_FILES=true` at the top of `script.js`, and add the files to the list in `service-worker.js` for offline use.

## Notes
Progress is saved in `localStorage` on the device only. Controls: touch, mouse, keyboard / TV remote (arrow keys, Enter, Esc = Home).
