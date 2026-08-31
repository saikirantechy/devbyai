/**
 * DEVBYAI Testing Skill
 *
 * Provides testing guidance and best practices.
 */

import type { Skill, SkillInstructions, SkillMetadata } from "../types.js";

export const testingMetadata: SkillMetadata = {
  id: "testing",
  name: "Testing",
  description: "Testing best practices and conventions",
  priority: 90,
  applicableProjectTypes: ["typescript", "javascript", "node", "python", "go", "rust"],
  applicableAgentRoles: ["planner", "builder", "reviewer"],
};

export class TestingSkill implements Skill {
  readonly metadata = testingMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Identify existing test framework and conventions",
        "Follow existing test file naming patterns",
        "Add tests for meaningful changes",
        "Do not claim tests passed unless actually executed",
        "Suggest relevant test commands when appropriate",
      ],
      bestPractices: [
        "Write unit tests for individual functions",
        "Write integration tests for component interactions",
        "Use descriptive test names",
        "Keep tests independent and isolated",
      ],
      rules: [
        "Never claim tests passed without running them",
        "Respect existing test patterns",
        "Use temporary directories for test fixtures",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "javascript", "node", "python", "go", "rust"].includes(projectType);
  }
}
