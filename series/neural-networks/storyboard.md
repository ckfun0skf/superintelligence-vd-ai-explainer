# Part 02 storyboard — narration → visual

Each visual change starts on the word in **bold** (timings come from `src/timing-data.js`).

## Chapter 1 — The core idea

| Narration | On screen |
|---|---|
| What is the most important thing inside AI? | The question is typed into a chat composer and **sent**. |
| There **isn't one answer** for every kind of AI. | Four equal tiles pop in: Rules, Search, Statistics, Neural network. |
| But one of the **central engines** behind modern **generative AI** is the **neural network**. | Other tiles fade; the neural-network tile grows, labelled "one central engine", wired to Text / Images / Voice. |
| The name can sound **mysterious**. | The network is wrapped in a purple haze of floating question marks. |
| A neural network is a **mathematical system**: | The haze clears; nodes show ×+ and Σ. |
| **numbers go in**, **calculations transform** them, and **numbers come out**. | 0.8 / 0.3 / 0.5 slide into the inputs; pulses run through, middle values appear; 0.71 pops out. |
| Training changes the **adjustable values** inside those calculations. | Dials appear on the wires and turn; the output number changes with them. |
| …a simplified mathematical model **inspired by** a **biological neuron**. | A biological neuron draws itself, then a simplified model appears beside it with an "inspired by" arrow; labels pair dendrites/cell body/axon with inputs/combine/output. |
| In **1943**, **McCulloch and Pitts** described one such model. | Timeline to 1943; portrait frames of **McCulloch** (left) and **Pitts** (right) appear as each name is spoken; their threshold unit flips inputs on/off and fires 1 only when ≥2 are on. |
| In **1958**, **Rosenblatt** introduced the **perceptron**… **learn to separate patterns**. | Timeline to 1958; Mark I photo; a two-feature plot runs the real perceptron rule: each misclassified point is ringed, the dividing line and shaded regions update, the mistake count falls to 0. |
| These were **not tiny copies of a brain**. | Brain ≠ unit; a tiny brain inside the unit gets crossed out. |
| They were **building blocks** for a new kind of calculation. | Scattered units fly together into a layered network. |
| …let's **follow one number** at a time. | One wire carries a 0.8 chip into a single large neuron (hand-off to Ch 2). |

## Chapter 2 — One neuron

| Narration | On screen |
|---|---|
| Imagine one **grey color swatch on a screen**… **light or dark**. | A large monitor fills the centre with the grey swatch; LIGHT and DARK pills appear. |
| …three values: **red, green, and blue**. | The swatch zooms into its red/green/blue sub-pixels; as each colour is named, its light flies out into its own channel bar. |
| Each usually ranges from **zero to 255**… **rescale between zero and one**. | 0/255 scale labels; then 0/1 labels. |
| …**204** becomes about **0.8**. | A marker at 204 on the red bar; "204 ÷ 255 ≈ 0.8". |
| **red is 0.8, green is 0.8, and blue is 0.8**. | Each bar fills to 0.8 exactly as it is spoken. |
| Those three values **enter one artificial neuron**. | Coloured pulses travel along wires into the neuron. |
| The neuron is **not thinking**… It performs a **calculation**. | A "Hmm, pretty light…" thought bubble is crossed out; Σ appears. |
| Each input is **multiplied by a weight**… **how strongly** an input contributes. | A ×w box on the red wire; the dial swings and the wire thickens/thins; "0.8 × 1.6 = 1.28" updates live. |
| Imagine a **small dial** on each channel… set all three weights **to one**. | Dials on all three wires; they snap to ×1.0. |
| **0.8, plus 0.8, plus 0.8** … **2.4**. | A score meter stacks red, green, blue segments on each "0.8"; score chip 2.4. |
| Next comes the **bias**… **added to the total**. | A violet bias chip connects from below ("not an input"). |
| …**shifting the point** at which the system **begins to lean**… | The tipping point stays fixed at 0; the bias chip swings up and down and moves the whole stack with it, so the stack crosses the line and "leans LIGHT / leans DARK" flips. |
| set the bias to **minus 1.5**… **2.4 − 1.5** gives **0.9**. | The stack slides down by 1.5 (a violet ghost shows the part removed); score reads 0.9, still above 0. |
| That score is **not yet a probability**. | "0.9 ≠ a probability". |
| An **activation function**… **sigmoid**… **no equation**… **soft gate**. | Chart opens; S-curve draws; a formula appears crossed out; five scores (−5…5) drop onto the curve and slide to values between 0 and 1. |
| 0.9 becomes about **0.71**… **71% light**… **29% dark**. | 0.9 rises to the curve and across to 0.71; a LIGHT 71% / DARK 29% bar fills. |
| These numbers are **only an example**… | "Example numbers — not from a real AI model". |
| Now try a **dark grey** swatch… **0.2**… **−0.9**… **29% light, 71% dark**. | Camera pulls back; swatch darkens; bars fall to 0.2; meter, curve and probability bar update. |
| So one neuron takes **three values**, **scales their influence**, **adds an offset**, **produces a result**… each has a **specific job**. | The calculation replays: the three values travel in again; the dials swing and the wires thicken/thin; the bias chip pulses and the removed part of the stack lights up; the probability bar refills. Labels appear in sync. |
| …easy task on **one pixel**… **understand an image**… several neurons **connected**. | Zoom out from one pixel to a whole pixel-art landscape; "One neuron ≠ understanding an image"; a 3×3 patch feeds a small network. |

