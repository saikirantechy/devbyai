/**
 * DEVBYAI Validation Engine
 *
 * Runs validation checks and provides comprehensive project health reports.
 */

import { execSync } from "node:child_process";
import { type ErrorAnalysis, analyzeErrors } from "./error-analysis.js";
import type { FileIndex, ProjectProfile } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ValidationCheckType = "typecheck" | "lint" | "test" | "build" | "format" | "security";

export type ValidationStatus = "passed" | "failed" | "skipped" | "error";

export type ValidationMode = "quick" | "standard" | "full";

export interface ValidationPlan {
  /** Checks to be executed */
  checks: Array<{ type: ValidationCheckType; name: string; command: string }>;
  /** Validation mode */
  mode: ValidationMode;
  /** Total checks */
  totalChecks: number;
}

export interface ValidationRunOptions {
  /** Validation mode */
  mode?: ValidationMode;
  /** Specific check types to run */
  checkTypes?: ValidationCheckType[];
  /** Working directory */
  cwd: string;
}

export interface ValidationCheck {
  /** Check type */
  type: ValidationCheckType;
  /** Human-readable name */
  name: string;
  /** Command executed */
  command: string;
  /** Check status */
  status: ValidationStatus;
  /** Duration in milliseconds */
  duration: number;
  /** Error analysis (if failed) */
  analysis: ErrorAnalysis | null;
  /** Raw output */
  output: string;
  /** Validation run ID */
  runId: string;
  /** Start timestamp */
  startedAt: number;
  /** End timestamp */
  completedAt: number | null;
  /** Exit code (if available) */
  exitCode: number | null;
}

export interface ValidationResult {
  /** All checks run */
  checks: ValidationCheck[];
  /** Overall status */
  status: ValidationStatus;
  /** Total duration */
  totalDuration: number;
  /** Summary */
  summary: {
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
    warnings: number;
  };
  /** Recommendations */
  recommendations: string[];
  /** Unique validation run ID */
  runId: string;
  /** Validation mode used */
  mode: ValidationMode;
  /** Start timestamp */
  startedAt: number;
  /** End timestamp */
  completedAt: number;
}

// ---------------------------------------------------------------------------
// Check Definitions
// ---------------------------------------------------------------------------

interface CheckDefinition {
  type: ValidationCheckType;
  name: string;
  command: string;
  required: boolean;
  profileCheck: (profile: ProjectProfile) => boolean;
}

const CHECK_DEFINITIONS: CheckDefinition[] = [
  {
    type: "typecheck",
    name: "Type Checking",
    command: "pnpm typecheck",
    required: true,
    profileCheck: (p) => p.projectType === "typescript" || p.projectType === "node",
  },
  {
    type: "lint",
    name: "Linting",
    command: "npx biome check packages/ apps/",
    required: true,
    profileCheck: (p) => p.lintSystem !== null,
  },
  {
    type: "test",
    name: "Testing",
    command: "pnpm test",
    required: true,
    profileCheck: (p) => p.testFramework !== null,
  },
  {
    type: "build",
    name: "Build",
    command: "pnpm build",
    required: true,
    profileCheck: (p) => p.buildSystem !== null || p.projectType === "typescript",
  },
  {
    type: "format",
    name: "Formatting",
    command: "npx biome format --check packages/ apps/",
    required: false,
    profileCheck: (p) => p.lintSystem === "Biome",
  },
];

// ---------------------------------------------------------------------------
// Run ID Generator
// ---------------------------------------------------------------------------

let validationRunCounter = 0;
function generateRunId(): string {
  validationRunCounter++;
  return `vr-${Date.now()}-${validationRunCounter}`;
}

// ---------------------------------------------------------------------------
// Main Functions
// ---------------------------------------------------------------------------

/**
 * Create a validation plan for a project profile and mode.
 */
