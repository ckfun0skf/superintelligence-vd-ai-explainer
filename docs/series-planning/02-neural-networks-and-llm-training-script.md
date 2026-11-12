# Part 02 — Neural Networks: From One Neuron to Training
## English Narration Draft — Standalone Part 02, Revision 1

**Status:** Charon en-US narration has been generated from this Revision 1 script and is ready for voice review. It focuses on artificial neurons, layers, labelled-example training, backpropagation, and neuroevolution through a Snake example. The transition from task-specific networks to LLMs has its own Part 03 script. No background music, animation, or preview has been generated. Audio: [final WAV](../../series/neural-networks/audio/narration/part02-neural-networks-narration.wav) and [MP3 preview](../../series/neural-networks/audio/narration/part02-neural-networks-narration-preview.mp3).

**Working title:** *How Neural Networks Learn: From One Neuron to Training*

**Pacing:** Warm, clear, and unhurried, matching Part 01. This standalone script contains approximately 2,424 spoken words (about 20:12 at 120 wpm). The generated narration, with a light 5% pitch-preserving slowdown and short inter-chunk gaps, measures 17:25.8 (about 139 wpm averaged across the track). Section ranges below are approximate audio-derived boundaries from an automatic transcript; exact animation cues still require listening and waveform review. Section headings and time ranges are not spoken.

---

## 01 — What is the core idea behind modern AI? | audio-derived approx 00:00–00:59.6

### Voice-over

What is the most important thing inside AI?

There isn’t one answer for every kind of AI. But one of the central engines behind modern generative AI is the neural network.

The name can sound mysterious. A neural network is a mathematical system: numbers go in, calculations transform them, and numbers come out. Training changes the adjustable values inside those calculations.

The idea begins with a simplified mathematical model inspired by a biological neuron. In 1943, Warren McCulloch and Walter Pitts described one such model. In 1958, Frank Rosenblatt introduced the perceptron, a simple system that could learn to separate patterns.

These were not tiny copies of a brain. They were building blocks for a new kind of calculation. To see how those blocks work, let’s follow one number at a time.

---

## 02 — One artificial neuron, step by step | audio-derived approx 00:59.6–03:53.9

### Voice-over

Imagine one grey color swatch on a screen. Our task is simple: decide whether it is light or dark.

A computer can describe a color with three values: red, green, and blue. Each usually ranges from zero to two hundred and fifty-five. For easier arithmetic, computers often rescale those values between zero and one. So, for example, a channel value of two hundred and four becomes about zero point eight.

Let’s use a light grey swatch: red is zero point eight, green is zero point eight, and blue is zero point eight.

Those three values enter one artificial neuron. The neuron is not thinking about the color. It performs a calculation.

Each input is multiplied by a weight. A weight is an adjustable number that controls how strongly an input contributes. Imagine a small dial attached to each channel. For this simple demonstration, set all three weights to one.

Now add the weighted values: zero point eight, plus zero point eight, plus zero point eight. That gives two point four.

Next comes the bias. A bias is another adjustable number added to the total. You can think of it as shifting the point at which the system begins to lean toward one answer or the other. For our illustration, set the bias to minus one point five. Two point four minus one point five gives a score of zero point nine.

That score is not yet a probability. An activation function transforms it. Here we’ll use a common shape called a sigmoid. You do not need its equation: picture a soft gate that turns any score into a value between zero and one.

A score of zero point nine becomes about zero point seven one. For this toy classifier, we read that as a seventy-one percent probability of “light.” The remaining twenty-nine percent is “dark.” These numbers are only an example; they are not measured results from a real AI model.

Now try a dark grey swatch. Its three normalized values are about zero point two. With the same illustrative weights and bias, the score becomes minus zero point nine. The sigmoid turns that into about twenty-nine percent “light,” and seventy-one percent “dark.”

So one neuron takes three values, scales their influence, adds an offset, and produces a result. The weights, bias, and activation each have a specific job.

This is a deliberately easy task on one pixel. It does not mean one neuron can understand an image. To work out why, we need to see how several neurons can be connected.

---

## 03 — From one neuron to layers | audio-derived approx 03:53.9–06:14.5

### Voice-over

Replace the single color swatch with a tiny image patch made of several pixels. Each pixel has its own red, green, and blue values. Even a very small patch therefore contains many more numbers than one color.

A layer is a group of artificial neurons that calculate at the same stage. Each neuron receives numbers, applies its own weights and bias, and produces an output. The neurons in a layer can respond differently because their adjustable values are different.

The collection of outputs from one layer becomes the input to the next. The first layer receives the pixel values. A middle layer receives the first layer’s outputs. A later layer combines those new values and passes another result forward.

