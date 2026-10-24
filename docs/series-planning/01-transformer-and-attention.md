# Part 01 — Transformer & Attention: Deep-Dive Plan

**Status:** Planning draft for review; not a narration script and not yet approved for production.

## Working title and promise

**Working title:** *How Transformers Work: Self-Attention, Q/K/V & Context*

**Viewer promise:** By the end, viewers should be able to explain, in plain language, how a GPT-style Transformer turns tokens into contextual representations, how self-attention combines information from earlier tokens, why Query/Key/Value are useful projections, and how attention fits inside a larger Transformer block.

**Audience:** Curious non-specialists who have watched (or can follow) the original *From Prompt to Action* film. Briefly refresh tokens, but do not spend a full chapter re-teaching tokenization.

**Length target:** Roughly 8–10 minutes, with calm pacing and short visual holds after the densest mechanisms. Duration is provisional; clarity is more important than hitting a precise runtime.

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
| 00:00–00:35 | **Hook: follow the reference** | A compact assistant chat displays the Taipei/nature request. The follow-up sentence appears; the token “It” briefly has several possible paths, then the surrounding text narrows the illustrative trail connection. Camera dives into the message rather than cutting to a title card. | Frame this as a simplified example of context use, not a literal measurement from a production model. |
| 00:35–01:20 | **Tokens become vectors** | The sentence separates into token tiles; each tile transforms into a compact point/vector glyph. A token ID label is shown briefly, then replaced by its vector-like representation. | An embedding is a learned numerical vector, not a dictionary definition or a one-to-one picture of meaning. Avoid pretending a 2D dot plot is a literal model embedding. |
| 01:20–02:00 | **Order matters** | Reorder two tokens; a position ribbon/rotary-like phase cue changes with sequence position. The same token appears in different positions with a different contextual input to later operations. | Say that Transformers need positional information and that implementations encode it in different ways. Do not suggest every system simply adds the same absolute position vector. |
| 02:00–02:45 | **What self-attention does** | One token position is selected as the current query. Thin potential links reach earlier token positions; irrelevant links dim while a few illustrative links brighten. The selection moves to another position so viewers see that every position can form its own view. | The lines represent computed relevance weights in a simplified view, not permanent semantic links. Attention is calculated per layer and head. |
| 02:45–04:05 | **Query, Key, Value** | Each token representation passes through three visibly separate learned projection gates: Q, K, and V. The selected Query compares against Keys; score bars become normalized weights; those weights control how much of each Value flows into the selected position. | Use the analogy “what this position is looking for / what each position offers for matching / the information carried forward” only as a mnemonic. Q, K, and V are learned projections—not literal questions, database keys, or stored facts. |
| 04:05–04:50 | **From scores to a new representation** | Animate score bars into a softmax distribution whose weights sum to one; colored Value streams merge into a new contextual vector for “It.” Then restore the full sentence so the updated token is seen in context. Reveal the compact formula only after the visual operation: `softmax(QKᵀ / √dₖ) V`. | Identify the formula as a simplified scaled dot-product attention expression. A causal mask restricts which positions enter the distribution in a decoder. |
| 04:50–05:35 | **Multi-head attention** | Split the same input representation into several parallel lanes with subtly different link patterns; recombine their outputs into one representation. Use the same travel prompt and constraint cards to show multiple contextual signals entering the recombination. | Heads may learn different useful patterns, but do not label one as “the budget head” or “the pronoun head” as a universal fact. Different models/layers vary. |
| 05:35–06:35 | **Inside a Transformer block** | Zoom out: attention output rejoins the input through a residual path, passes a normalization gate, then a feed-forward/MLP stage transforms each position; residual path reconnects. One block becomes a stack of blocks. | Describe a common GPT-style decoder block, not every Transformer implementation. LayerNorm placement and other details vary; keep exact variant-specific details off the main path unless later selected. |
| 06:35–07:25 | **Causal mask and next-token loop** | A triangular glass gate lets each position see itself and earlier tokens but blocks future tokens. A prompt crosses the stack; the final position produces candidate next tokens. One is appended, and the model runs again with the longer context. | Clarify that autoregressive generation is sequential token by token at inference, even though training computations across positions can be parallelized under the causal mask. Keep this as one clean distinction, not a long training detour. |
| 07:25–08:10 | **Recap and boundary** | Reassemble the chain: tokens → vectors + position → attention mixing → Transformer blocks → next-token distribution. Pause on a small “attention is part of the model” visual, then pass a highlighted parameter/weight bundle to the next episode. | A visible attention pattern is not by itself a complete, faithful explanation of why the model answered as it did. Bridge training to Part 02. |

*The time ranges are a pacing sketch only. They can change after narration is drafted and read aloud.*

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

## Bridge to the rest of the series

- **From the original film:** The audience already saw tokens, broad attention relationships, and next-token generation. Start with the question “what calculation is behind those moving links?”
- **To Part 02:** The Q/K/V projections, embeddings, and feed-forward layers contain learned parameters. Part 02 explains how training adjusts these values and how a general neural network is shaped into a useful LLM.
- **To Part 03:** Once the final position has produced next-token scores, Part 03 explains how temperature changes the distribution used to choose a continuation.

## Proposed next step

Get approval on the story spine, the “it → trail” example, and how much math to show. Then draft the English narration in short, breath-friendly sections, read it aloud for pacing, and only after script review create the shot-by-shot animation plan. Do not generate narration or start implementation in this planning pass.
