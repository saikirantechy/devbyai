# Skills Registry

The registry is the central source of truth for every skill. It should not simply be a folder of `SKILL.md` files — it needs to support discovery, versioning, validation, compatibility, and publishing.

---

## Registry Responsibilities

### Registration

- Receive skill packages
- Parse the manifest and `SKILL.md`
- Validate naming and package structure
- Check package size and allowed file types
- Calculate a SHA-256 package checksum
- Store package and metadata

### Discovery

- Search by name and description
- Filter by framework and category
- Filter by format and compatibility
- Retrieve latest compatible versions
- Retrieve only approved and published skills

### Version Management

- Keep versions immutable
- Support semantic versioning
- Pin versions to agent tasks
- Allow users to update installed skills
- Check dependency compatibility

---

## Suggested Registry Interface

```ts
type SkillFormat = "agentskills" | "devbyai" | "hybrid";

interface SkillDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  format: SkillFormat;

  category: string;
  entrypoint: string;

  capabilities: string[];
  compatibility: {
    agentApi: string;
    frameworks?: string[];
  };

  packageChecksum: string;
  validationStatus: "passed" | "failed" | "quarantined";
}

interface SkillRegistry {
  register(packageFile: Uint8Array): Promise<SkillDefinition>;
  search(query: string): Promise<SkillDefinition[]>;
  getSkill(id: string): Promise<SkillDefinition | null>;
  getVersion(id: string, version: string): Promise<SkillDefinition | null>;
  publish(id: string, version: string): Promise<void>;
  listVersions(id: string): Promise<SkillDefinition[]>;
}
```

---

## Skill Publishing Workflow

1. Developer uploads a ZIP or connects a supported Git repository.
2. Registry validates the package structure.
3. Security scanner checks scripts, dependencies, and suspicious content.
4. Compatibility validator checks `SKILL.md` and manifest fields.
5. Package receives a checksum and is stored as an immutable version.
6. Community submissions enter moderation or review.
7. Approved versions become discoverable in the marketplace.

A published package should have a clear provenance record: who published it, which version was uploaded, what was validated, and whether the package changed.