/**
 * DEVBYAI Error Context
 *
 * Provides structured error context for debugging intelligence.
 */

import type { ErrorContext, FailureRecord } from "./types.js";
import type { FailureMemory } from "./failure-memory.js";

/**
 * Build error context from failure memory.
 */
export function buildErrorContext(failureMemory: FailureMemory): ErrorContext {
  const recentFailures = failureMemory.getRecent(10);
  const latestFailure = failureMemory.getLatest();
  const totalFailures = failureMemory.count();
  const failureTypes = [...new Set(recentFailures.map((f) => f.type))];
  const affectedFiles = failureMemory.getAffectedFiles();

  return {
    latestFailure,
    recentFailures,
    totalFailures,
    failureTypes,
    affectedFiles,
  };
}

/**
 * Get the most relevant failure for a given file path.
 */
export function getRelevantFailure(
  failureMemory: FailureMemory,
  filePath: string,
): FailureRecord | null {
  const recent = failureMemory.getRecent(20);
  
  // First try to find a failure that directly involves this file
  for (const failure of recent) {
    if (failure.failedFiles.some((f) => filePath.includes(f) || f.includes(filePath))) {
      return failure;
    }
    if (failure.relatedFiles.some((f) => filePath.includes(f) || f.includes(filePath))) {
      return failure;
    }
  }

  // Fall back to most recent failure
  return failureMemory.getLatest();
}
