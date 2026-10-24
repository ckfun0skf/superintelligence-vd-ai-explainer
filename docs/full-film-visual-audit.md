# Full-film visual review

**Scope:** Eight-section, English-narrated, 1920×1080 / 16:9 motion-design preview. The film frame remains free of review subtitles and title cards; captions stay outside the stage. This pass responds to the request for more immediately legible UI, iconography, and motion rather than text-only labels.

## Chapter-by-chapter review

| Section | What already reads clearly | Review decision |
| --- | --- | --- |
| 01 — The assistant | The prompt is typed into the bottom composer, sent into the chat, followed by a loading state and Taipei itinerary. | Enlarged the Taipei route preview beside the answer to a proper map-like card with visible route, endpoints, and labels; it no longer reads as a thin, tiny line. |
| 02 — Tokens | The original message remains the source; word copies leave it and enter whole-word, word-piece, and punctuation groups. | The source-to-token movement already supplies a strong cause-and-effect animation. Keep it uncluttered and do not add another token dashboard. |
| 03 — Context & attention | Prompt details connect to duration, place, budget, and preference; the attention focus and “quite” → likely “quiet” cue make context use tangible. | Replaced the text-only “best-fit/ask” takeaway with two visible intent outcomes, a likely/uncertain distinction, and an assistant clarification card with selectable-looking answers. The candidate state yields to the question state in sync with narration. |
| 04 — LLM generation | The layered network, candidate next tokens, growing response, and returned context explain repeated token generation. | Replaced MAP/CALENDAR chips with two compact app windows: a route map whose path draws and a calendar whose weekend dates highlight. Moved and narrowed the response card to eliminate collision with the service panel; corrected inherited flex/chip styling that caused calendar overflow. |
| 05 — Where tools come from | Product-builder boundary, available-tool cards, the map tool contract, and the approval gate distinguish model from external software and permissions. | Preserve the existing icon-led product interface and approval gate; no extra app panel is needed. |
| 06 — Tool use | A task is matched to an available map tool, structured into a route request, checked by an orchestrator, executed externally, and returned to context. | Keep the road-map UI inside the MAP SERVICE card. During loading, the route draws and a signal marker travels along it before the result card appears. |
| 07 — How models learn | The Taipei/$8,000 “five” vs “eight” mismatch, parameter adjustment, and corrected prediction give training a concrete example. | Added a readable $0–$10K scale with separate guess/target bars, animated the gap closing with the update, and switched the comparison glyph from ≠ to ✓ on match. The shared examples now use recognizable thumbs-up/down and map-tool UI while orange directional particles animate the feedback loop. |
| 08 — Why answers vary | One visible prompt feeds alternative next-token candidates and two constraint-preserving itineraries; the close distinguishes consistency from accuracy. | Keep the growing route traces in both answer cards and the sequential Day 01/Day 02 token reveals. Context sources now use recognizable app-like icons, linking system/chat/map/model inputs to different plausible outputs. |

## Motion and composition principles

The route traces, feedback arrows, branch tokens, card swaps, and app updates are functions of the absolute narration/audio time. Seeking forward, backward, or repeatedly to the same timestamp reconstructs the same visual state; none of these effects depend on accumulated animation state. Existing Three.js particles and network pulses remain the ambient motion layer, while explanatory UI continues to dominate the composition.

The Taipei nature-weekend example remains consistent across the explainer. No labels were added as subtitles or title cards inside the frame. The purpose of the added UI is explanatory, not decorative: map paths draw when an external service is used, a clarification appears only when ambiguity matters, and the training scale shows the prediction/target gap changing after an update.

## Local verification

- Vite production build passed; `git diff --check` passed.
- Chromium confirmed the 1920×1080 backing canvas, one proportional 16:9 stage, eight chapter controls, and the loaded preview audio.
- Samples at 14.2s (enlarged Section 01 map), 103.8/105.6s (candidate meanings → clarification), 171.2s (live map/calendar and response layout), 327.5/330.8s (budget mismatch → match), and 400/416s (alternative route branches and context sources) stayed within the stage.
- At 171.2s the response and live-services cards had no intersection; both app windows remained within their parent card and no app content overflow was detected.
- At 330.8s the comparison glyph changed to ✓ with the corrected prediction. The budget scale remained inside the prediction card without colliding with the parameter card.
- Repeated seeks reconstructed the same route-path, feedback, and branch states; no JavaScript errors, failed resources, or media-load failures were detected during this local pass.

This remains a browser preview and source-project update, not a rendered final MP4.

## Late-section legibility and ending pass

- Increased stage-relative type size across Sections 07 and 08, including the training prompt/prediction, target values, answer branches, consequence labels, and final four-step summary; enlarged the three model-risk pictograms and the reproduce/compare/trust animations.
- Section 07 at 327.5s keeps the five-versus-eight mismatch, orange parameter feedback, and $0–$10K scale distinct; at 370.5s all three visual failure modes are legible and remain inside the stage.
- Section 08 at 400s shows both larger itinerary branches without text overflow; at 431s the three consequence icons are fully present; at 464.5s the Prompt → Model → Verify → You Decide flow, completed check, and open question mark make the ending read as a deliberate conclusion.
- Chromium confirmed an exact Chapter 08 seek to 372.026s and playback advancing to 374.94s with synchronized captions. Repeated direct rendering at 464.5s produced identical node transforms, SVG path states, check/question marks, and caption.
- `npm run build`, `git diff --check`, `ffprobe`, and full MP3 decode passed. The MP3 file measures 466.808s; Chromium exposes 466.76s after decoding, while the deterministic visual timeline ends at 466.726s and holds the completed final composition.

## Live deployment verification

- GitHub Pages deployment succeeded for commit `a0f163dcbb0c1d4cd20405df054acb5877e75a11` (Actions run `40098253059`). The public page returned HTTP 200 and contains the larger late-section typography, icon-led consequences, appended outro audio, and final-flow markup.
- Live Chromium confirmed the 1920×1080 backing canvas and 466.76-second decoded audio. Samples at 370.5s, 400s, 431s, and 464.5s showed the three failure icons, enlarged answer branches, three animated consequences, and complete reflective ending. Chapter 08 is active with synchronized caption at the close.
