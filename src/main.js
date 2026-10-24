import * as THREE from 'three';
import './style.css';

const stage = document.querySelector('#stage');
const canvas = document.querySelector('#scene-canvas');
const audio = document.querySelector('#preview-audio');
const previewColumn = document.querySelector('.preview-column');
const sceneOne = document.querySelector('#scene-one');
const tokenStory = document.querySelector('#token-story');
const playButton = document.querySelector('#play-button');
const playLabel = document.querySelector('#play-label');
const playGlyph = document.querySelector('#play-glyph');
const fullscreenButton = document.querySelector('#fullscreen-button');
const fullscreenLabel = document.querySelector('#fullscreen-label');
const timeline = document.querySelector('#timeline');
const chapterToggle = document.querySelector('#chapter-toggle');
const chapterNav = document.querySelector('#chapter-nav');
const playerControls = document.querySelector('.player-controls');
const fullscreenOrientationHint = document.querySelector('#fullscreen-orientation-hint');
const chapterButtons = [...document.querySelectorAll('.chapter-button')];
const currentTimeReadout = document.querySelector('#current-time');
const totalTimeReadout = document.querySelector('#total-time');
const assistantCard = document.querySelector('#assistant-card');
const assistantHeader = document.querySelector('#assistant-header');
const conversation = document.querySelector('#conversation');
const userMessage = document.querySelector('#user-message');
const promptText = document.querySelector('#prompt-text');
const composer = document.querySelector('#composer');
const composerPlaceholder = document.querySelector('#composer-placeholder');
const composerPrompt = document.querySelector('#composer-prompt');
const cursor = document.querySelector('#typing-cursor');
const composerSend = document.querySelector('#composer-send');
const aiWorking = document.querySelector('#ai-working');
const thinkingOrb = document.querySelector('#thinking-orb');
const answerMessage = document.querySelector('#answer-message');
const answerMapRoute = document.querySelector('#answer-map-route');
const answerMapSignal = document.querySelector('#answer-map-signal');
const answerMapRouteLength = answerMapRoute.getTotalLength();
const dayOne = document.querySelector('#day-one');
const dayTwo = document.querySelector('#day-two');
const answerFootnote = document.querySelector('#answer-footnote');
const toolDock = document.querySelector('#tool-dock');
const reviewCaption = document.querySelector('#review-caption');
const zoomPrompt = document.querySelector('#zoom-prompt');
const tokenField = document.querySelector('#token-field');
const categoryRack = document.querySelector('#category-rack');
const flightLayer = document.querySelector('#flight-layer');
const tokenParticleGlow = document.querySelector('#token-particle-glow');
const contextStory = document.querySelector('#context-story');
const contextLines = document.querySelector('#context-lines');
const typoLines = document.querySelector('#typo-lines');
const modelLines = document.querySelector('#model-lines');
const contextCore = document.querySelector('#context-core');
const contextLabel = document.querySelector('#context-label');
const attentionFocus = document.querySelector('#attention-focus');
const typoScene = document.querySelector('#typo-scene');
const typoSource = document.querySelector('#typo-source');
const likelyReading = document.querySelector('#likely-reading');
const meaningOptions = document.querySelector('#meaning-options');
const clarificationCard = document.querySelector('#clarification-card');
const meaningLikelyMeter = document.querySelector('#meaning-likely-meter');
const meaningOtherMeter = document.querySelector('#meaning-other-meter');
const modelStory = document.querySelector('#model-story');
const llmPrompt = document.querySelector('#llm-prompt');
const llmNetwork = document.querySelector('#llm-network');
const neuralWires = document.querySelector('#neural-wires');
const llmCandidates = document.querySelector('#llm-candidates');
const llmResponse = document.querySelector('#llm-response');
const llmContextReturn = document.querySelector('#llm-context-return');
const llmCache = document.querySelector('#llm-cache');
const llmStoredAnswer = document.querySelector('#llm-stored-answer');
const storedAnswerStrike = document.querySelector('.stored-answer-strike');
const llmPatterns = document.querySelector('#llm-patterns');
const llmExternal = document.querySelector('#llm-external');
const externalMapRoute = document.querySelector('#external-map-route');
const externalMapSignal = document.querySelector('#external-map-signal');
const externalMapRouteLength = externalMapRoute.getTotalLength();
const calendarDays = [...document.querySelectorAll('#calendar-mini-grid i')];
const toolOriginStory = document.querySelector('#tool-origin-story');
const originModel = document.querySelector('#origin-model');
const modelLiveNeed = document.querySelector('#model-live-need');
const builderBadge = document.querySelector('#builder-badge');
const aiProductBoundary = document.querySelector('#ai-product-boundary');
const mapToolDefinition = document.querySelector('#map-tool-definition');
const bookingApproval = document.querySelector('#booking-approval');
const externalServiceCluster = document.querySelector('#external-service-cluster');
const unavailableTool = document.querySelector('#unavailable-tool');
const accessLock = document.querySelector('#access-lock');
const toolOriginLineSvg = document.querySelector('#tool-origin-lines');
const originToolCards = [...document.querySelectorAll('.origin-tool-card')];
const serviceOrbs = [...document.querySelectorAll('.service-orb')];
const toolCallStory = document.querySelector('#tool-call-story');
const callNeed = document.querySelector('#call-need');
const callModel = document.querySelector('#call-model');
const callCatalog = document.querySelector('#call-catalog');
const callToolCards = [...document.querySelectorAll('.call-tool-card')];
const callMapCard = document.querySelector('#call-map-card');
const callRouteMap = document.querySelector('#call-route-map');
const callRoutePath = document.querySelector('#call-route-path');
const callRouteSignal = document.querySelector('#call-route-signal');
const callRouteLength = callRoutePath.getTotalLength();
const callGuidance = document.querySelector('#call-guidance');
const callRequest = document.querySelector('#call-request');
const callOrchestrator = document.querySelector('#call-orchestrator');
const callMapService = document.querySelector('#call-map-service');
const callMapLoading = document.querySelector('#call-map-loading');
const callResult = document.querySelector('#call-result');
const callContext = document.querySelector('#call-context');
const callContextPulse = document.querySelector('.context-pulse');
const callResponse = document.querySelector('#call-response');
const callResponseText = document.querySelector('#call-response-text');
const callCautions = document.querySelector('#call-cautions');
const callLinesSvg = document.querySelector('#tool-call-lines');
const learningStory = document.querySelector('#learning-story');
const learningLines = document.querySelector('#learning-lines');
const trainingCorpus = document.querySelector('#training-corpus');
const trainingModel = document.querySelector('#training-model');
const trainingNetwork = document.querySelector('#training-network');
const trainingNetworkWires = document.querySelector('#training-network-wires');
const trainingPrediction = document.querySelector('#training-prediction');
const trainingPredictionWord = document.querySelector('#training-prediction-word');
const trainingTargetWord = document.querySelector('#training-target-word');
const trainingTarget = document.querySelector('#training-target');
const trainingCompare = document.querySelector('#training-compare');
const trainingCompareLabel = document.querySelector('#training-compare-label');
const trainingCompareResult = document.querySelector('#training-compare-result');
const trainingBudgetMeter = document.querySelector('#training-budget-meter');
const trainingGuessFill = document.querySelector('#training-guess-fill');
const trainingTargetFill = document.querySelector('#training-target-fill');
const trainingGuessAmount = document.querySelector('#training-guess-amount');
const trainingParameters = document.querySelector('#training-parameters');
const trainingUpdate = document.querySelector('#training-update');
const trainingInstruction = document.querySelector('#training-instruction');
const trainingPreference = document.querySelector('#training-preference');
const trainingToolExample = document.querySelector('#training-tool-example');
const trainingMapRoute = document.querySelector('#training-map-route');
const trainingMapSignal = document.querySelector('#training-map-signal');
const trainingMapRouteLength = trainingMapRoute.getTotalLength();
const trainingExampleSlot = document.querySelector('#training-example-slot');
const trainingLibrary = document.querySelector('#training-library');
const trainingCautions = document.querySelector('#training-cautions');
const trainingCautionCards = [...document.querySelectorAll('.training-caution')];
const trainingCautionPaths = trainingCautionCards.map((card) => card.querySelector('.caution-motion-path'));
const trainingCautionSignals = trainingCautionCards.map((card) => card.querySelector('.caution-signal'));
const trainingCautionPathLengths = trainingCautionPaths.map((path) => path.getTotalLength());
const trainingGenerated = document.querySelector('#training-generated');
const trainingDials = [...document.querySelectorAll('.parameter-dial')];
const trainingNeurons = [...document.querySelectorAll('.training-layer i')];
const consistencyStory = document.querySelector('#consistency-story');
const consistencyLines = document.querySelector('#consistency-lines');
const consistencyPrompt = document.querySelector('#consistency-prompt');
const contextAdditions = document.querySelector('#context-additions');
const consistencyModel = document.querySelector('#consistency-model');
const decodingCard = document.querySelector('#decoding-card');
const candidateChoice = document.querySelector('.candidate-choice');
const variationControl = document.querySelector('#variation-control');
const variationNeedle = document.querySelector('#variation-needle');
const answerBranchA = document.querySelector('#answer-branch-a');
const answerBranchB = document.querySelector('#answer-branch-b');
const branchChoiceTokens = [...document.querySelectorAll('.branch-choice-token')];
const branchRoutePaths = [document.querySelector('#branch-route-a'), document.querySelector('#branch-route-b')];
const branchRouteSignals = [document.querySelector('#branch-signal-a'), document.querySelector('#branch-signal-b')];
const branchRouteLengths = branchRoutePaths.map((path) => path.getTotalLength());
const consequenceRow = document.querySelector('#consequence-row');
const consequenceCards = [...document.querySelectorAll('.consistency-consequence')];
const consequenceMotionPaths = consequenceCards.map((card) => card.querySelector('.consequence-motion-path'));
const consequenceSignals = consequenceCards.map((card) => card.querySelector('.consequence-signal'));
const consequencePathLengths = consequenceMotionPaths.map((path) => path.getTotalLength());
const reliabilityCard = document.querySelector('#reliability-card');
const endingReflection = document.querySelector('#ending-reflection');
const endingNodes = [...document.querySelectorAll('.ending-node')];
const endingFlowPaths = [...document.querySelectorAll('.ending-flow-path')];
const endingFlowSignals = [...document.querySelectorAll('.ending-flow-signal')];
const endingFlowLengths = endingFlowPaths.map((path) => path.getTotalLength());

const SECTION_SIX_START = 227.866;
const SECTION_SIX_NARRATION_START = 229.366;
const SECTION_SIX_NARRATION_DURATION = 75.84;
const SECTION_SEVEN_START = SECTION_SIX_NARRATION_START + SECTION_SIX_NARRATION_DURATION;
const SECTION_SEVEN_NARRATION_START = SECTION_SEVEN_START + 1.5;
const SECTION_SEVEN_NARRATION_DURATION = 65.32;
const SECTION_EIGHT_START = SECTION_SEVEN_NARRATION_START + SECTION_SEVEN_NARRATION_DURATION;
const SECTION_EIGHT_NARRATION_START = SECTION_EIGHT_START + 1.5;
const SECTION_EIGHT_MAIN_NARRATION_DURATION = 74.28;
const SECTION_EIGHT_OUTRO_DURATION = 18.92;
const SECTION_EIGHT_OUTRO_START = SECTION_EIGHT_NARRATION_START + SECTION_EIGHT_MAIN_NARRATION_DURATION;
const SECTION_EIGHT_NARRATION_DURATION = SECTION_EIGHT_MAIN_NARRATION_DURATION + SECTION_EIGHT_OUTRO_DURATION;
const DURATION = SECTION_EIGHT_NARRATION_START + SECTION_EIGHT_NARRATION_DURATION;
const FPS = 24;
const SECTION_TWO_START = 24.4;
const SECTION_TWO_DURATION = 31.2;
const SECTION_THREE_START = 55.6;
const SECTION_FOUR_START = 110.0;
const SECTION_FIVE_START = 177.38;
const SECTION_FIVE_NARRATION_START = 178.88;
const PROMPT_TRANSITION_START = 23.8;
const TOKENIZE_START = 3.0;
const TOKEN_COPY_STAGGER = 0.16;
const TOKEN_COPY_DURATION = 0.6;
const PROMPT = 'Plan a two-day weekend in Taipei. My budget is eight thousand dollars, and I love nature.';
const CAPTIONS = [
  { start: 1.5, end: 4.0, text: 'Imagine typing this into an AI assistant.' },
  { start: 4.0, end: 6.6, text: 'Plan a two-day weekend in Taipei.' },
  { start: 6.6, end: 10.0, text: 'My budget is eight thousand dollars, and I love nature.' },
  { start: 10.0, end: 12.9, text: 'The assistant replies with an itinerary.' },
  { start: 12.9, end: 16.6, text: 'A simple exchange—but how did those words become an answer?' },
  { start: 16.6, end: 21.2, text: 'And if the assistant can do more than answer, how does it know when to use a tool?' },
  { start: 21.2, end: 24.4, text: "Let's follow the request, one step at a time." },
  { start: 24.4, end: 29.9, text: 'A language model does not usually process a sentence as one complete object.' },
  { start: 29.9, end: 34.5, text: 'A tokenizer breaks the text into smaller pieces called tokens.' },
  { start: 34.5, end: 40.5, text: 'A token might be a whole word, part of a word, punctuation, or another piece of text.' },
  { start: 40.5, end: 44.0, text: 'The exact pieces depend on the tokenizer and the language.' },
  { start: 44.0, end: 48.9, text: 'The tokens are then represented as numbers, so the model can work with them.' },
  { start: 48.9, end: 55.6, text: 'Tokens are building blocks for processing text, but a token is not by itself a complete idea.' },
  { start: 55.6, end: 58.3, text: 'The model has to use the pieces together.' },
  { start: 58.3, end: 68.4, text: 'In our example, two-day is about duration, Taipei gives a location, eight thousand sets a budget, and nature expresses a preference.' },
  { start: 68.4, end: 73.6, text: 'Modern language models use patterns in context to work out how the pieces relate.' },
  { start: 73.6, end: 80.8, text: 'Many use a design called a Transformer, whose attention mechanism helps weigh relationships between different parts of the input.' },
  { start: 80.8, end: 85.7, text: 'This is also why an AI can often make sense of a typo or imperfect grammar.' },
  { start: 85.7, end: 93.0, text: 'If you write, “Find me a quite place near Taipei,” the surrounding words make “quiet place” a likely meaning.' },
  { start: 93.0, end: 97.3, text: 'The model uses context and language patterns to infer what you may intend.' },
  { start: 97.3, end: 104.5, text: 'It does not need to perfectly correct the sentence first, but it is making a best-fit guess, not reading your mind.' },
  { start: 104.5, end: 109.8, text: 'If the context is unclear, it may guess wrong, so it should ask when the distinction matters.' },
  { start: 111.8, end: 121.36, text: 'A large language model, or LLM, is a neural network trained to recognize patterns in sequences of tokens and generate likely continuations.' },
  { start: 121.36, end: 126.1, text: 'When it writes a response, it generally predicts one token at a time.' },
  { start: 126.1, end: 130.3, text: 'For each step, it calculates which next tokens are plausible.' },
  { start: 130.3, end: 135.48, text: 'A decoding process selects one, and that token is added to the growing sequence.' },
  { start: 135.48, end: 142.94, text: 'The next prediction uses the original prompt together with everything generated so far, not just the last token.' },
  { start: 142.94, end: 149.32, text: 'Repeated many times, this loop produces a sentence, an itinerary, or a longer answer.' },
  { start: 149.32, end: 158.36, text: 'Systems can use techniques such as caching to avoid recalculating all the earlier work from scratch, but conceptually, the context keeps growing.' },
  { start: 158.36, end: 163.52, text: 'So an LLM is not usually retrieving one perfect answer from a shelf.' },
  { start: 163.52, end: 168.76, text: 'It is generating a response based on learned patterns and the context it has received.' },
  { start: 168.76, end: 177.2, text: 'That can work well for many requests, but it does not automatically give the model current facts or the ability to interact with other services.' },
  { start: 179.24, end: 184.0, text: 'Suppose our itinerary needs current transit times or opening hours.' },
  { start: 184.0, end: 192.22, text: 'The model may not have reliable live information in the conversation, so the AI product can provide tools to help.' },
  { start: 192.22, end: 200.04, text: 'A tool is a separate piece of software: a map, a search service, a calendar, or a booking system.' },
  { start: 200.04, end: 210.3, text: 'The people who build the AI product decide which tools are available and define how each one works, what it can do, what information it needs,' },
  { start: 210.3, end: 211.6, text: 'and what result it returns.' },
  { start: 211.6, end: 214.48, text: 'They can also set rules about permission.' },
  { start: 214.48, end: 220.08, text: 'For example, a booking tool may require your approval before it confirms a reservation.' },
  { start: 220.08, end: 223.64, text: 'The model cannot call any tool it imagines.' },
  { start: 223.64, end: 227.56, text: 'It can choose only from the tools the application has made available.' },
  { start: 229.786, end: 230.706, text: 'How does it choose?' },
  { start: 230.706, end: 236.306, text: 'The model receives descriptions of the available tools and their expected inputs.' },
  { start: 236.306, end: 239.606, text: 'It compares those descriptions with the task.' },
  { start: 239.606, end: 247.926, text: 'If it has learned that a map tool can find routes, and the user asks for current transit options, that tool looks relevant.' },
  { start: 247.926, end: 255.946, text: "Training examples and the product's instructions can also teach the model what kinds of requests belong with which tools." },
  { start: 255.946, end: 264.306, text: 'The model then produces a structured tool request—for example, asking the map service for a route between two places.' },
  { start: 264.306, end: 271.066, text: 'The surrounding application, sometimes called the orchestrator, checks and executes that request.' },
  { start: 271.066, end: 274.686, text: 'The tool runs as software and returns its result.' },
  { start: 274.686, end: 279.226, text: 'That result is added to the conversation context as a new message.' },
  { start: 279.226, end: 287.826, text: 'The model then continues from the updated context, generating the next part of its reply—or, if needed, another tool request.' },
  { start: 287.826, end: 292.446, text: 'The model proposes the tool call; the application runs it.' },
  { start: 292.446, end: 294.166, text: 'This distinction matters.' },
  { start: 294.166, end: 304.966, text: 'Tool selection can be mistaken, tool results can be incomplete, and consequential actions—such as making a reservation—may require confirmation and permission.' },
  { start: 307.106, end: 308.906, text: 'These abilities come from training.' },
  { start: 308.906, end: 317.206, text: 'During pre-training, a model learns patterns from large collections of text, including how words and ideas tend to fit together.' },
  { start: 317.206, end: 321.906, text: 'In a common training approach, it practices predicting the next token.' },
  { start: 321.906, end: 327.906, text: 'When its prediction differs from the target, an optimization process adjusts the model’s parameters.' },
  { start: 327.906, end: 333.306, text: 'You can picture those parameters as an enormous set of adjustable numerical settings.' },
  { start: 333.306, end: 343.206, text: 'Training nudges them so the model becomes more likely to produce useful patterns in the right context, not by simply adding every training sentence to a searchable list.' },
  { start: 343.206, end: 351.606, text: 'A model may then be further trained on examples of instructions and helpful responses, and on preference signals that encourage desired behavior.' },
  { start: 351.606, end: 356.006, text: 'Some systems also train or tune models with examples of tool use.' },
  { start: 356.006, end: 358.006, text: 'The exact process varies.' },
  { start: 358.006, end: 361.906, text: 'The model is not simply a database containing every answer it has seen.' },
  { start: 361.906, end: 366.406, text: 'Training changes its parameters so it can produce useful patterns of response.' },
  { start: 366.406, end: 372.026, text: 'It can still misunderstand, make up details, or select an unsuitable tool.' },
  { start: 373.926, end: 376.626, text: 'The same prompt can lead to different answers.' },
  { start: 376.626, end: 386.726, text: 'Imagine asking for a two-day nature weekend in Taipei under eight thousand dollars.' },
  { start: 386.726, end: 391.926, text: 'At some steps, several next tokens are plausible.' },
  { start: 391.926, end: 394.826, text: 'A decoding method chooses among them.' },
  { start: 394.826, end: 405.726, text: 'When it samples, a small early change can steer what follows.' },
  { start: 405.726, end: 411.626, text: 'Temperature can make sampling more or less varied.' },
  { start: 411.626, end: 420.326, text: 'System instructions, earlier chat messages, live tool results, or a model update can also change the response.' },
  { start: 420.326, end: 425.226, text: 'The same visible message may not be the same complete input.' },
  { start: 425.226, end: 433.126, text: 'That makes answers harder to reproduce, compare, and trust.' },
  { start: 433.126, end: 439.326, text: 'Lower variation can improve consistency, but consistency is not accuracy.' },
  { start: 439.326, end: 447.806, text: 'Keep context and model version stable, check current information, and verify the result.' },
  { start: 448.206, end: 457.706, text: 'One question to carry forward: when an AI gives you a confident answer, what would you want to verify before acting on it?' },
  { start: 457.706, end: 466.406, text: 'AI can help us explore possibilities and use tools—but judgment and responsibility remain ours.' },
];

