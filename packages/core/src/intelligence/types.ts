/**
 * DEVBYAI Intelligence Types
 *
 * Core type definitions for the Project Intelligence system.
 */

// ---------------------------------------------------------------------------
// Project Profile
// ---------------------------------------------------------------------------

export type ProjectType =
  | "node"
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "php"
  | "dart"
  | "unknown";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun" | "unknown";

export type WorkspaceType = "monorepo" | "single" | "unknown";

export interface ProjectProfile {
  /** Project name (from directory or package.json) */
  name: string;
  /** Project type */
  projectType: ProjectType;
  /** Detected languages */
  languages: string[];
  /** Framework detected */
  frameworks: string[];
  /** Runtime */
  runtime: string | null;
  /** Package manager */
  packageManager: PackageManager;
  /** Workspace type */
  workspaceType: WorkspaceType;
  /** Testing framework */
  testFramework: string | null;
  /** Build system */
  buildSystem: string | null;
  /** Linting system */
  lintSystem: string | null;
  /** Source directories */
  sourceDirectories: string[];
  /** Test directories */
  testDirectories: string[];
  /** Configuration files found */
  configurationFiles: string[];
  /** Entry points */
  entryPoints: string[];
  /** Number of packages (for monorepos) */
  packageCount: number;
}

// ---------------------------------------------------------------------------
// File Index
// ---------------------------------------------------------------------------

export type FileImportance = "critical" | "high" | "medium" | "low";

export interface FileIndexEntry {
  /** Relative path from workspace root */
  path: string;
  /** File extension */
  extension: string;
  /** File size in bytes */
  size: number;
  /** Directory containing the file */
  directory: string;
  /** Importance level */
  importance: FileImportance;
  /** Whether this is a test file */
  isTest: boolean;
  /** Whether this is a config file */
  isConfig: boolean;
  /** Whether this is a source file */
  isSource: boolean;
}

export interface FileIndex {
  /** All indexed files */
  files: FileIndexEntry[];
  /** Files grouped by directory */
  byDirectory: Map<string, FileIndexEntry[]>;
  /** Files grouped by extension */
  byExtension: Map<string, FileIndexEntry[]>;
  /** Critical files */
  criticalFiles: FileIndexEntry[];
  /** Source files */
  sourceFiles: FileIndexEntry[];
  /** Test files */
  testFiles: FileIndexEntry[];
  /** Config files */
  configFiles: FileIndexEntry[];
  /** Total file count */
  totalFiles: number;
  /** Index timestamp */
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Context Engine
// ---------------------------------------------------------------------------

export interface ContextItem {
  /** File path */
  path: string;
  /** Reason this file is relevant */
  reason: string;
  /** Relevance score (0-1) */
  score: number;
  /** Content preview (optional) */
  preview?: string;
}

export interface ContextPackage {
  /** Task description */
  task: string;
  /** Selected context items */
  items: ContextItem[];
  /** Project profile */
  profile: ProjectProfile;
  /** Total estimated tokens */
  estimatedTokens: number;
  /** Whether context was truncated */
  truncated: boolean;
}

// ---------------------------------------------------------------------------
// Task Memory
// ---------------------------------------------------------------------------

export type TaskStatus =
  | "created"
  | "exploring"
  | "planning"
  | "waiting_for_approval"
  | "building"
  | "reviewing"
  | "completed"
  | "failed"
  | "cancelled";

export interface TaskRecord {
  /** Unique task ID */
  id: string;
  /** Task description */
  description: string;
  /** Workflow used */
  workflow: string | null;
  /** Agents used */
  agents: string[];
  /** Skills activated */
  skills: string[];
  /** Files explored */
  exploredFiles: string[];
  /** Files modified */
  modifiedFiles: string[];
  /** Commands executed */
  commands: string[];
  /** Current status */
  status: TaskStatus;
  /** Creation timestamp */
  createdAt: number;
  /** Completion timestamp */
  completedAt: number | null;
  /** Duration in milliseconds */
  duration: number | null;
}

// ---------------------------------------------------------------------------
// Session Context
// ---------------------------------------------------------------------------

export interface SessionContext {
  /** Current workspace path */
  workspacePath: string;
  /** Current task ID (if any) */
  currentTaskId: string | null;
  /** Recently accessed files */
  recentFiles: string[];
  /** Recently modified files */
  recentModifications: string[];
  /** Active workflow */
  activeWorkflow: string | null;
  /** Active skills */
  activeSkills: string[];
  /** Session start time */
  startedAt: number;
  /** Task count in this session */
  taskCount: number;
}
