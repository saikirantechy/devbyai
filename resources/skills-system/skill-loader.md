# Skill Loader

The loader is responsible for retrieving the correct skill instructions and making them available to the AI agent.

It should be **lazy-loading, version-aware, permission-aware, and compatible** with both skill formats.

---

## A. Loading Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ User submits a development task                             │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Skill Discovery        Find relevant skill descriptions    │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Compatibility Check    Check agent, model, project versions│
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Package Verification Verify checksum, publisher, status    │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Permission Check         Determine tool authorization      │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Load Skill Instructions  Load SKILL.md + references        │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent Context              Skill instructions + task       │
└─────────────────────────────────────────────────────────────┘
```

---

## B. Lazy Loading

Don't put every skill's complete content into the model context. Use three levels:

| Level | What gets loaded | When |
|-------|-----------------|------|
| 1. Discovery | Skill name and description | Skill search |
| 2. Activation | `SKILL.md` | Skill selected |
| 3. Supporting context | References, templates, selected resources | When needed |

**Example:** If a developer asks:

> Create a responsive React dashboard.

The discovery service could select:

- `frontend-builder`
- `react-developer`
- `ui-ux-designer`

It should **not** load database, mobile, and DevOps skills unless the task needs them.

---

## C. Loader Implementation

```ts
interface SkillPackage {
  definition: SkillDefinition;
  files: Record<string, string>;
}

interface SkillLoadRequest {
  skillId: string;
  version?: string;
  userId: string;
  agentApiVersion: string;
}

interface LoadedSkill {
  id: string;
  version: string;
  instructions: string;
  references: string[];
  approvedCapabilities: string[];
}

class SkillLoader {
  constructor(
    private registry: SkillRegistry,
    private storage: SkillStorage,
    private validator: SkillValidator,
    private permissions: PermissionService
  ) {}

  async load(request: SkillLoadRequest): Promise<LoadedSkill> {
    const definition = await this.registry.getVersion(
      request.skillId,
      request.version ?? "latest"
    );

    if (!definition) {
      throw new Error("Skill not found");
    }

    if (definition.validationStatus !== "passed") {
      throw new Error("Skill is not approved for loading");
    }

    const pkg = await this.storage.getPackage(definition.packageChecksum);
    await this.validator.verify(pkg, definition);

    const instructions = pkg.files[definition.entrypoint];
    if (!instructions) {
      throw new Error("Skill entrypoint is missing");
    }

    const approvedCapabilities = await this.permissions.resolve(
      request.userId,
      definition
    );

    return {
      id: definition.id,
      version: definition.version,
      instructions,
      references: [],
      approvedCapabilities
    };
  }
}
```

This is a conceptual implementation skeleton. In production:

- `latest` should be resolved to a concrete version before loading.
- Storage access should verify package ownership and integrity.

---

## D. Loader Caching

Use a cache to avoid repeatedly retrieving identical packages.

Suggested cache key:

```
skill:{skill_id}:{version}:{package_checksum}
```

The checksum makes it possible to identify exactly which package content the agent loaded.

**Caching guidelines:**

- Cache immutable published packages
- Cache normalized metadata
- Do **not** cache user permission decisions as if they were universal
- Invalidate installation and authorization state when users revoke access