# Part 03 — Temperature, Sampling & Output Variation

**Status:** Initial outline only; sequence and examples remain open for review.

## Working title

**AI Temperature Explained: Why the Same Prompt Can Get Different Answers**

## Core question

After a language model assigns scores to possible next tokens, how does temperature change the distribution used for selection—and why does that not explain every difference between answers?

**Standalone requirement:** Start from the observable fact that one prompt can yield different continuations, then define scores, probabilities, and sampling as needed. Give this video its own complete explanation and takeaway; prior episodes are optional.

**Provisional length:** 5–7 minutes; this mechanism may be shorter than the other two episodes.

## Proposed scope

1. **Start with a fixed choice point:** The same prompt and same next-token scores produce several plausible continuations.
2. **Scores versus probabilities:** Introduce logits as model scores, then show softmax turning them into a distribution.
3. **Temperature control:** Explain conceptually that dividing logits by temperature before softmax sharpens or flattens the distribution: lower temperature concentrates probability around top options; higher temperature spreads it more.
4. **Sampling:** Draw repeated choices from the distribution and show how a small early choice can lead to a different answer branch.
5. **Greedy versus sampling:** Clarify that some decoding setups choose the top option rather than sample; temperature has different practical effect depending on the decoding method.
6. **What temperature does not control:** System instructions, chat history, model version, tool results, serving details, random seeds, and other sampling/filtering settings may also matter.
7. **Practical takeaway:** Temperature is a generation/decoding setting, not a training knob, factuality dial, or guarantee of creativity/consistency.

## Visual direction

Use a live candidate-token interface for the Taipei nature-weekend prompt. Keep one fixed score set visible while a temperature dial transforms the probability bars; sample tokens from the bars into diverging itinerary cards. Then hold temperature constant and introduce changing context/model/tool inputs to show that those are separate sources of variation.

Possible visual formula, introduced only after the intuition: `softmax(logits / temperature)`. Use a clear zero/low/high comparison, and label the bars as illustrative rather than measured probabilities from a specific model.

## Accuracy guardrails

- Avoid saying “temperature creates randomness” as a complete explanation; sampling and the rest of the decoding pipeline matter.
- Avoid guaranteeing that temperature 0 makes every system perfectly deterministic. It commonly approximates greedy selection, but ties, infrastructure, implementation, and other inputs can affect reproducibility.
- Distinguish temperature from top-k/top-p filtering, random seed, prompt/context, model changes, and tool outputs.
- Higher temperature does not mean more accurate, more intelligent, or automatically more creative; it changes the distribution shape used in selection.
- Keep the same underlying model scores when demonstrating the dial so viewers see the parameter’s specific effect rather than a hidden model change.

## Open planning questions

- Should top-k and top-p appear as a very short side-by-side comparison, or be saved for an additional decoding episode?
- Should the practical ending give example low/medium/high settings, or avoid universal numeric advice because products and sampling implementations differ?
- How tightly should this episode connect to the “same prompt, different answer” ending of the original film versus stand alone for search viewers?

## Parent-video reference button

Suggested YouTube Card on the original film at **06:45.7** (405.7 s), at the spoken line that temperature changes variation in Section 08. Add it after this deep-dive video is published; include a matching description link as a fallback. This Card should point directly to the temperature video, not require viewers to watch Parts 01 or 02 first.
