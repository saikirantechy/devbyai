/**
 * Debug Agent Tests
 *
 * Tests for the DebugAgent, including error parsing, related file finding,
 * fix suggestions, and debug steps generation.
 */

import { describe, expect, it } from "vitest";
import {
  DebugAgent,
  findRelatedFiles,
  generateDebugSteps,
  generateFixSuggestions,
  parseErrors,
} from "../built-in/debugger.js";
import type { AgentContext, ParsedError } from "../index.js";

// ---------------------------------------------------------------------------
// Test Context
// ---------------------------------------------------------------------------

const context: AgentContext = {
  cwd: "/test/project",
  request: "Fix the TypeScript errors in src/index.ts",
  previousResults: [],
};

// ---------------------------------------------------------------------------
// parseErrors Tests
// ---------------------------------------------------------------------------

describe("parseErrors", () => {
  it("should parse TypeScript errors with column", () => {
    const output =
      "src/index.ts(10,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.";
    const errors = parseErrors(output);

    expect(errors.length).toBe(1);
    expect(errors[0].category).toBe("typescript");
    expect(errors[0].line).toBe(10);
    expect(errors[0].column).toBe(5);
    expect(errors[0].code).toBe("TS2345");
    expect(errors[0].severity).toBe("error");
    expect(errors[0].filePath).toBe("src/index.ts");
  });

  it("should parse TypeScript errors without column", () => {
    const output =
      "src/utils.ts(25): error TS2307: Cannot find module 'missing-package'.";
    const errors = parseErrors(output);

    expect(errors.length).toBe(1);
    expect(errors[0].category).toBe("typescript");
    expect(errors[0].line).toBe(25);
    expect(errors[0].column).toBeNull();
    expect(errors[0].code).toBe("TS2307");
    expect(errors[0].filePath).toBe("src/utils.ts");
  });

  it("should parse Biome lint errors", () => {
    const output =
      "src/index.ts:10:5: lint/correctness/noUnusedVariables  This variable is unused.";
    const errors = parseErrors(output);

    expect(errors.length).toBe(1);
    expect(errors[0].category).toBe("biome");
    expect(errors[0].line).toBe(10);
    expect(errors[0].code).toBe("correctness/noUnusedVariables");
    expect(errors[0].filePath).toBe("src/index.ts");
  });

  it("should parse test failures", () => {
    const output =
      "FAIL  src/__tests__/auth.test.ts > auth > should work";
    const errors = parseErrors(output);

    expect(errors.length).toBe(1);
    expect(errors[0].category).toBe("test");
    expect(errors[0].filePath).toBe("src/__tests__/auth.test.ts");
  });

  it("should parse dependency errors", () => {
    const output = "Cannot find module 'missing-package'";
    const errors = parseErrors(output);

    expect(errors.length).toBe(1);
    expect(errors[0].category).toBe("dependency");
  });

  it("should parse ENOENT errors", () => {
    const output =
      "ENOENT: no such file or directory, access '/path/to/file.txt'";
    const errors = parseErrors(output);

    expect(errors.length).toBe(1);
    expect(errors[0].category).toBe("runtime");
    expect(errors[0].filePath).toBe("/path/to/file.txt");
  });

  it("should parse permission errors", () => {
    const output = "EACCES: permission denied, open '/etc/passwd'";
    const errors = parseErrors(output);

    expect(errors.length).toBe(1);
    expect(errors[0].category).toBe("permission");
  });

  it("should parse network errors", () => {
    const output = "ECONNREFUSED 127.0.0.1:3000";
    const errors = parseErrors(output);

    expect(errors.length).toBe(1);
    expect(errors[0].category).toBe("network");
  });

  it("should handle empty output", () => {
    const errors = parseErrors("");
    expect(errors.length).toBe(0);
  });

  it("should handle multiple errors", () => {
    const output = [
      "src/a.ts(1,1): error TS2345: Error 1",
      "src/b.ts(2,2): error TS2345: Error 2",
      "Cannot find module 'pkg'",
    ].join("\n");
    const errors = parseErrors(output);

    expect(errors.length).toBe(3);
    expect(errors[0].category).toBe("typescript");
    expect(errors[1].category).toBe("typescript");
    expect(errors[2].category).toBe("dependency");
  });

  it("should extract error codes correctly", () => {
    const output = "src/index.ts(10,5): error TS2322: Type mismatch";
    const errors = parseErrors(output);

    expect(errors[0].code).toBe("TS2322");
  });
});

// ---------------------------------------------------------------------------
// findRelatedFiles Tests
// ---------------------------------------------------------------------------

describe("findRelatedFiles", () => {
  it("should find files in the same directory", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/index.ts(10,5): error TS2345: Type mismatch",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        code: "TS2345",
        category: "typescript",
        severity: "error",
        message: "Type mismatch",
      },
    ];

    const projectFiles = [
      "src/index.ts",
      "src/utils.ts",
      "src/types.ts",
      "src/__tests__/index.test.ts",
    ];

    const related = findRelatedFiles(errors, projectFiles);

    expect(related.length).toBeGreaterThan(0);
    expect(related.some((f) => f.path === "src/utils.ts")).toBe(true);
    expect(related.some((f) => f.path === "src/types.ts")).toBe(true);
  });

  it("should find test files for the same module", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/auth.ts(5,3): error TS2345: Type mismatch",
        filePath: "src/auth.ts",
        line: 5,
        column: 3,
        code: "TS2345",
        category: "typescript",
        severity: "error",
        message: "Type mismatch",
      },
    ];

    const projectFiles = [
      "src/auth.ts",
      "src/__tests__/auth.test.ts",
      "src/utils.ts",
    ];

    const related = findRelatedFiles(errors, projectFiles);

    expect(related.some((f) => f.path === "src/__tests__/auth.test.ts")).toBe(
      true,
    );
    const testFile = related.find(
      (f) => f.path === "src/__tests__/auth.test.ts",
    );
    expect(testFile?.relationship).toBe("test-file");
  });

  it("should find config files", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/index.ts(10,5): error TS2345: Type mismatch",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        code: "TS2345",
        category: "typescript",
        severity: "error",
        message: "Type mismatch",
      },
    ];

    const projectFiles = [
      "src/index.ts",
      "tsconfig.json",
      "package.json",
    ];

    const related = findRelatedFiles(errors, projectFiles);

    expect(related.some((f) => f.path === "tsconfig.json")).toBe(true);
    expect(related.some((f) => f.path === "package.json")).toBe(true);
  });

  it("should return empty array for errors without file paths", () => {
    const errors: ParsedError[] = [
      {
        raw: "Cannot find module 'pkg'",
        filePath: null,
        line: null,
        column: null,
        code: null,
        category: "dependency",
        severity: "error",
        message: "Cannot find module 'pkg'",
      },
    ];

    const projectFiles = ["src/index.ts"];

    const related = findRelatedFiles(errors, projectFiles);

    expect(related.length).toBe(0);
  });

  it("should limit results to 20 files", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/index.ts(10,5): error TS2345: Type mismatch",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        code: "TS2345",
        category: "typescript",
        severity: "error",
        message: "Type mismatch",
      },
    ];

    // Create 30 files in the same directory
    const projectFiles = ["src/index.ts"];
    for (let i = 0; i < 30; i++) {
      projectFiles.push(`src/file${i}.ts`);
    }

    const related = findRelatedFiles(errors, projectFiles);

    expect(related.length).toBeLessThanOrEqual(20);
  });
});

// ---------------------------------------------------------------------------
// generateFixSuggestions Tests
// ---------------------------------------------------------------------------

describe("generateFixSuggestions", () => {
  it("should generate suggestions for TS2307 errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/index.ts(10,5): error TS2307: Cannot find module 'pkg'",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        code: "TS2307",
        category: "typescript",
        severity: "error",
        message: "Cannot find module 'pkg'",
      },
    ];

    const suggestions = generateFixSuggestions(errors);

    expect(suggestions.length).toBe(1);
    expect(suggestions[0].description).toContain("Import not found");
    expect(suggestions[0].confidence).toBe(0.9);
    expect(suggestions[0].safeToAutoApply).toBe(false);
  });

  it("should generate suggestions for TS2345 errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/index.ts(10,5): error TS2345: Type mismatch",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        code: "TS2345",
        category: "typescript",
        severity: "error",
        message: "Type mismatch",
      },
    ];

    const suggestions = generateFixSuggestions(errors);

    expect(suggestions.length).toBe(1);
    expect(suggestions[0].description).toContain("Argument type mismatch");
    expect(suggestions[0].confidence).toBe(0.8);
  });

  it("should generate suggestions for biome lint errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/index.ts:10:5: lint/correctness/noUnusedVariables  Unused",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        code: "correctness/noUnusedVariables",
        category: "biome",
        severity: "error",
        message: "Unused",
      },
    ];

    const suggestions = generateFixSuggestions(errors);

    expect(suggestions.length).toBe(1);
    expect(suggestions[0].description).toContain("Linting error");
    expect(suggestions[0].command).toBe("npx biome check --fix --unsafe .");
    expect(suggestions[0].safeToAutoApply).toBe(true);
  });

  it("should generate suggestions for dependency errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "Cannot find module 'missing-package'",
        filePath: null,
        line: null,
        column: null,
        code: null,
        category: "dependency",
        severity: "error",
        message: "Cannot find module 'missing-package'",
      },
    ];

    const suggestions = generateFixSuggestions(errors);

    expect(suggestions.length).toBe(1);
    expect(suggestions[0].description).toContain("Missing dependency");
    expect(suggestions[0].command).toBe("pnpm install");
    expect(suggestions[0].safeToAutoApply).toBe(true);
  });

  it("should generate suggestions for test failures", () => {
    const errors: ParsedError[] = [
      {
        raw: "FAIL  src/__tests__/auth.test.ts > auth > should work",
        filePath: "src/__tests__/auth.test.ts",
        line: null,
        column: null,
        code: null,
        category: "test",
        severity: "error",
        message: "Test failed",
      },
    ];

    const suggestions = generateFixSuggestions(errors);

    expect(suggestions.length).toBe(1);
    expect(suggestions[0].description).toContain("Test failure");
    expect(suggestions[0].command).toBe("pnpm test");
  });

  it("should return empty array for unknown errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "Some random error",
        filePath: null,
        line: null,
        column: null,
        code: null,
        category: "unknown",
        severity: "error",
        message: "Some random error",
      },
    ];

    const suggestions = generateFixSuggestions(errors);

    expect(suggestions.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// generateDebugSteps Tests
// ---------------------------------------------------------------------------

describe("generateDebugSteps", () => {
  it("should generate steps for TypeScript errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/index.ts(10,5): error TS2345: Type mismatch",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        code: "TS2345",
        category: "typescript",
        severity: "error",
        message: "Type mismatch",
      },
    ];

    const steps = generateDebugSteps(errors);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.includes("TypeScript"))).toBe(true);
    expect(steps.some((s) => s.includes("typecheck"))).toBe(true);
  });

  it("should generate steps for test failures", () => {
    const errors: ParsedError[] = [
      {
        raw: "FAIL  src/__tests__/auth.test.ts",
        filePath: "src/__tests__/auth.test.ts",
        line: null,
        column: null,
        code: null,
        category: "test",
        severity: "error",
        message: "Test failed",
      },
    ];

    const steps = generateDebugSteps(errors);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.includes("test"))).toBe(true);
  });

  it("should generate steps for build errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "Build Error: Cannot find module",
        filePath: null,
        line: null,
        column: null,
        code: null,
        category: "build",
        severity: "error",
        message: "Build Error: Cannot find module",
      },
    ];

    const steps = generateDebugSteps(errors);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.includes("build"))).toBe(true);
  });

  it("should generate steps for lint errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "src/index.ts:10:5: lint/error  Some lint error",
        filePath: "src/index.ts",
        line: 10,
        column: 5,
        code: "error",
        category: "biome",
        severity: "error",
        message: "Some lint error",
      },
    ];

    const steps = generateDebugSteps(errors);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.includes("biome") || s.includes("lint"))).toBe(
      true,
    );
  });

  it("should generate steps for dependency errors", () => {
    const errors: ParsedError[] = [
      {
        raw: "Cannot find module 'missing-package'",
        filePath: null,
        line: null,
        column: null,
        code: null,
        category: "dependency",
        severity: "error",
        message: "Cannot find module 'missing-package'",
      },
    ];

    const steps = generateDebugSteps(errors);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some((s) => s.includes("install"))).toBe(true);
  });

  it("should handle empty errors", () => {
    const steps = generateDebugSteps([]);

    expect(steps.length).toBe(1);
    expect(steps[0]).toContain("No errors found");
  });
});

