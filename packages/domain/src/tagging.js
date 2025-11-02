/**
 * Tagging Domain Models
 *
 * 定義標籤建議與審核的領域模型
 * 對應資料模型：Tag (apps/api/prisma/schema.prisma)
 */
/**
 * 驗證標籤命名空間是否有效
 */
export function isValidNamespace(namespace) {
    return [
        "domain",
        "role",
        "phase",
        "tool",
        "risk",
        "scope",
        "free",
    ].includes(namespace);
}
/**
 * 驗證標籤值是否符合規範
 */
export function validateTagValue(value, namespace) {
    const errors = [];
    if (!value || value.trim().length === 0) {
        errors.push("標籤值不可為空");
    }
    if (value.length > 50) {
        errors.push("標籤值長度不可超過 50 字元");
    }
    // 控制詞彙（非 free）需為小寫字母、數字、底線或連字號
    if (namespace !== "free" && !/^[a-z0-9_-]+$/.test(value)) {
        errors.push(`控制詞彙標籤（${namespace}）只能包含小寫字母、數字、底線或連字號`);
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=tagging.js.map