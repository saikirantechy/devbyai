/**
 * DEVBYAI Debug Agent
 *
 * Specialized agent for analyzing errors, finding related files,
 * and suggesting fixes based on error patterns.
 */

import type { Agent, AgentContext, AgentMetadata, AgentResult } from "../types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ErrorSeverity = "error" | "warning" | "info";

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

export interface FixSuggestion {
  /** The error this suggestion addresses */
  error: ParsedError;
  /** Suggested fix description */
  description: string;
  /** Confidence level (0-1) */
  confidence: number;
  /** Related files to check */
  relatedFiles: string[];
  /** Command to run (if applicable) */
  command: string | null;
  /** Whether the fix is safe to auto-apply */
  safeToAutoApply: boolean;
}

export interface RelatedFile {
  /** File path */
  path: string;
  /** Relationship type */
  relationship:
    | "same-directory"
    | "imports-error-file"
    | "imported-by-error-file"
    | "same-module"
    | "test-file"
    | "config-file";
  /** Relevance score (0-1) */
  relevance: number;
}

export interface DebugAgentResult {
  /** Parsed errors */
  errors: ParsedError[];
  /** Fix suggestions */
  suggestions: FixSuggestion[];
  /** Related files */
  relatedFiles: RelatedFile[];
  /** Debug steps to resolve */
  debugSteps: string[];
  /** Whether debugging was successful */
  success: boolean;
  /** Summary message */
  summary: string;
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
  // ESLint: "  10:5  error  Some message  rule-name"
  {
    pattern: /\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s{2,}(\S+)/,
    category: "eslint",
    severity: "error",
    extractLine: (m) => Number.parseInt(m[1], 10),
    extractColumn: (m) => Number.parseInt(m[2], 10),
  },
  // Biome: "file.ts:10:5: lint/category/rule  message"
  {
    pattern: /(.+?):(\d+):\d+:\s+lint\/(\S+)\s+(.+)/,
    category: "biome",
    severity: "error",
    extractFile: (m) => m[1],
    extractLine: (m) => Number.parseInt(m[2], 10),
    extractCode: (m) => m[3],
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

const FIX_SUGGESTIONS: Record<
  string,
  (error: ParsedError) => FixSuggestion
> = {
  TS2307: (error) => ({
    error,
    description:
      "Import not found. Check the import path and ensure the module is installed.",
    confidence: 0.9,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
    safeToAutoApply: false,
  }),
  TS2322: (error) => ({
    error,
    description:
      "Type mismatch. Check the expected type and ensure the value matches.",
    confidence: 0.8,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
    safeToAutoApply: false,
  }),
  TS2345: (error) => ({
    error,
    description:
      "Argument type mismatch. Verify the function signature and argument types.",
    confidence: 0.8,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
    safeToAutoApply: false,
  }),
  TS2339: (error) => ({
    error,
    description:
      "Property does not exist on type. Check the object structure or add the property.",
    confidence: 0.8,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
    safeToAutoApply: false,
  }),
  TS7006: (error) => ({
    error,
    description:
      "Parameter implicitly has 'any' type. Add an explicit type annotation.",
    confidence: 0.9,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
    safeToAutoApply: false,
  }),
  noUnusedVariables: (error) => ({
    error,
    description:
      "Unused variable. Remove it or prefix with underscore if intentionally unused.",
    confidence: 0.95,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: null,
    safeToAutoApply: false,
  }),
  organizeImports: (error) => ({
    error,
    description:
      "Import statements could be sorted. Run the formatter to auto-fix.",
    confidence: 1.0,
    relatedFiles: error.filePath ? [error.filePath] : [],
    command: "npx biome check --fix --unsafe .",
    safeToAutoApply: true,
  }),
};

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Parse error output into structured errors.
 */
export function parseErrors(output: string): ParsedError[] {
  const lines = output.split("\n");
  const errors: ParsedError[] = [];

  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) {
      errors.push(parsed);
    }
  }

  return errors;
}

/**
 * Parse a single line for errors.
 */
