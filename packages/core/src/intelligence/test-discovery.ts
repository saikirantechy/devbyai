/**
 * DEVBYAI Test Discovery
 *
 * Discovers test files, understands test patterns, and provides test insights.
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { FileIndex, FileIndexEntry, ProjectProfile } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TestFramework =
  | "vitest"
  | "jest"
  | "mocha"
  | "playwright"
  | "cypress"
  | "node"
  | "unknown";

export interface TestFile {
  /** Relative path to test file */
  path: string;
  /** Test framework detected */
  framework: TestFramework;
  /** Test file type */
  type: "unit" | "integration" | "e2e" | "unknown";
  /** Number of test cases (estimated) */
  testCount: number;
  /** Test suite names (if parseable) */
  suites: string[];
  /** Related source file (if determinable) */
  relatedSource: string | null;
}

export interface TestSuite {
  /** Suite name */
  name: string;
  /** Test cases in this suite */
  tests: string[];
  /** Nested suites */
  children: TestSuite[];
}

export interface TestDiscoveryResult {
  /** All test files found */
  testFiles: TestFile[];
  /** Test files by framework */
  byFramework: Map<TestFramework, TestFile[]>;
  /** Test files by type */
  byType: Map<string, TestFile[]>;
  /** Total test count (estimated) */
  totalTests: number;
  /** Test command for this project */
  testCommand: string | null;
  /** Source files without tests */
  untestedFiles: FileIndexEntry[];
  /** Coverage estimate */
  coverageEstimate: number;
}

// ---------------------------------------------------------------------------
// Framework Detection
// ---------------------------------------------------------------------------

const TEST_FRAMEWORK_PATTERNS: Array<{ pattern: RegExp; framework: TestFramework }> = [
  { pattern: /\.test\.(ts|tsx|js|jsx)$/, framework: "vitest" },
  { pattern: /\.spec\.(ts|tsx|js|jsx)$/, framework: "vitest" },
  { pattern: /\.test\.(ts|tsx|js|jsx)$/, framework: "jest" },
  { pattern: /\.spec\.(ts|tsx|js|jsx)$/, framework: "jest" },
  { pattern: /\.test\.(ts|tsx|js|jsx)$/, framework: "mocha" },
  { pattern: /\.spec\.(ts|tsx|js|jsx)$/, framework: "mocha" },
  { pattern: /\.e2e\.(ts|tsx|js|jsx)$/, framework: "playwright" },
  { pattern: /\.cy\.(ts|tsx|js|jsx)$/, framework: "cypress" },
];

