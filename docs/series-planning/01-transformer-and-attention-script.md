# Part 01 — Transformer & Attention Mechanism
## English Narration Draft + Visual Design

**Status:** Draft 01 for review. Narration/audio has not been generated; visual timing is a pacing estimate and will be retimed after a read-through or voice generation.

**Working title:** *How Transformers Work: Self-Attention, Q/K/V & Context*

**Format:** Standalone deep-dive. English narration; Traditional Chinese production notes. About 1,004 spoken words; approximately 8:00–8:25 of speech at 120–125 words per minute, plus visual holds, for an estimated 8:30–9:00 total. Keep the established Charon voice as the working reference, subject to the user's review.

**Narration direction:** Warm, clear, measured. Aim for roughly 120–130 words per minute. Leave a short breath after the core mechanism, the formula, and the final recap. Section headings and design notes are not spoken.

---

## 01 — Hook: follow one reference | target 00:00–00:45

### Voice-over

Imagine asking an AI to plan a nature weekend in Taipei, within an eight-thousand-dollar budget.

In its answer, it may mention Maokong, a shaded trail, or a short hike. Now consider this sentence: “The trail near Maokong is shaded. It is short, too.”

What information helps the model connect “it” with the trail?

The answer is not one magic connection. It is a series of computations that lets each token build a representation using its surrounding context. A key mechanism is self-attention. And self-attention lives inside a larger architecture called the Transformer.

### 畫面設計

由熟悉的 AI chat UI 開始，像上一條片但使用全新頁面／影片舞台。使用者輸入 Taipei nature-weekend request；鏡頭推近後，畫面轉成句子 `The trail near Maokong is shaded. It is short, too.`。當 `it` 出現時，一條極淡的候選線暫時連到幾個名詞，再以字句上下文令 `trail` 的示意路徑較突出。接着鏡頭穿入句子，周圍 UI 收起。

不要出現裝飾性片名卡；只保留 `SELF-ATTENTION`、`TRANSFORMER` 作功能標籤。旁白說 “not one magic connection” 時，暫停線條，避免把後續教學誤解為單一連線可以解釋整個模型。

---

## 02 — From tokens to vectors | target 00:45–01:45

### Voice-over

Before attention, the text is split into tokens. A tokenizer assigns each token an ID, and the model looks up a learned numerical representation for it. That representation is called an embedding.

An embedding is not a tiny definition stored inside a word. It is a vector: a list of numbers the network can work with.

Order matters, too. “The trail is near Maokong” and “Maokong is near the trail” use similar words, but they say different things. A Transformer therefore needs information about where tokens occur in the sequence. Different architectures encode position in different ways.

Now we can look at the sentence as a row of token representations, each carrying content and position information into the next calculation.

### 畫面設計

句子平順拆成 token tiles；ID 只短暫作界面細節，隨後每塊轉成一組抽象數值向量。不要畫成每個詞有一粒固定、唯一的「意義球」；使用一串會變形的數值 glyph，並標註 `ILLUSTRATIVE VECTOR`。

左右比較兩句次序不同的短語，token 卡交換位置，position ribbon 隨之變化。向量本身不要標出「某一維=trail」之類確定語意。最後鏡頭沿 token row 向前移，帶入下一場 self-attention。

**畫面標籤：** `TOKEN ID`、`EMBEDDING`、`POSITION`。

---

## 03 — What self-attention does | target 01:45–02:40

### Voice-over

Self-attention lets each token position combine information from other positions in the same sequence.

Suppose we are examining “it.” The model computes a representation for that position from the current input, then compares it with other positions it is allowed to use. The result is not a permanent arrow from “it” to “trail.” It is a context-dependent mixture, recalculated from the sequence.

Later layers can use that mixture along with other information. And this operation is not only for pronouns. Every position can form its own contextual representation.

To see how the mixture is calculated, we need three names: Query, Key, and Value.

### 畫面設計

把 `it` 對應的 token slot 放大，其他 token 留在同一條序列中。先短暫顯示多個細線，再淡出不相關的示意線，讓一個較強的 `it`–`trail` path 留下；標明這只係 `SCHEMATIC`，不是模型實際輸出的 attention map。

焦點再移到 `budget`、`$8,000`，示範不同 token 位置會建立不同上下文；唔好把兩者畫成固定、永遠相同的硬連線。鏡頭回到完整句子，三個 projection lanes 從 token row 分岔出來。

**畫面標籤：** `CURRENT TOKEN`、`CONTEXT`、`SCHEMATIC`。

---

