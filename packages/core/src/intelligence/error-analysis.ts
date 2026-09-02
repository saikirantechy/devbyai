/**
 * DEVBYAI Error Analysis Engine
 *
 * Parses, categorizes, and provides suggestions for common development errors.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { FileIndex, ProjectProfile } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ErrorCategory =
  | "typescript"
  | "eslint"
  | "biome"
  | "test"
  | "build"
  | "runtime"
  | "dependency"
  | "permission"
  | "network"
  | "unknown";

export type ErrorSeverity = "error" | "warning" | "info";

export interface ParsedError {
  /** Raw error message */
  raw: string;
  /** Parsed file path (if found) */
  filePath: string | null;
  /** Line number (if found) */
  line: number | null;
  /** Column number (if found) */
  column: number | null;
  /** Error code (if found) */
  code: string | null;
  /** Error category */
  category: ErrorCategory;
  /** Severity */
  severity: ErrorSeverity;
  /** Human-readable message */
  message: string;
}

export interface ErrorSuggestion {
  /** The error this suggestion addresses */
  error: ParsedError;
  /** Suggested fix */
  fix: string;
  /** Confidence level (0-1) */
  confidence: number;
  /** Related files to check */
  relatedFiles: string[];
  /** Command to run (if applicable) */
  command: string | null;
}

export interface ErrorAnalysis {
  /** All parsed errors */
  errors: ParsedError[];
  /** Suggestions for fixes */
  suggestions: ErrorSuggestion[];
  /** Error count by category */
  byCategory: Record<ErrorCategory, number>;
  /** Total error count */
  totalErrors: number;
  /** Total warning count */
  totalWarnings: number;
  /** Whether analysis was successful */
  success: boolean;
}

// ---------------------------------------------------------------------------
// Error Patterns
// ---------------------------------------------------------------------------

