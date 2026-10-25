# Part 01 — Transformer & Attention

Standalone deep-dive preview for **How Transformers Work: Self-Attention, Q/K/V & Context**.

- Preview route: `/series/transformer-attention/`
- Format: fixed 16:9 film composition, designed for 1920×1080 at 24 fps.
- Status: eight-scene deterministic preview and English Charon narration are available. The 8-chapter MP3 master is about **7:00.5**; chapter seeking follows generated WAV timings with short 0.8-second inter-chapter gaps. Full-length browser playback QA and MP4 export remain pending.
- Scope: context window and coreference; token embeddings and position; self-attention; Query/Key/Value; multi-head attention; Transformer blocks; causal masking and next-token generation; recap.

## Local preview

From the repository root:

```bash
npm install
npm run dev
```

Then open `/series/transformer-attention/`. Use the chapter rail, play/pause, seek, playback speed, and fullscreen controls. The English review transcript appears below the film frame.

## Narration assembly

The approved narration uses the established **Charon** voice with a warm, clear, measured delivery. Eight chapter WAVs are kept as source assets. To rebuild the MP3 master and chapter timing metadata:

```bash
./scripts/build-transformer-narration.sh
```

This writes `public/series/transformer-attention/audio/voiceover.mp3` and `chapter-timing.json`. Chapter boundaries are generated from each WAV's measured duration; the browser reads the timing file so chapter buttons seek to the spoken section rather than an estimated proportional timeline. The MP3 is 48 kHz stereo and currently measures 420.504 seconds including a small encoder/container tail.

Next, listen through chapter joins for voice continuity and pacing, complete full-length audio/playback and transcript-synchronization QA, then export the final 1920×1080 MP4. Do not use the original 535-second estimate as the final duration.

## Deterministic animation

Every scene is derived from the absolute timeline through `window.renderAt(seconds)`; `window.renderFrame(frame)` is available for frame-indexed export. With narration loaded, `audio.currentTime` is the master clock. The animation is not a realtime screen recording. Illustrative attention weights and head patterns are teaching diagrams, not measurements from a production model.
