/**
 * DEVBYAI Planner Agent
 *
 * Specialized agent for creating development plans.
 */

import type { Agent, AgentContext, AgentMetadata, AgentResult } from "../types.js";

export const plannerMetadata: AgentMetadata = {
  id: "planner",
  name: "Planner",
  description: "Creates implementation plans from user requests",
  role: "planner",
  capabilities: ["task analysis", "plan creation", "risk assessment", "file identification"],
  supportedPhases: ["plan"],
};

export class PlannerAgent implements Agent {
  readonly metadata = plannerMetadata;

  async execute(context: AgentContext): Promise<AgentResult> {
    const { request } = context;

    const lines: string[] = [];
    lines.push("Implementation plan created.");
    lines.push("");
    lines.push(`Task: ${request}`);
    lines.push("");
    lines.push("The Planner Agent creates plans by:");
    lines.push("  - Analyzing requirements");
    lines.push("  - Identifying affected files");
    lines.push("  - Breaking work into steps");
    lines.push("  - Assessing risks");
    lines.push("  - Estimating scope");

    return {
      agentId: this.metadata.id,
      success: true,
      output: lines.join("\n"),
      suggestedNext: "builder",
    };
  }
}
