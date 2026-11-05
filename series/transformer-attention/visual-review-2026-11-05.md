# 全片視覺與轉場審視

**影片：** Deep Dive 01: How Transformers Work

**審視日期：** 2026-11-05

**畫面規格：** 1920×1080、16:9、24fps

## 總體結論

八個章節均已按旁白節點檢查；七個章節交界亦已逐一檢視。整體視覺順序能由同一個 Taipei 句子，逐步帶到 token、向量、attention、Transformer block、因果遮罩與逐 token 生成。這輪改動後，沒有發現瀏覽器例外或明顯的物件跳接；較重要的是讓訊號抵達實際可見的目的地，而不是停在尚未出現的卡片上。

最近修改過的 Chapter 4→5、5→6、6→7、7→8 交界，另以 24fps 逐格掃描，共檢查 246 個影格，瀏覽器錯誤為零。Chapter 5 的同一影格重播、跳到別處再回來後，1920×1080 畫面逐像素一致。完整 MP4 仍未輸出，會等用戶先在預覽頁完成 QA。

## 逐章審視

1. **Context window／指代理解：** 由 chat UI 提出問題，再以 “It” 與 Maokong 附近步道的候選關係呈現語境線索，觀眾不必先懂技術術語也能理解模型是在用周邊文字判斷指代。
2. **Tokens、embeddings、position：** 同一句文字在畫面上拆成 token，再接 ID、向量與位置資訊。文字不是另起一份替代品，而是保留原句物件後再展開處理，因果順序清楚。
3. **Self-attention：** 以句中 token 之間的訊號路徑，展示每個位置如何取得相關上下文；結果再成為更新後的表示，避免只留一張靜態概念卡。
4. **Q/K/V 與 attention 計算：** Q、K、V 的投影、比較、分數、softmax 與加權混合依旁白順序出現；“It” 從 “trail” 取得訊號並形成新的 contextual vector，有明確來源、運算與結果。
5. **Multi-head attention：** 四個 view 從同一輸入平行取訊號再匯合。對 “one head, one rule” 的說明，現在保留同一個 VIEW 01 身分，讓它在不同 layer/model 狀態間切換可見的關係例子，而不是只靠一句 caveat。這代表行為會改變，並非每個 head 有固定人類標籤。
6. **Transformer block：** 模組總覽會展開後收進持續存在的導覽帶，再由當下運算卡接手。Residual 圖中的曲線現在明確標成 **BYPASS · SAME INPUT**，從 incoming vector 繞過 sub-layer，接到加總節點，再通往 normalization；它不是未知用途的裝飾曲線。MLP、殘差、正規化及堆疊層各有對應畫面。
7. **Causal mask 與生成：** 未來位置被遮住、可用位置並行運算、候選 token 得分、選中 token 加入同一 prompt，以及舊 K/V 重用與新項目延伸，構成連續的生成故事。prompt-only 間歇已縮成單行條帶，候選卡只在候選開始出現時擴展，減少空白大面板。
8. **Recap 與結尾：** 保留 Taipei、自然、預算等原例，將處理流程收束為可回想的步驟，最後以 forward-pass 的延伸問題作結，結尾感比單純停在摘要更完整。

## 七個章節交界

**1→2** 保留原句並在原位置逐步拉開、框選與重排成 token；**2→3** 同一 token 列進入注意力關係圖；**3→4** 既有的 “It” 位置接續至 Q/K/V 運算；**4→5** contextual signal 現在落到可見的 “It” token，而非隱藏中的 VIEW 卡；**5→6** 合併後的訊號導入持續存在的 Transformer block；**6→7** 句中 token 列水平移入 prompt，並連到相符的 mask 位置；**7→8** 生成訊號導入 recap。沒有白色轉場 overlay。四個最近受改動的交界均完成 24fps 掃描，未看到物件突然重建造成的閃爍或瀏覽器錯誤。

## QA 結果與待辦

- Production build 成功；本地 1920×1080 Chromium 檢查沒有 page error。
- 最近四段交界逐格掃描：246 個影格，零瀏覽器錯誤。
- 同一 Chapter 5 timestamp 在跳到其他時間後重新 seek，回傳完全相同畫面。
- Chapter 7 prompt hold 經尺寸檢查縮至約 97px 高（1080p），token 列仍在卡片內；候選卡另有足夠空間顯示各項與分數條。
- 本輪未生成或混入背景音樂；預覽仍以旁白為主。若視覺 QA 確認後要加配樂，可另做低音量、偏 cyber／space-exploration 的氛圍底樂，並在旁白期間 ducking，避免鼓點遮住語音。
- **下一步：** 請先在公開預覽頁播放／拖曳檢查；確認後再決定是否加配樂及輸出完整 MP4。
