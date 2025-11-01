CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
created_by uuid REFERENCES users(id),
updated_at timestamptz DEFAULT now()
);


CREATE TABLE sop_versions (
id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
sop_id uuid NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
semver text NOT NULL,
diff jsonb,
change_summary text,
status text NOT NULL CHECK (status IN ('draft','in_review','approved','archived')),
reviewed_by uuid REFERENCES users(id),
reviewed_at timestamptz
);


-- Actions & Links
CREATE TABLE actions (
id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
title text NOT NULL,
description text,
tags jsonb DEFAULT '{}',
usage_count int DEFAULT 0,
created_by uuid REFERENCES users(id),
created_at timestamptz DEFAULT now()
);


CREATE TABLE sop_action_links (
sop_id uuid REFERENCES sops(id) ON DELETE CASCADE,
action_id uuid REFERENCES actions(id) ON DELETE CASCADE,
ord int NOT NULL,
meta jsonb DEFAULT '{}',
PRIMARY KEY (sop_id, action_id)
);


-- PDCA
CREATE TABLE pdca (
id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
sop_id uuid NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
period_start date,
period_end date,
p jsonb DEFAULT '{}',
d jsonb DEFAULT '{}',
c jsonb DEFAULT '{}',
a jsonb DEFAULT '{}',
diff jsonb DEFAULT '{}',
created_by uuid REFERENCES users(id),
created_at timestamptz DEFAULT now()
);


-- Inbox
CREATE TABLE inbox_items (
id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
text text NOT NULL,
linked_sop_id uuid REFERENCES sops(id),
status text NOT NULL CHECK (status IN ('draft','archived')),
created_at timestamptz DEFAULT now()
);


-- Weekly Reviews
CREATE TABLE weekly_reviews (
id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
week_no int NOT NULL,
week_start date NOT NULL,
week_end date NOT NULL,
summary jsonb DEFAULT '{}',
outcomes jsonb DEFAULT '[]',
issues jsonb DEFAULT '[]',
next_actions jsonb DEFAULT '[]',
source_stats jsonb DEFAULT '{}',
linked_pdca_ids uuid[] DEFAULT ARRAY[]::uuid[],
linked_sop_diff_ids uuid[] DEFAULT ARRAY[]::uuid[],
status text NOT NULL CHECK (status IN ('draft','published')),
generated_at timestamptz,
published_at timestamptz
);


-- Indexes for tags & search
CREATE INDEX IF NOT EXISTS idx_sops_tags_gin ON sops USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_actions_tags_gin ON actions USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_inbox_text_trgm ON inbox_items USING gin (text gin_trgm_ops);