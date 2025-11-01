# Feature Specification: AI SOP MVP Workflow Enablement

**Feature Branch**: `001-ai-sop-mvp`  
**Created**: 2025-11-01  
**Status**: Draft  
**Input**: User description: "AI SOP 系統 — MVP 規格定義（對話生成 SOP、PDCA、PAI、標籤、匯出、週回顧）"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
  - Captured as an actionable item with owner, completion criteria, and reviewer checkpoints
-->

### User Story 1 - 對話生成 SOP 草稿 (Priority: P1)

個人工作者透過對話提供任務描述，系統指引拆解步驟並生成可編修的 SOP 草稿。

**Why this priority**: 無此流程即無法啟動 PAI 與 PDCA 循環，是整體 MVP 的核心價值。

**Independent Test**: 以單一任務描述觸發對話，驗證系統能在 3 分鐘內產出 3–5 張行動卡與可匯出的 SOP 草稿。

**Acceptance Scenarios**:

1. **Given** 使用者提供 1 句任務描述, **When** 系統引導拆解並輸出卡片化步驟, **Then** 使用者獲得 3–5 張行動卡和草稿 SOP。
2. **Given** 使用者補充注意事項與常見錯誤, **When** 系統更新草稿, **Then** SOP 草稿同步納入注意事項與錯誤清單。
3. **Given** 行動項已建立, **When** Reviewer 審核, **Then** 系統標示確認或要求補充資訊並記錄審核結果。

---

### User Story 2 - PAI 流程與 PDCA 改版 (Priority: P2)

專案負責人從 Inbox 轉成 Action、綁定 Project，並於到期時進行 PDCA 問答與 Diff 生成。

**Why this priority**: 確保行動可追蹤並週期性改版 SOP，直接影響系統持續演化能力。

**Independent Test**: 透過一筆 Inbox 條目轉為 SOP 草稿並完成 PDCA 問答，驗證能產生 Diff 與下一版草稿。

**Acceptance Scenarios**:

1. **Given** Inbox 條目已存在, **When** 使用者於 2 步內轉成 Action 並綁定 Project, **Then** 系統建立對應行動與 SOP 草稿。
2. **Given** SOP 30 天未更新, **When** 系統啟動 PDCA 問答, **Then** 使用者完成問答即可取得 Diff 與 vNext 草稿。
3. **Given** 行動項已建立, **When** Reviewer 審核, **Then** PDCA 結果記錄審核狀態並生成下一次改進假設的行動項。

---

### User Story 3 - 每週五回顧與匯出 (Priority: P3)

團隊在每週五 16:00 收到自動生成的回顧草稿，並可依據卡片化內容匯出版本化 Markdown。

**Why this priority**: 提供固定節奏與成果追蹤機制，是衡量 PDCA 成效與知識可分享性的關鍵。

**Independent Test**: 模擬週五排程執行，確認草稿包含 Top Actions/Issues/PDCA/Next Actions 並可一鍵匯出。

**Acceptance Scenarios**:

1. **Given** Cron 於週五 16:00 觸發, **When** 系統生成回顧草稿, **Then** 草稿含 Top Actions、Outcomes、Issues、PDCA、Next Actions 五區段完整呈現。
2. **Given** 使用者選擇「轉 PDCA」或「產生 SOP Diff」, **When** 操作執行, **Then** 系統建立對應行動項並更新相關 SOP 版本。
3. **Given** 行動項已建立, **When** Reviewer 審核, **Then** 匯出 Markdown 前需確認審核結果並於版本 Frontmatter 中紀錄。

---