const WORD_ROWS = [
  [
    ['Plan', 'plan'], ['a', 'a'], ['two', 'two'], ['-', 'hyphen'], ['day', 'day'],
    ['weekend', 'weekend'], ['in', 'in'], ['Taipei', 'taipei'], ['.', 'period-0'],
  ],
  [
    ['My', 'my'], ['budget', 'budget'], ['is', 'is'], ['eight', 'eight'], ['thousand', 'thousand'],
    ['dollars', 'dollars'], [',', 'comma'], ['and', 'and'], ['I', 'i'], ['love', 'love'], ['nature', 'nature'], ['.', 'period-1'],
  ],
];

const TOKEN_COPY_COUNT = WORD_ROWS.reduce((total, row) => total + row.length, 0);
const TOKEN_COPY_COMPLETE = TOKENIZE_START + (TOKEN_COPY_COUNT - 1) * TOKEN_COPY_STAGGER + TOKEN_COPY_DURATION;
const BUBBLE_FADE_START = TOKEN_COPY_COMPLETE + 0.12;
const BUBBLE_FADE_END = BUBBLE_FADE_START + 0.85;
const SEMANTIC_RELATIONS = [
  { id: 'duration', node: 'concept-duration', keys: ['two', 'day'], reveal: 2.7 },
  { id: 'location', node: 'concept-location', keys: ['taipei-tai', 'taipei-pei'], reveal: 4.8 },
  { id: 'budget', node: 'concept-budget', keys: ['eight', 'thousand', 'dollars'], reveal: 6.9 },
  { id: 'preference', node: 'concept-preference', keys: ['nature'], reveal: 9.0 },
];
const svgPath = (svg, className) => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('pathLength', '1');
  className.split(/\s+/).filter(Boolean).forEach((name) => path.classList.add(name));
  svg.append(path);
  return path;
};
const semanticEdges = SEMANTIC_RELATIONS.flatMap((group) => group.keys.map((key) => ({
  group,
  key,
  path: svgPath(contextLines, `context-edge edge-${group.id}`),
})));
const contextEdges = SEMANTIC_RELATIONS.map((group) => ({
  from: document.getElementById(group.node),
  path: svgPath(contextLines, 'context-edge edge-core'),
}));
const typoEdges = ['typo-place', 'typo-near', 'typo-taipei'].map((id) => ({
  from: document.getElementById(id),
  path: svgPath(typoLines, 'typo-edge'),
}));
const typoSourceEdge = svgPath(typoLines, 'typo-edge typo-source-edge');
const modelEdges = [
  { from: llmPrompt, to: llmNetwork, className: 'llm-edge' },
  { from: llmNetwork, to: llmCandidates, className: 'llm-edge edge-choice' },
  { from: llmCandidates, to: llmResponse, className: 'llm-edge edge-choice' },
  { from: llmResponse, to: llmContextReturn, className: 'llm-edge edge-return' },
].map((edge) => ({ ...edge, path: svgPath(modelLines, edge.className) }));
const originEdges = [
  { from: originModel, to: aiProductBoundary, className: 'origin-link', revealAt: 6.0, stay: true },
  { from: builderBadge, to: aiProductBoundary, className: 'origin-link link-builder', revealAt: 7.0, stay: true },
  { from: document.querySelector('#origin-tool-map'), to: document.querySelector('#service-map'), className: 'origin-link link-service', revealAt: 15.0 },
  { from: document.querySelector('#origin-tool-search'), to: document.querySelector('#service-search'), className: 'origin-link link-service', revealAt: 15.4 },
  { from: document.querySelector('#origin-tool-calendar'), to: document.querySelector('#service-calendar'), className: 'origin-link link-service', revealAt: 15.8 },
  { from: document.querySelector('#origin-tool-booking'), to: document.querySelector('#service-booking'), className: 'origin-link link-service', revealAt: 16.2 },
  { from: document.querySelector('#origin-tool-booking'), to: bookingApproval, className: 'origin-link link-approval', revealAt: 35.5 },
  { from: unavailableTool, to: accessLock, className: 'origin-link link-denied', revealAt: 42.8 },
].map((edge) => ({ ...edge, path: svgPath(toolOriginLineSvg, edge.className) }));
const callEdges = [
  { from: callNeed, to: callMapCard, className: 'call-line call-match-line' },
  { from: callModel, to: callRequest, className: 'call-line' },
  { from: callRequest, to: callOrchestrator, className: 'call-line' },
  { from: callOrchestrator, to: callMapService, className: 'call-line call-service-line' },
  { from: callMapService, to: callResult, className: 'call-line call-result-line' },
  { from: callResult, to: callContext, className: 'call-line call-result-line' },
  { from: callContext, to: callResponse, className: 'call-line' },
].map((edge) => ({ ...edge, path: svgPath(callLinesSvg, edge.className) }));
const callSignalNodes = callEdges.map(() => {
  const signal = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  signal.setAttribute('r', '7');
  signal.classList.add('call-signal');
  signal.style.opacity = '0';
  callLinesSvg.append(signal);
  return signal;
});
const learningEdges = [
  { from: trainingCorpus, to: trainingModel, className: 'learning-edge data-edge' },
  { from: trainingModel, to: trainingPrediction, className: 'learning-edge forward-edge' },
  { from: trainingPrediction, to: trainingParameters, className: 'learning-edge error-edge' },
  { from: trainingParameters, to: trainingModel, className: 'learning-edge update-edge' },
  { from: trainingExampleSlot, to: trainingModel, className: 'learning-edge posttrain-edge' },
  { from: trainingModel, to: trainingExampleSlot, className: 'learning-edge response-edge' },
].map((edge) => ({ ...edge, path: svgPath(learningLines, edge.className) }));
const learningSignals = learningEdges.map((edge) => {
  const feedback = edge.className.includes('error-edge') || edge.className.includes('update-edge');
  const signal = document.createElementNS('http://www.w3.org/2000/svg', feedback ? 'path' : 'circle');
  if (feedback) signal.setAttribute('d', 'M -12 -8 L 11 0 L -12 8 Z');
  else signal.setAttribute('r', '6');
  signal.classList.add('learning-signal');
  if (feedback) signal.classList.add('error-signal');
  signal.style.opacity = '0';
  learningLines.append(signal);
  return signal;
});
const consistencyEdges = [
  { from: consistencyPrompt, to: consistencyModel, className: 'consistency-edge' },
  { from: consistencyModel, to: decodingCard, className: 'consistency-edge' },
  { from: consistencyModel, to: answerBranchA, className: 'consistency-edge branch-edge' },
  { from: consistencyModel, to: answerBranchB, className: 'consistency-edge branch-edge' },
].map((edge) => ({ ...edge, path: svgPath(consistencyLines, edge.className) }));
const consistencySignals = consistencyEdges.map((edge) => {
  const signal = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  signal.setAttribute('r', '7');
  signal.classList.add('consistency-signal');
  if (edge.className.includes('branch-edge')) signal.classList.add('branch-signal');
  signal.style.opacity = '0';
  consistencyLines.append(signal);
  return signal;
});
const neuralWireNodes = [];
const neuralSignalNodes = [];
const NEURAL_LAYER_X = [9.5, 35.5, 61.5, 87.5];
const NEURAL_NODE_Y = [18, 39.3, 60.7, 82];
const TRAINING_LAYER_X = [8, 36, 64, 92];
const TRAINING_NODE_Y = [17, 39, 61, 83];

