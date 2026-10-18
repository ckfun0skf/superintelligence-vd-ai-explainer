# From Prompt to Action — AI Explainer

A section-by-section Three.js motion-design preview. The first review build contains **Section 01 only**: the opening AI-assistant UI, the Taipei prompt, a draft itinerary card, and a brief cue toward tools.

## Run the preview

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use the player beneath the 9:16 preview frame to play, pause, seek, or change playback speed. The animation is driven by the preview audio clock, so seeking reconstructs the visual state at that time.

## Build static files

```bash
npm run build
npm run preview
```

The static build is written to `dist/`. GitHub Pages is not enabled yet; this repository is the source of truth while the opening section is being reviewed.

## Current section

- **Section 01 — Start with one question**
- Duration: approximately 24.45 seconds
- Frame design: portrait composition, 24 fps timeline basis (final delivery aspect ratio remains adjustable)
- Audio: approved opening narration take plus restrained cyber/space score; music leads the first 1.5 seconds and is ducked under speech

The narration take used in this section matches the first section of the current script. Later sections will be added only after this visual direction is reviewed.
