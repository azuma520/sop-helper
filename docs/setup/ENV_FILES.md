# 環境變數文件說明

## .env vs .env.local

### .env（NestJS 標準）

在 NestJS 專案中，使用 **`.env`** 是標準做法：

- ✅ NestJS 內建支援（使用 `@nestjs/config`）
- ✅ 所有環境變數都會自動載入
- ✅ 已在 `.gitignore` 中，不會提交到 Git

**當前專案使用 `.env`**，這是正確的選擇。

### .env.local（Next.js 慣例）

`.env.local` 是 **Next.js** 等框架的慣例：

- 主要用於 Next.js 專案
- 優先級高於 `.env`
- 也已在 `.gitignore` 中

**如果您的專案同時使用 Next.js**，可以在 `apps/web/` 中使用 `.env.local`。

## 文件優先級（Next.js）

如果同時存在多個環境變數文件（Next.js），優先級為：

1. `.env.local`（最高優先級，本地覆蓋）
2. `.env.development` / `.env.production`（環境特定）
3. `.env`（通用設定）

## 當前專案建議

### API 服務 (apps/api/)

**使用 `.env`**：
```env
DATABASE_URL=...
DIRECT_URL=...
JWT_SECRET=...
```

### Web 服務 (apps/web/)

如果未來需要環境變數，可以使用：
- `.env.local` - 本地開發
- `.env.development` - 開發環境
- `.env.production` - 生產環境

## .gitignore 設定

目前 `.gitignore` 已正確設定：

```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.development
.env.test
.env.production
# Keep .env.example files
!.env.example
```

這表示：
- ✅ 所有環境變數文件都會被忽略
- ✅ 但 `.env.example` 會保留在 Git 中（作為範本）

## 最佳實踐

1. **永遠不要**將 `.env` 提交到 Git
2. **提供** `.env.example` 作為範本
3. **在 NestJS 專案中使用** `.env`
4. **在 Next.js 專案中使用** `.env.local`（如果需要）

## 結論

**您目前使用 `.env` 是完全正確的**，不需要改為 `.env.local`。`.env.local` 主要是 Next.js 的慣例，NestJS 專案使用 `.env` 即可。

