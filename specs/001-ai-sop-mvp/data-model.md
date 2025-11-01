# AI SOP MVP — Data Model

## Entities Overview
1. `User`
2. `Organization`
3. `InboxItem`
4. `Action`
5. `Project`
6. `SOP`
7. `SOPVersion`
8. `PDCA`
9. `WeeklyReview`
10. `Tag`
11. `AuditLog`

## Entity Definitions

### User
- **Purpose**: 代表系統使用者（個人工作者、Reviewer、Viewer）。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK → Organization.id, NOT NULL)
  - `email` (text, UNIQUE, lowercase)
  - `name` (text, NOT NULL)
  - `role` (enum: `creator`, `reviewer`, `viewer`)
  - `timezone` (text, default `Asia/Taipei`)
  - `preferences` (jsonb, optional)
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)
- **Validation**: email 格式；角色必須在 enum 內；timezone 需符合 IANA。
- **Relationships**: 擁有多個 `InboxItem`、`Action`、`SOP`、`PDCA`、`WeeklyReview`。

### Organization
- **Purpose**: 租戶隔離單位。
- **Fields**:
  - `id` (UUID, PK)
  - `name` (text, UNIQUE)
  - `plan` (text, default `mvp`)
  - `created_at` (timestamptz)
- **Notes**: 所有主要資料表含 `org_id`，並配合 Postgres RLS 實現隔離。

### InboxItem
- **Purpose**: 捕捉使用者的初始想法或任務描述。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK → Organization.id)
  - `user_id` (UUID, FK → User.id)
  - `text` (text, NOT NULL)
  - `status` (enum: `draft`, `archived`)
  - `linked_sop_id` (UUID, FK → SOP.id, nullable)
  - `metadata` (jsonb, 包含語言、來源 channel)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- **Indexes**:
  - `idx_inbox_text_trgm` (GIN, trigram) for full-text search.
  - `(org_id, status)` BTree for篩選。
- **State Transition**: `draft` → `archived`（完成轉換或手動清理）。

### Action
- **Purpose**: 可重用的行動卡片，對應憲法行動優先原則。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK)
  - `title` (text, NOT NULL)
  - `description` (text)
  - `owner_id` (UUID, FK → User.id)
  - `status` (enum: `pending`, `in_review`, `done`, `blocked`)
  - `due_at` (timestamptz, optional)
  - `completed_at` (timestamptz)
  - `reviewed_by` (UUID, FK → User.id)
  - `reviewed_at` (timestamptz)
  - `tags` (jsonb)
  - `usage_count` (int, default 0)
  - `source_inbox_id` (UUID, FK → InboxItem.id)
  - `created_at` (timestamptz)
- **Validation**: owner 必填；`due_at >= created_at`；`completed_at` 需晚於 `due_at`。
- **Relationships**: 多對多連接至 `SOP` 透過 `SOPActionLink`。

### SOP
- **Purpose**: SOP 主體，對應項目流程。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK)
  - `title` (text, NOT NULL)
  - `project_id` (UUID, FK → Project.id)
  - `status` (enum: `draft`, `in_review`, `approved`, `archived`)
  - `current_version_id` (UUID, FK → SOPVersion.id)
  - `tags` (jsonb: domain/role/phase/tool/risk/scope + free)
  - `notes` (text)
  - `created_by` (UUID, FK → User.id)
  - `reviewer_id` (UUID, FK → User.id)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- **Indexes**:
  - `(org_id, status)`
  - `GIN(tags)`

### SOPVersion
- **Purpose**: 保留 SOP 的版本歷史與 Diff。
- **Fields**:
  - `id` (UUID, PK)
  - `sop_id` (UUID, FK → SOP.id)
  - `semver` (text, constrained by semantic version format)
  - `content_markdown` (text)
  - `content_json` (jsonb, Frontmatter + structured steps)
  - `diff_json` (jsonb)
  - `change_summary` (text)
  - `status` (enum: `draft`, `pending_review`, `approved`, `superseded`)
  - `reviewed_by` (UUID, FK → User.id)
  - `reviewed_at` (timestamptz)
  - `created_at` (timestamptz)
- **Rules**:
  - 同一 SOP 的 `semver` 不可重複。
  - `approved` 版本需鎖定 `content_markdown`。

### SOPActionLink
- **Purpose**: 關聯 SOP 與行動卡，維護順序。
- **Fields**:
  - `sop_id` (UUID, FK)
  - `action_id` (UUID, FK)
  - `ord` (int)
  - `meta` (jsonb: 包含步驟類型、預估時間、風險)
- **Constraints**: PK(`sop_id`, `action_id`)，`ord` 需連續且唯一（per sop）。

### Project
- **Purpose**: 聚合行動、SOP 與 PDCA。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK)
  - `title` (text)
  - `objective` (text)
  - `status` (enum: `active`, `paused`, `completed`)
  - `tags` (jsonb)
  - `owner_id` (UUID, FK → User.id)
  - `created_at` (timestamptz)
