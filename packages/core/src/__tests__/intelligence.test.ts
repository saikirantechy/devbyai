/**
 * Intelligence System Tests
 *
 * Tests for Project Profile, File Index, Context Engine, Task Memory, and Session Context.
 */

import { existsSync, mkdirSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildContext } from "../intelligence/context-engine.js";
import { createFileIndex, findFiles } from "../intelligence/file-index.js";
import { detectProjectProfile } from "../intelligence/project-profile.js";
import { SessionManager } from "../intelligence/session-context.js";
import { TaskMemory } from "../intelligence/task-memory.js";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let FIXTURE_DIR = "/tmp/devbyai-test-placeholder";

function createFixture(): void {
  FIXTURE_DIR = join(tmpdir(), `devbyai-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(join(FIXTURE_DIR, "src"), { recursive: true });
  mkdirSync(join(FIXTURE_DIR, "tests"), { recursive: true });
  mkdirSync(join(FIXTURE_DIR, "node_modules"), { recursive: true }); // Should be excluded

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
  writeFileSync(join(FIXTURE_DIR, "tests/auth.test.ts"), "describe('auth', () => {})");
  writeFileSync(join(FIXTURE_DIR, "README.md"), "# Test Project");
  writeFileSync(join(FIXTURE_DIR, ".env"), "SECRET=abc123"); // Should be excluded
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
// Project Profile Tests
// ---------------------------------------------------------------------------

describe("detectProjectProfile", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should detect project name", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.name.length).toBeGreaterThan(0);
  });

  it("should detect TypeScript project type", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.projectType).toBe("typescript");
  });

  it("should detect Node.js runtime", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.runtime).toBe("Node.js");
  });

  it("should detect npm as package manager (fallback)", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.packageManager).toBe("npm");
  });

  it("should detect Vitest as test framework", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.testFramework).toBe("Vitest");
  });

  it("should detect React as framework", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.frameworks).toContain("React");
  });

  it("should detect source directories", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.sourceDirectories).toContain("src");
  });

  it("should detect test directories", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.testDirectories).toContain("tests");
  });

  it("should detect configuration files", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    expect(profile.configurationFiles).toContain("package.json");
    expect(profile.configurationFiles).toContain("tsconfig.json");
  });
});

// ---------------------------------------------------------------------------
// File Index Tests
// ---------------------------------------------------------------------------

describe("createFileIndex", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should index files", () => {
    const index = createFileIndex(FIXTURE_DIR);
    expect(index.totalFiles).toBeGreaterThan(0);
  });

  it("should exclude node_modules", () => {
    const index = createFileIndex(FIXTURE_DIR);
    const nodeModulesFiles = index.files.filter((f) => f.path.includes("node_modules"));
    expect(nodeModulesFiles.length).toBe(0);
  });

  it("should exclude sensitive files", () => {
    const index = createFileIndex(FIXTURE_DIR);
    const envFiles = index.files.filter((f) => f.path.includes(".env"));
    expect(envFiles.length).toBe(0);
  });

  it("should identify test files", () => {
    const index = createFileIndex(FIXTURE_DIR);
    const testFiles = index.files.filter((f) => f.isTest);
    expect(testFiles.length).toBeGreaterThan(0);
  });

  it("should identify config files", () => {
    const index = createFileIndex(FIXTURE_DIR);
    const configFiles = index.files.filter((f) => f.isConfig);
    expect(configFiles.length).toBeGreaterThan(0);
  });

  it("should identify source files", () => {
    const index = createFileIndex(FIXTURE_DIR);
    const sourceFiles = index.files.filter((f) => f.isSource);
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it("should find files by pattern", () => {
    const index = createFileIndex(FIXTURE_DIR);
    const authFiles = findFiles(index, "auth");
    expect(authFiles.length).toBeGreaterThan(0);
    expect(authFiles.some((f) => f.path.includes("auth"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Context Engine Tests
// ---------------------------------------------------------------------------

describe("buildContext", () => {
  beforeEach(() => createFixture());
  afterEach(() => cleanupFixture());

  it("should build context for a task", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);

    const context = buildContext("fix authentication", FIXTURE_DIR, profile, fileIndex);

    expect(context.items.length).toBeGreaterThan(0);
    expect(context.profile).toBe(profile);
  });

  it("should include direct matches", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);

    const context = buildContext("fix authentication", FIXTURE_DIR, profile, fileIndex);

    // Should find files related to the task
    expect(context.items.length).toBeGreaterThan(0);
  });

  it("should include config files", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);

    const context = buildContext("add feature", FIXTURE_DIR, profile, fileIndex);

    // Should include package.json
    expect(context.items.some((i) => i.path.includes("package.json"))).toBe(true);
  });

  it("should respect context limits", () => {
    const profile = detectProjectProfile(FIXTURE_DIR);
    const fileIndex = createFileIndex(FIXTURE_DIR);

    const context = buildContext("random task", FIXTURE_DIR, profile, fileIndex);

    // Should not exceed max files
    expect(context.items.length).toBeLessThanOrEqual(20);
  });
});

// ---------------------------------------------------------------------------
// Task Memory Tests
// ---------------------------------------------------------------------------

describe("TaskMemory", () => {
  let memory: TaskMemory;
  const _memoryDir = join(FIXTURE_DIR, ".devbyai/tasks");

  beforeEach(() => {
    createFixture();
    memory = new TaskMemory(FIXTURE_DIR);
  });

  afterEach(() => {
    cleanupFixture();
  });

  it("should create tasks", () => {
    const task = memory.create("Fix authentication");
    expect(task.id).toBe("001");
    expect(task.description).toBe("Fix authentication");
    expect(task.status).toBe("created");
  });

  it("should assign sequential IDs", () => {
    const task1 = memory.create("Task 1");
    const task2 = memory.create("Task 2");

    expect(task1.id).toBe("001");
    expect(task2.id).toBe("002");
  });

  it("should get tasks by ID", () => {
    memory.create("Test task");
    const task = memory.get("001");
    expect(task).toBeDefined();
    expect(task?.description).toBe("Test task");
  });

  it("should update task status", () => {
    memory.create("Test task");
    memory.updateStatus("001", "completed");

    const task = memory.get("001");
    expect(task?.status).toBe("completed");
    expect(task?.completedAt).toBeDefined();
    expect(task?.duration).toBeDefined();
  });

  it("should track agents", () => {
    memory.create("Test task");
    memory.addAgent("001", "explorer");
    memory.addAgent("001", "planner");

    const task = memory.get("001");
    expect(task?.agents).toContain("explorer");
    expect(task?.agents).toContain("planner");
  });

  it("should track skills", () => {
    memory.create("Test task");
    memory.addSkill("001", "typescript");

    const task = memory.get("001");
    expect(task?.skills).toContain("typescript");
  });

  it("should track modified files", () => {
    memory.create("Test task");
    memory.addModifiedFile("001", "src/app.ts");

    const task = memory.get("001");
    expect(task?.modifiedFiles).toContain("src/app.ts");
  });

  it("should get recent tasks", () => {
    memory.create("Task 1");
    memory.create("Task 2");
    memory.create("Task 3");

    const recent = memory.getRecent(2);
    expect(recent.length).toBe(2);
    expect(recent[0].id).toBe("003"); // Most recent first
  });

  it("should persist tasks to disk", () => {
    memory.create("Persistent task");

    // Create a new memory instance to test persistence
    const memory2 = new TaskMemory(FIXTURE_DIR);
    const tasks = memory2.getRecent();
    expect(tasks.length).toBe(1);
    expect(tasks[0].description).toBe("Persistent task");
  });
});

// ---------------------------------------------------------------------------
// Session Context Tests
// ---------------------------------------------------------------------------

describe("SessionManager", () => {
  let session: SessionManager;

  beforeEach(() => {
    session = new SessionManager("/test/workspace");
  });

  it("should initialize with default context", () => {
    const ctx = session.getContext();
    expect(ctx.workspacePath).toBe("/test/workspace");
    expect(ctx.currentTaskId).toBeNull();
    expect(ctx.recentFiles.length).toBe(0);
    expect(ctx.taskCount).toBe(0);
  });

  it("should track file access", () => {
    session.trackFileAccess("src/app.ts");
    session.trackFileAccess("src/auth.ts");

    const files = session.getRecentFiles();
    expect(files).toContain("src/app.ts");
    expect(files).toContain("src/auth.ts");
  });

  it("should track modifications", () => {
    session.trackModification("src/app.ts");

    const mods = session.getRecentModifications();
    expect(mods).toContain("src/app.ts");
  });

  it("should set current task", () => {
    session.setCurrentTask("001");
    expect(session.getContext().currentTaskId).toBe("001");
    expect(session.getContext().taskCount).toBe(1);

    session.setCurrentTask(null);
    expect(session.getContext().currentTaskId).toBeNull();
  });

  it("should set active workflow", () => {
    session.setActiveWorkflow("development");
    expect(session.getContext().activeWorkflow).toBe("development");
  });

  it("should set active skills", () => {
    session.setActiveSkills(["typescript", "testing"]);
    expect(session.getContext().activeSkills).toEqual(["typescript", "testing"]);
  });

  it("should clear session", () => {
    session.trackFileAccess("src/app.ts");
    session.setActiveWorkflow("development");
    session.setActiveSkills(["typescript"]);

    session.clear();

    const ctx = session.getContext();
    expect(ctx.recentFiles.length).toBe(0);
    expect(ctx.activeWorkflow).toBeNull();
    expect(ctx.activeSkills.length).toBe(0);
  });

  it("should provide summary", () => {
    session.setCurrentTask("001");
    session.trackFileAccess("src/app.ts");

    const summary = session.getSummary();
    expect(summary.workspace).toBe("/test/workspace");
    expect(summary.taskCount).toBe(1);
    expect(summary.recentFileCount).toBe(1);
  });
});
