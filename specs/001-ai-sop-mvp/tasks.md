---

description: "Task list for AI SOP MVP Workflow Enablement feature implementation"
---

# Tasks: AI SOP MVP Workflow Enablement

**Input**: Design documents from `/specs/001-ai-sop-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: 實際需要的測試皆已列為任務，請依優先順序執行。若未特別標註，測試可視狀況調整。

**Organization**: Tasks are grouped by user story以維持各故事的獨立交付。

**Constitution Guardrails**:
- 行動優先：每個任務建立相對應的行動項（Action），指定 owner／due／審核者，完成後更新審核紀錄。
- 最小可用：優先完成能在 3 分鐘演示的流程，後續優化另建任務與 PDCA 條目。
- 持續演化：於任務描述中標註需要更新 PDCA 與週回顧的資料收集或自動化需求。
- 結構透明：明確指定 Markdown + Frontmatter 以及 JSON 結構輸出路徑，保留審核與 Diff 留痕。
- 認知節能與人類審核：標示 Reviewer 審核點、UI 預填/模板需求與 AI 建議覆核流程。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（不同檔案、無相依）。
- **[Story]**: 對應的使用者故事（US1/US2/US3 或 Foundation）。
- 描述中包含具體檔案路徑與交付品。

## Path Conventions

- Monorepo：`apps/api/`、`apps/web/`、`packages/*/`、`tests/*/`
- Contracts：`specs/001-ai-sop-mvp/contracts/`
- Documentation：`docs/` or `specs/001-ai-sop-mvp/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立 monorepo 基礎結構與開發工作流程。

- [x] T001 Create pnpm workspace with `apps/`、`packages/`、`tests/` skeleton; 初始化 `package.json` scripts（`pnpm dev:api`, `pnpm dev:web`, `pnpm dev:worker`）。
- [x] T002 建立 `apps/api` NestJS scaffold（REST + OpenAPI），並於 README 記錄啟動指令及行動追蹤連結。
- [x] T003 建立 `apps/web` Next.js 14 App Router scaffold，整合 Tailwind/Chakra（若選用）與國際化設定。
- [x] T004 [P] 設定 `packages/domain`、`packages/infra`、`packages/workflows`、`packages/telemetry` 專案骨架與共用 ESLint/Prettier 設定。
- [x] T005 撰寫 `docs/guardrails/actions.md`，描述行動項紀錄方式、審核流程與 reviewer 名單。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 建立後端核心能力，確保資料治理、遮罩與審核留痕到位。**⚠️ 完成前不可開始使用者故事開發。**

- [x] T006 設計 PostgreSQL schema 與 migration（users/organizations/inbox_items/actions/projects/sops/sop_versions/pdca/weekly_reviews/tags/audit_logs），加上必要索引與 RLS 政策。
- [x] T007 [P] 實作 `packages/infra/db`（Prisma/TypeORM 選擇）並設定審計欄位與多租戶過濾。
- [x] T008 [P] 建立 `packages/infra/masking`：提供 LLM 前遮罩函式、redactions 記錄與單元測試。
- [x] T009 建構 `packages/telemetry`（OpenTelemetry SDK + Grafana Cloud 匯流設定），並新增 `docs/observability.md` 說明。
- [ ] T010 實作 BullMQ + node-cron 基礎流程（`packages/workflows/scheduler`），含 10m/60m 重試與任務審計表。
- [ ] T011 [P] 建立 API Gateway / AuthN 結構（JWT/OIDC middleware、RBAC decorator、Rate limit policy 在 `apps/api/src/common/`）。
- [ ] T012 導入 `contracts/openapi.yaml` 為 NestJS OpenAPI 來源，並新增 CI 腳本 `pnpm test:contract`（Dredd）。
- [ ] T012A [P] 建立 `packages/domain/tagging` 與 `packages/infra/tagging`：定義標籤建議輸入/輸出模型、Reviewer 審核欄位與審計記錄。
- [ ] T012B 建立 `apps/api/src/tags` 模組：串接遮罩後的 LLM 建議、儲存候選標籤、提供覆核/commit API，並撰寫單元測試。

**Checkpoint**: DB schema 部署、遮罩、觀測、排程、認證皆完成並具單元測試。

---

## Phase 3: User Story 1 - 對話生成 SOP 草稿 (Priority: P1) 🎯 MVP

