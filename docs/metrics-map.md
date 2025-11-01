# Metrics Map

本文件將核心 KPI 與 OpenTelemetry Span/Event 映射，並提供 Grafana 可視化建議，協助追蹤系統健康度與產品成效。

## 1. KPI 與遙測對照

| KPI | 定義 | 遙測來源 | 建議指標名稱 |
|-----|------|-----------|---------------|
| 3 分鐘產出 SOP 草稿 | `sop.draft_created` Timestamp – `conversation.started` Timestamp ≤ 180s 的比例 | Event + Span 屬性 | `sop_draft_t_elapsed_ms`（event prop）|
| LLM 回應 < 3s | 單次 LLM 請求耗時 p95 | Span (`ai.llm.request`) | `ai_llm_request_duration_ms` |
| 週回顧成功率 ≥ 99% | `weekly_review.generated` / 觸發次數 | Event | `weekly_review_success_rate` |
| Markdown 匯出成功率 ≥95% | `export.markdown_succeeded` / 嘗試次數 | Event | `export_markdown_success_rate` |
| 遮罩延遲 ≤100ms | 遮罩函式耗時 p95 | Span (`pii.mask`) | `pii_mask_duration_ms` |

### 事件範例

```json
[
  {"event":"conversation.started", "props":{"user_id":"u_x","thread_id":"t_1"}},
  {"event":"sop.draft_created", "props":{"thread_id":"t_1","t_elapsed_ms":128000,"actions":4,"pii_masked":true}},
  {"event":"sop.draft_reviewed", "props":{"reviewer_id":"u_r","decision":"approved","t_to_review_ms":42000}},
  {"event":"pdca.session_completed", "props":{"plan_len":320,"issues_count":3,"next_actions":5}},
  {"event":"weekly_review.generated", "props":{"retry":0,"sections":["TopActions","PDCA","Next"]}},
  {"event":"export.markdown_succeeded", "props":{"semver":"1.3.0","bytes":8421,"with_frontmatter":true}}
]
```

### Trace 結構建議

- `conversation.start → ai.llm.request (child: pii.mask) → sop.build → review → export`
- `scheduler.weekly_run → ai.llm.request → export → notify`

## 2. Span / Event 命名規範

- `snake_case`，數值型名稱後綴 `_ms`、`_rate`、`_total` 等。
- Span 名稱範例：`ai.llm.request`、`pii.mask`、`sop.build`、`weekly.review`。
- Event 名稱範例：`conversation.started`、`sop.draft_created`、`export.markdown_succeeded`。

## 3. Grafana 面板

- 建議建立以下面板：
  - `panel.ai_sop_roundtrip_ms`：顯示從對話到 SOP 草稿的整體耗時分布。
  - `panel.weekly_review_success_rate`：週回顧自動生成成功率。
  - `panel.ai_llm_request_p95_ms`：LLM 請求耗時 p95。
  - `panel.export_markdown_success_rate`：匯出成功率。

## 4. 後續實作建議（Issue 參考）

- `OBS-001`：植入 span：`ai.llm.request`、`pii.mask`、`sop.build`、`weekly.run`、`export.markdown`。
- `OBS-002`：發送核心事件：`sop.draft_created` 等六項。
- `OBS-003`（延伸）：於遮罩模組記錄 redaction 數量與耗時。

---

修改本文件需建立行動項並通過 Reviewer 審核。"

