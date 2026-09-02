/**
 * Validation Engine Tests
 *
 * Tests for the enhanced validation engine: plan creation, runs, and checks.
 */

import { existsSync, mkdirSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createValidationPlan,
  runSingleCheck,
  runValidation,
  getAvailableChecks,
} from "../intelligence/validation.js";
import { detectProjectProfile } from "../intelligence/project-profile.js";
import { createFileIndex } from "../intelligence/file-index.js";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let FIXTURE_DIR = "/tmp/devbyai-test-placeholder";

function createFixture(): void {
  FIXTURE_DIR = join(
    tmpdir(),
    `devbyai-validation-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(join(FIXTURE_DIR, "src"), { recursive: true });

  writeFileSync(
    join(FIXTURE_DIR, "package.json"),
    JSON.stringify({
      name: "test-project",
      devDependencies: { vitest: "^1.0.0", typescript: "^5.0.0" },
    }),
  );
  writeFileSync(join(FIXTURE_DIR, "tsconfig.json"), "{}");
  writeFileSync(join(FIXTURE_DIR, "src/index.ts"), "export const foo = 'bar';");
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
// Validation Plan Tests
// ---------------------------------------------------------------------------

describe("createValidationPlan", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should create a plan with standard mode", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const plan = createValidationPlan(profile, "standard");

    expect(plan.mode).toBe("standard");
    expect(plan.totalChecks).toBeGreaterThan(0);
    expect(plan.checks.length).toBe(plan.totalChecks);
  });

  it("should create a plan with quick mode", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const plan = createValidationPlan(profile, "quick");

    expect(plan.mode).toBe("quick");
    expect(plan.checks.every((c) => c.type === "typecheck" || c.type === "test")).toBe(true);
  });

  it("should create a plan with full mode", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const plan = createValidationPlan(profile, "full");

    expect(plan.mode).toBe("full");
    expect(plan.totalChecks).toBeGreaterThanOrEqual(1);
  });

  it("should include check details", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const plan = createValidationPlan(profile);

    for (const check of plan.checks) {
      expect(check.type).toBeDefined();
      expect(check.name).toBeDefined();
      expect(check.command).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Run Tests (enhanced)
// ---------------------------------------------------------------------------

describe("runValidation (enhanced)", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should return result with runId", () => {
    const result = runValidation({
      cwd: FIXTURE_DIR,
      checkTypes: [],
    });

    expect(result.runId).toBeDefined();
    expect(result.runId.startsWith("vr-")).toBe(true);
  });

  it("should return result with mode", () => {
    const result = runValidation({
      cwd: FIXTURE_DIR,
      mode: "quick",
      checkTypes: [],
    });

    expect(result.mode).toBe("quick");
  });

  it("should return result with timestamps", () => {
    const result = runValidation({
      cwd: FIXTURE_DIR,
      checkTypes: [],
    });

    expect(result.startedAt).toBeGreaterThan(0);
    expect(result.completedAt).toBeGreaterThanOrEqual(result.startedAt);
  });

  it("should support backward-compatible signature", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const result = runValidation(FIXTURE_DIR, profile, fileIndex, []);

    expect(result.runId).toBeDefined();
    expect(result.mode).toBe("standard");
  });

  it("should run no checks when empty checkTypes provided", () => {
    const result = runValidation({
      cwd: FIXTURE_DIR,
      checkTypes: [],
    });

    expect(result.checks.length).toBe(0);
    expect(result.status).toBe("passed");
  });
});

// ---------------------------------------------------------------------------
// Single Check Tests
// ---------------------------------------------------------------------------

describe("runSingleCheck", () => {
  it("should return null for unknown check type", () => {
    // @ts-expect-error testing invalid type
    const result = runSingleCheck(FIXTURE_DIR, "nonexistent");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Available Checks Tests
// ---------------------------------------------------------------------------

describe("getAvailableChecks", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should return available checks for project", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const checks = getAvailableChecks(profile);

    expect(Array.isArray(checks)).toBe(true);
    expect(checks.length).toBeGreaterThan(0);
  });
});