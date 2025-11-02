# 快速 Git 設定指南

## 你的 Git 資訊

- **使用者名稱**: azuma520
- **Email**: kyoe33@gmail.com

## 快速步驟

### 1. 在 GitHub 建立 Repository

前往：https://github.com/new

- **Repository name**: `sop-helper`
- **Description**: `AI SOP 系統 — 對話生成 SOP、PDCA、標籤、匯出、週回顧的 MVP 專案`
- **Visibility**: Private ✅
- **不要勾選** "Initialize this repository with a README"
- 點擊 **Create repository**

### 2. 連接本地 Repository

建立 repository 後，GitHub 會顯示 URL。選擇以下其中一種方式：

#### 方式 A: 使用 HTTPS（推薦新手）

```bash
git remote add origin https://github.com/azuma520/sop-helper.git
```

#### 方式 B: 使用 SSH（推薦，更安全）

```bash
git remote add origin git@github.com:azuma520/sop-helper.git
```

> **注意**: 使用 SSH 需要先設定 SSH key，請參考 [GitHub SSH 設定](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### 3. 驗證設定

```bash
git remote -v
```

應該看到：
```
origin  https://github.com/azuma520/sop-helper.git (fetch)
origin  https://github.com/azuma520/sop-helper.git (push)
```

### 4. 推送程式碼

```bash
# 推送目前的分支
git push -u origin 001-ai-sop-mvp

# 如果之後想要推送 main 分支
git checkout main  # 或 master
git push -u origin main
```

## 使用自動化腳本

專案根目錄有提供自動化腳本：

**Windows:**
```cmd
setup-git-remote.bat
```

**Linux/Mac:**
```bash
chmod +x setup-git-remote.sh
./setup-git-remote.sh
```

## 常見問題

### Q: 推送時要求輸入密碼？

**A**: 如果是 HTTPS，需要使用 Personal Access Token (PAT) 作為密碼：

1. 前往 [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. 點擊 "Generate new token (classic)"
3. 選擇權限：`repo` (完整 repository 權限)
4. 複製 token
5. 推送時，使用者名稱輸入 `azuma520`，密碼輸入 token

**建議**: 使用 SSH 可以避免這個問題。

### Q: 想要更換 remote URL？

```bash
# 移除舊的
git remote remove origin

# 加入新的
git remote add origin NEW_URL
```

### Q: 想要推送所有分支？

```bash
git push --all origin
```

