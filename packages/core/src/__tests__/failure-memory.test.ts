/**
 * Failure Memory Tests
 *
 * Tests for the FailureMemory class that tracks validation failures.
 */

import { existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FailureMemory } from "../intelligence/failure-memory.js";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let FIXTURE_DIR = "/tmp/devbyai-test-placeholder";

function createFixture(): void {
  FIXTURE_DIR = join(
    tmpdir(),
    `devbyai-failure-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
// Failure Memory Tests
// ---------------------------------------------------------------------------

describe("FailureMemory", () => {
  let memory: FailureMemory;

  beforeEach(() => {
    createFixture();
    memory = new FailureMemory(FIXTURE_DIR);
  });

  afterEach(() => {
    cleanupFixture();
  });

  it("should record failures", () => {
    const record = memory.record({
      type: "test",
      command: "pnpm test",
      exitCode: 1,
      message: "Test failed",
      failedFiles: ["src/auth.test.ts"],
      relatedFiles: ["src/auth.ts"],
      taskId: "001",
      rawOutput: "FAIL src/auth.test.ts",
    });

    expect(record.id).toBeDefined();
    expect(record.timestamp).toBeGreaterThan(0);
    expect(record.type).toBe("test");
    expect(record.message).toBe("Test failed");
  });

  it("should get recent failures", () => {
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "Fail 1",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });
    memory.record({
      type: "build",
      command: "pnpm build",
      exitCode: 1,
      message: "Fail 2",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });

    const recent = memory.getRecent(10);
    expect(recent.length).toBe(2);
    expect(recent[0].message).toBe("Fail 2"); // most recent first
  });

  it("should get latest failure", () => {
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "First",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });
    memory.record({
      type: "build",
      command: null,
      exitCode: 1,
      message: "Second",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });

    const latest = memory.getLatest();
    expect(latest?.message).toBe("Second");
  });

  it("should count failures", () => {
    expect(memory.count()).toBe(0);
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "Fail",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });
    expect(memory.count()).toBe(1);
  });

  it("should count by type", () => {
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "T1",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "T2",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });
    memory.record({
      type: "build",
      command: null,
      exitCode: 1,
      message: "B1",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });

    const counts = memory.countByType();
    expect(counts.test).toBe(2);
    expect(counts.build).toBe(1);
  });

  it("should get affected files", () => {
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "Fail",
      failedFiles: ["src/a.ts"],
      relatedFiles: ["src/b.ts"],
      taskId: null,
      rawOutput: "",
    });

    const files = memory.getAffectedFiles();
    expect(files).toContain("src/a.ts");
    expect(files).toContain("src/b.ts");
  });

  it("should persist to disk", () => {
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "Persistent",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });

    const memory2 = new FailureMemory(FIXTURE_DIR);
    expect(memory2.count()).toBe(1);
    expect(memory2.getLatest()?.message).toBe("Persistent");
  });

  it("should clear all failures", () => {
    memory.record({
      type: "test",
      command: null,
      exitCode: 1,
      message: "Fail",
      failedFiles: [],
      relatedFiles: [],
      taskId: null,
      rawOutput: "",
    });
    memory.clear();
    expect(memory.count()).toBe(0);
  });

  it("should handle empty state", () => {
    expect(memory.getRecent()).toEqual([]);
    expect(memory.getLatest()).toBeNull();
    expect(memory.getAffectedFiles()).toEqual([]);
    expect(memory.countByType()).toEqual({});
  });
});