# Writing Tests

DEVBYAI uses [Vitest](https://vitest.dev/). Tests are colocated with source in `src/__tests__/`.

---

## 1. Test File Convention

| Source | Test |
|--------|------|
| `src/pipeline.ts` | `src/__tests__/pipeline.test.ts` |
| `src/grep.ts` | `src/__tests__/grep.test.ts` |

Import using `.js` extension (ESM convention):

```ts
import { runPipeline } from "../pipeline.js";
import { GrepTool } from "../grep.js";
```

---

## 2. Basic Test Structure

```ts
import { describe, expect, it } from "vitest";

describe("MyModule", () => {
  it("does something", async () => {
    const result = await doSomething();
    expect(result).toBe(expected);
  });
});
```

Common assertions:

```ts
expect(value).toBe(expected);           // strict equality
expect(value).toEqual(expected);        // deep equality
expect(value).toBe(true);               // boolean
expect(result.success).toBe(true);      // object property
expect(fn).toThrow();                   // throws
expect(await promise).resolves.toBe(x); // async resolves
```

---

## 3. Testing a Tool

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
    const result = await tool.execute({ path: "does-not-exist.txt" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

## 4. Testing an Agent / Skill

```ts
import { describe, expect, it } from "vitest";
import { ExplorerAgent } from "../built-in/explorer.js";

describe("ExplorerAgent", () => {
  it("returns success with output", async () => {
    const agent = new ExplorerAgent();
    const result = await agent.execute({
      cwd: ".",
      request: "explore the project",
      previousResults: [],
    });
    expect(result.success).toBe(true);
    expect(typeof result.output).toBe("string");
  });
});
```

---

## 5. Running Tests

```bash
# All packages
pnpm test

# One package
pnpm --filter @devbyai/core test
pnpm --filter @devbyai/tools test

# Watch mode
pnpm test:watch

# Single test file
pnpm vitest run packages/core/src/__tests__/pipeline.test.ts
```

---

## 6. Checklist

- [ ] Test file in `src/__tests__/`
- [ ] Imports use `.js` extension
- [ ] Uses `describe` / `it` / `expect`
- [ ] Tests both success and failure paths
- [ ] `pnpm test` passes