## 04 — Query, Key, Value | target 02:40–04:25

### Voice-over

For each token position, learned projections create three versions of its current representation: a Query, a Key, and a Value.

Very loosely, you can think of the Query as what this position is looking to match; the Keys as what other positions offer for matching; and the Values as the information that can be mixed in.

That is only a mnemonic. In the network, Query, Key, and Value are vectors produced by learned numerical transformations. They are not literal questions, database keys, or labels attached to words.

For one position, its Query is compared with the Keys from the positions it is allowed to use. Those comparisons produce scores. Higher scores receive more weight after a softmax operation turns the scores into a distribution.

The weights across accessible positions add up to one. The model uses them to combine the Values. In our simplified picture, “it” can draw useful signal from “trail.” The result is a new contextual vector—not a copied word, and not a final answer by itself.

A compact way to write the operation is: scale the Query–Key scores, apply softmax to turn them into weights, then multiply by the Values. You do not need to memorize the formula. Watch the order: compare, normalize, mix.

### 畫面設計

將每個 token 表示分流成三條視覺軌道 `Q`、`K`、`V`，先用全字，再收斂成縮寫。選取 `it` 的 Query，依序同可用的 Keys 比對；結果形成 score bars。score bars 以柔和動畫經過 `SOFTMAX`，變成總和為 1 的權重列；權重大小直接控制各 Value stream 的亮度／流量，最後匯聚成新的 `it` representation。

公式只在動作已看過一次後才顯示：

`Attention(Q, K, V) = softmax(QKᵀ / √dₖ) V`

公式停留至少 3 秒。旁白唸自然語言，不逐字唸符號。`√dₖ` 旁只加一個細小的 `scale scores` 提示，不展開張量維度。可用一條被遮罩的 token 線指出有些位置不可參與，但完整 causal-mask 說明留到後段。

**畫面標籤：** `QUERY`、`KEY`、`VALUE`、`SCORES`、`SOFTMAX`、`WEIGHTED MIX`。

---

## 05 — Why multiple heads? | target 04:25–05:15

### Voice-over

One attention calculation gives the model one learned view of the sequence. Multi-head attention runs several learned projections in parallel, then combines their results.

A diagram might show different patterns: one lane connecting a reference, another linking a preference with a constraint. But real attention heads do not come with guaranteed human-readable job titles. They are learned parts of a larger computation, and their behavior varies across layers and models.

The important idea is not “one head, one rule.” It is that several learned views can be combined before the representation moves on.

### 畫面設計

Q/K/V 輸出分成三至四條不同但同源的 parallel lanes。每條 lane 對同一 token row 產生稍有不同的示意熱度，最後匯流成一個 combined representation。視覺上可用兩條 lane 短暫示範 `REFERENCE`、`CONSTRAINT`，但同時以小字標出 `ILLUSTRATIVE PATTERNS`；不可命名成固定的「代名詞頭」或「預算頭」。

鏡頭後退，平行 lanes 收入一塊可辨識的 Transformer sublayer。

---

## 06 — Attention is inside a Transformer block | target 05:15–06:10

### Voice-over

Attention is not the whole Transformer.

In a typical GPT-style block, an attention sublayer lets token positions exchange contextual information. A feed-forward network, often called an MLP, then transforms each position. Residual connections provide paths for information to flow around sublayers, while normalization helps keep activations in a useful range.

The exact arrangement varies across architectures. But the broad pattern repeats: attention mixes information across positions, other layers transform it, and many blocks are stacked together.

As the sequence moves through those layers, each token’s representation becomes a result of more computations on its context—not a little sentence stored inside the network.

### 畫面設計

鏡頭進入一個透明 3D block，分層展示 `SELF-ATTENTION`、`RESIDUAL / NORMALIZATION`、`FEED-FORWARD (MLP)`。輸入訊號穿過 attention 後，不要只向前直線消失：同時畫出一條較細的 residual bypass，再回到相加節點；接着每個 token position 各自進入 MLP column。最後三個 block 疊成較深的 stack，token 表示隨每層改變，但原 token 序列順序仍可追蹤。

採用一般 GPT-style decoder block 的示意，不宣稱所有 Transformer 子層排列完全相同。鏡頭運動沿 block stack 深入，不切成靜態「方框清單」。

**畫面標籤：** `ATTENTION`、`RESIDUAL PATH`、`NORMALIZATION`、`FEED-FORWARD / MLP`、`REPEATED BLOCKS`。

---

## 07 — Causal mask and next-token generation | target 06:10–07:30

### Voice-over

