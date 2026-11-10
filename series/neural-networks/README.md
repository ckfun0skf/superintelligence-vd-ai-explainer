# Deep Dive 02 — Neural Networks

The Part 02 preview is developed chapter by chapter. The current player route is `/series/neural-networks/`; it renders a fixed 16:9 film canvas and uses the approved narration as its only animation clock. Review transcript text stays outside the film frame.

## Chapter 1

- Source narration master: `audio/narration/part02-neural-networks-narration.wav`
- Browser listening segment: `../../public/series/neural-networks/audio/chapter-01.mp3`
- Scene timing source: `audio/narration/part02-narration-timing.json`
- Scene manifest: `chapter-01-scene-manifest.yaml`
- Preview source: `index.html`, `src/main.js`, and `style.css`
- Historical reference and attribution: `references/README.md`

Run `npm run dev -- --host 0.0.0.0` from the repository root to preview locally. `npm run build` builds both Part 01 and Part 02. Chapters 1 and 2 are enabled in the chapter rail; Chapters 3–5 remain locked until they are implemented and reviewed.

Current scope: Chapters 1 and 2 are implemented and available for user review. Background music and Chapters 3–5 have not been generated. The final MP4 remains on hold until the user completes page QA.

## Chapter 1 QA status

The first 59-second scene has passed browser preview, deterministic seeking, audio-clock play/pause, and fullscreen checks. The final `0.8` signal moves from the connected network's terminal node into the same central neuron object used for the Chapter 2 handoff. Its voice clip was checked for complete final wording and clean decode. Fine-grained sentence-by-sentence timing and phone-specific fullscreen review remain pending.

## Chapter 2 QA status

The 2:54 one-neuron scene is available in the same 16:9 player. It reuses the exact Chapter 1 neuron and gray swatch; the RGB values flow through normalization, weights, bias, sigmoid, and the light/dark comparison before the same neuron expands into the Chapter 3 network handoff. The separate narration clip decodes cleanly and its opening/closing wording was checked against transcription. Representative cue frames, chapter switching, and deterministic seeking were reviewed in the local browser. Fullscreen on a phone and final MP4 rendering remain pending. See `chapter-02-scene-manifest.yaml` for the cue map and guardrails.
