# Part 01 — Transformer & Attention

Standalone deep-dive preview for **How Transformers Work: Self-Attention, Q/K/V & Context**.

- Preview route: `/series/transformer-attention/`
- Format: fixed 16:9 film composition, designed for 1920×1080 at 24 fps.
- Status: the eight-scene deterministic visual prototype is implemented and locally browser-checked. The Charon narration requests failed twice at the speech-generation service, so no audio files exist yet. The player currently uses its clearly labeled visual-only preview clock; chapter timing is provisional.
- Scope: context window and coreference; token embeddings and position; self-attention; Query/Key/Value; multi-head attention; Transformer blocks; causal masking and next-token generation; recap.

## Local preview

From the repository root:

```bash
npm install
npm run dev
```

Then open `/series/transformer-attention/`. The chapter rail and preview-only play/pause controls work while narration is unavailable. Once the narration WAVs exist, the builder below creates the audio master at the path expected by the page.

## Narration assembly

The intended voice is Charon, in English, with a warm, clear, measured delivery. Generate the approved script in two WAV parts, then run:

```bash
./scripts/build-transformer-narration.sh
```

The output is `public/series/transformer-attention/audio/voiceover.mp3`. After audio is available, verify the actual runtime, retime chapter boundaries and review-caption/transcript synchronization, check full playback, then export the 1920×1080 MP4. Do not treat the current 535-second timing estimate as final.

## Deterministic animation

Every scene is derived from the absolute timeline through `window.renderAt(seconds)`; `window.renderFrame(frame)` is available for frame-indexed export. The animation is not a realtime screen recording. Illustrative attention weights and head patterns are teaching diagrams, not measurements from a production model.