function buildNeuralMesh() {
  const namespace = 'http://www.w3.org/2000/svg';
  for (let layer = 0; layer < NEURAL_LAYER_X.length - 1; layer += 1) {
    NEURAL_NODE_Y.forEach((sourceY) => {
      const nearestTargets = NEURAL_NODE_Y
        .map((targetY, index) => ({ targetY, index, distance: Math.abs(targetY - sourceY) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      nearestTargets.forEach(({ targetY }) => {
        const line = document.createElementNS(namespace, 'line');
        line.setAttribute('x1', NEURAL_LAYER_X[layer]);
        line.setAttribute('y1', sourceY);
        line.setAttribute('x2', NEURAL_LAYER_X[layer + 1]);
        line.setAttribute('y2', targetY);
        line.dataset.layer = String(layer);
        line.classList.add('neural-wire');
        neuralWires.append(line);
        neuralWireNodes.push(line);
      });
    });
  }
  for (let index = 0; index < 3; index += 1) {
    const signal = document.createElementNS(namespace, 'circle');
    signal.setAttribute('r', '1.18');
    signal.classList.add('neural-signal');
    signal.dataset.phase = String(index / 3);
    neuralWires.append(signal);
    neuralSignalNodes.push(signal);
  }
}

buildNeuralMesh();

function buildTrainingNetwork() {
  const namespace = 'http://www.w3.org/2000/svg';
  for (let layer = 0; layer < TRAINING_LAYER_X.length - 1; layer += 1) {
    TRAINING_NODE_Y.forEach((sourceY, sourceIndex) => {
      TRAINING_NODE_Y.forEach((targetY, targetIndex) => {
        if (Math.abs(sourceIndex - targetIndex) > 1) return;
        const line = document.createElementNS(namespace, 'line');
        line.setAttribute('x1', TRAINING_LAYER_X[layer]);
        line.setAttribute('y1', sourceY);
        line.setAttribute('x2', TRAINING_LAYER_X[layer + 1]);
        line.setAttribute('y2', targetY);
        line.dataset.layer = String(layer);
        line.classList.add('training-wire');
        trainingNetworkWires.append(line);
      });
    });
  }
}

buildTrainingNetwork();

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smoothstep = (start, end, value) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};
const lerp = (a, b, t) => a + (b - a) * t;
const tokenFontSize = () => Math.min(stage.clientWidth * 0.019, 38);
const fmtTime = (seconds) => {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Keep the prompt sentence in its bubble; animated token copies move into a separate central field.
const wordNodes = new Map();
const sourceNodes = new Map();
let flights = [];
let tokenAnimations = [];
let tokenCloneLayer = null;
let promptPhase = 'chat';
let promptSourceBox = null;
let tokenRowsBuilt = false;
let tileOrder = 0;

function resetFlightNodes(removeAnchors = false) {
  flights.forEach((flight) => {
    if (!removeAnchors && flight.activeAtCurrentTime) return;
    if (flight.sourceParent && flight.sourceNode.parentElement !== flight.sourceParent) {
      const before = flight.placeholder?.parentElement === flight.sourceParent
        ? flight.placeholder.nextSibling
        : null;
      flight.sourceParent.insertBefore(flight.sourceNode, before);
    }
    if (flight.placeholder) {
      flight.placeholder.remove();
      flight.placeholder = null;
    }
    if (flight.targetNode) flight.targetNode.replaceChildren();
    flight.sourceNode.classList.remove('flight-token', 'token-slot');
    flight.sourceNode.classList.add('token-copy');
    flight.startRect = null;
    ['position', 'left', 'top', 'width', 'height', 'min-height', 'font-size', 'opacity', 'transform', 'margin', 'padding', 'box-sizing', 'z-index', 'border-radius', 'background', 'border-color']
      .forEach((property) => flight.sourceNode.style.removeProperty(property));
    flight.sourceNode.style.removeProperty('--tile-border');
    flight.sourceNode.style.removeProperty('--tile-glow');
    flight.sourceNode.style.removeProperty('--copy-progress');
  });
}

function makeSourceLine(row) {
  const line = document.createElement('span');
  line.className = 'prompt-line source-line';
  row.forEach(([text, key], index) => {
    const source = document.createElement('span');
    source.className = `source-word${['.', ',', '-'].includes(text) ? ' punctuation' : ''}`;
    source.dataset.word = key;
    source.textContent = text;
    line.append(source);
    sourceNodes.set(key, source);
    const nextText = row[index + 1]?.[0];
    if (nextText && text !== '-' && nextText !== '-' && nextText !== '.' && nextText !== ',') {
      line.append(document.createTextNode(' '));
    }
  });
  return line;
}

function setZoomPhraseMarkup() {
  resetFlightNodes(true);
  tokenField.replaceChildren();
  tokenCloneLayer = null;
  tokenAnimations = [];
  tokenRowsBuilt = false;
  wordNodes.clear();
  sourceNodes.clear();
  flights = [];
  promptText.className = 'prompt-text zoom-text';
  promptText.replaceChildren(...WORD_ROWS.map((row) => makeSourceLine(row)));
}

function makeTaipeiGroup(kind) {
  const isCopy = kind === 'copy';
  const group = document.createElement('span');
  group.className = isCopy ? 'taipei-token-group taipei-copy-group' : 'taipei-token-group taipei-destination-group';
  const whole = document.createElement('span');
  whole.className = `word-unit taipei-whole ${isCopy ? 'token-copy' : 'token-destination'}`;
  whole.dataset.word = 'taipei-whole';
  whole.textContent = 'Taipei';
  const pieces = document.createElement('span');
  pieces.className = `taipei-pieces${isCopy ? ' token-copy-pieces' : ''}`;
  const tai = document.createElement('span');
  tai.className = `word-piece ${isCopy ? 'token-copy' : 'token-destination'}`;
  tai.dataset.word = 'taipei-tai';
  tai.textContent = 'Tai';
  const pei = document.createElement('span');
  pei.className = `word-piece ${isCopy ? 'token-copy' : 'token-destination'}`;
  pei.dataset.word = 'taipei-pei';
  pei.textContent = 'pei';
  pieces.append(tai, pei);
  group.append(whole, pieces);
  return { group, whole, pieces, tai, pei };
}

function buildTokenRows() {
  resetFlightNodes(true);
  wordNodes.clear();
  tokenAnimations = [];
  flights = [];
  tileOrder = 0;
  tokenField.replaceChildren();
  const layout = document.createElement('div');
  layout.className = 'token-rows';
  tokenCloneLayer = document.createElement('div');
  tokenCloneLayer.className = 'token-copy-layer';
  let copyOrder = 0;

  WORD_ROWS.forEach((row, rowIndex) => {
    const line = document.createElement('div');
    line.className = 'token-row';
    line.dataset.row = String(rowIndex);
    row.forEach(([text, key]) => {
      let destination;
      let copy;
      if (key === 'taipei') {
        const destinationParts = makeTaipeiGroup('destination');
        const copyParts = makeTaipeiGroup('copy');
        destination = destinationParts.group;
        copy = copyParts.group;
        wordNodes.set('taipei', copy);
        wordNodes.set('taipei-whole', copyParts.whole);
        wordNodes.set('taipei-tai', copyParts.tai);
        wordNodes.set('taipei-pei', copyParts.pei);
      } else {
        const punctuation = ['.', ',', '-'].includes(text) ? ' punctuation' : '';
        destination = document.createElement('span');
        destination.className = `word-unit token-destination${punctuation}`;
        destination.dataset.word = key;
        destination.textContent = text;
        copy = document.createElement('span');
        copy.className = `word-unit token-copy${punctuation}`;
        copy.dataset.word = key;
        copy.textContent = text;
        wordNodes.set(key, copy);
      }
      line.append(destination);
      tokenCloneLayer.append(copy);
      tokenAnimations.push({
        key,
        sourceNode: sourceNodes.get(key),
        copyNode: copy,
        destinationNode: destination,
        start: TOKENIZE_START + copyOrder * TOKEN_COPY_STAGGER,
        order: copyOrder,
      });
      copyOrder += 1;
      tileOrder += 1;
    });
    layout.append(line);
  });
  tokenField.append(layout, tokenCloneLayer);

  flights = [
    { sourceKey: 'weekend', target: 'slot-weekend', id: 'id-weekend', start: 12.2, offset: -5 },
    { sourceKey: 'taipei-tai', target: 'slot-tai', id: 'id-tai', start: 12.55, offset: -8 },
    { sourceKey: 'taipei-pei', target: 'slot-pei', id: 'id-pei', start: 12.82, offset: 8 },
    { sourceKey: 'period-0', target: 'slot-period', id: 'id-period', start: 13.12, offset: 1 },
  ];
  flights.forEach((flight) => {
    flight.sourceNode = wordNodes.get(flight.sourceKey);
    flight.sourceParent = flight.sourceNode.parentElement;
    flight.targetNode = document.querySelector(`#${flight.target}`);
    flight.idNode = document.querySelector(`#${flight.id}`);
    flight.placeholder = null;
    flight.startRect = null;
  });
  tokenRowsBuilt = true;
}

function capturePromptSourceBox() {
  const stageRect = stage.getBoundingClientRect();
  const sourceRect = userMessage.getBoundingClientRect();
  if (!stageRect.width || !stageRect.height) return;
  promptSourceBox = {
    x: (sourceRect.left - stageRect.left) / stageRect.width,
    y: (sourceRect.top - stageRect.top) / stageRect.height,
    width: sourceRect.width / stageRect.width,
    height: sourceRect.height / stageRect.height,
  };
}

function setPromptPhase(nextPhase, time) {
  if (nextPhase === promptPhase) return;
  if (promptPhase === 'tokenized') resetFlightNodes(true);

  if (nextPhase === 'chat') {
    conversation.append(userMessage);
    userMessage.classList.remove('zoomed-message');
    ['position', 'left', 'top', 'width', 'height', 'padding', 'border-radius', 'z-index'].forEach((property) => userMessage.style.removeProperty(property));
    promptText.className = 'prompt-text';
    ['position', 'left', 'top', 'width', 'font-size', 'text-align'].forEach((property) => promptText.style.removeProperty(property));
    promptText.textContent = time >= 9.55 ? PROMPT : '';
    tokenField.replaceChildren();
    tokenField.style.opacity = '0';
    zoomPrompt.replaceChildren(tokenField);
    promptSourceBox = null;
    tokenRowsBuilt = false;
    wordNodes.clear();
    sourceNodes.clear();
    tokenAnimations = [];
    tokenCloneLayer = null;
    flights = [];
  } else if (nextPhase === 'zoom' || nextPhase === 'tokenized') {
    if (promptPhase === 'chat') capturePromptSourceBox();
    zoomPrompt.insertBefore(userMessage, tokenField);
    userMessage.classList.add('zoomed-message');
    setZoomPhraseMarkup();
    if (nextPhase === 'tokenized') buildTokenRows();
  }
  promptPhase = nextPhase;
}

// Fixed seed drives both the static star field and absolute-time particle motion.
let seed = 0xA17E2026;
function seededRandom() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

let renderer;
let camera;
let stars;
let network;
let gridMaterial;
let sparkCloud;
let sparkPositions;
let sparkGeometry;
let sparkMaterial;
let sparkParams = [];
let failedWebGL = false;
let activeChapterButton = null;

try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x050812, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 80);
  camera.position.set(0, 0, 11);

  const starPositions = new Float32Array(420 * 3);
  for (let i = 0; i < 420; i += 1) {
    starPositions[i * 3] = (seededRandom() - 0.5) * 27;
    starPositions[i * 3 + 1] = (seededRandom() - 0.5) * 15;
    starPositions[i * 3 + 2] = -12 + seededRandom() * 9;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0x83bbc3, size: 0.025, sizeAttenuation: true,
    transparent: true, opacity: 0.42, depthWrite: false,
  });
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  const nodePoints = [
    [-6.6, 2.8, -2.2], [-3.3, 1.5, -1.6], [0.2, 2.2, -2.4], [4.2, 1.3, -1.7],
    [-5.1, -0.5, -2], [-1.4, -1.5, -1.5], [2.5, -0.5, -2.2], [5.6, -1.8, -2.5],
    [-4.0, -3.8, -1.6], [-0.2, -4.2, -2.5], [3.7, -3.5, -1.8],
  ];
  const linkPairs = [[0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[3,6],[4,5],[5,6],[6,7],[4,8],[5,9],[6,10],[8,9],[9,10]];
  const linePositions = [];
  for (const [a, b] of linkPairs) linePositions.push(...nodePoints[a], ...nodePoints[b]);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  network = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x5aa9ad, transparent: true, opacity: 0.038, depthWrite: false }));
  scene.add(network);

  const gridPositions = [];
  for (let x = -9; x <= 9; x += 1) gridPositions.push(x, -5, -3.5, x, 5, -3.5);
  for (let y = -5; y <= 5; y += 1) gridPositions.push(-9, y, -3.5, 9, y, -3.5);
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  gridMaterial = new THREE.LineBasicMaterial({ color: 0x456b7b, transparent: true, opacity: 0.014, depthWrite: false });
  scene.add(new THREE.LineSegments(gridGeometry, gridMaterial));

  const sparkCount = 150;
  sparkPositions = new Float32Array(sparkCount * 3);
  sparkParams = Array.from({ length: sparkCount }, () => ({
    phase: seededRandom() * Math.PI * 2,
    radius: 0.4 + seededRandom() * 5.2,
    speed: 0.25 + seededRandom() * 0.8,
    height: 0.3 + seededRandom() * 1.7,
    drift: seededRandom() * 0.8,
  }));
  sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  sparkMaterial = new THREE.PointsMaterial({
    color: 0x8fe9df, size: 0.045, sizeAttenuation: true,
    transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  sparkCloud = new THREE.Points(sparkGeometry, sparkMaterial);
  scene.add(sparkCloud);

  function resizeRenderer() {
    renderer.setSize(1920, 1080, false);
    camera.aspect = 16 / 9;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', () => {
    resizeRenderer();
    renderAt(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
  }, { passive: true });
  resizeRenderer();
  window.__sectionScene = { scene, camera, renderer };
} catch (error) {
  failedWebGL = true;
  console.error('Three.js scene could not initialize:', error);
  canvas.hidden = true;
}

function reveal(element, amount, y = 8, scale = 0.98) {
  const p = clamp(amount);
  element.style.opacity = p.toFixed(3);
  element.style.transform = `translateY(${((1 - p) * y).toFixed(2)}px) scale(${lerp(scale, 1, p).toFixed(3)})`;
}

function updateTaipeiSplit(sectionTwoTime) {
  const animation = tokenAnimations.find((item) => item.key === 'taipei');
  if (!animation) return;
  const split = smoothstep(11.0, 11.95, sectionTwoTime);
  const fontSize = tokenFontSize();
  const copyWhole = animation.copyNode.querySelector('.taipei-whole');
  const destinationWhole = animation.destinationNode.querySelector('.taipei-whole');
  const copyPieces = animation.copyNode.querySelector('.taipei-pieces');
  const destinationPieces = animation.destinationNode.querySelector('.taipei-pieces');

  [copyWhole, destinationWhole].forEach((whole) => {
    whole.style.width = 'auto';
    whole.style.paddingLeft = '';
    whole.style.paddingRight = '';
    const naturalWidth = whole.getBoundingClientRect().width;
    whole.style.width = `${(naturalWidth * (1 - split)).toFixed(2)}px`;
    whole.style.paddingLeft = `${(fontSize * 0.42 * (1 - split)).toFixed(2)}px`;
    whole.style.paddingRight = `${(fontSize * 0.42 * (1 - split)).toFixed(2)}px`;
    whole.style.opacity = (1 - split).toFixed(3);
  });
  [copyPieces, destinationPieces].forEach((pieces) => {
    pieces.style.maxWidth = `${(fontSize * 4.9 * split).toFixed(2)}px`;
    pieces.style.opacity = split.toFixed(3);
    pieces.style.visibility = split > 0.001 ? 'visible' : 'hidden';
    pieces.style.transform = `translateX(${lerp(-8, 0, split).toFixed(2)}px)`;
  });
}

function renderTokenCopies(sectionTwoTime) {
  if (!tokenCloneLayer || !tokenAnimations.length) return;
  flights.forEach((flight) => { flight.activeAtCurrentTime = sectionTwoTime >= flight.start; });
  resetFlightNodes(false);
  tokenField.style.opacity = smoothstep(TOKENIZE_START, TOKENIZE_START + 0.35, sectionTwoTime).toFixed(3);
  sourceNodes.forEach((source) => { source.style.opacity = '1'; });
  updateTaipeiSplit(sectionTwoTime);

  const fieldRect = tokenField.getBoundingClientRect();
  const targetFontSize = tokenFontSize();
  tokenAnimations.forEach((animation) => {
    const { sourceNode, copyNode, destinationNode, start } = animation;
    const activeFlight = flights.find((flight) => flight.sourceNode === copyNode && sectionTwoTime >= flight.start);
    if (activeFlight && copyNode.parentElement !== tokenCloneLayer) return;
    const sourceRect = sourceNode.getBoundingClientRect();
    const targetRect = destinationNode.getBoundingClientRect();
    const progress = smoothstep(start, start + TOKEN_COPY_DURATION, sectionTwoTime);
    const visible = smoothstep(start, start + 0.1, sectionTwoTime);
    const sourceFontSize = Number.parseFloat(getComputedStyle(sourceNode).fontSize) || targetFontSize;
    const width = lerp(sourceRect.width, targetRect.width, progress);
    const height = lerp(sourceRect.height, targetRect.height, progress);
    const centerX = lerp(sourceRect.left - fieldRect.left + sourceRect.width / 2, targetRect.left - fieldRect.left + targetRect.width / 2, progress);
    const arc = Math.sin(Math.PI * progress) * Math.min(stage.clientHeight * 0.018, 16);
    const centerY = lerp(sourceRect.top - fieldRect.top + sourceRect.height / 2, targetRect.top - fieldRect.top + targetRect.height / 2, progress) + arc;

    copyNode.style.position = 'absolute';
    copyNode.style.left = `${(centerX - width / 2).toFixed(2)}px`;
    copyNode.style.top = `${(centerY - height / 2).toFixed(2)}px`;
    copyNode.style.width = `${Math.max(0.1, width).toFixed(2)}px`;
    copyNode.style.height = `${Math.max(0.1, height).toFixed(2)}px`;
    copyNode.style.minHeight = '0';
    copyNode.style.fontSize = `${lerp(sourceFontSize, targetFontSize, progress).toFixed(2)}px`;
    copyNode.style.padding = animation.key === 'taipei'
      ? '0'
      : `${(targetFontSize * 0.22 * progress).toFixed(2)}px ${(targetFontSize * 0.42 * progress).toFixed(2)}px`;
    copyNode.style.opacity = visible.toFixed(3);
    copyNode.style.visibility = sectionTwoTime < start ? 'hidden' : 'visible';
    copyNode.style.transform = `rotate(${lerp(-2.5, 0, progress).toFixed(2)}deg)`;
    copyNode.style.zIndex = animation.order < WORD_ROWS[0].length ? '4' : '2';
    copyNode.style.setProperty('--copy-progress', progress.toFixed(3));
    copyNode.style.setProperty('--tile-border', progress.toFixed(3));
    copyNode.style.setProperty('--tile-glow', String(progress * (0.2 + 0.28 * Math.sin(sectionTwoTime * 2.6 + animation.order) ** 2)));
    copyNode.querySelectorAll('.token-copy').forEach((piece) => {
      piece.style.setProperty('--copy-progress', progress.toFixed(3));
      piece.style.setProperty('--tile-border', progress.toFixed(3));
      piece.style.setProperty('--tile-glow', String(progress * 0.28));
    });

    const dim = smoothstep(start + 0.04, start + 0.42, sectionTwoTime);
    sourceNode.style.opacity = (1 - 0.8 * dim).toFixed(3);
  });
}

function contextTokenNode(key) {
  const direct = tokenAnimations.find((animation) => animation.key === key);
  if (direct) return direct.destinationNode;
  if (key === 'taipei-tai' || key === 'taipei-pei') {
    const taipei = tokenAnimations.find((animation) => animation.key === 'taipei')?.destinationNode;
    return taipei?.querySelector(`[data-word="${key}"]`) ?? taipei;
  }
  return null;
}

function updateFlights(sectionTwoTime) {
  if (!flights.length) return;
  const stageRect = stage.getBoundingClientRect();
  const idReveal = smoothstep(19.6, 20.4, sectionTwoTime);
  flights.forEach((flight) => {
    flight.idNode.style.opacity = idReveal.toFixed(3);
    flight.idNode.style.maxHeight = `${(2.35 * idReveal).toFixed(3)}cqw`;
    flight.idNode.style.paddingTop = `${(0.24 * idReveal).toFixed(3)}cqw`;
    flight.idNode.style.paddingBottom = `${(0.24 * idReveal).toFixed(3)}cqw`;
    flight.idNode.style.borderColor = `rgba(152,193,173,${(0.35 * idReveal).toFixed(3)})`;
    flight.idNode.style.transform = `scaleY(${lerp(0.72, 1, idReveal).toFixed(3)})`;

    if (sectionTwoTime < flight.start) return;
    if (!flight.startRect) {
      const rect = flight.sourceNode.getBoundingClientRect();
      flight.startRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        fontSize: getComputedStyle(flight.sourceNode).fontSize,
      };
    }
    const sourceRect = flight.startRect;
    const targetRect = flight.targetNode.getBoundingClientRect();
    const sourceFontSize = sourceRect.fontSize;
    if (flight.sourceParent !== tokenCloneLayer && !flight.placeholder) {
      const placeholder = document.createElement('span');
      placeholder.className = 'token-placeholder';
      placeholder.style.width = `${sourceRect.width}px`;
      placeholder.style.height = `${sourceRect.height}px`;
      flight.sourceParent.insertBefore(placeholder, flight.sourceNode);
      flight.placeholder = placeholder;
    }
    if (flight.placeholder) flight.placeholder.style.display = 'inline-block';

    const p = smoothstep(flight.start + 0.08, flight.start + 1.34, sectionTwoTime);
    const startX = sourceRect.left - stageRect.left + sourceRect.width / 2 + flight.offset * p;
    const startY = sourceRect.top - stageRect.top + sourceRect.height / 2;
    const endX = targetRect.left - stageRect.left + targetRect.width / 2;
    const endY = targetRect.top - stageRect.top + targetRect.height / 2;
    const arc = Math.sin(Math.PI * p) * Math.min(stage.clientHeight * 0.13, 84);
    const x = lerp(startX, endX, p);
    const y = lerp(startY, endY, p) + arc;
    if (p >= 0.999) {
      flight.targetNode.append(flight.sourceNode);
      flight.sourceNode.classList.remove('token-copy');
      flight.sourceNode.classList.remove('flight-token');
      flight.sourceNode.classList.add('token-slot');
      ['position', 'left', 'top', 'width', 'height', 'min-height', 'font-size', 'transform', 'margin', 'padding', 'box-sizing', 'z-index']
        .forEach((property) => flight.sourceNode.style.removeProperty(property));
      flight.sourceNode.style.removeProperty('--copy-progress');
      flight.sourceNode.style.opacity = '1';
      return;
    }

    flightLayer.append(flight.sourceNode);
    flight.sourceNode.classList.add('flight-token');
    flight.sourceNode.style.position = 'absolute';
    flight.sourceNode.style.left = `${x - sourceRect.width / 2}px`;
    flight.sourceNode.style.top = `${y - sourceRect.height / 2}px`;
    flight.sourceNode.style.width = `${sourceRect.width}px`;
    flight.sourceNode.style.height = `${sourceRect.height}px`;
    flight.sourceNode.style.minHeight = '0';
    flight.sourceNode.style.fontSize = sourceFontSize;
    flight.sourceNode.style.margin = '0';
    flight.sourceNode.style.opacity = '1';
    flight.sourceNode.style.transform = 'none';
    flight.sourceNode.style.zIndex = '8';

  });
}