function parseLine(line: string): ParsedError | null {
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

      return {
        raw: line.trim(),
        filePath,
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
 * Find related files for errors.
 */
export function findRelatedFiles(
  errors: ParsedError[],
  projectFiles: string[],
): RelatedFile[] {
  const relatedFiles: RelatedFile[] = [];
  const processedFiles = new Set<string>();

  for (const error of errors) {
    if (!error.filePath) continue;

    const errorFile = error.filePath;

    // Skip if already processed
    if (processedFiles.has(errorFile)) continue;
    processedFiles.add(errorFile);

    // Find files in the same directory
    const errorDir = errorFile.includes("/")
      ? errorFile.slice(0, errorFile.lastIndexOf("/"))
      : ".";

    for (const file of projectFiles) {
      if (file === errorFile) continue;

      const fileDir = file.includes("/") ? file.slice(0, file.lastIndexOf("/")) : ".";

      // Same directory
      if (fileDir === errorDir) {
        relatedFiles.push({
          path: file,
          relationship: "same-directory",
          relevance: 0.7,
        });
      }

      // Same module (e.g., index.ts and index.test.ts)
      const errorBase = errorFile.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
      const fileBase = file.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
      if (errorBase === fileBase && file !== errorFile) {
        relatedFiles.push({
          path: file,
          relationship: "same-module",
          relevance: 0.9,
        });
      }

      // Test file
      if (
        file.includes(".test.") ||
        file.includes(".spec.") ||
        file.includes("__tests__/")
      ) {
        const testBase = file.split("/").pop()?.replace(/\.(test|spec)\.[^.]+$/, "") || "";
        if (errorBase === testBase) {
          relatedFiles.push({
            path: file,
            relationship: "test-file",
            relevance: 0.85,
          });
        }
      }

      // Config file
      if (
        file.includes("tsconfig") ||
        file.includes("package.json") ||
        file.includes("biome.json")
      ) {
        relatedFiles.push({
          path: file,
          relationship: "config-file",
          relevance: 0.5,
        });
      }
    }
  }

  // Remove duplicates and sort by relevance
  const uniqueFiles = new Map<string, RelatedFile>();
  for (const file of relatedFiles) {
    const existing = uniqueFiles.get(file.path);
    if (!existing || file.relevance > existing.relevance) {
      uniqueFiles.set(file.path, file);
    }
  }

  return Array.from(uniqueFiles.values())
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 20);
}

/**
 * Generate fix suggestions for errors.
 */
export function generateFixSuggestions(errors: ParsedError[]): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];

  for (const error of errors) {
    // Try exact code match
    if (error.code && FIX_SUGGESTIONS[error.code]) {
      suggestions.push(FIX_SUGGESTIONS[error.code](error));
      continue;
    }

    // Try category-based suggestions
    const suggestion = getCategorySuggestion(error);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}

/**
 * Get a suggestion based on error category.
 */
function getCategorySuggestion(error: ParsedError): FixSuggestion | null {
  switch (error.category) {
    case "typescript":
      return {
        error,
        description:
          "TypeScript error. Check the type annotations and imports.",
        confidence: 0.5,
        relatedFiles: error.filePath ? [error.filePath] : [],
        command: "pnpm typecheck",
        safeToAutoApply: false,
      };
    case "eslint":
    case "biome":
      return {
        error,
        description:
          "Linting error. Run the formatter to auto-fix where possible.",
        confidence: 0.7,
        relatedFiles: error.filePath ? [error.filePath] : [],
        command: "npx biome check --fix --unsafe .",
        safeToAutoApply: true,
      };
    case "test":
      return {
        error,
        description:
          "Test failure. Check the test file and related implementation.",
        confidence: 0.6,
        relatedFiles: error.filePath ? [error.filePath] : [],
        command: "pnpm test",
        safeToAutoApply: false,
      };
    case "dependency":
      return {
        error,
        description: "Missing dependency. Install the required package.",
        confidence: 0.9,
        relatedFiles: [],
        command: "pnpm install",
        safeToAutoApply: true,
      };
    case "permission":
      return {
        error,
        description:
          "Permission denied. Check file permissions or run with appropriate privileges.",
        confidence: 0.8,
        relatedFiles: [],
        command: null,
        safeToAutoApply: false,
      };
    case "network":
      return {
        error,
        description:
          "Network error. Check your internet connection and firewall settings.",
        confidence: 0.7,
        relatedFiles: [],
        command: null,
        safeToAutoApply: false,
      };
    default:
      return null;
  }
}

/**
 * Generate debug steps based on errors.
 */