A GPT-style model is trained to predict what comes next. To do that safely, each position must not use tokens that come later in the sequence.

A causal mask acts like a one-way gate. A position can use itself and earlier positions, but future positions are blocked. This preserves the left-to-right prediction rule.

During training, the whole example is already available, so computations for many positions can be carried out in parallel while the mask still hides the future from each position.

During generation, the model starts with the prompt. Its final position produces scores for possible next tokens. A decoding step selects one token; that token is appended, and the model makes another prediction using the longer context. Many systems cache earlier Key and Value calculations to save work, but the basic idea remains: extend the sequence one token at a time.

### 畫面設計

以 token row 建立三角形 causal mask：對每個位置，右上方未來 token 區域逐格變暗並被透明 gate 擋住；對角線和左下方仍可見。先呈現完整已知句子並讓各列平行亮起，說明 training-time parallel computation；然後切換到生成模式，prompt 已存在、next token candidates 出現、選中一個後 append，再推進下一格。

可在畫面邊緣用不搶焦點的小 cache tray 保留先前 K/V tiles，旁白說 “cache earlier Key and Value calculations” 時亮起一次即可，不深入 KV-cache optimization。不要畫出模型預先看到完整回答。

**畫面標籤：** `CAUSAL MASK`、`FUTURE BLOCKED`、`NEXT TOKEN`、`APPEND`、`CACHE (OPTIONAL)`。

---

## 08 — What the mechanism explains—and what it does not | target 07:30–08:35

### Voice-over

Here is the core picture.

Text becomes tokens, and tokens become vectors with information about position. Self-attention compares Queries with Keys, turns scores into weights, and uses those weights to mix Values. Multiple heads run learned views in parallel. Attention and feed-forward sublayers repeat through Transformer blocks, while a causal mask keeps next-token prediction pointed forward.

This is not a human-like spotlight, and attention alone is not a complete explanation of a model’s answer. It is one important computation inside a much larger learned system.

So when an AI connects a constraint to a suggestion, there is no single magic line doing all the work. There is a sequence of learned transformations building context—and using that context to score what could come next.

### 畫面設計

把全片前面出現過的視覺語法收斂成一條乾淨資料流：`TOKENS → VECTORS + POSITION → SELF-ATTENTION → TRANSFORMER BLOCKS → NEXT-TOKEN SCORES`。每個節點由前段真實元素縮回來，不重新起一套圖形。

說到 “not a human-like spotlight” 時，關掉聚光效果，保留多層資料路徑；說到 “no single magic line” 時，將單一強線拆成多條細小但有方向的連接。最後回到 Taipei prompt，讓 `$8,000` 和 `nature` 作為上下文 chip 進入模型，候選下一步才出現。定格在完整流程，然後自然淡出；不把「Part 2」做成必須追看的 cliffhanger。

**畫面標籤：** `CONTEXTUAL REPRESENTATION`、`NEXT-TOKEN SCORES`。

---

## Closing / optional end card | target 08:35–08:55

### Voice-over

That is one forward pass through a Transformer: context is built, one layer at a time, before the next token is chosen.

### 畫面設計

維持最終流程圖短暫 hold；可在 YouTube end screen 另外放其他 standalone deep-dive 影片，但影片本身的理解不依賴下一集。最後畫面仍然像影片收尾，而非網站按鈕或章節選單。

---

## Production and accuracy notes

- 時間碼是旁白寫作階段估算；之後要按實際試讀／TTS 音檔重新量度。每段要留有呼吸與視覺 hold，不能為了塞入更多內容而加快語速。
- 所有 attention lines、head lanes、vector cloud 和 score bars 都要標示或處理成示意；不可讓觀眾以為是某個真實模型的數值或可解釋對應。
- `Q`、`K`、`V` 是由目前 token representations 經 learned projections 產生；公式視覺應以 `softmax(QKᵀ / √dₖ)V` 為主，不要求觀眾記符號。
- 概念範圍聚焦一般 GPT-style decoder-only Transformer；其他 Transformer 類型、位置編碼變體及 KV-cache 優化只作一句 caveat 或留待未來專題。
- 不在影片中用裝飾性標題卡或畫內字幕；必要的功能標籤短、清楚、可讀，review captions 留在影片框外。
- Original YouTube reference Card 建議位置：**01:13.6**，即原片 Section 03 開始點名 Transformer attention 的位置；等本片上架後再設定。
- 下一步 review：先確認旁白例子、英文語氣、8–9 分鐘節奏和公式深度；未獲批前不生成語音或開始正式 Three.js 製作。
