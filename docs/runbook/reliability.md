# Reliability Runbook

本文件定義排程任務的重試政策、事故升級流程與通知機制，確保系統在自動重試失敗後有人為介入。

## 1. 重試策略

| 任務 | 重試節奏 | 次數上限 | Backoff | 升級門檻 |
|------|-----------|-----------|---------|----------|
| `weekly_review` | 10m → 60m | 3 | exponential (2x) | 連續失敗 2 次 |
| `pdca_job` | 5m 固定 | 5 | linear | 連續失敗 3 次 |
| `export_markdown` | 2m 固定 | 3 | none | 連續失敗 3 次 |

## 2. 升級流程

狀態機：

```
RETRYING → (達重試上限) → INCIDENT_OPEN
INCIDENT_OPEN → ONCALL_NOTIFIED → HUMAN_INTERVENTION
HUMAN_INTERVENTION → (修復) → INCIDENT_RESOLVED
```

## 3. 事件與通知

- **產生事件**：`incident.create { job_type, attempt, last_error, thread_id }`
- **通知對象**：Slack / Email → `oncall_reviewer`（每日輪值名單）
- **人工操作**：
  - `incident.retry_manual`（記錄 operator_id 與時間）
  - `incident.resolved`（附 root cause 摘要與修復步驟）

## 4. 回顧與紀錄

- 在下一次週會自動插入「可靠性回顧」段落，包含：
  - 近 7 天 incident 概述
  - MTTR（Mean Time To Recovery）
  - Top 3 根因與改善行動

## 5. 監控指標

- `incident.count_by_job`
- `incident.mttr_minutes`
- `queue.retry_attempts`

---

修改本 Runbook 需建立行動項並經 Reviewer 確認。"

