# Adding a Pipeline Hook

Hooks let you run code before or after pipeline phases. Defined in `packages/core/src/hooks.ts`.

---

## 1. Understand the Hook Interface

```ts
export type HookEvent = "beforePhase" | "afterPhase";

export interface HookContext {
  phase: string;
  request: string;
  cwd: string;
  result?: any;
}

export interface Hook {
  event: HookEvent;
  phase?: string;        // if set, only runs for this phase
  execute(context: HookContext): Promise<void>;
}

export class HookRegistry {
  register(hook: Hook): void;
  get(event: HookEvent): Hook[];
  async run(event, phase, context): Promise<void>;
}
```

---

## 2. Implement a Hook

Create `packages/core/src/hooks/your-hook.ts` (or add inline):

```ts
import type { Hook, HookContext } from "../hooks.js";

export const loggingHook: Hook = {
  event: "afterPhase",
  phase: "build",
  async execute(context: HookContext) {
    console.log(`[Hook] Build phase finished for: ${context.request}`);
  },
};
```

---

## 3. Register the Hook

In your orchestration code:

```ts
import { HookRegistry } from "@devbyai/core";

const hooks = new HookRegistry();
hooks.register(loggingHook);

// Run after each phase
await hooks.run("afterPhase", phaseName, context);
```

Or register via the `Orchestrator` options if supported.

---

## 4. Write Tests

```ts
import { describe, expect, it } from "vitest";
import { loggingHook } from "../hooks/your-hook.js";

describe("loggingHook", () => {
  it("executes after build phase", async () => {
    await loggingHook.execute({
      phase: "build",
      request: "test task",
      cwd: ".",
    });
    // assert logging behavior
  });
});
```

---

## 5. Run Checks

```bash
pnpm --filter @devbyai/core lint
pnpm --filter @devbyai/core typecheck
pnpm --filter @devbyai/core test
```
