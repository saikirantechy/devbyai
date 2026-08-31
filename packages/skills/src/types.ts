/**
 * DEVBYAI Skill Types
 *
 * Defines the core skill abstraction for reusable development knowledge.
 */

export interface SkillMetadata {
  /** Unique skill identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of skill purpose */
  description: string;
  /** Priority (higher = more important) */
  priority: number;
  /** Project types this skill applies to */
  applicableProjectTypes: string[];
  /** Agent roles this skill supports */
  applicableAgentRoles: string[];
}

export interface SkillInstructions {
  /** Core instructions for the AI */
  instructions: string[];
  /** Best practices */
  bestPractices?: string[];
  /** Rules to follow */
  rules?: string[];
}

/**
 * Base Skill interface that all skills must implement.
 */
export interface Skill {
  /** Skill metadata */
  readonly metadata: SkillMetadata;

  /**
   * Get the skill's instructions.
   */
  getInstructions(): SkillInstructions;

  /**
   * Check if this skill applies to a project type.
   */
  appliesTo(projectType: string): boolean;
}
