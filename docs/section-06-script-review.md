# Section 06 — How the Model Chooses and Uses a Tool

**Status:** Integrated into the six-section production preview; local desktop/mobile Chromium QA passed. Narration uses the existing long-form project draft verbatim and the approved Charon-style narrator; please review the generated voice and animation in the published preview.

**Language:** English

**Delivery target:** Existing warm, low, measured narration; leave short pauses between ideas.

## Narration

How does it choose? The model receives descriptions of the available tools and their expected inputs. It compares those descriptions with the task. If it has learned that a map tool can find routes, and the user asks for current transit options, that tool looks relevant. Training examples and the product’s instructions can also teach the model what kinds of requests belong with which tools.

The model then produces a structured tool request—for example, asking the map service for a route between two places. The surrounding application, sometimes called the orchestrator, checks and executes that request. The tool runs as software and returns its result. That result is added to the conversation context as a new message. The model then continues from the updated context, generating the next part of its reply—or, if needed, another tool request.

The model proposes the tool call; the application runs it. This distinction matters. Tool selection can be mistaken, tool results can be incomplete, and consequential actions—such as making a reservation—may require confirmation and permission.

## Visual beat plan

1. **Need ↔ description match:** Carry the live-transit need from the prior scene. Use a bus/clock icon and route arrows. Reveal the tool cards already exposed by the AI product. A scan pulse compares the need with each card’s description; MAP lights up because its “find routes” icon/label and origin/destination pin inputs fit. Search, calendar and booking cards remain visible but dim. A small instruction/learning glyph reinforces that descriptions and training examples help guide selection.
2. **Structured request:** The selected map card folds into a traveling request packet with a route icon plus origin and destination pins. Keep fields icon-led and concise rather than displaying code. The packet travels from the model to an application/orchestrator boundary, not directly to the external map service.
3. **Application executes:** The orchestrator checks the required fields with animated ticks, then routes a signal across the boundary to a distinct map-service icon. Show a brief route-search pulse and moving dots on a map line.
4. **Result returns to context:** Send a result card back through the application into the model’s context as a new message. Show route alternatives and ETA as clearly marked illustrative interface data. Pulse the context stack, then let the model resume generating a short response; optionally show a second request icon to illustrate the loop without asserting that one is always needed.
5. **Reliability and permission:** End with a coral caution icon for possible selection errors/incomplete results and an amber booking/shield icon paused at “approval needed.” Do not depict a reservation as confirmed. Hold the model → application → separate tool → updated context loop long enough to read.

## Production constraints

- English narration; no in-frame subtitles or title cards. Short labels are functional interface text only.
- Use icons and moving signals to explain each relationship before relying on labels.
- One fixed 1920×1080 composition at 24 fps; no phone-only layout or in-frame font overrides. The responsive player/fullscreen shell stays outside the film frame.
- Absolute-time rendering must reproduce each state under direct, forward and reverse seeks. Reuse the existing cyber/space score with the established voice-forward sidechain mix.
