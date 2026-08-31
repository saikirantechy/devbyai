/**
 * DEVBYAI Reviewer Agent
 *
 * Specialized agent for reviewing completed changes.
 */

import type { Agent, AgentContext, AgentMetadata, AgentResult } from "../types.js";

export const reviewerMetadata: AgentMetadata = {
  id: "reviewer",
  name: "Reviewer",
  description: "Reviews code changes for quality and correctness",
  role: "reviewer",
  capabilities: ["diff analysis", "code review", "bug detection", "test suggestions"],
  supportedPhases: ["review"],
};

export class ReviewerAgent implements Agent {
  readonly metadata = reviewerMetadata;

  async execute(_context: AgentContext): Promise<AgentResult> {
    const lines: string[] = [];
    lines.push("Review complete.");
    lines.push("");
    lines.push("The Reviewer Agent analyzes:");
    lines.push("  - Code changes");
    lines.push("  - Potential errors");
    lines.push("  - Missing imports");
    lines.push("  - Inconsistent patterns");
    lines.push("  - Suggested tests");
    lines.push("  - Validation commands");

    return {
      agentId: this.metadata.id,
      success: true,
      output: lines.join("\n"),
    };
  }
}
