# From Prompt to Action — Video Preview

A section-by-section, audio-synchronized 16:9 motion-design film preview. The current cut follows an AI request from a chat interface through tokenization, contextual relationships, attention, typo inference, and LLM next-token generation.

## Preview

Published preview: https://ckfun0skf.github.io/superintelligence-vd-ai-explainer/

The film frame itself has no title card or review subtitles. For review, the synchronized English caption sits below the 16:9 frame, outside the film composition; the page otherwise keeps only the frame and basic play/seek controls. The Three.js canvas renders at **1920×1080** and **24 fps**. In the browser, the frame fits both the available viewport width and height while preserving 16:9; all in-frame text, spacing, borders, and animation geometry scale with it as one composition. Review captions and player controls remain outside the film frame and keep usable sizing on small screens.

Section 01 types the request into the compact composer at the bottom of an assistant interface, sends it into a message bubble, shows an AI loading state, and reveals a nature-first Taipei itinerary. Section 02 enlarges the submitted bubble and keeps its original sentence visible while separate, larger and more widely spaced word copies emerge below it. Once all copies have arrived, the bubble fades away; selected tokens then travel into **WHOLE WORD**, **WORD PIECES**, and **PUNCTUATION**, with illustrative numeric-ID cells expanding below selected tokens. Section 03 reconnects the prompt pieces to duration, location, budget, and preference cards, animates an attention focus across those relationships, then uses “Find me a quite place near Taipei” to show how context can suggest “quiet place” as a likely reading without guaranteeing it. Section 04 turns the same prompt into a stream of possible next tokens, selects and appends an example token at a time, feeds the original prompt plus generated text back into the next step, visualizes reuse of earlier computation, and distinguishes learned generation from live data or service access.

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

## Audio preview

The current preview mix is `public/audio/section-01-04-preview-mix.mp3` (stereo, 44.1 kHz, 192 kbps). It retains the approved narration voice, a 1.2-second music-led opening, a 1.5-second chapter pause, and the cyber/space score ducked beneath speech. To rebuild it when the approved source WAVs and BGM are available, run `AUDIO_SOURCE=/path/to/ai-explainer-audio ./scripts/build-preview-audio.sh`.

## Current cut

- Section 01 — The assistant receives and answers a request
- Section 02 — The words become illustrative tokens
- Section 03 — Context, attention, and intent inference from imperfect text
- Section 04 — LLMs predict and append likely next tokens
- Runtime: approximately **2 minutes 57 seconds**
- Frame: **1920×1080**, 16:9, 24 fps
- Audio: approved warm, measured English narration with the restrained cyber/space score ducked beneath speech
- Token boundaries and numeric IDs are illustrative; actual boundaries and IDs depend on the tokenizer

This is a review preview, not the final MP4 render. Scene states are derived from absolute audio time, so seeking reconstructs token movement and the Section 3→4 handoff rather than advancing an independent animation clock.
