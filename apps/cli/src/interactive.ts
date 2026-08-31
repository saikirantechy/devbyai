/**
 * DEVBYAI Interactive Mode
 *
 * Premium interactive terminal experience with readline.
 * Supports slash commands and natural language tasks.
 */

import * as readline from "node:readline";
import { createBuiltInAgentRegistry } from "@devbyai/agents";
import { getApiKey, getConfig, loadConfig } from "@devbyai/config";
import { Orchestrator } from "@devbyai/core";
import { WorkflowRegistry } from "@devbyai/core";
import { createDefaultProviderRegistry } from "@devbyai/models";
import { createBuiltInSkillRegistry, resolveSkills } from "@devbyai/skills";
import { createDefaultToolRegistry } from "@devbyai/tools";
import {
  createPipeline,
  detectWorkspace,
  renderWelcome,
  sectionHeader,
  status,
  symbols,
} from "@devbyai/ui";
import chalk from "chalk";

export interface InteractiveOptions {
  version: string;
  cwd: string;
}

/**
 * Handle /help command.
 */
function handleHelp(): void {
  console.log();
  console.log(`  ${chalk.bold.white("DEVBYAI COMMANDS")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("WORKSPACE")}`);
  console.log(`      ${chalk.cyan("/workspace")}  ${chalk.gray("Show workspace information")}`);
  console.log(
    `      ${chalk.cyan("/status")}     ${chalk.gray("Show workspace and provider status")}`,
  );
  console.log(`      ${chalk.cyan("/pipeline")}   ${chalk.gray("Show the development pipeline")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("AGENTS")}`);
  console.log(`      ${chalk.cyan("/agents")}     ${chalk.gray("List available agents")}`);
  console.log(`      ${chalk.cyan("/skills")}     ${chalk.gray("List active skills")}`);
  console.log(`      ${chalk.cyan("/workflows")}  ${chalk.gray("List available workflows")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("AI")}`);
  console.log(`      ${chalk.cyan("/models")}     ${chalk.gray("View configured AI models")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("SYSTEM")}`);
  console.log(`      ${chalk.cyan("/doctor")}     ${chalk.gray("Check the DEVBYAI environment")}`);
  console.log(`      ${chalk.cyan("/clear")}      ${chalk.gray("Clear the terminal")}`);
  console.log(`      ${chalk.cyan("/help")}       ${chalk.gray("Show this help")}`);
  console.log(`      ${chalk.cyan("/exit")}       ${chalk.gray("Exit DEVBYAI")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("NATURAL LANGUAGE")}`);
  console.log(`      ${chalk.white("Type any task description to execute it.")}`);
  console.log(`      ${chalk.gray("Example:")} ${chalk.white('"Explain this project"')}`);
  console.log();
}

/**
 * Handle /agents command.
 */
function handleAgents(): void {
  const registry = createBuiltInAgentRegistry();

  console.log();
  console.log(sectionHeader("AGENTS"));
  console.log();

  for (const meta of registry.listMetadata()) {
    console.log(
      `    ${chalk.cyan(symbols.bullet)} ${chalk.white.bold(meta.name)} ${chalk.gray(`(${meta.id})`)}`,
    );
    console.log(`      ${chalk.gray(meta.description)}`);
    console.log(
      `      ${chalk.gray("Capabilities:")} ${chalk.white(meta.capabilities.join(", "))}`,
    );
    console.log();
  }
}

/**
 * Handle /skills command.
 */
function handleSkills(options: InteractiveOptions): void {
  const registry = createBuiltInSkillRegistry();
  const workspace = detectWorkspace(options.cwd);

  // Determine project type from workspace features
  const hasTypeScript = workspace.features.some((f) => f.name === "TypeScript" && f.detected);
  const projectType = hasTypeScript ? "typescript" : "unknown";

  const activeSkills = resolveSkills(registry, projectType);

  console.log();
  console.log(sectionHeader("ACTIVE SKILLS"));
  console.log();

  if (activeSkills.length === 0) {
    console.log(`    ${chalk.gray("No skills active for current project type.")}`);
  } else {
    for (const skill of activeSkills) {
      console.log(
        `    ${chalk.cyan(symbols.bullet)} ${chalk.white.bold(skill.metadata.name)} ${chalk.gray(`(priority: ${skill.metadata.priority})`)}`,
      );
      console.log(`      ${chalk.gray(skill.metadata.description)}`);
    }
  }

  console.log();
  console.log(`    ${chalk.gray("Available skills:")} ${registry.listIds().join(", ")}`);
  console.log();
}