function drawLink(path, from, to, progress, opacity) {
  if (!path || !from || !to || opacity <= 0.001) {
    if (path) path.style.opacity = '0';
    return;
  }
  const bounds = stage.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const sx = ((a.left + a.width / 2 - bounds.left) / bounds.width) * 1920;
  const sy = ((a.top + a.height / 2 - bounds.top) / bounds.height) * 1080;
  const tx = ((b.left + b.width / 2 - bounds.left) / bounds.width) * 1920;
  const ty = ((b.top + b.height / 2 - bounds.top) / bounds.height) * 1080;
  const bend = Math.min(110, Math.abs(ty - sy) * 0.2);
  const direction = ty >= sy ? -1 : 1;
  const cy = (sy + ty) / 2 + bend * direction;
  path.setAttribute('d', `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${sx.toFixed(1)} ${cy.toFixed(1)}, ${tx.toFixed(1)} ${cy.toFixed(1)}, ${tx.toFixed(1)} ${ty.toFixed(1)}`);
  path.style.strokeDashoffset = (1 - clamp(progress)).toFixed(3);
  path.style.opacity = clamp(opacity).toFixed(3);
}

function renderContextStory(time) {
  if (time < SECTION_THREE_START) {
    contextStory.style.opacity = '0';
    contextStory.style.visibility = 'hidden';
    return;
  }
  const local = time - SECTION_THREE_START;
  const enter = smoothstep(SECTION_THREE_START, SECTION_THREE_START + 0.65, time);
  const endFade = 1 - smoothstep(SECTION_FOUR_START - 0.8, SECTION_FOUR_START + 0.3, time);
  contextStory.style.visibility = 'visible';
  contextStory.style.opacity = (enter * endFade).toFixed(3);

  const rowHandoff = smoothstep(0.0, 0.8, local);
  tokenAnimations.forEach((animation) => {
    animation.destinationNode.style.visibility = 'visible';
    animation.destinationNode.style.opacity = rowHandoff.toFixed(3);
    animation.destinationNode.querySelectorAll('.token-destination').forEach((node) => { node.style.visibility = 'visible'; });
    animation.copyNode.style.opacity = (1 - rowHandoff).toFixed(3);
  });

  const semanticFade = 1 - smoothstep(24.0, 26.0, local);
  SEMANTIC_RELATIONS.forEach((group) => {
    const reveal = smoothstep(group.reveal, group.reveal + 0.8, local);
    const node = document.getElementById(group.node);
    const nodeOpacity = reveal * semanticFade;
    node.style.opacity = nodeOpacity.toFixed(3);
    node.style.transform = `translateY(${lerp(18, 0, reveal).toFixed(2)}px) scale(${lerp(0.95, 1, reveal).toFixed(3)})`;
    node.classList.toggle('is-active', local >= group.reveal + 0.75 && local < group.reveal + 2.6);
    group.keys.forEach((key) => {
      const source = contextTokenNode(key);
      const edge = semanticEdges.find((item) => item.group.id === group.id && item.key === key);
      drawLink(edge?.path, source, node, smoothstep(group.reveal + 0.2, group.reveal + 1.3, local), nodeOpacity);
    });
  });

  const coreIn = smoothstep(12.6, 13.5, local);
  const coreOpacity = coreIn * semanticFade;
  contextCore.style.opacity = coreOpacity.toFixed(3);
  contextCore.style.transform = `translate(-50%, ${lerp(10, 0, coreIn).toFixed(2)}px) scale(${lerp(0.92, 1, coreIn).toFixed(3)})`;
  contextLabel.textContent = local < 18.0 ? 'CONTEXT' : 'ATTENTION';
  contextEdges.forEach((edge) => {
    drawLink(edge.path, edge.from, contextCore, smoothstep(13.0, 15.0, local), coreOpacity * semanticFade);
  });

  const attentionIn = smoothstep(17.7, 18.8, local) * (1 - smoothstep(24.0, 25.5, local));
  const focusTargets = ['concept-budget', 'concept-preference', 'concept-location'];
  const focusPath = clamp((local - 18.2) / 5.6, 0, 0.999) * (focusTargets.length - 1);
  const focusIndex = Math.floor(focusPath);
  const focusMix = smoothstep(0, 1, focusPath - focusIndex);
  const firstRect = document.getElementById(focusTargets[focusIndex]).getBoundingClientRect();
  const secondRect = document.getElementById(focusTargets[Math.min(focusIndex + 1, focusTargets.length - 1)]).getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const focusX = lerp(firstRect.left + firstRect.width / 2, secondRect.left + secondRect.width / 2, focusMix) - stageRect.left;
  const focusY = lerp(firstRect.top + firstRect.height / 2, secondRect.top + secondRect.height / 2, focusMix) - stageRect.top;
  attentionFocus.style.left = `${focusX.toFixed(2)}px`;
  attentionFocus.style.top = `${focusY.toFixed(2)}px`;
  attentionFocus.style.opacity = attentionIn.toFixed(3);
  attentionFocus.style.transform = `translate(-50%,-50%) scale(${lerp(0.94, 1, attentionIn).toFixed(3)})`;

  const tokenFade = 1 - smoothstep(24.0, 26.0, local);
  tokenField.style.opacity = tokenFade.toFixed(3);
  const typoIn = smoothstep(24.7, 26.0, local);
  typoScene.style.opacity = (typoIn * endFade).toFixed(3);
  const typoFocus = smoothstep(24.9, 25.8, local) * (1 - smoothstep(29.2, 30.2, local));
  typoSource.style.transform = `scale(${lerp(0.96, 1.08, typoFocus).toFixed(3)})`;
  typoSource.style.boxShadow = `0 0 ${(0.5 + 1.0 * typoFocus).toFixed(2)}cqw rgba(229,151,119,${(0.08 + 0.22 * typoFocus).toFixed(3)})`;

  ['typo-place', 'typo-near', 'typo-taipei'].forEach((id, index) => {
    const word = document.getElementById(id);
    const wordIn = smoothstep(29.8 + index * 0.22, 30.6 + index * 0.22, local);
    word.style.opacity = wordIn.toFixed(3);
    word.style.background = `rgba(52,91,76,${(0.14 + 0.2 * wordIn).toFixed(3)})`;
  });
  const likelyIn = smoothstep(30.1, 31.3, local);
  likelyReading.style.opacity = (likelyIn * endFade).toFixed(3);
  likelyReading.style.transform = `translate(-50%, ${lerp(20, 0, likelyIn).toFixed(2)}px) scale(${lerp(0.94, 1, likelyIn).toFixed(3)})`;
  typoEdges.forEach((edge, index) => {
    const from = edge.from;
    const to = likelyReading;
    drawLink(edge.path, from, to, smoothstep(30.2 + index * 0.2, 31.3 + index * 0.2, local), likelyIn * endFade);
  });
  drawLink(typoSourceEdge, typoSource, likelyReading, smoothstep(30.0, 31.1, local), likelyIn * 0.82 * endFade);

  const uncertaintyIn = smoothstep(41.5, 42.6, local) * (1 - smoothstep(47.8, 48.75, local));
  meaningOptions.style.opacity = (uncertaintyIn * endFade).toFixed(3);
  meaningOptions.style.transform = `translate(-50%, ${lerp(.65, 0, uncertaintyIn).toFixed(3)}cqw) scale(${lerp(.985, 1, uncertaintyIn).toFixed(3)})`;
  const likelyStrength = smoothstep(41.8, 44.5, local);
  meaningLikelyMeter.style.width = `${lerp(8, 82, likelyStrength).toFixed(1)}%`;
  meaningOtherMeter.style.width = `${lerp(5, 28, likelyStrength).toFixed(1)}%`;
  const clarifyIn = smoothstep(48.7, 49.8, local) * (1 - smoothstep(53.25, 54.25, local));
  clarificationCard.style.opacity = (clarifyIn * endFade).toFixed(3);
  clarificationCard.style.transform = `translate(-50%, ${lerp(.72, 0, clarifyIn).toFixed(3)}cqw) scale(${lerp(.985, 1, clarifyIn).toFixed(3)})`;
  const cursorPulse = .5 + .5 * Math.sin(local * 5.2) ** 2;
  clarificationCard.querySelector('.clarification-cursor').style.opacity = String((clarifyIn * (.35 + .65 * cursorPulse)).toFixed(3));
}

function renderModelStory(time) {
  if (time < SECTION_FOUR_START) {
    modelStory.style.opacity = '0';
    modelStory.style.visibility = 'hidden';
    return;
  }
  const local = time - SECTION_FOUR_START;
  const endFade = 1 - smoothstep(SECTION_FIVE_START - 0.75, SECTION_FIVE_START + 0.28, time);
  const enter = smoothstep(0, 1.15, local);
  modelStory.style.visibility = 'visible';
  modelStory.style.opacity = (enter * endFade).toFixed(3);

  const promptIn = smoothstep(0.35, 1.5, local);
  const networkIn = smoothstep(0.45, 1.8, local);
  llmPrompt.style.opacity = promptIn.toFixed(3);
  llmPrompt.style.transform = `translateX(${lerp(-1.4, 0, promptIn)}cqw)`;
  llmNetwork.style.opacity = networkIn.toFixed(3);
  llmNetwork.style.transform = `scale(${(1 + 0.012 * Math.sin(local * 1.25) ** 2).toFixed(3)})`;
  llmNetwork.querySelectorAll('.neural-column i').forEach((node, index) => {
    const layer = Math.floor(index / NEURAL_NODE_Y.length);
    const row = index % NEURAL_NODE_Y.length;
    const wave = (local * 0.18) % 1;
    const travelingActivation = Math.max(0, 1 - Math.abs(wave - (layer / (NEURAL_LAYER_X.length - 1))) * 4.2);
    const shimmer = 0.5 + 0.5 * Math.sin(local * 2.4 - layer * 0.9 + row * 0.55);
    const glow = 0.2 + 0.58 * travelingActivation + 0.14 * shimmer;
    node.style.opacity = (networkIn * glow).toFixed(3);
    node.style.transform = `translate(-50%, -50%) scale(${(0.78 + 0.46 * glow).toFixed(3)})`;
    node.style.boxShadow = `0 0 ${(0.34 + glow * 0.72).toFixed(2)}cqw rgba(112,222,210,${(0.16 + glow * 0.44).toFixed(3)})`;
  });
  const networkWave = (local * 0.18) % 1;
  neuralWireNodes.forEach((wire, index) => {
    const layer = Number(wire.dataset.layer);
    const connectionCenter = (layer + 0.5) / (NEURAL_LAYER_X.length - 1);
    const pulse = Math.max(0, 1 - Math.abs(networkWave - connectionCenter) * 3.6);
    const shimmer = 0.5 + 0.5 * Math.sin(local * 2.2 + index * 0.61);
    wire.style.opacity = (networkIn * (0.12 + 0.53 * pulse + 0.12 * shimmer)).toFixed(3);
    wire.style.strokeDashoffset = `${(-local * 1.4 - index * 0.16).toFixed(2)}`;
  });
  neuralSignalNodes.forEach((signal, index) => {
    const progress = (networkWave + Number(signal.dataset.phase)) % 1;
    const x = lerp(NEURAL_LAYER_X[0], NEURAL_LAYER_X.at(-1), progress);
    const y = 50 + Math.sin(local * 1.25 + index * 2.1) * 13;
    signal.setAttribute('cx', x.toFixed(2));
    signal.setAttribute('cy', y.toFixed(2));
    signal.style.opacity = (networkIn * (0.62 + 0.3 * (0.5 + 0.5 * Math.sin(local * 2.6 + index)))).toFixed(3);
  });

  const candidateIn = smoothstep(11.2, 12.4, local) * (1 - smoothstep(34.0, 36.0, local));
  llmCandidates.style.opacity = candidateIn.toFixed(3);
  llmCandidates.style.transform = `translateX(${lerp(1.3, 0, candidateIn)}cqw)`;
  const selected = smoothstep(20.0, 20.9, local);
  llmCandidates.querySelectorAll('.candidate-row').forEach((row, index) => {
    row.classList.toggle('selected', index === 0 && selected > 0.5);
    row.style.opacity = (candidateIn * (index === 0 ? lerp(0.78, 1, selected) : 0.68)).toFixed(3);
  });

  const retrievalDim = smoothstep(48.0, 49.0, local) * (1 - smoothstep(52.5, 53.5, local));
  const responseIn = smoothstep(19.9, 21.1, local);
  const responseOpacity = responseIn * (1 - retrievalDim);
  llmResponse.style.opacity = responseOpacity.toFixed(3);
  llmResponse.style.transform = `translateY(${lerp(1.2, 0, responseIn)}cqw)`;
  const tokenTimes = [20.25, 23.35, 26.35, 29.35, 32.25];
  const phraseTokens = [...llmResponse.querySelectorAll('.generated-token')];
  let visibleTokens = 0;
  phraseTokens.forEach((token, index) => {
    const p = smoothstep(tokenTimes[index], tokenTimes[index] + 0.72, local);
    token.style.opacity = p.toFixed(3);
    token.style.transform = `translateY(${lerp(0.55, 0, p)}cqw) scale(${lerp(0.96, 1, p).toFixed(3)})`;
    if (p > 0.02) visibleTokens = index + 1;
  });
  const contextCopy = document.querySelector('#context-output-copy');
  contextCopy.textContent = phraseTokens.slice(0, visibleTokens).map((token) => token.textContent).join(' ');
  const contextReturnIn = smoothstep(25.1, 27.0, local) * (1 - retrievalDim);
  llmContextReturn.style.opacity = contextReturnIn.toFixed(3);
  llmContextReturn.style.transform = `translateY(${lerp(0.8, 0, contextReturnIn)}cqw)`;

  const cacheIn = smoothstep(37.4, 38.8, local) * (1 - smoothstep(46.8, 48.1, local));
  llmCache.style.opacity = cacheIn.toFixed(3);
  llmCache.style.transform = `translateY(${lerp(0.6, 0, cacheIn)}cqw)`;
  const storedIn = smoothstep(48.4, 49.5, local) * (1 - smoothstep(52.0, 53.25, local));
  const storedStrikeIn = smoothstep(50.1, 50.9, local);
  const storedDissolve = smoothstep(51.3, 53.25, local);
  llmStoredAnswer.style.opacity = (storedIn * (1 - storedDissolve)).toFixed(3);
  llmStoredAnswer.style.transform = `translateX(${(lerp(1.1, 0, storedIn) + 0.2 * storedDissolve).toFixed(3)}cqw) scale(${(lerp(0.97, 1, storedIn) * (1 - 0.035 * storedDissolve)).toFixed(3)})`;
  storedAnswerStrike.style.transform = `scaleX(${storedStrikeIn.toFixed(3)}) rotate(-7deg)`;
  const patternsIn = smoothstep(51.5, 53.5, local);
  llmPatterns.style.opacity = patternsIn.toFixed(3);
  llmPatterns.querySelectorAll('i').forEach((node, index) => {
    node.style.opacity = String((patternsIn * (0.42 + 0.58 * (0.5 + 0.5 * Math.sin(local * 1.9 + index)))).toFixed(3));
    const driftX = Math.sin(local * 0.72 + index * 1.15) * 0.42;
    const driftY = Math.cos(local * 0.58 + index * 0.83) * 0.34;
    node.style.transform = `translate(${driftX.toFixed(2)}cqw, ${driftY.toFixed(2)}cqw) scale(${(0.72 + 0.4 * (0.5 + 0.5 * Math.sin(local * 1.35 + index * 0.7))).toFixed(3)})`;
  });
  const externalIn = smoothstep(58.6, 60.2, local);
  llmExternal.style.opacity = externalIn.toFixed(3);
  llmExternal.style.transform = `translateY(${lerp(0.8, 0, externalIn)}cqw)`;
  const routeProgress = smoothstep(59.2, 62.1, local) * externalIn;
  externalMapRoute.style.strokeDashoffset = (1 - routeProgress).toFixed(3);
  externalMapRoute.style.opacity = String(routeProgress.toFixed(3));
  const mapPoint = externalMapRoute.getPointAtLength(externalMapRouteLength * clamp(routeProgress, 0, .999));
  externalMapSignal.setAttribute('cx', mapPoint.x.toFixed(1));
  externalMapSignal.setAttribute('cy', mapPoint.y.toFixed(1));
  externalMapSignal.style.opacity = String((routeProgress > .03 ? externalIn : 0).toFixed(3));
  calendarDays.forEach((day, index) => {
    const weekend = index >= 5;
    const selectAt = 60.2 + Math.max(0, index - 5) * .9;
    const dayIn = smoothstep(59.8 + index * .12, 60.2 + index * .12, local) * externalIn;
    day.style.opacity = dayIn.toFixed(3);
    day.style.transform = `scale(${(weekend && local >= selectAt ? 1.08 : 1).toFixed(3)})`;
    day.classList.toggle('is-selected', weekend && local >= selectAt);
  });
  llmExternal.querySelectorAll('.external-app').forEach((app, index) => {
    const drift = Math.sin(local * 1.6 + index * 1.3) * .035 * externalIn;
    app.style.transform = `translateY(${drift.toFixed(3)}cqw)`;
  });

  drawLink(modelEdges[0].path, modelEdges[0].from, modelEdges[0].to, smoothstep(0.6, 2.0, local), promptIn * networkIn);
  drawLink(modelEdges[1].path, modelEdges[1].from, modelEdges[1].to, smoothstep(11.1, 13.2, local), candidateIn);
  const choiceToResponse = smoothstep(19.0, 21.0, local) * candidateIn * responseOpacity;
  drawLink(modelEdges[2].path, modelEdges[2].from, modelEdges[2].to, choiceToResponse, choiceToResponse);
  const loopIn = smoothstep(25.2, 27.0, local) * responseOpacity;
  drawLink(modelEdges[3].path, modelEdges[3].from, modelEdges[3].to, loopIn, loopIn * 0.72);
}

