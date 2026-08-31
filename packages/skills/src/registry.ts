/**
 * DEVBYAI Skill Registry
 *
 * Central registry for managing and retrieving skills.
 */

import type { Skill, SkillMetadata } from "./types.js";

export class SkillRegistry {
  private skills = new Map<string, Skill>();

  /**
   * Register a skill.
   */
  register(skill: Skill): void {
    if (this.skills.has(skill.metadata.id)) {
      throw new Error(`Skill already registered: ${skill.metadata.id}`);
    }
    this.skills.set(skill.metadata.id, skill);
  }

  /**
   * Get a skill by ID.
   */
  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  /**
   * List all registered skill IDs.
   */
  listIds(): string[] {
    return Array.from(this.skills.keys());
  }

  /**
   * List all skill metadata.
   */
  listMetadata(): SkillMetadata[] {
    return Array.from(this.skills.values()).map((s) => s.metadata);
  }

  /**
   * Check if a skill is registered.
   */
  has(id: string): boolean {
    return this.skills.has(id);
  }
}

/**
 * Resolve skills for a given project type and agent role.
 * Returns skills sorted by priority (highest first).
 */
export function resolveSkills(
  registry: SkillRegistry,
  projectType: string,
  agentRole?: string,
): Skill[] {
  const allSkills = registry
    .listIds()
    .map((id) => registry.get(id))
    .filter((skill): skill is Skill => skill !== undefined)
    .filter((skill) => {
      // Check if skill applies to this project type
      if (!skill.appliesTo(projectType)) return false;

      // Check if skill applies to this agent role (if specified)
      if (agentRole && !skill.metadata.applicableAgentRoles.includes(agentRole)) return false;

      return true;
    });

  // Sort by priority (highest first)
  return allSkills.sort((a, b) => b.metadata.priority - a.metadata.priority);
}
