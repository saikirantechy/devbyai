/**
 * @devbyai/core Intelligence
 *
 * Project Intelligence, Context Engine, Task Memory, and Session Context.
 */

// Types
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
} from "./types.js";

// Project Profile
export { detectProjectProfile } from "./project-profile.js";

// File Index
export {
  createFileIndex,
  findFiles,
  findFilesByDirectory,
  findFilesByExtension,
} from "./file-index.js";

// Context Engine
export { buildContext } from "./context-engine.js";

// Task Memory
export { TaskMemory } from "./task-memory.js";

// Session Context
export { SessionManager } from "./session-context.js";

// Error Analysis
export {
  analyzeErrors,
  analyzeLogFile,
} from "./error-analysis.js";
export type {
  ParsedError,
  ErrorSuggestion,
  ErrorAnalysis,
  ErrorCategory,
  ErrorSeverity,
} from "./error-analysis.js";

// Test Discovery
export { discoverTests, findRelevantTests, getTestCommand } from "./test-discovery.js";
export type {
  TestFile,
  TestSuite,
  TestDiscoveryResult,
  TestFramework,
} from "./test-discovery.js";

// Validation Engine
export {
  runValidation,
  runSingleCheck,
  getAvailableChecks,
  createValidationPlan,
} from "./validation.js";
export type {
  ValidationCheck,
  ValidationResult,
  ValidationCheckType,
  ValidationStatus,
  ValidationMode,
  ValidationPlan,
  ValidationRunOptions,
} from "./validation.js";

// Debug Workflows
export { analyzeDebugWorkflows } from "./debug-workflows.js";
export type {
  DebugWorkflow,
  DebugStep,
  DebugAnalysis,
  QuickFix,
  DebugContext,
  DebugWorkflowType,
} from "./debug-workflows.js";

// Failure Memory
export { FailureMemory } from "./failure-memory.js";

// Error Context
export { buildErrorContext, getRelevantFailure } from "./error-context.js";
