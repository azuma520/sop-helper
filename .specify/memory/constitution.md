<!--
Sync Impact Report
Version change: draft → 1.0.0
Modified principles:
- 行動優先（Action Precedes Organization）
- 最小可用（Start Small, Refine Later）
- 持續演化（PDCA with Weekly Review）
- 結構透明（Human-Readable & Machine-Parseable）
- 認知節能與人類審核（Cognitive Load & Human-in-the-Loop Learning）
Added sections: 安全與資料治理, 品質與反思節奏
Removed sections: 無
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs: 無
-->

# AI SOP 系統 Constitution

## Core Principles

### 行動優先（Action Precedes Organization）
- 所有輸入 MUST 立即記錄為具指派人、完成條件與狀態的行動項（Action），禁止僅以口頭或未追蹤的方式指派工作。
- 行動項目 MUST 連結至對應 SOP、PDCA 或任務板，並在完成後追溯其成果與學習；延伸整理 SHALL 在行動建立後再進行。
- 各職能 Reviewer MUST 每日驗證新增行動的完整性，確保沒有漏記或情報碎片。
**Rationale**: 從行動起步可降低遺漏風險，使後續 SOP 化與學習循環有完整來源。

### 最小可用（Start Small, Refine Later）
- 新流程或文件 MUST 先交付最小可用版本，可在 3 分鐘內被實際操作或驗證；禁止因等待完美而延宕知識入庫。
- 每個最小版本 MUST 記錄「下一次改進假設」與負責人，並在下一次回顧前更新狀態。
- 若需求不明確，團隊 SHALL 先記錄現況與假設，並於驗證後再補完細節。
**Rationale**: 先上線可用版本確保知識可累積、改善節奏不被延遲。

### 持續演化（PDCA with Weekly Review）
- 每個 SOP、流程或功能 MUST 維護 PDCA 條目，至少每月一次驗證改進結果；高風險模組需在每週回顧中檢查。
- 系統 MUST 於每週五 16:00 自動生成回顧草稿（Top Actions → Issues → PDCA → Next Week），Reviewer 在 24 小時內確認或補充。
- 重大異動（Fail、重大 Issue） MUST 觸發改版建議並被追蹤到完成。
**Rationale**: 固定節奏讓演化成為常態，避免 SOP 停滯或知識落後實務。

### 結構透明（Human-Readable & Machine-Parseable）
- SOP 與相關文件 MUST 使用 Markdown + Frontmatter 儲存，並保留版本差異與審計軌跡。
- 所有資料輸出 MUST 兼具人類可讀與機器可解析格式（JSON/Markdown 雙軌），不得僅提供截圖或非結構化檔案。
- 系統事件（版本更迭、審核結果、錯誤清單） MUST 以可查詢方式記錄，確保跨角色追溯。
**Rationale**: 結構化資料降低溝通成本並支援自動化分析與再利用。

### 認知節能與人類審核（Cognitive Load & Human-in-the-Loop Learning）
- 介面與流程 MUST 以「少想一步」為準則，提供預設模板、預填欄位與提示，避免重複輸入或無意義操作。
- 所有 AI 建議 MUST 在被採納前由指定 Reviewer 確認，並標記審核意見以供追蹤。
- 系統 MUST 蒐集使用頻次、錯誤原因與建議成效，並在月度回顧提供優化清單；改進前需先分析資料以避免盲目調整。
**Rationale**: 保持人類決策權並降低操作負擔，使 AI 能成為可靠的複盤夥伴。

## 安全與資料治理
- 採用使用者/組織為邊界的資料隔離策略，敏感資料必須搭配 Row Level Security 與最小權限設定。
- 對外接口 MUST 透過 API Gateway 管理，包含速率限制、審計日誌、金鑰滾動與異常警報。
- 系統 MUST 在送交 LLM 前進行 PII 遮罩，並保留原始與遮罩版本以供稽核。
- 所有內容版本不可逆刪除，歷史 MUST 完整保留，並在稽核要求時可即時還原。

## 品質與反思節奏
- 核心流程自啟動到完成 MUST 在 3 分鐘內可操作完成；任何超標需求需記錄原因與改善計畫。
- 對話意圖命中率 MUST ≥ 85%，若低於門檻需在下一次週回顧提出修正行動。
- 不同使用者資料 MUST 完全隔離，並透過自動化測試驗證；端到端延遲 MUST 小於 2 秒（MVP）。
- 週回顧報告 MUST 包含 Top Actions、Issues、PDCA Diff 與 Next Week，並採無懲罰式反省框架。

## Governance
- 本憲法優先於其他流程文件；所有規畫、規格、任務與程式碼審查 MUST 驗證對應原則是否被滿足。
- 憲法修訂需提出包含變更理由、受影響流程、遷移計畫的提案，並經 Creator 與 Reviewer 雙重核准後方可合併。
- 版本採語意化規則：新增原則或重大擴充為 MINOR、破壞性調整為 MAJOR、文字澄清為 PATCH；每次修訂 MUST 更新版本號與 `Last Amended`。
- 每季 MUST 執行一次合規稽核，覆蓋行動採集、PDCA 紀錄、資料治理與審核留痕；稽核報告需公開給核心團隊與 Reviewer。
- 若發現原則違反，對應行動項 MUST 在 48 小時內建立，並跟蹤至修正完成或得到書面豁免。

**Version**: 1.0.0 | **Ratified**: 2025-11-01 | **Last Amended**: 2025-11-01
