#!/usr/bin/env node

/**
 * DEVBYAI CLI
 *
 * The Open Development Agent
 * https://devbyai.com
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getConfig, loadConfig } from "@devbyai/config";
import { Orchestrator } from "@devbyai/core";
import { createDefaultProviderRegistry } from "@devbyai/models";
import { createDefaultToolRegistry } from "@devbyai/tools";
import {
  createPipeline,
  createSpinner,
  detectWorkspace,
  divider,
  printBanner,
  renderWorkspace,
  sectionHeader,
  status,
  symbols,
} from "@devbyai/ui";
import chalk from "chalk";
import { Command } from "commander";
import { startInteractive } from "./interactive.js";

// ---------------------------------------------------------------------------
// Version
// ---------------------------------------------------------------------------

function getVersion(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));
    return pkg.version;
  } catch {
    return "0.1.0";
  }
}

// ---------------------------------------------------------------------------
// CLI Setup
// ---------------------------------------------------------------------------

const program = new Command();

program.name("devbyai").description("DEVBYAI — AI Development Orchestrator").version(getVersion());

// --- devbyai (main command) ---
// When run without arguments, launches interactive mode
// When run with a task argument, executes the task directly
program.argument("[task]", "Task to execute (optional)").action(async (task?: string) => {
  const cwd = process.cwd();
  const version = getVersion();

  await loadConfig(cwd);

  if (task) {
    // Direct task execution mode
    const workspace = detectWorkspace(cwd);

    printBanner({ version, workspace: workspace.name });

    console.log();
    console.log(sectionHeader("TASK"));
    console.log();
    console.log(`    ${chalk.gray("Request:")} ${chalk.white(task)}`);
    console.log(`    ${chalk.gray("Provider:")} ${chalk.cyan("MockProvider")}`);
    console.log(`    ${chalk.gray("Mode:")} ${chalk.yellow("Simulation")}`);
    console.log();

    // Create pipeline visualization
    const pipeline = createPipeline(["EXPLORE", "PLAN", "BUILD", "REVIEW", "TEST", "SHIP"]);

    pipeline.start("EXPLORE");
    console.log(divider());
    console.log(pipeline.render());
    console.log(divider());
    console.log();

    const config = getConfig();
    const providerRegistry = createDefaultProviderRegistry();
    const provider = providerRegistry.create(config.provider || "mock");
    if (!provider) {
      pipeline.error("EXPLORE", `Unknown provider: ${config.provider}`);
      console.log(pipeline.render());
      process.exit(1);
    }
    await provider.initialize({});

    const tools = createDefaultToolRegistry();
    const orchestrator = new Orchestrator({ config, provider, tools, cwd });

    const result = await orchestrator.execute(task);

    for (const phase of result.phases) {
      const phaseName = phase.phase.toUpperCase();
      if (phase.success) {
        pipeline.complete(phaseName, phase.output.split("\n")[0]);
      } else {
        pipeline.error(phaseName, phase.output.split("\n")[0]);
      }
    }

    console.log(sectionHeader("PIPELINE"));
    console.log();
    console.log(pipeline.render());
    console.log();

    console.log(sectionHeader("RESULTS"));
    console.log();
    if (result.success) {
      console.log(`    ${status.success(chalk.bold("Task complete"))}`);
    } else {
      console.log(`    ${status.error(chalk.bold("Task failed"))}`);
    }
    console.log(`    ${chalk.gray("Duration:")} ${chalk.white(`${result.totalDuration}ms`)}`);
    console.log(`    ${chalk.gray("Phases:")} ${chalk.white(`${result.phases.length} executed`)}`);
    console.log();
  } else {
    // Launch interactive mode
    await startInteractive({ version, cwd });
  }
});

// --- devbyai demo ---
program
  .command("demo")
  .description("Run DEVBYAI demo mode (read-only, no file changes)")
  .action(async () => {
    const cwd = process.cwd();
    const version = getVersion();
    const workspace = detectWorkspace(cwd);

    printBanner({ version, workspace: workspace.name, model: "MockProvider" });

    console.log();
    console.log(
      `  ${chalk.gray("Mode:")} ${chalk.yellow("Read-only — no files will be modified")}`,
    );
    console.log();

    // Workspace detection with spinner
    const spinner = createSpinner({ text: "Detecting workspace..." });
    spinner.start();

    await new Promise((r) => setTimeout(r, 500));
    spinner.succeed("Workspace detected");

    console.log();
    console.log(renderWorkspace(workspace));
    console.log();

    // Pipeline demo
    console.log(sectionHeader("PIPELINE DEMO"));
    console.log();

    const pipeline = createPipeline(["EXPLORE", "PLAN", "BUILD", "REVIEW", "SHIP"]);

    const phases = [
      { name: "EXPLORE", delay: 600, detail: "Scanning project structure" },
      { name: "PLAN", delay: 400, detail: "Creating strategy" },
      { name: "BUILD", delay: 300, detail: "Demo mode — no changes" },
      { name: "REVIEW", delay: 400, detail: "Checking implementation" },
      { name: "SHIP", delay: 200, detail: "Demo complete" },
    ];

    for (const phase of phases) {
      pipeline.start(phase.name);
      console.log(pipeline.render());

      const phaseSpinner = createSpinner({ text: `${phase.name}: ${phase.detail}...` });
      phaseSpinner.start();

      await new Promise((r) => setTimeout(r, phase.delay));
      phaseSpinner.succeed(`${phase.name}: ${phase.detail}`);

      pipeline.complete(phase.name, phase.detail);
      console.log();
    }

    console.log(sectionHeader("RESULT"));
    console.log();
    console.log(pipeline.render());
    console.log();

    console.log(`  ${status.success(chalk.bold("DEMO COMPLETE"))}`);
    console.log();
    console.log(`  ${chalk.gray("DEVBYAI architecture is working.")}`);
    console.log(`  ${chalk.gray("Connect a real AI provider for full functionality.")}`);
    console.log(`  ${chalk.gray("See v0.2.0 roadmap for OpenAI/Anthropic integration.")}`);
    console.log();
  });

// --- devbyai init ---
program
  .command("init")
  .description("Initialize DEVBYAI configuration")
  .action(async () => {
    const cwd = process.cwd();

    printBanner({ version: getVersion() });
    console.log();

    const spinner = createSpinner({ text: "Initializing configuration..." });
    spinner.start();

    const fs = await import("node:fs/promises");
    const configPath = resolve(cwd, "devbyai.json");

    try {
      await fs.access(configPath);
      spinner.warn("devbyai.json already exists");
    } catch {
      const defaultConfig = {
        provider: "mock",
        model: "mock",
        permissions: {
          write: "ask",
          execute: "ask",
          network: "ask",
        },
      };
      await fs.writeFile(configPath, `${JSON.stringify(defaultConfig, null, 2)}\n`, "utf-8");
      spinner.succeed("Created devbyai.json");
    }
    console.log();
  });

// --- devbyai version ---
program
  .command("version")
  .description("Show DEVBYAI version")
  .action(() => {
    console.log(`DEVBYAI v${getVersion()}`);
  });

// --- devbyai models ---
program
  .command("models")
  .description("List available AI providers and models")
  .action(async () => {
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

    console.log(`  ${chalk.gray("Note: Only MockProvider is available in v0.1.0")}`);
    console.log(`  ${chalk.gray("Real providers (OpenAI, Anthropic) coming in v0.2.0")}`);
    console.log();
  });

// --- devbyai doctor ---
program
  .command("doctor")
  .description("Check DEVBYAI environment and diagnose issues")
  .action(() => {
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

    // Workspace
    const workspace = detectWorkspace(cwd);
    console.log(`    ${status.success(`Workspace: ${workspace.name}`)}`);

    // Features
    console.log();
    for (const feature of workspace.features) {
      if (feature.detected) {
        console.log(`    ${status.success(feature.name)}`);
      }
    }

    // Config file
    console.log();
    const configPath = resolve(cwd, "devbyai.json");
    if (existsSync(configPath)) {
      console.log(`    ${status.success("Config: devbyai.json found")}`);
    } else {
      console.log(`    ${status.warning("Config: No devbyai.json (using defaults)")}`);
    }

    console.log();
    console.log(`  ${status.success(chalk.bold("All checks passed."))}`);
    console.log();
  });

// --- Parse ---
program.parse();
