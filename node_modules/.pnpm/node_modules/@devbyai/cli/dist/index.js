#!/usr/bin/env node
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { getConfig as getConfig2, loadConfig as loadConfig2 } from "@devbyai/config";
import { Orchestrator as Orchestrator2 } from "@devbyai/core";
import { createDefaultProviderRegistry as createDefaultProviderRegistry2 } from "@devbyai/models";
import { createDefaultToolRegistry as createDefaultToolRegistry2 } from "@devbyai/tools";
import {
  createPipeline as createPipeline2,
  createSpinner,
  detectWorkspace as detectWorkspace2,
  divider,
  printBanner,
  renderWorkspace,
  sectionHeader as sectionHeader2,
  status as status2,
  symbols as symbols2
} from "@devbyai/ui";
import chalk2 from "chalk";
import { Command } from "commander";

// src/interactive.ts
import * as readline from "readline";
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
  symbols
} from "@devbyai/ui";
import chalk from "chalk";
function handleHelp() {
  console.log();
  console.log(`  ${chalk.bold.white("DEVBYAI COMMANDS")}`);
  console.log();
  console.log(`    ${chalk.bold.gray("PROJECT")}`);
  console.log(`      ${chalk.cyan("/help")}      ${chalk.gray("Show available commands")}`);
  console.log(
    `      ${chalk.cyan("/status")}    ${chalk.gray("Show workspace and provider status")}`
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
    `      ${chalk.gray("Example:")} ${chalk.white('"Build authentication for this app"')}`
  );
  console.log();
}
function handleStatus(options) {
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
async function handleModels() {
  const registry = createDefaultProviderRegistry();
  console.log();
  console.log(sectionHeader("PROVIDERS"));
  console.log();
  for (const id of registry.listIds()) {
    const provider = registry.create(id);
    if (!provider) continue;
    const models = await provider.listModels();
    console.log(
      `    ${chalk.cyan(symbols.bullet)} ${chalk.white.bold(provider.name)} ${chalk.gray(`(${id})`)}`
    );
    for (const model of models) {
      console.log(`      ${chalk.gray("\u2500")} ${chalk.white(model)}`);
    }
    console.log();
  }
}
function handleDoctor() {
  const { execSync: execSync2 } = __require("child_process");
  const { existsSync: existsSync2 } = __require("fs");
  const { resolve: resolve2 } = __require("path");
  const cwd = process.cwd();
  console.log();
  console.log(sectionHeader("ENVIRONMENT"));
  console.log();
  const nodeVersion = process.version;
  const nodeMajor = Number.parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (nodeMajor >= 18) {
    console.log(`    ${status.success(`Node.js: ${nodeVersion}`)}`);
  } else {
    console.log(`    ${status.error(`Node.js: ${nodeVersion} (v18+ required)`)}`);
  }
  try {
    const pnpmVersion = execSync2("pnpm --version", { encoding: "utf-8", timeout: 5e3 }).trim();
    console.log(`    ${status.success(`pnpm: ${pnpmVersion}`)}`);
  } catch {
    console.log(`    ${status.error("pnpm: not found (required)")}`);
  }
  console.log(`    ${status.success(`Platform: ${process.platform} (${process.arch})`)}`);
  const configPath = resolve2(cwd, "devbyai.json");
  if (existsSync2(configPath)) {
    console.log(`    ${status.success("Config: devbyai.json found")}`);
  } else {
    console.log(`    ${status.warning("Config: No devbyai.json (using defaults)")}`);
  }
  console.log();
}
async function executeTask(task, options) {
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
  const pipeline = createPipeline(["EXPLORE", "PLAN", "BUILD", "REVIEW", "TEST", "SHIP"]);
  console.log(pipeline.render());
  console.log();
  const result = await orchestrator.execute(task);
  for (const phase of result.phases) {
    const phaseName = phase.phase.toUpperCase();
    if (phase.success) {
      pipeline.complete(phaseName, phase.output.split("\n")[0]);
    } else {
      pipeline.error(phaseName, phase.output.split("\n")[0]);
    }
  }
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
async function startInteractive(options) {
  const workspace = detectWorkspace(options.cwd);
  const config = getConfig();
  console.log(
    renderWelcome({
      version: options.version,
      provider: config.provider || "mock",
      model: config.model || "mock"
    })
  );
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `
  ${chalk.cyan("DEVBYAI")} > `
  });
  const history = [];
  let _historyIndex = -1;
  rl.prompt();
  rl.on("line", async (input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      rl.prompt();
      return;
    }
    history.unshift(trimmed);
    _historyIndex = -1;
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
          console.log(
            renderSessionHeader({
              workspace: workspace.name,
              provider: config.provider || "mock",
              version: options.version
            })
          );
          break;
        case "/exit":
          console.log();
          console.log(
            `  ${chalk.gray("Goodbye!")} ${chalk.cyan("DEVBYAI")} ${chalk.gray(`v${options.version}`)}`
          );
          console.log();
          rl.close();
          process.exit(0);
          break;
        default:
          console.log(`  ${status.warning(`Unknown command: ${cmd}`)}`);
          console.log(
            `  ${chalk.gray("Type")} ${chalk.cyan("/help")} ${chalk.gray("for available commands.")}`
          );
      }
    } else {
      await executeTask(trimmed, options);
    }
    rl.prompt();
  });
  rl.on("close", () => {
    console.log();
    console.log(
      `  ${chalk.gray("Goodbye!")} ${chalk.cyan("DEVBYAI")} ${chalk.gray(`v${options.version}`)}`
    );
    console.log();
    process.exit(0);
  });
}