That middle stage is called a hidden layer—not because it contains a secret thought, but because it is between the network’s input and its final output.

For a toy example, imagine classifying a small patch as “stripe” or “plain.” Intermediate units can respond to simple arrangements in the pixels, and a later unit can combine those signals. Those labels help us understand the demonstration. Real networks do not usually have neat, guaranteed job titles for their internal units.

There is one more important piece: the activation function. If every layer only added and multiplied numbers, stacking layers would still behave like one larger, simple calculation. An activation function changes that. It lets the network combine simple signals into more varied patterns.

Visually, imagine trying to separate two groups of examples with one straight line. One line can handle a simple split. But when the pattern bends or has several parts, a network can combine multiple stages to form a more flexible boundary.

A layer is not automatically smarter than one neuron. It is a way to combine several calculations. More layers give the network more stages in which to transform its representation—but those layers still need to be trained.

---

## 04 — How does a network learn from examples? | audio-derived approx 06:14.5–11:13.7

### Voice-over

So far, we have chosen the weights and bias by hand to make the arithmetic easy to follow. A real network usually has many adjustable values. Training is the process of finding settings that help it produce the answers we want.

For our light-and-dark task, people first prepare examples. Each example has two parts: a color swatch as the input, and a label as the answer. One row might contain a pale grey swatch and the label “light.” Another might contain a dark blue swatch and the label “dark.” The collection of these input-and-answer pairs is a labelled training set.

The labels must follow a consistent rule. For this demonstration, imagine that the people preparing the examples agree on what counts as light or dark. The network does not know that rule in advance. It only receives the examples and their supplied answers.

At the beginning, the weights may be random or simply unhelpful. We take one labelled example and pass only its color values into the network. The network makes a prediction. Perhaps the correct answer is “light,” but the network gives “light” only a twenty percent probability and “dark” eighty percent.

Now we reveal the answer attached to that example: “light.” The training system compares the prediction with this target label. Because the model gave the correct answer a low probability, the loss is large. Loss measures the mismatch for this particular task; it is not a general score for truth, usefulness, or intelligence.

The supplied answer is what makes this supervised training. The network is not discovering whether the label is objectively true by itself. It is being shown examples of the desired answer and adjusted to match them. The quality and coverage of those examples matter. If the labels are inconsistent or the examples leave out important cases, the model can learn an incomplete or biased rule.

Now the system needs to decide what to change. Which weights affected the incorrect prediction, and in which direction should they move?

Backpropagation calculates how sensitive the loss is to each adjustable value. It works backward through the calculations, tracing how the final mismatch depends on earlier weights and biases. The mathematics uses the chain rule. You do not need to calculate it by hand; the useful idea is that the system assigns each parameter a measure of how it contributed to the loss.

Those sensitivity measures are called gradients. A gradient gives the training process a direction: if a weight moves slightly up or down, which change is expected to reduce the loss?

An optimizer uses the gradients to update the weights and biases. The update is usually small. The network then sees the same color again and makes another prediction. If the update helped, the probability of “light” may rise closer to the supplied label. It will not necessarily jump from twenty percent to one hundred percent after one try.

Then the process repeats with another labelled swatch. Predict, compare with the supplied answer, measure the loss, calculate gradients, and update the parameters. This is a training loop. It runs across many examples, often in batches, and may make many passes through the training set.

One example does not install a permanent fact. The network gradually adjusts its shared weights in response to patterns across many examples. After training, researchers also check examples that were held aside. If the network succeeds only on examples it practised, it may have memorized them rather than learned a pattern that carries over. A separate check can reveal this risk, but cannot guarantee perfect performance in every real situation.

In this simple task, the supplied answer is a category such as “light” or “dark.” In other tasks, the target could be a number, a sequence of words, or something else. The training recipe depends on the task. Later, when we reach language models, we will see that the next word in the text itself can provide the target, so a human does not need to write a separate answer for every training sentence.

---

## 05 — Another way to train: evolution, mutation, and selection | audio-derived approx 11:13.7–17:25.8

### Voice-over

We have just seen one way to train a network: give it examples with supplied answers, measure how far its prediction is from the answer, and use gradients to adjust its weights.

But labelled answers are not always available. In a game, for example, it may be easier to measure how well an agent does than to write down the correct move for every possible board.

Imagine trying many candidate networks, keeping more copies of the ones that score better, and making small random changes before trying again. This gives us two ideas: selection, which favors better-performing candidates, and mutation, which creates variations through random changes. This approach was inspired in part by biological evolution. To understand the analogy, let’s first look at natural selection in living populations.

In a population, individuals are not all exactly alike. Some differences can be inherited by the next generation.

