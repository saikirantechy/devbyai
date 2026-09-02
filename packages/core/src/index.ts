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

// Intelligence system
export {
  detectProjectProfile,
  createFileIndex,
  findFiles,
  findFilesByDirectory,
  findFilesByExtension,
  buildContext,
  TaskMemory,
  SessionManager,
} from "./intelligence/index.js";
export type {
  ProjectProfile,
  ProjectType,
  PackageManager,
  WorkspaceType,
  FileIndex,
  FileIndexEntry,
  FileImportance,
  ContextItem,
  ContextPackage,
  TaskRecord,
  TaskStatus,
  SessionContext,
} from "./intelligence/types.js";

// Debug & Validation Intelligence
export {
  analyzeErrors,
  analyzeLogFile,
  createValidationPlan,
  discoverTests,
  findRelevantTests,
  getTestCommand,
  runValidation,
  runSingleCheck,
  getAvailableChecks,
  analyzeDebugWorkflows,
} from "./intelligence/index.js";
export type {
  ParsedError,
  ErrorSuggestion,
  ErrorAnalysis,
  ErrorCategory,
  ErrorSeverity,
  TestFile,
  TestSuite,
  TestDiscoveryResult,
  TestFramework,
  ValidationCheck,
  ValidationResult,
  ValidationCheckType,
  ValidationStatus,
  ValidationMode,
  ValidationPlan,
  ValidationRunOptions,
  DebugWorkflow,
  DebugStep,
  DebugAnalysis,
  QuickFix,
  DebugContext,
  DebugWorkflowType,
} from "./intelligence/index.js";

// Failure Memory & Error Context
export { FailureMemory } from "./intelligence/index.js";
export { buildErrorContext, getRelevantFailure } from "./intelligence/index.js";
export type { FailureRecord, ErrorContext } from "./intelligence/types.js";
