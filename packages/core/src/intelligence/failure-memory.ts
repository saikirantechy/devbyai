/**
 * DEVBYAI Failure Memory
 *
 * Tracks recent validation failures for debugging context.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { FailureRecord } from "./types.js";

const FAILURE_DIR = ".devbyai/failures";
const MAX_FAILURES = 20;

/**
 * Failure Memory manager.
 */
export class FailureMemory {
  private failures: FailureRecord[] = [];
  private nextId = 1;
  private storagePath: string;

  constructor(cwd: string) {
    this.storagePath = join(cwd, FAILURE_DIR);
    this.load();
  }

  /**
   * Record a failure.
   */
  record(failure: Omit<FailureRecord, "id" | "timestamp">): FailureRecord {
    const record: FailureRecord = {
      ...failure,
      id: String(this.nextId++).padStart(3, "0"),
      timestamp: Date.now(),
    };

    this.failures.unshift(record);
    this.trimFailures();
    this.save();

    return record;
  }

  /**
   * Get recent failures.
   */
  getRecent(count = 10): FailureRecord[] {
    return this.failures.slice(0, count);
  }

  /**
   * Get the latest failure.
   */
  getLatest(): FailureRecord | null {
    return this.failures[0] || null;
  }

  /**
   * Get failure count.
   */
  count(): number {
    return this.failures.length;
  }

  /**
   * Get failure count by type.
   */
  countByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const f of this.failures) {
      counts[f.type] = (counts[f.type] || 0) + 1;
    }
    return counts;
  }

  /**
   * Get affected files across all failures.
   */
  getAffectedFiles(): string[] {
    const files = new Set<string>();
    for (const f of this.failures) {
      for (const file of f.failedFiles) files.add(file);
      for (const file of f.relatedFiles) files.add(file);
    }
    return Array.from(files);
  }

  /**
   * Clear all failures.
   */
  clear(): void {
    this.failures = [];
    this.nextId = 1;
    this.save();
  }

  private trimFailures(): void {
    if (this.failures.length > MAX_FAILURES) {
      this.failures = this.failures.slice(0, MAX_FAILURES);
    }
  }

  private load(): void {
    try {
      if (!existsSync(this.storagePath)) return;
      const indexPath = join(this.storagePath, "index.json");
      if (!existsSync(indexPath)) return;
      const data = JSON.parse(readFileSync(indexPath, "utf-8"));
      this.failures = data.failures || [];
      this.nextId = data.nextId || this.failures.length + 1;
    } catch {
      this.failures = [];
      this.nextId = 1;
    }
  }

  private save(): void {
    try {
      mkdirSync(this.storagePath, { recursive: true });
      const indexPath = join(this.storagePath, "index.json");
      const data = {
        failures: this.failures,
        nextId: this.nextId,
        savedAt: Date.now(),
      };
      writeFileSync(indexPath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // silently fail
    }
  }
}
