# From Prompt to Action — Video Preview

A section-by-section, audio-synchronized 16:9 motion-design film preview. The current cut follows an AI request from a chat interface through tokenization, contextual relationships, attention, intent inference, LLM generation, and the tools an AI product makes available.

## Preview

Published preview: https://ckfun0skf.github.io/superintelligence-vd-ai-explainer/

The film frame itself has no title cards or review subtitles. The synchronized English review caption sits below the 16:9 frame, outside the film composition; the page otherwise keeps only the frame and basic play/seek/fullscreen controls. The Three.js canvas renders one **1920×1080** master at **24 fps**. On phones, the exact same composition is scaled as a whole to fit the available space: there is no phone-specific reflow or in-frame font enlargement. Use the fullscreen button for an immersive preview; rotate to landscape to see the 16:9 frame at its largest size.

Section 01 types the request into the compact composer at the bottom of an assistant interface, sends it into a user bubble, shows an AI loading state, and reveals a nature-first Taipei itinerary. Section 02 enlarges the submitted bubble and keeps its original sentence visible while separate, larger and more widely spaced word copies emerge below it. Once all copies have arrived, the bubble fades away; selected tokens then travel into **WHOLE WORD**, **WORD PIECES**, and **PUNCTUATION**, with illustrative numeric-ID cells expanding below selected tokens. Section 03 reconnects the prompt pieces to duration, location, budget, and preference cards, animates an attention focus across those relationships, then uses “Find me a quite place near Taipei” to show how context can suggest “quiet place” as a likely reading without guaranteeing it. Section 04 turns the same prompt into a stream of possible next tokens, selects and appends an example token at a time, feeds the original prompt plus generated text back into the next step, visualizes reuse of earlier computation, and distinguishes learned generation from live data or service access. Section 05 uses icons and a clear application boundary to show that product builders define which tools are available; it animates map/search/calendar/booking capabilities, explains a map tool's purpose, inputs and returned results, and shows a booking action paused behind an approval gate.

## Run locally

```bash
npm install
npm run dev
```

Use the player below the frame to play, pause, seek, or enter fullscreen (`F` also toggles fullscreen on a keyboard). Animation timing is driven by the audio clock, so seeking reconstructs the same scene state. On a phone, fullscreen requests landscape orientation where supported; otherwise rotate the device manually for the largest 16:9 preview.

## Build

```bash
npm run build
npm run preview
```

GitHub Actions builds and publishes the production `dist/` output to GitHub Pages when `main` changes.

## Audio preview

The current five-section mix is `public/audio/section-01-05-preview-mix.mp3` (stereo, 44.1 kHz, 192 kbps; approximately **3 minutes 48 seconds**). It retains the approved narration for Sections 01–04, the approved Charon voice style, and the same cyber/space score with voice-forward sidechain ducking. Section 05 narration is approximately 49 seconds; the master also includes the 1.2-second music-led opening and 1.5-second chapter pauses.

To rebuild the mix, provide the original approved audio source directory and the generated Section 05 WAV:

```bash
AUDIO_SOURCE=/path/to/ai-explainer-audio \
VOICE5_SOURCE=/path/to/section-05-tools-origin.wav \
./scripts/build-preview-audio.sh
```

## Current cut

- Section 01 — The assistant receives and answers a request
- Section 02 — The words become illustrative tokens
- Section 03 — Context, attention, and intent inference from imperfect text
- Section 04 — LLMs predict and append likely next tokens
- Section 05 — Where tools come from: what product builders expose, define, and permission
- Runtime: approximately **3 minutes 48 seconds**
- Frame: **1920×1080**, 16:9, 24 fps
- Audio: English narration with the restrained cyber/space score ducked beneath speech
- Token boundaries and numeric IDs are illustrative; actual boundaries and IDs depend on the tokenizer

This is a review preview, not the final MP4 render. Scene states are derived from absolute audio time, so seeking reconstructs token movement and the Section 3→4→5 handoffs rather than advancing an independent animation clock.
