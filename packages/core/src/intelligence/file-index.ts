/**
 * DEVBYAI File Index
 *
 * Lightweight file intelligence system that indexes project files
 * without reading their contents.
 */

import { type Dirent, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import type { FileImportance, FileIndex, FileIndexEntry } from "./types.js";

// Directories to always exclude
const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".output",
  "target",
  "__pycache__",
  ".venv",
  "vendor",
]);

// Sensitive file patterns
const SENSITIVE_PATTERNS = [
  /\.env$/,
  /\.env\./,
  /\.pem$/,
  /\.key$/,
  /id_rsa/,
  /id_ed25519/,
  /credentials\.json/,
  /service-account\.json/,
  /\.secret$/,
];

// Critical files (always important)
const CRITICAL_FILES = new Set([
  "package.json",
  "tsconfig.json",
  "biome.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "nx.json",
  "lerna.json",
  "README.md",
]);

// High importance files
const HIGH_IMPORTANCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs"]);

// Config file extensions
const CONFIG_EXTENSIONS = new Set([".json", ".yaml", ".yml", ".toml", ".config.js", ".config.ts"]);

/**
 * Create a file index for the workspace.
 */
export function createFileIndex(cwd: string, maxFiles = 5000): FileIndex {
  const files: FileIndexEntry[] = [];

  walkDirectory(cwd, cwd, files, maxFiles);

  // Group by directory
  const byDirectory = new Map<string, FileIndexEntry[]>();
  for (const file of files) {
    const dir = file.directory;
    if (!byDirectory.has(dir)) byDirectory.set(dir, []);
    byDirectory.get(dir)?.push(file);
  }

  // Group by extension
  const byExtension = new Map<string, FileIndexEntry[]>();
  for (const file of files) {
    const ext = file.extension;
    if (!byExtension.has(ext)) byExtension.set(ext, []);
    byExtension.get(ext)?.push(file);
  }

  const criticalFiles = files.filter((f) => f.importance === "critical");
  const sourceFiles = files.filter((f) => f.isSource);
  const testFiles = files.filter((f) => f.isTest);
  const configFiles = files.filter((f) => f.isConfig);

  return {
    files,
    byDirectory,
    byExtension,
    criticalFiles,
    sourceFiles,
    testFiles,
    configFiles,
    totalFiles: files.length,
    timestamp: Date.now(),
  };
}

/**
 * Walk a directory and collect file entries.
 */
function walkDirectory(
  baseDir: string,
  currentDir: string,
  files: FileIndexEntry[],
  maxFiles: number,
): void {
  if (files.length >= maxFiles) return;

  let entries: Dirent[];
  try {
    entries = readdirSync(currentDir, { withFileTypes: true }) as unknown as Dirent[];
  } catch {
    return;
  }

  for (const entry of entries) {
    if (files.length >= maxFiles) break;

    const entryName = entry.name.toString();

    // Skip excluded directories
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entryName)) continue;
      walkDirectory(baseDir, join(currentDir, entryName), files, maxFiles);
      continue;
    }

    // Skip sensitive files
    if (SENSITIVE_PATTERNS.some((p) => p.test(entryName))) continue;

    const fullPath = join(currentDir, entryName);
    const relativePath = relative(baseDir, fullPath).replace(/\\/g, "/");
    const extension = extname(entryName);

    let size = 0;
    try {
      size = statSync(fullPath).size;
    } catch {
      // Ignore
    }

    const directory = relativePath.includes("/")
      ? relativePath.slice(0, relativePath.lastIndexOf("/"))
      : ".";

    const importance = classifyImportance(entryName, extension, relativePath);
    const isTest = detectTestFile(entryName, relativePath);
    const isConfig = detectConfigFile(entryName, extension);
    const isSource = !isTest && !isConfig && HIGH_IMPORTANCE_EXTENSIONS.has(extension);

    files.push({
      path: relativePath,
      extension,
      size,
      directory,
      importance,
      isTest,
      isConfig,
      isSource,
    });
  }
}

/**
 * Classify file importance.
 */
function classifyImportance(
  fileName: string,
  extension: string,
  _relativePath: string,
): FileImportance {
  // Critical files
  if (CRITICAL_FILES.has(fileName)) return "critical";

  // High importance: source files
  if (HIGH_IMPORTANCE_EXTENSIONS.has(extension)) return "high";

  // Medium: config files, docs
  if (CONFIG_EXTENSIONS.has(extension) || fileName.endsWith(".md")) return "medium";

  // Low: everything else
  return "low";
}

/**
 * Detect if a file is a test file.
 */
function detectTestFile(fileName: string, relativePath: string): boolean {
  if (fileName.includes(".test.") || fileName.includes(".spec.")) return true;
  if (relativePath.includes("__tests__/") || relativePath.includes("/test/")) return true;
  if (relativePath.includes("/tests/")) return true;
  return false;
}

/**
 * Detect if a file is a config file.
 */
function detectConfigFile(fileName: string, extension: string): boolean {
  if (CRITICAL_FILES.has(fileName)) return true;
  if (CONFIG_EXTENSIONS.has(extension)) return true;
  if (fileName.startsWith(".") && !fileName.startsWith(".git")) return true;
  return false;
}

/**
 * Find files matching a pattern.
 */
export function findFiles(
  index: FileIndex,
  pattern: string | RegExp,
  maxResults = 50,
): FileIndexEntry[] {
  const results: FileIndexEntry[] = [];
  const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;

  for (const file of index.files) {
    if (results.length >= maxResults) break;
    if (regex.test(file.path) || regex.test(file.path.split("/").pop() || "")) {
      results.push(file);
    }
  }

  return results;
}

/**
 * Find files by directory.
 */
export function findFilesByDirectory(index: FileIndex, directory: string): FileIndexEntry[] {
  return index.byDirectory.get(directory) || [];
}

/**
 * Find files by extension.
 */
export function findFilesByExtension(index: FileIndex, extension: string): FileIndexEntry[] {
  return index.byExtension.get(extension) || [];
}
