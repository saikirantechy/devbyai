// src/index.ts
var DEFAULT_CONFIG = {
  provider: "mock",
  model: "mock",
  permissions: {
    write: "ask",
    execute: "ask",
    network: "ask"
  },
  pipeline: {
    skip: [],
    requireApproval: []
  }
};
var _config = { ...DEFAULT_CONFIG };
async function loadConfig(cwd) {
  const fs = await import("fs/promises");
  const path = await import("path");
  const configPath = path.resolve(cwd, "devbyai.json");
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    _config = { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    _config = { ...DEFAULT_CONFIG };
  }
  return _config;
}
function getConfig() {
  return _config;
}
function getDefaultConfig() {
  return { ...DEFAULT_CONFIG };
}
export {
  getConfig,
  getDefaultConfig,
  loadConfig
};
