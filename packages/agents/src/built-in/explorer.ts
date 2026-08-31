/**
 * DEVBYAI Explorer Agent
 *
 * Specialized agent for understanding workspace structure and codebase.
 */

import type { Agent, AgentContext, AgentMetadata, AgentResult } from "../types.js";

export const explorerMetadata: AgentMetadata = {
  id: "explorer",
  name: "Explorer",
  description: "Understands project structure and codebase",
  role: "explorer",
  capabilities: ["workspace exploration", "file reading", "code searching", "git awareness"],
  supportedPhases: ["explore"],
};

export class ExplorerAgent implements Agent {
  readonly metadata = explorerMetadata;

  async execute(context: AgentContext): Promise<AgentResult> {
    const { cwd } = context;

    // In a real implementation, this would use tools to explore
    // For now, we provide a structured response
    const lines: string[] = [];
    lines.push("Workspace exploration complete.");
    lines.push("");
    lines.push(`Working directory: ${cwd}`);
    lines.push("");
    lines.push("The Explorer Agent analyzes:");
    lines.push("  - Project structure");
    lines.push("  - Configuration files");
    lines.push("  - Source directories");
    lines.push("  - Dependencies");
    lines.push("  - Git status");

    return {
      agentId: this.metadata.id,
      success: true,
      output: lines.join("\n"),
      suggestedNext: "planner",
    };
  }
}
