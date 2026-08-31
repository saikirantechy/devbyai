/**
 * @devbyai/skills
 *
 * Reusable skills for DEVBYAI.
 * Provides TypeScript, Testing, Code Review, and Documentation skills.
 */

// Types
export type { Skill, SkillMetadata, SkillInstructions } from "./types.js";

// Registry
export { SkillRegistry, resolveSkills } from "./registry.js";

// Built-in skills
export { TypeScriptSkill, typescriptMetadata } from "./built-in/typescript.js";
export { TestingSkill, testingMetadata } from "./built-in/testing.js";
export { CodeReviewSkill, codeReviewMetadata } from "./built-in/code-review.js";
export { DocumentationSkill, documentationMetadata } from "./built-in/documentation.js";

import { CodeReviewSkill } from "./built-in/code-review.js";
import { DocumentationSkill } from "./built-in/documentation.js";
import { TestingSkill } from "./built-in/testing.js";
import { TypeScriptSkill } from "./built-in/typescript.js";
import { SkillRegistry } from "./registry.js";

/**
 * Create a registry with all built-in skills.
 */
export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new TestingSkill());
  registry.register(new CodeReviewSkill());
  registry.register(new DocumentationSkill());
  return registry;
}