**Goal**: 3 分鐘內由對話產出可審核的 SOP 草稿和行動卡。

### Tests for User Story 1 ⚠️
- [ ] T013 [P] [US1] 撰寫 `tests/contract/conversation.dredd.yml`，驗證 `/conversation/parse` 及 `/sops` 創建流程。
- [ ] T014 [US1] 撰寫 `tests/e2e/conversation.spec.ts`（Playwright）：對話→行動卡→審核→匯出草稿。

### Implementation for User Story 1
- [ ] T015 建立 `apps/api/src/conversation` 模組：串接遮罩、提示模板、OpenAI GPT-4o mini，輸出結構化行動。
- [ ] T016 [P] 在 `packages/domain` 定義 `ActionDraft`、`SOPDraft` 型別與驗證邏輯（含審核欄位、Frontmatter 片段）。
- [ ] T017 更新 `apps/api/src/sops`：支援接收 draft actions、建立 SOP與 `SOPActionLink`、寫入審核記錄。
- [ ] T018 建置 `apps/web/app/conversation` UI：支援模板引導、常見錯誤提示與 Reviewer 審核工作流。
- [ ] T019 [P] 建立 `packages/infra/audit`，在對話 & SOP API 進入點記錄 `AuditLog`（含 prompt_version、redactions）。
- [ ] T020 [US1] 補齊 `docs/conversation-flow.md`：記錄最小可用流程、範例、審核清單。
- [ ] T020A [P] 於對話流程與 SOP 建立事件追蹤（意圖命中／誤判／覆核結果），寫入 telemetry 與 PDCA 資料來源。

**Checkpoint**: 對話→行動→SOP 草稿流程可演示，所有輸出皆為 Markdown + JSON 並具審核留痕。

---

## Phase 4: User Story 2 - PAI 流程與 PDCA 改版 (Priority: P2)

**Goal**: 讓 Inbox→Action→Project流程與 PDCA Diff 自動化，支援周期性改版。

### Tests for User Story 2 ⚠️
- [ ] T021 [P] [US2] `tests/integration/pdca-diff.spec.ts`：模擬 PDCA 問答，驗證 Diff 與 SOP vNext 草稿。
- [ ] T022 [US2] `tests/contract/pdca.dredd.yml`：覆蓋 `/pdca`、`/pdca/{id}/diff`、`/sops/{id}/versions` 流程。

### Implementation for User Story 2
- [ ] T023 擴充 `apps/api/src/inbox`：提供 Inbox→Action 兩步轉換 API，建立行動項與 Project 關聯。
- [ ] T024 [P] 實作 `apps/api/src/actions/library`：Action 重用、usage_count++、行動審核紀錄更新。
- [ ] T025 [US2] 在 `apps/api/src/pdca` 新增問答、Diff 生成與 vNext 建立；整合 `packages/domain/pdca` 邏輯。
- [ ] T026 [P] 更新 `apps/web/app/projects/[id]` 頁面：顯示 SOP、行動、PDCA 列表與待審核提示。
- [ ] T027 實作 `packages/workflows/pdca-reminder`：每日 09:00 掃描 30 天未更新的 SOP，建立新行動項並通知。
- [ ] T028 [US2] 更新 `docs/pdca-diff.md`：紀錄 Diff 規則、審核步驟、PDCA 與 SOP 版本映射。

**Checkpoint**: Inbox→Action→Project 完成；PDCA 問答產生 Diff 與 vNext；提醒機制對應憲法持續演化。

---

## Phase 5: User Story 3 - 每週五回顧與匯出 (Priority: P3)

**Goal**: 週五 16:00 自動生成回顧與通知，並支援一鍵匯出/轉 PDCA。

### Tests for User Story 3 ⚠️
- [ ] T029 [P] [US3] `tests/workflows/weekly-review.worker.spec.ts`：模擬 Cron 執行與 10m/60m 重試。
- [ ] T030 [US3] `tests/e2e/weekly-review.spec.ts`：從匯出 SOP → 週回顧產生 → 轉 PDCA → 匯出 Markdown。