## Chapter 3 — Layers

| Narration | On screen |
|---|---|
| Replace the single swatch with a **tiny image patch**… **several pixels**. | The swatch splits into a 3×3 patch. |
| Each pixel has its **own red, green, and blue** values. | Mini RGB bars appear in each pixel. |
| …**many more numbers** than one color. | "9 pixels × 3 = 27 numbers"; 27 coloured chips fly into a column. |
| A **layer** is a group of neurons at the **same stage**. | Layer 1 (4 neurons) appears in a dashed box. |
| Each neuron **receives numbers**, applies its **own weights** and **bias**, **produces an output**. | One neuron is ringed; all 27 inputs light into it; its own dials, bias chip and output value appear. |
| …**respond differently** because their adjustable values are different. | Each neuron gets different dial settings and different outputs. |
| The collection of outputs… becomes **the input to the next**. | Layer 2 appears; pulses flow forward. |
| The **first** / **middle** / **later** layer… | Each stage highlights in turn; layer 3 produces a RESULT. |
| …a **hidden layer**… not a **secret thought**… **between** input and output. | "HIDDEN LAYER"; a "secret thoughts?" bubble is crossed out; INPUT ← between → OUTPUT. |
| …classify a patch as **stripe or plain**. | The patch becomes stripes → STRIPE; then uniform → PLAIN. |
| Intermediate units respond to **simple arrangements**… | Tags "dark column?", "light column?", "contrast?" on middle units. |
| **Those labels** help us… Real networks have no **guaranteed job titles**. | "labels WE added"; then the tags peel off and fall; a much bigger network fades in behind, and each unit shows a mixed response profile across stripe/diagonal/dot/edge patterns. |
| …**the activation function**. | A small bend symbol appears inside every neuron. |
| If every layer only **added and multiplied**… **one larger, simple calculation**. | Three straight-line graphs → "all stacked" = still a straight line. |
| An activation function **changes that**… **more varied patterns**. | Each graph gets a bend; the stacked result becomes a varied shape. |
| …separate two groups with **one straight line**… **simple split**. | Scatter plot; a straight line splits it ✓. |
| …when the pattern **bends**… **several parts**… **flexible boundary**. | Points rearrange into a centre + ring; the line flails ✗; a closed curved boundary draws ✓. |
| A layer is **not automatically smarter**… **a way to combine**… **More layers**… **transform**… **still need to be trained**. | The untrained output flickers "STRIPE? / PLAIN?" (just guessing); signals flow through as combined calculations; | Network returns; extra layers slot in with data patches changing per stage; every neuron gets a spinning dial: "still need to be trained". |

## Chapter 4 — Learning from examples

