# API 測試指南

## 快速開始

### 1. 啟動 API 服務

```bash
cd apps/api
npm run start:dev
```

API 會運行在 `http://localhost:3000`

### 2. 取得 JWT Token

首先需要登入取得 JWT Token。如果還沒有實作 Auth API，可以使用 Swagger UI 測試：

1. 開啟瀏覽器訪問：`http://localhost:3000/api/docs`
2. 使用 Swagger UI 的 Authorize 功能輸入 JWT Token

### 3. 執行測試腳本

```bash
# 基本測試（不需要 Token）
node tests/api-test.js

# 完整測試（需要 Token）
JWT_TOKEN=your-jwt-token node tests/api-test.js

# 或使用命令列參數
node tests/api-test.js --base-url=http://localhost:3000/api/v1 --token=your-jwt-token

# 顯示詳細回應（VERBOSE 模式）
VERBOSE=1 JWT_TOKEN=your-jwt-token node tests/api-test.js
```

## 測試端點

### 1. Conversation Parse API

```bash
curl -X POST http://localhost:3000/api/v1/conversation/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "我需要建立一個資料庫備份的 SOP，包含檢查連線、執行備份、驗證完整性三個步驟",
    "context": {
      "existingTags": {
        "domain": "ops"
      }
    }
  }'
```

**預期回應：**
- Status: 200
- Body: `{ sopDraft: { ... }, promptVersion: "v1.0.0", ... }`

### 2. SOP List API

```bash
curl -X GET "http://localhost:3000/api/v1/sops?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**預期回應：**
- Status: 200
- Body: `{ items: [...], total: 0 }`

### 3. SOP Detail API

```bash
curl -X GET "http://localhost:3000/api/v1/sops/{sop-id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Tags Suggest API

```bash
curl -X POST http://localhost:3000/api/v1/tags/suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "這是一個關於資料庫備份的標準作業程序",
    "context": {}
  }'
```

## 使用 Postman 或 Insomnia

### 匯入 Collection

可以建立 Postman Collection，包含以下請求：

1. **Conversation Parse**
   - Method: POST
   - URL: `{{baseUrl}}/conversation/parse`
   - Headers: `Authorization: Bearer {{token}}`
   - Body (JSON):
     ```json
     {
       "text": "測試對話內容",
       "context": {}
     }
     ```

2. **SOP List**
   - Method: GET
   - URL: `{{baseUrl}}/sops?limit=10`
   - Headers: `Authorization: Bearer {{token}}`

3. **Tags Suggest**
   - Method: POST
   - URL: `{{baseUrl}}/tags/suggest`
   - Headers: `Authorization: Bearer {{token}}`
   - Body (JSON):
     ```json
     {
       "text": "測試文字",
       "context": {}
     }
     ```

### 環境變數

在 Postman 中設定：
- `baseUrl`: `http://localhost:3000/api/v1`
- `token`: `your-jwt-token`

## 常見問題

### 1. 401 Unauthorized

**原因**：缺少或無效的 JWT Token

**解決方法**：
- 確認已提供有效的 JWT Token
- 檢查 Token 是否過期
- 確認 API 的認證設定正確

### 2. 500 Internal Server Error

**原因**：伺服器端錯誤

**解決方法**：
- 檢查 API 服務日誌
- 確認資料庫連線正常
- 檢查環境變數設定

### 3. Connection Refused

**原因**：API 服務未啟動

**解決方法**：
- 確認 API 服務正在運行
- 檢查 Port 是否被占用
- 確認 `API_BASE_URL` 設定正確

## 測試檢查清單

- [ ] API 服務正常啟動
- [ ] Swagger UI 可以訪問
- [ ] 可以取得 JWT Token
- [ ] Conversation Parse API 回應正確
- [ ] SOP List API 回應正確
- [ ] Tags Suggest API 回應正確
- [ ] 審計日誌正常記錄（檢查資料庫 `audit_logs` 表）
- [ ] 錯誤處理正常（測試無效輸入）

