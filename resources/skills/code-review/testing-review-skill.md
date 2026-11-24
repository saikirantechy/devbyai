# Testing Review Skill

Testing-focused code review for DEVBYAI agents. Checks test coverage, edge cases, mocking, and test quality.

---

## 1. Skill Metadata

```ts
export const testingReviewMetadata: CodeReviewMetadata = {
  id: "testing-review",
  name: "Testing Review",
  description: "Testing and quality review: coverage, edge cases, mocking, test quality",
  priority: 85,
  reviewDimensions: ["testing"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer", "test-engineer", "developer"],
};
```

---

## 2. Testing Review Instructions

```ts
export class TestingReviewSkill implements CodeReviewSkill {
  readonly metadata = testingReviewMetadata;

  async review(files: string[], context: ReviewContext): Promise<CodeReviewResult[]> {
    const results: CodeReviewResult[] = [];

    // Check that changed source files have tests
    for (const file of files) {
      results.push(...await this.checkTestCoverage(file));
      results.push(...await this.checkEdgeCases(file));
      results.push(...await this.checkMocking(file));
      results.push(...await this.checkTestQuality(file));
    }

    return results;
  }

  private async checkTestCoverage(file: string): Promise<CodeReviewResult[]> {
    // Verify source files have corresponding test files
    return [];
  }

  private async checkEdgeCases(file: string): Promise<CodeReviewResult[]> {
    // Check for null, empty, error, boundary cases
    return [];
  }

  private async checkMocking(file: string): Promise<CodeReviewResult[]> {
    // Verify external dependencies properly mocked
    return [];
  }

  private async checkTestQuality(file: string): Promise<CodeReviewResult[]> {
    // Check test naming, assertions, isolation
    return [];
  }

  getReviewChecklist(dimension: "testing"): string[] {
    return [
      "Every source file has a corresponding test file",
      "Tests cover happy path and error cases",
      "Edge cases tested (null, empty, boundary values)",
      "External dependencies mocked appropriately",
      "Tests are isolated (no shared state)",
      "Test names describe expected behavior",
      "Assertions are specific and meaningful",
      "No hardcoded test data that could conflict",
      "Tests run in reasonable time",
      "Coverage thresholds met for new code",
    ];
  }
}
```

---

## 3. Testing Review Checklist

| Item | Severity | Description |
|------|----------|-------------|
| Test file exists | `high` | Every source file has tests |
| Edge cases covered | `high` | Null, empty, boundary values tested |
| Mocking correct | `medium` | External deps properly mocked |
| Test isolation | `medium` | No shared state between tests |
| Assertions specific | `medium` | Exact values, not just truthiness |
| Test naming | `low` | Describes expected behavior |
| Coverage threshold | `medium` | New code meets coverage % |
| Test runtime | `low` | Tests complete quickly |
| CI integration | `medium` | Tests run in CI pipeline |
| Flaky tests | `high` | No non-deterministic tests |

---

## 4. Tool Support

| Tool | Purpose |
|------|---------|
| `list_files` | Find test files corresponding to source files |
| `read_file` | Read source and test files for analysis |
| `run_tests` | Execute test suite and check results |
| `search_files` | Search for test patterns, mocks, assertions |

Example:

```ts
const testFile = await tools.read_file({
  path: file.replace(/\.(ts|js)$/, ".test.$1"),
});
```

---

## 5. Registering the Skill

```ts
export { TestingReviewSkill, testingReviewMetadata } from "./built-in/testing-review.js";

import { TestingReviewSkill } from "./built-in/testing-review.js";

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new TestingReviewSkill());
  return registry;
}
```
