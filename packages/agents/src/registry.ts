/**
 * DEVBYAI Agent Registry
 *
 * Central registry for managing and retrieving agents.
 */

import type { Agent, AgentMetadata } from "./types.js";

export class AgentRegistry {
  private agents = new Map<string, Agent>();

  /**
   * Register an agent.
   */
  register(agent: Agent): void {
    if (this.agents.has(agent.metadata.id)) {
      throw new Error(`Agent already registered: ${agent.metadata.id}`);
    }
    this.agents.set(agent.metadata.id, agent);
  }

  /**
   * Get an agent by ID.
   */
  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /**
   * List all registered agent IDs.
   */
  listIds(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * List all agent metadata.
   */
  listMetadata(): AgentMetadata[] {
    return Array.from(this.agents.values()).map((a) => a.metadata);
  }

  /**
   * Get agents by role.
   */
  getByRole(role: string): Agent[] {
    return Array.from(this.agents.values()).filter((a) => a.metadata.role === role);
  }

  /**
   * Check if an agent is registered.
   */
  has(id: string): boolean {
    return this.agents.has(id);
  }

  /**
   * Get the count of registered agents.
   */
  count(): number {
    return this.agents.size;
  }
}

/**
 * Create a default agent registry with built-in agents.
 */
export function createDefaultAgentRegistry(): AgentRegistry {
  const registry = new AgentRegistry();
  // Built-in agents will be registered here
  return registry;
}
