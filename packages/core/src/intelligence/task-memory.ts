/**
 * DEVBYAI Task Memory
 *
 * Local task tracking and history management.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { TaskRecord, TaskStatus } from "./types.js";

// Task storage location
const TASK_DIR = ".devbyai/tasks";
const MAX_TASKS = 100;

/**
 * Task Memory manager.
 */
export class TaskMemory {
  private tasks: TaskRecord[] = [];
  private nextId = 1;
  private storagePath: string;

  constructor(cwd: string) {
    this.storagePath = join(cwd, TASK_DIR);
    this.load();
  }

  /**
   * Create a new task.
   */
  create(description: string, workflow: string | null = null): TaskRecord {
    const task: TaskRecord = {
      id: String(this.nextId++).padStart(3, "0"),
      description,
      workflow,
      agents: [],
      skills: [],
      exploredFiles: [],
      modifiedFiles: [],
      commands: [],
      status: "created",
      createdAt: Date.now(),
      completedAt: null,
      duration: null,
    };

    this.tasks.unshift(task);
    this.trimTasks();
    this.save();

    return task;
  }

  /**
   * Get a task by ID.
   */
  get(id: string): TaskRecord | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  /**
   * Update task status.
   */
  updateStatus(id: string, status: TaskStatus): void {
    const task = this.get(id);
    if (!task) return;

    task.status = status;

    if (status === "completed" || status === "failed" || status === "cancelled") {
      task.completedAt = Date.now();
      task.duration = task.completedAt - task.createdAt;
    }

    this.save();
  }

  /**
   * Add an agent to a task.
   */
  addAgent(id: string, agentId: string): void {
    const task = this.get(id);
    if (!task) return;

    if (!task.agents.includes(agentId)) {
      task.agents.push(agentId);
      this.save();
    }
  }

  /**
   * Add a skill to a task.
   */
  addSkill(id: string, skillId: string): void {
    const task = this.get(id);
    if (!task) return;

    if (!task.skills.includes(skillId)) {
      task.skills.push(skillId);
      this.save();
    }
  }

  /**
   * Track an explored file.
   */
  addExploredFile(id: string, filePath: string): void {
    const task = this.get(id);
    if (!task) return;

    if (!task.exploredFiles.includes(filePath)) {
      task.exploredFiles.push(filePath);
      this.save();
    }
  }

  /**
   * Track a modified file.
   */
  addModifiedFile(id: string, filePath: string): void {
    const task = this.get(id);
    if (!task) return;

    if (!task.modifiedFiles.includes(filePath)) {
      task.modifiedFiles.push(filePath);
      this.save();
    }
  }

  /**
   * Track an executed command.
   */
  addCommand(id: string, command: string): void {
    const task = this.get(id);
    if (!task) return;

    task.commands.push(command);
    this.save();
  }

  /**
   * Get recent tasks.
   */
  getRecent(count = 10): TaskRecord[] {
    return this.tasks.slice(0, count);
  }

  /**
   * Get task count.
   */
  count(): number {
    return this.tasks.length;
  }

  /**
   * Get active tasks (not completed/failed/cancelled).
   */
  getActive(): TaskRecord[] {
    return this.tasks.filter((t) => !["completed", "failed", "cancelled"].includes(t.status));
  }

  /**
   * Clear all tasks.
   */
  clear(): void {
    this.tasks = [];
    this.nextId = 1;
    this.save();
  }

  /**
   * Load tasks from disk.
   */
  private load(): void {
    try {
      if (!existsSync(this.storagePath)) return;

      const indexPath = join(this.storagePath, "index.json");
      if (!existsSync(indexPath)) return;

      const data = JSON.parse(readFileSync(indexPath, "utf-8"));
      this.tasks = data.tasks || [];
      this.nextId = data.nextId || this.tasks.length + 1;
    } catch {
      // Start fresh on any error
      this.tasks = [];
      this.nextId = 1;
    }
  }

  /**
   * Save tasks to disk.
   */
  private save(): void {
    try {
      mkdirSync(this.storagePath, { recursive: true });

      const indexPath = join(this.storagePath, "index.json");
      const data = {
        tasks: this.tasks,
        nextId: this.nextId,
        savedAt: Date.now(),
      };

      writeFileSync(indexPath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // Silently fail on write errors
    }
  }

  /**
   * Trim tasks to maximum count.
   */
  private trimTasks(): void {
    if (this.tasks.length > MAX_TASKS) {
      this.tasks = this.tasks.slice(0, MAX_TASKS);
    }
  }
}