| Narration | On screen |
|---|---|
| …chosen the weights and bias **by hand**. | A cursor turns dials one by one. |
| A real network has **many adjustable values**. Training is **finding settings**… | A wall of ~200 dials, jittering, then settling; "answers we want ✓". |
| …people first **prepare examples**… **input**… **answer**. | Two people sort a pile of colour swatches into LIGHT and DARK baskets; then an example card: swatch (INPUT) → label (ANSWER). |
| **pale grey → light**; **dark blue → dark**; **labelled training set**. | Cards appear as spoken; eight cards form the set. |
| **consistent rule**… **agree on what counts**. | Cards slide onto a dark→bright axis; an "agreed rule" line; people ✓. |
| The network **does not know that rule**… only receives **examples and answers**. | A "?" network; the rule is blocked; cards fly into the network. |
| …weights may be **random or unhelpful**. | Every dial spins to a random setting. |
| …pass **only its color values** into the network. | Swatch → 0.8/0.8/0.8 into R/G/B; its answer stays aside face-down. |
| …**prediction**… **20%** light… **80%** dark. | Forward pulses; prediction bars 20% / 80%. |
| …**reveal** the answer: **light**. | The answer card flips to LIGHT. |
| …**compares**… **loss is large**. | Dashed target bar "LIGHT = 100%"; red gap; big loss meter. |
| Loss measures the mismatch… not a score for **truth**, **usefulness**, **intelligence**. | "mismatch on this example"; three crossed-out chips. |
| …**supervised training**… not discovering whether the label is **objectively true**… **adjusted to match**. | Answer arrow to target; "Is it REALLY light?" bubble crossed out; dials nudge. |
| **quality and coverage**… **inconsistent**… **leave out important cases**… **biased rule**. | Same grey labelled LIGHT and DARK; colour strip with an uncovered gap; "→ incomplete or biased rule". |
| **Which weights**… **which direction**? | "?" on every dial. |
| **Backpropagation** calculates how **sensitive** the loss is… | One weight is wiggled and the loss bar jumps ("loss reacts a lot"); another is wiggled and the loss barely moves. |
| …works **backward**… **tracing**… | Red pulses run back from the output; links turn red, thicker where more blame flows, output side first, then earlier layers. |
| …**chain rule**… **assigns each parameter** a measure of how it contributed… | Chain-link icons; then each dial receives a red blame bar with its number (0.42, 0.10…), output side first. |
| …**called gradients**. | The blame bars become signed arrows (+0.42 ↑ / −0.10 ↓): gradient = how much and which way. |
| …**slightly up or down**… **reduce the loss**? | Callout: one dial wiggles; "up → loss falls ✓ / down → loss rises ✗". |
| An **optimizer**… **update**… **usually small**. | All dials turn a little in their arrow's direction. |
| …**same color again**… may **rise closer**… not **100%** in one try. | Forward again; LIGHT 20% → 31%; loss shrinks; a dashed 100% ghost "in one step? ✗". |
| **Predict, compare, loss, gradients, update**… **training loop**. | Five-step loop lights up word by word, then cycles; the current example (light or dark swatch, its answer, and the network's probability) sits in the centre; a chart plots the probability given to the correct answer for each example: up and down, trending up. |
| …**many examples**, **batches**, **many passes**. | A conveyor of examples, grouped into batches; "pass N over the training set". |
| One example does **not install a permanent fact**… **gradually**… | "PERMANENT FACT" stamp crossed out; a dip in the chart is marked "sometimes worse"; dashed trend line ↗. |
| …examples **held aside**… **memorized**… **pattern that carries over**. | Practice set vs locked held-aside box; memorized: 100% / 52% ✗; learned: 96% / 94% ✓. |
| …**cannot guarantee** every real situation. | Shadowed, glared, gradient and in-between swatches with "?". |
| …a **category**… a **number**, **sequence of words**, **something else**… **recipe depends**. | Four target cards appear in spoken order. |
| …the **next word in the text** can provide the target… **no human** writes it. | "The cat sat on the warm mat ." — input window + next-word target slides along; a crossed-out person. |

## Chapter 5 — Evolution and neuroevolution

| Narration | On screen |
|---|---|
| **We have just seen**… **examples with answers**, **measure how far**, **use gradients**. | Three recap cards in sync (the first on the opening words). |
| But labelled answers are **not always available**. | "answer: ???" |
| In a game… **measure how well**… vs **correct move for every board**. | A playing snake with a live score ✓ vs a grid of boards each marked "?". |
| …**many candidate networks**, **keeping more copies** of better ones, **small random changes**, **trying again**. | Gen 1: eight networks with score bars sort by score; the top three glow and are copied down into gen 2 (more copies for the best); the copies get amber mutation sparks; gen 2 plays and scores. |
| **selection**… **mutation**… **biological evolution**. | A funnel lets only the best (green) dots through; a network with one flickering changed link and a rolling die; a turning DNA helix. |
| …individuals are **not all alike**… differences **inherited**. | Twelve moths of varied shade; a parent with similar-shaded offspring. |
| **Peppered moth**… **pale with lichen**… light moths hard to spot… **dark moths easier to see**. | Lichen-covered trunk; light moths blend in; a bird targets a dark moth. |
| **more light moths survived**… | Population bar stays ~90% light. |
| **soot darkened** the trunks… **dark moths now harder to see**… **more common over generations**. | Factory smoke; bark darkens; bird targets a light moth; generation counter runs; bar shifts to ~90% dark; moths on the trunk turn dark. |
| **pollution later fell**… **shifted back**. | Bark lightens; proportions swing back. |
| …did not change color because they **knew**. | "Trees got dark — I'll turn dark!" bubble crossed out. |
| **Mutations create variations** without knowing… **environment** affects… **offspring**. | A die rolls; random-shade offspring; on dark bark the light ones drop out. |
| …changes the **proportions**… does **not transform one individual**. | Gen 1/2/3 rows shift from light to dark; one boxed moth keeps its colour. |
| …a **lineage disappears**. | A lineage tree: one branch ends ✗, another continues. |
| **66 million years ago**… **asteroid**… **extinction**… **birds survived**. | Asteroid streak, impact flash, dinosaurs fade, a bird remains. |
| **no promise**… **chance** and **speed** of change. | Ghosts of the dinosaurs under a crown ("well suited for 100+ million years"); "best-suited ≠ guaranteed survival"; a spinning die (chance) and a racing clock (speed). |
| An **algorithm**… **not living organisms**… **population**… **evaluates**… **next generation**… **neuroevolution**. | Ten moths spin and shrink into ten candidate networks; a crossed-out moth (not organisms); score bars; an arrow to the next generation. |
| **Snake**… **food**, **danger**, **heading**… **straight, left, right**… **game follows**. | A live game; input chips light in spoken order; output score bars; the top action is taken each step. |
| **many networks**… **most hit a wall**… **a few** survive or eat… **fitness score**… **apples raise**, **crashing lowers**… **whole attempt**. | Twelve games play at once; most crash (red ✗); a few eat apples; one score per game; legend +10 / −5. |
| **Select**… **copy**… **randomly change a few weights**… **add a connection or neuron**. | High-scoring parent → copy; amber rings on changed weights; a new connection and neuron draw in. |
| Mutations **don't know** which direction: **help**, **nothing**, **worse**. | Three outcome chips ↑ = ↓. |
| **play again**… **score**, **select**, **copy and mutate**, **repeat**… **generation**… **several games**… **lucky**. | PLAY → SCORE → SELECT → COPY+MUTATE loop with a generation counter; one network on 3 boards scores 31/2/3 → "the first game was just luck". |
| **Over generations**… better scores copied more often. | Best-score-per-generation curve climbs. |
| The **game designer** decides what **better** means… **poorly chosen score**… **unwanted trick**… not **general intelligence**. | A person and "fitness = apples eaten" → "fitness = time alive ?"; a snake circles forever without eating; "good at Snake ≠ general intelligence". |
| **Supervised** vs **neuroevolution**… **weights only** / **structure**… **not how every LLM** is trained. | Side-by-side cards fill in as spoken, each row with a small moving icon (swatch→label, pulsing mismatch bar, turning dial / mini boards, score bars, rolling die); chips; caveat. |
| …from **classifying a color** to **learning a game**. | Swatch → snake board. |
| **language models**… **explain**, **compare**, **write**, **plan**. | A chat window; four request chips pop in as spoken around a "?" model. |
| **How can one model** respond to so many requests? | Ten different requests orbit one model, each linked to it. |
| What's happening **inside** when it appears to **understand**, **reason**, **plan**? | The "?" opens to reveal a pulsing network inside; understand? / reason? / plan? tags pop on each word. |
| **Where are the limits**? | A dashed boundary closes around the model; some requests end up outside it, flickering red. |
| **We'll explore that next**… **like** and **subscribe**. | The camera dives into the model; "NEXT: inside a language model"; the Like button is tapped (Liked) and Subscribe flips to Subscribed ✓. |

## On-screen text policy

Headings and captions that only repeated the narration were removed (`hush(...)` near the end of each
chapter's setup). Kept on screen: things the eye needs to read the picture — numbers and values,
axis/legend labels, LIGHT/DARK answers, R/G/B, names and dates, request chips, and short tags
whose wording is itself the point (e.g. "fitness = time alive ?"). The Chapter 5 DNA is a
projected 3D double helix that rotates about its axis.

## Continuity (round 4)

- Ch1→Ch2: the 0.8 chip and wire from Chapter 1's last frame carry over and melt into the screen.
- Ch2 ending: the highlighted image pixel lifts out and grows into one large grey swatch; the small network
  fades, leaving exactly the square that Chapter 3 opens with.
- Ch3→Ch4: Chapter 3's final network rearranges into Chapter 4's 3→4→2 network; R/G/B colours, links and
  dials fade in.
- Ch4 "many adjustable values": the network's dials fly out into a wall of ~200 spinning dials, which slow
  and settle on "finding settings", then fly back into the network.
- Ch2 spotlights follow the words ("weights / bias / activation", "29% light / 71% dark").
- Ch3: picture icons for the middle units (dark column, light column, dark→light edge); the stacked graph
  curls into a closed loop; the boundary plot is driven by a network on its left: x,y → one output gives the
  straight line, then six coloured hidden units each add one straight cut that together form the curve.
- Ch1 portraits now use the supplied photos of McCulloch and Pitts.
