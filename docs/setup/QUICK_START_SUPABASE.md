# 使用 Supabase 快速開始

5 分鐘內完成資料庫設置。

## 步驟 1: 建立 Supabase 專案

1. 前往 https://supabase.com
2. 註冊/登入帳號
3. 點擊 "New Project"
4. 設定：
   - Name: `ai-sop-helper-dev`
   - Database Password: **記下這個密碼！**
   - Region: `Southeast Asia (Singapore)` 或離您最近的區域
5. 等待建立完成（約 2-3 分鐘）

## 步驟 2: 取得連線字串

1. 進入專案後，點擊左側 **Settings**（齒輪圖示）
2. 點擊 **Database**
3. 在 **Connection string** 區段，選擇 **URI** 標籤
4. 點擊 **Copy** 複製連線字串

## 步驟 3: 設定環境變數

```bash
cd apps/api
cp env.example .env
```

編輯 `.env`，將 `DATABASE_URL` 替換為 Supabase 的連線字串：

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
```

**重要**：將 `[YOUR-PASSWORD]` 替換為您在步驟 1 設定的資料庫密碼。

## 步驟 4: 執行遷移

```bash
npm run prisma:migrate
```

這會建立所有資料表。

## 步驟 5: 驗證

### 方法 1: Supabase Dashboard

進入 Supabase Dashboard → **Table Editor**，應該可以看到所有資料表。

### 方法 2: Prisma Studio

```bash
npm run prisma:studio
```

應該可以連線並查看資料表。

## 完成！

現在您可以：
- ✅ 執行 `npm run start:dev` 啟動 API
- ✅ 開始開發 Phase 3 功能

## 需要幫助？

- 詳細說明：[DATABASE_SETUP_SUPABASE.md](../../DATABASE_SETUP_SUPABASE.md)
- Supabase 文件：https://supabase.com/docs

