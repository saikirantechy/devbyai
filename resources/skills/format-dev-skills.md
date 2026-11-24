# Format / Dev Skills

Code formatting skills help DEVBYAI agents maintain consistent code style, formatting, and developer experience across the codebase.

---

## 1. Format Skill Categories

| Skill | ID | Purpose | Best For |
|-------|-----|---------|----------|
| Code Formatting | `code-formatting` | Indentation, quotes, semicolons, line width | All codebases |
| Import Organization | `import-organization` | Import sorting, grouping, `.js` extensions | TypeScript/ESM |
| Naming Conventions | `naming-conventions` | Variable, function, class, file naming | All codebases |
| File Structure | `file-structure` | Directory organization, barrel exports | All codebases |
| Commit Formatting | `commit-formatting` | Conventional commits, commit messages | Git workflows |
| Lint Configuration | `lint-config` | Biome/ESLint rules, formatter settings | All codebases |

---

## 2. Code Formatting Skill

```ts
export const codeFormattingMetadata: SkillMetadata = {
  id: "code-formatting",
  name: "Code Formatting",
  description: "Indentation, quotes, semicolons, line width, and formatting consistency",
  priority: 85,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class CodeFormattingSkill implements Skill {
  readonly metadata = codeFormattingMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use 2-space indentation",
        "Use double quotes for strings",
        "Use semicolons at end of statements",
        "Keep line width at 100 characters",
        "Use trailing commas in multiline objects/arrays",
      ],
      bestPractices: [
        "Run formatter before committing",
        "Use Biome for TypeScript/JavaScript",
      ],
      rules: [
        "Never mix tabs and spaces",
        "Do not exceed line width limit",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 3. Import Organization Skill

```ts
export const importOrganizationMetadata: SkillMetadata = {
  id: "import-organization",
  name: "Import Organization",
  description: "Import sorting, grouping, ESM .js extensions, and barrel exports",
  priority: 80,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class ImportOrganizationSkill implements Skill {
  readonly metadata = importOrganizationMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use `.js` extensions for TypeScript imports (ESM convention)",
        "Group imports: external, relative, then type imports",
        "Sort imports alphabetically within groups",
        "Use named exports over default exports",
        "Create barrel exports from `src/index.ts`",
      ],
      bestPractices: [
        "Organize imports by: node builtins, external packages, relative",
        "Use `type` import for type-only imports",
      ],
      rules: [
        "Never use default exports in public API",
        "All package imports must use `@devbyai/*` scope",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node", "react", "nextjs"].includes(projectType);
  }
}
```

---

## 4. Naming Conventions Skill

```ts
export const namingConventionsMetadata: SkillMetadata = {
  id: "naming-conventions",
  name: "Naming Conventions",
  description: "Variable, function, class, file, and directory naming standards",
  priority: 75,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class NamingConventionsSkill implements Skill {
  readonly metadata = namingConventionsMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use kebab-case for files and directories",
        "Use PascalCase for classes and components",
        "Use camelCase for variables and functions",
        "Use UPPER_SNAKE_CASE for constants",
        "Prefix private members with underscore",
      ],
      bestPractices: [
        "Use descriptive names over abbreviations",
        "Name boolean variables with is/has/should prefix",
      ],
      rules: [
        "Do not use single-letter names (except loop indices)",
        "File names must match default export name",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 5. File Structure Skill

```ts
export const fileStructureMetadata: SkillMetadata = {
  id: "file-structure",
  name: "File Structure",
  description: "Directory organization, barrel exports, and package layout",
  priority: 70,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer", "planner"],
};

export class FileStructureSkill implements Skill {
  readonly metadata = fileStructureMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Organize by feature, not by type",
        "Place tests in `__tests__/` alongside source",
        "Export public API from `src/index.ts`",
        "Keep implementation details in separate files",
        "Separate types from implementations in `types.ts`",
      ],
      bestPractices: [
        "One feature per directory",
        "Keep barrel exports shallow",
      ],
      rules: [
        "Do not export from implementation files directly",
        "All public types must be exported from index.ts",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node", "react", "nextjs"].includes(projectType);
  }
}
```

---

## 6. Commit Formatting Skill

```ts
export const commitFormattingMetadata: SkillMetadata = {
  id: "commit-formatting",
  name: "Commit Formatting",
  description: "Conventional commits, commit messages, and PR descriptions",
  priority: 70,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer", "planner"],
};

export class CommitFormattingSkill implements Skill {
  readonly metadata = commitFormattingMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use conventional commits: feat:, fix:, docs:, test:, refactor:, style:, chore:",
        "Write imperative mood subject lines",
        "Keep subject under 50 characters",
        "Reference issues with Closes # or Refs #",
        "Include detailed body for complex changes",
      ],
      bestPractices: [
        "One logical change per commit",
        "Run tests before committing",
      ],
      rules: [
        "Never commit to main directly",
        "Always include a body for breaking changes",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 7. Lint Configuration Skill

```ts
export const lintConfigMetadata: SkillMetadata = {
  id: "lint-config",
  name: "Lint Configuration",
  description: "Biome/ESLint rules, formatter settings, and lint scripts",
  priority: 65,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer", "planner"],
};

export class LintConfigSkill implements Skill {
  readonly metadata = lintConfigMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use Biome for TypeScript/JavaScript linting and formatting",
        "Enable `noUnusedImports` and `noUnusedVariables` as warnings",
        "Enable `noExplicitAny` as warning",
        "Run `pnpm lint` before committing",
        "Use `pnpm lint:fix` to auto-fix issues",
      ],
      bestPractices: [
        "Keep lint config in `biome.json` at repo root",
        "Ignore `node_modules`, `dist`, and `*.md` in lint config",
      ],
      rules: [
        "Do not disable lint rules without justification",
        "Fix all lint warnings before PR review",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node", "react", "nextjs"].includes(projectType);
  }
}
```

---

## 8. Registering Format Skills

In `packages/skills/src/index.ts`:

```ts
export { CodeFormattingSkill, codeFormattingMetadata } from "./built-in/code-formatting.js";
export { ImportOrganizationSkill, importOrganizationMetadata } from "./built-in/import-organization.js";
export { NamingConventionsSkill, namingConventionsMetadata } from "./built-in/naming-conventions.js";
export { FileStructureSkill, fileStructureMetadata } from "./built-in/file-structure.js";
export { CommitFormattingSkill, commitFormattingMetadata } from "./built-in/commit-formatting.js";
export { LintConfigSkill, lintConfigMetadata } from "./built-in/lint-config.js";

import { CodeFormattingSkill } from "./built-in/code-formatting.js";
// ... etc

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new CodeFormattingSkill());
  registry.register(new ImportOrganizationSkill());
  registry.register(new NamingConventionsSkill());
  registry.register(new FileStructureSkill());
  registry.register(new CommitFormattingSkill());
  registry.register(new LintConfigSkill());
  return registry;
}
```

---

## 9. Checklist

- [ ] Skill implements `Skill` interface
- [ ] `id` is unique (kebab-case)
- [ ] Formatting rules match project standards (Biome config)
- [ ] `applicableProjectTypes` covers relevant project types
- [ ] Registered in `createBuiltInSkillRegistry()`
- [ ] Exported from `packages/skills/src/index.ts`
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes