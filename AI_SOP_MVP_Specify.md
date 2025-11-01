# 🧩 AI SOP 系統 — MVP 規格定義（/speckit.specify）

## 產品定位與哲學
使命：讓使用者以對話記錄、反思並優化工作流程，將職能模組化、可複製、可迭代。  
整合哲學：SOP × PAI（Project–Action–Inbox）× PDCA × 週回顧。

## 使用者角色
- 個人工作者：低摩擦記錄、快速回顧、清晰版本。
- 審核者/導師：審核與改進 SOP。
- AI 助手：引導、結構化、標籤建議、PDCA 問答。

## MVP 目標
- 對話生成 SOP 草稿（卡片化步驟）。
- PDCA 反思與 SOP 演化（Diff）。
- PAI 流程（Inbox → Action → Project → SOP）。
- AI 標籤建議 + 人工覆核。
- Markdown 匯出 + 版本控制。
- **每週五 16:00 自動產生工作回顧**。

## 核心模組與驗收
### A. 對話式 SOP 生成
- 流程：自然語言 → Action Cards（3–5 步）→ 補充注意/錯誤 → 草稿。
- 驗收：一句任務描述可生成 3–5 卡並可編修。

### B. PAI 流程整合
- Inbox 暫存、Action 可重用、Project 聚合 SOP/PDCA。
- 驗收：Inbox 條目 2 步轉為 SOP 草稿並綁定 Project。

### C. PDCA 與 SOP 改版
- 30 天未更新提醒 → 問答引導 → 生成 Diff → vNext 草稿。
- 驗收：完成 PDCA 可產生 Diff 並建立 vNext。

### D. 分類與標籤
- 控制詞彙：domain/role/phase/tool/risk/scope + free tags。
- 驗收：3 步內完成標籤覆核。

### E. 匯出與版本控制
- SemVer 升版、Diff 與批註、Markdown 匯出（含 Frontmatter）。
- 驗收：核准 SOP 可下載正確 Frontmatter 的 .md。

### F. 週回顧（Fri 16:00）
- Cron：`0 16 * * FRI`（Asia/Taipei）；重試 10m/60m；可停用。
- 草稿結構：Top Actions / Outcomes / Issues / PDCA / Next Actions。
- 一鍵操作：〔轉 PDCA〕〔產生 SOP Diff〕〔匯出 Markdown〕。
- 驗收：到點自動生成草稿並通知；內容五區塊齊備且可轉換。

## 資料模型摘要
- User, InboxItem, Action, Project, SOP, SOPVersion, PDCA, WeeklyReview。
- SOP 匯出 Frontmatter：`id/title/version/tags/last_reviewed`。

## 成功指標（MVP）
- 3 分鐘建立 SOP 草稿（≥80%）。
- 每月 ≥1 次 PDCA 改版（60% 使用者）。
- 週回顧觸發成功率 ≥99%，開啟率 ≥60%。
- Markdown 匯出成功率 ≥95%。

## 系統提示語（語氣）
- 建立 SOP：「先把你的任務拆成幾個步驟，好嗎？」
- 缺漏檢查：「少了『錯誤清單』，要幫你補上嗎？」
- 改版提醒：「這份 SOP 已一個月沒更新，要不要複盤？」
- 週回顧：「本週回顧已生成，要一起看一下嗎？」
- 匯出成功：「已匯出 Markdown，可分享備份。」

## 範例 Frontmatter（SOP 匯出）
```yaml
---
id: sop-2025-001
title: 每週例會準備流程
version: 1.1.0
tags: {domain: ops, role: pm, phase: plan, tool: notion}
last_reviewed: 2025-11-01
---
```