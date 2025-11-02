# 根據 Supabase 官方文檔修正連線問題

根據 [Supabase Prisma 文檔](https://supabase.com/docs/guides/database/prisma)，可能的原因和解決方法：

## 問題診斷

"Tenant or user not found" 錯誤通常表示：
1. 用戶名稱格式不正確
2. 需要創建專用的 Prisma 用戶（推薦）
3. 連線字串格式需要調整

## 解決方案

### 方法 1: 使用專用的 Prisma 用戶（推薦）

根據 Supabase 文檔，建議創建專用的 Prisma 用戶：

1. **在 Supabase Dashboard → SQL Editor 執行以下 SQL**：

```sql
-- 創建專用的 Prisma 用戶
CREATE USER "prisma" WITH PASSWORD 'your_strong_password_here' BYPASSRLS CREATEDB;

-- 擴展 prisma 的權限到 postgres（必要，用於在 Dashboard 中查看變更）
GRANT "prisma" TO "postgres";

-- 授予必要權限
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;

-- 設定預設權限
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
```

2. **更新 .env 檔案**：

```env
DATABASE_URL="postgresql://prisma.owilwlgyeiexxmmbdmns:your_strong_password_here@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

注意：用戶名稱從 `postgres` 改成 `prisma`

### 方法 2: 使用默認 postgres 用戶（如果方法 1 不適用）

如果繼續使用 `postgres` 用戶，確保：

1. **連線字串格式**（根據文檔）：
   - 使用 Supavisor Session pooler
   - Port 5432
   - 格式：`postgres://postgres.[PROJECT-REF]:[PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres`

2. **確認密碼正確**：
   - 在 Supabase Dashboard → Settings → Database
   - 點擊 "Reset database password" 重置密碼
   - 使用新密碼更新 `.env`

3. **驗證專案狀態**：
   - 確認專案狀態是 ACTIVE_HEALTHY
   - 檢查專案沒有被暫停

## 測試步驟

1. 更新 `.env` 檔案
2. 測試連線：
   ```bash
   cd apps/api
   node test-db-connection.js
   ```
3. 如果成功，生成 Prisma Client：
   ```bash
   npm run prisma:generate
   ```

## 參考資料

- [Supabase Prisma 官方文檔](https://supabase.com/docs/guides/database/prisma)
- Supabase 建議使用專用 Prisma 用戶以獲得更好的控制和監控

