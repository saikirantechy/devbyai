/**
 * DEVBYAI Debug Workflows
 *
 * Intelligent debugging suggestions based on error patterns and project state.
 */

import type { ErrorAnalysis, ErrorCategory, ParsedError } from "./error-analysis.js";
import type { TestDiscoveryResult } from "./test-discovery.js";
import type { FileIndex, ProjectProfile, TaskRecord } from "./types.js";
import type { ValidationResult } from "./validation.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DebugWorkflowType =
  | "typescript-error"
  | "test-failure"
  | "build-failure"
  | "lint-error"
  | "dependency-issue"
  | "runtime-error"
  | "performance"
  | "general";

export interface DebugStep {
  /** Step number */
  step: number;
  /** Step title */
  title: string;
  /** Description */
  description: string;
  /** Command to run (if applicable) */
  command: string | null;
  /** Expected outcome */
  expectedOutcome: string;
  /** Whether this step is critical */
  critical: boolean;
}

export interface DebugWorkflow {
  /** Workflow type */
  type: DebugWorkflowType;
  /** Workflow title */
  title: string;
  /** Description */
  description: string;
  /** Steps to debug */
  steps: DebugStep[];
  /** Related errors */
  relatedErrors: ParsedError[];
  /** Confidence that this workflow applies */
  confidence: number;
}

export interface DebugAnalysis {
  /** Suggested workflows */
  workflows: DebugWorkflow[];
  /** Primary workflow (highest confidence) */
  primaryWorkflow: DebugWorkflow | null;
  /** Quick fixes available */
  quickFixes: QuickFix[];
  /** Context for debugging */
  context: DebugContext;
}

export interface QuickFix {
  /** Fix description */
  description: string;
  /** Command to apply */
  command: string;
  /** Confidence */
  confidence: number;
  /** Whether it's safe to auto-apply */
  safeToAutoApply: boolean;
}

export interface DebugContext {
  /** Recent errors */
  recentErrors: ParsedError[];
  /** Error categories present */
  errorCategories: ErrorCategory[];
  /** Affected files */
  affectedFiles: string[];
  /** Related test files */
  relatedTests: string[];
  /** Project health score (0-100) */
  healthScore: number;
}

// ---------------------------------------------------------------------------
// Workflow Definitions
// ---------------------------------------------------------------------------

function createTypeScriptErrorWorkflow(
  errors: ParsedError[],
  _fileIndex: FileIndex,
): DebugWorkflow {
  const tsErrors = errors.filter((e) => e.category === "typescript");

  const steps: DebugStep[] = [
    {
      step: 1,
      title: "Identify the error",
      description: "Read the error message carefully. Note the file, line, and error code.",
      command: null,
      expectedOutcome: "Understanding of what went wrong",
      critical: true,
    },
    {
      step: 2,
      title: "Check the import",
      description:
        "If it's a 'Cannot find module' error, verify the import path and package installation.",
      command: "pnpm install",
      expectedOutcome: "Module resolved",
      critical: false,
    },
    {
      step: 3,
      title: "Check the type",
      description: "If it's a type mismatch, verify the expected type and the actual value.",
      command: null,
      expectedOutcome: "Type alignment",
      critical: true,
    },
    {
      step: 4,
      title: "Run type checker",
      description: "Run the full type check to see all related errors.",
      command: "pnpm typecheck",
      expectedOutcome: "Complete error list",
      critical: false,
    },
    {
      step: 5,
      title: "Fix incrementally",
      description: "Fix errors one at a time, starting with the root cause.",
      command: null,
      expectedOutcome: "Errors resolved",
      critical: true,
    },
  ];

  return {
    type: "typescript-error",
    title: "Debug TypeScript Error",
    description: `Found ${tsErrors.length} TypeScript error(s). Follow these steps to resolve them.`,
    steps,
    relatedErrors: tsErrors,
    confidence: 0.9,
  };
}