function renderToolOriginStory(time) {
  if (time < SECTION_FIVE_START) {
    toolOriginStory.style.opacity = '0';
    toolOriginStory.style.visibility = 'hidden';
    return;
  }
  const local = time - SECTION_FIVE_START;
  const enter = smoothstep(0.0, 1.15, local);
  const endFade = 1 - smoothstep(SECTION_SIX_START - 0.48, SECTION_SIX_START + 0.24, time);
  toolOriginStory.style.visibility = 'visible';
  toolOriginStory.style.opacity = (enter * endFade).toFixed(3);

  const modelIn = smoothstep(0.2, 1.25, local);
  originModel.style.opacity = modelIn.toFixed(3);
  originModel.style.transform = `translateX(${lerp(-1.1, 0, modelIn)}cqw) scale(${lerp(0.93, 1, modelIn).toFixed(3)})`;
  const liveNeed = smoothstep(2.1, 3.0, local);
  modelLiveNeed.style.opacity = liveNeed.toFixed(3);
  modelLiveNeed.style.transform = `scale(${(0.96 + 0.04 * Math.sin(local * 2.7) ** 2).toFixed(3)})`;

  const productIn = smoothstep(6.4, 7.8, local);
  aiProductBoundary.style.opacity = productIn.toFixed(3);
  aiProductBoundary.style.transform = `translateY(${lerp(1.1, 0, productIn)}cqw) scale(${lerp(0.97, 1, productIn).toFixed(3)})`;
  const builderIn = smoothstep(7.0, 8.0, local);
  builderBadge.style.opacity = builderIn.toFixed(3);
  builderBadge.style.transform = `translateY(${lerp(-.5, 0, builderIn)}cqw) scale(${lerp(.93, 1, builderIn).toFixed(3)})`;
  const buildPulse = 0.5 + 0.5 * Math.sin(local * 4.2) ** 2;
  builderBadge.style.boxShadow = `0 0 ${(0.5 + buildPulse * 0.85).toFixed(2)}cqw rgba(220,173,112,${(builderIn * 0.16).toFixed(3)})`;
  const builderBeam = builderBadge.querySelector('.builder-beam');
  builderBeam.style.transform = `scaleY(${(0.34 + 0.66 * buildPulse).toFixed(3)})`;
  builderBeam.style.opacity = String((builderIn * (0.36 + 0.5 * buildPulse)).toFixed(3));

  originToolCards.forEach((card, index) => {
    const p = smoothstep(14.3 + index * 0.44, 15.25 + index * 0.44, local);
    card.style.opacity = (productIn * p).toFixed(3);
    const floatY = Math.sin(local * 1.45 + index * 1.3) * 0.12;
    card.style.transform = `translateY(${(lerp(.72, 0, p) + floatY * p).toFixed(3)}cqw) scale(${lerp(.93, 1, p).toFixed(3)})`;
  });
  const servicesIn = smoothstep(14.8, 16.2, local);
  externalServiceCluster.style.opacity = (servicesIn * productIn).toFixed(3);
  serviceOrbs.forEach((orb, index) => {
    const p = smoothstep(15.3 + index * 0.42, 16.2 + index * 0.42, local);
    orb.style.opacity = (p * productIn).toFixed(3);
    orb.style.transform = `scale(${lerp(.78, 1, p).toFixed(3)}) translateY(${(Math.sin(local * 1.5 + index) * .1 * p).toFixed(3)}cqw)`;
  });

  const mapDefinitionIn = smoothstep(22.0, 23.1, local) * (1 - smoothstep(34.3, 35.3, local));
  mapToolDefinition.style.opacity = (productIn * mapDefinitionIn).toFixed(3);
  mapToolDefinition.style.transform = `translateY(${lerp(.7, 0, mapDefinitionIn)}cqw) scale(${lerp(.97, 1, mapDefinitionIn).toFixed(3)})`;
  const scanY = ((local - 22.0) * 0.45) % 1.2;
  mapToolDefinition.querySelector('.definition-scan').style.transform = `translateY(${scanY.toFixed(2)}cqw)`;

  const bookingIn = smoothstep(34.25, 35.45, local) * (1 - smoothstep(42.1, 43.1, local));
  bookingApproval.style.opacity = (productIn * bookingIn).toFixed(3);
  bookingApproval.style.transform = `translateY(${lerp(.55, 0, bookingIn)}cqw) scale(${lerp(.97, 1, bookingIn).toFixed(3)})`;
  bookingApproval.style.boxShadow = `0 0 ${(0.55 + .55 * Math.sin(local * 3.2) ** 2).toFixed(2)}cqw rgba(206,166,112,${(.12 + .08 * Math.sin(local * 3.2) ** 2).toFixed(3)})`;

  const mapHot = local >= 20.9 && local < 35.6;
  const bookingHot = local >= 34.0 && local < 43.0;
  originToolCards.forEach((card) => {
    const isMap = card.dataset.tool === 'map';
    const isBooking = card.dataset.tool === 'booking';
    card.classList.toggle('is-hot', (isMap && mapHot) || (isBooking && bookingHot));
    const dim = mapHot && !isMap ? 0.42 : bookingHot && !isBooking ? 0.55 : 1;
    card.style.filter = `brightness(${dim})`;
  });
  aiProductBoundary.style.borderColor = mapHot || bookingHot
    ? `rgba(144,226,207,${(0.38 + 0.22 * buildPulse).toFixed(3)})`
    : 'rgba(121,202,206,.35)';
  aiProductBoundary.style.boxShadow = mapHot || bookingHot
    ? `0 0 ${(1.35 + buildPulse * .85).toFixed(2)}cqw rgba(89,203,185,.14), inset 0 0 2.4cqw rgba(83,174,190,.04)`
    : '0 0 2.1cqw rgba(74,188,198,.09), inset 0 0 2.4cqw rgba(83,174,190,.035)';

  const ghostIn = smoothstep(42.4, 43.3, local) * (1 - smoothstep(47.2, 48.4, local));
  unavailableTool.style.opacity = ghostIn.toFixed(3);
  unavailableTool.style.transform = `translateX(${lerp(-.5, 0, ghostIn)}cqw) scale(${lerp(.9, 1, ghostIn).toFixed(3)})`;
  accessLock.style.opacity = ghostIn.toFixed(3);
  accessLock.style.transform = `scale(${(lerp(.78, 1, ghostIn) + .045 * ghostIn * Math.sin(local * 8) ** 2).toFixed(3)})`;
  const denyPulse = smoothstep(42.8, 43.8, local) * (1 - smoothstep(46.6, 47.5, local));
  accessLock.style.borderColor = `rgba(235,${Math.round(147 + 32 * denyPulse)},${Math.round(127 + 31 * denyPulse)},${(0.42 + .35 * denyPulse).toFixed(3)})`;

  originEdges.forEach((edge) => {
    const draw = smoothstep(edge.revealAt, edge.revealAt + (edge.className.includes('denied') ? .75 : 1.15), local);
    const denied = edge.className.includes('denied');
    const hold = edge.stay ? 1 : denied
      ? ghostIn
      : 1 - smoothstep(edge.revealAt + (edge.className.includes('service') ? 24 : 8.5), edge.revealAt + (edge.className.includes('service') ? 27 : 10.0), local);
    const opacity = denied ? draw * ghostIn * .78 : draw * hold * (edge.className.includes('builder') ? .52 : .58);
    drawLink(edge.path, edge.from, edge.to, edge.stay ? 1 : draw, opacity);
  });
}

function renderToolCallStory(time) {
  if (time < SECTION_SIX_START) {
    toolCallStory.style.opacity = '0';
    toolCallStory.style.visibility = 'hidden';
    callEdges.forEach(({ path }, index) => {
      path.style.opacity = '0';
      callSignalNodes[index].style.opacity = '0';
    });
    callRoutePath.style.strokeDashoffset = '1';
    callRouteSignal.style.opacity = '0';
    return;
  }

  const local = time - SECTION_SIX_START;
  const voice = time - SECTION_SIX_NARRATION_START;
  const sceneIn = smoothstep(SECTION_SIX_START, SECTION_SIX_START + 0.38, time);
  const sceneOut = 1 - smoothstep(SECTION_SEVEN_START - 0.55, SECTION_SEVEN_START + 0.15, time);
  toolCallStory.style.visibility = 'visible';
  toolCallStory.style.opacity = (sceneIn * sceneOut).toFixed(3);

  const needIn = smoothstep(0.04, 0.58, local);
  callNeed.style.opacity = needIn.toFixed(3);
  callNeed.style.transform = `translateY(${lerp(0.7, 0, needIn).toFixed(3)}cqw) scale(${lerp(.97, 1, needIn).toFixed(3)})`;
  callNeed.querySelector('.call-need-icons').style.transform = `scale(${(1 + .035 * Math.sin(local * 2.1) ** 2).toFixed(3)})`;

  const modelIn = smoothstep(0.08, 0.68, local);
  callModel.style.opacity = modelIn.toFixed(3);
  callModel.style.transform = `translateY(${lerp(.65, 0, modelIn).toFixed(3)}cqw)`;
  callModel.querySelector('.call-model-orb').style.transform = `scale(${(1 + .022 * Math.sin(local * 2.8) ** 2).toFixed(3)})`;

  const catalogIn = smoothstep(0.6, 1.7, voice);
  const catalogSettle = 1 - .3 * smoothstep(26.58, 33.0, voice);
  callCatalog.style.opacity = (catalogIn * catalogSettle).toFixed(3);
  callCatalog.style.transform = `translateY(${lerp(.7, 0, catalogIn).toFixed(3)}cqw) scale(${lerp(.98, 1, catalogIn).toFixed(3)})`;
  const match = smoothstep(9.9, 11.0, voice) * (1 - smoothstep(27.0, 29.0, voice));
  callToolCards.forEach((card, index) => {
    const cardIn = smoothstep(1.35 + index * .22, 2.65 + index * .22, voice);
    const isMap = card.dataset.callTool === 'map';
    const dim = match > .02 && !isMap ? lerp(1, .46, match) : 1;
    card.style.opacity = (catalogIn * catalogSettle * cardIn).toFixed(3);
    card.style.transform = `translateY(${lerp(.55, 0, cardIn).toFixed(3)}cqw) scale(${lerp(.97, 1, cardIn).toFixed(3)})`;
    card.style.filter = `brightness(${dim.toFixed(3)})`;
    card.classList.toggle('is-match', isMap && match > .12);
  });
  callMapCard.querySelector('.call-match-check').style.opacity = match.toFixed(3);
  callMapCard.querySelector('.call-match-check').style.transform = `scale(${lerp(.76, 1, match).toFixed(3)})`;

  const guidanceIn = smoothstep(18.56, 20.0, voice) * (1 - smoothstep(25.0, 27.4, voice));
  callGuidance.style.opacity = guidanceIn.toFixed(3);
  callGuidance.style.transform = `translateX(${lerp(-.45, 0, guidanceIn).toFixed(3)}cqw)`;
  callGuidance.querySelector('.guidance-icons').style.transform = `rotate(${(Math.sin(local * 1.8) * 1.8 * guidanceIn).toFixed(2)}deg)`;

  const requestIn = smoothstep(26.58, 28.25, voice) * (1 - smoothstep(39.4, 42.0, voice));
  callRequest.style.opacity = requestIn.toFixed(3);
  callRequest.style.transform = `translate(${lerp(-.55, 0, smoothstep(26.58, 28.25, voice)).toFixed(3)}cqw, ${lerp(.7, 0, requestIn).toFixed(3)}cqw) scale(${lerp(.97, 1, requestIn).toFixed(3)})`;
  const packetPulse = .5 + .5 * Math.sin(local * 4.2) ** 2;
  callRequest.querySelector('.request-sent-dot').style.opacity = String((requestIn * packetPulse).toFixed(3));

  const orchestratorIn = smoothstep(34.94, 36.4, voice);
  callOrchestrator.style.opacity = orchestratorIn.toFixed(3);
  callOrchestrator.style.transform = `translateY(${lerp(.8, 0, orchestratorIn).toFixed(3)}cqw) scale(${lerp(.98, 1, orchestratorIn).toFixed(3)})`;
  const originChecked = smoothstep(35.3, 36.8, voice);
  const destinationChecked = smoothstep(37.0, 38.5, voice);
  [originChecked, destinationChecked].forEach((check, index) => {
    const row = callOrchestrator.querySelectorAll('.orchestrator-checks span')[index];
    row.style.opacity = (orchestratorIn * (.38 + .62 * check)).toFixed(3);
    row.style.transform = `translateX(${lerp(-.25, 0, check).toFixed(3)}cqw)`;
  });
  const executeIn = smoothstep(38.2, 39.6, voice) * (1 - smoothstep(44.8, 46.0, voice));
  callOrchestrator.querySelector('.execute-label').style.opacity = executeIn.toFixed(3);

  const serviceIn = smoothstep(41.7, 43.1, voice);
  callMapService.style.opacity = serviceIn.toFixed(3);
  callMapService.style.transform = `translateX(${lerp(.65, 0, serviceIn).toFixed(3)}cqw) scale(${lerp(.97, 1, serviceIn).toFixed(3)})`;
  const searchPulse = smoothstep(41.7, 42.3, voice) * (1 - smoothstep(44.7, 45.5, voice));
  const routeProgress = smoothstep(42.15, 44.65, voice);
  callRouteMap.style.opacity = (serviceIn * .94).toFixed(3);
  callRoutePath.style.strokeDashoffset = (1 - routeProgress).toFixed(3);
  const routePoint = callRoutePath.getPointAtLength(callRouteLength * routeProgress);
  callRouteSignal.setAttribute('cx', routePoint.x.toFixed(2));
  callRouteSignal.setAttribute('cy', routePoint.y.toFixed(2));
  callRouteSignal.style.opacity = (serviceIn * smoothstep(42.2, 42.55, voice) * (1 - smoothstep(44.65, 45.08, voice))).toFixed(3);
  callMapLoading.style.opacity = searchPulse.toFixed(3);
  callMapLoading.querySelectorAll('i').forEach((dot, index) => {
    const beat = .55 + .45 * Math.sin(local * 7.5 - index * 1.35) ** 2;
    dot.style.transform = `translateY(${(-.2 * beat).toFixed(3)}cqw) scale(${(.72 + .42 * beat).toFixed(3)})`;
    dot.style.opacity = String((searchPulse * beat).toFixed(3));
  });
  callMapService.querySelector('.call-map-icon').style.boxShadow = `0 0 ${(0.65 + 1.2 * searchPulse).toFixed(2)}cqw rgba(100,197,209,${(.11 + .2 * searchPulse).toFixed(3)})`;

  const resultIn = smoothstep(45.32, 46.8, voice);
  callResult.style.opacity = resultIn.toFixed(3);
  callResult.style.transform = `translateY(${lerp(.75, 0, resultIn).toFixed(3)}cqw) scale(${lerp(.97, 1, resultIn).toFixed(3)})`;
  callResult.querySelector('.result-route-icon').style.transform = `translateX(${(Math.sin(local * 1.25) * .1 * resultIn).toFixed(3)}cqw)`;

  const contextIn = smoothstep(45.32, 48.0, voice);
  callContext.style.opacity = contextIn.toFixed(3);
  callContext.style.transform = `translateY(${lerp(.65, 0, contextIn).toFixed(3)}cqw) scale(${lerp(.98, 1, contextIn).toFixed(3)})`;
  const contextPulse = .4 + .6 * Math.sin(local * 2.6) ** 2;
  callContextPulse.style.opacity = String((contextIn * contextPulse).toFixed(3));
  callContextPulse.style.transform = `scale(${(.82 + .35 * contextPulse).toFixed(3)})`;

  const responseIn = smoothstep(49.86, 52.0, voice);
  callResponse.style.opacity = responseIn.toFixed(3);
  callResponse.style.transform = `translateY(${lerp(.65, 0, responseIn).toFixed(3)}cqw) scale(${lerp(.98, 1, responseIn).toFixed(3)})`;
  const responseCopy = 'Transit options are ready to compare.';
  callResponseText.textContent = responseCopy.slice(0, Math.floor(responseCopy.length * smoothstep(50.0, 56.0, voice)));

  const cautionIn = smoothstep(63.08, 65.0, voice);
  callCautions.style.opacity = cautionIn.toFixed(3);
  callCautions.style.transform = `translateY(${lerp(.7, 0, cautionIn).toFixed(3)}cqw)`;
  callCautions.querySelector('.call-warning').style.filter = `drop-shadow(0 0 ${(0.25 + .5 * Math.sin(local * 3.2) ** 2).toFixed(2)}cqw rgba(238,174,105,.55))`;

  const edgeStates = [
    [smoothstep(10.24, 11.7, voice), match * .78],
    [smoothstep(26.58, 28.0, voice), requestIn * .7],
    [smoothstep(34.94, 36.5, voice), requestIn * orchestratorIn * .72],
    [smoothstep(41.7, 43.0, voice), serviceIn * executeIn * .72],
    [smoothstep(45.32, 46.6, voice), resultIn * .72],
    [smoothstep(46.2, 47.7, voice), resultIn * contextIn * .68],
    [smoothstep(49.86, 51.2, voice), contextIn * responseIn * .7],
  ];
  callEdges.forEach((edge, index) => {
    const [reveal, opacity] = edgeStates[index];
    drawLink(edge.path, edge.from, edge.to, reveal, opacity);
    const pulseStarts = [10.24, 26.58, 34.94, 41.7, 45.32, 46.2, 49.86];
    const pulseSpeeds = [1.15, 1.3, 1.15, 1.55, 1.35, 1.05, 1.1];
    const signal = callSignalNodes[index];
    if (opacity <= .02 || reveal <= .02 || !edge.path.getAttribute('d')) {
      signal.style.opacity = '0';
      return;
    }
    const total = edge.path.getTotalLength();
    const phase = .12 + ((Math.max(0, voice - pulseStarts[index]) * pulseSpeeds[index]) % .76);
    const point = edge.path.getPointAtLength(total * phase);
    signal.setAttribute('cx', point.x.toFixed(1));
    signal.setAttribute('cy', point.y.toFixed(1));
    signal.style.opacity = String(Math.min(.96, opacity * 1.3).toFixed(3));
  });
}

