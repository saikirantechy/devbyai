/**
 * DEVBYAI Project Profile
 *
 * Detects project type, frameworks, package manager, and other characteristics.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { PackageManager, ProjectProfile, ProjectType, WorkspaceType } from "./types.js";

/**
 * Detect the project profile for a given workspace.
 */
export function detectProjectProfile(cwd: string): ProjectProfile {
  const name = basename(cwd);
  const projectType = detectProjectType(cwd);
  const languages = detectLanguages(cwd);
  const frameworks = detectFrameworks(cwd);
  const runtime = detectRuntime(cwd);
  const packageManager = detectPackageManager(cwd);
  const workspaceType = detectWorkspaceType(cwd);
  const testFramework = detectTestFramework(cwd);
  const buildSystem = detectBuildSystem(cwd);
  const lintSystem = detectLintSystem(cwd);
  const sourceDirectories = detectSourceDirectories(cwd);
  const testDirectories = detectTestDirectories(cwd);
  const configurationFiles = detectConfigurationFiles(cwd);
  const entryPoints = detectEntryPoints(cwd);
  const packageCount = countPackages(cwd, workspaceType);

  return {
    name,
    projectType,
    languages,
    frameworks,
    runtime,
    packageManager,
    workspaceType,
    testFramework,
    buildSystem,
    lintSystem,
    sourceDirectories,
    testDirectories,
    configurationFiles,
    entryPoints,
    packageCount,
  };
}

// ---------------------------------------------------------------------------
// Detection Helpers
// ---------------------------------------------------------------------------

function detectProjectType(cwd: string): ProjectType {
  if (existsSync(join(cwd, "tsconfig.json"))) return "typescript";
  if (existsSync(join(cwd, "package.json"))) return "node";
  if (existsSync(join(cwd, "pyproject.toml")) || existsSync(join(cwd, "requirements.txt")))
    return "python";
  if (existsSync(join(cwd, "go.mod"))) return "go";
  if (existsSync(join(cwd, "Cargo.toml"))) return "rust";
  if (existsSync(join(cwd, "pom.xml")) || existsSync(join(cwd, "build.gradle"))) return "java";
  if (existsSync(join(cwd, "composer.json"))) return "php";
  if (existsSync(join(cwd, "pubspec.yaml"))) return "dart";
  return "unknown";
}

function detectLanguages(cwd: string): string[] {
  const languages: string[] = [];

  if (existsSync(join(cwd, "tsconfig.json"))) {
    languages.push("TypeScript");
  }

  if (existsSync(join(cwd, "package.json"))) {
    try {
      const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.react || deps["react-dom"]) languages.push("React");
      if (deps.vue || deps["@vue/core"]) languages.push("Vue");
      if (deps.angular || deps["@angular/core"]) languages.push("Angular");
      if (deps.svelte) languages.push("Svelte");
      if (deps.next) languages.push("Next.js");
      if (deps.nuxt) languages.push("Nuxt");
      if (deps.express) languages.push("Express");
      if (deps.fastify) languages.push("Fastify");
      if (deps.koa) languages.push("Koa");
    } catch {
      // Ignore invalid package.json
    }
  }

  if (existsSync(join(cwd, "pyproject.toml")) || existsSync(join(cwd, "requirements.txt"))) {
    languages.push("Python");
  }
  if (existsSync(join(cwd, "go.mod"))) languages.push("Go");
  if (existsSync(join(cwd, "Cargo.toml"))) languages.push("Rust");
  if (existsSync(join(cwd, "pom.xml")) || existsSync(join(cwd, "build.gradle")))
    languages.push("Java");
  if (existsSync(join(cwd, "composer.json"))) languages.push("PHP");
  if (existsSync(join(cwd, "pubspec.yaml"))) languages.push("Dart");

  // Check for JavaScript (fallback)
  if (languages.length === 0 && existsSync(join(cwd, "package.json"))) {
    languages.push("JavaScript");
  }

  return languages;
}

function detectFrameworks(cwd: string): string[] {
  const frameworks: string[] = [];

  if (!existsSync(join(cwd, "package.json"))) return frameworks;

  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps.next) frameworks.push("Next.js");
    if (deps.nuxt) frameworks.push("Nuxt");
    if (deps.gatsby) frameworks.push("Gatsby");
    if (deps.remix) frameworks.push("Remix");
    if (deps["@nestjs/core"]) frameworks.push("NestJS");
    if (deps.express) frameworks.push("Express");
    if (deps.fastify) frameworks.push("Fastify");
    if (deps.react) frameworks.push("React");
    if (deps.vue) frameworks.push("Vue");
    if (deps.svelte) frameworks.push("Svelte");
    if (deps.angular || deps["@angular/core"]) frameworks.push("Angular");
  } catch {
    // Ignore invalid package.json
  }

  return frameworks;
}

function detectRuntime(cwd: string): string | null {
  if (existsSync(join(cwd, "tsconfig.json")) || existsSync(join(cwd, "package.json"))) {
    return "Node.js";
  }
  if (existsSync(join(cwd, "pyproject.toml")) || existsSync(join(cwd, "requirements.txt"))) {
    return "Python";
  }
  if (existsSync(join(cwd, "go.mod"))) return "Go";
  if (existsSync(join(cwd, "Cargo.toml"))) return "Rust";
  return null;
}

function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "pnpm-lock.yaml")) || existsSync(join(cwd, "pnpm-workspace.yaml")))
    return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock"))) return "bun";
  if (existsSync(join(cwd, "package-lock.json"))) return "npm";
  if (existsSync(join(cwd, "package.json"))) return "npm"; // fallback
  return "unknown";
}

function detectWorkspaceType(cwd: string): WorkspaceType {
  if (existsSync(join(cwd, "pnpm-workspace.yaml"))) return "monorepo";

  // Check for npm/yarn workspaces
  if (existsSync(join(cwd, "package.json"))) {
    try {
      const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
      if (pkg.workspaces) return "monorepo";
    } catch {
      // Ignore
    }
  }

  // Check for turborepo or nx
  if (existsSync(join(cwd, "turbo.json")) || existsSync(join(cwd, "nx.json"))) return "monorepo";

  // Check for lerna
  if (existsSync(join(cwd, "lerna.json"))) return "monorepo";

  return "single";
}

function detectTestFramework(cwd: string): string | null {
  if (!existsSync(join(cwd, "package.json"))) return null;

  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps.vitest) return "Vitest";
    if (deps.jest) return "Jest";
    if (deps.mocha) return "Mocha";
    if (deps["@playwright/test"]) return "Playwright";
    if (deps.cypress) return "Cypress";
    if (deps["node:test"]) return "Node.js Test Runner";
  } catch {
    // Ignore
  }

  return null;
}

function detectBuildSystem(cwd: string): string | null {
  if (existsSync(join(cwd, "tsconfig.json"))) {
    if (existsSync(join(cwd, "tsup.config.ts")) || existsSync(join(cwd, "tsup.config.js")))
      return "tsup";
    if (existsSync(join(cwd, "vite.config.ts")) || existsSync(join(cwd, "vite.config.js")))
      return "Vite";
    if (existsSync(join(cwd, "webpack.config.js")) || existsSync(join(cwd, "webpack.config.ts")))
      return "Webpack";
    if (existsSync(join(cwd, "rollup.config.js")) || existsSync(join(cwd, "rollup.config.ts")))
      return "Rollup";
    return "TypeScript";
  }

  if (existsSync(join(cwd, "Makefile"))) return "Make";
  if (existsSync(join(cwd, "CMakeLists.txt"))) return "CMake";
  if (existsSync(join(cwd, "build.gradle")) || existsSync(join(cwd, "build.gradle.kts")))
    return "Gradle";

  return null;
}

function detectLintSystem(cwd: string): string | null {
  if (existsSync(join(cwd, "biome.json")) || existsSync(join(cwd, "biome.jsonc"))) return "Biome";
  if (
    existsSync(join(cwd, ".eslintrc.js")) ||
    existsSync(join(cwd, ".eslintrc.json")) ||
    existsSync(join(cwd, "eslint.config.js"))
  )
    return "ESLint";
  if (existsSync(join(cwd, ".prettierrc")) || existsSync(join(cwd, ".prettierrc.json")))
    return "Prettier";
  return null;
}

function detectSourceDirectories(cwd: string): string[] {
  const dirs: string[] = [];
  const candidates = ["src", "lib", "app", "packages", "apps"];

  for (const dir of candidates) {
    if (existsSync(join(cwd, dir))) {
      dirs.push(dir);
    }
  }

  return dirs.length > 0 ? dirs : ["."];
}

function detectTestDirectories(cwd: string): string[] {
  const dirs: string[] = [];
  const candidates = ["tests", "test", "__tests__", "spec", "e2e"];

  for (const dir of candidates) {
    if (existsSync(join(cwd, dir))) {
      dirs.push(dir);
    }
  }

  return dirs;
}

function detectConfigurationFiles(cwd: string): string[] {
  const files: string[] = [];
  const candidates = [
    "package.json",
    "tsconfig.json",
    "biome.json",
    ".gitignore",
    "pnpm-workspace.yaml",
    "vitest.config.ts",
    "vite.config.ts",
  ];

  for (const file of candidates) {
    if (existsSync(join(cwd, file))) {
      files.push(file);
    }
  }

  return files;
}

function detectEntryPoints(cwd: string): string[] {
  const points: string[] = [];

  if (existsSync(join(cwd, "package.json"))) {
    try {
      const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf-8"));
      if (pkg.main) points.push(pkg.main);
      if (pkg.bin && typeof pkg.bin === "string") points.push(pkg.bin);
      if (pkg.exports && typeof pkg.exports === "object") {
        const root = pkg.exports["."];
        if (typeof root === "string") points.push(root);
        else if (root?.import) points.push(root.import);
      }
    } catch {
      // Ignore
    }
  }

  // Check for common entry points
  const commonEntries = ["index.ts", "index.js", "main.ts", "main.js", "app.ts", "app.js"];
  for (const entry of commonEntries) {
    if (existsSync(join(cwd, entry)) && !points.includes(entry)) {
      points.push(entry);
    }
  }

  return points;
}

function countPackages(cwd: string, workspaceType: WorkspaceType): number {
  if (workspaceType !== "monorepo") return 1;

  let count = 0;

  // Check packages/ directory
  const packagesDir = join(cwd, "packages");
  if (existsSync(packagesDir)) {
    try {
      const entries = readdirSync(packagesDir, { withFileTypes: true });
      count += entries.filter((e) => e.isDirectory()).length;
    } catch {
      // Ignore
    }
  }

  // Check apps/ directory
  const appsDir = join(cwd, "apps");
  if (existsSync(appsDir)) {
    try {
      const entries = readdirSync(appsDir, { withFileTypes: true });
      count += entries.filter((e) => e.isDirectory()).length;
    } catch {
      // Ignore
    }
  }

  return Math.max(count, 1);
}
