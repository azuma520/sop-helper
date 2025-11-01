-- 001_init: Core AI SOP schema with RLS scaffolding
-- Generated 2025-11-01

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'mvp',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TYPE user_role AS ENUM ('creator', 'reviewer', 'viewer');
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Taipei',
    preferences JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_org ON users(org_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Inbox Items
CREATE TYPE inbox_status AS ENUM ('draft', 'archived');
CREATE TABLE inbox_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    status inbox_status NOT NULL DEFAULT 'draft',
    linked_sop_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOP table must exist before referencing; define now.
-- SOP
CREATE TYPE sop_status AS ENUM ('draft', 'in_review', 'approved', 'archived');
CREATE TABLE sops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    project_id UUID,
    status sop_status NOT NULL DEFAULT 'draft',
    current_version_id UUID,
    tags JSONB,
    notes TEXT,
    created_by_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sops_org_status ON sops(org_id, status);
CREATE INDEX idx_sops_tags ON sops USING GIN (tags);

-- Update inbox_items foreign key now SOP exists
ALTER TABLE inbox_items
  ADD CONSTRAINT fk_inbox_sop FOREIGN KEY (linked_sop_id) REFERENCES sops(id);

CREATE TRIGGER trg_inbox_items_updated
BEFORE UPDATE ON inbox_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Actions
CREATE TYPE action_status AS ENUM ('pending', 'in_review', 'done', 'blocked');
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    status action_status NOT NULL DEFAULT 'pending',
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    reviewer_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    tags JSONB,
    usage_count INT NOT NULL DEFAULT 0,
    project_id UUID,
    source_inbox_id UUID REFERENCES inbox_items(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_actions_org_status ON actions(org_id, status);
CREATE INDEX idx_actions_tags ON actions USING GIN (tags);
CREATE INDEX idx_actions_owner ON actions(owner_id) WHERE status <> 'done';

CREATE TRIGGER trg_actions_updated
BEFORE UPDATE ON actions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Projects
CREATE TYPE project_status AS ENUM ('active', 'paused', 'completed');
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    objective TEXT,
    status project_status NOT NULL DEFAULT 'active',
    tags JSONB,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_org_status ON projects(org_id, status);

ALTER TABLE actions
  ADD CONSTRAINT fk_actions_project FOREIGN KEY (project_id) REFERENCES projects(id);

CREATE INDEX idx_actions_project ON actions(project_id);

-- SOP Versions
CREATE TYPE sop_version_status AS ENUM ('draft', 'pending_review', 'approved', 'superseded');
CREATE TABLE sop_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
    semver TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    content_json JSONB NOT NULL,
    diff_json JSONB,
    change_summary TEXT,
    status sop_version_status NOT NULL DEFAULT 'draft',
    reviewed_by_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_sop_versions_semver ON sop_versions(sop_id, semver);

ALTER TABLE sops
  ADD CONSTRAINT fk_current_version FOREIGN KEY (current_version_id) REFERENCES sop_versions(id);

CREATE UNIQUE INDEX idx_sops_current_version ON sops(current_version_id) WHERE current_version_id IS NOT NULL;

-- SOP Action Links
CREATE TABLE sop_action_links (
    sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
    action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    ord INT NOT NULL,
    meta JSONB,
    PRIMARY KEY (sop_id, action_id),
    UNIQUE (sop_id, ord)
);

-- PDCA
CREATE TYPE pdca_status AS ENUM ('draft', 'in_review', 'closed');
CREATE TABLE pdca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
    project_id UUID,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    phase_plan JSONB NOT NULL,
    phase_do JSONB NOT NULL,
    phase_check JSONB NOT NULL,
    phase_act JSONB NOT NULL,
    diff_json JSONB,
    status pdca_status NOT NULL DEFAULT 'draft',
    created_by_id UUID NOT NULL REFERENCES users(id),
    reviewed_by_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pdca_org_sop ON pdca(org_id, sop_id);

ALTER TABLE pdca
  ADD CONSTRAINT fk_pdca_project FOREIGN KEY (project_id) REFERENCES projects(id);

CREATE INDEX idx_pdca_project ON pdca(project_id);

-- Weekly Reviews
CREATE TYPE weekly_review_status AS ENUM ('draft', 'published');
CREATE TABLE weekly_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_no INT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    summary JSONB NOT NULL,
    outcomes JSONB NOT NULL,
    issues JSONB NOT NULL,
    next_actions JSONB NOT NULL,
    source_stats JSONB,
    linked_pdca_ids UUID[] DEFAULT '{}',
    linked_sop_version_ids UUID[] DEFAULT '{}',
    status weekly_review_status NOT NULL DEFAULT 'draft',
    generated_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, user_id, week_no)
);

-- Tags
CREATE TYPE tag_namespace AS ENUM ('domain', 'role', 'phase', 'tool', 'risk', 'scope', 'free');
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    namespace tag_namespace NOT NULL,
    value TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tags_org_namespace_value ON tags(org_id, namespace, value);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    request_id TEXT NOT NULL,
    payload_hash TEXT,
    latency_ms INT NOT NULL,
    prompt_version TEXT,
    redactions JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_org_created ON audit_logs(org_id, created_at DESC);

-- Row Level Security scaffolding (policies to be refined per service requirements)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_action_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdca ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy example: users can access rows within their organization
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'org_isolation_users'
  ) THEN
    CREATE POLICY org_isolation_users ON users
      USING (org_id = current_setting('aisop.current_org_id')::uuid);
  END IF;
END $$;

-- Additional policies should be defined at runtime when connections set aisop.current_org_id.

