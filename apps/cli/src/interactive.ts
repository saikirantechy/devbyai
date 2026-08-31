/**
 * DEVBYAI Interactive Mode
 *
 * Premium interactive terminal experience with readline.
 * Supports slash commands and natural language tasks.
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as readline from "node:readline";
import { createBuiltInAgentRegistry } from "@devbyai/agents";
import { getApiKey, getConfig, loadConfig } from "@devbyai/config";
import {
  SessionManager,
  TaskMemory,
  WorkflowRegistry,
  buildContext,
  createFileIndex,
  detectProjectProfile,
} from "@devbyai/core";
import { Orchestrator } from "@devbyai/core";
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

// ---------------------------------------------------------------------------
// Intelligence singletons (per session)
// ---------------------------------------------------------------------------

let _taskMemory: TaskMemory | null = null;
let _sessionManager: SessionManager | null = null;

function getTaskMemory(cwd: string): TaskMemory {
  if (!_taskMemory) _taskMemory = new TaskMemory(cwd);
  return _taskMemory;
}

function getSessionManager(cwd: string): SessionManager {
  if (!_sessionManager) _sessionManager = new SessionManager(cwd);
  return _sessionManager;
}

// ---------------------------------------------------------------------------
// /help
// ---------------------------------------------------------------------------

function handleHelp(): void {
  console.log();
  console.log(`  ${chalk.bold.white("DEVBYAI COMMANDS")}`);
  console.log();

  console.log(`    ${chalk.bold.gray("INTELLIGENCE")}`);
  console.log(`      ${chalk.cyan("/project")}    ${chalk.gray("Show project intelligence")}`);
  console.log(`      ${chalk.cyan("/context")}    ${chalk.gray("Show current context")}`);
  console.log(`      ${chalk.cyan("/map")}        ${chalk.gray("Show project map")}`);
  console.log(`      ${chalk.cyan("/history")}    ${chalk.gray("Show task history")}`);
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

// ---------------------------------------------------------------------------
// /project — Project Intelligence
// ---------------------------------------------------------------------------

function handleProject(options: InteractiveOptions): void {
  const profile = detectProjectProfile(options.cwd);

  console.log();
  console.log(sectionHeader("PROJECT INTELLIGENCE"));
  console.log();

  console.log(`    ${chalk.gray("Name:")}        ${chalk.white.bold(profile.name)}`);
  console.log(`    ${chalk.gray("Type:")}        ${chalk.white(profile.projectType)}`);
  console.log(`    ${chalk.gray("Runtime:")}     ${chalk.white(profile.runtime || "N/A")}`);
  console.log(`    ${chalk.gray("Package Mgr:")} ${chalk.white(profile.packageManager)}`);
  console.log(`    ${chalk.gray("Workspace:")}   ${chalk.white(profile.workspaceType)}`);

  if (profile.languages.length > 0) {
    console.log(`    ${chalk.gray("Languages:")}   ${chalk.white(profile.languages.join(", "))}`);
  }
  if (profile.frameworks.length > 0) {
    console.log(`    ${chalk.gray("Frameworks:")}  ${chalk.white(profile.frameworks.join(", "))}`);
  }
  if (profile.testFramework) {
    console.log(`    ${chalk.gray("Testing:")}     ${chalk.white(profile.testFramework)}`);
  }
  if (profile.buildSystem) {
    console.log(`    ${chalk.gray("Build:")}       ${chalk.white(profile.buildSystem)}`);
  }
  if (profile.lintSystem) {
    console.log(`    ${chalk.gray("Lint:")}        ${chalk.white(profile.lintSystem)}`);
  }
  if (profile.packageCount > 1) {
    console.log(`    ${chalk.gray("Packages:")}    ${chalk.white(String(profile.packageCount))}`);
  }
  console.log();
  console.log(
    `    ${chalk.gray("Sources:")}     ${chalk.white(profile.sourceDirectories.join(", "))}`,
  );
  if (profile.testDirectories.length > 0) {
    console.log(
      `    ${chalk.gray("Tests:")}       ${chalk.white(profile.testDirectories.join(", "))}`,
    );
  }
  if (profile.configurationFiles.length > 0) {
    console.log(
      `    ${chalk.gray("Config:")}      ${chalk.white(profile.configurationFiles.join(", "))}`,
    );
  }
  console.log();

  // Status
  console.log(`    ${status.success("Project understood")}`);
  console.log();
}

// ---------------------------------------------------------------------------
// /map — Project Map
// ---------------------------------------------------------------------------

function handleMap(options: InteractiveOptions): void {
  const index = createFileIndex(options.cwd);

  console.log();
  console.log(sectionHeader("PROJECT MAP"));
  console.log();

  // Group top-level directories
  const topLevel = new Map<string, { files: number; dirs: Set<string> }>();

  for (const file of index.files) {
    const parts = file.path.split("/");
    const topDir = parts.length > 1 ? parts[0] : ".";

    if (!topLevel.has(topDir)) {
      topLevel.set(topDir, { files: 0, dirs: new Set() });
    }
    const entry = topLevel.get(topDir);
    if (entry) {
      entry.files++;

      if (parts.length > 2) {
        entry.dirs.add(parts[1]);
      }
    }
  }

  // Sort by importance: source dirs first
  const sorted = Array.from(topLevel.entries()).sort((a, b) => b[1].files - a[1].files);

  for (const [dir, info] of sorted.slice(0, 15)) {
    const dirIcon = dir === "." ? chalk.gray(".") : chalk.cyan(dir);
    console.log(`    ${dirIcon} ${chalk.gray(`(${info.files} files)`)}`);

    // Show subdirectories
    const subDirs = Array.from(info.dirs).slice(0, 5);
    for (const sub of subDirs) {
      console.log(`      ${chalk.gray("├──")} ${chalk.white(sub)}`);
    }
    if (info.dirs.size > 5) {
      console.log(`      ${chalk.gray("└──")} ${chalk.gray(`... and ${info.dirs.size - 5} more`)}`);
    }
  }

  console.log();

  // Key files
  console.log(`    ${chalk.bold.white("KEY FILES")}`);
  for (const file of index.criticalFiles.slice(0, 8)) {
    console.log(`      ${chalk.gray("─")} ${chalk.white(file.path)}`);
  }
  console.log();
}

// ---------------------------------------------------------------------------
// /context — Current Context
// ---------------------------------------------------------------------------

function handleContext(options: InteractiveOptions): void {
  const profile = detectProjectProfile(options.cwd);
  const fileIndex = createFileIndex(options.cwd);
  const session = getSessionManager(options.cwd);

  // Build context for "current session"
  const recentFiles = session.getRecentFiles();
  const context = buildContext("current session", options.cwd, profile, fileIndex, recentFiles);

  console.log();
  console.log(sectionHeader("CURRENT CONTEXT"));
  console.log();

  if (context.items.length === 0) {
    console.log(`    ${chalk.gray("No context items tracked yet.")}`);
    console.log(`    ${chalk.gray("Submit a task to build context.")}`);
  } else {
    for (const item of context.items.slice(0, 10)) {
      console.log(`    ${chalk.cyan(symbols.bullet)} ${chalk.white(item.path)}`);
      console.log(
        `      ${chalk.gray(item.reason)} ${chalk.gray(`(score: ${item.score.toFixed(2)})`)}`,
      );
    }

    if (context.truncated) {
      console.log();
      console.log(`    ${chalk.gray(`... ${context.items.length - 10} more items`)}`);
    }
  }

  console.log();
  console.log(`    ${chalk.gray("Files tracked:")} ${chalk.white(String(context.items.length))}`);
  console.log(`    ${chalk.gray("Est. tokens:")}  ${chalk.white(String(context.estimatedTokens))}`);
  console.log();
}

// ---------------------------------------------------------------------------
// /history — Task History
// ---------------------------------------------------------------------------

function handleHistory(options: InteractiveOptions): void {
  const memory = getTaskMemory(options.cwd);
  const recent = memory.getRecent(10);

  console.log();
  console.log(sectionHeader("RECENT TASKS"));
  console.log();

  if (recent.length === 0) {
    console.log(`    ${chalk.gray("No tasks executed yet.")}`);
    console.log(`    ${chalk.gray("Submit a task to start tracking.")}`);
  } else {
    for (const task of recent) {
      const statusIcon =
        task.status === "completed"
          ? chalk.green(symbols.success)
          : task.status === "failed"
            ? chalk.red(symbols.error)
            : task.status === "cancelled"
              ? chalk.gray(symbols.warning)
              : chalk.cyan(symbols.running);

      const duration = task.duration ? chalk.gray(`${task.duration}ms`) : chalk.gray("running");

      console.log(
        `    ${statusIcon} ${chalk.gray(`#${task.id}`)} ${chalk.white(task.description)}`,
      );
      console.log(`      ${chalk.gray("Status:")} ${chalk.white(task.status)}  ${duration}`);
      if (task.workflow) {
        console.log(`      ${chalk.gray("Workflow:")} ${chalk.white(task.workflow)}`);
      }
      console.log();
    }
  }

  console.log(`    ${chalk.gray("Total tasks:")} ${chalk.white(String(memory.count()))}`);
  console.log();
}

// ---------------------------------------------------------------------------
// /agents
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /skills
// ---------------------------------------------------------------------------

function handleSkills(options: InteractiveOptions): void {
  const registry = createBuiltInSkillRegistry();
  const workspace = detectWorkspace(options.cwd);

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

// ---------------------------------------------------------------------------
// /workflows
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /status
// ---------------------------------------------------------------------------

function handleStatus(options: InteractiveOptions): void {
  const workspace = detectWorkspace(options.cwd);
  const config = getConfig();
  const providerId = config.provider || "mock";
  const apiKey = getApiKey(providerId);
  const session = getSessionManager(options.cwd);

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

  // Session info
  const summary = session.getSummary();
  console.log(`    ${chalk.gray("Tasks:")}     ${chalk.white(String(summary.taskCount))}`);
  console.log(
    `    ${chalk.gray("Duration:")}  ${chalk.white(`${Math.floor(summary.duration / 1000)}s`)}`,
  );
  console.log();
}

// ---------------------------------------------------------------------------
// /workspace
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /pipeline
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /models
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /doctor
// ---------------------------------------------------------------------------

function handleDoctor(): void {
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

  // Intelligence
  try {
    const profile = detectProjectProfile(cwd);
    console.log(`    ${status.success(`Project: ${profile.projectType}`)}`);
  } catch {
    console.log(`    ${status.warning("Project: Unable to detect")}`);
  }

  console.log();
}

// ---------------------------------------------------------------------------
// Execute task
// ---------------------------------------------------------------------------

async function executeTask(task: string, options: InteractiveOptions): Promise<void> {
  const cwd = options.cwd;
  const session = getSessionManager(cwd);
  const memory = getTaskMemory(cwd);

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

  // Create task
  const taskRecord = memory.create(task);
  session.setCurrentTask(taskRecord.id);

  // Resolve workflow
  const workflowRegistry = new WorkflowRegistry();
  const workflow = workflowRegistry.selectForTask(task);
  taskRecord.workflow = workflow.metadata.id;
  session.setActiveWorkflow(workflow.metadata.id);

  // Resolve skills
  const profile = detectProjectProfile(cwd);
  const projectType = profile.projectType === "typescript" ? "typescript" : "unknown";
  const skillRegistry = createBuiltInSkillRegistry();
  const activeSkills = resolveSkills(skillRegistry, projectType);
  session.setActiveSkills(activeSkills.map((s) => s.metadata.id));

  // Build context
  const fileIndex = createFileIndex(cwd);
  const recentFiles = session.getRecentFiles();
  const context = buildContext(task, cwd, profile, fileIndex, recentFiles);

  // Display task info
  console.log();
  console.log(`    ${chalk.gray("Task:")}     ${chalk.white(task)}`);
  console.log(`    ${chalk.gray("ID:")}       ${chalk.white(`#${taskRecord.id}`)}`);
  console.log(`    ${chalk.gray("Workflow:")} ${chalk.cyan(workflow.metadata.name)}`);
  console.log(`    ${chalk.gray("Provider:")} ${chalk.cyan(provider.name)}`);
  console.log(`    ${chalk.gray("Model:")}    ${chalk.white(provider.getModel())}`);
  if (activeSkills.length > 0) {
    console.log(
      `    ${chalk.gray("Skills:")}   ${chalk.white(activeSkills.map((s) => s.metadata.name).join(", "))}`,
    );
  }
  console.log();

  // Show context selection
  if (context.items.length > 0) {
    console.log(`    ${chalk.bold.white("CONTEXT ENGINE")}`);
    for (const item of context.items.slice(0, 5)) {
      console.log(
        `      ${chalk.cyan(symbols.bullet)} ${chalk.white(item.path)} ${chalk.gray(`— ${item.reason}`)}`,
      );
    }
    if (context.items.length > 5) {
      console.log(`      ${chalk.gray(`... and ${context.items.length - 5} more files`)}`);
    }
    console.log();
  }

  // Update task status
  memory.updateStatus(taskRecord.id, "exploring");

  const tools = createDefaultToolRegistry();
  const orchestrator = new Orchestrator({ config, provider, tools, cwd });

  // Create pipeline
  const pipeline = createPipeline(["EXPLORE", "PLAN", "BUILD", "REVIEW", "TEST", "SHIP"]);

  // Show initial pipeline state
  console.log(pipeline.render());
  console.log();

  // Execute pipeline
  memory.updateStatus(taskRecord.id, "planning");
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

  // Complete task
  memory.updateStatus(taskRecord.id, result.success ? "completed" : "failed");

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
  console.log(`    ${chalk.gray("Task:")}     ${chalk.white(`#${taskRecord.id}`)}`);
  console.log();

  session.setCurrentTask(null);
}

// ---------------------------------------------------------------------------
// Start interactive mode
// ---------------------------------------------------------------------------

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
        case "/project":
          handleProject(options);
          break;
        case "/map":
          handleMap(options);
          break;
        case "/context":
          handleContext(options);
          break;
        case "/history":
          handleHistory(options);
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
