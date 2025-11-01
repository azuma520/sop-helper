# Deployment Profile

定義 Dev / Staging / Prod 三套部署環境的目標、組態與健康檢查，確保從開發到上線一致且可預測。

## 1. 環境矩陣

| 環境 | 目的 | 組態 | 擴縮策略 | 數據 | 備註 |
|------|------|------|-----------|------|-----|
| **Dev** | 本地/開發 | Node.js 20、SQLite 或本地 Postgres、Local Redis、MinIO | 手動 | 合成資料 | 允許開發者使用 `.env.development` |
| **Staging** | 預備上線 | Postgres RDS (small)、Redis Cloud (standard)、S3、Grafana Cloud | HPA：min=1, max=3 | 匿名化子集資料 | 與 Prod 同步配置，驗證部署手順 |
| **Prod** | 生產 | RDS (多區可用)、Redis Cloud (HA)、S3、Grafana Tempo/Loki Cloud | HPA：min=3, max=8 | 真實資料 + RLS | Queue worker 需獨立部署 |

## 2. HPA（Horizontal Pod Autoscaler）參考

- 目標 CPU 利用率：60%
- Latency：p95 < 800ms
- Queue worker 需根據排程複雜度獨立調整（例：BullMQ worker min=2, max=6）。

## 3. 機密管理

- 使用 K8s Secrets 或 SOPS（KMS 加密）。
- 僅允許白名單環境變數注入容器（建議維護 `env.allowlist.json`）。

## 4. 健康檢查

| 類型 | 路徑 | 說明 |
|------|------|------|
| Liveness Probe | `/health/live` | 檢查應用是否仍在運行（純應用邏輯，不依賴外部資源）。 |
| Readiness Probe | `/health/ready` | 檢查 DB / Redis / S3 / OTLP 是否可用，以決定是否加入負載平衡。 |

## 5. CI/CD 流程（建議）

- `main` → 自動部署至 Staging；成功後手動批准部署 Prod。
- 部署腳本應包含：
  - 套用 K8s manifests（Deployment, Service, HPA, Ingress）。
  - Per-environment config maps / secrets。
  - Smoke test（檢查核心 API 與排程任務）。

## 6. 擴充規劃

- 可將 Observability 模組（OTel）與安全元件（遮罩、審計）透過 Feature Flag 控管，在 Staging 逐步開啟並監控效果。
- 若需 Multi-Region，可於 Prod 增加讀寫分離與 CDN。

---

任何變更需建立行動項並通過 Reviewer 審核後更新。"

