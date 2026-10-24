# Part 02 — Neural Networks, LLMs & Training

**Status:** Initial outline only; sequence and scope remain open for review.

## Working title

**How LLMs Are Trained: Neural Networks, Next-Token Prediction & Fine-Tuning**

## Core question

How does a neural network acquire useful behavior from data, and what changes when a base model is trained further into an instruction-following assistant?

**Provisional length:** 8–10 minutes, calm narration.

## Proposed scope

1. **A neural network is a computation, not a tiny person.** Inputs pass through layers of learned numerical operations.
2. **Weights and parameters:** Show the adjustable values that shape how signals move through the network.
3. **One training example:** Feed a short token sequence, predict the next token, compare with a target, and calculate a loss signal.
4. **Learning update:** Explain at a high level how gradients indicate how parameter changes could reduce loss, and how an optimizer applies updates. Use an animated error signal flowing backward; do not imply every parameter can be understood as a human-readable rule.
5. **Pre-training:** Repeated examples teach broad language patterns and predictive capabilities. Keep the Taipei prompt / “five” vs “eight” example as an accessible illustration, clearly not a literal single-step fact-learning story.
6. **Post-training:** Contrast supervised instruction examples, preference-based methods, and other tuning approaches as families of methods, not a single universal recipe.
7. **From checkpoint to product model:** Explain that model versions are created through training/evaluation/selection pipelines; a deployed chat does not normally rewrite the base weights after each user message.
8. **Limits and recap:** Training methods and data differ; a model can improve behavior without becoming a database of exact answers.

## Visual direction

Build a continuous “signal lab”: input examples enter a neural-network stack; next-token prediction becomes a measurable miss; the error propagates through the network; selected parameter groups shift; repeated batches gradually change aggregate behavior. Later, instruction and preference examples enter a distinct post-training stage, producing a candidate checkpoint that must still be evaluated before deployment.

Use animated loss meters, gradient pulses, parameter landscapes, checkpoint/version cards, and a simple model-evaluation dashboard. Avoid presenting a single training example as the entire learning process or a guarantee that one correction permanently teaches a fact.

## Keep separate from Part 01 and Part 03

- Briefly remind viewers that Transformers contain learned projections and other parameters, but do not re-teach Q/K/V or the attention formula.
- Explain that training shapes model parameters, not decoding temperature; defer logits, softmax sampling, and temperature controls to Part 03.
- Distinguish **weights**, **conversation context**, **retrieved/tool data**, and **model versions** visually and verbally.

## Open planning questions

- How much mathematical detail should the first draft include: intuitive loss/gradient visuals only, or one simple equation after the visual explanation?
- Should “how one model becomes the next model” be a short closing beat here, or a separate future episode if the user wants more on product/model lifecycle?
- Which single example best connects prediction, target, and preference tuning without making training appear to memorize one travel itinerary?
