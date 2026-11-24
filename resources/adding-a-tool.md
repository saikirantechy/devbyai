# Adding a New Tool

Tools are the actions DEVBYAI can perform (read files, run commands, etc.). This guide walks you through adding a new tool end-to-end.

---

## 1. Understand the Tool Interface

Defined in `packages/tools/src/types.ts`:

```ts
export type ToolPermission = "read" | "write" | "execute" | "network" | "dangerous";

export interface ToolInput { [key: string]: unknown; }

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface Tool {
  name: string;
  description: string;
  permissions: ToolPermission[];
  inputSchema: Record<string, unknown>;
  execute(input: ToolInput): Promise<ToolResult>;
}
```

---

## 2. Implement the Tool

Create `packages/tools/src/<your-tool>.ts`. Follow the existing `ReadFileTool` pattern:

```ts
import type { Tool, ToolInput, ToolResult, ToolPermission } from "./types.js";

export class GrepTool implements Tool {
  name = "grep";
  description = "Search for a pattern in files";
  permissions: ToolPermission[] = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Regex or string to search" },
      path: { type: "string", description: "Directory or file to search" },
    },
    required: ["pattern"],
  };

  async execute(input: ToolInput): Promise<ToolResult> {
    const pattern = input.pattern as string;
    const path = (input.path as string) || ".";
    try {
      // ... your implementation
      return { success: true, output: `Results for "${pattern}"` };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
}
```

Rules:
- `name` must be unique (snake_case).
- `permissions` should be the minimum required.
- `execute` returns `ToolResult` with `success` boolean.
- Catch errors and return `{ success: false, error }` — never throw.

---

## 3. Register the Tool

Open `packages/tools/src/index.ts` and:

1. Import your tool.
2. Export it.
3. Register it in `createDefaultToolRegistry()`.

```ts
import { GrepTool } from "./grep.js";
export { GrepTool } from "./grep.js";

export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(new ReadFileTool());
  registry.register(new GrepTool());   // <-- add this
  return registry;
}
```

---

## 4. Write Tests

Create `packages/tools/src/__tests__/grep.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GrepTool } from "../grep.js";

describe("GrepTool", () => {
  it("returns success for valid input", async () => {
    const tool = new GrepTool();
    const result = await tool.execute({ pattern: "hello", path: "." });
    expect(result.success).toBe(true);
  });
});
```

---

## 5. Run Checks

```bash
pnpm --filter @devbyai/tools lint
pnpm --filter @devbyai/tools typecheck
pnpm --filter @devbyai/tools test
```

---

## 6. Example PR Checklist

- [ ] New tool class in `packages/tools/src/`
- [ ] Registered in `createDefaultToolRegistry()`
- [ ] Exported from `packages/tools/src/index.ts`
- [ ] Tests in `packages/tools/src/__tests__/`
- [ ] All checks pass
