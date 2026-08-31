/**
 * DEVBYAI Interactive Mode
 *
 * Premium interactive terminal experience with readline.
 * Supports slash commands and natural language tasks.
 */

import * as readline from "node:readline";
import { getConfig, loadConfig } from "@devbyai/config";
import { Orchestrator } from "@devbyai/core";
import { createDefaultProviderRegistry } from "@devbyai/models";
import { createDefaultToolRegistry } from "@devbyai/tools";
import {
  createPipeline,
  detectWorkspace,
  renderSessionHeader,
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
 * Available slash commands.
 */
const _SLASH_COMMANDS = [
  { name: "/help", description: "Show available commands" },
  { name: "/status", description: "Show workspace and provider status" },
  { name: "/models", description: "View configured AI models" },
  { name: "/doctor", description: "Check the DEVBYAI environment" },
  { name: "/clear", description: "Clear the terminal" },
  { name: "/exit", description: "Exit DEVBYAI" },
];

/**
 * Handle /help command.
 */
function handleHelp(): void {
  console.log();
  console.log(`  ${chalk.bold.white("DEVBYAI COMMANDS")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("PROJECT")}`);
  console.log(`      ${chalk.cyan("/help")}      ${chalk.gray("Show available commands")}`);
  console.log(
    `      ${chalk.cyan("/status")}    ${chalk.gray("Show workspace and provider status")}`,
  );
  console.log(`      ${chalk.cyan("/models")}    ${chalk.gray("View configured AI models")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("SYSTEM")}`);
  console.log(`      ${chalk.cyan("/doctor")}    ${chalk.gray("Check the DEVBYAI environment")}`);
  console.log(`      ${chalk.cyan("/clear")}     ${chalk.gray("Clear the terminal")}`);
  console.log(`      ${chalk.cyan("/exit")}      ${chalk.gray("Exit DEVBYAI")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("NATURAL LANGUAGE")}`);
  console.log(`      ${chalk.white("Type any task description to execute it.")}`);
  console.log(
    `      ${chalk.gray("Example:")} ${chalk.white('"Build authentication for this app"')}`,
  );
  console.log();
}

/**
 * Handle /status command.
 */
function handleStatus(options: InteractiveOptions): void {
  const workspace = detectWorkspace(options.cwd);
  const config = getConfig();

  console.log();
  console.log(sectionHeader("STATUS"));
  console.log();
  console.log(`    ${chalk.gray("Version:")}   ${chalk.white(`v${options.version}`)}`);
  console.log(`    ${chalk.gray("Workspace:")} ${chalk.white(workspace.name)}`);
  console.log(`    ${chalk.gray("Provider:")}  ${chalk.white(config.provider || "mock")}`);
  console.log(`    ${chalk.gray("Model:")}     ${chalk.white(config.model || "mock")}`);
  console.log(`    ${chalk.gray("Pipeline:")}  ${chalk.green("Ready")}`);
  console.log();
}

/**
 * Handle /models command.
 */
async function handleModels(): Promise<void> {
  const registry = createDefaultProviderRegistry();

  console.log();
  console.log(sectionHeader("PROVIDERS"));
  console.log();

  for (const id of registry.listIds()) {
    const provider = registry.create(id);
    if (!provider) continue;
    const models = await provider.listModels();
    console.log(
      `    ${chalk.cyan(symbols.bullet)} ${chalk.white.bold(provider.name)} ${chalk.gray(`(${id})`)}`,
    );
    for (const model of models) {
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
  const provider = providerRegistry.create(config.provider || "mock");
  if (!provider) {
    console.log(`  ${status.error(`Unknown provider: ${config.provider}`)}`);
    return;
  }
  await provider.initialize({});

  const tools = createDefaultToolRegistry();
  const orchestrator = new Orchestrator({ config, provider, tools, cwd });

  console.log();
  console.log(`    ${chalk.gray("Task:")} ${chalk.white(task)}`);
  console.log(`    ${chalk.gray("Provider:")} ${chalk.cyan("MockProvider")}`);
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

  // Print welcome screen
  console.log(
    renderWelcome({
      version: options.version,
      provider: config.provider || "mock",
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
      const cmd = trimmed.toLowerCase();

      switch (cmd) {
        case "/help":
          handleHelp();
          break;
        case "/status":
          handleStatus(options);
          break;
        case "/models":
          await handleModels();
          break;
        case "/doctor":
          handleDoctor();
          break;
        case "/clear":
          console.clear();
          // Reprint session header
          console.log(
            renderSessionHeader({
              workspace: workspace.name,
              provider: config.provider || "mock",
              version: options.version,
            }),
          );
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