### Implementation for User Story 3
- [ ] T031 實作 `packages/workflows/weekly-review`：聚合當週指標、產生草稿 JSON 與通知佇列。
- [ ] T032 [P] 更新 `apps/api/src/weekly-review` API：手動觸發、列表、publish 流程與審核欄位。
- [ ] T033 建置 `apps/web/app/weekly-review` 視圖：呈現 Top Actions/Outcomes/Issues/PDCA/Next Actions、提供 PDCA/SOP Diff 快捷。
- [ ] T034 [US3] 完成 SOP Markdown 匯出模組（`packages/infra/export`）：產生 Frontmatter + Diff、上傳 S3、寫入版本審核紀錄。
- [ ] T035 [P] 建立 `packages/infra/notifications`（Email/SMS/In-app 模組），整合 action log 與 fallback 機制。
- [ ] T036 更新 `docs/weekly-review.md`：記錄 Cron 設定、通知流程、審核責任與常見錯誤處理。
- [ ] T036A [US3] 在週回顧生成流程中加入意圖命中率、AI 建議覆核統計，並於草稿中呈現異常趨勢。

**Checkpoint**: 週五 Cron 成功生成草稿、推送通知並支援轉換；匯出成功率與審核留痕符合成功指標。

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: 收尾、優化與合規檢查。

- [ ] T037 [P] 撰寫 `docs/quickstart-update.md`：更新 quickstart、常見問題與行動追蹤策略。
- [ ] T038 [P] 強化安全性：新增 API Gateway audit log dashboard、Rate Limit 警報與滲透測試腳本。
- [ ] T039 進行 k6 壓力測試與 LLM latency 模擬，調整排程與佇列設定；於 `docs/perf-report.md` 記錄結果。
- [ ] T040 [P] 彙整 PDCA / 週回顧指標進 Grafana Dashboard，並排程每週回顧會議。
- [ ] T041 [US1][US2][US3] 行動項整理：確認所有未完成/審核行動在任務完成前清零，並在 PDCA 中記錄學習心得。
- [ ] T042 [P] 建立「意圖命中率 & 標籤覆核」儀表板（Grafana），納入告警門檻並在 `docs/observability.md` 補充操作指引。

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: 無相依，可立即開始。
- **Foundational (Phase 2)**: 依賴 Phase 1 完成，阻擋所有使用者故事。
- **User Stories (Phase 3/4/5)**: 皆依賴 Foundational；US1 為 MVP 優先交付，US2/US3 可在 US1 完成後並行。
- **Polish (Final Phase)**: 所有主要使用者故事完成後進行。

### User Story Dependencies
- **US1**: 完成 Foundational 即可開始。
- **US2**: 需 US1 的行動卡與 SOP 草稿資料型別可用。
- **US3**: 需 US1/US2 生成的 SOP/PDCA 結構與導出功能。

### Within Each User Story
- 測試（如有標示）必須在實作前撰寫並確認初始失敗。
- Model/schema ⇒ Service/Workflow ⇒ API/UI ⇒ Telemetry/審核。
- 實作後更新文檔與行動追蹤。

### Parallel Opportunities
- Setup 階段中標示 [P] 之任務可平行。
- Foundational 的 DB/Masking/Telemetry/API Gateway 可平行，但需在合併前做整合測試。
- US2 與 US3 某些 UI/Workflow 任務可在 US1 完成後同步進行。
- 將測試、文件、觀測設定交由不同成員並行。

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. 完成 Phase 1 + Phase 2。
2. 交付 US1 對話→SOP MVP 流程並通過測試。
3. 驗證 3 分鐘內操作與 Markdown 匯出功能。

### Incremental Delivery
1. Setup + Foundational → 基礎完成。
2. US1 Deliverable → 對話產生 SOP。
3. US2 Deliverable → PAI 流程 + PDCA Diff。
4. US3 Deliverable → 週回顧與匯出。
5. 每個里程碑結束後更新 PDCA 與週回顧報告。

### Parallel Team Strategy
1. 團隊首先協同完成 Setup + Foundational。
2. US1 完成後：
   - 開發 A：維護/優化對話流程與觀測。
   - 開發 B：專注 PDCA Diff（US2）。
   - 開發 C：實作週回顧與匯出（US3）。
3. 透過 BullMQ 與 Telemetry 監控平行任務的排程與佇列狀態。

---

## Notes
- 務必在每個任務建立 / 更新對應行動項並於審核時勾選完成。
- Markdown 與 JSON 輸出需同步維護，確保結構透明。
- 若任務需要新增原則豁免，需在 Complexity Tracking 中記錄並提交 PDCA。

