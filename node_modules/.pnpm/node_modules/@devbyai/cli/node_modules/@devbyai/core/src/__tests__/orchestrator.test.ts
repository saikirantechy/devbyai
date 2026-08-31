import { getDefaultConfig } from "@devbyai/config";
import { MockProvider } from "@devbyai/models";
import { createDefaultToolRegistry } from "@devbyai/tools";
import { describe, expect, it } from "vitest";
import { Orchestrator } from "../orchestrator.js";

describe("Orchestrator", () => {
  it("executes a task through the pipeline", async () => {
    const provider = new MockProvider();
    await provider.initialize({});
    const tools = createDefaultToolRegistry();
    const config = getDefaultConfig();

    const orchestrator = new Orchestrator({
      config,
      provider,
      tools,
      cwd: process.cwd(),
    });

    const result = await orchestrator.execute("Build authentication");

    expect(result.success).toBe(true);
    expect(result.phases.length).toBeGreaterThan(0);
    expect(result.totalDuration).toBeGreaterThanOrEqual(0);
  });

  it("all phases succeed with mock provider", async () => {
    const provider = new MockProvider();
    await provider.initialize({});
    const tools = createDefaultToolRegistry();
    const config = getDefaultConfig();

    const orchestrator = new Orchestrator({
      config,
      provider,
      tools,
      cwd: process.cwd(),
    });

    const result = await orchestrator.execute("test task");

    for (const phase of result.phases) {
      expect(phase.success).toBe(true);
    }
  });

  it("returns correct phase names", async () => {
    const provider = new MockProvider();
    await provider.initialize({});
    const tools = createDefaultToolRegistry();
    const config = getDefaultConfig();

    const orchestrator = new Orchestrator({
      config,
      provider,
      tools,
      cwd: process.cwd(),
    });

    const result = await orchestrator.execute("test");
    const phaseNames = result.phases.map((p) => p.phase);

    expect(phaseNames).toContain("explore");
    expect(phaseNames).toContain("plan");
    expect(phaseNames).toContain("build");
    expect(phaseNames).toContain("review");
    expect(phaseNames).toContain("test");
    expect(phaseNames).toContain("ship");
  });
});
