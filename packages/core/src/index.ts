/**
 * @devbyai/core
 *
 * The core orchestrator and pipeline system for DEVBYAI.
 */

export { Orchestrator } from "./orchestrator.js";
export type { OrchestratorOptions, OrchestratorResult } from "./orchestrator.js";

export {
  Phase,
  runPipeline,
  DEFAULT_PIPELINE,
} from "./pipeline.js";
export type {
  PhaseHandler,
  PhaseResult,
  PipelineConfig,
  PipelineContext,
} from "./pipeline.js";

export { HookRegistry } from "./hooks.js";
export type {
  Hook,
  HookEvent,
  HookContext,
} from "./hooks.js";

export {
  WorkflowRegistry,
  EXPLORE_WORKFLOW,
  PLAN_WORKFLOW,
  DEVELOPMENT_WORKFLOW,
  REVIEW_WORKFLOW,
} from "./workflows.js";
export type {
  Workflow,
  WorkflowMetadata,
  WorkflowStep,
} from "./workflows.js";