export function createValidationPlan(
  profile: ProjectProfile,
  mode: ValidationMode = "standard",
): ValidationPlan {
  const applicableChecks = CHECK_DEFINITIONS.filter((def) => def.profileCheck(profile));

  let checksToRun: CheckDefinition[];

  switch (mode) {
    case "quick":
      // Only typecheck and test
      checksToRun = applicableChecks.filter((d) => d.type === "typecheck" || d.type === "test");
      break;
    case "full":
      // All applicable checks including format
      checksToRun = applicableChecks;
      break;
    case "standard":
    default:
      // Typecheck, lint, test, build (skip format)
      checksToRun = applicableChecks.filter((d) => d.type !== "format");
      break;
  }

  return {
    checks: checksToRun.map((d) => ({
      type: d.type,
      name: d.name,
      command: d.command,
    })),
    mode,
    totalChecks: checksToRun.length,
  };
}

/**
 * Run all applicable validation checks.
 */
export function runValidation(
  cwd: string,
  profile: ProjectProfile,
  fileIndex?: FileIndex,
  checkTypes?: ValidationCheckType[],
): ValidationResult;
export function runValidation(options: ValidationRunOptions): ValidationResult;
export function runValidation(
  optionsOrCwd: ValidationRunOptions | string,
  profile?: ProjectProfile,
  fileIndex?: FileIndex,
  checkTypes?: ValidationCheckType[],
): ValidationResult {
  // Normalize arguments
  let options: ValidationRunOptions;
  if (typeof optionsOrCwd === "string") {
    options = {
      cwd: optionsOrCwd,
      mode: "standard",
      checkTypes,
    };
  } else {
    options = optionsOrCwd;
  }

  const runId = generateRunId();
  const startTime = Date.now();
  const mode = options.mode ?? "standard";
  const checks: ValidationCheck[] = [];

  // Build applicable checks
  let applicableChecks: CheckDefinition[];

  // If we have a profile (legacy path), use it
  if (profile) {
    applicableChecks = CHECK_DEFINITIONS.filter((def) => def.profileCheck(profile));
  } else {
    // No profile available, include all checks
    applicableChecks = [...CHECK_DEFINITIONS];
  }

  // Apply mode filtering
  switch (mode) {
    case "quick":
      applicableChecks = applicableChecks.filter((d) => d.type === "typecheck" || d.type === "test");
      break;
    case "full":
      // All applicable checks
      break;
    case "standard":
    default:
      applicableChecks = applicableChecks.filter((d) => d.type !== "format");
      break;
  }

  // Apply explicit checkTypes filter if provided
  const filterTypes = options.checkTypes ?? checkTypes;
  if (filterTypes) {
    applicableChecks = applicableChecks.filter((def) => filterTypes.includes(def.type));
  }

  for (const def of applicableChecks) {
    const check = runCheck(options.cwd, def, runId);
    checks.push(check);
  }

  // Calculate summary
  const passed = checks.filter((c) => c.status === "passed").length;
  const failed = checks.filter((c) => c.status === "failed").length;
  const skipped = checks.filter((c) => c.status === "skipped").length;
  const errors = checks.reduce((sum, c) => sum + (c.analysis?.totalErrors || 0), 0);
  const warnings = checks.reduce((sum, c) => sum + (c.analysis?.totalWarnings || 0), 0);

  // Overall status
  const status: ValidationStatus = failed > 0 ? "failed" : "passed";

  // Generate recommendations (use profile/fileIndex if available)
  const recommendations = fileIndex
    ? generateRecommendations(checks, profile!, fileIndex)
    : generateBasicRecommendations(checks);

  const completedAt = Date.now();

  return {
    checks,
    status,
    totalDuration: completedAt - startTime,
    summary: { passed, failed, skipped, errors, warnings },
    recommendations,
    runId,
    mode,
    startedAt: startTime,
    completedAt,
  };
}

/**
 * Run a single validation check.
 */
