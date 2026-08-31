import { describe, expect, it } from "vitest";
import { MockProvider, createDefaultProviderRegistry } from "../index.js";

describe("MockProvider", () => {
  it("has correct id and name", () => {
    const provider = new MockProvider();
    expect(provider.id).toBe("mock");
    expect(provider.name).toBe("Mock Provider");
  });

  it("initializes without error", async () => {
    const provider = new MockProvider();
    await expect(provider.initialize({})).resolves.toBeUndefined();
  });

  it("lists models", async () => {
    const provider = new MockProvider();
    const models = await provider.listModels();
    expect(models).toEqual(["mock-default", "mock-fast", "mock-precise"]);
  });

  it("returns default model", () => {
    const provider = new MockProvider();
    expect(provider.getModel()).toBe("mock-default");
  });

  it("generates a response", async () => {
    const provider = new MockProvider();
    const response = await provider.generate([{ role: "user", content: "Hello" }]);
    expect(response.content).toContain("[MOCK]");
    expect(response.provider).toBe("mock");
    expect(response.model).toBe("mock-default");
    expect(response.usage).toBeDefined();
  });

  it("handles explore-related input", async () => {
    const provider = new MockProvider();
    const response = await provider.generate([{ role: "user", content: "explore the codebase" }]);
    expect(response.content).toContain("Exploring");
  });

  it("handles plan-related input", async () => {
    const provider = new MockProvider();
    const response = await provider.generate([{ role: "user", content: "create a plan" }]);
    expect(response.content).toContain("Plan");
  });

  it("streams responses", async () => {
    const provider = new MockProvider();
    const chunks: string[] = [];
    for await (const chunk of provider.stream([{ role: "user", content: "hello" }])) {
      if (chunk.content) chunks.push(chunk.content);
      if (chunk.done) break;
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join("")).toContain("[MOCK]");
  });
});

describe("ProviderRegistry", () => {
  it("registers and creates providers", () => {
    const registry = createDefaultProviderRegistry();
    expect(registry.listIds()).toContain("mock");

    const provider = registry.create("mock");
    expect(provider).toBeDefined();
    expect(provider?.id).toBe("mock");
  });

  it("returns undefined for unknown provider", () => {
    const registry = createDefaultProviderRegistry();
    const provider = registry.create("nonexistent");
    expect(provider).toBeUndefined();
  });
});
