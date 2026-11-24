# Adding a Phase Workflow

Workflows define the sequence of steps for each pipeline phase. Defined in `packages/core/src/workflows.ts`.

---

## 1. Understand the Workflow Interface

```ts
export type WorkflowStep = {
  name: string;
  handler: () => Promise<unknown>;
};

export interface Workflow {
  id: string;
  name: string;
  phases: string[];
  steps: WorkflowStep[];
}

export class WorkflowRegistry {
  register(workflow: Workflow): void;
  get(id: string): Workflow | undefined;
  list(): Workflow[];
}
```

Predefined workflows include `EXPLORE_WORKFLOW`, `PLAN_WORKFLOW`, `DEVELOPMENT_WORKFLOW`, `REVIEW_WORKFLOW`.

---

## 2. Implement a Workflow

Create `packages/core/src/workflows/your-workflow.ts`:

```ts
import type { Workflow, WorkflowStep } from "../workflows.js";

export const CUSTOM_WORKFLOW: Workflow = {
  id: "custom",
  name: "Custom Workflow",
  phases: ["build"],
  steps: [
    { name: "validate", handler: async () => { /* ... */ } },
    { name: "execute", handler: async () => { /* ... */ } },
  ],
};
```

---

## 3. Register the Workflow

```ts
import { WorkflowRegistry } from "@devbyai/core";

const registry = new WorkflowRegistry();
registry.register(CUSTOM_WORKFLOW);
```

Or add to `createBuiltInWorkflowRegistry()` if one exists in `workflows.ts`.

---

## 4. Write Tests

```ts
import { describe, expect, it } from "vitest";
import { CUSTOM_WORKFLOW } from "../workflows/your-workflow.js";

describe("CUSTOM_WORKFLOW", () => {
  it("has build phase", () => {
    expect(CUSTOM_WORKFLOW.phases).toContain("build");
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