function runCheck(cwd: string, def: CheckDefinition, runId: string): ValidationCheck {
  const startedAt = Date.now();
  let exitCode: number | null = null;

  try {
    const output = execSync(def.command, {
      cwd,
      encoding: "utf-8",
      timeout: 120_000,
      stdio: ["pipe", "pipe", "pipe"],
    });

    return {
      type: def.type,
      name: def.name,
      command: def.command,
      status: "passed",
      duration: Date.now() - startedAt,
      analysis: null,
      output,
      runId,
      startedAt,
      completedAt: Date.now(),
      exitCode: 0,
    };
  } catch (err) {
    const output = err instanceof Error ? err.message : String(err);

    // Try to extract exit code from execSync error
    if (err && typeof err === "object" && "status" in err) {
      exitCode = (err as { status: number | null }).status ?? null;
    }

    // Analyze the error output
    const analysis = analyzeErrors(output, cwd);

    return {
      type: def.type,
      name: def.name,
      command: def.command,
      status: "failed",
      duration: Date.now() - startedAt,
      analysis,
      output,
      runId,
      startedAt,
      completedAt: Date.now(),
      exitCode,
    };
  }
}

/**
 * Generate recommendations based on validation results.
 */
function generateRecommendations(
  checks: ValidationCheck[],
  profile: ProjectProfile,
  fileIndex: FileIndex,
): string[] {
  const recommendations: string[] = [];

  // Check for failed type checking
  const typecheck = checks.find((c) => c.type === "typecheck");
  if (typecheck?.status === "failed") {
    recommendations.push("Fix TypeScript errors before proceeding. Run: pnpm typecheck");
  }

  // Check for failed linting
  const lint = checks.find((c) => c.type === "lint");
  if (lint?.status === "failed") {
    recommendations.push("Fix linting errors. Run: npx biome check --fix --unsafe .");
  }

  // Check for failed tests
  const test = checks.find((c) => c.type === "test");
  if (test?.status === "failed") {
    recommendations.push("Fix failing tests. Run: pnpm test");
  }

  // Check for failed build
  const build = checks.find((c) => c.type === "build");
  if (build?.status === "failed") {
    recommendations.push("Fix build errors. Check the build output for details.");
  }

  // Check test coverage
  const testFiles = fileIndex.testFiles.length;
  const sourceFiles = fileIndex.sourceFiles.length;
  if (sourceFiles > 0 && testFiles === 0) {
    recommendations.push("No test files found. Consider adding tests for your source code.");
  } else if (sourceFiles > 10 && testFiles < sourceFiles * 0.3) {
    recommendations.push("Low test coverage detected. Consider adding more tests.");
  }

  // Check for missing config
  if (!profile.testFramework && sourceFiles > 5) {
    recommendations.push("No test framework detected. Consider setting up Vitest or Jest.");
  }

  // Check for missing lint
  if (!profile.lintSystem) {
    recommendations.push("No linting system detected. Consider adding Biome or ESLint.");
  }

  return recommendations;
}

/**
 * Generate basic recommendations without fileIndex context.
 */
function generateBasicRecommendations(checks: ValidationCheck[]): string[] {
  const recommendations: string[] = [];

  const typecheck = checks.find((c) => c.type === "typecheck");
  if (typecheck?.status === "failed") {
    recommendations.push("Fix TypeScript errors before proceeding. Run: pnpm typecheck");
  }

  const lint = checks.find((c) => c.type === "lint");
  if (lint?.status === "failed") {
    recommendations.push("Fix linting errors. Run: npx biome check --fix --unsafe .");
  }

  const test = checks.find((c) => c.type === "test");
  if (test?.status === "failed") {
    recommendations.push("Fix failing tests. Run: pnpm test");
  }

  const build = checks.find((c) => c.type === "build");
  if (build?.status === "failed") {
    recommendations.push("Fix build errors. Check the build output for details.");
  }

  return recommendations;
}

/**
 * Run a specific validation check.
 */
export function runSingleCheck(cwd: string, type: ValidationCheckType): ValidationCheck | null {
  const def = CHECK_DEFINITIONS.find((d) => d.type === type);
  if (!def) return null;

  return runCheck(cwd, def, generateRunId());
}

/**
 * Get available validation checks for a project.
 */
export function getAvailableChecks(profile: ProjectProfile): ValidationCheckType[] {
  return CHECK_DEFINITIONS.filter((def) => def.profileCheck(profile)).map((def) => def.type);
}
