# 修正 Topics 設定

## 目前的問題

Topics 現在顯示為：`ai-sop-nestjs-nextjs-typescript-monorepo`（一個連在一起的標籤）

這是**錯誤**的！應該要分成多個獨立的 topics。

## 正確的做法

Topics 應該是**多個分開的標籤**，例如：

✅ **正確**：
```
[ai] [sop] [nestjs] [nextjs] [typescript] [monorepo]
```

❌ **錯誤**：
```
[ai-sop-nestjs-nextjs-typescript-monorepo]
```

## 修正步驟

1. 前往你的 repository：https://github.com/azuma520/sop-helper
2. 在 About 區域找到 Topics
3. 點擊 Topics 右側的 ⚙️ 圖示
4. **刪除**目前的 `ai-sop-nestjs-nextjs-typescript-monorepo`
5. **分別輸入**以下 6 個 topics（每輸入一個後按 Enter）：

   - 輸入 `ai` 然後按 Enter
   - 輸入 `sop` 然後按 Enter
   - 輸入 `nestjs` 然後按 Enter
   - 輸入 `nextjs` 然後按 Enter
   - 輸入 `typescript` 然後按 Enter
   - 輸入 `monorepo` 然後按 Enter

6. 每個 topic 會變成一個獨立的藍色標籤
7. 點擊 "Save changes" 或按 Enter 儲存

## 完成後應該看到的樣子

Topics 區域應該顯示 6 個獨立的藍色標籤：

```
ai  sop  nestjs  nextjs  typescript  monorepo
```

每個標籤都是可以點擊的，點擊後會搜尋其他有相同 topic 的專案。

