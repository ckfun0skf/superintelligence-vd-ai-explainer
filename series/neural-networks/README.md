# Deep Dive 02 — Neural Networks

The Part 02 preview is developed chapter by chapter. The current player route is `/series/neural-networks/`; it renders a fixed 16:9 film canvas and uses the approved narration as its only animation clock. Review transcript text stays outside the film frame.

## Chapter 1

- Source narration master: `audio/narration/part02-neural-networks-narration.wav`
- Browser listening segment: `../../public/series/neural-networks/audio/chapter-01.mp3`
- Scene timing source: `audio/narration/part02-narration-timing.json`
- Scene manifest: `chapter-01-scene-manifest.yaml`
- Preview source: `index.html`, `src/main.js`, and `style.css`
- Historical reference and attribution: `references/README.md`

Run `npm run dev -- --host 0.0.0.0` from the repository root to preview locally. `npm run build` builds both Part 01 and Part 02. Only Chapter 1 is enabled in the chapter rail until the later chapters are implemented and reviewed.

Current scope: Chapter 1 animation and page QA only. Background music and later chapter visuals have not been generated. The final MP4 remains on hold until the user completes page QA.

## Chapter 1 QA status

The first 59-second scene has passed browser preview, deterministic seeking, audio-clock play/pause, and fullscreen checks. Fullscreen keeps the film at 16:9, hides the review transcript, and auto-hides the single-line chapter/control rails after a short delay. The final `0.8` signal moves from the connected network's terminal node into the same central neuron object used for the Chapter 2 handoff. Fine-grained sentence-by-sentence timing and phone-specific fullscreen review remain pending. Only Chapter 1 is enabled in the player rail; later chapters will be opened after implementation and review.