/**
 * Handle /workflows command.
 */
function handleWorkflows(): void {
  const registry = new WorkflowRegistry();

  console.log();
  console.log(sectionHeader("WORKFLOWS"));
  console.log();

  for (const meta of registry.listMetadata()) {
    console.log(
      `    ${chalk.cyan(symbols.bullet)} ${chalk.white.bold(meta.name)} ${chalk.gray(`(${meta.id})`)}`,
    );
    console.log(`      ${chalk.gray(meta.description)}`);
    console.log();
  }
}

/**
 * Handle /status command.
 */
function handleStatus(options: InteractiveOptions): void {
  const workspace = detectWorkspace(options.cwd);
  const config = getConfig();
  const providerId = config.provider || "mock";
  const apiKey = getApiKey(providerId);

  console.log();
  console.log(sectionHeader("STATUS"));
  console.log();
  console.log(`    ${chalk.gray("Version:")}   ${chalk.white(`v${options.version}`)}`);
  console.log(`    ${chalk.gray("Workspace:")} ${chalk.white(workspace.name)}`);
  console.log(`    ${chalk.gray("Location:")}  ${chalk.white(options.cwd)}`);
  console.log(`    ${chalk.gray("Provider:")}  ${chalk.white(providerId)}`);
  console.log(`    ${chalk.gray("Model:")}     ${chalk.white(config.model || "mock")}`);

  if (providerId === "mock") {
    console.log(`    ${chalk.gray("Status:")}    ${chalk.yellow("Development Mode")}`);
  } else if (apiKey) {
    console.log(`    ${chalk.gray("Status:")}    ${chalk.green("Ready")}`);
  } else {
    console.log(`    ${chalk.gray("Status:")}    ${chalk.yellow("API key not configured")}`);
  }
  console.log();
}

/**
 * Handle /workspace command.
 */
function handleWorkspace(options: InteractiveOptions): void {
  const workspace = detectWorkspace(options.cwd);

  console.log();
  console.log(sectionHeader("WORKSPACE"));
  console.log();
  console.log(`    ${chalk.gray("Name:")}       ${chalk.white(workspace.name)}`);
  console.log(`    ${chalk.gray("Location:")}   ${chalk.white(options.cwd)}`);
  console.log(
    `    ${chalk.gray("Git:")}        ${chalk.white(workspace.features.find((f) => f.name === "Git")?.detected ? "Yes" : "No")}`,
  );
  console.log(
    `    ${chalk.gray("TypeScript:")} ${chalk.white(workspace.features.find((f) => f.name === "TypeScript")?.detected ? "Yes" : "No")}`,
  );
  console.log(
    `    ${chalk.gray("pnpm:")}       ${chalk.white(workspace.features.find((f) => f.name === "pnpm")?.detected ? "Yes" : "No")}`,
  );
  console.log(
    `    ${chalk.gray("Node.js:")}    ${chalk.white(workspace.features.find((f) => f.name === "Node.js")?.detected ? "Yes" : "No")}`,
  );
  console.log();
}

/**
 * Handle /pipeline command.
 */
function handlePipeline(): void {
  const pipeline = createPipeline(["EXPLORE", "PLAN", "BUILD", "REVIEW", "TEST", "SHIP"]);

  console.log();
  console.log(sectionHeader("PIPELINE"));
  console.log();
  console.log(pipeline.render());
  console.log();
  console.log(`  ${chalk.gray("Phases execute when tasks are submitted.")}`);
  console.log();
}

/**
 * Handle /models command.
 */
async function handleModels(): Promise<void> {
  const registry = createDefaultProviderRegistry();
  const config = getConfig();
  const activeProviderId = config.provider || "mock";

  console.log();
  console.log(sectionHeader("AI MODELS"));
  console.log();

  console.log(`  ${chalk.bold.white("ACTIVE")}`);
  console.log();
  console.log(`    ${chalk.gray("Provider:")} ${chalk.white(activeProviderId)}`);
  console.log(`    ${chalk.gray("Model:")}    ${chalk.white(config.model || "mock")}`);
  console.log();

  console.log(`  ${chalk.bold.white("AVAILABLE")}`);
  console.log();

  for (const id of registry.listIds()) {
    const provider = registry.create(id);
    if (!provider) continue;

    const isConfigured = provider.isConfigured ? provider.isConfigured() : true;
    const models = await provider.listModels();

    const statusIcon = isConfigured ? chalk.green(symbols.success) : chalk.yellow(symbols.warning);
    console.log(`    ${statusIcon} ${chalk.white.bold(provider.name)} ${chalk.gray(`(${id})`)}`);

    for (const model of models.slice(0, 3)) {
      console.log(`      ${chalk.gray("─")} ${chalk.white(model)}`);
    }
    console.log();
  }
}

