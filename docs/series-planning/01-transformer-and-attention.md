# Part 01 — Transformer & Attention: Deep-Dive Plan

**Status:** [Part 01 script](./01-transformer-and-attention-script.md) and standalone [preview page](../../series/transformer-attention/) are available with an eight-chapter Charon narration. The assembled MP3 is about 7:00.5; exact chapter timing is generated from the source WAVs. Full-length audio/browser QA and MP4 export remain pending.

## Working title and promise

**Working title:** *How Transformers Work: Self-Attention, Q/K/V & Context*

**Viewer promise:** By the end, viewers should be able to explain, in plain language, how a GPT-style Transformer turns tokens into contextual representations, how self-attention combines information from earlier tokens, why Query/Key/Value are useful projections, and how attention fits inside a larger Transformer block.

**Standalone requirement:** Open with the real question and a 15–20-second reset of what an LLM receives; define every necessary term in this video. End with a complete recap. Viewers do not need either of the other deep-dive videos.

**Audience:** Curious non-specialists who have watched (or can follow) the original *From Prompt to Action* film. Briefly refresh tokens, but do not spend a full chapter re-teaching tokenization.

**Runtime:** The generated voice track is about 7:00.5 including chapter gaps. The voice pace and chapter joins still need a listening review; clarity takes priority over matching the earlier 8–10-minute estimate.

## The central question

When an LLM sees a request with several constraints, how does the representation of one token become informed by other relevant tokens—and how is that operation repeated to build context?

Open with the familiar travel request, then zoom in on one illustrative sentence:

> “The trail near Maokong is shaded. It is short, too.”

Use **“it” → “the trail”** as an intuitive relationship, while showing that the full model uses many token positions and layers. This is a teaching example, not a claim that a real model uses one attention edge or a single head to resolve pronouns.

## Proposed narrative spine

1. **A token is not a finished idea.** The model starts with token IDs and learned vector representations.
2. **Context has to be added.** Position/order information is represented somehow so the model can distinguish tokens in a sequence.
3. **Self-attention computes contextual mixtures.** For each position, learned Query, Key, and Value projections are used to score and combine information from permitted positions.
4. **Several heads can do this in parallel.** Each head is a different learned projection/attention operation; do not assign fixed human-readable jobs to specific heads.
5. **Attention is one component, not the whole Transformer.** A typical decoder block also has residual paths, normalization, and a feed-forward network; blocks are stacked.
6. **A GPT-style decoder is causal.** A mask prevents a position from reading future tokens. The model then predicts a next token and repeats the forward pass as the sequence grows.
7. **What the picture means—and what it does not.** Attention is a learned computation for mixing contextual information, not a literal human spotlight or a complete explanation of the model's reasoning.

## Proposed beat map and visual progression

| Approx. time | Beat | Visual action | Accuracy / pacing note |
|---|---|---|---|
| 00:00–00:40 | **Hook: follow the reference** | A compact assistant chat displays the Taipei/nature request. The follow-up sentence appears; the token “It” briefly has several possible paths, then the surrounding text narrows the illustrative trail connection. Camera dives into the message rather than cutting to a title card. | Frame this as a simplified example of context use, not a literal measurement from a production model. |
| 00:41–01:30 | **Tokens and position** | The sentence separates into token tiles, then vector glyphs; reorder two phrases and a position ribbon changes with sequence order. | Embeddings are not word definitions; positional information is encoded differently across architectures. |
| 01:31–02:16 | **What self-attention does** | One token position is selected. Potential links reach other positions; illustrative weights shift as the query position changes. | Lines are schematic, not permanent semantic links or measured weights from a production model. |
| 02:17–03:36 | **Query, Key, Value** | Token representations pass through learned Q/K/V projection gates. The selected Query compares against available Keys; scores control the flow of Values. | Q/K/V are vectors from learned projections, not literal questions, database keys, or stored facts. |
| 03:37–04:17 | **Multi-head attention** | Several learned lanes process the same token row in parallel and recombine. | Do not assign fixed human-readable jobs to individual heads. |
| 04:18–05:06 | **Inside a Transformer block** | Camera enters attention, residual/normalization and feed-forward sublayers; the block repeats into a stack. | Show a common GPT-style block without claiming every Transformer uses an identical layout. |
| 05:07–06:01 | **Causal mask and next-token loop** | A triangular gate blocks future positions. Contrast parallel masked computation over a known training sequence with inference appending one selected token at a time. | Keep training detail brief; optional cache cue is illustrative, not a KV-cache optimization tutorial. |
| 06:02–07:00 | **Recap and standalone ending** | Reassemble tokens → vectors/position → attention → Transformer blocks → next-token scores. Return to the Taipei prompt and resolve the visual journey without a cliffhanger. | Attention is one important computation, not a complete explanation of a model’s answer. Other deep-dives are optional. |