Consider the peppered moth in Britain. Before industrial pollution, many tree trunks were pale with lichen, and light-colored moths were harder for birds to spot. Dark moths also existed, but they were easier to see in that setting. On average, more light moths survived long enough to reproduce, so the light form remained common.

As industrial soot darkened many tree trunks and lichens became scarce, the advantage changed. Dark moths were now harder for birds to see. They survived and reproduced more often, so the dark form became more common over generations. When pollution later fell and tree surfaces became lighter again, the advantage shifted back.

The moths did not change color because they knew the trees were changing. Mutations create variations without knowing whether they will be useful. The environment affects which inherited variations are more likely to leave offspring. Natural selection changes the proportions in a population over generations; it does not transform one individual during its lifetime.

Sometimes an environment changes so severely that a population cannot recover, and a lineage disappears. Around sixty-six million years ago, the asteroid impact was followed by the extinction of all non-bird dinosaurs, while birds survived as a dinosaur lineage. Evolution has no promise that the best-suited group will always survive. Chance and the speed of environmental change matter too.

An algorithm can use a simplified version of this pattern. It does not reproduce living organisms. It keeps a population of candidate neural networks, evaluates how well they perform, and uses that score to decide which candidates are more likely to contribute to the next generation. This family of methods is called neuroevolution.

Let’s use a small Snake game. Each network receives a simple description of the board: where the food is, where danger is, and which way the snake is moving. It produces scores for actions such as going straight, turning left, or turning right. The game follows the selected action.

Start with many networks whose weights are different. Most may quickly hit a wall or their own body. A few may survive longer or collect an apple by chance. After each game, calculate a fitness score. For example, eating apples can raise the score and crashing can lower it. The game supplies a score for the whole attempt; the trainer does not need to label every board with a perfect move.

Select several of the higher-scoring networks. Copy their settings, then randomly change a few weights. That random change is a mutation. Some algorithms can also mutate the structure by adding a connection or a neuron. Mutations do not know which direction is better: a change can help, do nothing, or make the next snake worse.

Now let the new group play again. Score them, select some of the stronger candidates, copy and mutate, and repeat. A generation means one round of evaluating a population and creating the next one. If we evaluate each network across several games or starting boards, we are less likely to select a lucky one-game result.

Over generations, changes that tend to earn better scores are more likely to be copied. That is the part inspired by natural selection. The game designer still decides what “better” means by choosing the fitness score. A poorly chosen score can teach the network an unwanted trick, and success in Snake does not mean general intelligence.

Neuroevolution is different from the supervised training we just saw. Supervised learning compares each input with a supplied target answer and uses gradients to adjust weights. Neuroevolution compares whole candidates by their task score and uses selection and mutation to search for better candidates. Some methods evolve only weights; others can also evolve connections or network structure. It is one way to train a network, not the way every modern network or LLM is trained.

We’ve now seen how neural networks can learn to solve a defined task—from classifying a color to learning a game through repeated trials.

But modern language models seem to go much further. With a text prompt, they can explain an idea, compare options, write a message, or lay out a plan. How can one model respond to so many different requests? What is happening inside when it appears to understand, reason, or plan—and where are the limits?

We’ll explore that next. If this video helped you see how neural networks learn, please like the video and subscribe.

## Research notes — not spoken

- Neural-network origins, weights, bias, activation, layers, and training overview: IBM Think, [What is a neural network?](https://www.ibm.com/think/topics/neural-networks).
- Supervised learning with labelled input-answer examples, prediction comparison, loss and parameter updates: IBM Think, [What is supervised learning?](https://www.ibm.com/think/topics/supervised-learning); scikit-learn, [Neural network models: supervised learning](https://scikit-learn.org/stable/modules/neural_networks_supervised.html).
- Backpropagation and gradient calculation: Michael Nielsen, [Neural Networks and Deep Learning, Chapter 2](http://neuralnetworksanddeeplearning.com/chap2.html).
- Neuroevolution, population fitness, selection, mutation, and evolving weights or structure: Lehman and Miikkulainen, [Neuroevolution](http://www.scholarpedia.org/article/Neuroevolution); Stanley and Miikkulainen, [Evolving Neural Networks through Augmenting Topologies](https://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf).
- Natural selection, environmental fit, reproduction, extinction, and the limits of “survival of the fittest”: Natural History Museum, [What is natural selection?](https://www.nhm.ac.uk/discover/what-is-natural-selection.html).
- Peppered-moth color variation and how pollution altered camouflage: Oxford University Museum of Natural History, [Peppered Moth natural selection experiments](https://learningzone.oumnh.ox.ac.uk/peppered-moth-natural-selection-experiments).
- End-Cretaceous extinction: non-bird dinosaurs died out, while birds survived as a dinosaur lineage: Natural History Museum, [How an asteroid ended the age of the dinosaurs](https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html).
