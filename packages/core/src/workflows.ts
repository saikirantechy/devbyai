/**
 * DEVBYAI Workflow System
 *
 * Workflows coordinate agents, skills, and pipeline phases.
 */

import { Phase } from "./pipeline.js";

export interface WorkflowStep {
  /** Phase to execute */
  phase: Phase;
  /** Agent to use for this step */
  agentId: string;
  /** Human-readable description */
  description: string;
}

export interface WorkflowMetadata {
  /** Unique workflow identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of workflow purpose */
  description: string;
  /** Task patterns this workflow handles */
  taskPatterns: string[];
}

export interface Workflow {
  /** Workflow metadata */
  readonly metadata: WorkflowMetadata;
  /** Ordered steps in the workflow */
  readonly steps: WorkflowStep[];
}

// ---------------------------------------------------------------------------
// Built-in Workflows
// ---------------------------------------------------------------------------

export const EXPLORE_WORKFLOW: Workflow = {
  metadata: {
    id: "explore",
    name: "Explore",
    description: "Understand the workspace and codebase",
    taskPatterns: ["explain", "explore", "describe", "show", "what is", "how does"],
  },
  steps: [
    { phase: Phase.Explore, agentId: "explorer", description: "Explore workspace structure" },
  ],
};

export const PLAN_WORKFLOW: Workflow = {
  metadata: {
    id: "plan",
    name: "Planning",
    description: "Create an implementation plan",
    taskPatterns: ["plan", "design", "strategy", "approach", "architecture"],
  },
  steps: [
    { phase: Phase.Explore, agentId: "explorer", description: "Explore workspace" },
    { phase: Phase.Plan, agentId: "planner", description: "Create implementation plan" },
  ],
};

export const DEVELOPMENT_WORKFLOW: Workflow = {
  metadata: {
    id: "development",
    name: "Development",
    description: "Full development workflow with implementation",
    taskPatterns: ["implement", "build", "create", "add", "fix", "update", "modify"],
  },
  steps: [
    { phase: Phase.Explore, agentId: "explorer", description: "Explore workspace" },
    { phase: Phase.Plan, agentId: "planner", description: "Create implementation plan" },
    { phase: Phase.Build, agentId: "builder", description: "Implement changes" },
    { phase: Phase.Review, agentId: "reviewer", description: "Review implementation" },
  ],
};

export const REVIEW_WORKFLOW: Workflow = {
  metadata: {
    id: "review",
    name: "Review",
    description: "Review code changes",
    taskPatterns: ["review", "check", "analyze", "audit"],
  },
  steps: [
    { phase: Phase.Explore, agentId: "explorer", description: "Explore changes" },
    { phase: Phase.Review, agentId: "reviewer", description: "Review code" },
  ],
};

// ---------------------------------------------------------------------------
// Workflow Registry
// ---------------------------------------------------------------------------

export class WorkflowRegistry {
  private workflows = new Map<string, Workflow>();

  constructor() {
    // Register built-in workflows
    this.register(EXPLORE_WORKFLOW);
    this.register(PLAN_WORKFLOW);
    this.register(DEVELOPMENT_WORKFLOW);
    this.register(REVIEW_WORKFLOW);
  }

  /**
   * Register a workflow.
   */
  register(workflow: Workflow): void {
    this.workflows.set(workflow.metadata.id, workflow);
  }

  /**
   * Get a workflow by ID.
   */
  get(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  /**
   * List all workflow IDs.
   */
  listIds(): string[] {
    return Array.from(this.workflows.keys());
  }

  /**
   * List all workflow metadata.
   */
  listMetadata(): WorkflowMetadata[] {
    return Array.from(this.workflows.values()).map((w) => w.metadata);
  }

  /**
   * Select the best workflow for a task.
   * Falls back to development workflow if no match found.
   */
  selectForTask(task: string): Workflow {
    const lowerTask = task.toLowerCase();

    for (const workflow of this.workflows.values()) {
      for (const pattern of workflow.metadata.taskPatterns) {
        if (lowerTask.includes(pattern)) {
          return workflow;
        }
      }
    }

    // Default to development workflow
    return this.workflows.get("development") || EXPLORE_WORKFLOW;
  }
}