/**
 * Handle /doctor command.
 */
function handleDoctor(): void {
  const { execSync } = require("node:child_process") as typeof import("node:child_process");
  const { existsSync } = require("node:fs") as typeof import("node:fs");
  const { resolve } = require("node:path") as typeof import("node:path");

  const cwd = process.cwd();

  console.log();
  console.log(sectionHeader("ENVIRONMENT"));
  console.log();

  // Node.js
  const nodeVersion = process.version;
  const nodeMajor = Number.parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (nodeMajor >= 18) {
    console.log(`    ${status.success(`Node.js: ${nodeVersion}`)}`);
  } else {
    console.log(`    ${status.error(`Node.js: ${nodeVersion} (v18+ required)`)}`);
  }

  // pnpm
  try {
    const pnpmVersion = execSync("pnpm --version", { encoding: "utf-8", timeout: 5000 }).trim();
    console.log(`    ${status.success(`pnpm: ${pnpmVersion}`)}`);
  } catch {
    console.log(`    ${status.error("pnpm: not found (required)")}`);
  }

  // Platform
  console.log(`    ${status.success(`Platform: ${process.platform} (${process.arch})`)}`);

  // Config
  const configPath = resolve(cwd, "devbyai.json");
  if (existsSync(configPath)) {
    console.log(`    ${status.success("Config: devbyai.json found")}`);
  } else {
    console.log(`    ${status.warning("Config: No devbyai.json (using defaults)")}`);
  }

  // Provider
  const config = getConfig();
  const providerId = config.provider || "mock";
  const apiKey = getApiKey(providerId);

  if (providerId === "mock") {
    console.log(`    ${status.success("Provider: MockProvider (development mode)")}`);
  } else if (apiKey) {
    console.log(`    ${status.success(`Provider: ${providerId} (configured)`)}`);
  } else {
    console.log(`    ${status.warning(`Provider: ${providerId} (API key not found)`)}`);
  }

  // Agents
  const agentRegistry = createBuiltInAgentRegistry();
  console.log(`    ${status.success(`Agents: ${agentRegistry.count()} registered`)}`);

  // Skills
  const skillRegistry = createBuiltInSkillRegistry();
  console.log(`    ${status.success(`Skills: ${skillRegistry.listIds().length} available`)}`);

  console.log();
}

/**
 * Execute a natural language task through the pipeline.
 */
async function executeTask(task: string, options: InteractiveOptions): Promise<void> {
  const cwd = options.cwd;

  await loadConfig(cwd);

  const config = getConfig();
  const providerRegistry = createDefaultProviderRegistry();
  const providerId = config.provider || "mock";
  const provider = providerRegistry.create(providerId);
  if (!provider) {
    console.log(`  ${status.error(`Unknown provider: ${providerId}`)}`);
    return;
  }

  // Initialize provider
  const apiKey = getApiKey(providerId);
  await provider.initialize({ apiKey, model: config.model });

  const isConfigured = provider.isConfigured ? provider.isConfigured() : true;

  if (!isConfigured) {
    console.log();
    console.log(`  ${chalk.yellow("AI provider is not configured.")}`);
    console.log(`  ${chalk.gray("You can still explore DEVBYAI commands and workspace tools.")}`);
    console.log();
    console.log(`  ${chalk.gray("To configure a provider:")}`);
    console.log(
      `    ${chalk.cyan("export OPENAI_API_KEY=your-api-key")} ${chalk.gray("(macOS/Linux)")}`,
    );
    console.log(
      `    ${chalk.cyan("$env:OPENAI_API_KEY='your-api-key'")} ${chalk.gray("(PowerShell)")}`,
    );
    console.log();
    return;
  }

  // Resolve skills for current project
  const workspace = detectWorkspace(cwd);
  const hasTypeScript = workspace.features.some((f) => f.name === "TypeScript" && f.detected);
  const projectType = hasTypeScript ? "typescript" : "unknown";
  const skillRegistry = createBuiltInSkillRegistry();
  const activeSkills = resolveSkills(skillRegistry, projectType);

  const tools = createDefaultToolRegistry();
  const orchestrator = new Orchestrator({ config, provider, tools, cwd });

  console.log();
  console.log(`    ${chalk.gray("Task:")} ${chalk.white(task)}`);
  console.log(`    ${chalk.gray("Provider:")} ${chalk.cyan(provider.name)}`);
  console.log(`    ${chalk.gray("Model:")} ${chalk.white(provider.getModel())}`);

  if (activeSkills.length > 0) {
    console.log(
      `    ${chalk.gray("Skills:")} ${chalk.white(activeSkills.map((s) => s.metadata.name).join(", "))}`,
    );
  }
  console.log();

  // Create pipeline
  const pipeline = createPipeline(["EXPLORE", "PLAN", "BUILD", "REVIEW", "TEST", "SHIP"]);

  // Show initial pipeline state
  console.log(pipeline.render());
  console.log();

  // Execute pipeline
  const result = await orchestrator.execute(task);

  // Update pipeline visualization with results
  for (const phase of result.phases) {
    const phaseName = phase.phase.toUpperCase();
    if (phase.success) {
      pipeline.complete(phaseName, phase.output.split("\n")[0]);
    } else {
      pipeline.error(phaseName, phase.output.split("\n")[0]);
    }
  }

  // Final pipeline display
  console.log(sectionHeader("RESULT"));
  console.log();
  console.log(pipeline.render());
  console.log();

  if (result.success) {
    console.log(`    ${status.success(chalk.bold("Task complete"))}`);
  } else {
    console.log(`    ${status.error(chalk.bold("Task failed"))}`);
  }
  console.log(`    ${chalk.gray("Duration:")} ${chalk.white(`${result.totalDuration}ms`)}`);
  console.log();
}

