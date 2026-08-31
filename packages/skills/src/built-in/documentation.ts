/**
 * DEVBYAI Documentation Skill
 *
 * Provides documentation guidance and best practices.
 */

import type { Skill, SkillInstructions, SkillMetadata } from "../types.js";

export const documentationMetadata: SkillMetadata = {
  id: "documentation",
  name: "Documentation",
  description: "Documentation best practices and conventions",
  priority: 70,
  applicableProjectTypes: ["typescript", "javascript", "node", "python", "go", "rust"],
  applicableAgentRoles: ["planner", "builder", "reviewer"],
};

export class DocumentationSkill implements Skill {
  readonly metadata = documentationMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Update documentation for implemented features",
        "Keep documentation accurate and current",
        "Do not claim features that are not implemented",
        "Use clear and concise language",
      ],
      bestPractices: [
        "Include usage examples",
        "Document configuration options",
        "Explain architecture decisions",
        "Keep README up to date",
      ],
      rules: [
        "Do not document future features as complete",
        "Keep documentation in sync with code",
        "Use consistent formatting",
      ],
    };
  }

  appliesTo(_projectType: string): boolean {
    return true; // Documentation applies to all project types
  }
}
