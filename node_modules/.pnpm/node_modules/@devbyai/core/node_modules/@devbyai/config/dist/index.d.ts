/**
 * DEVBYAI Configuration
 *
 * Handles loading and managing the devbyai.json configuration file.
 */
interface DevByAIConfig {
    /** Default AI provider */
    provider?: string;
    /** Default model */
    model?: string;
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
/**
 * Load configuration from a devbyai.json file.
 */
declare function loadConfig(cwd: string): Promise<DevByAIConfig>;
/**
 * Get the current loaded configuration.
 */
declare function getConfig(): DevByAIConfig;
/**
 * Get the default configuration (useful for tests).
 */
declare function getDefaultConfig(): DevByAIConfig;

export { type DevByAIConfig as Config, type DevByAIConfig, getConfig, getDefaultConfig, loadConfig };
