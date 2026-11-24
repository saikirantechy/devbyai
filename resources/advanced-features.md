# Advanced Features

Additional advanced capabilities for DEVBYAI contributors and power users.

---

## 1. Custom Hooks

Hooks let you run code before or after pipeline phases. Defined in `packages/core/src/hooks.ts`.

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
  phase?: string;
  execute(context: HookContext): Promise<void>;
}

export class HookRegistry {
  register(hook: Hook): void;
  get(event: HookEvent): Hook[];
  async run(event, phase, context): Promise<void>;
}
```

Example — a logging hook:

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

Register:

```ts
const hooks = new HookRegistry();
hooks.register(loggingHook);
await hooks.run("afterPhase", "build", context);
```

---

## 2. Custom Workflows

Workflows define step sequences for pipeline phases. Defined in `packages/core/src/workflows.ts`.

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

Example:

```ts
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

Register:

```ts
const registry = new WorkflowRegistry();
registry.register(CUSTOM_WORKFLOW);
```

---

## 3. Custom Skills

Skills provide reusable development knowledge. Defined in `packages/skills/src/types.ts`.

```ts
export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  priority: number;
  applicableProjectTypes: string[];
  applicableAgentRoles: string[];
}

export interface SkillInstructions {
  instructions: string[];
  bestPractices?: string[];
  rules?: string[];
}

export interface Skill {
  readonly metadata: SkillMetadata;
  getInstructions(): SkillInstructions;
  appliesTo(projectType: string): boolean;
}
```

Example — a Docker skill:

```ts
import type { Skill, SkillMetadata, SkillInstructions } from "../types.js";

export const dockerMetadata: SkillMetadata = {
  id: "docker",
  name: "Docker",
  description: "Containerization best practices",
  priority: 50,
  applicableProjectTypes: ["node", "python", "go"],
  applicableAgentRoles: ["builder", "devops"],
};

export class DockerSkill implements Skill {
  readonly metadata = dockerMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: ["Use multi-stage builds", "Pin base image versions"],
      bestPractices: ["Run as non-root user"],
      rules: ["Never commit secrets to images"],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["node", "python", "go"].includes(projectType);
  }
}
```

Register in `packages/skills/src/index.ts`:

```ts
export { DockerSkill, dockerMetadata } from "./built-in/docker.js";

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new DockerSkill());
  return registry;
}
```

---

## 4. Custom Agents

Agents are specialized roles. Defined in `packages/agents/src/types.ts`.

```ts
export type AgentRole =
  | "explorer" | "planner" | "builder" | "reviewer" | "researcher" | "debugger";

export interface Agent {
  readonly metadata: AgentMetadata;
  execute(context: AgentContext): Promise<AgentResult>;
}
```

Example — a Researcher agent:

```ts
import type { Agent, AgentContext, AgentResult, AgentMetadata, AgentRole } from "../types.js";

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
    return {
      agentId: this.metadata.id,
      success: true,
      output: `Research completed for: ${context.request}`,
      suggestedNext: "build",
    };
  }
}
```

Register in `packages/agents/src/index.ts`:

```ts
export { ResearcherAgent, researcherMetadata } from "./built-in/researcher.js";

export function createBuiltInAgentRegistry(): AgentRegistry {
  const registry = new AgentRegistry();
  registry.register(new ExplorerAgent());
  registry.register(new ResearcherAgent());
  return registry;
}
```

---

## 5. Custom CLI Commands

DEVBYAI CLI uses Commander in `apps/cli/src/index.ts`.

Example — a `status` command:

```ts
program
  .command("status")
  .description("Show DEVBYAI workspace and provider status")
  .action(async () => {
    const cwd = process.cwd();
    const workspace = detectWorkspace(cwd);
    console.log(sectionHeader("WORKSPACE"));
    console.log(renderWorkspace(workspace));
  });
```

Pattern:
1. `program.command("name")` — kebab-case command name.
2. `.description("...")` — short help text.
3. `.action(async () => { ... })` — async handler.
4. Use UI helpers (`status`, `symbols`, `createSpinner`) from `@devbyai/ui`.

---

## 6. Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI provider key |
| `ANTHROPIC_API_KEY` | Anthropic provider key |
| `GOOGLE_API_KEY` | Google provider key |
| `DEVBYAI_PROVIDER` | Default provider override |
| `DEVBYAI_MODEL` | Default model override |
| `CI` | Set to `true` in CI environments |
| `NO_COLOR` | Disable colored output (`1`) |
| `FORCE_COLOR` | Force color output (`1` or `0`) |

---

## 7. Advanced Checklist

- [ ] New feature follows interface + class pattern
- [ ] Public API exported from `src/index.ts`
- [ ] Imports use `.js` extensions (ESM convention)
- [ ] No `any` types; use `unknown` or specific types
- [ ] Registry updated if adding tool/provider/agent/skill/command
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm lint && pnpm typecheck && pnpm test` passes
- [ ] Commit message uses conventional format (`feat:`, `fix:`, `docs:`)