/**
 * Start the DEVBYAI interactive mode.
 */
export async function startInteractive(options: InteractiveOptions): Promise<void> {
  const workspace = detectWorkspace(options.cwd);
  const config = getConfig();
  const providerId = config.provider || "mock";

  // Print welcome screen
  console.log(
    renderWelcome({
      version: options.version,
      provider: providerId,
      model: config.model || "mock",
    }),
  );

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `\n  ${chalk.cyan("DEVBYAI")} > `,
  });

  // Command history
  const history: string[] = [];
  let _historyIndex = -1;

  // Show initial prompt
  rl.prompt();

  // Handle line input
  rl.on("line", async (input: string) => {
    const trimmed = input.trim();

    if (!trimmed) {
      rl.prompt();
      return;
    }

    // Add to history
    history.unshift(trimmed);
    _historyIndex = -1;

    // Handle slash commands
    if (trimmed.startsWith("/")) {
      const cmd = trimmed.toLowerCase().split(" ")[0];

      switch (cmd) {
        case "/help":
          handleHelp();
          break;
        case "/status":
          handleStatus(options);
          break;
        case "/workspace":
          handleWorkspace(options);
          break;
        case "/pipeline":
          handlePipeline();
          break;
        case "/agents":
          handleAgents();
          break;
        case "/skills":
          handleSkills(options);
          break;
        case "/workflows":
          handleWorkflows();
          break;
        case "/models":
          await handleModels();
          break;
        case "/doctor":
          handleDoctor();
          break;
        case "/clear":
          console.clear();
          // Reprint compact header
          console.log(
            `\n  ${chalk.bold.white("DEVBYAI")} ${chalk.gray("•")} ${chalk.gray("DEVELOPMENT SESSION")}`,
          );
          console.log(
            `  ${chalk.gray("Workspace:")} ${chalk.white(workspace.name)}  ${chalk.gray("•")}  ${chalk.gray("Provider:")} ${chalk.white(providerId)}`,
          );
          console.log();
          break;
        case "/exit":
          console.log();
          console.log(
            `  ${chalk.gray("Goodbye!")} ${chalk.cyan("DEVBYAI")} ${chalk.gray(`v${options.version}`)}`,
          );
          console.log();
          rl.close();
          process.exit(0);
          break;
        default:
          console.log(`  ${status.warning(`Unknown command: ${cmd}`)}`);
          console.log(
            `  ${chalk.gray("Type")} ${chalk.cyan("/help")} ${chalk.gray("for available commands.")}`,
          );
      }
    } else {
      // Natural language task
      await executeTask(trimmed, options);
    }

    rl.prompt();
  });

  // Handle close
  rl.on("close", () => {
    console.log();
    console.log(
      `  ${chalk.gray("Goodbye!")} ${chalk.cyan("DEVBYAI")} ${chalk.gray(`v${options.version}`)}`,
    );
    console.log();
    process.exit(0);
  });
}
