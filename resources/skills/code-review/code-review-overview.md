# Code Review Overview

Foundation and principles for advanced code review skills in DEVBYAI.

---

## 1. Code Review Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Code Review Request                        │
│              "Review this pull request"                       │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Code Review Orchestrator                         │
│         Selects review dimensions & skills                    │
└─────────────────────────────────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Security      │  │  Performance   │  │  Architecture  │
│  Review Skill  │  │  Review Skill  │  │  Review Skill  │
└────────────────┘  └────────────────┘  └────────────────┘
              │                  │                  │
              └──────────────────┴──────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Review Aggregator                                │
│         Combines findings into unified report                 │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Approval Gateway                                 │
│         User reviews findings before merge                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Review Principles

| Principle | Description |
|-----------|-------------|
| **Security first** | Never approve code with security vulnerabilities |
| **Performance matters** | Flag O(n²) algorithms, N+1 queries, blocking I/O |
| **Architecture integrity** | Respect module boundaries and design patterns |
| **Test coverage** | Require tests for new features and bug fixes |
| **Maintainability** | Code should be readable, documented, and consistent |
| **No auto-approval** | High-risk changes require explicit user approval |

---

## 3. Review Skill Interface

```ts
export interface CodeReviewMetadata {
  id: string;
  name: string;
  description: string;
  priority: number;
  reviewDimensions: ReviewDimension[];
  applicableProjectTypes: string[];
  applicableAgentRoles: string[];
}

export type ReviewDimension =
  | "security"
  | "performance"
  | "architecture"
  | "testing"
  | "maintainability"
  | "documentation";

export interface CodeReviewResult {
  reviewId: string;
  skillId: string;
  dimension: ReviewDimension;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  suggestion?: string;
  autoFixable: boolean;
  requiresApproval: boolean;
}

export interface CodeReviewSkill {
  readonly metadata: CodeReviewMetadata;
  review(files: string[], context: ReviewContext): Promise<CodeReviewResult[]>;
  getReviewChecklist(dimension: ReviewDimension): string[];
}
```

---

## 4. Review Context

```ts
export interface ReviewContext {
  projectType: string;
  framework?: string;
  filesChanged: string[];
  prDescription?: string;
  relatedIssues?: string[];
  userPermissions: string[];
  environment: "development" | "staging" | "production";
}
```

---

## 5. Review Severity Levels

| Severity | Description | Action Required |
|----------|-------------|-----------------|
| `critical` | Security vulnerability or data loss risk | Block merge, immediate fix |
| `high` | Major bug or performance issue | Fix before merge |
| `medium` | Code quality or maintainability issue | Fix or document exception |
| `low` | Minor style or documentation issue | Optional fix |
| `info` | Suggestion or best practice reminder | Informational only |

---

## 6. Checklist for All Reviews

- [ ] No hardcoded secrets or credentials
- [ ] All user inputs validated and sanitized
- [ ] Authentication and authorization checks present
- [ ] Error handling doesn't leak sensitive information
- [ ] No blocking I/O in async code paths
- [ ] Database queries use parameterized statements
- [ ] New code has corresponding tests
- [ ] Linting and type checking pass
- [ ] Code follows project naming conventions
- [ ] Documentation updated for public APIs

---

## 7. Checklist for Adding Review Skills

- [ ] Skill implements `CodeReviewSkill` interface
- [ ] `reviewDimensions` lists covered dimensions
- [ ] `review()` returns `CodeReviewResult[]` with severity and suggestions
- [ ] `getReviewChecklist()` returns actionable items per dimension
- [ ] Registered in skill registry
- [ ] Tool permissions configured for review tools
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes
