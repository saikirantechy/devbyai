/**
 * DEVBYAI Context Engine
 *
 * Intelligently selects relevant files and context for a given task.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ContextItem,
  ContextPackage,
  FileIndex,
  FileIndexEntry,
  ProjectProfile,
} from "./types.js";

// Context limits
const MAX_FILES = 20;
const MAX_CHARS = 100_000;
const ESTIMATED_CHARS_PER_TOKEN = 4;

/**
 * Build a context package for a given task.
 */
export function buildContext(
  task: string,
  cwd: string,
  profile: ProjectProfile,
  fileIndex: FileIndex,
  recentFiles: string[] = [],
): ContextPackage {
  const items: ContextItem[] = [];
  let estimatedTokens = 0;
  let truncated = false;

  // 1. Direct task matches (filename/path keywords)
  const taskKeywords = extractKeywords(task);
  const directMatches = findDirectMatches(fileIndex, taskKeywords);
  for (const match of directMatches) {
    if (items.length >= MAX_FILES) {
      truncated = true;
      break;
    }
    const preview = readPreview(join(cwd, match.path));
    const item: ContextItem = {
      path: match.path,
      reason: "Direct task match",
      score: calculateScore(match, taskKeywords, "direct"),
      preview,
    };
    items.push(item);
    estimatedTokens += estimateTokens(preview);
  }

  // 2. Recently modified files
  for (const filePath of recentFiles) {
    if (items.length >= MAX_FILES) {
      truncated = true;
      break;
    }
    if (items.some((i) => i.path === filePath)) continue;

    const entry = fileIndex.files.find((f) => f.path === filePath);
    if (entry) {
      const preview = readPreview(join(cwd, filePath));
      const item: ContextItem = {
        path: filePath,
        reason: "Recently modified",
        score: 0.7,
        preview,
      };
      items.push(item);
      estimatedTokens += estimateTokens(preview);
    }
  }

  // 3. Related source files (same directory as matches)
  const matchDirs = new Set(items.map((i) => i.path.split("/").slice(0, -1).join("/")));
  for (const dir of matchDirs) {
    const dirFiles = fileIndex.byDirectory.get(dir) || [];
    for (const file of dirFiles) {
      if (items.length >= MAX_FILES) {
        truncated = true;
        break;
      }
      if (items.some((i) => i.path === file.path)) continue;
      if (file.importance === "low") continue;

      const preview = readPreview(join(cwd, file.path));
      const item: ContextItem = {
        path: file.path,
        reason: "Related to matched files",
        score: calculateScore(file, taskKeywords, "related"),
        preview,
      };
      items.push(item);
      estimatedTokens += estimateTokens(preview);
    }
  }

  // 4. Critical project files (package.json, tsconfig, etc.)
  for (const file of fileIndex.criticalFiles) {
    if (items.length >= MAX_FILES) {
      truncated = true;
      break;
    }
    if (items.some((i) => i.path === file.path)) continue;

    const preview = readPreview(join(cwd, file.path));
    const item: ContextItem = {
      path: file.path,
      reason: "Project configuration",
      score: 0.5,
      preview,
    };
    items.push(item);
    estimatedTokens += estimateTokens(preview);
  }

  // Sort by score (highest first)
  items.sort((a, b) => b.score - a.score);

  // Truncate previews if over budget
  let totalChars = items.reduce((sum, i) => sum + (i.preview?.length || 0), 0);
  if (totalChars > MAX_CHARS) {
    for (const item of items) {
      if (totalChars <= MAX_CHARS) break;
      if (item.preview && item.preview.length > 500) {
        const excess = totalChars - MAX_CHARS;
        item.preview = item.preview.slice(0, Math.max(200, item.preview.length - excess));
        totalChars = items.reduce((sum, i) => sum + (i.preview?.length || 0), 0);
      }
    }
    truncated = true;
  }

  return {
    task,
    items,
    profile,
    estimatedTokens: Math.ceil(estimatedTokens / ESTIMATED_CHARS_PER_TOKEN),
    truncated,
  };
}

/**
 * Extract keywords from a task description.
 */
function extractKeywords(task: string): string[] {
  // Simple keyword extraction: split by spaces, filter common words
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "shall",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "its",
    "our",
    "their",
    "what",
    "which",
    "who",
    "whom",
    "where",
    "when",
    "why",
    "how",
    "for",
    "in",
    "on",
    "at",
    "to",
    "from",
    "by",
    "with",
    "of",
    "and",
    "or",
    "but",
    "not",
    "no",
    "nor",
    "if",
    "then",
    "else",
    "so",
    "add",
    "create",
    "make",
    "implement",
    "build",
    "fix",
    "update",
    "modify",
    "change",
    "remove",
    "delete",
    "show",
    "explain",
    "find",
    "search",
    "check",
    "test",
    "run",
    "list",
    "get",
    "set",
  ]);

  return task
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_./]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/**
 * Find files that directly match task keywords.
 */
function findDirectMatches(fileIndex: FileIndex, keywords: string[]): FileIndexEntry[] {
  const matches: FileIndexEntry[] = [];

  for (const file of fileIndex.files) {
    const pathLower = file.path.toLowerCase();
    const fileName = file.path.split("/").pop()?.toLowerCase() || "";

    for (const keyword of keywords) {
      if (pathLower.includes(keyword) || fileName.includes(keyword)) {
        matches.push(file);
        break;
      }
    }
  }

  // Sort: source files first, then by importance
  matches.sort((a, b) => {
    if (a.isSource && !b.isSource) return -1;
    if (!a.isSource && b.isSource) return 1;
    const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });

  return matches.slice(0, MAX_FILES);
}

/**
 * Calculate a relevance score for a file.
 */
function calculateScore(
  file: FileIndexEntry,
  keywords: string[],
  matchType: "direct" | "related" | "config",
): number {
  let score = 0;

  // Base score by importance
  const importanceScores = { critical: 0.9, high: 0.7, medium: 0.5, low: 0.3 };
  score = importanceScores[file.importance];

  // Boost for source files
  if (file.isSource) score += 0.1;

  // Boost for direct keyword matches
  const pathLower = file.path.toLowerCase();
  for (const keyword of keywords) {
    if (pathLower.includes(keyword)) score += 0.15;
  }

  // Match type adjustment
  if (matchType === "direct") score += 0.2;
  else if (matchType === "related") score += 0.05;

  return Math.min(1, score);
}

/**
 * Read a preview of a file (first N lines).
 */
function readPreview(filePath: string, maxLines = 50): string | undefined {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    return lines.slice(0, maxLines).join("\n");
  } catch {
    return undefined;
  }
}

/**
 * Estimate token count for a string.
 */
function estimateTokens(text: string | undefined): number {
  if (!text) return 0;
  return text.length / ESTIMATED_CHARS_PER_TOKEN;
}
