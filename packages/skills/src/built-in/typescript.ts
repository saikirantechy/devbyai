/**
 * DEVBYAI TypeScript Skill
 *
 * Provides TypeScript-specific guidance and best practices.
 */

import type { Skill, SkillInstructions, SkillMetadata } from "../types.js";

export const typescriptMetadata: SkillMetadata = {
  id: "typescript",
  name: "TypeScript",
  description: "TypeScript best practices and conventions",
  priority: 100,
  applicableProjectTypes: ["typescript", "node"],
  applicableAgentRoles: ["explorer", "planner", "builder", "reviewer"],
};

export class TypeScriptSkill implements Skill {
  readonly metadata = typescriptMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use strict TypeScript typing",
        "Avoid `any` type — use `unknown` and narrow with type guards",
        "Prefer interfaces over type aliases for object shapes",
        "Use discriminated unions for complex state",
        "Leverage TypeScript utility types where appropriate",
      ],
      bestPractices: [
        "Follow existing project conventions",
        "Use explicit return types for public functions",
        "Prefer readonly for immutable data",
        "Use optional chaining and nullish coalescing",
      ],
      rules: [
        "Do not use `@ts-ignore` or `@ts-expect-error` without justification",
        "Do not cast to `any` to bypass type checking",
        "Prefer existing utilities over creating new ones",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return projectType === "typescript" || projectType === "node";
  }
}
