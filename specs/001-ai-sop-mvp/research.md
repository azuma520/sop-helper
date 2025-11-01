# AI SOP MVP Workflow Enablement — Research

## Open Questions & Resolution

### LLM 供應商選擇
- **Decision**: 使用 OpenAI GPT-4o mini 作為初期 LLM 服務供應商。
- **Rationale**: 提供穩定對話與結構化輸出能力，支援合理速率限制，易於搭配既有 Masking 流程。
- **Alternatives considered**: Anthropic Claude（Masking 範例較少）、自建 Llama（MVP 成本與維運壓力過高）。

### Python 工具鏈需求
- **Decision**: MVP 階段不引入 Python 工具鏈，所有工作流以 Node.js/TypeScript 完成。
- **Rationale**: 目前需求集中於 API、前端與排程，TS 方案即可滿足並降低多語言維護成本。
- **Alternatives considered**: Python 用於資料/ML pipeline（非 MVP 範圍）、Go worker（過早優化）。

### 觀測後端服務
- **Decision**: 採用 Grafana Cloud（Tempo + Loki + Prometheus）託管觀測平台。
- **Rationale**: 提供托管型 OTel 接收器、儀表板與警報，部署成本低；Tempo/Loki 與 OpenTelemetry 整合完善。
- **Alternatives considered**: 自建 Grafana Stack（增加運維負擔）、Datadog（成本較高）。

### Contract 測試工具
- **Decision**: 使用 Dredd 驗證 OpenAPI 契約。
- **Rationale**: 現行 API 為 REST/OpenAPI，Dredd 能直接對照規格與回應，導入成本低。
- **Alternatives considered**: Pact（偏 consumer-driven，設定較多）、Schemathesis（後續可做 fuzz 補強）。

### Scheduler & Queue 組合
- **Decision**: BullMQ（Redis）管理工作佇列與重試，node-cron 觸發週期任務。
- **Rationale**: BullMQ 原生支援延遲與重試，Node.js 生態成熟，node-cron 易於設定時區；符合 MVP 所需可靠度。
- **Alternatives considered**: Temporal/Airflow（過度複雜）、純 cron job（缺少重試與狀態追蹤）。

## Technology Decisions Summary
- **Backend**: NestJS + TypeScript
- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL 15（支援 RLS）
- **Queue**: Redis + BullMQ
- **Object Storage**: AWS S3 或相容服務
- **LLM Provider**: OpenAI GPT-4o mini（透過 API Gateway & Masking）
- **Observability**: OpenTelemetry SDK → Grafana Cloud (Tempo/Loki/Prometheus)
- **Contract Testing**: OpenAPI + Dredd
- **E2E Testing**: Playwright
- **Load Testing**: k6 + LLM latency 模擬腳本
- **Security Stack**: OIDC（Auth0/Cognito）、Postgres RLS、API Gateway Rate Limit

## Assumptions Confirmed
- 單一時區 (Asia/Taipei) 排程足以支援 MVP；多時區於後續里程碑處理。
- org_id + RLS 可提供跨組織資料隔離，符合安全原則。
- LLM Masking 以 Regex/NER 將敏感資訊替換為佔位符，並記錄 redactions[] 供稽核。
