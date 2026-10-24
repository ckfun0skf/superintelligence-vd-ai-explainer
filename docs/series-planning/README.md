# AI Deep-Dive Series — Planning Hub

**Status:** Planning only. No new video, narration, audio, or website page has been built yet.

## Purpose

The existing film, *From Prompt to Action*, is the broad introduction. This follow-up series goes deeper into three ideas that the first film introduces but does not fully unpack: Transformer/self-attention, neural networks and LLM training, and temperature/sampling.

**Working series name:** *AI Under the Hood* (placeholder)

**Working language assumption:** English narration and in-frame interface labels, matching the first film; planning notes are in Traditional Chinese. Review captions, if used, stay outside the 16:9 film frame.

**Continuity:** Reuse the Taipei nature-weekend request and the $8,000 budget as a familiar anchor, but introduce a small, purpose-built example in each episode when it makes a technical mechanism easier to see. Keep the established dark, polished, interactive-textbook visual language, with more continuous motion and recognizable app-like UI than static title cards.

## Proposed watch order

| Part | Working title | Main question | Planning status |
|---|---|---|---|
| 01 | **How Transformers Work: Self-Attention, Q/K/V & Context** | How can a model connect relevant tokens across a prompt and build contextual representations? | Deep outline started in [Part 01](./01-transformer-and-attention.md) |
| 02 | **How LLMs Are Trained: Neural Networks, Prediction & Fine-Tuning** | How do a network's parameters get learned and then shaped into an assistant? | Initial outline in [Part 02](./02-neural-networks-and-llm-training.md) |
| 03 | **AI Temperature Explained: Why Answers Can Vary** | How does temperature change next-token selection, and what does it not control? | Initial outline in [Part 03](./03-temperature-and-sampling.md) |

## Editorial map: avoid repeating the first film

- The first film already introduces tokens, attention as context-sensitive relationships, one-token-at-a-time generation, a simplified training update, and output variation.
- Part 01 should explain the *mechanism and architecture*: token representations, positional information, self-attention, Query/Key/Value, attention weights, heads, Transformer blocks, and causal masking. It should not become a full training tutorial.
- Part 02 should explain the *learning process*: network parameters, prediction and loss, gradient-based updates, pre-training versus post-training, checkpoints, and why a conversation normally does not rewrite the model's weights. It should briefly recall attention only as part of the forward pass.
- Part 03 should explain the *decoding choice*: logits/probabilities, temperature, sampling, and reproducibility. It should not imply temperature changes model knowledge or guarantees deterministic answers.

## Suggested future page structure

Keep the existing root preview page for the original film unchanged. When a new preview is approved, give each new film a separate URL/page under a series path (provisionally `/series/transformer-attention/`, `/series/llm-training/`, and `/series/temperature/`). The future pages can share the 16:9 player design while keeping each film's timeline, audio, chapters, and assets independent. This is a recommendation for the later implementation stage, not work done in this planning pass.

## Recommended next step

Review the Part 01 mechanism order, analogy, and worked example first. Once approved, turn its outline into a paced English narration draft and map each spoken beat to a visual action. Keep script, voice generation, and production as later approval steps rather than assuming them now.
