/**
 * Conversation Domain Models
 *
 * 定義對話生成 SOP 草稿流程的領域模型與驗證邏輯
 * 對應任務：T016
 *
 * 這些模型用於：
 * - LLM 輸出結構化資料
 * - 草稿審核流程
 * - 轉換為正式的 Action 和 SOP
 */
// ==================== 驗證函數 ====================
/**
 * 驗證 ActionDraft 是否完整
 */
export function validateActionDraft(draft) {
    const errors = [];
    if (!draft.title || draft.title.trim().length === 0) {
        errors.push("行動卡標題不可為空");
    }
    if (draft.title && draft.title.length > 200) {
        errors.push("行動卡標題長度不可超過 200 字元");
    }
    if (draft.order !== undefined && draft.order < 1) {
        errors.push("行動卡順序必須大於 0");
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * 驗證 SOPDraft 是否完整
 */
export function validateSOPDraft(draft) {
    const errors = [];
    if (!draft.title || draft.title.trim().length === 0) {
        errors.push("SOP 標題不可為空");
    }
    if (draft.title && draft.title.length > 200) {
        errors.push("SOP 標題長度不可超過 200 字元");
    }
    if (!draft.frontmatter) {
        errors.push("SOP Frontmatter 不可為空");
    }
    else {
        if (!draft.frontmatter.version) {
            errors.push("SOP 版本號不可為空");
        }
        else if (!/^\d+\.\d+\.\d+$/.test(draft.frontmatter.version)) {
            errors.push("SOP 版本號必須符合 SemVer 格式（如 0.1.0）");
        }
        if (!draft.frontmatter.createdBy) {
            errors.push("SOP 建立者不可為空");
        }
    }
    if (!draft.markdownContent || draft.markdownContent.trim().length === 0) {
        errors.push("SOP Markdown 內容不可為空");
    }
    if (!draft.jsonContent) {
        errors.push("SOP JSON 內容不可為空");
    }
    if (!draft.actionDrafts || draft.actionDrafts.length === 0) {
        errors.push("SOP 必須包含至少一個行動卡草稿");
    }
    else {
        // 驗證每個行動卡草稿
        draft.actionDrafts.forEach((actionDraft, index) => {
            const validation = validateActionDraft(actionDraft);
            if (!validation.valid) {
                errors.push(`行動卡 ${index + 1}: ${validation.errors.join(", ")}`);
            }
        });
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * 檢查草稿是否可以提交審核
 */
export function canSubmitDraft(draft) {
    const reasons = [];
    if (draft.reviewStatus === "approved") {
        reasons.push("草稿已審核通過，無需重複提交");
    }
    if (draft.reviewStatus === "rejected") {
        reasons.push("草稿已被拒絕，請修正後再提交");
    }
    // 驗證草稿完整性
    if ("actionDrafts" in draft) {
        // SOPDraft
        const validation = validateSOPDraft(draft);
        if (!validation.valid) {
            reasons.push(...validation.errors);
        }
    }
    else {
        // ActionDraft
        const validation = validateActionDraft(draft);
        if (!validation.valid) {
            reasons.push(...validation.errors);
        }
    }
    return {
        canSubmit: reasons.length === 0,
        reasons,
    };
}
/**
 * 檢查草稿是否可以審核
 */
export function canReviewDraft(draft) {
    return draft.reviewStatus === "pending" && draft.submitted === true;
}
/**
 * 驗證 Frontmatter 格式
 */
export function validateFrontmatter(frontmatter) {
    const errors = [];
    if (!frontmatter.title) {
        errors.push("Frontmatter 標題不可為空");
    }
    if (!frontmatter.version) {
        errors.push("Frontmatter 版本號不可為空");
    }
    else if (!/^\d+\.\d+\.\d+$/.test(frontmatter.version)) {
        errors.push("版本號必須符合 SemVer 格式（如 0.1.0）");
    }
    if (!frontmatter.status) {
        errors.push("Frontmatter 狀態不可為空");
    }
    if (!frontmatter.createdBy) {
        errors.push("Frontmatter 建立者不可為空");
    }
    if (!frontmatter.createdAt) {
        errors.push("Frontmatter 建立時間不可為空");
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * 生成 Frontmatter Markdown 字串
 */
export function generateFrontmatterMarkdown(frontmatter) {
    const lines = ["---"];
    lines.push(`title: ${JSON.stringify(frontmatter.title)}`);
    lines.push(`version: ${frontmatter.version}`);
    lines.push(`status: ${frontmatter.status}`);
    if (frontmatter.tags) {
        lines.push(`tags:`);
        Object.entries(frontmatter.tags).forEach(([namespace, value]) => {
            if (Array.isArray(value)) {
                lines.push(`  ${namespace}: [${value.map(v => JSON.stringify(v)).join(", ")}]`);
            }
            else {
                lines.push(`  ${namespace}: ${JSON.stringify(value)}`);
            }
        });
    }
    lines.push(`createdBy: ${frontmatter.createdBy}`);
    lines.push(`createdAt: ${frontmatter.createdAt}`);
    if (frontmatter.projectId) {
        lines.push(`projectId: ${frontmatter.projectId}`);
    }
    if (frontmatter.description) {
        lines.push(`description: ${JSON.stringify(frontmatter.description)}`);
    }
    if (frontmatter.notes && frontmatter.notes.length > 0) {
        lines.push(`notes:`);
        frontmatter.notes.forEach(note => {
            lines.push(`  - ${JSON.stringify(note)}`);
        });
    }
    if (frontmatter.commonMistakes && frontmatter.commonMistakes.length > 0) {
        lines.push(`commonMistakes:`);
        frontmatter.commonMistakes.forEach(mistake => {
            lines.push(`  - ${JSON.stringify(mistake)}`);
        });
    }
    if (frontmatter.resources && frontmatter.resources.length > 0) {
        lines.push(`resources:`);
        frontmatter.resources.forEach(resource => {
            lines.push(`  - ${JSON.stringify(resource)}`);
        });
    }
    lines.push("---");
    return lines.join("\n");
}
//# sourceMappingURL=conversation.js.map