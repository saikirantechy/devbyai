/**
 * Workflow System Tests
 *
 * Tests for the WorkflowRegistry, workflow selection, and built-in workflows.
 */

import { describe, expect, it } from "vitest";
import {
  DEVELOPMENT_WORKFLOW,
  EXPLORE_WORKFLOW,
  PLAN_WORKFLOW,
  REVIEW_WORKFLOW,
  WorkflowRegistry,
} from "../workflows.js";

describe("Built-in Workflows", () => {
  it("should have correct metadata", () => {
    expect(EXPLORE_WORKFLOW.metadata.id).toBe("explore");
    expect(PLAN_WORKFLOW.metadata.id).toBe("plan");
    expect(DEVELOPMENT_WORKFLOW.metadata.id).toBe("development");
    expect(REVIEW_WORKFLOW.metadata.id).toBe("review");
  });

  it("should have steps", () => {
    expect(EXPLORE_WORKFLOW.steps.length).toBe(1);
    expect(PLAN_WORKFLOW.steps.length).toBe(2);
    expect(DEVELOPMENT_WORKFLOW.steps.length).toBe(4);
    expect(REVIEW_WORKFLOW.steps.length).toBe(2);
  });
});

describe("WorkflowRegistry", () => {
  it("should register built-in workflows", () => {
    const registry = new WorkflowRegistry();
    const ids = registry.listIds();

    expect(ids).toContain("explore");
    expect(ids).toContain("plan");
    expect(ids).toContain("development");
    expect(ids).toContain("review");
  });

  it("should get workflow by ID", () => {
    const registry = new WorkflowRegistry();

    expect(registry.get("explore")).toBe(EXPLORE_WORKFLOW);
    expect(registry.get("plan")).toBe(PLAN_WORKFLOW);
    expect(registry.get("development")).toBe(DEVELOPMENT_WORKFLOW);
    expect(registry.get("review")).toBe(REVIEW_WORKFLOW);
  });

  it("should return undefined for unknown workflow", () => {
    const registry = new WorkflowRegistry();
    expect(registry.get("unknown")).toBeUndefined();
  });

  it("should list all workflow metadata", () => {
    const registry = new WorkflowRegistry();
    const metadata = registry.listMetadata();

    expect(metadata.length).toBe(4);
    expect(metadata.some((m) => m.name === "Explore")).toBe(true);
    expect(metadata.some((m) => m.name === "Development")).toBe(true);
  });

  it("should register custom workflows", () => {
    const registry = new WorkflowRegistry();
    const custom = {
      metadata: {
        id: "custom",
        name: "Custom",
        description: "A custom workflow",
        taskPatterns: ["custom"],
      },
      steps: [],
    };

    registry.register(custom);
    expect(registry.get("custom")).toBe(custom);
  });
});

describe("Workflow Selection", () => {
  it("should select explore workflow for explanation tasks", () => {
    const registry = new WorkflowRegistry();
    const workflow = registry.selectForTask("Explain this project");

    expect(workflow.metadata.id).toBe("explore");
  });

  it("should select plan workflow for planning tasks", () => {
    const registry = new WorkflowRegistry();
    const workflow = registry.selectForTask("Create a plan for authentication");

    expect(workflow.metadata.id).toBe("plan");
  });

  it("should select development workflow for implementation tasks", () => {
    const registry = new WorkflowRegistry();
    const workflow = registry.selectForTask("Implement the login feature");

    expect(workflow.metadata.id).toBe("development");
  });

  it("should select review workflow for review tasks", () => {
    const registry = new WorkflowRegistry();
    const workflow = registry.selectForTask("Review the code changes");

    expect(workflow.metadata.id).toBe("review");
  });

  it("should default to development workflow for unmatched tasks", () => {
    const registry = new WorkflowRegistry();
    const workflow = registry.selectForTask("do something random");

    expect(workflow.metadata.id).toBe("development");
  });

  it("should be case-insensitive", () => {
    const registry = new WorkflowRegistry();

    expect(registry.selectForTask("EXPLAIN THIS").metadata.id).toBe("explore");
    expect(registry.selectForTask("build it").metadata.id).toBe("development");
    expect(registry.selectForTask("REVIEW CODE").metadata.id).toBe("review");
  });
});
