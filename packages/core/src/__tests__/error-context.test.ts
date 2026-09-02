/**
 * Error Context Tests
 *
 * Tests for buildErrorContext and getRelevantFailure functions.
 */

import { existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FailureMemory } from "../intelligence/failure-memory.js";
import { buildErrorContext, getRelevantFailure } from "../intelligence/error-context.js";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let FIXTURE_DIR = "/tmp/devbyai-test-placeholder";

function createFixture(): void {
  FIXTURE_DIR = join(
    tmpdir(),
    `devbyai-ctx-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(FIXTURE_DIR, { recursive: true });
}

function cleanupDir(dir: string): void {
  if (!existsSync(dir)) return;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name.toString()}`;
      if (entry.isDirectory()) {
        cleanupDir(fullPath);
      } else {
        try {
          unlinkSync(fullPath);
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
// buildErrorContext Tests
// ---------------------------------------------------------------------------

describe("buildErrorContext", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should build context from empty memory", () => {
    const memory = new FailureMemory(FIXTURE_DIR);
    const context = buildErrorContext(memory);

    expect(context.latestFailure).toBeNull();
    expect(context.recentFailures).toEqual([]);
    expect(context.totalFailures).toBe(0);
    expect(context.failureTypes).toEqual([]);
    expect(context.affectedFiles).toEqual([]);
  });

  it("should build context with failures", () => {
    const memory = new FailureMemory(FIXTURE_DIR);
    memory.record({
      type: "test",
      command: "pnpm test",
      exitCode: 1,
      message: "Test fail",
      failedFiles: ["a.ts"],
      relatedFiles: ["b.ts"],
      taskId: "001",
      rawOutput: "",
    });
    memory.record({
      type: "build",
      command: "pnpm build",
      exitCode: 1,
      message: "Build fail",
      failedFiles: ["c.ts"],
      relatedFiles: [],
      taskId: "001",
      rawOutput: "",
    });

    const context = buildErrorContext(memory);

    expect(context.latestFailure).toBeDefined();
    expect(context.recentFailures.length).toBe(2);
    expect(context.totalFailures).toBe(2);
    expect(context.failureTypes).toContain("test");
    expect(context.failureTypes).toContain("build");
    expect(context.affectedFiles).toContain("a.ts");
    expect(context.affectedFiles).toContain("b.ts");
    expect(context.affectedFiles).toContain("c.ts");
  });
});

// ---------------------------------------------------------------------------
// getRelevantFailure Tests
// ---------------------------------------------------------------------------

describe("getRelevantFailure", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should find failure for a matching file", () => {
    const memory = new FailureMemory(FIXTURE_DIR);
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "Auth fail",
      failedFiles: ["src/auth.ts"],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });

    const failure = getRelevantFailure(memory, "src/auth.ts");
    expect(failure).toBeDefined();
    expect(failure?.message).toBe("Auth fail");
  });

  it("should return latest failure when no match", () => {
    const memory = new FailureMemory(FIXTURE_DIR);
    memory.record({
      type: "build",
      command: null,
      exitCode: 1,
      message: "Build fail",
      failedFiles: ["src/other.ts"],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });

    const failure = getRelevantFailure(memory, "src/unrelated.ts");
    expect(failure).toBeDefined();
    expect(failure?.message).toBe("Build fail");
  });

  it("should return null for empty memory", () => {
    const memory = new FailureMemory(FIXTURE_DIR);
    const failure = getRelevantFailure(memory, "src/any.ts");
    expect(failure).toBeNull();
  });
});