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
