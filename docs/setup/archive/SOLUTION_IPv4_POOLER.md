# 解決方案：使用 Session Pooler

## 問題根源

從您的 Supabase Dashboard 可以看到：
1. **Direct connection 不支援 IPv4** ⚠️
   - 警告：`Not IPv4 compatible`
   - 建議：使用 Session Pooler

2. **您的網路環境可能是 IPv4**
   - Windows 環境通常使用 IPv4
   - 因此 Direct connection (`db.xxx.supabase.co:5432`) 無法連線

## 解決方案

### 使用 Session Pooler（推薦）

1. **在 Supabase Dashboard 中**：
   - 找到 "Method" 下拉選單
   - 將 "Direct connection" 改為 **"Session Pooler"** 或 **"Transaction Pooler"**

2. **連線字串會變成類似**：
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true
   ```

3. **更新您的 .env 檔案**：

   **使用 postgres 用戶（標準方式）**：
   ```env
   DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:[您的密碼]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require"
   ```

   **注意**：
   - 用戶名：`postgres.owilwlgyeiexxmmbdmns`（不是 `prisma`）
   - Host：`aws-0-ap-southeast-1.pooler.supabase.com`（pooler）
   - Port：`5432`（Session mode）或 `6543`（Transaction mode）
   - 參數：`pgbouncer=true`（表示使用 pooler）

## 步驟

1. 在 Supabase Dashboard → Connection string 設定
2. 將 "Method" 改為 **"Session Pooler"**
3. 複製新的連線字串
4. 將 `[YOUR_PASSWORD]` 替換為您的實際密碼
5. 更新 `.env` 檔案
6. 測試連線

## 為什麼 prisma 用戶無法連線？

Pooler 主要設計用於標準的 `postgres` 用戶。雖然我們創建了 `prisma` 用戶，但：
- Pooler 可能不支援自定義用戶的認證
- 建議使用標準的 `postgres` 用戶通過 pooler 連線
- Prisma 用戶可以在未來需要時使用（需要 direct connection + IPv6 環境）

## 總結

**您的連線失敗是因為**：
- ❌ Direct connection 不支援 IPv4
- ✅ 需要使用 Session Pooler（支援 IPv4）
- ✅ 使用 `postgres` 用戶（不是 `prisma`）

