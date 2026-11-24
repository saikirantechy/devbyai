# Performance Review Skill

Performance-focused code review for DEVBYAI agents. Identifies slow algorithms, N+1 queries, blocking I/O, and optimization opportunities.

---

## 1. Skill Metadata

```ts
export const performanceReviewMetadata: CodeReviewMetadata = {
  id: "performance-review",
  name: "Performance Review",
  description: "Performance and optimization review: complexity, queries, I/O, rendering",
  priority: 85,
  reviewDimensions: ["performance"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer", "backend-developer", "frontend-developer"],
};
```

---

## 2. Performance Review Instructions

```ts
export class PerformanceReviewSkill implements CodeReviewSkill {
  readonly metadata = performanceReviewMetadata;

  async review(files: string[], context: ReviewContext): Promise<CodeReviewResult[]> {
    const results: CodeReviewResult[] = [];

    for (const file of files) {
      results.push(...await this.checkComplexity(file));
      results.push(...await this.checkNPlusOneQueries(file));
      results.push(...await this.checkBlockingIO(file));
      results.push(...await this.checkRenderingPerformance(file));
    }

    return results;
  }

  private async checkComplexity(file: string): Promise<CodeReviewResult[]> {
    // Flag O(n²) algorithms, nested loops, exponential complexity
    return [];
  }

  private async checkNPlusOneQueries(file: string): Promise<CodeReviewResult[]> {
    // Flag database queries inside loops
    return [];
  }

  private async checkBlockingIO(file: string): Promise<CodeReviewResult[]> {
    // Flag synchronous file operations in async contexts
    return [];
  }

  private async checkRenderingPerformance(file: string): Promise<CodeReviewResult[]> {
    // Flag unnecessary re-renders, missing memoization
    return [];
  }

  getReviewChecklist(dimension: "performance"): string[] {
    return [
      "No O(n²) algorithms in hot paths",
      "No database queries inside loops (N+1)",
      "No synchronous I/O in async code",
      "Database queries use indexes appropriately",
      "React components use memoization where beneficial",
      "Large lists use virtualization or pagination",
      "Images optimized and lazy-loaded",
      "Bundle size impact assessed for new dependencies",
      "Caching strategy defined for repeated operations",
      "Async operations don't block the event loop",
    ];
  }
}
```

---

## 3. Performance Review Checklist

| Item | Severity | Description |
|------|----------|-------------|
| No N+1 queries | `critical` | Database queries not inside loops |
| No blocking I/O | `high` | No sync file ops in async contexts |
| Algorithmic complexity | `medium` | Avoid O(n²) in hot paths |
| Query indexing | `medium` | Frequently filtered columns indexed |
| Component memoization | `low` | React.memo, useMemo, useCallback where needed |
| Bundle size | `medium` | New dependencies don't bloat bundle |
| Image optimization | `low` | Images compressed and lazy-loaded |
| Caching | `low` | Appropriate caching for repeated operations |
| Event loop | `high` | No long-running synchronous operations |
| Pagination | `medium` | Large result sets paginated |

---

## 4. Tool Support

| Tool | Purpose |
|------|---------|
| `search_files` | Search for sync I/O, loops with queries, complex patterns |
| `read_file` | Read source for complexity analysis |
| `run_linter` | Check for performance-related lint rules |
| `run_tests` | Run performance benchmarks if available |

Example:

```ts
const syncIo = await tools.search_files({
  pattern: "readFileSync|writeFileSync|execSync",
  directory: "src/",
});
```

---

## 5. Registering the Skill

```ts
export { PerformanceReviewSkill, performanceReviewMetadata } from "./built-in/performance-review.js";

import { PerformanceReviewSkill } from "./built-in/performance-review.js";

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new PerformanceReviewSkill());
  return registry;
}
```
