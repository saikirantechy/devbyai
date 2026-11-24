# Agent Skills

Agent skills are reusable, on-demand bundles of instructions, scripts, and reference files — typically centered around a `SKILL.md` file — that extend AI coding and build agents without bloating their base context window.

DEVBYAI skills follow this same pattern: each skill is a self-contained knowledge module that agents load only when relevant to the task at hand.

---

## 1. What Is an Agent Skill?

An agent skill contains:

```
skill/
├── SKILL.md              # Core instructions and reference
├── instructions/         # Task-specific instructions
├── templates/            # Code templates and snippets
├── examples/             # Working examples
└── rules/                # Constraints and guardrails
```

In DEVBYAI, this maps to:

```
packages/skills/src/built-in/<skill-name>.ts
```

Each skill implements the `Skill` interface with metadata, instructions, and applicability rules.

---

## 2. Skill Structure

```ts
export interface SkillMetadata {
  id: string;                           // Unique identifier
  name: string;                         // Human-readable name
  description: string;                  // What this skill does
  priority: number;                     // Loading priority (higher = loaded first)
  applicableProjectTypes: string[];     // Which project types this applies to
  applicableAgentRoles: string[];       // Which agent roles should use this
}

export interface SkillInstructions {
  instructions: string[];               # Core guidance for the AI
  bestPractices?: string[];             # Recommended approaches
  rules?: string[];                     # Constraints to follow
}

export interface Skill {
  readonly metadata: SkillMetadata;
  getInstructions(): SkillInstructions;
  appliesTo(projectType: string): boolean;
}
```

---

## 3. Example: Code Review Agent Skill

```
code-review/
├── SKILL.md
├── instructions/
│   ├── security-review.md
│   ├── performance-review.md
│   └── style-review.md
├── templates/
│   └── pr-review-template.md
├── examples/
│   └── good-vs-bad-code.md
└── rules/
    └── review-checklist.md
```

DEVBYAI implementation:

```ts
export const codeReviewMetadata: SkillMetadata = {
  id: "code-review",
  name: "Code Review",
  description: "Security-focused code review with security, performance, and style checks",
  priority: 85,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer"],
};

export class CodeReviewSkill implements Skill {
  readonly metadata = codeReviewMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Check for hardcoded secrets and credentials",
        "Verify input validation on all entry points",
        "Review authentication and authorization logic",
        "Check for insecure dependencies",
        "Verify error handling doesn't leak information",
        "Look for performance bottlenecks (N+1 queries, blocking I/O)",
        "Ensure consistent code style and naming",
      ],
      bestPractices: [
        "Use a security review checklist for every PR",
        "Require security approval for auth-related changes",
        "Provide specific line references in feedback",
      ],
      rules: [
        "Block PRs with critical security issues",
        "Document security decisions in PR description",
        "Never approve your own code",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 4. Example: Debug Agent Skill

```
debug/
├── SKILL.md
├── instructions/
│   ├── error-analysis.md
│   ├── stack-trace-reading.md
│   └── log-investigation.md
├── templates/
│   └── debug-workflow-template.md
├── examples/
│   └── common-bugs-and-fixes.md
└── rules/
    └── debugging-checklist.md
```

DEVBYAI implementation:

```ts
export const debugSkillMetadata: SkillMetadata = {
  id: "debug",
  name: "Debug",
  description: "Error analysis, stack trace reading, log investigation, and fix suggestions",
  priority: 88,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["debugger", "builder"],
};

export class DebugSkill implements Skill {
  readonly metadata = debugSkillMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Reproduce the error before attempting fixes",
        "Read the full stack trace, not just the error message",
        "Check recent changes that may have introduced the bug",
        "Add logging to narrow down the issue",
        "Write a failing test before fixing",
        "Verify the fix doesn't introduce regressions",
      ],
      bestPractices: [
        "Use binary search to find the root cause",
        "Document the bug and fix for future reference",
        "Check similar code for the same issue",
      ],
      rules: [
        "Never apply fixes without understanding the root cause",
        "Always test the fix before marking complete",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 5. Example: Documentation Agent Skill

```
documentation/
├── SKILL.md
├── instructions/
│   ├── api-docs.md
│   ├── readme-guide.md
│   └── contribution-guide.md
├── templates/
│   └── api-endpoint-template.md
├── examples/
│   └── well-documented-api.md
└── rules/
    └── doc-style-guide.md
```

---

## 6. Loading Skills On-Demand

DEVBYAI loads skills based on project type and agent role:

```ts
import { createBuiltInSkillRegistry, resolveSkills } from "@devbyai/skills";

const registry = createBuiltInSkillRegistry();

// Load only skills relevant to this project and agent
const projectType = "typescript";
const agentRole = "reviewer";

const activeSkills = resolveSkills(registry, projectType)
  .filter((s) => s.metadata.applicableAgentRoles.includes(agentRole));

// Each skill is a small, focused knowledge bundle
for (const skill of activeSkills) {
  const instructions = skill.getInstructions();
  // Inject instructions into agent context
}
```

This keeps the agent's context window small — only relevant skills are loaded.

---

## 7. Skill Priority for Loading Order

| Priority | When to Load | Example Skills |
|----------|-------------|----------------|
| 90-100 | Critical (always load) | `security-audit`, `readme-guide`, `typescript` |
| 80-89 | Important (load for most tasks) | `secure-coding`, `secret-management`, `react` |
| 70-79 | Standard (load when relevant) | `naming-conventions`, `api-docs`, `nodejs` |
| 60-69 | Optional (load on request) | `changelog`, `visual-design`, `lint-config` |

---

## 8. Creating a Custom Agent Skill

1. Create `packages/skills/src/built-in/<skill-name>.ts`
2. Define `SkillMetadata` with unique `id`, `name`, `description`, `priority`
3. Implement `getInstructions()` with `instructions`, `bestPractices`, `rules`
4. Implement `appliesTo()` to filter by project type
5. Register in `createBuiltInSkillRegistry()`
6. Export from `packages/skills/src/index.ts`
7. Add tests in `src/__tests__/`

---

## 9. Checklist

- [ ] Skill implements `Skill` interface
- [ ] `id` is unique (kebab-case)
- [ ] Instructions are task-specific and actionable
- [ ] `priority` reflects loading importance
- [ ] `applicableProjectTypes` and `applicableAgentRoles` are correct
- [ ] Registered in `createBuiltInSkillRegistry()`
- [ ] Exported from `packages/skills/src/index.ts`
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes
