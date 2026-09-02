/**
 * Test Intelligence Tests
 *
 * Tests for test discovery: findRelevantTests and getTestCommand.
 */

import { existsSync, mkdirSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileIndex } from "../intelligence/file-index.js";
import { detectProjectProfile } from "../intelligence/project-profile.js";
import { findRelevantTests, getTestCommand } from "../intelligence/test-discovery.js";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let FIXTURE_DIR = "/tmp/devbyai-test-placeholder";

function createFixture(): void {
  FIXTURE_DIR = join(
    tmpdir(),
    `devbyai-ti-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(join(FIXTURE_DIR, "src"), { recursive: true });
  mkdirSync(join(FIXTURE_DIR, "__tests__"), { recursive: true });

  writeFileSync(
    join(FIXTURE_DIR, "package.json"),
    JSON.stringify({
      name: "test-project",
      devDependencies: { vitest: "^1.0.0" },
    }),
  );
  writeFileSync(join(FIXTURE_DIR, "tsconfig.json"), "{}");
  writeFileSync(join(FIXTURE_DIR, "src/auth.ts"), "export function auth() {}");
  writeFileSync(join(FIXTURE_DIR, "src/user.ts"), "export function user() {}");
  writeFileSync(
    join(FIXTURE_DIR, "__tests__/auth.test.ts"),
    "describe('auth', () => { it('works', () => {}) })",
  );
  writeFileSync(
    join(FIXTURE_DIR, "__tests__/auth.spec.ts"),
    "describe('auth spec', () => { it('works', () => {}) })",
  );
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
// findRelevantTests Tests
// ---------------------------------------------------------------------------

describe("findRelevantTests", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should find tests matching source file by name", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const tests = findRelevantTests("src/auth.ts", FIXTURE_DIR, profile, fileIndex);

    expect(tests.length).toBeGreaterThan(0);
    expect(tests.some((t) => t.path.includes("auth.test"))).toBe(true);
  });

  it("should find spec files too", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const tests = findRelevantTests("src/auth.ts", FIXTURE_DIR, profile, fileIndex);

    expect(tests.some((t) => t.path.includes("auth.spec"))).toBe(true);
  });

  it("should return empty for unmatched source", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const tests = findRelevantTests("src/nonexistent.ts", FIXTURE_DIR, profile, fileIndex);

    expect(tests.length).toBe(0);
  });

  it("should handle source with no tests", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const tests = findRelevantTests("src/user.ts", FIXTURE_DIR, profile, fileIndex);

    expect(tests.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getTestCommand Tests
// ---------------------------------------------------------------------------

describe("getTestCommand", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should generate command for test files", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);
    const tests = findRelevantTests("src/auth.ts", FIXTURE_DIR, profile, fileIndex);
    const command = getTestCommand(tests, profile);

    expect(command).toBeDefined();
    expect(command).toContain("auth");
  });

  it("should return null for empty test list", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const command = getTestCommand([], profile);
    expect(command).toBeNull();
  });
});