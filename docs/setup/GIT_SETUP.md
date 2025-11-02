# Git Repository 設定指南

## 建立 GitHub Repository 並連接

### 步驟 1: 在 GitHub 建立新 Repository

1. 前往 [GitHub](https://github.com/new)
2. Repository name: `sop-helper` (或你喜歡的名稱)
3. Description: `AI SOP 系統 — 對話生成 SOP、PDCA、標籤、匯出、週回顧的 MVP 專案`
4. Visibility: **Private** (建議，因為專案可能包含敏感資訊)
5. **不要**勾選 "Initialize this repository with a README"
6. 點擊 "Create repository"

### 步驟 2: 連接本地 Repository

在專案目錄執行以下命令：

```bash
# 替換 YOUR_USERNAME 為你的 GitHub 使用者名稱
git remote add origin https://github.com/YOUR_USERNAME/sop-helper.git

# 或使用 SSH（如果你有設定 SSH key）
# git remote add origin git@github.com:YOUR_USERNAME/sop-helper.git
```

### 步驟 3: 確認 Remote 設定

```bash
git remote -v
```

應該會看到：
```
origin  https://github.com/YOUR_USERNAME/sop-helper.git (fetch)
origin  https://github.com/YOUR_USERNAME/sop-helper.git (push)
```

### 步驟 4: 推送現有的 Commit

```bash
# 先檢查目前的分支和狀態
git branch
git status

# 推送所有分支到 GitHub
git push -u origin 001-ai-sop-mvp

# 如果 main/master 分支存在，也要推送
git push -u origin main
```

## 使用 SSH (推薦)

如果你偏好使用 SSH 連接：

### 檢查是否已有 SSH Key

```bash
ls -al ~/.ssh
```

### 如果沒有 SSH Key，建立一個：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 將 SSH Key 加到 GitHub

1. 複製公鑰內容：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. 前往 [GitHub SSH Settings](https://github.com/settings/keys)
3. 點擊 "New SSH key"
4. 貼上公鑰內容並儲存

### 使用 SSH 連接

```bash
git remote set-url origin git@github.com:YOUR_USERNAME/sop-helper.git
```

## 常見問題

### 問題 1: 推送時要求認證

**解決方案**: 
- 使用 Personal Access Token (PAT) 作為密碼
- 或設定 SSH key 使用 SSH 連接

### 問題 2: 想要更換 Remote URL

```bash
# 查看目前的 remote
git remote -v

# 移除舊的 remote
git remote remove origin

# 加入新的 remote
git remote add origin NEW_URL
```

### 問題 3: 想要推送所有分支

```bash
# 推送所有分支
git push --all origin

# 推送所有 tags
git push --tags origin
```

## 設定 GitHub Actions (可選)

如果要在 GitHub 上設定 CI/CD，可以在 `.github/workflows/` 目錄建立 workflow 檔案。

## 設定 Repository 說明

建立 repository 後，建議在 GitHub 上設定：

1. **Topics**: `ai`, `sop`, `nestjs`, `nextjs`, `typescript`, `monorepo`
2. **About**: 更新專案描述
3. **Website**: 如果有部署的話
4. **README**: 確保 README.md 是完整的

## 保護主分支 (可選)

在 GitHub Settings → Branches 設定分支保護規則：
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require conversation resolution before merging

