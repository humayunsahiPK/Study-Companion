# Study Companion Chrome Extension

Records live lecture audio from a browser tab and uploads it to the
Study Companion backend for transcription and flashcard generation.

## How to load it (unpacked, for development/testing)

1. Open Chrome, go to `chrome://extensions`
2. Turn on **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this `extension` folder
5. The Study Companion icon should appear in your toolbar

## How to use it

1. Click the extension icon
2. Sign in with the same account you use on the web app
3. Navigate to a tab playing lecture audio (e.g. a Zoom call, a YouTube video)
4. Click the extension icon again, click **Record**
5. When done, click **Stop recording** - it uploads automatically
6. Check the web app's Dashboard/Library - the lecture should appear as
   "Transcribing," then flip to "Ready" once Whisper + Gemini finish
   (same background pipeline as uploading a file through the web app)

## Architecture note (the actual "hard part")

Manifest V3 service workers (`background.js`) are killed after ~30
seconds of inactivity and cannot hold a live audio recording session.
This extension uses Chrome's recommended workaround: an **offscreen
document** (`offscreen.html`/`offscreen.js`) - a hidden page that isn't
subject to the service worker's lifecycle limits, and can hold a real
`MediaRecorder` session for as long as the tab is being recorded.

Flow: `popup.js` (UI) -> `background.js` (service worker, gets the
tab's audio stream ID via `chrome.tabCapture`, creates the offscreen
document) -> `offscreen.js` (does the actual recording and, on stop,
uploads directly to the backend).

## What's genuinely tested vs. not

**Not tested in a real browser yet** - this was built without access to
a live Chrome instance to load and click through. Before relying on
this, you need to:

1. **Load it as described above and manually test the full flow** -
   record a real tab with audio playing, confirm the upload succeeds,
   confirm a real lecture appears in your web app afterward.
2. **Check `chrome://extensions` for errors** after loading - Manifest
   V3 permission/API mistakes usually show up immediately as red error
   text under the extension's card.
3. **Verify `chrome.tabCapture.getMediaStreamId` behavior** - some Chrome
   versions/tab types (e.g. `chrome://` pages, some Google-owned sites)
   block tab capture entirely; this needs testing against a real lecture
   source (Zoom, YouTube, etc.) to confirm it actually captures audio.
4. **CORS**: the backend's `CORS_ORIGINS` in `.env` currently doesn't
   include an extension origin (`chrome-extension://<id>`) - if you hit
   CORS errors specifically from the extension (not the web app), you'll
   need to add your extension's actual ID to `CORS_ORIGINS` once you
   know it (visible in `chrome://extensions` after loading).

## Before deploying / submitting

- Replace `http://localhost:8000` in `popup.js` and `offscreen.js` with
  your real deployed Render backend URL.
- Update `manifest.json`'s `host_permissions` to match that same URL.
- Replace the placeholder icons in `icons/` with real ones if you want
  something other than a plain circle.
- Package for submission: `chrome://extensions` -> **Pack extension** ->
  select this folder -> produces a `.zip`/`.crx` you can submit per your
  spec's requirement for "a .zip file of your unpacked Chrome Extension."
