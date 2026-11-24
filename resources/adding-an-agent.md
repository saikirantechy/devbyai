# Adding a New Agent

Agents are specialized roles (Explorer, Planner, Builder, Reviewer, Debugger) that handle phases of the development pipeline.

---

## 1. Understand the Agent Interface

Defined in `packages/agents/src/types.ts`:

```ts
export type AgentRole =
  | "explorer" | "planner" | "builder" | "reviewer" | "researcher" | "debugger";

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  capabilities: string[];
  supportedPhases: string[];
}

export interface AgentContext {
  cwd: string;
  request: string;
  previousResults: Array<{ phase: string; output: string }>;
}

export interface AgentResult {
  agentId: string;
  success: boolean;
  output: string;
  suggestedNext?: string;
}

export interface Agent {
  readonly metadata: AgentMetadata;
  execute(context: AgentContext): Promise<AgentResult>;
}
```

---

## 2. Implement the Agent

Create `packages/agents/src/built-in/<agent>.ts`. Example — a Researcher agent:

```ts
import type {
  Agent,
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentRole,
} from "../types.js";

export const researcherMetadata: AgentMetadata = {
  id: "researcher",
  name: "Researcher",
  description: "Investigates documentation and technical problems",
  role: "researcher",
  capabilities: ["web-search", "docs-lookup"],
  supportedPhases: ["research"],
};

export class ResearcherAgent implements Agent {
  readonly metadata = researcherMetadata;

  async execute(context: AgentContext): Promise<AgentResult> {
    // research logic using context.request
    return {
      agentId: this.metadata.id,
      success: true,
      output: `Research completed for: ${context.request}`,
      suggestedNext: "build",
    };
  }
}
```

---

## 3. Register the Agent

Open `packages/agents/src/index.ts`:

1. Import and export your agent.
2. Add it to `createBuiltInAgentRegistry()`.

```ts
export { ResearcherAgent, researcherMetadata } from "./built-in/researcher.js";

import { ResearcherAgent } from "./built-in/researcher.js";

export function createBuiltInAgentRegistry(): AgentRegistry {
  const registry = new AgentRegistry();
  registry.register(new ExplorerAgent());
  registry.register(new ResearcherAgent());  // <-- add this
  // ...
  return registry;
}
```

---

## 4. Write Tests

Create `packages/agents/src/__tests__/researcher.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ResearcherAgent } from "../built-in/researcher.js";

describe("ResearcherAgent", () => {
  it("returns a successful result", async () => {
    const agent = new ResearcherAgent();
    const result = await agent.execute({
      cwd: ".",
      request: "Find docs for pnpm",
      previousResults: [],
    });
    expect(result.success).toBe(true);
    expect(result.agentId).toBe("researcher");
  });
});
```

---

## 5. Run Checks

```bash
pnpm --filter @devbyai/agents lint
pnpm --filter @devbyai/agents typecheck
pnpm --filter @devbyai/agents test
```
