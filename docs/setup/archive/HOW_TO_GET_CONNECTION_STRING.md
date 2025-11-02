# 如何取得 Supabase 連線字串

## 📍 在 Database Settings 頁面

根據您的截圖，您目前在 Database Settings 頁面。以下是取得連線字串的方法：

### 方法 1: 直接在 Database Settings 頁面

1. **往下滾動** Database Settings 頁面
2. 找到 **"Connection string"** 或 **"Connection info"** 區段
3. 應該會看到多個選項：
   - **Session mode** (port 5432)
   - **Transaction mode** (port 5432)  
   - **Connection pooling** (port 6543) ⭐ **推薦這個**

### 方法 2: 從側邊欄進入（如果找不到）

1. 點擊左側邊欄的 **"Settings"**（齒輪圖示）→ **"Database"**
2. 或者直接前往：https://supabase.com/dashboard/project/owilwlgyeiexxmmbdmns/settings/database
3. 找到 **"Connection string"** 區段

## 🎯 您需要做的事

### 步驟 1: 取得/設定密碼

在您目前看到的頁面：
- **Database password** 區段
- 點擊 **"Reset database password"** 按鈕
- 設定一個密碼（請記住！）

### 步驟 2: 找到連線字串區段

**在您目前的頁面往下滾動**，應該會看到類似這樣的區段：

```
Connection string
┌─────────────────────────────────────┐
│ URI                                 │ ← 選擇這個標籤
│ Connection pooling                  │ ← 選擇這個模式
│                                     │
│ postgresql://postgres.owilwlgye... │ ← 複製這個字串
└─────────────────────────────────────┘
```

如果沒看到，試試：
1. 點擊瀏覽器的重新整理
2. 或直接前往：https://supabase.com/dashboard/project/owilwlgyeiexxmmbdmns/settings/database

## 📝 連線字串格式

當您找到連線字串時，格式應該是：

```
postgresql://postgres.owilwlgyeiexxmmbdmns:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**重要**：將 `[YOUR-PASSWORD]` 替換為步驟 1 設定的密碼。

## 🔍 如果還是找不到

請告訴我您在頁面上看到哪些區段，我可以幫您定位！