- **Relationships**: 一對多對應 `SOP`、`PDCA`、`Action`。

### PDCA
- **Purpose**: 記錄 SOP 改進迴圈 (Plan/Do/Check/Act)。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK)
  - `sop_id` (UUID, FK)
  - `period_start` (date)
  - `period_end` (date)
  - `phase_plan` (jsonb)
  - `phase_do` (jsonb)
  - `phase_check` (jsonb)
  - `phase_act` (jsonb)
  - `diff_json` (jsonb)
  - `status` (enum: `draft`, `in_review`, `closed`)
  - `created_by` (UUID, FK → User.id)
  - `reviewed_by` (UUID)
  - `reviewed_at` (timestamptz)
  - `created_at` (timestamptz)
- **Validation**: `period_end >= period_start`；狀態由 `draft → in_review → closed`。

### WeeklyReview
- **Purpose**: 固定週期回顧成果，支援自動生成。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK)
  - `user_id` (UUID, FK)
  - `week_no` (int)
  - `week_start` / `week_end` (date)
  - `summary` (jsonb: Top Actions/Outcomes/Issues/PDCA/Next Actions)
  - `source_stats` (jsonb: 週期內 SOP/PDCA/Action 指標)
  - `linked_pdca_ids` (uuid[])
  - `linked_sop_version_ids` (uuid[])
  - `status` (enum: `draft`, `published`)
  - `generated_at` (timestamptz)
  - `published_at` (timestamptz)
- **Indexes**: `(org_id, user_id, week_no UNIQUE)`。

### Tag
- **Purpose**: 控制詞彙與自訂標籤集合。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK)
  - `namespace` (enum: `domain`, `role`, `phase`, `tool`, `risk`, `scope`, `free`)
  - `value` (text)
  - `metadata` (jsonb: 顏色、描述)
  - `created_at` (timestamptz)
- **Notes**: 用於維護下拉選單與統計。SOP/Action 的 `tags` jsonb 包含對應 namespace。

### AuditLog
- **Purpose**: 記錄 API 請求與審核操作。
- **Fields**:
  - `id` (UUID, PK)
  - `org_id` (UUID, FK)
  - `user_id` (UUID)
  - `endpoint` (text)
  - `method` (text)
  - `request_id` (text)
  - `payload_hash` (text)
  - `latency_ms` (int)
  - `prompt_version` (text)
  - `redactions` (jsonb)
  - `created_at` (timestamptz)
- **Indexes**: `(org_id, created_at)`、`(user_id, created_at)`。

## Relationships Diagram (Text)

```
Organization 1---* User
Organization 1---* InboxItem
Organization 1---* Project
Organization 1---* SOP
Organization 1---* Action
Organization 1---* PDCA
Organization 1---* WeeklyReview
Organization 1---* Tag

User 1---* InboxItem
User 1---* Action (owner)
User 1---* SOP (created_by)
User 1---* SOPVersion (reviewed_by)
User 1---* PDCA (created_by/reviewed_by)
User 1---* WeeklyReview

Project 1---* SOP
SOP 1---* SOPVersion
SOP 1---* PDCA
SOP 1---* SOPActionLink *---1 Action
PDCA 1---* Action (through generated actions)
WeeklyReview *---* PDCA (linked_pdca_ids)
WeeklyReview *---* SOPVersion (linked_sop_version_ids)
```

## Derived Views & Index Strategy
- **Materialized View `mv_weekly_metrics`**：彙整每週 SOP/Action/PDCA 數量與平均審核時間，供週回顧生成與儀表板使用。每日 02:30 刷新。
- **GIN Index on JSONB**：`tags` 及 `diff_json` 以 GIN 支援 faceted search 與 Diff 查詢。
- **Partial Index**：`idx_actions_pending_owner` on `(owner_id)` where status <> 'done'，用於提醒未指派行動。
- **Full-text Search**：`to_tsvector('zhparser', content_markdown)` 產生 SOP 搜尋欄位（可能使用 pg_jieba 或 zhparser）。

## Data Integrity Rules
- 所有主資料表必須記錄 `org_id` 以配合 RLS。
- 每個審核流程（SOPVersion、PDCA、WeeklyReview）需紀錄 `reviewed_by` 與 `reviewed_at`。缺漏者禁止進入 `approved`/`published` 狀態。
- SOPVersion `semver` 演進：
  - 初版：`1.0.0`
  - PDCA 改動：MINOR/MAJOR 依作用範圍。
  - 僅文案修正：PATCH。
- 行動項在轉為 `done` 前，需要 `Reviewer` 確認或有備註說明豁免。
- 每次 LLM 呼叫前後記錄 `redactions[]` 與 `prompt_version` 以供稽核。`AuditLog` 須保留 365 天。