const TEST_DIR_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /\/__tests__\//, type: "unit" },
  { pattern: /\/test\//, type: "unit" },
  { pattern: /\/tests\//, type: "unit" },
  { pattern: /\/spec\//, type: "unit" },
  { pattern: /\/e2e\//, type: "e2e" },
  { pattern: /\/cypress\//, type: "e2e" },
  { pattern: /\/__integration__\//, type: "integration" },
  { pattern: /\/integration\//, type: "integration" },
];

// ---------------------------------------------------------------------------
// Main Functions
// ---------------------------------------------------------------------------

/**
 * Discover test files in the workspace.
 */
export function discoverTests(
  cwd: string,
  profile: ProjectProfile,
  fileIndex: FileIndex,
): TestDiscoveryResult {
  const testFiles: TestFile[] = [];
  const byFramework = new Map<TestFramework, TestFile[]>();
  const byType = new Map<string, TestFile[]>();

  // Find test files from index
  for (const file of fileIndex.testFiles) {
    const testFile = analyzeTestFile(cwd, file, profile);
    testFiles.push(testFile);

    // Group by framework
    const framework = testFile.framework;
    if (!byFramework.has(framework)) byFramework.set(framework, []);
    byFramework.get(framework)?.push(testFile);

    // Group by type
    const type = testFile.type;
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type)?.push(testFile);
  }

  // Count total tests
  const totalTests = testFiles.reduce((sum, tf) => sum + tf.testCount, 0);

  // Determine test command
  const testCommand = determineTestCommand(profile);

  // Find untested source files
  const untestedFiles = findUntestedFiles(fileIndex, testFiles);

  // Estimate coverage
  const coverageEstimate =
    fileIndex.sourceFiles.length > 0
      ? (fileIndex.testFiles.length / fileIndex.sourceFiles.length) * 100
      : 0;

  return {
    testFiles,
    byFramework,
    byType,
    totalTests,
    testCommand,
    untestedFiles,
    coverageEstimate: Math.min(100, coverageEstimate),
  };
}

/**
 * Analyze a single test file.
 */
function analyzeTestFile(cwd: string, file: FileIndexEntry, profile: ProjectProfile): TestFile {
  const framework = detectFramework(file, profile);
  const type = detectTestType(file);
  const { testCount, suites } = parseTestContent(cwd, file.path);
  const relatedSource = findRelatedSource(file, profile);

  return {
    path: file.path,
    framework,
    type,
    testCount,
    suites,
    relatedSource,
  };
}

/**
 * Detect the test framework for a file.
 */
function detectFramework(file: FileIndexEntry, profile: ProjectProfile): TestFramework {
  // Use project-level detection first
  if (profile.testFramework) {
    const framework = profile.testFramework.toLowerCase();
    if (framework.includes("vitest")) return "vitest";
    if (framework.includes("jest")) return "jest";
    if (framework.includes("mocha")) return "mocha";
    if (framework.includes("playwright")) return "playwright";
    if (framework.includes("cypress")) return "cypress";
  }

  // Fallback to file patterns
  for (const { pattern, framework } of TEST_FRAMEWORK_PATTERNS) {
    if (pattern.test(file.path)) return framework;
  }

  return "unknown";
}

/**
 * Detect the test type from file location.
 */
function detectTestType(file: FileIndexEntry): "unit" | "integration" | "e2e" | "unknown" {
  for (const { pattern, type } of TEST_DIR_PATTERNS) {
    if (pattern.test(file.path)) {
      return type as "unit" | "integration" | "e2e";
    }
  }

  // Default based on file name
  if (file.path.includes(".e2e.")) return "e2e";
  if (file.path.includes(".integration.")) return "integration";

  return "unit";
}

/**
 * Parse test content to count tests and extract suite names.
 */
function parseTestContent(cwd: string, filePath: string): { testCount: number; suites: string[] } {
  const fullPath = join(cwd, filePath);

  if (!existsSync(fullPath)) {
    return { testCount: 0, suites: [] };
  }

  try {
    const content = readFileSync(fullPath, "utf-8");

    // Count test cases (it, test, describe patterns)
    const itMatches = content.match(/\b(?:it|test)\s*\(/g) || [];
    const _describeMatches = content.match(/\bdescribe\s*\(/g) || [];

    // Extract suite names
    const suites: string[] = [];
    const suitePattern = /describe\s*\(\s*["'`]([^"'`]+)["'`]/g;
    let match: RegExpExecArray | null = suitePattern.exec(content);
    while (match !== null) {
      if (match[1]) suites.push(match[1]);
      match = suitePattern.exec(content);
    }

    return {
      testCount: itMatches.length,
      suites,
    };
  } catch {
    return { testCount: 0, suites: [] };
  }
}

/**
 * Find the related source file for a test.
 */
function findRelatedSource(testFile: FileIndexEntry, _profile: ProjectProfile): string | null {
  const fileName = basename(testFile.path);
  const dir = testFile.directory;

  // Common patterns:
  // src/foo.test.ts -> src/foo.ts
  // src/__tests__/foo.test.ts -> src/foo.ts
  // tests/foo.test.ts -> src/foo.ts (if exists)

  const sourcePatterns = [
    // Same directory, remove test suffix
    fileName
      .replace(/\.test\./, ".")
      .replace(/\.spec\./, "."),
    // One level up from __tests__
    fileName
      .replace(/\.test\./, ".")
      .replace(/\.spec\./, "."),
  ];

  // Try to find in the same directory or parent
  for (const pattern of sourcePatterns) {
    const candidates = [
      join(dir, pattern),
      join(dir, "..", pattern),
      join(dir, "..", "src", pattern),
    ];

    for (const candidate of candidates) {
      // Normalize path
      const normalized = candidate.replace(/\\/g, "/");
      if (normalized.includes(".test.") || normalized.includes(".spec.")) continue;
      return normalized;
    }
  }

  return null;
}

/**
 * Determine the test command for the project.
 */
function determineTestCommand(profile: ProjectProfile): string | null {
  if (profile.testFramework) {
    const fw = profile.testFramework.toLowerCase();
    if (fw.includes("vitest")) return "pnpm test";
    if (fw.includes("jest")) return "pnpm test";
    if (fw.includes("mocha")) return "pnpm test";
    if (fw.includes("playwright")) return "pnpm test:e2e";
    if (fw.includes("cypress")) return "pnpm test:e2e";
  }

  if (profile.packageManager === "pnpm") return "pnpm test";
  if (profile.packageManager === "npm") return "npm test";
  if (profile.packageManager === "yarn") return "yarn test";
  if (profile.packageManager === "bun") return "bun test";

  return null;
}

/**
 * Find test files relevant to a given source file.
 * Uses heuristic path matching to find corresponding test files.
 */
export function findRelevantTests(
  sourceFilePath: string,
  cwd: string,
  profile: ProjectProfile,
  fileIndex: FileIndex,
): TestFile[] {
  const relevantTests: TestFile[] = [];

  // Normalize path separators
  const normalizedSource = sourceFilePath.replace(/\\/g, "/");

  // Extract base name without extension
  const baseName =
    normalizedSource.split("/").pop()?.replace(/\.[^.]+$/, "") || "";

  if (!baseName) return [];

  // Check all test files in the index
  for (const testFileEntry of fileIndex.testFiles) {
    const normalizedTest = testFileEntry.path.replace(/\\/g, "/");
    const testBaseName =
      normalizedTest
        .split("/")
        .pop()
        ?.replace(/\.(test|spec)\.[^.]+$/, "") || "";

    if (testBaseName === baseName) {
      const testFile = analyzeTestFile(cwd, testFileEntry, profile);
      relevantTests.push(testFile);
    }
  }

  // Also check for test files in test directories that match by name pattern
  for (const testFileEntry of fileIndex.testFiles) {
    const normalizedTest = testFileEntry.path.replace(/\\/g, "/");

    // Already found this file
    if (relevantTests.some((t) => t.path === testFileEntry.path)) continue;

    // Check if test file imports or references the source
    try {
      const fullPath = join(cwd, testFileEntry.path);
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, "utf-8");
        if (content.includes(baseName)) {
          const testFile = analyzeTestFile(cwd, testFileEntry, profile);
          relevantTests.push(testFile);
        }
      }
    } catch {
      // skip unreadable files
    }
  }

  return relevantTests;
}

/**
 * Get the command to run specific test files.
 */
export function getTestCommand(
  testFiles: TestFile[],
  profile: ProjectProfile,
): string | null {
  if (testFiles.length === 0) return null;

  const testCommand = determineTestCommand(profile);
  if (!testCommand) return null;

  // Append test file paths to the command
  const filePaths = testFiles.map((f) => f.path).join(" ");
  return `${testCommand} ${filePaths}`;
}

/**
 * Find source files without corresponding tests.
 */
function findUntestedFiles(fileIndex: FileIndex, testFiles: TestFile[]): FileIndexEntry[] {
  const testedSources = new Set(
    testFiles.map((tf) => tf.relatedSource).filter((s): s is string => s !== null),
  );

  return fileIndex.sourceFiles.filter((file) => {
    // Skip test files themselves
    if (file.isTest) return false;

    // Check if this source has a corresponding test
    const hasTest = testedSources.has(file.path);
    return !hasTest;
  });
}