// ---------------------------------------------------------------------------
// DebugAgent Tests
// ---------------------------------------------------------------------------

describe("DebugAgent", () => {
  it("should have correct metadata", () => {
    const agent = new DebugAgent();
    expect(agent.metadata.id).toBe("debugger");
    expect(agent.metadata.role).toBe("debugger");
    expect(agent.metadata.name).toBe("Debugger");
    expect(agent.metadata.capabilities).toContain("error analysis");
    expect(agent.metadata.capabilities).toContain("related file discovery");
    expect(agent.metadata.capabilities).toContain("fix suggestions");
    expect(agent.metadata.supportedPhases).toContain("review");
    expect(agent.metadata.supportedPhases).toContain("test");
  });

  it("should handle no errors gracefully", async () => {
    const agent = new DebugAgent();
    const result = await agent.execute({
      cwd: "/test/project",
      request: "Everything looks good",
      previousResults: [],
    });

    expect(result.success).toBe(true);
    expect(result.agentId).toBe("debugger");
    expect(result.output).toContain("No errors detected");
    expect(result.suggestedNext).toBe("explorer");
  });

  it("should analyze errors from request", async () => {
    const agent = new DebugAgent();
    const result = await agent.execute({
      cwd: "/test/project",
      request:
        "src/index.ts(10,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.",
      previousResults: [],
    });

    expect(result.success).toBe(true);
    expect(result.output).toContain("DEBUG AGENT");
    expect(result.output).toContain("TYPESCRIPT");
    expect(result.output).toContain("TS2345");
  });

  it("should analyze errors from previous results", async () => {
    const agent = new DebugAgent();
    const result = await agent.execute({
      cwd: "/test/project",
      request: "Fix the errors",
      previousResults: [
        {
          phase: "build",
          output:
            "src/index.ts(10,5): error TS2345: Type mismatch",
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.output).toContain("DEBUG AGENT");
    expect(result.output).toContain("TYPESCRIPT");
  });

  it("should find related files", async () => {
    const agent = new DebugAgent();
    const result = await agent.execute({
      cwd: "/test/project",
      request:
        "src/auth.ts(5,3): error TS2345: Type mismatch",
      previousResults: [],
    });

    expect(result.success).toBe(true);
    expect(result.output).toContain("RELATED FILES");
    // Without project file context, the section shows a helpful message
    expect(result.output).toContain("No related files found");
  });

  it("should generate fix suggestions", async () => {
    const agent = new DebugAgent();
    const result = await agent.execute({
      cwd: "/test/project",
      request: "Cannot find module 'missing-package'",
      previousResults: [],
    });

    expect(result.success).toBe(true);
    // The agent detects "Cannot find" as error text and parses it
    expect(result.output).toContain("DEBUG AGENT");
    expect(result.output).toContain("DEPENDENCY");
  });

  it("should generate debug steps", async () => {
    const agent = new DebugAgent();
    const result = await agent.execute({
      cwd: "/test/project",
      request:
        "src/index.ts(10,5): error TS2345: Type mismatch",
      previousResults: [],
    });

    expect(result.success).toBe(true);
    expect(result.output).toContain("DEBUG STEPS");
  });

  it("should suggest builder when auto-fixable", async () => {
    const agent = new DebugAgent();
    const result = await agent.execute({
      cwd: "/test/project",
      request: "Cannot find module 'missing-package'",
      previousResults: [],
    });

    expect(result.success).toBe(true);
    // Dependency errors are auto-fixable (pnpm install), so suggest builder
    expect(result.suggestedNext).toBe("builder");
  });

  it("should suggest explorer when no auto-fix", async () => {
    const agent = new DebugAgent();
    const result = await agent.execute({
      cwd: "/test/project",
      request:
        "src/index.ts(10,5): error TS2345: Type mismatch",
      previousResults: [],
    });

    expect(result.success).toBe(true);
    expect(result.suggestedNext).toBe("explorer");
  });
});
