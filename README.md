# From Prompt to Action — Video Preview

A section-by-section, audio-synchronized 16:9 motion-design film preview. The current cut follows an AI request from a chat interface through tokenization, context, attention, intent inference, next-token generation, and tool use.

## Preview

Published preview: https://ckfun0skf.github.io/superintelligence-vd-ai-explainer/

The film frame itself has no title cards or review subtitles. The synchronized English review caption sits below the 16:9 frame, outside the film composition; the page keeps only the frame and basic play/seek/fullscreen controls. The Three.js canvas renders one **1920×1080** master at **24 fps**. On phones, the exact same composition scales proportionally as a whole—there is no phone-specific reflow or in-frame font enlargement. Use the fullscreen button for an immersive preview; rotate to landscape for the largest 16:9 view.

Section 01 types the request into a compact assistant composer, sends it into a user bubble, shows an AI loading state, and reveals a nature-first Taipei itinerary. Section 02 enlarges the submitted bubble and keeps its original sentence visible while word copies emerge below; selected tokens travel into **WHOLE WORD**, **WORD PIECES**, and **PUNCTUATION**, with illustrative numeric-ID cells. Section 03 reconnects prompt pieces to duration, location, budget, and preference, visualizes attention, and shows how surrounding context can suggest “quiet place” when the user types “quite place.” Section 04 illustrates an LLM as a neural network that predicts and appends likely next tokens, incorporates its generated text back into context, and distinguishes learned patterns from live data. Section 05 shows that product builders expose and define tools such as map, search, calendar, and booking, including a human-approval gate. Section 06 uses icons and moving signal paths to show how the model matches the task to an available tool, emits a structured route request, and hands it to the application/orchestrator; a separate map service returns a result, which enters the conversation context before the model continues. It closes on possible tool-selection errors, incomplete results, and permission for consequential actions.

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

The current six-section mix is `public/audio/section-01-06-preview-mix.mp3` (stereo, 44.1 kHz, 192 kbps; approximately **5 minutes 5 seconds**). It retains the previously approved narration for Sections 01–05 and the approved Charon-style narration for Section 06, with the same cyber/space score and voice-forward sidechain ducking. The master includes the 1.2-second music-led opening and 1.5-second chapter pauses; Section 06 narration is 75.84 seconds.

To rebuild the mix, provide the original approved audio directory and generated Section 05/06 WAV files:

```bash
AUDIO_SOURCE=/path/to/ai-explainer-audio \
VOICE5_SOURCE=/path/to/section-05-tools-origin.wav \
VOICE6_SOURCE=/path/to/section-06-tool-use.wav \
./scripts/build-preview-audio.sh
```

## Current cut

- Section 01 — The assistant receives and answers a request
- Section 02 — The words become illustrative tokens
- Section 03 — Context, attention, and intent inference from imperfect text
- Section 04 — LLMs predict and append likely next tokens
- Section 05 — Where tools come from: what product builders expose, define, and permission
- Section 06 — How a model chooses a tool, the application executes it, and the result returns to context
- Runtime: approximately **5 minutes 5 seconds**
- Frame: **1920×1080**, 16:9, 24 fps
- Audio: English narration with the restrained cyber/space score ducked beneath speech
- Token boundaries and numeric IDs are illustrative; actual boundaries and IDs depend on the tokenizer

This is a review preview, not the final MP4 render. Scene states derive from absolute audio time, so direct and reverse seeking reconstruct the same frames and transitions.
