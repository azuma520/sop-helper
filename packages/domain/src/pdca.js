/**
 * PDCA Domain Models
 *
 * 定義 PDCA (Plan-Do-Check-Act) 循環的領域模型與驗證邏輯
 * 對應資料模型：apps/api/prisma/schema.prisma
 */
/**
 * 驗證 PDCA 期間是否有效
 */
export function validatePDCAPeriod(periodStart, periodEnd) {
    return periodEnd >= periodStart;
}
/**
 * 驗證 PDCA 狀態轉換是否合法
 */
export function canTransitionStatus(currentStatus, targetStatus) {
    const validTransitions = {
        draft: ["in_review"],
        in_review: ["draft", "closed"],
        closed: [], // 封閉後不可再變更
    };
    return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
}
/**
 * 驗證 PDCA 是否可以提交審核
 */
export function canSubmitForReview(pdca) {
    const missingFields = [];
    if (!pdca.phasePlan)
        missingFields.push("phasePlan");
    if (!pdca.phaseDo)
        missingFields.push("phaseDo");
    if (!pdca.phaseCheck)
        missingFields.push("phaseCheck");
    if (!pdca.phaseAct)
        missingFields.push("phaseAct");
    // Act phase 的新欄位在提交審核時建議填寫
    // 但為保持向後相容，設為可選
    return {
        valid: missingFields.length === 0,
        missingFields,
    };
}
//# sourceMappingURL=pdca.js.map