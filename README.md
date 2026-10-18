# From Prompt to Action — Video Preview

A section-by-section, audio-synchronized 16:9 motion-design film preview. The current cut contains Sections 01–02: the Taipei request enters an assistant, then the text is broken into illustrative tokens and numeric IDs.

## Preview

The page is intentionally limited to the 16:9 video frame and basic play/seek controls. Text and animation inside the frame are the film content; there is no separate title card or website introduction. The Three.js canvas renders at **1920×1080** and **24 fps**, while the responsive page scales the frame for the browser window.

Published preview: https://ckfun0skf.github.io/superintelligence-vd-ai-explainer/

## Run locally

```bash
npm install
npm run dev
```

Use the player below the frame to play, pause, or seek. Animation timing is driven by the audio clock, so seeking reconstructs the same scene state.

## Build

```bash
npm run build
npm run preview
```

GitHub Actions builds and publishes the production `dist/` output to GitHub Pages when `main` changes.

## Current cut

- Section 01 — Start with one question
- Section 02 — First, the words become tokens
- Runtime: approximately 55.6 seconds
- Frame: 1920×1080, 16:9, 24 fps
- Audio: approved warm, measured English narration with the restrained cyber/space score ducked beneath speech
- Token split and token IDs are labeled illustrative; actual boundaries and IDs depend on the tokenizer

This is a review preview, not the final MP4 render.
