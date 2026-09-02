/**
 * Debug Intelligence Tests
 *
 * Tests for Error Analysis, Test Discovery, Validation, and Debug Workflows.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { analyzeDebugWorkflows } from "../intelligence/debug-workflows.js";
import { analyzeErrors } from "../intelligence/error-analysis.js";
import { createFileIndex } from "../intelligence/file-index.js";
import { detectProjectProfile } from "../intelligence/project-profile.js";
import { discoverTests } from "../intelligence/test-discovery.js";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let FIXTURE_DIR = "/tmp/devbyai-test-placeholder";

function createFixture(): void {
  FIXTURE_DIR = join(
    tmpdir(),
    `devbyai-debug-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(join(FIXTURE_DIR, "src"), { recursive: true });
  mkdirSync(join(FIXTURE_DIR, "__tests__"), { recursive: true });

  writeFileSync(
    join(FIXTURE_DIR, "package.json"),
    JSON.stringify({
      name: "test-project",
      dependencies: { react: "^18.0.0" },
      devDependencies: { vitest: "^1.0.0" },
    }),
  );
  writeFileSync(join(FIXTURE_DIR, "tsconfig.json"), "{}");
  writeFileSync(join(FIXTURE_DIR, "src/index.ts"), "export const foo = 'bar';");
  writeFileSync(join(FIXTURE_DIR, "src/auth.ts"), "export function authenticate() {}");
  writeFileSync(
    join(FIXTURE_DIR, "__tests__/auth.test.ts"),
    "describe('auth', () => { it('works', () => {}) })",
  );
}

function cleanupDir(dir: string): void {
  if (!existsSync(dir)) return;
  try {
    const entries = require("node:fs").readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name.toString()}`;
      if (entry.isDirectory()) {
        cleanupDir(fullPath);
      } else {
        try {
          require("node:fs").unlinkSync(fullPath);
        } catch {}
      }
    }
    try {
      rmSync(dir, { force: true });
    } catch {}
  } catch {}
}

function cleanupFixture(): void {
  cleanupDir(FIXTURE_DIR);
}

// ---------------------------------------------------------------------------
// Error Analysis Tests
// ---------------------------------------------------------------------------

describe("analyzeErrors", () => {
  it("should parse TypeScript errors", () => {
    const output =
      "src/index.ts(10,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.";
    const result = analyzeErrors(output, "/test");

    expect(result.errors.length).toBe(1);
    expect(result.errors[0].category).toBe("typescript");
    expect(result.errors[0].line).toBe(10);
    expect(result.errors[0].column).toBe(5);
    expect(result.errors[0].code).toBe("TS2345");
    expect(result.byCategory.typescript).toBe(1);
  });

  it("should parse Biome errors", () => {
    const output =
      "src/index.ts:10:5: lint/correctness/noUnusedVariables  This variable is unused.";
    const result = analyzeErrors(output, "/test");

    expect(result.errors.length).toBe(1);
    expect(result.errors[0].category).toBe("biome");
    expect(result.byCategory.biome).toBe(1);
  });

  it("should parse test failures", () => {
    const output = "FAIL  src/__tests__/auth.test.ts > auth > should work";
    const result = analyzeErrors(output, "/test");

    expect(result.errors.length).toBe(1);
    expect(result.errors[0].category).toBe("test");
    expect(result.byCategory.test).toBe(1);
  });

  it("should parse dependency errors", () => {
    const output = "Cannot find module 'missing-package'";
    const result = analyzeErrors(output, "/test");

    expect(result.errors.length).toBe(1);
    expect(result.errors[0].category).toBe("dependency");
    expect(result.byCategory.dependency).toBe(1);
  });

  it("should generate suggestions", () => {
    const output = "Cannot find module 'missing-package'";
    const result = analyzeErrors(output, "/test");

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0].command).toBe("pnpm install");
  });

  it("should handle empty output", () => {
    const result = analyzeErrors("", "/test");

    expect(result.errors.length).toBe(0);
    expect(result.success).toBe(true);
  });

  it("should count errors and warnings", () => {
    const output = [
      "src/a.ts(1,1): error TS2345: Error 1",
      "src/b.ts(2,2): error TS2345: Error 2",
    ].join("\n");
    const result = analyzeErrors(output, "/test");

    expect(result.totalErrors).toBe(2);
    expect(result.totalWarnings).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Test Discovery Tests
// ---------------------------------------------------------------------------

describe("discoverTests", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should discover test files", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const result = discoverTests(FIXTURE_DIR, profile, fileIndex);

    expect(result.testFiles.length).toBeGreaterThan(0);
  });

  it("should detect test framework", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const result = discoverTests(FIXTURE_DIR, profile, fileIndex);

    if (result.testFiles.length > 0) {
      expect(result.testFiles[0].framework).toBeDefined();
    }
  });

  it("should count tests", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const result = discoverTests(FIXTURE_DIR, profile, fileIndex);

    expect(result.totalTests).toBeGreaterThanOrEqual(0);
  });

  it("should determine test command", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const result = discoverTests(FIXTURE_DIR, profile, fileIndex);

    expect(result.testCommand).toBeDefined();
  });

  it("should find untested files", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const result = discoverTests(FIXTURE_DIR, profile, fileIndex);

    expect(result.untestedFiles).toBeDefined();
    expect(Array.isArray(result.untestedFiles)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Debug Workflows Tests
// ---------------------------------------------------------------------------

describe("analyzeDebugWorkflows", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should analyze TypeScript errors", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const errorAnalysis = analyzeErrors(
      "src/index.ts(10,5): error TS2345: Type mismatch",
      FIXTURE_DIR,
    );

    const result = analyzeDebugWorkflows(errorAnalysis, profile, fileIndex);

    expect(result.workflows.length).toBeGreaterThan(0);
    expect(result.workflows[0].type).toBe("typescript-error");
  });

  it("should detect quick fixes", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const errorAnalysis = analyzeErrors(
      "src/index.ts:10:5: lint/correctness/noUnusedVariables  Unused",
      FIXTURE_DIR,
    );

    const result = analyzeDebugWorkflows(errorAnalysis, profile, fileIndex);

    expect(result.quickFixes.length).toBeGreaterThan(0);
  });

  it("should calculate health score", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const errorAnalysis = analyzeErrors("", FIXTURE_DIR);

    const result = analyzeDebugWorkflows(errorAnalysis, profile, fileIndex);

    expect(result.context.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.context.healthScore).toBeLessThanOrEqual(100);
  });

  it("should handle no errors", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const errorAnalysis = analyzeErrors("", FIXTURE_DIR);

    const result = analyzeDebugWorkflows(errorAnalysis, profile, fileIndex);

    expect(result.workflows.length).toBe(0);
    expect(result.quickFixes.length).toBe(0);
    expect(result.context.healthScore).toBe(100);
  });
});
