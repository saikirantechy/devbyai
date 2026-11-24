# Package API Reference

Quick reference for the main DEVBYAI packages. Use this when writing code or adding features.

---

## `@devbyai/core` — Orchestrator & Pipeline

**Key exports:**

```ts
import {
  Orchestrator,
  runPipeline,
  Phase,
  HookRegistry,
  WorkflowRegistry,
  createFileIndex,
  buildContext,
  runValidation,
} from "@devbyai/core";
```

- `Orchestrator` — runs the full pipeline (EXPLORE → PLAN → BUILD → REVIEW → TEST → SHIP).
- `runPipeline` / `Phase` — lower-level pipeline execution.
- `HookRegistry` — lifecycle hooks (before/after phases).
- `WorkflowRegistry` — predefined workflows per phase.
- `createFileIndex`, `buildContext` — project intelligence (file indexing, context building).
- `runValidation` — validation engine (quick/standard/full modes).

---

## `@devbyai/models` — AI Providers

**Key exports:**

```ts
import {
  ModelProvider,
  ModelMessage,
  ModelResponse,
  MockProvider,
  OpenAIProvider,
  ProviderRegistry,
  createDefaultProviderRegistry,
} from "@devbyai/models";
```

- `ModelProvider` — interface to implement for new providers.
- `ModelMessage` / `ModelResponse` — message shapes.
- `MockProvider` — default dev provider (no API key needed).
- `ProviderRegistry` — registers and creates providers by ID.
- `createDefaultProviderRegistry()` — pre-loads mock + OpenAI.

---

## `@devbyai/tools` — Agent Tools

**Key exports:**

```ts
import {
  Tool,
  ToolInput,
  ToolResult,
  ToolPermission,
  ReadFileTool,
  WriteFileTool,
  ListDirectoryTool,
  SearchFilesTool,
  CommandRunnerTool,
  ToolRegistry,
  createDefaultToolRegistry,
} from "@devbyai/tools";
```

- `Tool` — interface: `name`, `description`, `permissions`, `inputSchema`, `execute()`.
- Built-ins: `ReadFileTool`, `WriteFileTool`, `ListDirectoryTool`, `SearchFilesTool`, `CommandRunnerTool`.
- `createDefaultToolRegistry()` — pre-loads all built-in tools.

---

## `@devbyai/agents` — Agents

**Key exports:**

```ts
import {
  Agent,
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentRole,
  ExplorerAgent,
  PlannerAgent,
  BuilderAgent,
  ReviewerAgent,
  DebugAgent,
  AgentRegistry,
  createBuiltInAgentRegistry,
} from "@devbyai/agents";
```

- `Agent` — interface: `metadata`, `execute(context)`.
- Roles: `explorer`, `planner`, `builder`, `reviewer`, `researcher`, `debugger`.
- `createBuiltInAgentRegistry()` — pre-loads all built-in agents.

---

## `@devbyai/skills` — Skills

**Key exports:**

```ts
import {
  Skill,
  SkillMetadata,
  SkillInstructions,
  TypeScriptSkill,
  TestingSkill,
  CodeReviewSkill,
  DocumentationSkill,
  SkillRegistry,
  createBuiltInSkillRegistry,
} from "@devbyai/skills";
```

- `Skill` — interface: `metadata`, `getInstructions()`, `appliesTo(projectType)`.
- Built-ins: TypeScript, Testing, Code Review, Documentation.

---

## `@devbyai/config` — Configuration

**Key exports:**

```ts
import { loadConfig, getConfig, getApiKey } from "@devbyai/config";
```

- `loadConfig(cwd)` — loads `devbyai.json`.
- `getConfig()` — returns current config.
- `getApiKey(providerId)` — gets API key from env.

---

## `@devbyai/ui` — Terminal UI

**Key exports:**

```ts
import {
  createPipeline,
  createSpinner,
  printBanner,
  sectionHeader,
  status,
  symbols,
  renderWorkspace,
  detectWorkspace,
} from "@devbyai/ui";
```

- `createPipeline` — visual pipeline renderer.
- `createSpinner` — loading spinner.
- `status` — success/error/warning helpers.
- `symbols` — check/cross/warning icons.

---

## Import Convention

All imports use `.js` extensions even for `.ts` source files:

```ts
// ✅ Correct
import { Orchestrator } from "@devbyai/core";
import { runPipeline } from "./pipeline.js";

// ❌ Avoid (no extension)
import { runPipeline } from "./pipeline";
```
