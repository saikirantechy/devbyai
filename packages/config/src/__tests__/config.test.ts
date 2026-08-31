import { describe, expect, it } from "vitest";
import { getConfig, getDefaultConfig, loadConfig } from "../index.js";

describe("Config", () => {
  it("returns default config", () => {
    const config = getDefaultConfig();
    expect(config.provider).toBe("mock");
    expect(config.model).toBe("mock");
    expect(config.permissions?.write).toBe("ask");
    expect(config.permissions?.execute).toBe("ask");
  });

  it("getConfig returns current config", () => {
    // getConfig returns whatever was last loaded (defaults if nothing loaded)
    const config = getConfig();
    expect(config).toBeDefined();
    expect(config.provider).toBeDefined();
  });

  it("loadConfig loads from devbyai.json if present", async () => {
    // In the test root there's no devbyai.json, so defaults are used
    const config = await loadConfig(process.cwd());
    expect(config.provider).toBe("mock");
  });
});
