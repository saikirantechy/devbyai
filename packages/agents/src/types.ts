/**
 * DEVBYAI Agent Types
 *
 * Defines the core agent abstraction for specialized development roles.
 */

export type AgentRole = "explorer" | "planner" | "builder" | "reviewer" | "researcher";

export interface AgentMetadata {
  /** Unique agent identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of agent purpose */
  description: string;
  /** Agent role */
  role: AgentRole;
  /** Capabilities this agent supports */
  capabilities: string[];
  /** Phases this agent can handle */
  supportedPhases: string[];
}

export interface AgentContext {
  /** Working directory */
  cwd: string;
  /** User's original request */
  request: string;
  /** Previous phase results */
  previousResults: Array<{ phase: string; output: string }>;
}

export interface AgentResult {
  /** Agent identifier */
  agentId: string;
  /** Success status */
  success: boolean;
  /** Output from the agent */
  output: string;
  /** Suggested next phase or null */
  suggestedNext?: string;
}

/**
 * Base Agent interface that all agents must implement.
 */
export interface Agent {
  /** Agent metadata */
  readonly metadata: AgentMetadata;

  /**
   * Execute the agent's task.
   */
  execute(context: AgentContext): Promise<AgentResult>;
}
