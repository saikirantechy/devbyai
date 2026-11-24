# Coding Standards

DEVBYAI is written in **TypeScript** (strict mode) with **ESM modules**. This document covers the conventions used across the codebase so your contributions match the existing style.

---

## 1. Language & Module Settings

| Setting | Value |
|---------|-------|
| Language | TypeScript (strict) |
| Module system | ESM (`"type": "module"`) |
| Target | ES2022 |
| Module resolution | bundler |
| Imports | Use `.js` extensions even for `.ts` files |

Example import:

```ts
import { Orchestrator } from "@devbyai/core";
import { createPipeline } from "./pipeline.js";
import { readFile } from "node:fs/promises";
```

---

## 2. Formatting (Biome)

DEVBYAI uses [Biome](https://biomejs.dev/) for linting and formatting. Run before committing:

```bash
pnpm lint        # check
pnpm lint:fix    # auto-fix formatting
```

Key formatter rules:

- **Indent:** 2 spaces
- **Line width:** 100
- **Quotes:** double
- **Semicolons:** required
- **Trailing commas:** multiline
- **No unused imports/variables:** warn
- **No `any`:** warn

---

## 3. File Organization

Each package follows this layout:

```
packages/<name>/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # public API (barrel exports)
│   ├── types.ts          # shared interfaces & types
│   ├── <feature>.ts      # implementation
│   └── __tests__/
│       └── <feature>.test.ts
```

### `index.ts` — Public API Barrel

Export everything publicly from `src/index.ts`. Use named exports only (no default exports):

```ts
export { ToolRegistry } from "./tool-registry.js";
export type { Tool, ToolResult, ToolInput } from "./types.js";
export function createDefaultToolRegistry() { ... }
```

---

## 4. Type Definitions

Define shared types in `types.ts`, export as interfaces/types:

```ts
export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

export type ToolPermission = "read" | "write" | "execute" | "network" | "dangerous";
```

- Prefer **interfaces** for object shapes.
- Prefer **type aliases** for unions/primitives.
- Avoid `any`. Use `unknown` or specific types.

---

## 5. Class & Interface Pattern

Most built-ins follow an **interface + class** pattern:

```ts
export interface Tool {
  name: string;
  description: string;
  permissions: ToolPermission[];
  inputSchema: Record<string, unknown>;
  execute(input: ToolInput): Promise<ToolResult>;
}

export class ReadFileTool implements Tool {
  name = "read_file";
  description = "Read the contents of a file";
  permissions: ToolPermission[] = ["read"];
  inputSchema = { ... };

  async execute(input: ToolInput): Promise<ToolResult> {
    // implementation
  }
}
```

- Class properties initialized inline (`name = "..."`).
- Methods are `async` when they return `Promise`.
- Mark `readonly` where appropriate (e.g. `readonly id`).

---

## 6. Registry Pattern

DEVBYAI uses registries for providers, tools, agents, skills, hooks, and workflows:

```ts
export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }
}

export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(new ReadFileTool());
  registry.register(new WriteFileTool());
  return registry;
}
```

When adding a new built-in:

1. Implement the class.
2. Register it in `createDefaultXRegistry()`.
3. Export it from `src/index.ts`.
4. Add tests in `src/__tests__/`.

---

## 7. Testing (Vitest)

Tests live next to source in `src/__tests__/*.test.ts`. Use `describe` / `it` / `expect`:

```ts
import { describe, expect, it } from "vitest";
import { runPipeline } from "../pipeline.js";

describe("runPipeline", () => {
  it("executes phases in order", async () => {
    const result = await runPipeline(...);
    expect(result.success).toBe(true);
  });
});
```

Run tests:

```bash
pnpm test              # all packages
pnpm --filter @devbyai/core test   # one package
```

---

## 8. Commit Messages

Use conventional commits:

```
feat: add read_file tool
fix: handle missing config in init command
docs: update pipeline documentation
test: add pipeline unit tests
```

---

## 9. Checklist Before Opening a PR

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] New code has tests
- [ ] Public API exported from `src/index.ts`
- [ ] Follows registry/interface pattern
- [ ] Commit message uses conventional format

---

## Need Help?

Open a [Discussion](https://github.com/saikirantechy/devbyai/discussions) or ask on an issue.