function createTestFailureWorkflow(
  errors: ParsedError[],
  testDiscovery: TestDiscoveryResult | null,
): DebugWorkflow {
  const testErrors = errors.filter((e) => e.category === "test");

  const steps: DebugStep[] = [
    {
      step: 1,
      title: "Identify the failing test",
      description: "Find which test(s) are failing and understand what they test.",
      command: null,
      expectedOutcome: "Identified failing test(s)",
      critical: true,
    },
    {
      step: 2,
      title: "Read the test",
      description: "Read the test file to understand what behavior is expected.",
      command: null,
      expectedOutcome: "Understanding of expected behavior",
      critical: true,
    },
    {
      step: 3,
      title: "Read the source",
      description: "Read the source file being tested to understand current behavior.",
      command: null,
      expectedOutcome: "Understanding of current behavior",
      critical: true,
    },
    {
      step: 4,
      title: "Run the test in isolation",
      description: "Run just the failing test to see the exact error.",
      command: testDiscovery?.testCommand || "pnpm test",
      expectedOutcome: "Exact error message",
      critical: false,
    },
    {
      step: 5,
      title: "Fix or update",
      description:
        "Either fix the source code or update the test if behavior changed intentionally.",
      command: null,
      expectedOutcome: "Test passes",
      critical: true,
    },
  ];

  return {
    type: "test-failure",
    title: "Debug Test Failure",
    description: `Found ${testErrors.length} test failure(s). Follow these steps to resolve them.`,
    steps,
    relatedErrors: testErrors,
    confidence: 0.9,
  };
}

function createBuildFailureWorkflow(errors: ParsedError[], profile: ProjectProfile): DebugWorkflow {
  const buildErrors = errors.filter((e) => e.category === "build");

  const steps: DebugStep[] = [
    {
      step: 1,
      title: "Read the build output",
      description: "Carefully read the build error message for clues.",
      command: null,
      expectedOutcome: "Understanding of build failure",
      critical: true,
    },
    {
      step: 2,
      title: "Check dependencies",
      description: "Ensure all dependencies are installed correctly.",
      command: "pnpm install",
      expectedOutcome: "Dependencies resolved",
      critical: false,
    },
    {
      step: 3,
      title: "Check configuration",
      description: "Verify build configuration files (tsconfig.json, etc.).",
      command: null,
      expectedOutcome: "Configuration validated",
      critical: true,
    },
    {
      step: 4,
      title: "Clean and rebuild",
      description: "Clean the build output and try again.",
      command: profile.packageManager === "pnpm" ? "pnpm clean && pnpm build" : "pnpm build",
      expectedOutcome: "Clean build",
      critical: false,
    },
    {
      step: 5,
      title: "Check for circular dependencies",
      description: "If the build hangs or fails mysteriously, check for circular imports.",
      command: null,
      expectedOutcome: "No circular dependencies",
      critical: false,
    },
  ];

  return {
    type: "build-failure",
    title: "Debug Build Failure",
    description: `Build failed with ${buildErrors.length} error(s). Follow these steps to resolve.`,
    steps,
    relatedErrors: buildErrors,
    confidence: 0.8,
  };
}

function createLintErrorWorkflow(errors: ParsedError[]): DebugWorkflow {
  const lintErrors = errors.filter((e) => e.category === "eslint" || e.category === "biome");

  const steps: DebugStep[] = [
    {
      step: 1,
      title: "Auto-fix what's possible",
      description: "Run the linter's auto-fix to resolve simple issues.",
      command: "npx biome check --fix --unsafe .",
      expectedOutcome: "Auto-fixable issues resolved",
      critical: false,
    },
    {
      step: 2,
      title: "Review remaining errors",
      description: "Check what errors couldn't be auto-fixed.",
      command: null,
      expectedOutcome: "Understanding of manual fixes needed",
      critical: true,
    },
    {
      step: 3,
      title: "Fix manually",
      description: "Address each remaining error according to the linter's suggestions.",
      command: null,
      expectedOutcome: "All errors fixed",
      critical: true,
    },
    {
      step: 4,
      title: "Verify",
      description: "Run the linter again to confirm all issues are resolved.",
      command: "npx biome check packages/ apps/",
      expectedOutcome: "No lint errors",
      critical: false,
    },
  ];

  return {
    type: "lint-error",
    title: "Fix Lint Errors",
    description: `Found ${lintErrors.length} lint error(s). Follow these steps to resolve.`,
    steps,
    relatedErrors: lintErrors,
    confidence: 0.85,
  };
}

function createDependencyWorkflow(errors: ParsedError[]): DebugWorkflow {
  const depErrors = errors.filter((e) => e.category === "dependency");

  const steps: DebugStep[] = [
    {
      step: 1,
      title: "Identify missing module",
      description: "Find which module is missing from the error message.",
      command: null,
      expectedOutcome: "Identified missing module",
      critical: true,
    },
    {
      step: 2,
      title: "Check if it's a typo",
      description: "Verify the import path is correct and the module name is spelled correctly.",
      command: null,
      expectedOutcome: "Import path verified",
      critical: true,
    },
    {
      step: 3,
      title: "Install the dependency",
      description: "Install the missing package.",
      command: "pnpm install",
      expectedOutcome: "Package installed",
      critical: false,
    },
    {
      step: 4,
      title: "Check for version conflicts",
      description: "If installation fails, check for version conflicts.",
      command: "pnpm list",
      expectedOutcome: "No version conflicts",
      critical: false,
    },
  ];

  return {
    type: "dependency-issue",
    title: "Fix Dependency Issue",
    description: `Found ${depErrors.length} dependency error(s). Follow these steps to resolve.`,
    steps,
    relatedErrors: depErrors,
    confidence: 0.85,
  };
}

