/**
 * Agent System Tests
 *
 * Tests for the Agent interface, registry, and built-in agents.
 */

import { describe, expect, it } from "vitest";
import {
  AgentRegistry,
  BuilderAgent,
  ExplorerAgent,
  PlannerAgent,
  ReviewerAgent,
  createBuiltInAgentRegistry,
} from "../index.js";
import type { AgentContext } from "../index.js";

describe("AgentRegistry", () => {
  it("should register and retrieve agents", () => {
    const registry = new AgentRegistry();
    const agent = new ExplorerAgent();

    registry.register(agent);

    expect(registry.has("explorer")).toBe(true);
    expect(registry.get("explorer")).toBe(agent);
  });

  it("should throw when registering duplicate agent", () => {
    const registry = new AgentRegistry();
    const agent = new ExplorerAgent();

    registry.register(agent);

    expect(() => registry.register(agent)).toThrow("Agent already registered");
  });

  it("should list all agent IDs", () => {
    const registry = createBuiltInAgentRegistry();
    const ids = registry.listIds();

    expect(ids).toContain("explorer");
    expect(ids).toContain("planner");
    expect(ids).toContain("builder");
    expect(ids).toContain("reviewer");
  });

  it("should list all agent metadata", () => {
    const registry = createBuiltInAgentRegistry();
    const metadata = registry.listMetadata();

    expect(metadata.length).toBe(4);
    expect(metadata.some((m) => m.role === "explorer")).toBe(true);
    expect(metadata.some((m) => m.role === "planner")).toBe(true);
    expect(metadata.some((m) => m.role === "builder")).toBe(true);
    expect(metadata.some((m) => m.role === "reviewer")).toBe(true);
  });

  it("should get agents by role", () => {
    const registry = createBuiltInAgentRegistry();

    const explorers = registry.getByRole("explorer");
    expect(explorers.length).toBe(1);
    expect(explorers[0].metadata.id).toBe("explorer");
  });

  it("should return correct count", () => {
    const registry = createBuiltInAgentRegistry();
    expect(registry.count()).toBe(4);
  });
});

describe("Built-in Agents", () => {
  const context: AgentContext = {
    cwd: "/test/project",
    request: "Explain this project",
    previousResults: [],
  };

  describe("ExplorerAgent", () => {
    it("should have correct metadata", () => {
      const agent = new ExplorerAgent();
      expect(agent.metadata.id).toBe("explorer");
      expect(agent.metadata.role).toBe("explorer");
      expect(agent.metadata.name).toBe("Explorer");
    });

    it("should execute successfully", async () => {
      const agent = new ExplorerAgent();
      const result = await agent.execute(context);

      expect(result.success).toBe(true);
      expect(result.agentId).toBe("explorer");
      expect(result.output).toContain("Workspace exploration");
      expect(result.suggestedNext).toBe("planner");
    });
  });

  describe("PlannerAgent", () => {
    it("should have correct metadata", () => {
      const agent = new PlannerAgent();
      expect(agent.metadata.id).toBe("planner");
      expect(agent.metadata.role).toBe("planner");
    });

    it("should execute successfully", async () => {
      const agent = new PlannerAgent();
      const result = await agent.execute(context);

      expect(result.success).toBe(true);
      expect(result.agentId).toBe("planner");
      expect(result.output).toContain("Implementation plan");
      expect(result.suggestedNext).toBe("builder");
    });
  });

  describe("BuilderAgent", () => {
    it("should have correct metadata", () => {
      const agent = new BuilderAgent();
      expect(agent.metadata.id).toBe("builder");
      expect(agent.metadata.role).toBe("builder");
    });

    it("should execute successfully", async () => {
      const agent = new BuilderAgent();
      const result = await agent.execute(context);

      expect(result.success).toBe(true);
      expect(result.agentId).toBe("builder");
      expect(result.output).toContain("Implementation ready");
      expect(result.suggestedNext).toBe("reviewer");
    });
  });

  describe("ReviewerAgent", () => {
    it("should have correct metadata", () => {
      const agent = new ReviewerAgent();
      expect(agent.metadata.id).toBe("reviewer");
      expect(agent.metadata.role).toBe("reviewer");
    });

    it("should execute successfully", async () => {
      const agent = new ReviewerAgent();
      const result = await agent.execute(context);

      expect(result.success).toBe(true);
      expect(result.agentId).toBe("reviewer");
      expect(result.output).toContain("Review complete");
    });
  });
});
