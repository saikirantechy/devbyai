/**
 * DEVBYAI Configuration
 *
 * Handles loading and managing the devbyai.json configuration file.
 */

export interface ProviderConfig {
  /** Provider identifier */
  id: string;
  /** API key (prefer environment variables) */
  apiKey?: string;
  /** Custom base URL */
  baseUrl?: string;
  /** Default model */
  model?: string;
}

export interface DevByAIConfig {
  /** Default AI provider */
  provider?: string;
  /** Default model */
  model?: string;
  /** Provider configurations */
  providers?: Record<string, ProviderConfig>;
  /** Workspace settings */
  workspace?: {
    /** Root directory override */
    root?: string;
  };
  /** Permission preferences */
  permissions?: {
    /** How to handle file writes */
    write?: "ask" | "auto" | "deny";
    /** How to handle command execution */
    execute?: "ask" | "auto" | "deny";
    /** How to handle network access */
    network?: "ask" | "auto" | "deny";
  };
  /** Pipeline phase overrides */
  pipeline?: {
    /** Phases to skip by default */
    skip?: string[];
    /** Phases that require user approval */
    requireApproval?: string[];
  };
}

const DEFAULT_CONFIG: DevByAIConfig = {
  provider: "mock",
  model: "mock",
  providers: {},
  permissions: {
    write: "ask",
    execute: "ask",
    network: "ask",
  },
  pipeline: {
    skip: [],
    requireApproval: [],
  },
};

let _config: DevByAIConfig = { ...DEFAULT_CONFIG };

/**
 * Load configuration from a devbyai.json file.
 */
export async function loadConfig(cwd: string): Promise<DevByAIConfig> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const configPath = path.resolve(cwd, "devbyai.json");

  try {
    const raw = await fs.readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw) as DevByAIConfig;
    _config = { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    // No config file found — use defaults silently
    _config = { ...DEFAULT_CONFIG };
  }

  // Override with environment variables
  if (process.env.DEVBYAI_PROVIDER) {
    _config.provider = process.env.DEVBYAI_PROVIDER;
  }
  if (process.env.DEVBYAI_MODEL) {
    _config.model = process.env.DEVBYAI_MODEL;
  }

  return _config;
}

/**
 * Get the current loaded configuration.
 */
export function getConfig(): DevByAIConfig {
  return _config;
}

/**
 * Get the default configuration (useful for tests).
 */
export function getDefaultConfig(): DevByAIConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * Get API key for a provider from environment variables.
 * Returns undefined if not found.
 */
export function getApiKey(provider: string): string | undefined {
  const envVarMap: Record<string, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    google: "GOOGLE_API_KEY",
  };

  const envVar = envVarMap[provider];
  if (envVar) {
    return process.env[envVar];
  }

  // Generic fallback
  return process.env[`${provider.toUpperCase()}_API_KEY`];
}

export type { DevByAIConfig as Config };
