# Full-film visual review

**Scope:** Eight-section, English-narrated, 1920×1080 / 16:9 motion-design preview. The film frame remains free of review subtitles and title cards; captions stay outside the stage. This pass focused on whether each visual action makes the narration easier to understand, not on adding motion for its own sake.

## Chapter-by-chapter review

| Section | What already reads clearly | Review decision |
| --- | --- | --- |
| 01 — The assistant | The prompt is typed into the bottom composer, sent into the chat, followed by a loading state and Taipei itinerary. | Keep the chat UI uncluttered. Added a small map-route trace beside the assistant’s itinerary heading so the answer feels like a travel-planning app, without enlarging the card or adding explanatory copy. |
| 02 — Tokens | The original message remains the source; word copies leave it and enter whole-word, word-piece, and punctuation groups. | The source-to-token movement already supplies a strong cause-and-effect animation. Do not add another token dashboard or in-frame labels. |
| 03 — Context & attention | Prompt details connect to duration, place, budget, and preference; the attention focus and “quite” → likely “quiet” cue make context use tangible. | Retain the current relation paths and uncertainty/clarification cues. Additional panels would compete with the focus traversal. |
| 04 — LLM generation | The layered network, candidate next tokens, growing response, and returned context explain repeated token generation. | Keep the current token/context loop as the main visual metaphor; avoid adding a second probability or architecture overlay. |
| 05 — Where tools come from | Product-builder boundary, available-tool cards, the map tool contract, and the approval gate distinguish model from external software and permissions. | The icon-led product interface already does the explanatory work. Preserve it without another app window. |
| 06 — Tool use | A task is matched to an available map tool, structured into a route request, checked by an orchestrator, executed externally, and returned to context. | Added a compact road-map UI inside the existing MAP SERVICE card. During the loading beat, a route line draws across the map and a signal marker travels along it before the result card appears. |
| 07 — How models learn | The Taipei/$8,000 “five” vs “eight” mismatch, parameter adjustment, and corrected prediction give training a concrete example. | Strengthened the feedback loop: orange directional arrow-particles travel from comparison toward adjustable parameters and back to the model; parameter dials glow in step with the adjustment. The example and shared example slot remain unchanged. |
| 08 — Why answers vary | One visible prompt feeds alternative next-stop candidates and two constraint-preserving itineraries; the close distinguishes consistency from accuracy. | Revealed the two route choices in sequence—Day 01 first, Day 02 second—inside the existing branch cards. This connects token selection to different completed outputs without adding another card. |

## Motion and composition principles

The added route traces, feedback arrows, and branch tokens are all functions of the absolute narration/audio time. Seeking forward, backward, or repeatedly to the same timestamp therefore reconstructs the same visual state; the new effects do not depend on accumulated animation state. Existing Three.js particles and network pulses remain the ambient motion layer, while explanatory cards continue to dominate the composition.

No visual assets, new narration, or audio edits were needed. The single Taipei nature-weekend example remains consistent across the explainer. No new labels were added as subtitles or title cards inside the frame.

## Local verification

- Vite production build passed; `git diff --check` passed.
- Chromium confirmed the 1920×1080 canvas and eight chapter controls; the loaded preview audio duration was approximately 447.82 seconds.
- Representative samples across all eight sections were sought in Chromium. Repeated rendering at the same sampled timestamps returned identical route paths, feedback states, and branch-token transforms.
- At 273 seconds, the map route was mid-draw; by 281 seconds, the route was complete and the MAP SERVICE and result cards did not overlap.
- At 327 seconds, the prediction remained “five” against target “eight”; both orange feedback paths and direction-oriented arrow particles were visible. The renderer returned identical arrow transforms on a repeated 327-second seek.
- At 397.5 seconds, both Taipei itinerary branches were complete, legible, and spatially separate; all four route tokens had reached their final visible state.
- No JavaScript errors, failed resources, or media-load failures were detected during this pass.

This is still a browser preview and source-project update, not a rendered final MP4.