*These are measured chapter ranges from the generated narration (including 0.8-second gaps between chapters); the final chapter ends at about 07:00.5 with a small MP3 encoder/container tail.*

## Visual grammar

- Preserve the project’s 16:9 dark, professional, interactive-textbook language, but make this episode feel like a continuous camera journey through a working model rather than a series of cards.
- Keep the Taipei request and budget as a recurring anchor. Use functional chat UI for the prompt, a token ribbon for sequence order, a vector field for representations, transparent matrices/lanes for Q/K/V, and a layered 3D block for the Transformer stack.
- Use movement to explain causality: token → projection → score → normalized weight → Value mixture → contextual representation. Every animation should have a visible source, destination, and result.
- Reserve color meanings consistently: source/context (mint), score/attention weights (blue-cyan), masked future (dim graphite), and learned parameter/weight projections (violet or amber). Avoid turning every concept into a different glowing color.
- Place a small on-screen label only when it identifies a real component (e.g., `QUERY`, `KEY`, `VALUE`, `CAUSAL MASK`). No decorative section titles or in-frame subtitles. Review captions, if added, remain outside the video frame.
- Let dense math arrive after the animated intuition. Hold the Q/K/V and final formula long enough to read; do not narrate them at rapid-fire speed.

## Technical accuracy guardrails

- **Transformer ≠ attention.** Transformer refers to a family of architectures; attention is a central component. Many chat LLMs use decoder-only Transformers, but Transformer systems can also be encoder-only or encoder–decoder.
- **Self-attention is contextual computation.** Query, Key, and Value are learned linear projections of each position’s current representation (per head); scores and weights depend on the current input, layer, and head.
- **The weighted mix is not hard retrieval.** A key is not a database index and a value is not a sentence stored verbatim. The weighted sum updates a representation.
- **Order information is necessary.** Position is encoded through different methods in different architectures; present one conceptual position cue rather than universalizing a single implementation.
- **Decoder masking matters.** A causal mask blocks future positions so next-token training and generation do not use unavailable future tokens.
- **Heads do not have guaranteed named roles.** Illustrative animations may vary the patterns, but must label them as schematic rather than claim stable semantic modules.
- **Attention is not all of the explanation.** The final output depends on the full stack, learned parameters, prompt/context, and decoding process; a visible attention map alone is not a complete account.
- **Keep this episode distinct from Part 02.** Mention that weights/projections are learned, but defer loss, gradients, optimizer updates, pre-training, and post-training to the training episode.

## What to leave out of the first cut

- Full matrix-dimension derivations, tensor shapes, GPU kernels, KV-cache optimization, grouped-query attention, sparse/linear attention variants, and a catalog of positional-encoding methods.
- A long detour into training algorithms; one bridge sentence is enough.
- Claims that a single head “understands” a concept, that attention weights equal causal importance, or that Transformers literally scan text with human-like focus.

These can be optional follow-up notes, not prerequisites for a clear first deep-dive.

## Suggested review questions

1. What is the difference between a Transformer and its self-attention mechanism?
2. What do Query, Key, and Value contribute to the simplified attention calculation?
3. Why does a GPT-style model need a causal mask?
4. Why is an attention heatmap only a partial view of a model’s computation?

## Optional cross-references (not prerequisites)

- **Context reset:** The original film briefly showed tokens, broad attention relationships, and next-token generation. Recap only what is needed; do not assume the audience remembers or has watched it.
- **Parent-video reference button:** Suggest a YouTube Card on the original film at **01:13.6**, when the narration names Transformer attention and starts explaining relationships (Section 03). Add the Card after this deep-dive video is published; a description link is a fallback.
- **Optional next watch:** Training and temperature are independent topics. They may be suggested at the end as optional related videos, but this film must reach a satisfying ending on its own.

## Proposed next step

Listen through the full Charon read and chapter joins, review transcript synchronization and the audio-driven page, then complete full-browser playback QA and export the final 1920×1080 MP4. See the current [production status](../../series/transformer-attention/README.md).
