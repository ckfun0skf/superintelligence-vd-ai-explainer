# From Prompt to Action — Video Preview

A section-by-section, audio-synchronized 16:9 motion-design film preview. The current cut follows an AI request from an assistant interface through tokenization, context, attention, next-token generation, tool access, model training, and why answers can vary—and ends by asking what people should verify before acting on an AI answer.

## Preview

Published preview: https://ckfun0skf.github.io/superintelligence-vd-ai-explainer/

Standalone deep-dive preview — **How Transformers Work: Self-Attention, Q/K/V & Context**: https://ckfun0skf.github.io/superintelligence-vd-ai-explainer/series/transformer-attention/ (eight-scene visual prototype; Charon narration generation is pending).

The film frame has no title cards or review subtitles. Synchronized English review captions sit below the frame, outside the film composition. The Three.js canvas renders one **1920×1080** master at **24 fps**; phones show that same composition proportionally, with no device-specific film typography or layout. The player offers play/seek, an eight-section jump rail, and fullscreen. In fullscreen, the chapter rail and playback controls overlay the picture, appear on entry or a screen tap, and fade after three seconds; tapping again toggles them. The player requests landscape orientation where supported and keeps the 16:9 frame fitted to the available display.

- **01 — The assistant:** Type the Taipei request in a compact chat composer, send it, show an AI loading state, then reveal a nature-first itinerary beside a clearly legible route-map card.
- **02 — Tokens:** Keep the submitted sentence visible as word copies emerge and travel into whole-word, word-piece, and punctuation groups, with illustrative numeric IDs.
- **03 — Context & attention:** Connect prompt pieces to duration, location, budget, and preference; visualize attention, show how context can suggest “quiet place” from “quite place,” then present likely/uncertain interpretations and an assistant clarification UI.
- **04 — LLM generation:** Show an LLM as a layered neural network predicting and appending likely next tokens while its working context grows; live map and calendar mini-apps illustrate external, current services.
- **05 — Where tools come from:** Show product builders defining available map, search, calendar, and booking tools, including a human-approval gate.
- **06 — Tool use:** Animate task-to-tool matching, a structured route request, application/orchestrator execution, a route drawing inside the external map-service UI, the result returning to context, and realistic tool/permission risks.
- **07 — How models learn:** Use larger labels for the Taipei next-token mismatch, compare guess/target on an illustrative budget scale, send directional error feedback into parameters and back to the model, then show correction, preference feedback, map-tool tuning, and three icon-led failure modes.
- **08 — Why answers vary:** Use larger text for two plausible Taipei itinerary branches from the same visible prompt, with distinct route traces and recognizable context-source icons. Animate reproducibility, comparison, and trust rather than placing them in a warning box; distinguish consistency from accuracy, then close with the flowing “Prompt → Model → Verify → You decide” summary and a reflective question.

Section 07 review script and visual cues: [`docs/section-07-script-review.md`](docs/section-07-script-review.md).
Section 08 review script and visual cues: [`docs/section-08-script-review.md`](docs/section-08-script-review.md).
Full-film visual review and motion additions: [`docs/full-film-visual-audit.md`](docs/full-film-visual-audit.md).

## Run locally

```bash
npm install
npm run dev
```

Use the controls below the frame to play, pause, seek, enter fullscreen (`F` toggles fullscreen on a keyboard), or jump to any section. Chapter jumps seek the synchronized audio master. On a phone, fullscreen requests landscape orientation where supported; otherwise rotate the device manually for the largest 16:9 preview. The film master is deliberately identical across devices and cannot be enlarged independently on mobile without changing the final video composition.

## Build

```bash
npm run build
npm run preview
```

GitHub Actions builds and publishes the production `dist/` output to GitHub Pages when `main` changes.

## Final MP4 export

The offline renderer calls the same absolute-time `window.renderFrame(frame)` function as the preview, captures only the 1920×1080 film stage as JPEG frames, streams them directly into FFmpeg for H.264/yuv420p encoding at 24 fps, then muxes the approved narration/music mix as AAC. It does not record realtime browser playback: every frame is independently reconstructed from its absolute frame index, and preview controls/captions are excluded from the film crop.

Requirements: Node/npm project dependencies, FFmpeg/ffprobe, system Chromium, and Python Playwright (`python3 -m pip install -r scripts/requirements-render.txt`). From the project root:

```bash
npm run dev -- --host 127.0.0.1 --port 4176
python3 scripts/render-final-mp4.py --preset ultrafast --crf 17
```

The default output is `renders/from-prompt-to-action-final-1080p-24fps.mp4` (ignored by Git). The approved export uses H.264 High/yuv420p at 24 fps, CRF 17 (`ultrafast` preset), plus the narration/music mix encoded as AAC stereo 44.1 kHz/256 kbps. Set `CHROMIUM_BIN` if Chromium is installed at a non-standard path. The renderer verifies stage/canvas dimensions and identical repeated frames before starting the full export. The final 466.76-second, 1920×1080 MP4 has been rendered and fully decoded; see `docs/project-manifest.yaml` for QA details.

## Audio preview

The eight-section mix is `public/audio/section-01-08-preview-mix.mp3` (stereo, 44.1 kHz, 192 kbps; 466.808-second encoded file, approximately **7 minutes 47 seconds**). The deterministic film scene timeline ends at 466.726 seconds; the small tail difference is normal MP3/container padding. The mix retains the earlier narration, adds the Section 05–08 narration WAVs and the 18.92-second Charon outro, and uses the same restrained cyber/space score with voice-forward sidechain ducking. The master includes the 1.2-second music-led opening and 1.5-second chapter pauses. Section 06 narration is 75.84 seconds; Section 07 is 65.32 seconds; Section 08 comprises 74.28 seconds of explanation plus the 18.92-second outro.

To rebuild the eight-section mix, provide the original approved audio directory and the generated Section 05–08 WAV files, including the closing outro:

```bash
AUDIO_SOURCE=/path/to/ai-explainer-audio \
VOICE5_SOURCE=/path/to/section-05-tools-origin.wav \
VOICE6_SOURCE=/path/to/section-06-tool-use.wav \
VOICE7_SOURCE=/path/to/section-07-training.wav \
VOICE8_SOURCE=/path/to/section-08-consistency.wav \
VOICE8_OUTRO_SOURCE=/path/to/section-08-outro.wav \
./scripts/build-preview-audio-08.sh
```

## Current cut

- Section 01 — The assistant receives and answers a request
- Section 02 — Words become illustrative tokens
- Section 03 — Context, attention, and intent inference from imperfect text
- Section 04 — LLMs predict and append likely next tokens
- Section 05 — Where tools come from: builders define capabilities and permissions
- Section 06 — A model requests a tool, the application executes it, and the result returns to context
- Section 07 — How training adjusts model parameters and how post-training shapes behavior, with visualized failure modes
- Section 08 — Why the same prompt can produce different answers, what that affects, how to verify results, and who is responsible for the decision
- Runtime: approximately **7 minutes 47 seconds**
- Frame: **1920×1080**, 16:9, 24 fps
- Audio: English narration with the restrained cyber/space score ducked beneath speech
- Token boundaries, IDs, and the Taipei nature-weekend “five” versus “eight” training example are illustrative; real tokenizer boundaries and training procedures vary

The hosted page remains the review preview; the finished MP4 is rendered with the export command above. Scene states derive from absolute audio time, so direct and reverse seeking reconstruct the same frames and transitions. The Section 08 Taipei route branches and token choices are illustrative; a repeatable response is not automatically a correct one. Its new ending leaves a reflective question in the visual composition while keeping the final judgment with people.
