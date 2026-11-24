# Control Tools System

The DEVBYAI tools system lets agents interact with files, commands, and the network. This guide covers how to control, register, secure, and extend tools.

---

## 1. Tool Interface

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

## 2. Tool Registry

Defined in `packages/tools/src/index.ts`:

```ts
export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void;
  get(name: string): Tool | undefined;
  list(): Tool[];
  listNames(): string[];
}

export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(new ReadFileTool());
  registry.register(new WriteFileTool());
  registry.register(new ListDirectoryTool());
  registry.register(new SearchFilesTool());
  registry.register(new CommandRunnerTool());
  return registry;
}
```

---

## 3. Registering a Tool

1. Create a tool class implementing `Tool`.
2. Register it in `createDefaultToolRegistry()`.
3. Export it from `packages/tools/src/index.ts`.

Example — a `GrepTool`:

```ts
import type { Tool, ToolInput, ToolResult, ToolPermission } from "./types.js";

export class GrepTool implements Tool {
  name = "grep";
  description = "Search for a pattern in project files";
  permissions: ToolPermission[] = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Regex or string to search" },
      path: { type: "string", description: "Directory to search (default: .)" },
    },
    required: ["pattern"],
  };

  async execute(input: ToolInput): Promise<ToolResult> {
    const pattern = input.pattern as string;
    const dir = (input.path as string) || ".";
    try {
      // ... implementation
      return { success: true, output: `Matches for "${pattern}"` };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
}
```

Then in `index.ts`:

```ts
import { GrepTool } from "./grep.js";
export { GrepTool } from "./grep.js";

export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(new ReadFileTool());
  registry.register(new GrepTool());
  return registry;
}
```

---

## 4. Tool Permissions & Access Control

| Permission | Purpose | Risk Level |
|------------|---------|------------|
| `read` | Read files | Low |
| `write` | Create/modify files | Medium |
| `execute` | Run shell commands | High |
| `network` | Make network requests | High |
| `dangerous` | Destructive operations | Critical |

### Controlling Tool Access

Tools should be gated by user permissions. The CLI config (`devbyai.json`) defines permission policies:

```json
{
  "permissions": {
    "write": "ask",
    "execute": "ask",
    "network": "ask"
  }
}
```

Policy values:
- `"ask"` — Prompt the user before running.
- `"auto"` — Allow automatically.
- `"deny"` — Block the operation.

When a tool runs, check the permission policy and ask for approval if required.

---

## 5. Tool Approval Flow

For destructive or high-risk tools, require explicit user approval:

```
1. Agent requests tool execution
2. System checks permission policy
3. If "ask" → prompt user with tool name, args, and risk level
4. User approves or rejects
5. If approved → execute tool, return result
6. If rejected → return error to agent
```

Example:

```ts
async function runToolWithApproval(
  tool: Tool,
  input: ToolInput,
  permission: ToolPermission,
  policy: "ask" | "auto" | "deny"
): Promise<ToolResult> {
  if (policy === "deny") {
    return { success: false, output: "", error: `Permission denied: ${permission}` };
  }
  if (policy === "ask") {
    const approved = await promptUser(`Allow ${tool.name} to ${permission}?`);
    if (!approved) {
      return { success: false, output: "", error: "User rejected tool execution" };
    }
  }
  return tool.execute(input);
}
```

---

## 6. Listing & Discovering Tools

```ts
const registry = createDefaultToolRegistry();

// List all tool names
const names = registry.listNames(); // ["read_file", "write_file", ...]

// Get a specific tool
const tool = registry.get("read_file");

// List all tools with metadata
const tools = registry.list();
for (const tool of tools) {
  console.log(`${tool.name}: ${tool.description}`);
  console.log(`  Permissions: ${tool.permissions.join(", ")}`);
}
```

---

## 7. Testing Tools

Tests live in `packages/tools/src/__tests__/`:

```ts
import { describe, expect, it } from "vitest";
import { ReadFileTool } from "../read-file.js";

describe("ReadFileTool", () => {
  it("reads a file successfully", async () => {
    const tool = new ReadFileTool();
    const result = await tool.execute({ path: "package.json" });
    expect(result.success).toBe(true);
    expect(result.output.length).toBeGreaterThan(0);
  });

  it("returns error for missing file", async () => {
    const tool = new ReadFileTool();
    const result = await tool.execute({ path: "missing.txt" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

## 8. Checklist for Adding/Controlling Tools

- [ ] Tool class implements the `Tool` interface
- [ ] `name` is unique (snake_case)
- [ ] `permissions` uses minimum required scope
- [ ] `execute` catches errors and returns `ToolResult` (never throws)
- [ ] Registered in `createDefaultToolRegistry()`
- [ ] Exported from `packages/tools/src/index.ts`
- [ ] Permission policy checked before execution
- [ ] High-risk tools require user approval
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/tools lint && typecheck && test` passes
