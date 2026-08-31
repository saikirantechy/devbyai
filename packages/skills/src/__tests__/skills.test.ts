/**
 * Skill System Tests
 *
 * Tests for the Skill interface, registry, resolver, and built-in skills.
 */

import { describe, expect, it } from "vitest";
import {
  CodeReviewSkill,
  DocumentationSkill,
  SkillRegistry,
  TestingSkill,
  TypeScriptSkill,
  createBuiltInSkillRegistry,
  resolveSkills,
} from "../index.js";

describe("SkillRegistry", () => {
  it("should register and retrieve skills", () => {
    const registry = new SkillRegistry();
    const skill = new TypeScriptSkill();

    registry.register(skill);

    expect(registry.has("typescript")).toBe(true);
    expect(registry.get("typescript")).toBe(skill);
  });

  it("should throw when registering duplicate skill", () => {
    const registry = new SkillRegistry();
    const skill = new TypeScriptSkill();

    registry.register(skill);

    expect(() => registry.register(skill)).toThrow("Skill already registered");
  });

  it("should list all skill IDs", () => {
    const registry = createBuiltInSkillRegistry();
    const ids = registry.listIds();

    expect(ids).toContain("typescript");
    expect(ids).toContain("testing");
    expect(ids).toContain("code-review");
    expect(ids).toContain("documentation");
  });

  it("should list all skill metadata", () => {
    const registry = createBuiltInSkillRegistry();
    const metadata = registry.listMetadata();

    expect(metadata.length).toBe(4);
    expect(metadata.some((m) => m.id === "typescript")).toBe(true);
    expect(metadata.some((m) => m.id === "testing")).toBe(true);
  });
});

describe("Built-in Skills", () => {
  describe("TypeScriptSkill", () => {
    it("should have correct metadata", () => {
      const skill = new TypeScriptSkill();
      expect(skill.metadata.id).toBe("typescript");
      expect(skill.metadata.name).toBe("TypeScript");
      expect(skill.metadata.priority).toBe(100);
    });

    it("should apply to TypeScript projects", () => {
      const skill = new TypeScriptSkill();
      expect(skill.appliesTo("typescript")).toBe(true);
    });

    it("should not apply to Python projects", () => {
      const skill = new TypeScriptSkill();
      expect(skill.appliesTo("python")).toBe(false);
    });

    it("should return instructions", () => {
      const skill = new TypeScriptSkill();
      const instructions = skill.getInstructions();

      expect(instructions.instructions.length).toBeGreaterThan(0);
      expect(instructions.bestPractices).toBeDefined();
      expect(instructions.rules).toBeDefined();
    });
  });

  describe("TestingSkill", () => {
    it("should have correct metadata", () => {
      const skill = new TestingSkill();
      expect(skill.metadata.id).toBe("testing");
      expect(skill.metadata.name).toBe("Testing");
    });

    it("should apply to TypeScript projects", () => {
      const skill = new TestingSkill();
      expect(skill.appliesTo("typescript")).toBe(true);
    });

    it("should apply to JavaScript projects", () => {
      const skill = new TestingSkill();
      expect(skill.appliesTo("javascript")).toBe(true);
    });
  });

  describe("CodeReviewSkill", () => {
    it("should have correct metadata", () => {
      const skill = new CodeReviewSkill();
      expect(skill.metadata.id).toBe("code-review");
      expect(skill.metadata.name).toBe("Code Review");
    });

    it("should apply to TypeScript projects", () => {
      const skill = new CodeReviewSkill();
      expect(skill.appliesTo("typescript")).toBe(true);
    });
  });

  describe("DocumentationSkill", () => {
    it("should have correct metadata", () => {
      const skill = new DocumentationSkill();
      expect(skill.metadata.id).toBe("documentation");
      expect(skill.metadata.name).toBe("Documentation");
    });

    it("should apply to TypeScript projects", () => {
      const skill = new DocumentationSkill();
      expect(skill.appliesTo("typescript")).toBe(true);
    });
  });
});

describe("resolveSkills", () => {
  it("should resolve skills for a project type", () => {
    const registry = createBuiltInSkillRegistry();
    const skills = resolveSkills(registry, "typescript");

    expect(skills.length).toBeGreaterThan(0);
    // TypeScript skill should be first (highest priority)
    expect(skills[0].metadata.id).toBe("typescript");
  });

  it("should sort by priority (highest first)", () => {
    const registry = createBuiltInSkillRegistry();
    const skills = resolveSkills(registry, "typescript");

    for (let i = 1; i < skills.length; i++) {
      expect(skills[i - 1].metadata.priority).toBeGreaterThanOrEqual(skills[i].metadata.priority);
    }
  });

  it("should return only documentation skill for unknown project types", () => {
    const registry = createBuiltInSkillRegistry();
    const skills = resolveSkills(registry, "cobol");

    // Documentation skill applies to all project types
    expect(skills.length).toBe(1);
    expect(skills[0].metadata.id).toBe("documentation");
  });

  it("should filter by agent role when specified", () => {
    const registry = createBuiltInSkillRegistry();
    const skills = resolveSkills(registry, "typescript", "builder");

    // Only skills with "builder" in applicableAgentRoles should be returned
    for (const skill of skills) {
      expect(skill.metadata.applicableAgentRoles).toContain("builder");
    }
  });
});
