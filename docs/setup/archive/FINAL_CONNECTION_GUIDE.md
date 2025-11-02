# 最終連線設定指南

## 問題分析

根據測試結果，發現：
1. **Direct connection** (`db.xxx.supabase.co:5432`) 無法連線 - "Can't reach database server"
2. **Pooler connection** (`pooler.supabase.com:5432`) 出現 "Tenant or user not found" - 表示 pooler 可能不支援自定義 `prisma` 用戶

## 解決方案

### 方案 A: 使用 postgres 用戶 + Pooler（最簡單）

根據 Supabase 文檔，pooler 主要支援 `postgres` 用戶。您可以：

1. **在 Supabase Dashboard → Settings → Database → 重置 postgres 密碼**
2. **使用以下連線字串**：

```env
DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:[您的密碼]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### 方案 B: 繼續使用 prisma 用戶（如果方案 A 不行）

如果 pooler 確實不支援自定義用戶，我們需要：
1. 使用 direct connection，但需要確認 Supabase 專案是否允許 direct connection
2. 或使用 Transaction mode (port 5432, pooler)

## 建議

**先試試方案 A**：使用 `postgres` 用戶通過 pooler 連接，這是最標準的方式。

步驟：
1. Supabase Dashboard → Settings → Database
2. 點擊 "Reset database password"
3. 設定新密碼
4. 更新 `.env` 檔案：
   ```env
   DATABASE_URL="postgresql://postgres.owilwlgyeiexxmmbdmns:[新密碼]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
   ```

## 為什麼 prisma 用戶無法透過 pooler 連接？

Supabase 的 pooler (pgBouncer) 可能在用戶認證方面有限制，只支援標準的 `postgres` 用戶格式。自定義用戶可能需要使用 direct connection 或不同的認證方式。

