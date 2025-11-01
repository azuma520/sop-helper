# 觀測與遙測指南

AI SOP 系統的觀測策略採用 **OpenTelemetry (OTel)** + **Grafana Cloud**。本文件說明環境變數設定、啟動流程與排錯建議。

## 1. 架構總覽

- `packages/telemetry`：提供 `createTelemetrySDK` / `startTelemetry` / `shutdownTelemetry` 等 helper。
- 預設採用 OTel Node SDK，自動整合常見 Node.js 套件的自動化儀表（HTTP、Express、Prisma…）。
- 使用 OTLP HTTP Exporter 將 Trace / Metrics 傳至 Grafana Cloud。
- 未來可視需求擴充 Logs 或自訂 Span。

## 2. 必要環境變數

| 變數 | 說明 | 範例 |
|------|------|------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Grafana Cloud OTLP Gateway URL（不含 `/v1/*` 路徑，函式會自動補上） | `https://otlp-gateway-prod-us-east-0.grafana.net` |
| `OTEL_EXPORTER_OTLP_HEADERS` | Header 字串，使用逗號或分號分隔 `key=value` | `Authorization=Basic XXXXX, User-Agent=ai-sop` |
| `OTEL_SERVICE_NAME` | 服務識別名稱（若未指定，預設 `ai-sop-service`） | `ai-sop-api` |
| `OTEL_SERVICE_VERSION` | 服務版本號，可對應 git tag 或部署版本 | `1.0.0` |
| `OTEL_ENVIRONMENT` | 部署環境：`development` / `staging` / `production` | `staging` |
| `OTEL_DIAG_LOGGER` | 設為 `console` 時會輸出 OTel debug log（建議僅在除錯時使用） | `console` |

> **Grafana Cloud**：登入後於 **Connections → Data sources → OpenTelemetry** 取得 Endpoint 與 Base64 API Key，填入上述變數即可。

## 3. 服務啟動方式

在需要遙測的服務（例如 `apps/api`）中匯入後啟動：

```ts
import { startTelemetry, shutdownTelemetry } from "@aisop/telemetry";

const bootstrap = async () => {
  const telemetry = await startTelemetry({ serviceName: "ai-sop-api" });

  // ...啟動 NestJS 或其他服務...

  process.on("SIGTERM", async () => {
    await shutdownTelemetry(telemetry);
    process.exit(0);
  });
};

bootstrap();
```

## 4. 指標與儀表板

- Grafana Cloud 建議建立以下面板：
  - `service_name`、`deployment.environment` 維度的請求量、錯誤率、latency。
  - BullMQ 工作負載（可另行提供 exporter）。
  - 每日/每週的行動項審核量、AI 建議採納率（透過自訂 Metrics）。
- Trace 範例：透過前端/後端 Span 追蹤對話生成 SOP、匯出流程等關鍵路徑。

## 5. 常見問題

1. **沒有資料寫入 Grafana**：
   - 確認 Endpoint 與 Headers 是否正確。
   - 檢查 server 是否能連到 Grafana（防火牆或 Proxy）。

2. **本地開發需要快速檢視**：
   - 可將 `OTEL_EXPORTER_OTLP_ENDPOINT` 指向 `http://localhost:4318`，搭配 [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 或 [Grafana Alloy](https://grafana.com/oss/alloy/)。

3. **效能考量**：
   - 預設會啟用 node auto-instrumentations，若造成性能疑慮，可在服務中自訂 `instrumentations` 選項。

## 6. 後續擴充

- 將遮罩模組 (`packages/infra/masking`) 的 `redactions` 納入 Span Event，方便追蹤遮罩量。
- 針對 BullMQ workflow 與週五 Cron 任務加入自訂 Metrics。
- 若需要 SLO/SLA，可導入 Prometheus 計算或 Grafana Cloud k6 整合。

---

如需調整此文件，請開立行動項與 Reviewer 審核，並在 PR 中連結對應任務。"

