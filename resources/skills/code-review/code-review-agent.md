# Code Review Agent

Agent integration for code review in DEVBYAI. How code review agents work within the orchestrator, select skills, and execute reviews.

---

## 1. Code Review Agent Metadata

```ts
export const codeReviewAgentMetadata: AgentMetadata = {
  id: "code-reviewer",
  name: "Code Reviewer Agent",
  description: "Performs comprehensive code review across security, performance, architecture, testing, and maintainability",
  role: "reviewer",
  capabilities: [
    "read_files",
    "search_code",
    "analyze_security",
    "analyze_performance",
    "analyze_architecture",
    "analyze_testing",
    "generate_review_report",
  ],
  supportedPhases: ["review"],
};
```

---

## 2. Code Review Agent Implementation

```ts
import type {
  Agent,
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentRole,
} from "@devbyai/agents";
import { createDefaultToolRegistry } from "@devbyai/tools";
import { createBuiltInSkillRegistry, resolveSkills } from "@devbyai/skills";

export class CodeReviewAgent implements Agent {
  readonly metadata = codeReviewAgentMetadata;

  private toolRegistry = createDefaultToolRegistry();
  private skillRegistry = createBuiltInSkillRegistry();

  async execute(context: AgentContext): Promise<AgentResult> {
    // 1. Discover relevant review skills
    const reviewSkills = resolveSkills(this.skillRegistry, context.cwd)
      .filter((s) => s.metadata.applicableAgentRoles.includes("reviewer"));

    // 2. Get changed files from context
    const filesChanged = context.previousResults
      .flatMap((r) => r.output.match(/src\/\S+\.(ts|js)/g) || []);

    // 3. Execute each review dimension
    const allResults = [];
    for (const skill of reviewSkills) {
      const instructions = skill.getInstructions();
      const results = await skill.review(filesChanged, {
        projectType: "typescript",
        framework: "nextjs",
        filesChanged,
        userPermissions: context.cwd ? ["read"] : [],
        environment: "development",
      });
      allResults.push(...results);
    }

    // 4. Aggregate and prioritize findings
    const report = this.aggregateResults(allResults);

    // 5. Determine if approval needed
    const requiresApproval = allResults.some(
      (r) => r.severity === "critical" || r.severity === "high"
    );

    return {
      agentId: this.metadata.id,
      success: true,
      output: report,
      suggestedNext: requiresApproval ? "await_user_approval" : "proceed_to_merge",
    };
  }

  private aggregateResults(results: any[]): string {
    const critical = results.filter((r) => r.severity === "critical");
    const high = results.filter((r) => r.severity === "high");
    const medium = results.filter((r) => r.severity === "medium");

    let report = `# Code Review Report\n\n`;
    report += `## Summary\n`;
    report += `- Critical: ${critical.length}\n`;
    report += `- High: ${high.length}\n`;
    report += `- Medium: ${medium.length}\n`;

    if (critical.length > 0) {
      report += `\n## 🚨 Critical Issues\n`;
      for (const r of critical) {
        report += `- ${r.title}: ${r.description}\n`;
      }
    }

    return report;
  }
}
```

---

## 3. Agent Capabilities

| Capability | Description | Tool Required |
|------------|-------------|---------------|
| `read_files` | Read source files for analysis | `read_file` |
| `search_code` | Search for patterns and vulnerabilities | `search_files` |
| `analyze_security` | Security vulnerability detection | `search_files`, `read_file` |
| `analyze_performance` | Performance issue detection | `search_files`, `read_file` |
| `analyze_architecture` | Architecture and design review | `list_files`, `read_file` |
| `analyze_testing` | Test coverage and quality review | `list_files`, `read_file`, `run_tests` |
| `generate_review_report` | Create unified review report | None (aggregation) |

---

## 4. Registering the Agent

```ts
export { CodeReviewAgent, codeReviewAgentMetadata } from "./built-in/code-reviewer.js";

import { CodeReviewAgent } from "./built-in/code-reviewer.js";

export function createBuiltInAgentRegistry(): AgentRegistry {
  const registry = new AgentRegistry();
  registry.register(new ExplorerAgent());
  registry.register(new PlannerAgent());
  registry.register(new BuilderAgent());
  registry.register(new ReviewerAgent());
  registry.register(new CodeReviewAgent()); // Add code review agent
  registry.register(new DebugAgent());
  return registry;
}
```

---

## 5. Review Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    PR Created                                 │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Code Review Agent activated                                   │
│   - Discovers relevant review skills                          │
│   - Gets changed files                                        │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│   Security Review    Performance Review   Architecture Review │
│   Testing Review     Maintainability Review                      │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│   Review Aggregator                                           │
│   - Combines all findings                                     │
│   - Prioritizes by severity                                   │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Approval Gateway                                 │
│   Critical/High → User approval required                      │
│   Medium/Low   → Auto-approve with comments                   │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              PR Comment                                       │
│   - Review results posted                                     │
│   - Fix suggestions provided                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Checklist for Code Review Agent

- [ ] Agent implements `Agent` interface
- [ ] `metadata.role` is `"reviewer"`
- [ ] `supportedPhases` includes `"review"`
- [ ] Uses skill registry to discover review skills
- [ ] Aggregates results from all review dimensions
- [ ] Flags critical/high findings for user approval
- [ ] Generates structured review report
- [ ] Registered in `createBuiltInAgentRegistry()`
- [ ] Exported from `packages/agents/src/index.ts`
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/agents lint && typecheck && test` passes