### Edge Cases
- 系統接收到少於 3 步的任務描述時，如何避免產出空白或過度簡化的 SOP 草稿？
- 使用者於 PDCA 問答過程中離開或逾時，系統如何保留進度並提醒補完？
- 送交 LLM 前若偵測到未遮罩的個資欄位，流程如何中止並提示更正？
- 週五 16:00 自動回顧失敗或逾時時，系統的 10 分鐘與 60 分鐘重試流程如何執行並通知？
- 行動項缺少負責人或審核者時，系統如何在當日結束前提醒並阻擋匯出？

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: 系統 MUST 將自然語言對話轉換為 3–5 張可編修的行動卡與 SOP 草稿。
- **FR-002**: 使用者 MUST 能在 3 分鐘內完成行動卡審核、補充注意事項並同步更新草稿。
- **FR-003**: Inbox 條目 MUST 可在 2 步內轉為 Action 並綁定 Project 與 SOP。
- **FR-004**: 系統 MUST 追蹤 Action、Project、SOP、PDCA、Weekly Review 等核心資料並維持版本歷史。
- **FR-005**: 系統 MUST 自動建議標籤（domain/role/phase/tool/risk/scope + 自訂），並支援 Reviewer 覆核與修正。
- **FR-006**: 每個流程 MUST 以行動項建立並保留審核紀錄（對應行動優先與人類審核原則）。
- **FR-007**: 輸出 MUST 為 Markdown + Frontmatter 且同步 JSON 結構以便自動化（對應結構透明原則）。
- **FR-008**: 系統 MUST 支援 PDCA 迴圈與週五 16:00 回顧排程（對應持續演化原則）。
- **FR-009**: 系統 MUST 在送交 LLM 前進行 PII 遮罩並保留審計軌跡。
- **FR-010**: 週五回顧 MUST 在失敗時於 10 分鐘與 60 分鐘後自動重試，並通知相關 Reviewer。
- **FR-011**: SOP 匯出 MUST 支援 SemVer 升版、Diff 與批註，並可下載含 Frontmatter 的 Markdown。
- **FR-012**: 系統 MUST 提供行動與回顧成果的搜尋與通知能力，以支援 99% 週回顧成功率。

### Key Entities *(include if feature involves data)*
- **User**: 代表個人工作者或 Reviewer，包含角色、偏好與審核責任。
- **InboxItem**: 原始輸入記錄，連結建立時間、來源、相關對話紀錄。
- **Action**: 可追蹤的行動卡，含負責人、截止時間、完成標準與審核狀態。
- **Project**: 聚合行動、SOP 與 PDCA 的容器，提供跨任務視圖。
- **SOP & SOPVersion**: SOP 主體與各版本內容、Frontmatter、Diff 記錄。
- **PDCA**: 改進迴圈紀錄，包含 Plan/Do/Check/Act 問答、成果與後續假設。
- **WeeklyReview**: 週回顧草稿與結果，紀錄生成時間、內容區塊、通知狀態。
- **Tag**: 控制詞彙與自訂標籤集合，支援搜尋與統計。

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 80% 的任務描述可在 3 分鐘內產出可用 SOP 草稿並完成 Reviewer 審核。
- **SC-002**: 對話意圖與操作建議命中率達 85% 以上，每次偏離需於週回顧追蹤改善。
- **SC-003**: 週五 16:00 回顧草稿生成成功率達 99%，通知開啟率達 60%。
- **SC-004**: Markdown 匯出成功率達 95%，所有匯出皆含正確 Frontmatter 與版本資訊。
- **SC-005**: 100% 的 AI 建議在採納前完成 Reviewer 審核並保留決策記錄。

## Scope Boundaries
- **In Scope**: 對話式 SOP 生成、PAI 流程整合、PDCA 問答與 Diff、標籤覆核、自動週回顧、Markdown 匯出。
- **Out of Scope**: 多組織權限管理、進階分析儀表板、跨平台（行動 App）同步、第三方整合。

## Assumptions
- 使用者皆已具備系統登入權限與基本個人資料，無需重新設計身份驗證流程。
- Reviewer 名單與審核節點由現有組織流程提供，可在啟動前填入系統。
- 初期僅支援單一時區（Asia/Taipei），國際化時程另行評估。

## Dependencies
- 需具備支援 Cron 與重試邏輯的任務排程機制。
- 需整合版本化儲存庫以保留 SOP 與 PDCA Diff。
- 需有通知管道（例如 Email 或 in-app）以推送週回顧與審核提醒。