const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  category: ErrorCategory;
  severity: ErrorSeverity;
  extractFile?: (match: RegExpMatchArray) => string | null;
  extractLine?: (match: RegExpMatchArray) => number | null;
  extractColumn?: (match: RegExpMatchArray) => number | null;
  extractCode?: (match: RegExpMatchArray) => string | null;
}> = [
  // TypeScript errors: "src/file.ts(10,5): error TS2345: ..."
  {
    pattern: /(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)/,
    category: "typescript",
    severity: "error",
    extractFile: (m) => m[1],
    extractLine: (m) => Number.parseInt(m[2], 10),
    extractColumn: (m) => Number.parseInt(m[3], 10),
    extractCode: (m) => m[4],
  },
  // TypeScript without column: "src/file.ts(10): error TS2345: ..."
  {
    pattern: /(.+?)\((\d+)\):\s+error\s+(TS\d+):\s+(.+)/,
    category: "typescript",
    severity: "error",
    extractFile: (m) => m[1],
    extractLine: (m) => Number.parseInt(m[2], 10),
    extractCode: (m) => m[3],
  },
  // ESLint: "src/file.ts\n  10:5  error  Some message  rule-name"
  {
    pattern: /\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s{2,}(\S+)/,
    category: "eslint",
    severity: "error",
    extractLine: (m) => Number.parseInt(m[1], 10),
    extractColumn: (m) => Number.parseInt(m[2], 10),
  },
  // Biome: "file.ts:10:5: lint/category/rule  message"
  {
    pattern: /(.+?):(\d+):(\d+):\s+lint\/(\S+)\s+(.+)/,
    category: "biome",
    severity: "error",
    extractFile: (m) => m[1],
    extractLine: (m) => Number.parseInt(m[2], 10),
    extractColumn: (m) => Number.parseInt(m[3], 10),
    extractCode: (m) => m[4],
  },
  // Test failures: "FAIL  path/to/test.test.ts > suite > test"
  {
    pattern: /FAIL\s+(.+?)(?:\s+>\s+.+)?$/,
    category: "test",
    severity: "error",
    extractFile: (m) => m[1].trim(),
  },
  // Build errors: "Error: ..."
  {
    pattern: /^(?:Build |ELIFECYCLE|Command failed).*Error[:\s]+(.+)/m,
    category: "build",
    severity: "error",
  },
  // Module not found: "Cannot find module 'X'"
  {
    pattern: /Cannot find module ['"](.+?)['"]/,
    category: "dependency",
    severity: "error",
  },
  // ENOENT: "ENOENT: no such file or directory, access '/path'"
  {
    pattern: /ENOENT:\s+no such file or directory.*'(.+?)'/,
    category: "runtime",
    severity: "error",
    extractFile: (m) => m[1],
  },
  // EACCES: "EACCES: permission denied"
  {
    pattern: /EACCES:\s+permission denied/,
    category: "permission",
    severity: "error",
  },
  // Network errors: "ECONNREFUSED", "fetch failed"
  {
    pattern: /(?:ECONNREFUSED|ENOTFOUND|fetch failed|ETIMEDOUT)/,
    category: "network",
    severity: "error",
  },
];

// ---------------------------------------------------------------------------
// Fix Suggestions
// ---------------------------------------------------------------------------

const FIX_SUGGESTIONS: Record<string, (error: ParsedError) => ErrorSuggestion | null> = {
  TS2307: (error) => ({
    error,
    fix: "Import not found. Check the import path and ensure the module is installed.",
    confidence: 0.9,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
  }),
  TS2322: (error) => ({
    error,
    fix: "Type mismatch. Check the expected type and ensure the value matches.",
    confidence: 0.8,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
  }),
  TS2345: (error) => ({
    error,
    fix: "Argument type mismatch. Verify the function signature and argument types.",
    confidence: 0.8,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
  }),
  TS2339: (error) => ({
    error,
    fix: "Property does not exist on type. Check the object structure or add the property.",
    confidence: 0.8,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
  }),
  TS7006: (error) => ({
    error,
    fix: "Parameter implicitly has 'any' type. Add an explicit type annotation.",
    confidence: 0.9,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
  }),
  noUnusedVariables: (error) => ({
    error,
    fix: "Unused variable. Remove it or prefix with underscore if intentionally unused.",
    confidence: 0.95,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
  }),
  organizeImports: (error) => ({
    error,
    fix: "Import statements could be sorted. Run the formatter to auto-fix.",
    confidence: 1.0,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: "npx biome check --fix --unsafe .",
  }),
  noNonNullAssertion: (error) => ({
    error,
    fix: "Non-null assertion used. Consider using optional chaining or null checks.",
    confidence: 0.7,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
  }),
};

// ---------------------------------------------------------------------------
// Main Functions
// ---------------------------------------------------------------------------

/**
 * Analyze error output from a command.
 */
export function analyzeErrors(
  output: string,
  cwd: string,
  _profile?: ProjectProfile,
  _fileIndex?: FileIndex,
): ErrorAnalysis {
  const lines = output.split("\n");
  const errors: ParsedError[] = [];
  const suggestions: ErrorSuggestion[] = [];
  const byCategory: Record<ErrorCategory, number> = {
    typescript: 0,
    eslint: 0,
    biome: 0,
    test: 0,
    build: 0,
    runtime: 0,
    dependency: 0,
    permission: 0,
    network: 0,
    unknown: 0,
  };

  for (const line of lines) {
    const parsed = parseLine(line, cwd);
    if (parsed) {
      errors.push(parsed);
      byCategory[parsed.category]++;

      // Find suggestions
      const suggestion = getSuggestion(parsed);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
  }

  const totalErrors = errors.filter((e) => e.severity === "error").length;
  const totalWarnings = errors.filter((e) => e.severity === "warning").length;

  return {
    errors,
    suggestions,
    byCategory,
    totalErrors,
    totalWarnings,
    success: errors.length === 0,
  };
}

/**
 * Parse a single line for errors.
 */
function parseLine(line: string, cwd: string): ParsedError | null {
  for (const {
    pattern,
    category,
    severity,
    extractFile,
    extractLine,
    extractColumn,
    extractCode,
  } of ERROR_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      const filePath = extractFile?.(match) || null;
      const lineNum = extractLine?.(match) || null;
      const column = extractColumn?.(match) || null;
      const code = extractCode?.(match) || null;

      // Normalize file path
      let normalizedPath = filePath;
      if (normalizedPath && !normalizedPath.startsWith("/") && !normalizedPath.match(/^[A-Z]:\\/)) {
        normalizedPath = join(cwd, normalizedPath);
      }

      return {
        raw: line.trim(),
        filePath: normalizedPath,
        line: lineNum,
        column,
        code,
        category,
        severity,
        message: line.trim(),
      };
    }
  }

  // Check for generic error patterns
  if (line.match(/\berror\b/i) && line.length > 10) {
    return {
      raw: line.trim(),
      filePath: null,
      line: null,
      column: null,
      code: null,
      category: "unknown",
      severity: line.match(/\berror\b/i) ? "error" : "warning",
      message: line.trim(),
    };
  }

  return null;
}

/**
 * Get a suggestion for an error.
 */
function getSuggestion(error: ParsedError): ErrorSuggestion | null {
  // Try exact code match
  if (error.code && FIX_SUGGESTIONS[error.code]) {
    return FIX_SUGGESTIONS[error.code](error);
  }

  // Try category-based suggestions
  switch (error.category) {
    case "typescript":
      return {
        error,
        fix: "TypeScript error. Check the type annotations and imports.",
        confidence: 0.5,
        relatedFiles: error.filePath ? [error.filePath] : [],
        command: "pnpm typecheck",
      };
    case "eslint":
    case "biome":
      return {
        error,
        fix: "Linting error. Run the formatter to auto-fix where possible.",
        confidence: 0.7,
        relatedFiles: error.filePath ? [error.filePath] : [],
        command: "npx biome check --fix --unsafe .",
      };
    case "test":
      return {
        error,
        fix: "Test failure. Check the test file and related implementation.",
        confidence: 0.6,
        relatedFiles: error.filePath ? [error.filePath] : [],
        command: "pnpm test",
      };
    case "dependency":
      return {
        error,
        fix: "Missing dependency. Install the required package.",
        confidence: 0.9,
        relatedFiles: [],
        command: "pnpm install",
      };
    case "permission":
      return {
        error,
        fix: "Permission denied. Check file permissions or run with appropriate privileges.",
        confidence: 0.8,
        relatedFiles: [],
        command: null,
      };
    case "network":
      return {
        error,
        fix: "Network error. Check your internet connection and firewall settings.",
        confidence: 0.7,
        relatedFiles: [],
        command: null,
      };
    default:
      return null;
  }
}

/**
 * Read and analyze a log file.
 */
export function analyzeLogFile(logPath: string, cwd: string): ErrorAnalysis | null {
  if (!existsSync(logPath)) return null;

  try {
    const content = readFileSync(logPath, "utf-8");
    return analyzeErrors(content, cwd);
  } catch {
    return null;
  }
}
