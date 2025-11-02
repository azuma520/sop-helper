# Phase 2 完成後設置檢查清單

完成 Phase 2 後，請確認以下項目：

## ✅ 已完成項目

### 1. 依賴安裝
- [x] 專案根目錄執行 `npm install` 完成
- [x] 所有 workspace 套件已正確安裝

### 2. Prisma 設置
- [x] 新增 Prisma 腳本到 `apps/api/package.json`:
  - `prisma:generate` - 生成 Prisma Client
  - `prisma:migrate` - 執行資料庫遷移
  - `prisma:studio` - 開啟 Prisma Studio
- [x] 執行 `npm run prisma:generate` 成功生成 Client

### 3. 環境變數範例檔案
- [x] 建立 `apps/api/env.example` 範例檔案
- [ ] **待完成**: 複製 `env.example` 為 `.env` 並設定實際值

### 4. 文件
- [x] 建立 `SETUP.md` 完整設置指南
- [x] 更新 `apps/api/README.md` API 服務說明
- [x] 更新根目錄 `README.md`

### 5. 專案腳本
- [x] 根目錄 `package.json` 新增便捷腳本:
  - `prisma:generate` - 從根目錄執行 Prisma 生成
  - `prisma:migrate` - 從根目錄執行資料庫遷移

## 🔧 待完成項目（開發前必須完成）

### 1. 環境變數設置

```bash
cd apps/api
cp env.example .env
```

編輯 `.env` 檔案，設定：

#### 必須設定的變數：
- [ ] `DATABASE_URL` - PostgreSQL 連線字串
  ```env
  DATABASE_URL="postgresql://user:password@localhost:5432/ai_sop_help_dev?schema=public"
  ```

- [ ] `JWT_SECRET` - JWT 簽章密鑰（生產環境請使用強隨機字串）
  ```env
  JWT_SECRET="your-secret-key-here"
  # 生產環境建議使用: openssl rand -hex 32
  ```

#### 可選變數（有預設值）：
- `PORT` - API 服務埠號（預設: 3000）
- `NODE_ENV` - 執行環境（預設: development）
- `JWT_EXPIRES_IN` - JWT 過期時間（預設: 24h）
- `CORS_ORIGIN` - CORS 允許來源（預設: *）
- `TAGGING_LLM_PROVIDER` - 標籤建議服務（預設: mock）

### 2. 資料庫設置

#### 2.1 建立資料庫

```sql
CREATE DATABASE ai_sop_help_dev;
```

#### 2.2 執行遷移

```bash
# 從專案根目錄
npm run prisma:migrate

# 或從 apps/api 目錄
cd apps/api
npm run prisma:migrate
```

這會：
- 應用所有 SQL migrations（包括新的 PDCA 欄位）
- 建立所有資料表、索引和約束

### 3. 驗證設置

#### 3.1 檢查 Prisma Client 生成

```bash
# 確認 node_modules/@prisma/client 存在且包含最新 schema
npm run prisma:generate
```

#### 3.2 測試 API 啟動

```bash
cd apps/api
npm run start:dev
```

應該看到：
- ✅ 伺服器成功啟動於 http://localhost:3000
- ✅ 沒有資料庫連線錯誤
- ✅ Swagger 文件可用於 http://localhost:3000/api/docs

#### 3.3 測試公開端點

```bash
curl http://localhost:3000/api/v1
```

應該回傳: `"Hello World!"`

#### 3.4 檢查資料庫（可選）

```bash
cd apps/api
npm run prisma:studio
```

這會開啟瀏覽器，可以視覺化查看資料庫結構。

## 📝 注意事項

1. **JWT_SECRET**: 
   - 開發環境可以使用簡單字串
   - 生產環境必須使用強隨機字串: `openssl rand -hex 32`

2. **資料庫連線**:
   - 確認 PostgreSQL 服務正在運行
   - 確認資料庫使用者有適當權限

3. **套件連結**:
   - 如果修改了 `packages/*` 的程式碼，可能需要重新 build:
     ```bash
     cd packages/domain && npm run build
     cd ../infra && npm run build
     ```

4. **TypeScript 編譯**:
   - 如果遇到型別錯誤，確認所有 packages 都已正確 build
   - 檢查 `tsconfig.base.json` 路徑對應是否正確

## ✅ 完成後

完成以上所有項目後，即可開始 Phase 3: User Story 1 - 對話生成 SOP 草稿。

## 遇到問題？

參考：
- [SETUP.md](./SETUP.md) - 完整設置指南
- [apps/api/README.md](./apps/api/README.md) - API 服務詳細說明
- [常見問題](./SETUP.md#常見問題) - 疑難排解