function renderTrainingStory(time) {
  if (time < SECTION_SEVEN_START) {
    learningStory.style.opacity = '0';
    learningStory.style.visibility = 'hidden';
    learningSignals.forEach((signal) => { signal.style.opacity = '0'; });
    learningEdges.forEach(({ path }) => { path.style.opacity = '0'; });
    return;
  }

  const local = time - SECTION_SEVEN_START;
  const voice = time - SECTION_SEVEN_NARRATION_START;
  const sceneIn = smoothstep(SECTION_SEVEN_START, SECTION_SEVEN_START + 0.72, time);
  const sceneOut = 1 - smoothstep(SECTION_EIGHT_START - 0.62, SECTION_EIGHT_START + 0.08, time);
  learningStory.style.visibility = 'visible';
  learningStory.style.opacity = (sceneIn * sceneOut).toFixed(3);

  const corpusIn = smoothstep(.4, 1.8, voice) * (1 - smoothstep(9.4, 10.5, voice));
  trainingCorpus.style.opacity = corpusIn.toFixed(3);
  trainingCorpus.style.transform = `translateY(${(Math.sin(local * 1.2) * .08 * corpusIn).toFixed(3)}cqw) rotate(${(Math.sin(local * .62) * .18 * corpusIn).toFixed(2)}deg)`;
  trainingCorpus.querySelectorAll('.training-sample').forEach((node, index) => {
    node.style.transform = `translateX(${(Math.sin(local * 1.3 + index) * .05 * corpusIn).toFixed(3)}cqw)`;
  });

  const modelIn = smoothstep(0, .9, local);
  const networkPulse = .5 + .5 * Math.sin(local * 2.2) ** 2;
  trainingModel.style.opacity = modelIn.toFixed(3);
  trainingModel.style.transform = `translateY(${lerp(.42, 0, modelIn).toFixed(3)}cqw) scale(${(1 + .012 * networkPulse).toFixed(3)})`;
  trainingNetwork.style.transform = `perspective(34cqw) rotateY(${(Math.sin(local * .34) * 3.2).toFixed(2)}deg) rotateX(${(Math.cos(local * .3) * 1.8).toFixed(2)}deg) scale(${(1 + .014 * networkPulse).toFixed(3)})`;
  trainingNeurons.forEach((node, index) => {
    const layer = Math.floor(index / TRAINING_NODE_Y.length);
    const wave = (local * .2) % 1;
    const pass = Math.max(0, 1 - Math.abs(wave - layer / (TRAINING_LAYER_X.length - 1)) * 4.0);
    const glow = .16 + .58 * pass + .18 * (.5 + .5 * Math.sin(local * 2.45 + index * .71));
    node.style.opacity = (modelIn * glow).toFixed(3);
    node.style.transform = `translate(-50%, -50%) scale(${(.78 + .42 * glow).toFixed(3)})`;
    node.style.boxShadow = `0 0 ${(0.25 + .52 * glow).toFixed(2)}cqw rgba(112,222,210,${(.1 + .3 * glow).toFixed(3)})`;
  });
  trainingNetworkWires.querySelectorAll('.training-wire').forEach((wire, index) => {
    const layer = Number(wire.dataset.layer);
    const pulse = Math.max(0, 1 - Math.abs((local * .2) % 1 - (layer + .5) / 3) * 3.5);
    wire.style.opacity = (modelIn * (.08 + .2 * networkPulse + .36 * pulse)).toFixed(3);
    wire.style.strokeDashoffset = `${(-local * 1.7 - index * .12).toFixed(2)}`;
  });
  trainingModel.querySelector('.training-model-core').style.transform = `translate(-50%,-50%) scale(${(1 + .045 * networkPulse).toFixed(3)})`;
  trainingModel.querySelectorAll('.training-model-core i').forEach((ring, index) => {
    const speed = [15, -10, 7][index];
    ring.style.transform = `rotate(${(local * speed).toFixed(2)}deg)`;
  });

  const predictionIn = smoothstep(10.1, 11.2, voice) * (1 - smoothstep(26.0, 27.1, voice));
  trainingPrediction.style.opacity = predictionIn.toFixed(3);
  trainingPrediction.style.transform = `translateX(${lerp(.55, 0, predictionIn).toFixed(3)}cqw) scale(${lerp(.98, 1, predictionIn).toFixed(3)})`;
  const targetIn = smoothstep(15.1, 16.0, voice) * (1 - smoothstep(26.0, 27.0, voice));
  trainingTarget.style.opacity = (targetIn * predictionIn).toFixed(3);
  trainingTarget.style.transform = `translateY(${lerp(.18, 0, targetIn).toFixed(3)}cqw)`;
  const compareIn = smoothstep(16.0, 16.9, voice) * (1 - smoothstep(26.0, 27.0, voice));
  trainingCompare.style.opacity = (compareIn * predictionIn).toFixed(3);
  trainingCompare.style.transform = `translateY(${lerp(.16, 0, compareIn).toFixed(3)}cqw)`;
  const learningProgress = smoothstep(20.8, 25.6, voice);
  const corrected = learningProgress > .56;
  trainingBudgetMeter.style.opacity = (compareIn * predictionIn).toFixed(3);
  trainingBudgetMeter.style.transform = `translateY(${lerp(.2, 0, compareIn).toFixed(3)}cqw)`;
  trainingGuessFill.style.width = `${lerp(50, 80, learningProgress).toFixed(1)}%`;
  trainingTargetFill.style.width = '80%';
  trainingGuessAmount.textContent = corrected ? '$8K' : '$5K';
  trainingPredictionWord.textContent = corrected ? 'eight' : 'five';
  trainingCompareLabel.textContent = corrected ? 'AFTER UPDATE' : 'COMPARE';
  trainingCompareResult.textContent = corrected ? 'MATCH' : 'MISMATCH';
  trainingCompare.classList.toggle('is-correct', corrected);
  trainingPrediction.classList.toggle('is-correct', corrected);

  const parametersIn = smoothstep(18.2, 19.5, voice) * (1 - smoothstep(30.6, 31.8, voice));
  trainingParameters.style.opacity = parametersIn.toFixed(3);
  trainingParameters.style.transform = `translateY(${lerp(.4, 0, parametersIn).toFixed(3)}cqw) scale(${lerp(.98, 1, parametersIn).toFixed(3)})`;
  trainingUpdate.textContent = voice < 26.6 ? 'ADJUST · TRY AGAIN' : 'NUDGE · REPEAT';
  trainingDials.forEach((dial, index) => {
    const adjustment = lerp(-34 + index * 18, 12 - index * 10, learningProgress);
    const motion = Math.sin(local * 1.7 + index * 1.4) * (1.8 + 3.3 * learningProgress);
    dial.style.transform = `rotate(${(adjustment + motion).toFixed(2)}deg)`;
    const energy = parametersIn * (.22 + .68 * learningProgress) * (.5 + .5 * Math.sin(local * 2.2 + index * .8) ** 2);
    dial.style.setProperty('--dial-energy', (.22 + .62 * (.5 + .5 * Math.sin(local * 2.0 + index))).toFixed(3));
    dial.style.boxShadow = `0 0 ${(0.3 + 1.05 * energy).toFixed(2)}cqw rgba(126,238,196,${(.16 + .48 * energy).toFixed(3)})`;
  });
  const compareIcon = trainingCompare.querySelector('.compare-icon');
  compareIcon.querySelector('b').textContent = corrected ? '✓' : '≠';
  compareIcon.style.transform = `scale(${(1 + .06 * Math.sin(local * 3.1) ** 2 * compareIn).toFixed(3)}) rotate(${(corrected ? 0 : Math.sin(local * 2.1) * 3).toFixed(2)}deg)`;

  const instructionIn = smoothstep(36.4, 37.3, voice) * (1 - smoothstep(39.9, 40.8, voice));
  trainingInstruction.style.opacity = instructionIn.toFixed(3);
  trainingInstruction.style.transform = `translateX(${lerp(-.35, 0, instructionIn).toFixed(3)}cqw) scale(${lerp(.985, 1, instructionIn).toFixed(3)})`;
  const instructionUserIn = smoothstep(36.5, 37.3, voice);
  const instructionAssistantIn = smoothstep(37.45, 38.35, voice);
  trainingInstruction.querySelector('.instruction-user').style.clipPath = `inset(0 ${(100 - instructionUserIn * 100).toFixed(2)}% 0 0 round .25cqw)`;
  trainingInstruction.querySelector('.instruction-assistant').style.clipPath = `inset(0 ${(100 - instructionAssistantIn * 100).toFixed(2)}% 0 0 round .25cqw)`;
  trainingInstruction.querySelector('.instruction-user').style.transform = `translateX(${lerp(-.25, 0, instructionUserIn).toFixed(3)}cqw)`;
  trainingInstruction.querySelector('.instruction-assistant').style.transform = `translateX(${lerp(-.25, 0, instructionAssistantIn).toFixed(3)}cqw)`;
  const preferenceIn = smoothstep(40.0, 40.8, voice) * (1 - smoothstep(43.9, 44.8, voice));
  trainingPreference.style.opacity = preferenceIn.toFixed(3);
  trainingPreference.style.transform = `translateY(${lerp(.3, 0, preferenceIn).toFixed(3)}cqw)`;
  const preferenceSignal = smoothstep(41.05, 42.05, voice);
  trainingPreference.querySelectorAll('.preference-thumb').forEach((thumb, index) => {
    const signal = index === 1 ? preferenceSignal : 1 - preferenceSignal * .6;
    thumb.style.opacity = (preferenceIn * signal).toFixed(3);
    thumb.style.transform = `scale(${(index === 1 ? 1 + .18 * preferenceSignal * (.5 + .5 * Math.sin(local * 4) ** 2) : 1 - .08 * preferenceSignal).toFixed(3)})`;
    thumb.style.boxShadow = index === 1 && preferenceSignal > .05
      ? `0 0 ${(0.25 + .72 * preferenceSignal).toFixed(2)}cqw rgba(112, 227, 173, ${(0.12 + .32 * preferenceSignal).toFixed(3)})`
      : 'none';
  });
  trainingPreference.querySelector('.preferred').style.boxShadow = `0 0 ${(preferenceSignal * .85).toFixed(2)}cqw rgba(107, 218, 165, ${(preferenceSignal * .24).toFixed(3)})`;
  const toolExampleIn = smoothstep(44.8, 45.6, voice) * (1 - smoothstep(49.0, 49.9, voice));
  trainingToolExample.style.opacity = toolExampleIn.toFixed(3);
  trainingToolExample.style.transform = `translateX(${lerp(.35, 0, toolExampleIn).toFixed(3)}cqw) scale(${lerp(.985, 1, toolExampleIn).toFixed(3)})`;
  trainingToolExample.querySelector('.training-map-icon').style.boxShadow = `0 0 ${(0.4 + .6 * Math.sin(local * 2.1) ** 2).toFixed(2)}cqw rgba(102,207,211,${(.1 + .14 * toolExampleIn).toFixed(3)})`;
  const trainingRouteProgress = smoothstep(45.2, 47.8, voice) * toolExampleIn;
  trainingMapRoute.style.strokeDashoffset = (1 - trainingRouteProgress).toFixed(3);
  const trainingRoutePoint = trainingMapRoute.getPointAtLength(trainingMapRouteLength * clamp(trainingRouteProgress, 0, .999));
  trainingMapSignal.setAttribute('cx', trainingRoutePoint.x.toFixed(1));
  trainingMapSignal.setAttribute('cy', trainingRoutePoint.y.toFixed(1));
  trainingMapSignal.style.opacity = String((toolExampleIn * (trainingRouteProgress > .03 ? 1 : .35)).toFixed(3));

  const earlyLibrary = smoothstep(32.4, 33.2, voice) * (1 - smoothstep(35.7, 36.4, voice));
  const lateLibrary = smoothstep(51.3, 52.1, voice) * (1 - smoothstep(54.8, 55.5, voice));
  const libraryIn = Math.max(earlyLibrary, lateLibrary);
  trainingLibrary.style.opacity = libraryIn.toFixed(3);
  trainingLibrary.style.transform = `translateY(${lerp(.28, 0, libraryIn).toFixed(3)}cqw) scale(${lerp(.985, 1, libraryIn).toFixed(3)})`;
  const crossReveal = Math.max(smoothstep(33.3, 34.1, voice) * earlyLibrary, smoothstep(52.1, 52.9, voice) * lateLibrary);
  trainingLibrary.querySelector('.library-cross').style.transform = `scaleX(${crossReveal.toFixed(3)}) rotate(-8deg)`;
  trainingLibrary.querySelectorAll('div i').forEach((item, index) => {
    item.style.transform = `translateY(${(Math.sin(local * 1.6 + index) * .045 * libraryIn).toFixed(3)}cqw)`;
  });

  const generatedIn = smoothstep(55.2, 56.1, voice) * (1 - smoothstep(59.2, 60.0, voice));
  trainingGenerated.style.opacity = generatedIn.toFixed(3);
  trainingGenerated.style.transform = `translateY(${lerp(.3, 0, generatedIn).toFixed(3)}cqw) scale(${lerp(.985, 1, generatedIn).toFixed(3)})`;
  const cautionIn = smoothstep(59.5, 60.3, voice);
  trainingCautions.style.opacity = cautionIn.toFixed(3);
  trainingCautions.style.transform = `translateY(${lerp(.25, 0, cautionIn).toFixed(3)}cqw)`;
  trainingCautionCards.forEach((card, index) => {
    const starts = [59.7, 61.4, 63.1];
    const itemIn = smoothstep(starts[index], starts[index] + .55, voice);
    card.style.opacity = itemIn.toFixed(3);
    card.style.transform = `translateY(${(lerp(.22, 0, itemIn) + Math.sin(local * 2.1 + index) * .045 * itemIn).toFixed(3)}cqw) scale(${lerp(.96, 1, itemIn).toFixed(3)})`;
    const trailProgress = smoothstep(starts[index] + .16, starts[index] + 1.25, voice);
    const path = trainingCautionPaths[index];
    const signal = trainingCautionSignals[index];
    path.style.strokeDashoffset = (1 - trailProgress).toFixed(3);
    const point = path.getPointAtLength(trainingCautionPathLengths[index] * clamp(trailProgress, 0, .999));
    signal.setAttribute('cx', point.x.toFixed(1));
    signal.setAttribute('cy', point.y.toFixed(1));
    signal.style.opacity = (itemIn * (trailProgress > .02 ? 1 : 0)).toFixed(3);
    const impact = smoothstep(starts[index] + .38, starts[index] + 1.05, voice);
    card.querySelectorAll('.caution-wrong-mark, .caution-uncertain').forEach((mark) => {
      mark.style.opacity = impact.toFixed(3);
      mark.style.transform = `scale(${lerp(.65, 1, impact).toFixed(3)})`;
      mark.style.transformOrigin = 'center';
    });
    const spark = card.querySelector('.caution-spark');
    if (spark) spark.style.opacity = (itemIn * (.55 + .45 * Math.sin(local * 3.2) ** 2)).toFixed(3);
  });

  const postExampleIn = Math.max(instructionIn, preferenceIn, toolExampleIn);
  const feedbackWindow = smoothstep(18.1, 19.0, voice) * (1 - smoothstep(25.2, 26.0, voice));
  const edgeStates = [
    [smoothstep(.4, 1.9, voice), corpusIn * modelIn * .55, .4, .18],
    [smoothstep(10.1, 11.4, voice), predictionIn * modelIn * .62, 10.1, .2],
    [smoothstep(16.0, 17.2, voice), compareIn * parametersIn * feedbackWindow * .96, 16.0, .33],
    [parametersIn > .02 ? 1 : 0, parametersIn * modelIn * feedbackWindow * (.72 + .1 * networkPulse), 18.2, .33],
    [smoothstep(36.3, 37.5, voice), postExampleIn * modelIn * .52, 36.3, .18],
    [smoothstep(55.1, 56.3, voice), generatedIn * modelIn * .56, 55.1, .22],
  ];
  learningEdges.forEach((edge, index) => {
    const [reveal, opacity, pulseStart, speed] = edgeStates[index];
    drawLink(edge.path, edge.from, edge.to, reveal, opacity);
    const signal = learningSignals[index];
    if (opacity <= .015 || reveal <= .015 || !edge.path.getAttribute('d')) {
      signal.style.opacity = '0';
      return;
    }
    const cycle = (Math.max(0, voice - pulseStart) * speed + index * .13) % 1;
    const feedback = index === 2 || index === 3;
    const phase = feedback ? .18 + cycle * .64 : cycle;
    const total = edge.path.getTotalLength();
    const point = edge.path.getPointAtLength(total * phase);
    if (feedback) {
      const ahead = edge.path.getPointAtLength(Math.min(total, total * phase + 4));
      const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180 / Math.PI;
      signal.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
    } else {
      signal.setAttribute('cx', point.x.toFixed(1));
      signal.setAttribute('cy', point.y.toFixed(1));
    }
    signal.style.opacity = String(Math.min(.82, opacity * (1.08 + .18 * networkPulse)).toFixed(3));
  });
}

