/**
 * DEVBYAI Code Review Skill
 *
 * Provides code review guidance and best practices.
 */

import type { Skill, SkillInstructions, SkillMetadata } from "../types.js";

export const codeReviewMetadata: SkillMetadata = {
  id: "code-review",
  name: "Code Review",
  description: "Code review best practices and quality checks",
  priority: 80,
  applicableProjectTypes: ["typescript", "javascript", "node", "python", "go", "rust"],
  applicableAgentRoles: ["reviewer"],
};

export class CodeReviewSkill implements Skill {
  readonly metadata = codeReviewMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Check for potential errors and bugs",
        "Verify imports and dependencies",
        "Look for inconsistent patterns",
        "Identify potential security issues",
        "Suggest improvements when appropriate",
      ],
      bestPractices: [
        "Focus on correctness over style",
        "Check edge cases",
        "Verify error handling",
        "Review naming conventions",
      ],
      rules: [
        "Do not claim code is correct without evidence",
        "Report actual issues found",
        "Suggest specific improvements",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "javascript", "node", "python", "go", "rust"].includes(projectType);
  }
}