export function generateDebugSteps(errors: ParsedError[]): string[] {
  const steps: string[] = [];
  const categories = [...new Set(errors.map((e) => e.category))];

  if (categories.length === 0) {
    steps.push("No errors found. Project looks healthy!");
    return steps;
  }

  // General steps
  steps.push("1. Analyze the error output above");
  steps.push("2. Identify the root cause of the error");

  // Category-specific steps
  if (categories.includes("typescript")) {
    steps.push("3. Check TypeScript error codes (TS prefix) for specific issues");
    steps.push("4. Run `pnpm typecheck` to see all type errors");
    steps.push("5. Fix type annotations and imports");
  }

  if (categories.includes("test")) {
    steps.push("3. Read the failing test file to understand expectations");
    steps.push("4. Check the source file being tested");
    steps.push("5. Run the test in isolation to see exact error");
  }

  if (categories.includes("build")) {
    steps.push("3. Check build configuration (tsconfig.json)");
    steps.push("4. Run `pnpm install` to ensure dependencies are installed");
    steps.push("5. Clean and rebuild: `pnpm clean && pnpm build`");
  }

  if (categories.includes("eslint") || categories.includes("biome")) {
    steps.push("3. Run auto-fix: `npx biome check --fix --unsafe .`");
    steps.push("4. Review and fix remaining issues manually");
  }

  if (categories.includes("dependency")) {
    steps.push("3. Check import paths for typos");
    steps.push("4. Run `pnpm install` to install missing packages");
  }

  // Final steps
  steps.push(`${steps.length + 1}. Verify the fix by running the relevant command`);
  steps.push(`${steps.length + 2}. Run tests to ensure no regressions`);

  return steps;
}

// ---------------------------------------------------------------------------
// Debug Agent
// ---------------------------------------------------------------------------

export const debuggerMetadata: AgentMetadata = {
  id: "debugger",
  name: "Debugger",
  description:
    "Analyzes errors, finds related files, and suggests fixes based on patterns",
  role: "debugger",
  capabilities: [
    "error analysis",
    "related file discovery",
    "fix suggestions",
    "debug workflows",
    "pattern recognition",
    "failure context",
  ],
  supportedPhases: ["review", "test"],
};

export class DebugAgent implements Agent {
  readonly metadata = debuggerMetadata;

  async execute(context: AgentContext): Promise<AgentResult> {
    const { request, previousResults, cwd } = context;

    // Collect error output from previous results or the request itself
    let errorOutput = this.collectErrorOutput(request, previousResults);

    // If no errors found in previous results, try to detect validation context
    if (!errorOutput) {
      errorOutput = this.collectValidationContext(previousResults);
    }

    if (!errorOutput) {
      return {
        agentId: this.metadata.id,
        success: true,
        output: this.formatNoErrors(),
        suggestedNext: "explorer",
      };
    }

    // Parse errors
    const errors = parseErrors(errorOutput);

    // Find related files (use request as hint for project files)
    const projectFiles = this.extractFileHints(request);
    const relatedFiles = findRelatedFiles(errors, projectFiles);

    // Generate fix suggestions
    const suggestions = generateFixSuggestions(errors);

    // Generate debug steps
    const debugSteps = generateDebugSteps(errors);

    // Format output
    const output = this.formatDebugReport(
      errors,
      relatedFiles,
      suggestions,
      debugSteps,
      cwd,
    );

    return {
      agentId: this.metadata.id,
      success: true,
      output,
      suggestedNext: suggestions.some((s) => s.safeToAutoApply)
        ? "builder"
        : "explorer",
    };
  }

  /**
   * Collect error output from context.
   */
  private collectErrorOutput(
    request: string,
    previousResults: Array<{ phase: string; output: string }>,
  ): string | null {
    // Check previous results for error output
    for (const result of previousResults) {
      if (
        result.output.toLowerCase().includes("error") ||
        result.output.toLowerCase().includes("fail")
      ) {
        return result.output;
      }
    }

    // Check if the request itself contains error output
    if (
      request.toLowerCase().includes("error") ||
      request.toLowerCase().includes("fail") ||
      request.toLowerCase().includes("cannot find") ||
      request.toLowerCase().includes("enoent") ||
      request.toLowerCase().includes("eacces") ||
      request.toLowerCase().includes("econnrefused")
    ) {
      return request;
    }

    // Try to parse the request as error output directly
    const testErrors = parseErrors(request);
    if (testErrors.length > 0) {
      return request;
    }

    return null;
  }