function renderConsistencyStory(time) {
  if (time < SECTION_EIGHT_START) {
    consistencyStory.style.opacity = '0';
    consistencyStory.style.visibility = 'hidden';
    consistencyEdges.forEach(({ path }) => { path.style.opacity = '0'; });
    consistencySignals.forEach((signal) => { signal.style.opacity = '0'; });
    return;
  }

  const local = time - SECTION_EIGHT_START;
  const voice = time - SECTION_EIGHT_NARRATION_START;
  const enter = smoothstep(SECTION_EIGHT_START, SECTION_EIGHT_START + .78, time);
  const outro = 1 - smoothstep(DURATION - .58, DURATION, time);
  consistencyStory.style.visibility = 'visible';
  consistencyStory.style.opacity = (enter * outro).toFixed(3);

  const promptIn = smoothstep(.25, 1.35, local) * (1 - smoothstep(58.1, 59.3, voice));
  consistencyPrompt.style.opacity = promptIn.toFixed(3);
  consistencyPrompt.style.transform = `translateX(${lerp(-.65, 0, promptIn).toFixed(3)}cqw) rotateY(${(Math.sin(local * .38) * .35 * promptIn).toFixed(2)}deg)`;
  consistencyPrompt.querySelector(':scope > p').style.transform = `translateX(${(Math.sin(local * .7) * .045 * promptIn).toFixed(3)}cqw)`;
  const contextIn = smoothstep(38.0, 39.2, voice) * (1 - smoothstep(58.0, 59.25, voice));
  consistencyPrompt.style.height = `${lerp(28, 35, contextIn).toFixed(2)}%`;
  contextAdditions.style.opacity = contextIn.toFixed(3);
  contextAdditions.style.transform = `translateY(${lerp(.35, 0, contextIn).toFixed(3)}cqw)`;
  contextAdditions.querySelectorAll('span').forEach((chip, index) => {
    const chipIn = smoothstep(38.0 + index * 1.05, 38.52 + index * 1.05, voice);
    chip.style.opacity = chipIn.toFixed(3);
    chip.style.transform = `translateY(${lerp(.16, 0, chipIn).toFixed(3)}cqw)`;
  });

  const modelIn = smoothstep(.4, 1.5, local) * (1 - smoothstep(57.0, 59.25, voice));
  const pulse = .5 + .5 * Math.sin(local * 2.25) ** 2;
  consistencyModel.style.opacity = modelIn.toFixed(3);
  consistencyModel.style.transform = `translateY(${lerp(.38, 0, modelIn).toFixed(3)}cqw) scale(${(1 + .012 * pulse).toFixed(3)})`;
  consistencyModel.querySelectorAll('.network-column b').forEach((node, index) => {
    const column = Math.floor(index / 3);
    const wave = (local * .22) % 1;
    const signal = Math.max(0, 1 - Math.abs(wave - column / 3) * 3.8);
    const glow = .22 + .56 * signal + .16 * Math.sin(local * 2.3 + index * .8) ** 2;
    node.style.opacity = (modelIn * glow).toFixed(3);
    node.style.transform = `scale(${(.78 + .38 * glow).toFixed(3)})`;
  });
  const modelPulse = consistencyModel.querySelector('.network-pulse');
  modelPulse.style.transform = `translate(-50%, -50%) scale(${(1 + .055 * pulse).toFixed(3)})`;
  modelPulse.style.boxShadow = `0 0 ${(1.6 + 1.1 * pulse).toFixed(2)}cqw rgba(72, 194, 185, .28)`;

  const candidateIn = smoothstep(14.35, 15.15, voice) * (1 - smoothstep(31.7, 32.65, voice));
  const variationIn = smoothstep(32.0, 32.85, voice) * (1 - smoothstep(37.35, 38.2, voice));
  const decodeIn = Math.max(candidateIn, variationIn);
  decodingCard.style.opacity = decodeIn.toFixed(3);
  decodingCard.style.transform = `translateX(${lerp(.48, 0, decodeIn).toFixed(3)}cqw) scale(${lerp(.985, 1, decodeIn).toFixed(3)})`;
  candidateChoice.style.opacity = candidateIn.toFixed(3);
  candidateChoice.style.transform = `translateY(${lerp(.22, 0, candidateIn).toFixed(3)}cqw)`;
  variationControl.style.opacity = variationIn.toFixed(3);
  variationControl.style.transform = `translateY(${lerp(.24, 0, variationIn).toFixed(3)}cqw)`;
  decodingCard.querySelector(':scope > small').textContent = variationIn > candidateIn ? 'SAMPLING SETTING' : 'NEXT TOKEN OPTIONS';
  variationNeedle.style.left = `${lerp(24, 77, smoothstep(32.0, 37.0, voice)).toFixed(1)}%`;

  const branchIn = smoothstep(21.15, 22.15, voice) * (1 - smoothstep(58.0, 59.25, voice));
  const firstChoiceProgress = smoothstep(21.35, 22.0, voice);
  const secondChoiceProgress = smoothstep(22.1, 22.85, voice);
  branchChoiceTokens.forEach((token, index) => {
    const tokenProgress = index % 2 === 0 ? firstChoiceProgress : secondChoiceProgress;
    token.style.opacity = (branchIn * tokenProgress).toFixed(3);
    token.style.transform = `translateY(${lerp(.2, 0, tokenProgress).toFixed(3)}cqw) scale(${lerp(.96, 1, tokenProgress).toFixed(3)})`;
  });
  [answerBranchA, answerBranchB].forEach((branch, index) => {
    const offset = index === 0 ? -.28 : .28;
    branch.style.opacity = branchIn.toFixed(3);
    branch.style.transform = `translateY(${(lerp(.35, 0, branchIn) + Math.sin(local * .72 + index * 1.7) * .055 * branchIn).toFixed(3)}cqw) rotate(${(offset * pulse).toFixed(3)}deg)`;
    branch.style.borderColor = index === 0
      ? `rgba(130, 164, 211, ${(0.24 + .14 * pulse * branchIn).toFixed(3)})`
      : `rgba(111, 193, 179, ${(0.24 + .14 * (1 - pulse) * branchIn).toFixed(3)})`;
    const routeProgress = smoothstep(22.35, 24.85, voice) * branchIn;
    const route = branchRoutePaths[index];
    route.style.strokeDashoffset = (1 - routeProgress).toFixed(3);
    route.style.opacity = routeProgress.toFixed(3);
    const routePoint = route.getPointAtLength(branchRouteLengths[index] * clamp(routeProgress, 0, .999));
    branchRouteSignals[index].setAttribute('cx', routePoint.x.toFixed(1));
    branchRouteSignals[index].setAttribute('cy', routePoint.y.toFixed(1));
    branchRouteSignals[index].style.opacity = (branchIn * (routeProgress > .03 ? .95 : 0)).toFixed(3);
  });

  const consequencesIn = smoothstep(51.5, 52.6, voice) * (1 - smoothstep(58.85, 59.45, voice));
  consequenceRow.style.opacity = consequencesIn.toFixed(3);
  consequenceRow.style.transform = `translateY(${lerp(.28, 0, consequencesIn).toFixed(3)}cqw)`;
  consequenceCards.forEach((card, index) => {
    const starts = [51.8, 53.7, 55.6];
    const itemIn = smoothstep(starts[index], starts[index] + .62, voice);
    card.style.opacity = itemIn.toFixed(3);
    card.style.transform = `translateY(${(lerp(.2, 0, itemIn) + Math.sin(local * 1.8 + index) * .04 * itemIn).toFixed(3)}cqw) scale(${(1 + .045 * Math.sin(local * 2.0 + index) ** 2 * itemIn).toFixed(3)})`;
    const path = consequenceMotionPaths[index];
    const signal = consequenceSignals[index];
    const trailProgress = smoothstep(starts[index] + .15, starts[index] + 1.6, voice);
    path.style.strokeDashoffset = (1 - trailProgress).toFixed(3);
    const phase = clamp((voice - starts[index] - .15) * .48, 0, .999);
    const point = path.getPointAtLength(consequencePathLengths[index] * phase);
    signal.setAttribute('cx', point.x.toFixed(1));
    signal.setAttribute('cy', point.y.toFixed(1));
    signal.style.opacity = (itemIn * (trailProgress > .03 ? 1 : 0)).toFixed(3);
    const art = card.querySelector('.consequence-art');
    art.style.transform = `scale(${(1 + .025 * Math.sin(local * 2.3 + index) ** 2 * itemIn).toFixed(3)})`;
  });

  const reliabilityIn = smoothstep(59.65, 60.7, voice) * (1 - smoothstep(73.8, 75.2, voice));
  reliabilityCard.style.opacity = reliabilityIn.toFixed(3);
  reliabilityCard.style.transform = `translateY(${lerp(.42, 0, reliabilityIn).toFixed(3)}cqw) scale(${lerp(.985, 1, reliabilityIn).toFixed(3)})`;
  reliabilityCard.querySelectorAll(':scope > div span').forEach((item, index) => {
    const itemIn = smoothstep(65.65 + index * .85, 66.55 + index * .85, voice) * reliabilityIn;
    item.style.opacity = itemIn.toFixed(3);
    item.style.transform = `translateY(${lerp(.18, 0, itemIn).toFixed(3)}cqw)`;
  });

  const reflectionIn = smoothstep(73.95, 75.45, voice);
  endingReflection.style.visibility = reflectionIn > .01 ? 'visible' : 'hidden';
  endingReflection.style.opacity = reflectionIn.toFixed(3);
  const nodeStarts = [74.15, 77.35, 81.1, 84.8];
  endingNodes.forEach((node, index) => {
    const nodeIn = smoothstep(nodeStarts[index], nodeStarts[index] + 1.15, voice);
    node.style.opacity = (nodeIn * reflectionIn).toFixed(3);
    node.style.transform = `translateY(${lerp(.5, 0, nodeIn).toFixed(3)}cqw) scale(${lerp(.94, 1, nodeIn).toFixed(3)})`;
  });
  const linkStarts = [74.55, 78.25, 82.0];
  endingFlowPaths.forEach((path, index) => {
    const reveal = smoothstep(linkStarts[index], linkStarts[index] + 2.35, voice) * reflectionIn;
    path.style.strokeDashoffset = (1 - reveal).toFixed(3);
    const phase = clamp((voice - linkStarts[index]) * .42, 0, .999);
    const point = path.getPointAtLength(endingFlowLengths[index] * phase);
    endingFlowSignals[index].setAttribute('cx', point.x.toFixed(1));
    endingFlowSignals[index].setAttribute('cy', point.y.toFixed(1));
    endingFlowSignals[index].style.opacity = (reveal > .03 ? Math.min(.98, reflectionIn) : 0).toFixed(3);
  });
  const endingCheck = endingReflection.querySelector('.ending-check');
  const checkProgress = smoothstep(82.0, 85.2, voice);
  endingCheck.style.opacity = (checkProgress * reflectionIn).toFixed(3);
  endingCheck.style.strokeDasharray = String(endingCheck.getTotalLength());
  endingCheck.style.strokeDashoffset = (endingCheck.getTotalLength() * (1 - checkProgress)).toFixed(2);
  const questionMark = endingReflection.querySelector('.ending-question-mark');
  const questionIn = smoothstep(84.8, 86.1, voice) * reflectionIn;
  questionMark.style.opacity = questionIn.toFixed(3);
  questionMark.style.transform = `scale(${lerp(.5, 1, questionIn).toFixed(3)})`;

  const edgeStates = [
    [smoothstep(.35, 1.9, local), promptIn * modelIn * .66, .35, .22],
    [smoothstep(14.2, 15.4, voice), candidateIn * modelIn * .72, 14.2, .25],
    [smoothstep(21.0, 22.4, voice), branchIn * modelIn * .62, 21.0, .19],
    [smoothstep(21.0, 22.4, voice), branchIn * modelIn * .62, 21.0, .19],
  ];
  consistencyEdges.forEach((edge, index) => {
    const [reveal, opacity, pulseStart, speed] = edgeStates[index];
    drawLink(edge.path, edge.from, edge.to, reveal, opacity);
    const signal = consistencySignals[index];
    if (opacity <= .015 || reveal <= .015 || !edge.path.getAttribute('d')) {
      signal.style.opacity = '0';
      return;
    }
    const phase = (Math.max(0, (index === 0 ? local : voice) - pulseStart) * speed + index * .19) % 1;
    const point = edge.path.getPointAtLength(edge.path.getTotalLength() * phase);
    signal.setAttribute('cx', point.x.toFixed(1));
    signal.setAttribute('cy', point.y.toFixed(1));
    signal.style.opacity = String(Math.min(.9, opacity * 1.2).toFixed(3));
  });
}

function updateParticleField(time, sectionTwoTime) {
  if (!sparkCloud || !sparkMaterial) return;
  const assistantBurst = smoothstep(9.45, 10.25, time) * (1 - smoothstep(16.0, 17.5, time));
  const tokenBurst = smoothstep(0.0, 2.2, sectionTwoTime) * (1 - smoothstep(29.0, 31.2, sectionTwoTime));
  const relationBurst = smoothstep(SECTION_THREE_START + 2.0, SECTION_THREE_START + 6.0, time)
    * (1 - smoothstep(SECTION_THREE_START + 20.0, SECTION_THREE_START + 25.0, time));
  const inferenceBurst = smoothstep(SECTION_THREE_START + 25.0, SECTION_THREE_START + 30.0, time)
    * (1 - smoothstep(SECTION_THREE_START + 49.0, SECTION_THREE_START + 53.0, time));
  const generationFlow = smoothstep(SECTION_FOUR_START + 1.0, SECTION_FOUR_START + 5.0, time)
    * (1 - smoothstep(SECTION_FIVE_START - 2.0, SECTION_FIVE_START + 1.5, time));
  const toolDefinitionFlow = smoothstep(SECTION_FIVE_START + 1.0, SECTION_FIVE_START + 5.0, time)
    * (1 - smoothstep(SECTION_SIX_START - 2.0, SECTION_SIX_START + 1.5, time));
  const toolCallFlow = smoothstep(SECTION_SIX_START + 1.0, SECTION_SIX_START + 5.0, time)
    * (1 - smoothstep(SECTION_SEVEN_START - 2.0, SECTION_SEVEN_START + 0.3, time));
  const trainingFlow = smoothstep(SECTION_SEVEN_START + 1.0, SECTION_SEVEN_START + 5.0, time)
    * (1 - smoothstep(SECTION_EIGHT_START - 3.0, SECTION_EIGHT_START - 0.4, time));
  const consistencyFlow = smoothstep(SECTION_EIGHT_START + 1.0, SECTION_EIGHT_START + 5.0, time)
    * (1 - smoothstep(DURATION - 3.0, DURATION - 0.4, time));
  const laterMotion = Math.max(generationFlow * 0.7, toolDefinitionFlow * 0.78, toolCallFlow * 0.86, trainingFlow * 0.9, consistencyFlow * 0.88);
  const intensity = Math.max(assistantBurst, tokenBurst * 0.92, relationBurst * 0.65, inferenceBurst * 0.42, laterMotion);
  sparkMaterial.opacity = 0.58 * intensity + 0.14 * laterMotion;
  sparkMaterial.size = 0.045 + 0.065 * intensity;

  const attr = sparkGeometry.attributes.position;
  for (let i = 0; i < sparkParams.length; i += 1) {
    const p = sparkParams[i];
    const orbitTime = time * p.speed;
    const angle = p.phase + orbitTime + sectionTwoTime * 0.05;
    const compression = 1 - smoothstep(0, 19, sectionTwoTime) * 0.56;
    const radius = p.radius * compression + Math.sin(orbitTime * 1.5 + p.phase) * (0.12 + 0.24 * intensity);
    const flow = Math.sin(orbitTime * 0.7 + p.phase) * 0.45;
    attr.array[i * 3] = Math.cos(angle) * radius + flow;
    attr.array[i * 3 + 1] = Math.sin(angle) * radius * 0.48 + Math.cos(orbitTime + p.phase) * p.height * 0.18;
    attr.array[i * 3 + 2] = -1.1 - p.drift * 1.8;
  }
  attr.needsUpdate = true;
}

