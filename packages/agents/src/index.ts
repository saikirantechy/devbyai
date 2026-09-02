/**
 * @devbyai/agents
 *
 * Specialized agents for DEVBYAI.
 * Provides Explorer, Planner, Builder, Reviewer, and Debugger agents.
 */

// Types
export type { Agent, AgentMetadata, AgentContext, AgentResult, AgentRole } from "./types.js";

// Registry
export { AgentRegistry, createDefaultAgentRegistry } from "./registry.js";

// Built-in agents
export { ExplorerAgent, explorerMetadata } from "./built-in/explorer.js";
export { PlannerAgent, plannerMetadata } from "./built-in/planner.js";
export { BuilderAgent, builderMetadata } from "./built-in/builder.js";
export { ReviewerAgent, reviewerMetadata } from "./built-in/reviewer.js";
export { DebugAgent, debuggerMetadata } from "./built-in/debugger.js";

// Debug Agent types
export type {
  ParsedError,
  ErrorSeverity,
  ErrorCategory,
  FixSuggestion,
  RelatedFile,
  DebugAgentResult,
} from "./built-in/debugger.js";

// Debug Agent functions
export {
  parseErrors,
  findRelatedFiles,
  generateFixSuggestions,
  generateDebugSteps,
} from "./built-in/debugger.js";

import { BuilderAgent } from "./built-in/builder.js";
import { DebugAgent } from "./built-in/debugger.js";
import { ExplorerAgent } from "./built-in/explorer.js";
import { PlannerAgent } from "./built-in/planner.js";
import { ReviewerAgent } from "./built-in/reviewer.js";
import { AgentRegistry } from "./registry.js";

/**
 * Create a registry with all built-in agents.
 */
export function createBuiltInAgentRegistry(): AgentRegistry {
  const registry = new AgentRegistry();
  registry.register(new ExplorerAgent());
  registry.register(new PlannerAgent());
  registry.register(new BuilderAgent());
  registry.register(new ReviewerAgent());
  registry.register(new DebugAgent());
  return registry;
}
