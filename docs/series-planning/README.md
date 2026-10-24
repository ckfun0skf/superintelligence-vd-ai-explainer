# AI Deep-Dive Series — Planning Hub

**Status:** Planning continues. Part 01 now has an English narration and visual-design draft; no voiceover audio, animation, or new website page has been built.

## Purpose

The existing film, *From Prompt to Action*, is the broad introduction. These are three separate, standalone deep-dive videos on topics the first film introduces but does not fully unpack: Transformer/self-attention, neural networks and LLM training, and temperature/sampling. A viewer must be able to watch any one of them without first watching the other two.

**Working series name:** *AI Under the Hood* (placeholder)

**Working language assumption:** English narration and in-frame interface labels, matching the first film; planning notes are in Traditional Chinese. Review captions, if used, stay outside the 16:9 film frame.

**Standalone rule:** Each episode gets its own hook, a brief context reset, plain-language definitions, one complete worked example, and a clear recap/ending. Avoid “as we explained in Part 1” dependencies. The suggested release order is editorial guidance, not a viewing prerequisite.

**Continuity:** Reuse the Taipei nature-weekend request and the $8,000 budget as a familiar anchor, but introduce a small, purpose-built example in each episode when it makes a technical mechanism easier to see. Keep the established dark, polished, interactive-textbook visual language, with more continuous motion and recognizable app-like UI than static title cards.

## Proposed watch order

| Part | Working title | Main question | Planning status |
|---|---|---|---|
| 01 | **How Transformers Work: Self-Attention, Q/K/V & Context** | How can a model connect relevant tokens across a prompt and build contextual representations? | [English script + visual design](./01-transformer-and-attention-script.md) drafted; [deep-dive plan](./01-transformer-and-attention.md) |
| 02 | **How LLMs Are Trained: Neural Networks, Prediction & Fine-Tuning** | How do a network's parameters get learned and then shaped into an assistant? | Initial outline in [Part 02](./02-neural-networks-and-llm-training.md) |
| 03 | **AI Temperature Explained: Why Answers Can Vary** | How does temperature change next-token selection, and what does it not control? | Initial outline in [Part 03](./03-temperature-and-sampling.md) |

## Editorial map: avoid repeating the first film

- The first film already introduces tokens, attention as context-sensitive relationships, one-token-at-a-time generation, a simplified training update, and output variation.
- Part 01 should explain the *mechanism and architecture*: token representations, positional information, self-attention, Query/Key/Value, attention weights, heads, Transformer blocks, and causal masking. It should not become a full training tutorial.
- Part 02 should explain the *learning process*: network parameters, prediction and loss, gradient-based updates, pre-training versus post-training, checkpoints, and why a conversation normally does not rewrite the model's weights. It should briefly recall attention only as part of the forward pass.
- Part 03 should explain the *decoding choice*: logits/probabilities, temperature, sampling, and reproducibility. It should not imply temperature changes model knowledge or guarantees deterministic answers.

## Suggested future page structure

Keep the existing root preview page for the original film unchanged. When a new preview is approved, give each new film a separate URL/page under a series path (provisionally `/series/transformer-attention/`, `/series/llm-training/`, and `/series/temperature/`). The future pages can share the 16:9 player design while keeping each film's timeline, audio, chapters, and assets independent. This is a recommendation for the later implementation stage, not work done in this planning pass.

## Reference buttons on the original YouTube video

After each deep-dive video is available on YouTube, add a YouTube Card (the in-video reference button) to the original upload at the related spoken beat. The MP4 picture does not need to be re-rendered; these are YouTube publishing settings. Until a linked video is published, leave the Card unset and use a description/chapter link later as a fallback.

| Deep-dive video | Suggested card placement in the original film | Why here |
|---|---|---|
| Transformer & Attention | **01:13.6** (73.6 s), as Section 03 names Transformer attention and starts explaining relationships | The viewer has just reached the mechanism this video unpacks. |
| Neural Networks & LLM Training | **05:06.7** (306.7 s), at the first spoken pre-training explanation in Section 07 | This is the clearest point where the original film moves from model use to how models learn. |
| Temperature & Sampling | **06:45.7** (405.7 s), when Section 08 explains that temperature changes variation | The Card appears at the exact concept rather than at the later general recap. |

These are target placements to confirm in YouTube Studio after the deep-dive uploads exist. Add a matching link to the original video's description as a stable alternative.

## Recommended next step

Review the Part 01 English script and visual design. Revise the example, formula depth, and pacing as needed; after approval, read it aloud or make a short voice sample to measure real timing. Voice generation and animation remain later steps, not yet started.
