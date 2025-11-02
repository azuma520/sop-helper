-- Migration: Add act_acknowledge_insight and act_action_change fields to pdca table
-- Purpose: Support PDCA Act phase with reviewer acknowledgement and action change tracking
-- Related: T010A

ALTER TABLE pdca 
  ADD COLUMN IF NOT EXISTS act_acknowledge_insight JSONB,
  ADD COLUMN IF NOT EXISTS act_action_change JSONB;

-- Add comments for documentation
COMMENT ON COLUMN pdca.act_acknowledge_insight IS '記錄 Act phase 中確認的洞察與學習，供 Reviewer 審核';
COMMENT ON COLUMN pdca.act_action_change IS '記錄 Act phase 中的行動變更決策，包含後續假設與追蹤項';

-- Indexes remain unchanged as existing (org_id, sop_id) index covers these fields

