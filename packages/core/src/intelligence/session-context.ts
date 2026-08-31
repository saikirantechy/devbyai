/**
 * DEVBYAI Session Context
 *
 * Manages the current session state including recent files, changes, and active context.
 */

import type { SessionContext } from "./types.js";

// Maximum items to track
const MAX_RECENT_FILES = 50;
const MAX_RECENT_MODIFICATIONS = 30;

/**
 * Session Context Manager.
 */
export class SessionManager {
  private context: SessionContext;

  constructor(workspacePath: string) {
    this.context = {
      workspacePath,
      currentTaskId: null,
      recentFiles: [],
      recentModifications: [],
      activeWorkflow: null,
      activeSkills: [],
      startedAt: Date.now(),
      taskCount: 0,
    };
  }

  /**
   * Get the current session context.
   */
  getContext(): SessionContext {
    return { ...this.context };
  }

  /**
   * Set the current task ID.
   */
  setCurrentTask(taskId: string | null): void {
    this.context.currentTaskId = taskId;
    if (taskId) {
      this.context.taskCount++;
    }
  }

  /**
   * Track a recently accessed file.
   */
  trackFileAccess(filePath: string): void {
    // Remove if already exists
    this.context.recentFiles = this.context.recentFiles.filter((f) => f !== filePath);

    // Add to front
    this.context.recentFiles.unshift(filePath);

    // Trim
    if (this.context.recentFiles.length > MAX_RECENT_FILES) {
      this.context.recentFiles = this.context.recentFiles.slice(0, MAX_RECENT_FILES);
    }
  }

  /**
   * Track a file modification.
   */
  trackModification(filePath: string): void {
    // Remove if already exists
    this.context.recentModifications = this.context.recentModifications.filter(
      (f) => f !== filePath,
    );

    // Add to front
    this.context.recentModifications.unshift(filePath);

    // Trim
    if (this.context.recentModifications.length > MAX_RECENT_MODIFICATIONS) {
      this.context.recentModifications = this.context.recentModifications.slice(
        0,
        MAX_RECENT_MODIFICATIONS,
      );
    }
  }

  /**
   * Set the active workflow.
   */
  setActiveWorkflow(workflow: string | null): void {
    this.context.activeWorkflow = workflow;
  }

  /**
   * Set active skills.
   */
  setActiveSkills(skills: string[]): void {
    this.context.activeSkills = [...skills];
  }

  /**
   * Get recently accessed files.
   */
  getRecentFiles(count = 10): string[] {
    return this.context.recentFiles.slice(0, count);
  }

  /**
   * Get recently modified files.
   */
  getRecentModifications(count = 10): string[] {
    return this.context.recentModifications.slice(0, count);
  }

  /**
   * Clear the session (but keep workspace).
   */
  clear(): void {
    this.context.currentTaskId = null;
    this.context.recentFiles = [];
    this.context.recentModifications = [];
    this.context.activeWorkflow = null;
    this.context.activeSkills = [];
  }

  /**
   * Get session duration in milliseconds.
   */
  getDuration(): number {
    return Date.now() - this.context.startedAt;
  }

  /**
   * Get session summary.
   */
  getSummary(): {
    workspace: string;
    duration: number;
    taskCount: number;
    recentFileCount: number;
    recentModificationCount: number;
  } {
    return {
      workspace: this.context.workspacePath,
      duration: this.getDuration(),
      taskCount: this.context.taskCount,
      recentFileCount: this.context.recentFiles.length,
      recentModificationCount: this.context.recentModifications.length,
    };
  }
}
