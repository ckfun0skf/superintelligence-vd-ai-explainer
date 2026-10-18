# From Prompt to Action — Video Preview

A section-by-section, audio-synchronized 16:9 motion-design film preview. The current cut covers the Taipei request entering an assistant, the assistant returning a nature-first itinerary, and the prompt breaking into illustrative token pieces.

## Preview

Published preview: https://ckfun0skf.github.io/superintelligence-vd-ai-explainer/

The film frame itself contains no title card or review subtitles. For review, the synchronized English caption is shown below the 16:9 frame; it is outside the film composition. The preview page otherwise keeps only the frame and basic play/seek controls. The Three.js canvas renders at **1920×1080** and **24 fps**, while the responsive page scales it for the browser window.

Section 01 now types the request into a composer at the bottom of the assistant, sends it into a message bubble, shows an AI loading state, then reveals the answer title and two itinerary cards. Section 02 carries that same prompt into a centered zoom, breaks it into individually framed word pieces, then animates selected examples into **WHOLE WORD**, **WORD PIECES**, and **PUNCTUATION** groups. Small particles and curved token flights are tied to the audio timeline.

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
- Token split and token IDs are illustrative; actual boundaries and IDs depend on the tokenizer

This is a review preview, not the final MP4 render.
