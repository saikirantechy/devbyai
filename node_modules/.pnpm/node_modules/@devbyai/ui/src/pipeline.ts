/**
 * DEVBYAI Pipeline Renderer
 *
 * Visual pipeline progress display for development phases.
 */

import chalk from "chalk";
import { symbols } from "./symbols.js";

export type PhaseStatus = "complete" | "running" | "waiting" | "error";

export interface PipelineStep {
  /** Phase name */
  name: string;
  /** Current status */
  status: PhaseStatus;
  /** Optional detail message */
  detail?: string;
}

/**
 * Render a single pipeline step.
 */
function renderStep(step: PipelineStep, maxWidth: number): string {
  const name = step.name.padEnd(maxWidth);
  let indicator: string;
  let detail = "";

  switch (step.status) {
    case "complete":
      indicator = chalk.green(symbols.success);
      break;
    case "running":
      indicator = chalk.cyan(symbols.running);
      break;
    case "waiting":
      indicator = chalk.gray(symbols.waiting);
      break;
    case "error":
      indicator = chalk.red(symbols.error);
      break;
  }

  if (step.detail) {
    detail = chalk.gray(` ${symbols.line} ${step.detail}`);
  }

  return `    ${indicator} ${chalk.white(name)}${detail}`;
}

/**
 * Render the full pipeline visualization.
 */
export function renderPipeline(steps: PipelineStep[]): string {
  const maxNameLength = Math.max(...steps.map((s) => s.name.length));
  return steps.map((step) => renderStep(step, maxNameLength)).join("\n");
}

/**
 * Create a pipeline progress tracker.
 *
 * Usage:
 * ```ts
 * const pipeline = createPipeline(["EXPLORE", "PLAN", "BUILD"]);
 * pipeline.start("EXPLORE");
 * // ... do work ...
 * pipeline.complete("EXPLORE");
 * pipeline.start("PLAN");
 * // ... do work ...
 * pipeline.complete("PLAN");
 * console.log(pipeline.render());
 * ```
 */
export class PipelineProgress {
  private steps: Map<string, PhaseStatus> = new Map();
  private details: Map<string, string> = new Map();

  constructor(phaseNames: string[]) {
    for (const name of phaseNames) {
      this.steps.set(name, "waiting");
    }
  }

  /** Mark a phase as running */
  start(name: string): void {
    this.steps.set(name, "running");
  }

  /** Mark a phase as complete */
  complete(name: string, detail?: string): void {
    this.steps.set(name, "complete");
    if (detail) this.details.set(name, detail);
  }

  /** Mark a phase as error */
  error(name: string, detail?: string): void {
    this.steps.set(name, "error");
    if (detail) this.details.set(name, detail);
  }

  /** Get current status of a phase */
  getStatus(name: string): PhaseStatus | undefined {
    return this.steps.get(name);
  }

  /** Check if all phases are complete */
  isComplete(): boolean {
    return Array.from(this.steps.values()).every((s) => s === "complete" || s === "error");
  }

  /** Render the pipeline as a string */
  render(): string {
    const steps: PipelineStep[] = Array.from(this.steps.entries()).map(([name, status]) => ({
      name,
      status,
      detail: this.details.get(name),
    }));
    return renderPipeline(steps);
  }

  /** Print the pipeline to console */
  print(): void {
    console.log(this.render());
  }
}

/**
 * Create a new pipeline progress tracker.
 */
export function createPipeline(phaseNames: string[]): PipelineProgress {
  return new PipelineProgress(phaseNames);
}
