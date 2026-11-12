# Deep Dive 02 — Neural Networks

The Part 02 preview is developed chapter by chapter. The player renders a fixed 16:9 film canvas and uses the active narration clip's `audio.currentTime` as its animation clock. Review transcript text stays outside the film frame.

## Project status

Chapters 1–4 are implemented and available on the preview page. Chapter 4 reuses the exact RGB pixel patch, neuron, network paths, and adjustable weights from Chapter 3 to explain labelled examples, prediction versus supplied answer, task loss, backpropagation, gradients, small optimizer updates, repeated training, held-out checks, and task-specific targets. Chapter 5 is not implemented yet. Background music has not been produced, and final MP4 rendering remains on hold until the user finishes page QA.

Run `npm run dev -- --host 0.0.0.0` from the repository root to preview locally. `npm run build` builds both Part 01 and Part 02. The chapter rail currently supports Chapters 1–4; Chapter 5 remains a placeholder until its scene and audio are ready.

## Current visual QA updates

- Chapter 1's 1943 schematic and 1958 Smithsonian photograph enter as gently flexing, textured paper overlays, rather than rigid cards. The historical diagram is identified as a modern schematic, not a reproduced archival page. The Smithsonian photo credit remains visible.
- The retained grey swatch passed from Chapter 1 into Chapter 2 is larger, with a more legible `RGB INPUT` label.
- Chapter 3's layer-to-layer network paths are split into dedicated SVG paths so signal particles follow the intended routes reliably. The particles remain driven by the narration clock.
- Chapter 4's 4:59 narration clip decodes cleanly. Its sampled preview cues reuse the same patch and connected network; answer labels remain separate from RGB inputs, amber particles trace backpropagation, and an optimizer update visibly raises the illustrative LIGHT probability from 20% to 31% while reducing the loss meter.
- Representative film-frame scans check directly visible text against the 16:9 stage bounds and for clipped text. Phone-specific fullscreen and full MP4 review remain outstanding.

## Chapter 1 QA status

The 59.58-second scene has passed browser preview, deterministic seeking, audio-clock play/pause, and desktop fullscreen checks. It carries the same central neuron and terminal `0.8` signal into Chapter 2. Representative historical-overlay and transition cues were reviewed. A sampled visible-text bounds scan found no out-of-frame or clipped text. Phone-specific fullscreen review remains pending. See `chapter-01-scene-manifest.yaml`.

## Chapter 2 QA status

The 2:54 one-neuron scene reuses the exact Chapter 1 neuron and grey swatch; RGB values flow through normalization, weights, bias, sigmoid, and the light/dark comparison before the same neuron expands into the Chapter 3 network handoff. The incoming swatch and its label were enlarged in this review. Its separate narration clip decodes cleanly; representative cue frames, chapter switching, and deterministic seeking were reviewed. Phone-specific fullscreen review remains pending. See `chapter-02-scene-manifest.yaml`.

## Chapter 3 QA status

The 2:21 layers scene continues the exact Chapter 2 3×3 pixel patch, neuron, and connected nodes. It shows 27 RGB inputs, layer-to-layer signal flow, a clearly labelled toy stripe/plain task, and a phrase-timed transition from a simple straight split to a flexible curved boundary. The narration clip decodes cleanly; representative cue frames, deterministic seeking, chapter switching, desktop fullscreen, and network-object continuity were reviewed. Layer signal particles now use dedicated paths. Phone-specific fullscreen review remains pending. See `chapter-03-scene-manifest.yaml`.

## Chapter 4 QA status

The 4:59 training scene preserves the Chapter 3 network and RGB patch. Sampled browser frames reviewed labelled examples, initial weights and forward input, the 20%/80% first guess versus separate LIGHT target, task loss, backward amber signal flow, gradients, the 20%→31% illustrative small update, the training loop/batches, held-out check, and class/number/word-sequence targets. Audio decode and production build pass. The preview remains in iterative review; full cue-by-cue overflow scan, desktop/mobile fullscreen and MP4 export remain pending. See `chapter-04-scene-manifest.yaml`.