// ---------------------------------------------------------------------------
// Quick Fix Detection
// ---------------------------------------------------------------------------

function detectQuickFixes(errors: ParsedError[], validation: ValidationResult | null): QuickFix[] {
  const fixes: QuickFix[] = [];

  // Auto-fix lint errors
  const lintErrors = errors.filter((e) => e.category === "biome" || e.category === "eslint");
  if (lintErrors.length > 0) {
    fixes.push({
      description: `Auto-fix ${lintErrors.length} lint error(s)`,
      command: "npx biome check --fix --unsafe .",
      confidence: 0.9,
      safeToAutoApply: true,
    });
  }

  // Install missing dependencies
  const depErrors = errors.filter((e) => e.category === "dependency");
  if (depErrors.length > 0) {
    fixes.push({
      description: "Install missing dependencies",
      command: "pnpm install",
      confidence: 0.8,
      safeToAutoApply: true,
    });
  }

  // Format code
  const formatCheck = validation?.checks.find((c) => c.type === "format");
  if (formatCheck?.status === "failed") {
    fixes.push({
      description: "Auto-format code",
      command: "npx biome format --write packages/ apps/",
      confidence: 0.95,
      safeToAutoApply: true,
    });
  }

  return fixes;
}

// ---------------------------------------------------------------------------
// Health Score
// ---------------------------------------------------------------------------

function calculateHealthScore(
  validation: ValidationResult | null,
  testDiscovery: TestDiscoveryResult | null,
  errorAnalysis: ErrorAnalysis | null,
): number {
  let score = 100;

  // Deduct for validation failures
  if (validation) {
    const failRate = validation.summary.failed / Math.max(1, validation.checks.length);
    score -= failRate * 40;
  }

  // Deduct for errors
  if (errorAnalysis) {
    score -= Math.min(30, errorAnalysis.totalErrors * 5);
    score -= Math.min(10, errorAnalysis.totalWarnings * 1);
  }

  // Deduct for low test coverage
  if (testDiscovery) {
    if (testDiscovery.testFiles.length === 0 && testDiscovery.untestedFiles.length > 5) {
      score -= 15;
    } else if (testDiscovery.coverageEstimate < 30) {
      score -= 10;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ---------------------------------------------------------------------------
// Main Analysis Function
// ---------------------------------------------------------------------------

/**
 * Analyze errors and generate debug workflows.
 */
export function analyzeDebugWorkflows(
  errorAnalysis: ErrorAnalysis,
  profile: ProjectProfile,
  fileIndex: FileIndex,
  testDiscovery: TestDiscoveryResult | null = null,
  validation: ValidationResult | null = null,
  _recentTasks: TaskRecord[] = [],
): DebugAnalysis {
  const { errors } = errorAnalysis;
  const errorCategories = [...new Set(errors.map((e) => e.category))];
  const affectedFiles = [
    ...new Set(errors.filter((e) => e.filePath).map((e) => e.filePath ?? "")),
  ].filter((f) => f.length > 0);

  // Generate workflows based on error categories
  const workflows: DebugWorkflow[] = [];

  if (errorCategories.includes("typescript")) {
    workflows.push(createTypeScriptErrorWorkflow(errors, fileIndex));
  }

  if (errorCategories.includes("test")) {
    workflows.push(createTestFailureWorkflow(errors, testDiscovery));
  }

  if (errorCategories.includes("build")) {
    workflows.push(createBuildFailureWorkflow(errors, profile));
  }

  if (errorCategories.includes("eslint") || errorCategories.includes("biome")) {
    workflows.push(createLintErrorWorkflow(errors));
  }

  if (errorCategories.includes("dependency")) {
    workflows.push(createDependencyWorkflow(errors));
  }

  // Sort by confidence
  workflows.sort((a, b) => b.confidence - a.confidence);

  // Detect quick fixes
  const quickFixes = detectQuickFixes(errors, validation);

  // Calculate health score
  const healthScore = calculateHealthScore(validation, testDiscovery, errorAnalysis);

  const context: DebugContext = {
    recentErrors: errors,
    errorCategories,
    affectedFiles,
    relatedTests: [],
    healthScore,
  };

  return {
    workflows,
    primaryWorkflow: workflows[0] || null,
    quickFixes,
    context,
  };
}
