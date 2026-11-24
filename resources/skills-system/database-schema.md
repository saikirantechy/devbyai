# Database Schema — Skills System

Recommended database: **PostgreSQL** — supports relational data, JSONB metadata, constraints, and full-text search.

Separate the database into four logical areas:

1. Skill catalog and versions
2. Publisher and marketplace information
3. User installations and preferences
4. Agent execution and security audit records

---

## A. Core Entity Relationships

```
USERSSKILLSSKILL_VERSIONSSKILL_DEPENDENCIESSKILL_INSTALLATIONSSKILL_REVIEWSAGENT_TASKSAGENT_SKILL_RUNSSKILL_AUDIT_EVENTSpublisheshasdeclaresinstalledownspinsreceiveswritesstartsactivatesusesrecords
```

---

## B. Recommended Tables

| Table | Purpose |
|-------|---------|
| `users` | DevByAI accounts |
| `skill_publishers` | Official and community publishers |
| `skills` | Stable identity and marketplace listing |
| `skill_versions` | Immutable versions of skill packages |
| `skill_dependencies` | Dependencies and compatibility constraints |
| `skill_installations` | User-installed skills |
| `skill_reviews` | Ratings and written reviews |
| `skill_categories` | Marketplace categories |
| `skill_permissions` | Requested and approved permission information |
| `agent_tasks` | User coding-agent sessions |
| `agent_skill_runs` | Skill activation and execution metadata |
| `skill_audit_events` | Security and lifecycle events |

---

## C. PostgreSQL Schema

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Stable skill identity
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    publisher_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    distribution TEXT NOT NULL
        CHECK (distribution IN ('official', 'community')),
    format TEXT NOT NULL
        CHECK (format IN ('agentskills', 'devbyai', 'hybrid')),
    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'private', 'unlisted')),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'suspended', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable published package versions
CREATE TABLE skill_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id),
    version TEXT NOT NULL,
    entrypoint TEXT NOT NULL DEFAULT 'SKILL.md',
    manifest JSONB NOT NULL DEFAULT '{}',
    package_uri TEXT NOT NULL,
    package_sha256 TEXT NOT NULL,
    validation_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (validation_status IN (
            'pending', 'passed', 'failed', 'quarantined'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(skill_id, version)
);

-- Versioned dependencies
CREATE TABLE skill_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_version_id UUID NOT NULL REFERENCES skill_versions(id),
    dependency_skill_id UUID NOT NULL REFERENCES skills(id),
    version_range TEXT NOT NULL
);

-- User installations
CREATE TABLE skill_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    skill_id UUID NOT NULL REFERENCES skills(id),
    skill_version_id UUID NOT NULL REFERENCES skill_versions(id),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Requested capabilities
CREATE TABLE skill_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_version_id UUID NOT NULL REFERENCES skill_versions(id),
    capability TEXT NOT NULL,
    requested BOOLEAN NOT NULL DEFAULT TRUE,
    approval_required BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(skill_version_id, capability)
);

-- Agent task records
CREATE TABLE agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID,
    status TEXT NOT NULL DEFAULT 'queued',
    task_description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Skills activated in each task
CREATE TABLE agent_skill_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_task_id UUID NOT NULL REFERENCES agent_tasks(id),
    skill_version_id UUID NOT NULL REFERENCES skill_versions(id),
    activation_reason TEXT,
    status TEXT NOT NULL DEFAULT 'loaded',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit trail
CREATE TABLE skill_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    skill_version_id UUID REFERENCES skill_versions(id),
    agent_task_id UUID REFERENCES agent_tasks(id),
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_status ON skills(status);
CREATE INDEX idx_skill_versions_skill ON skill_versions(skill_id, created_at DESC);
CREATE INDEX idx_skill_installations_user ON skill_installations(user_id);
CREATE INDEX idx_agent_skill_runs_task ON agent_skill_runs(agent_task_id);
```

### Implementation Notes

- Add a foreign key from `skills.publisher_id` to your publisher table.
- Connect `user_id` and `project_id` to your existing account and project tables.
- Store immutable skill package versions. Never overwrite a published package.
- Store packages in object storage rather than PostgreSQL.
- Keep the package checksum and validation results in PostgreSQL.
- Use transactions for publishing and installation.
- Enforce ownership and tenant isolation at the database/API layer.

---

## D. Marketplace Additions

For the community marketplace, add:

- Publisher verification
- Skill moderation status
- Reviews and ratings
- Download and installation counts
- Report and abuse records
- Version compatibility
- License and attribution metadata

**Important:** Don't allow a publisher to self-award an official or verified badge. Those statuses should be controlled by the DevByAI moderation process.