// src/index.ts
function getVersion() {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));
    return pkg.version;
  } catch {
    return "0.1.0";
  }
}
var program = new Command();
program.name("devbyai").description("DEVBYAI \u2014 AI Development Orchestrator").version(getVersion());
program.argument("[task]", "Task to execute (optional)").action(async (task) => {
  const cwd = process.cwd();
  const version = getVersion();
  await loadConfig2(cwd);
  if (task) {
    const workspace = detectWorkspace2(cwd);
    printBanner({ version, workspace: workspace.name });
    console.log();
    console.log(sectionHeader2("TASK"));
    console.log();
    console.log(`    ${chalk2.gray("Request:")} ${chalk2.white(task)}`);
    console.log(`    ${chalk2.gray("Provider:")} ${chalk2.cyan("MockProvider")}`);
    console.log(`    ${chalk2.gray("Mode:")} ${chalk2.yellow("Simulation")}`);
    console.log();
    const pipeline = createPipeline2(["EXPLORE", "PLAN", "BUILD", "REVIEW", "TEST", "SHIP"]);
    pipeline.start("EXPLORE");
    console.log(divider());
    console.log(pipeline.render());
    console.log(divider());
    console.log();
    const config = getConfig2();
    const providerRegistry = createDefaultProviderRegistry2();
    const provider = providerRegistry.create(config.provider || "mock");
    if (!provider) {
      pipeline.error("EXPLORE", `Unknown provider: ${config.provider}`);
      console.log(pipeline.render());
      process.exit(1);
    }
    await provider.initialize({});
    const tools = createDefaultToolRegistry2();
    const orchestrator = new Orchestrator2({ config, provider, tools, cwd });
    const result = await orchestrator.execute(task);
    for (const phase of result.phases) {
      const phaseName = phase.phase.toUpperCase();
      if (phase.success) {
        pipeline.complete(phaseName, phase.output.split("\n")[0]);
      } else {
        pipeline.error(phaseName, phase.output.split("\n")[0]);
      }
    }
    console.log(sectionHeader2("PIPELINE"));
    console.log();
    console.log(pipeline.render());
    console.log();
    console.log(sectionHeader2("RESULTS"));
    console.log();
    if (result.success) {
      console.log(`    ${status2.success(chalk2.bold("Task complete"))}`);
    } else {
      console.log(`    ${status2.error(chalk2.bold("Task failed"))}`);
    }
    console.log(`    ${chalk2.gray("Duration:")} ${chalk2.white(`${result.totalDuration}ms`)}`);
    console.log(`    ${chalk2.gray("Phases:")} ${chalk2.white(`${result.phases.length} executed`)}`);
    console.log();
  } else {
    await startInteractive({ version, cwd });
  }
});
program.command("demo").description("Run DEVBYAI demo mode (read-only, no file changes)").action(async () => {
  const cwd = process.cwd();
  const version = getVersion();
  const workspace = detectWorkspace2(cwd);
  printBanner({ version, workspace: workspace.name, model: "MockProvider" });
  console.log();
  console.log(
    `  ${chalk2.gray("Mode:")} ${chalk2.yellow("Read-only \u2014 no files will be modified")}`
  );
  console.log();
  const spinner = createSpinner({ text: "Detecting workspace..." });
  spinner.start();
  await new Promise((r) => setTimeout(r, 500));
  spinner.succeed("Workspace detected");
  console.log();
  console.log(renderWorkspace(workspace));
  console.log();
  console.log(sectionHeader2("PIPELINE DEMO"));
  console.log();
  const pipeline = createPipeline2(["EXPLORE", "PLAN", "BUILD", "REVIEW", "SHIP"]);
  const phases = [
    { name: "EXPLORE", delay: 600, detail: "Scanning project structure" },
    { name: "PLAN", delay: 400, detail: "Creating strategy" },
    { name: "BUILD", delay: 300, detail: "Demo mode \u2014 no changes" },
    { name: "REVIEW", delay: 400, detail: "Checking implementation" },
    { name: "SHIP", delay: 200, detail: "Demo complete" }
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
  console.log(sectionHeader2("RESULT"));
  console.log();
  console.log(pipeline.render());
  console.log();
  console.log(`  ${status2.success(chalk2.bold("DEMO COMPLETE"))}`);
  console.log();
  console.log(`  ${chalk2.gray("DEVBYAI architecture is working.")}`);
  console.log(`  ${chalk2.gray("Connect a real AI provider for full functionality.")}`);
  console.log(`  ${chalk2.gray("See v0.2.0 roadmap for OpenAI/Anthropic integration.")}`);
  console.log();
});
program.command("init").description("Initialize DEVBYAI configuration").action(async () => {
  const cwd = process.cwd();
  printBanner({ version: getVersion() });
  console.log();
  const spinner = createSpinner({ text: "Initializing configuration..." });
  spinner.start();
  const fs = await import("fs/promises");
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
        network: "ask"
      }
    };
    await fs.writeFile(configPath, `${JSON.stringify(defaultConfig, null, 2)}
`, "utf-8");
    spinner.succeed("Created devbyai.json");
  }
  console.log();
});
program.command("version").description("Show DEVBYAI version").action(() => {
  console.log(`DEVBYAI v${getVersion()}`);
});
program.command("models").description("List available AI providers and models").action(async () => {
  const registry = createDefaultProviderRegistry2();
  console.log();
  console.log(sectionHeader2("PROVIDERS"));
  console.log();
  for (const id of registry.listIds()) {
    const provider = registry.create(id);
    if (!provider) continue;
    const models = await provider.listModels();
    console.log(
      `    ${chalk2.cyan(symbols2.bullet)} ${chalk2.white.bold(provider.name)} ${chalk2.gray(`(${id})`)}`
    );
    for (const model of models) {
      console.log(`      ${chalk2.gray("\u2500")} ${chalk2.white(model)}`);
    }
    console.log();
  }
  console.log(`  ${chalk2.gray("Note: Only MockProvider is available in v0.1.0")}`);
  console.log(`  ${chalk2.gray("Real providers (OpenAI, Anthropic) coming in v0.2.0")}`);
  console.log();
});
program.command("doctor").description("Check DEVBYAI environment and diagnose issues").action(() => {
  const cwd = process.cwd();
  console.log();
  console.log(sectionHeader2("ENVIRONMENT"));
  console.log();
  const nodeVersion = process.version;
  const nodeMajor = Number.parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (nodeMajor >= 18) {
    console.log(`    ${status2.success(`Node.js: ${nodeVersion}`)}`);
  } else {
    console.log(`    ${status2.error(`Node.js: ${nodeVersion} (v18+ required)`)}`);
  }
  try {
    const pnpmVersion = execSync("pnpm --version", { encoding: "utf-8", timeout: 5e3 }).trim();
    console.log(`    ${status2.success(`pnpm: ${pnpmVersion}`)}`);
  } catch {
    console.log(`    ${status2.error("pnpm: not found (required)")}`);
  }
  console.log(`    ${status2.success(`Platform: ${process.platform} (${process.arch})`)}`);
  const workspace = detectWorkspace2(cwd);
  console.log(`    ${status2.success(`Workspace: ${workspace.name}`)}`);
  console.log();
  for (const feature of workspace.features) {
    if (feature.detected) {
      console.log(`    ${status2.success(feature.name)}`);
    }
  }
  console.log();
  const configPath = resolve(cwd, "devbyai.json");
  if (existsSync(configPath)) {
    console.log(`    ${status2.success("Config: devbyai.json found")}`);
  } else {
    console.log(`    ${status2.warning("Config: No devbyai.json (using defaults)")}`);
  }
  console.log();
  console.log(`  ${status2.success(chalk2.bold("All checks passed."))}`);
  console.log();
});
program.parse();