  /**
   * Collect validation context from previous pipeline results.
   */
  private collectValidationContext(
    previousResults: Array<{ phase: string; output: string }>,
  ): string | null {
    for (const result of previousResults) {
      const output = result.output.toLowerCase();
      if (
        output.includes("validation") ||
        output.includes("typecheck") ||
        (output.includes("test") &&
          (output.includes("fail") || output.includes("error")))
      ) {
        return result.output;
      }
    }
    return null;
  }

  /**
   * Extract file hints from request text.
   */
  private extractFileHints(request: string): string[] {
    const hints: string[] = [];
    const filePattern = /[\w./-]+\.(ts|tsx|js|jsx|json|md)/g;
    let match = filePattern.exec(request);
    while (match) {
      hints.push(match[0]);
      match = filePattern.exec(request);
    }
    return hints;
  }

  /**
   * Format output when no errors are found.
   */
  private formatNoErrors(): string {
    const lines: string[] = [];
    lines.push("DEBUG AGENT");
    lines.push("");
    lines.push("✓ No errors detected in the provided output.");
    lines.push("");
    lines.push("The project appears to be healthy.");
    lines.push("");
    lines.push("Tip: Run validation checks to verify project health:");
    lines.push("  - Type checking: pnpm typecheck");
    lines.push("  - Linting: npx biome check packages/ apps/");
    lines.push("  - Testing: pnpm test");
    return lines.join("\n");
  }

  /**
   * Resolve a relative file path against the working directory.
   */
  private resolvePath(path: string, cwd: string): string {
    if (!path) return path;
    if (path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path)) {
      return path;
    }
    return `${cwd}/${path.startsWith("./") ? path.slice(2) : path}`;
  }

  /**
   * Format the debug report.
   */
  private formatDebugReport(
    errors: ParsedError[],
    relatedFiles: RelatedFile[],
    suggestions: FixSuggestion[],
    debugSteps: string[],
    cwd: string,
  ): string {
    const lines: string[] = [];

    // Header
    lines.push("DEBUG AGENT");
    lines.push("");

    // Error summary
    const errorsByCategory = new Map<ErrorCategory, ParsedError[]>();
    for (const error of errors) {
      const existing = errorsByCategory.get(error.category) || [];
      existing.push(error);
      errorsByCategory.set(error.category, existing);
    }

    lines.push(`Found ${errors.length} error(s) across ${errorsByCategory.size} category(ies):`);
    lines.push("");

    // Errors by category
    for (const [category, categoryErrors] of errorsByCategory) {
      lines.push(`  ${category.toUpperCase()} (${categoryErrors.length})`);
      for (const error of categoryErrors.slice(0, 5)) {
        const location = error.filePath
          ? ` at ${this.resolvePath(error.filePath, cwd)}${error.line ? `:${error.line}` : ""}`
          : "";
        const code = error.code ? ` [${error.code}]` : "";
        lines.push(`    - ${error.message.slice(0, 80)}${code}${location}`);
      }
      if (categoryErrors.length > 5) {
        lines.push(`    ... and ${categoryErrors.length - 5} more`);
      }
      lines.push("");
    }

    // Related files
    lines.push("RELATED FILES");
    lines.push("");
    if (relatedFiles.length > 0) {
      for (const file of relatedFiles.slice(0, 10)) {
        lines.push(
          `  ${this.resolvePath(file.path, cwd)} (${file.relationship}, relevance: ${file.relevance.toFixed(2)})`,
        );
      }
    } else {
      lines.push("  No related files found in the current context.");
      lines.push("  Provide project file paths to enable related file discovery.");
    }
    lines.push("");

    // Fix suggestions
    if (suggestions.length > 0) {
      lines.push("FIX SUGGESTIONS");
      lines.push("");
      for (const suggestion of suggestions.slice(0, 5)) {
        const autoApply = suggestion.safeToAutoApply ? " [auto-fixable]" : "";
        lines.push(`  • ${suggestion.description}${autoApply}`);
        if (suggestion.command) {
          lines.push(`    Command: ${suggestion.command}`);
        }
        lines.push(`    Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
        lines.push("");
      }
    }

    // Debug steps
    if (debugSteps.length > 0) {
      lines.push("DEBUG STEPS");
      lines.push("");
      for (const step of debugSteps) {
        lines.push(`  ${step}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }
}
