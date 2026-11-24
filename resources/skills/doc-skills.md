# Doc Skills

Documentation skills help DEVBYAI agents write, maintain, and improve project documentation — from READMEs to API references and contribution guides.

---

## 1. Doc Skill Categories

| Skill | ID | Purpose | Best For |
|-------|-----|---------|----------|
| API Documentation | `api-docs` | API endpoint references, request/response schemas | Backend/API projects |
| README Guide | `readme-guide` | Project READMEs, installation, quick start | All projects |
| Contribution Guide | `contribution-guide` | CONTRIBUTING.md, developer onboarding | Open source projects |
| Architecture Docs | `architecture-docs` | System design, architecture decisions | Complex projects |
| Code Comments | `code-comments` | Inline code documentation, JSDoc/Typedoc | All codebases |
| Changelog | `changelog` | Release notes, version history, breaking changes | Released projects |

---

## 2. API Documentation Skill

```ts
export const apiDocsMetadata: SkillMetadata = {
  id: "api-docs",
  name: "API Documentation",
  description: "API endpoint references, request/response schemas, authentication",
  priority: 85,
  applicableProjectTypes: ["typescript", "node", "nextjs", "python"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class APIDocsSkill implements Skill {
  readonly metadata = apiDocsMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Document every endpoint with method, path, and description",
        "Include request and response examples",
        "List required and optional parameters",
        "Document authentication requirements",
        "Show error responses with status codes",
      ],
      bestPractices: [
        "Use OpenAPI/Swagger format for machine-readable docs",
        "Group endpoints by resource",
        "Provide curl examples",
      ],
      rules: [
        "Never document sensitive credentials",
        "Keep docs in sync with code changes",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node", "nextjs", "python"].includes(projectType);
  }
}
```

---

## 3. README Guide Skill

```ts
export const readmeGuideMetadata: SkillMetadata = {
  id: "readme-guide",
  name: "README Guide",
  description: "Project READMEs, installation, quick start, usage examples",
  priority: 90,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class READMEGuideSkill implements Skill {
  readonly metadata = readmeGuideMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Include project name, description, and badges",
        "Provide clear installation instructions",
        "Add a quick start section with examples",
        "Document configuration options",
        "List available commands and scripts",
      ],
      bestPractices: [
        "Use screenshots or ASCII art for CLI tools",
        "Include a troubleshooting section",
        "Link to contribution guidelines",
      ],
      rules: [
        "Keep README under 200 lines",
        "Update README when features change",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 4. Contribution Guide Skill

```ts
export const contributionGuideMetadata: SkillMetadata = {
  id: "contribution-guide",
  name: "Contribution Guide",
  description: "CONTRIBUTING.md, developer onboarding, PR guidelines",
  priority: 80,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python"],
  applicableAgentRoles: ["builder", "reviewer", "planner"],
};

export class ContributionGuideSkill implements Skill {
  readonly metadata = contributionGuideMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Explain how to fork, clone, and set up the project",
        "Document build, lint, typecheck, and test commands",
        "Define commit message conventions (conventional commits)",
        "Explain the pull request review process",
        "List coding standards and style guide",
      ],
      bestPractices: [
        "Include issue templates for bugs and features",
        "Provide a good-first-issues list",
      ],
      rules: [
        "Be welcoming to first-time contributors",
        "Keep setup steps minimal",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 5. Architecture Docs Skill

```ts
export const architectureDocsMetadata: SkillMetadata = {
  id: "architecture-docs",
  name: "Architecture Docs",
  description: "System design, architecture decisions, module boundaries",
  priority: 70,
  applicableProjectTypes: ["typescript", "node", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer", "planner"],
};

export class ArchitectureDocsSkill implements Skill {
  readonly metadata = architectureDocsMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Document high-level system architecture",
        "Define module responsibilities and boundaries",
        "Include data flow diagrams",
        "Record architecture decision records (ADRs)",
        "Document technology choices and rationale",
      ],
      bestPractices: [
        "Keep diagrams in sync with code",
        "Use C4 model for complex systems",
      ],
      rules: [
        "Document why, not just what",
        "Review architecture docs quarterly",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 6. Code Comments Skill

```ts
export const codeCommentsMetadata: SkillMetadata = {
  id: "code-comments",
  name: "Code Comments",
  description: "Inline code documentation, JSDoc/Typedoc, code explanations",
  priority: 70,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class CodeCommentsSkill implements Skill {
  readonly metadata = codeCommentsMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use JSDoc/Typedoc for all exported functions",
        "Document complex algorithms and business logic",
        "Explain non-obvious code decisions",
        "Keep comments up to date with code changes",
        "Use TODO/FIXME markers with context",
      ],
      bestPractices: [
        "Comment the 'why', not the 'what'",
        "Use doc generation tools (Typedoc, JSDoc)",
      ],
      rules: [
        "Do not comment obvious code",
        "Remove commented-out code before committing",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 7. Changelog Skill

```ts
export const changelogMetadata: SkillMetadata = {
  id: "changelog",
  name: "Changelog",
  description: "Release notes, version history, breaking changes",
  priority: 60,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class ChangelogSkill implements Skill {
  readonly metadata = changelogMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Follow Keep a Changelog format",
        "Group changes by: Added, Changed, Deprecated, Removed, Fixed, Security",
        "Link to pull requests or issues",
        "Mark breaking changes clearly",
        "Include release dates",
      ],
      bestPractices: [
        "Use semantic versioning",
        "Auto-generate from conventional commits",
      ],
      rules: [
        "Never edit released changelog entries",
        "Include migration guide for breaking changes",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 8. Registering Doc Skills

In `packages/skills/src/index.ts`:

```ts
export { APIDocsSkill, apiDocsMetadata } from "./built-in/api-docs.js";
export { READMEGuideSkill, readmeGuideMetadata } from "./built-in/readme-guide.js";
export { ContributionGuideSkill, contributionGuideMetadata } from "./built-in/contribution-guide.js";
export { ArchitectureDocsSkill, architectureDocsMetadata } from "./built-in/architecture-docs.js";
export { CodeCommentsSkill, codeCommentsMetadata } from "./built-in/code-comments.js";
export { ChangelogSkill, changelogMetadata } from "./built-in/changelog.js";

import { APIDocsSkill } from "./built-in/api-docs.js";
// ... etc

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new APIDocsSkill());
  registry.register(new READMEGuideSkill());
  registry.register(new ContributionGuideSkill());
  registry.register(new ArchitectureDocsSkill());
  registry.register(new CodeCommentsSkill());
  registry.register(new ChangelogSkill());
  return registry;
}
```

---

## 9. Checklist

- [ ] Skill implements `Skill` interface
- [ ] `id` is unique (kebab-case)
- [ ] Documentation standards are specific and actionable
- [ ] `applicableProjectTypes` covers relevant project types
- [ ] Registered in `createBuiltInSkillRegistry()`
- [ ] Exported from `packages/skills/src/index.ts`
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes