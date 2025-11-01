# Implementation Plan: AI SOP MVP Workflow Enablement

**Branch**: `001-ai-sop-mvp` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-sop-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

AI SOP MVP 建立對話驅動的 SOP 生成與行動追蹤流程，串接 PAI、PDCA 與週回顧機制。核心包括：對話拆解任務成行動卡，Inbox→Action→Project 與 SOP 維護、PDCA Diff 與版本化、標籤建議覆核，以及週五 16:00 自動回顧與 Markdown 匯出。MVP 目標是 3 分鐘內可產生可審核的 SOP 草稿，週回顧自動化成功率 99%，並確保資料結構與審核留痕符合憲法原則。

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS) for backend, TypeScript (Next.js 14) for frontend
**Primary Dependencies**: NestJS (API), Next.js (SSR/SPA), PostgreSQL, Redis (BullMQ), OpenAI GPT-4o mini, OpenTelemetry, S3-compatible storage, node-cron
**Storage**: PostgreSQL (主 DB), Redis (隊列), S3-compatible object store, Grafana Cloud Tempo/Loki (觀測)
**Testing**: Jest (unit), Dredd (contract), Playwright (E2E), k6 (load)
**Target Platform**: Cloud container runtime (Kubernetes or managed container service) on Linux AMD64
**Project Type**: Web application（Next.js frontend + NestJS backend + shared packages）
**Performance Goals**: API p95 < 800ms, LLM round-trip < 3s, Weekly scheduler success ≥ 99%, Markdown export success ≥ 95%
**Constraints**: PII 遮罩必須在 100ms 內完成；LLM request 必須通過 API Gateway 的速率限制；資料需 RLS 隔離；端到端延遲 < 2 秒
**Scale/Scope**: 初期 100 活躍使用者，單一組織，週產生 200 SOP 草稿、50 PDCA、4 週回顧

## Constitution Check

- 行動優先：所有對話輸入與系統生成結果都轉成行動項，行動含 owner、截止、審核紀錄；規劃 Action Library 與 SOP versioning 關聯追蹤。
- 最小可用：M1 交付對話→SOP→匯出最小流程，可 3 分鐘內操作；每階段記錄下一版改進假設並在周回顧追蹤。
- 持續演化：PDCA 迴圈納入計畫，週五 16:00 排程自動生成回顧草稿；失敗有 10m/60m 重試與補救行動。
- 結構透明：所有輸出採 Markdown + Frontmatter + JSON 結構，Log/Telemetry 保留查詢；審核與 Diff 留痕可追蹤。
- 認知節能與人類審核：UI 提供模板與預填欄位，AI 建議需 Reviewer 審核後才入庫；標籤與 Diff 均需人工覆核操作。

Gate Review: ✅ 通過，無需額外豁免。

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-sop-mvp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
├── web/                 # Next.js frontend (Conversational UI, SOP/PDCA views)
└── api/                 # NestJS backend (conversation, SOP, PDCA, tagging, review)

packages/
├── domain/              # Shared domain models & validation (Action, SOP, PDCA)
├── infra/               # DB, queue, storage adapters, masking utilities
├── workflows/           # Scheduler workers, PDCA jobs, export pipelines
└── telemetry/           # OpenTelemetry setup and logging utilities

tests/
├── contract/            # OpenAPI/Pact contract suites
├── integration/         # Service-to-service & LLM integration tests
└── e2e/                 # Playwright flows (dialog → SOP → PDCA → export)
```

**Structure Decision**: Monorepo with `apps` 分離前後端，`packages` 放共享邏輯與 infrastructure，`tests` 獨立。符合最小可用並利於未來擴充 workers。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 使用隊列 + scheduler | 週五回顧與 PDCA 提醒需可靠重試與延遲處理 | 單純 cron job 無法保證重試與可觀測性 |
| 專屬 infra 套件層 | 採用 Masking、RLS、S3、OpenTelemetry 多項整合 | 若直接寫在服務內將難以重用與符合憲法結構透明 |

## Phase 0: Research Objectives & Outcomes
- 驗證 LLM 供應商、觀測平台、contract 測試工具與排程佇列方案。
- 重點 Deliverable：`research.md`，已記錄決策、理由與替代方案。
- 風險消減：OpenAI 速率限制 → 於 API Gateway 設定配額並預留本地延遲模擬；Grafana Cloud 聯外失敗 → 保留本地 Loki/Tempo fallback 設計草案。

## Phase 1: Design & Contracts
- 產出 `data-model.md`：細化 User/Inbox/Action/Project/SOP/PDCA/WeeklyReview/Tag 等實體欄位、狀態與索引規則。
- 產出 `contracts/openapi.yaml`：定義 `/sops`、`/pdca`、`/actions`、`/tags`, `/weekly-review` 等 REST 端點與 request/response schema。
- 產出 `quickstart.md`：說明啟動環境、填充測試資料、執行對話→SOP→PDCA→匯出→週回顧的端到端操作。
- 更新 Agent Context：呼叫 `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`，新增 NestJS、Next.js、BullMQ、Grafana Cloud 等技術摘要。
- 風險/阻塞：
  - Redis/BullMQ 維運：需定義健康檢查與重連策略。
  - OpenAI API 政策：確認資料遮罩與審計邏輯符合使用條款。

## Constitution Check (Post-Design)
- Phase 1 完成後重新檢視行動優先與審核流程是否在資料模型與 API 中具體落實（Action link、Reviewer 欄位、審核 API）。
- 確認最小可用流程（對話→行動→SOP→匯出）在 quickstart 中可 3 分鐘內演練。
- 確保所有輸出（SOP/PDCA/週回顧）皆提供 Markdown + JSON 結構與審核留痕。
- 若有偏離，需建立即時行動項並記錄於計畫的 Complexity Tracking。
- **結果**：資料模型與合約已涵蓋行動審核欄位、SemVer Diff、週回顧排程；未發現違背憲法之處。
