# Build System 規範

本文件定義 AI SOP Monorepo 的建構流程、套件管理器與 CI/CD 標準，確保本地與雲端環境一致並具增量快取能力。

## 1. 套件管理與環境

- **Package Manager**：採用 `pnpm@^9`（本地與 CI 需一致）。
- **Node 版本**：20.x LTS（建議使用 `nvm` 或 `.nvmrc` 管理）。
- **Monorepo 工具**：Turborepo（使用 `turbo.json` 管理 pipeline）。
- **鎖檔策略**：鎖檔為 `pnpm-lock.yaml`，必須提交版本控制；CI 使用 `pnpm install --frozen-lockfile`。

## 2. 工作空間命名

| Workspace | 說明 |
|-----------|------|
| `apps/web` | Next.js 前端 App Router |
| `apps/api` | NestJS 後端 API |
| `packages/domain` | Domain 模型與驗證 |
| `packages/infra` | 基礎設施（DB、Masking、Queue...）|
| `packages/workflows` | 排程、BullMQ 工作流程 |
| `packages/telemetry` | OpenTelemetry SDK |
| `tests/*` | 共用測試或工具 |

## 3. Turbo Pipeline（`turbo.json` 範例）

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["pnpm-lock.yaml"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "lint": { "outputs": [], "cache": true },
    "test": { "outputs": ["coverage/**"], "cache": true },
    "dev": { "cache": false, "persistent": true }
  }
}
```

## 4. CI 標準流程（GitHub Actions 範例）

1. 使用 `actions/setup-node@v4`（Node 20）
2. 使用 `pnpm/action-setup@v4` 安裝 pnpm
3. `pnpm install --frozen-lockfile`
4. `pnpm turbo run lint test build --cache-dir=.turbo`
5. 若失敗，將 `.turbo/` 與測試報告上傳為 Artifact 供除錯

## 5. 環境變數管理

- Root 需提供 `.env.example`，列出所有可設定環境變數與說明。
- 各環境（dev/staging/prod）採 `.env.{environment}`，不可提交敏感值。
- CI 只允許白名單中的 Key 寫入（建議維護 `env.allowlist.json` 用於驗證）。

## 6. 版本策略與命名

- **後端**：遵循 semver（重大變更＝major；功能新增＝minor；修正＝patch）。
- **Branch 命名**：`feature/xxx`、`fix/xxx`、`chore/xxx`。
- **Tag**：可使用 `api-v1.2.0`、`web-v1.2.0` 區分子系統。

## 7. 快取與增量建置

- Turborepo 透過 `.turbo/` 快取同一 pipeline 的輸出，需在 CI 上傳/下載快取。
- 對於 NestJS / Next.js，可考慮搭配 `@nrwl/nx` 或 `tsc --build` 以增量編譯。

---

如需修改本規範，請提出行動項並通過 Reviewer 審核後更新。"

