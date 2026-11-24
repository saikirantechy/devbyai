# Architecture Review Skill

Architecture and design review for DEVBYAI agents. Checks module boundaries, design patterns, coupling, and structural integrity.

---

## 1. Skill Metadata

```ts
export const architectureReviewMetadata: CodeReviewMetadata = {
  id: "architecture-review",
  name: "Architecture Review",
  description: "Architecture and design review: module boundaries, patterns, coupling",
  priority: 80,
  reviewDimensions: ["architecture"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer", "planner", "architect"],
};
```

---

## 2. Architecture Review Instructions

```ts
export class ArchitectureReviewSkill implements CodeReviewSkill {
  readonly metadata = architectureReviewMetadata;

  async review(files: string[], context: ReviewContext): Promise<CodeReviewResult[]> {
    const results: CodeReviewResult[] = [];

    results.push(...await this.checkModuleBoundaries(files));
    results.push(...await this.checkCoupling(files));
    results.push(...await this.checkDesignPatterns(files));
    results.push(...await this.checkLayering(files));

    return results;
  }

  private async checkModuleBoundaries(files: string[]): Promise<CodeReviewResult[]> {
    // Check that modules don't violate boundaries
    return [];
  }

  private async checkCoupling(files: string[]): Promise<CodeReviewResult[]> {
    // Check for tight coupling between modules
    return [];
  }

  private async checkDesignPatterns(files: string[]): Promise<CodeReviewResult[]> {
    // Verify consistent use of design patterns
    return [];
  }

  private async checkLayering(files: string[]): Promise<CodeReviewResult[]> {
    // Check layer separation (presentation, business, data)
    return [];
  }

  getReviewChecklist(dimension: "architecture"): string[] {
    return [
      "Module boundaries respected (no circular dependencies)",
      "Layer separation maintained (API, business, data)",
      "Consistent design patterns across codebase",
      "No tight coupling between unrelated modules",
      "Dependencies flow in one direction",
      "Public API surface well-defined",
      "Internal implementation details hidden",
      "Configuration separated from code",
      "Error handling strategy consistent",
      "Logging strategy consistent",
    ];
  }
}
```

---

## 3. Architecture Review Checklist

| Item | Severity | Description |
|------|----------|-------------|
| Circular dependencies | `high` | Modules don't import each other circularly |
| Layer separation | `medium` | API, business, data layers separated |
| Coupling | `medium` | Modules loosely coupled |
| Design patterns | `low` | Consistent patterns used |
| API surface | `medium` | Public API well-defined and stable |
| Dependency direction | `high` | Dependencies flow inward, not outward |
| Implementation hiding | `low` | Internal details not exposed |
| Configuration | `low` | Config separated from business logic |

---

## 4. Tool Support

| Tool | Purpose |
|------|---------|
| `list_files` | Explore project structure and module organization |
| `read_file` | Read source for architecture analysis |
| `search_files` | Search for imports, patterns, dependencies |

Example:

```ts
const circularImports = await tools.search_files({
  pattern: "from.*\\.\\./.*\\/index",
  directory: "src/",
});
```

---

## 5. Registering the Skill

```ts
export { ArchitectureReviewSkill, architectureReviewMetadata } from "./built-in/architecture-review.js";

import { ArchitectureReviewSkill } from "./built-in/architecture-review.js";

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new ArchitectureReviewSkill());
  return registry;
}
```