/** Set the complete visual state from an absolute point on the narration clock. */
function renderAt(seconds) {
  const t = clamp(seconds, 0, DURATION);
  const sectionTwoTime = clamp(t - SECTION_TWO_START, 0, SECTION_TWO_DURATION);
  const sectionOneOpacity = 1 - smoothstep(PROMPT_TRANSITION_START, 24.95, t);
  sceneOne.style.opacity = sectionOneOpacity.toFixed(3);
  sceneOne.style.visibility = t >= 24.96 ? 'hidden' : 'visible';
  const tokenStoryFade = 1 - smoothstep(SECTION_FOUR_START - 0.72, SECTION_FOUR_START + 0.42, t);
  tokenStory.style.opacity = t < PROMPT_TRANSITION_START ? '0' : tokenStoryFade.toFixed(3);
  tokenStory.style.visibility = t < PROMPT_TRANSITION_START || t > SECTION_FOUR_START + 0.48 ? 'hidden' : 'visible';

  // Section 01: assemble the assistant, type in the fixed bottom composer, send, then receive.
  const cardEntry = smoothstep(0.0, 1.55, t);
  assistantCard.style.setProperty('--card-entry', cardEntry.toFixed(3));
  assistantCard.style.setProperty('--edge-draw', smoothstep(0.12, 1.3, t).toFixed(3));
  assistantCard.style.transform = `translate(-50%, -50%) perspective(1400px) rotateX(${lerp(6, 0, cardEntry).toFixed(2)}deg) scale(${lerp(0.94, 1, cardEntry).toFixed(3)})`;
  assistantHeader.style.opacity = smoothstep(0.35, 1.1, t).toFixed(3);
  assistantHeader.style.transform = `translateY(${lerp(-8, 0, smoothstep(0.35, 1.1, t)).toFixed(2)}px)`;

  const composeEntry = smoothstep(0.75, 1.55, t);
  composer.style.opacity = composeEntry.toFixed(3);
  composer.style.transform = `translateY(${lerp(18, 0, composeEntry).toFixed(2)}px) scale(${lerp(0.98, 1, composeEntry).toFixed(3)})`;
  const typeProgress = clamp((t - 3.9) / (9.3 - 3.9));
  const typedCount = Math.floor(PROMPT.length * typeProgress);
  composerPrompt.textContent = PROMPT.slice(0, typedCount);
  composerPlaceholder.style.opacity = typeProgress > 0 && t < 10.15 ? '0' : '1';
  const typing = t >= 3.9 && t < 9.42;
  cursor.style.opacity = typing && Math.floor(t * 2.2) % 2 === 0 ? '1' : '0';
  cursor.style.transform = `scaleY(${0.8 + 0.2 * Math.sin(t * 3.5) ** 2})`;
  const sent = smoothstep(9.42, 10.08, t);
  composerPrompt.style.opacity = (1 - sent).toFixed(3);
  composerSend.style.transform = `translateY(-50%) scale(${lerp(1, 1.32, smoothstep(9.35, 9.72, t))})`;
  composerSend.style.filter = `brightness(${1 + 0.7 * (smoothstep(9.42, 9.6, t) * (1 - smoothstep(9.75, 10.08, t)))})`;

  if (promptPhase === 'chat') promptText.textContent = t >= 9.55 ? PROMPT : '';
  const bubble = smoothstep(9.75, 10.48, t);
  reveal(userMessage, bubble, 26, 0.94);
  userMessage.style.transform = `translate(${lerp(72, 0, bubble).toFixed(2)}px, ${lerp(24, 0, bubble).toFixed(2)}px) scale(${lerp(0.88, 1, bubble).toFixed(3)})`;
  const nextPromptPhase = t < PROMPT_TRANSITION_START
    ? 'chat'
    : sectionTwoTime < TOKENIZE_START ? 'zoom' : 'tokenized';
  setPromptPhase(nextPromptPhase, t);

  const loadingIn = smoothstep(10.15, 10.45, t);
  const loadingOut = 1 - smoothstep(11.2, 11.82, t);
  const loadingAmount = loadingIn * loadingOut;
  aiWorking.style.opacity = loadingAmount.toFixed(3);
  aiWorking.style.transform = `translate(${lerp(-38, 0, loadingIn).toFixed(2)}px, ${lerp(8, 0, loadingIn).toFixed(2)}px)`;
  thinkingOrb.style.transform = `rotate(${(t * 240).toFixed(1)}deg) scale(${1 + 0.11 * Math.sin(t * 4.4) ** 2})`;
  aiWorking.querySelectorAll('.working-dots i').forEach((dot, index) => {
    dot.style.transform = `translateY(${(Math.sin(t * 5 + index * 1.9) * 3).toFixed(2)}px) scale(${(0.72 + 0.28 * (0.5 + 0.5 * Math.sin(t * 5 + index * 1.9))).toFixed(3)})`;
    dot.style.opacity = String(0.38 + 0.62 * (0.5 + 0.5 * Math.sin(t * 5 + index * 1.9)));
  });

  const response = smoothstep(11.48, 12.25, t);
  reveal(answerMessage, response, 28, 0.96);
  const answerRouteProgress = smoothstep(12.7, 14.25, t);
  answerMapRoute.style.strokeDashoffset = (1 - answerRouteProgress).toFixed(3);
  const answerRoutePoint = answerMapRoute.getPointAtLength(answerMapRouteLength * answerRouteProgress);
  answerMapSignal.setAttribute('cx', answerRoutePoint.x.toFixed(2));
  answerMapSignal.setAttribute('cy', answerRoutePoint.y.toFixed(2));
  answerMapSignal.style.opacity = (smoothstep(12.7, 13.0, t) * (1 - smoothstep(14.25, 14.8, t))).toFixed(3);
  [dayOne, dayTwo, answerFootnote].forEach((element, index) => {
    const p = smoothstep(12.55 + index * 0.55, 13.35 + index * 0.55, t);
    element.style.opacity = p.toFixed(3);
    element.style.transform = `translate(${lerp(-18 + index * 8, 0, p).toFixed(2)}px, ${lerp(16, 0, p).toFixed(2)}px) scale(${lerp(0.97, 1, p).toFixed(3)})`;
  });
  const toolReveal = smoothstep(16.55, 17.65, t);
  toolDock.style.opacity = toolReveal.toFixed(3);
  toolDock.style.transform = `translateY(${lerp(24, 0, toolReveal).toFixed(2)}px) scale(${lerp(0.92, 1, toolReveal).toFixed(3)})`;
  toolDock.querySelectorAll('.tool-chip').forEach((chip, index) => {
    const p = smoothstep(16.8 + index * 0.3, 17.45 + index * 0.3, t);
    chip.style.opacity = p.toFixed(3);
    chip.style.transform = `translateY(${lerp(18, 0, p).toFixed(2)}px) rotate(${lerp(index % 2 ? 5 : -5, 0, p).toFixed(2)}deg)`;
  });

  // Section 02: enlarge the whole user bubble, then send word copies from it into a centered token field.
  zoomPrompt.style.opacity = promptPhase === 'chat' ? '0' : '1';
  if (promptPhase !== 'chat') {
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const p = smoothstep(PROMPT_TRANSITION_START, 26.45, t);
    const source = promptSourceBox ?? { x: 0.63, y: 0.25, width: 0.62, height: 0.08 };
    userMessage.style.left = `${lerp(source.x * stageWidth, stageWidth * 0.10, p).toFixed(2)}px`;
    userMessage.style.top = `${lerp(source.y * stageHeight, stageHeight * 0.215, p).toFixed(2)}px`;
    userMessage.style.width = `${lerp(source.width * stageWidth, stageWidth * 0.80, p).toFixed(2)}px`;
    userMessage.style.height = 'auto';
    userMessage.style.padding = `${lerp(0.8, 1.05, p).toFixed(3)}cqw ${lerp(1.05, 1.3, p).toFixed(3)}cqw ${lerp(0.95, 1.15, p).toFixed(3)}cqw`;
    userMessage.style.opacity = (1 - smoothstep(BUBBLE_FADE_START, BUBBLE_FADE_END, sectionTwoTime)).toFixed(3);
    userMessage.style.transform = 'none';
    promptText.style.position = 'relative';
    promptText.style.left = 'auto';
    promptText.style.top = 'auto';
    promptText.style.width = '100%';
    promptText.style.fontSize = `${lerp(1.12, 2.15, p).toFixed(3)}cqw`;
    promptText.style.textAlign = 'left';
    if (promptPhase === 'tokenized') renderTokenCopies(sectionTwoTime);
  } else {
    tokenField.style.opacity = '0';
  }

  const rackIn = smoothstep(9.4, 10.7, sectionTwoTime);
  const categoryFade = 1 - smoothstep(SECTION_THREE_START, SECTION_THREE_START + 1.15, t);
  categoryRack.style.opacity = (rackIn * categoryFade).toFixed(3);
  categoryRack.style.transform = `translateY(${lerp(54, 0, rackIn).toFixed(2)}px) scale(${lerp(0.91, 1, rackIn).toFixed(3)})`;
  categoryRack.querySelectorAll('.category-box').forEach((box, index) => {
    const p = smoothstep(9.7 + index * 0.25, 10.75 + index * 0.25, sectionTwoTime);
    const pulse = 1 + 0.012 * Math.sin(sectionTwoTime * 2.1 + index * 1.4) ** 2 * rackIn;
    box.style.opacity = p.toFixed(3);
    box.style.transform = `translateY(${lerp(15, 0, p).toFixed(2)}px) scale(${(lerp(0.97, 1, p) * pulse).toFixed(3)})`;
    box.style.setProperty('--box-energy', String(p * (0.35 + 0.65 * Math.sin(sectionTwoTime * 2 + index) ** 2)));
  });

  if (t < SECTION_THREE_START) updateFlights(sectionTwoTime);
  renderContextStory(t);
  renderModelStory(t);
  renderToolOriginStory(t);
  renderToolCallStory(t);
  renderTrainingStory(t);
  renderConsistencyStory(t);
  const focus = smoothstep(0, 11.5, sectionTwoTime) * (1 - smoothstep(26.5, 30.5, sectionTwoTime));
  tokenParticleGlow.style.opacity = (focus * 0.82).toFixed(3);
  tokenParticleGlow.style.transform = `translate(-50%, -50%) scale(${lerp(0.55, 1.35, smoothstep(0, 12, sectionTwoTime)).toFixed(3)})`;

  const activeCaption = CAPTIONS.find((item) => t >= item.start && t < item.end);
  reviewCaption.textContent = activeCaption ? activeCaption.text : '';
  const captionOpacity = activeCaption
    ? Math.min(smoothstep(activeCaption.start, activeCaption.start + 0.18, t), smoothstep(activeCaption.end, activeCaption.end - 0.18, t))
    : 0;
  reviewCaption.style.opacity = captionOpacity.toFixed(3);

  if (renderer && camera && !failedWebGL) {
    const cinematicDepth = smoothstep(SECTION_THREE_START + 4.0, SECTION_THREE_START + 15.0, t);
    const depthPulse = 0.5 + 0.5 * Math.sin(t * 0.31);
    stars.material.opacity = 0.46 + 0.1 * cinematicDepth * depthPulse;
    stars.material.size = 0.035;
    stars.rotation.y = 0.0015 * t + 0.0018 * Math.sin(t * 0.11) * cinematicDepth;
    stars.rotation.x = 0.0015 * Math.sin(t * 0.18) + 0.0028 * Math.cos(t * 0.17) * cinematicDepth;
    network.rotation.z = 0.03 * Math.sin(t * 0.22) * cinematicDepth;
    network.rotation.x = 0.02 * Math.cos(t * 0.19) * cinematicDepth;
    network.material.opacity = 0.018 + cinematicDepth * (0.014 + 0.009 * depthPulse);
    gridMaterial.opacity = 0.012 + cinematicDepth * (0.006 + 0.008 * (1 - depthPulse));
    camera.position.z = 11 + 0.65 * smoothstep(20.4, 24.4, t) - 0.46 * depthPulse * cinematicDepth;
    camera.position.x = 0.16 * Math.sin(t * 0.12) * cinematicDepth;
    camera.position.y = -0.035 * smoothstep(20.4, 24.4, t) + 0.11 * Math.cos(t * 0.14) * cinematicDepth;
    camera.lookAt(0, 0, -1.8);
    updateParticleField(t, sectionTwoTime);
    renderer.render(window.__sectionScene.scene, camera);
  }
}

function updatePlayer() {
  const t = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : DURATION;
  timeline.max = String(duration);
  timeline.value = String(Math.min(t, duration));
  currentTimeReadout.textContent = fmtTime(t);
  totalTimeReadout.textContent = fmtTime(duration);
  updateActiveChapter(t);
  playLabel.textContent = audio.paused ? 'Play' : 'Pause';
  playGlyph.textContent = audio.paused ? '▶' : 'Ⅱ';
  playButton.setAttribute('aria-label', audio.paused ? 'Play video preview' : 'Pause video preview');
  renderAt(t);
}

playButton.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  } else {
    audio.pause();
  }
  updatePlayer();
});

audio.addEventListener('timeupdate', updatePlayer);
audio.addEventListener('loadedmetadata', updatePlayer);
audio.addEventListener('play', updatePlayer);
audio.addEventListener('pause', updatePlayer);
audio.addEventListener('ended', updatePlayer);
audio.addEventListener('error', () => console.error('Preview audio failed to load:', audio.error));

function updateActiveChapter(time) {
  let next = chapterButtons[0] || null;
  for (const button of chapterButtons) {
    if (time >= Number(button.dataset.time)) next = button;
    else break;
  }
  if (next === activeChapterButton) return;
  activeChapterButton = next;
  chapterButtons.forEach((button) => {
    const active = button === next;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-current', active ? 'location' : 'false');
  });
  if (next && chapterNav && !previewColumn.classList.contains('chapters-collapsed')) {
    const left = next.offsetLeft - (chapterNav.clientWidth - next.offsetWidth) / 2;
    chapterNav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }
}

chapterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const time = Math.min(Number(button.dataset.time), DURATION);
    audio.currentTime = time;
    renderAt(time);
    updatePlayer();
  });
});

chapterToggle.addEventListener('click', () => {
  const collapsed = previewColumn.classList.toggle('chapters-collapsed');
  chapterToggle.setAttribute('aria-expanded', String(!collapsed));
  chapterToggle.setAttribute('aria-label', `${collapsed ? 'Show' : 'Hide'} section navigation`);
  chapterToggle.title = `${collapsed ? 'Show' : 'Hide'} sections`;
});

function isPreviewFullscreen() {
  return document.fullscreenElement === previewColumn || previewColumn.classList.contains('is-preview-fullscreen');
}

const FULLSCREEN_AUTO_HIDE_MS = 3000;
let fullscreenHideTimer = null;
let mouseRevealAt = 0;

function clearFullscreenHideTimer() {
  if (fullscreenHideTimer !== null) window.clearTimeout(fullscreenHideTimer);
  fullscreenHideTimer = null;
}

function hideFullscreenControls() {
  if (!isPreviewFullscreen()) return;
  previewColumn.classList.add('fullscreen-ui-hidden');
}

function showFullscreenControls() {
  if (!isPreviewFullscreen()) return;
  previewColumn.classList.remove('fullscreen-ui-hidden');
  clearFullscreenHideTimer();
  fullscreenHideTimer = window.setTimeout(() => {
    fullscreenHideTimer = null;
    hideFullscreenControls();
  }, FULLSCREEN_AUTO_HIDE_MS);
}

function updateFullscreenButton() {
  const active = isPreviewFullscreen();
  fullscreenButton.setAttribute('aria-pressed', String(active));
  fullscreenButton.setAttribute('aria-label', `${active ? 'Exit' : 'Enter'} fullscreen preview`);
  fullscreenButton.title = `${active ? 'Exit' : 'Enter'} fullscreen (F)`;
  fullscreenLabel.textContent = active ? 'Exit fullscreen' : 'Enter fullscreen';
}

fullscreenButton.addEventListener('click', async () => {
  if (isPreviewFullscreen()) {
    if (document.fullscreenElement === previewColumn && document.exitFullscreen) {
      await document.exitFullscreen();
    } else {
      clearFullscreenHideTimer();
      previewColumn.classList.remove('fullscreen-ui-hidden');
      previewColumn.classList.remove('is-preview-fullscreen');
      screen.orientation?.unlock?.();
      updateFullscreenButton();
    }
    return;
  }

  try {
    if (previewColumn.requestFullscreen) await previewColumn.requestFullscreen();
    else previewColumn.classList.add('is-preview-fullscreen');
  } catch {
    previewColumn.classList.add('is-preview-fullscreen');
  }
  if (document.fullscreenElement === previewColumn && screen.orientation?.lock) {
    try { await screen.orientation.lock('landscape'); } catch { /* Orientation lock is optional. */ }
  }
  updateFullscreenButton();
  showFullscreenControls();
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    clearFullscreenHideTimer();
    previewColumn.classList.remove('fullscreen-ui-hidden');
    screen.orientation?.unlock?.();
  } else if (document.fullscreenElement === previewColumn) {
    showFullscreenControls();
  }
  updateFullscreenButton();
});

previewColumn.addEventListener('click', (event) => {
  if (!isPreviewFullscreen()) return;
  const targetIsControl = event.target.closest('.player-controls, .chapter-nav, .fullscreen-orientation-hint');
  if (targetIsControl) {
    showFullscreenControls();
    return;
  }
  if (performance.now() - mouseRevealAt < 260) {
    mouseRevealAt = 0;
    return;
  }
  if (previewColumn.classList.contains('fullscreen-ui-hidden')) showFullscreenControls();
  else {
    clearFullscreenHideTimer();
    hideFullscreenControls();
  }
});

previewColumn.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || !isPreviewFullscreen()) return;
  const hidden = previewColumn.classList.contains('fullscreen-ui-hidden');
  showFullscreenControls();
  if (hidden) mouseRevealAt = performance.now();
});
playerControls.addEventListener('pointerdown', showFullscreenControls);
chapterNav.addEventListener('pointerdown', showFullscreenControls);

timeline.addEventListener('input', () => {
  const nextTime = Number(timeline.value);
  audio.currentTime = nextTime;
  renderAt(nextTime);
  currentTimeReadout.textContent = fmtTime(nextTime);
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyF' && !event.ctrlKey && !event.metaKey && !event.altKey
      && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    fullscreenButton.click();
    return;
  }
  if (event.code === 'Escape' && previewColumn.classList.contains('is-preview-fullscreen')) {
    clearFullscreenHideTimer();
    previewColumn.classList.remove('fullscreen-ui-hidden');
    previewColumn.classList.remove('is-preview-fullscreen');
    screen.orientation?.unlock?.();
    updateFullscreenButton();
    return;
  }
  if (event.code !== 'Space' || ['BUTTON', 'INPUT', 'SELECT'].includes(document.activeElement?.tagName)) return;
  event.preventDefault();
  playButton.click();
});

// The audio clock is authoritative; any seek reconstructs the same frame and DOM transforms.
function tick() {
  if (!audio.paused) renderAt(audio.currentTime);
  requestAnimationFrame(tick);
}

window.renderAt = renderAt;
window.renderFrame = (frame) => renderAt(frame / FPS);
window.previewTimeline = { fps: FPS, duration: DURATION, renderAt, audioClock: audio };

renderAt(0);
updatePlayer();
requestAnimationFrame(tick);
