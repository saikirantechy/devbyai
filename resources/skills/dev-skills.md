# Dev Skills

Development skills help DEVBYAI agents write, refactor, test, and maintain code across multiple languages and frameworks.

---

## 1. Dev Skill Categories

| Skill | ID | Purpose | Best For |
|-------|-----|---------|----------|
| TypeScript | `typescript` | TypeScript best practices, types, strict mode | TypeScript/Node projects |
| Node.js | `nodejs` | Node.js runtime, async patterns, modules | Backend/CLI tools |
| React | `react` | React components, hooks, state management | Frontend UIs |
| Next.js | `nextjs` | Next.js App Router, SSR, API routes | Full-stack React apps |
| Python | `python` | Python best practices, typing, packaging | Python scripts/tools |
| Go | `go` | Go concurrency, error handling, modules | Backend services |
| Rust | `rust` | Rust ownership, safety, crates | Systems programming |

---

## 2. TypeScript Dev Skill

```ts
export const typescriptMetadata: SkillMetadata = {
  id: "typescript",
  name: "TypeScript",
  description: "TypeScript best practices, strict mode, and type safety",
  priority: 90,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer", "planner"],
};

export class TypeScriptSkill implements Skill {
  readonly metadata = typescriptMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use strict TypeScript mode (noImplicitAny, strictNullChecks)",
        "Define explicit types for function parameters and returns",
        "Prefer interfaces over type aliases for object shapes",
        "Use union types for finite sets of values",
        "Avoid `any` — use `unknown` for dynamic data",
      ],
      bestPractices: [
        "Use branded types for primitive validation",
        "Leverage TypeScript utility types (Partial, Pick, Omit)",
        "Export types alongside runtime values",
      ],
      rules: [
        "Never use `any` in production code",
        "All exported functions must have type signatures",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node", "react", "nextjs"].includes(projectType);
  }
}
```

---

## 3. Node.js Dev Skill

```ts
export const nodejsMetadata: SkillMetadata = {
  id: "nodejs",
  name: "Node.js",
  description: "Node.js runtime, async/await, ESM modules, package management",
  priority: 85,
  applicableProjectTypes: ["typescript", "node"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class NodeJSSkill implements Skill {
  readonly metadata = nodejsMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use ESM modules (`import`/`export`) over CommonJS",
        "Prefer async/await over callbacks or promise chains",
        "Handle errors with try/catch in async functions",
        "Use Node.js built-in modules (`node:fs`, `node:path`, `node:url`)",
        "Respect workspace boundaries in file operations",
      ],
      bestPractices: [
        "Use `pnpm` for dependency management",
        "Keep modules small and focused",
        "Validate all user inputs",
      ],
      rules: [
        "Never use `eval()` or `new Function()`",
        "Do not block the event loop with synchronous I/O",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node"].includes(projectType);
  }
}
```

---

## 4. React Dev Skill

```ts
export const reactMetadata: SkillMetadata = {
  id: "react",
  name: "React",
  description: "React components, hooks, state management, and best practices",
  priority: 85,
  applicableProjectTypes: ["typescript", "react", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class ReactSkill implements Skill {
  readonly metadata = reactMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use function components with hooks",
        "Keep components small and single-purpose",
        "Lift state up only when necessary",
        "Use `useCallback` and `useMemo` sparingly",
        "Handle loading and error states in all async components",
      ],
      bestPractices: [
        "Extract custom hooks for shared logic",
        "Use TypeScript interfaces for props",
        "Colocate styles with components",
      ],
      rules: [
        "Never mutate props or state directly",
        "Always provide a `key` for list items",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "react", "nextjs"].includes(projectType);
  }
}
```

---

## 5. Next.js Dev Skill

```ts
export const nextjsMetadata: SkillMetadata = {
  id: "nextjs",
  name: "Next.js",
  description: "Next.js App Router, SSR, API routes, and optimization",
  priority: 80,
  applicableProjectTypes: ["typescript", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class NextJSSkill implements Skill {
  readonly metadata = nextjsMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use App Router (`app/` directory) for new pages",
        "Use Server Components by default, Client Components when needed",
        "Leverage Next.js API routes for backend logic",
        "Optimize images with `<Image>` component",
        "Use `next/navigation` for client-side navigation",
      ],
      bestPractices: [
        "Implement ISR or SSG for static content",
        "Use route handlers for API endpoints",
      ],
      rules: [
        "Do not use `getServerSideProps` in App Router",
        "Always handle 404 and error states",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "nextjs"].includes(projectType);
  }
}
```

---

## 6. Python Dev Skill

```ts
export const pythonMetadata: SkillMetadata = {
  id: "python",
  name: "Python",
  description: "Python best practices, typing, packaging, and virtual environments",
  priority: 75,
  applicableProjectTypes: ["python", "node"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class PythonSkill implements Skill {
  readonly metadata = pythonMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Follow PEP 8 style guidelines",
        "Use type hints for function parameters and returns",
        "Use `pathlib` for file path operations",
        "Manage dependencies with `pyproject.toml` or `requirements.txt`",
        "Use virtual environments for isolation",
      ],
      bestPractices: [
        "Use dataclasses for data structures",
        "Leverage context managers (`with` statement)",
      ],
      rules: [
        "Never use bare `except:` clauses",
        "Do not use mutable default arguments",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["python", "node"].includes(projectType);
  }
}
```

---

## 7. Registering Dev Skills

In `packages/skills/src/index.ts`:

```ts
export { NodeJSSkill, nodejsMetadata } from "./built-in/nodejs.js";
export { ReactSkill, reactMetadata } from "./built-in/react.js";
export { NextJSSkill, nextjsMetadata } from "./built-in/nextjs.js";
export { PythonSkill, pythonMetadata } from "./built-in/python.js";

import { NodeJSSkill } from "./built-in/nodejs.js";
import { ReactSkill } from "./built-in/react.js";
// ... etc

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new NodeJSSkill());
  registry.register(new ReactSkill());
  registry.register(new NextJSSkill());
  registry.register(new PythonSkill());
  return registry;
}
```

---

## 8. Checklist

- [ ] Skill implements `Skill` interface
- [ ] `id` is unique (kebab-case)
- [ ] Instructions are language-specific and actionable
- [ ] `applicableProjectTypes` covers relevant project types
- [ ] Registered in `createBuiltInSkillRegistry()`
- [ ] Exported from `packages/skills/src/index.ts`
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes