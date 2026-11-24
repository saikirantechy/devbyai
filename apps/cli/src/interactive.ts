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
  analyzeDebugWorkflows,
  analyzeErrors,
  buildContext,
  buildErrorContext,
  createFileIndex,
  createValidationPlan,
  detectProjectProfile,
  discoverTests,
  FailureMemory,
  findRelevantTests,
  runValidation,
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
let _failureMemory: FailureMemory | null = null;

function getTaskMemory(cwd: string): TaskMemory {
  if (!_taskMemory) _taskMemory = new TaskMemory(cwd);
  return _taskMemory;
}

function getSessionManager(cwd: string): SessionManager {
  if (!_sessionManager) _sessionManager = new SessionManager(cwd);
  return _sessionManager;
}

function getFailureMemory(cwd: string): FailureMemory {
  if (!_failureMemory) _failureMemory = new FailureMemory(cwd);
  return _failureMemory;
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

    console.log(`    ${chalk.bold.gray("DEBUGGING")}`);
  console.log(`      ${chalk.cyan("/validate")}   ${chalk.gray("Run validation checks")}`);
  console.log(`      ${chalk.cyan("/errors")}     ${chalk.gray("Analyze errors")}`);
  console.log(`      ${chalk.cyan("/failures")}   ${chalk.gray("View recent failure history")}`);
  console.log(`      ${chalk.cyan("/debug")}      ${chalk.gray("Debug workflows & suggestions")}`);
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
// /validate — Run validation checks
// ---------------------------------------------------------------------------

function handleValidate(options: InteractiveOptions, mode: "quick" | "standard" | "full" = "standard"): void {
  const profile = detectProjectProfile(options.cwd);
  const fileIndex = createFileIndex(options.cwd);
  const failureMemory = getFailureMemory(options.cwd);

  console.log();
  console.log(sectionHeader("VALIDATION ENGINE"));
  console.log();

  // Show validation plan
  const plan = createValidationPlan(profile, mode);
  console.log(`    ${chalk.gray("Mode:")} ${chalk.white(plan.mode)}`);
  console.log(`    ${chalk.gray("Checks:")} ${chalk.white(String(plan.totalChecks))}`);
  console.log();
  console.log(`    ${chalk.bold.white("PLAN")}`);
  for (const check of plan.checks) {
    console.log(`      ${chalk.cyan(symbols.bullet)} ${chalk.white(check.name)} ${chalk.gray(`(${check.command})`)}`);
  }
  console.log();
  console.log(`    ${chalk.gray("Running validation...")}`);
  console.log();

  // Run validation
  const result = runValidation({
    cwd: options.cwd,
    mode,
  });

  // Display results
  for (const check of result.checks) {
    const icon =
      check.status === "passed"
        ? chalk.green(symbols.success)
        : check.status === "failed"
          ? chalk.red(symbols.error)
          : check.status === "skipped"
            ? chalk.gray(symbols.waiting)
            : chalk.yellow(symbols.warning);

    const duration = chalk.gray(`${(check.duration / 1000).toFixed(1)}s`);
    console.log(`    ${icon} ${chalk.white.bold(check.name)} ${duration}`);

    if (check.status === "failed" && check.analysis) {
      console.log(
        `      ${chalk.red(`${check.analysis.totalErrors} error(s), ${check.analysis.totalWarnings} warning(s)`)}`,
      );
      for (const err of check.analysis.errors.slice(0, 3)) {
        console.log(`        ${chalk.gray("─")} ${chalk.white(err.message.slice(0, 80))}`);
      }
      if (check.analysis.errors.length > 3) {
        console.log(`        ${chalk.gray(`... and ${check.analysis.errors.length - 3} more`)}`);
      }

      // Record failure in memory
      failureMemory.record({
        type: check.type === "test" ? "test" : check.type === "build" ? "build" : check.type === "typecheck" ? "typecheck" : check.type === "lint" ? "lint" : "unknown",
        command: check.command,
        exitCode: check.exitCode,
        message: `${check.name} failed: ${check.analysis.totalErrors} error(s)`,
        failedFiles: check.analysis.errors
          .filter((e) => e.filePath)
          .map((e) => e.filePath!)
          .slice(0, 10),
        relatedFiles: [],
        taskId: null,
        rawOutput: check.output.slice(0, 5000),
      });
    }
    console.log();
  }

  // Summary
  console.log(`    ${chalk.bold.white("VALIDATION SUMMARY")}`);
  console.log(`    ${chalk.gray("Run ID:")} ${chalk.white(result.runId)}`);
  console.log(`    ${chalk.green(`${result.summary.passed} passed`)}`);
  console.log(`    ${chalk.red(`${result.summary.failed} failed`)}`);
  console.log(`    ${chalk.yellow(`${result.summary.warnings} warnings`)}`);
  const totalSeconds = (result.totalDuration / 1000).toFixed(1);
  console.log(`    ${chalk.gray("Duration:")} ${chalk.white(`${totalSeconds}s`)}`);
  console.log();

  // Status
  if (result.status === "passed") {
    console.log(`    ${status.success(chalk.bold("ALL CHECKS PASSED"))}`);
  } else {
    console.log(`    ${status.error(chalk.bold("VALIDATION FAILED"))}`);
    console.log(`    ${chalk.gray("Run")} ${chalk.cyan("/debug")} ${chalk.gray("to investigate.")}`);
  }
  console.log();
}

// ---------------------------------------------------------------------------
// /errors — Analyze recent errors
// ---------------------------------------------------------------------------

function handleErrors(options: InteractiveOptions): void {
  const profile = detectProjectProfile(options.cwd);
  const fileIndex = createFileIndex(options.cwd);

  console.log();
  console.log(sectionHeader("ERROR ANALYSIS"));
  console.log();

  // Run validation to get errors
  const result = runValidation(options.cwd, profile, fileIndex);

  // Collect all errors
  const allErrors = result.checks
    .filter((c) => c.analysis)
    .flatMap((c) => c.analysis?.errors ?? []);

  if (allErrors.length === 0) {
    console.log(`    ${chalk.green(symbols.success)} ${chalk.white("No errors found!")}`);
    console.log();
    return;
  }

  // Group by category
  const byCategory = new Map<string, typeof allErrors>();
  for (const err of allErrors) {
    const cat = err.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)?.push(err);
  }

  for (const [category, errors] of byCategory) {
    console.log(
      `    ${chalk.bold.white(category.toUpperCase())} ${chalk.gray(`(${errors.length})`)}`,
    );
    for (const err of errors.slice(0, 5)) {
      const location = err.filePath ? chalk.gray(`${err.filePath}:${err.line || "?"}`) : "";
      console.log(`      ${chalk.gray("─")} ${chalk.white(err.message.slice(0, 70))}`);
      if (location) console.log(`        ${location}`);
    }
    if (errors.length > 5) {
      console.log(`      ${chalk.gray(`... and ${errors.length - 5} more`)}`);
    }
    console.log();
  }
}

// ---------------------------------------------------------------------------
// /failures — Failure history
// ---------------------------------------------------------------------------

function handleFailures(options: InteractiveOptions): void {
  const failureMemory = getFailureMemory(options.cwd);

  console.log();
  console.log(sectionHeader("FAILURE HISTORY"));
  console.log();

  const failures = failureMemory.getRecent(10);

  if (failures.length === 0) {
    console.log(`    ${chalk.green(symbols.success)} ${chalk.white("No recent failures recorded.")}`);
    console.log();
    return;
  }

  // Group by type
  const byType = new Map<string, typeof failures>();
  for (const f of failures) {
    const type = f.type;
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type)?.push(f);
  }

  for (const [type, typeFailures] of byType) {
    console.log(`    ${chalk.bold.white(type.toUpperCase())} ${chalk.gray(`(${typeFailures.length})`)}`);
    for (const f of typeFailures.slice(0, 3)) {
      const time = new Date(f.timestamp).toLocaleTimeString();
      console.log(`      ${chalk.red(symbols.error)} ${chalk.white(f.message.slice(0, 60))}`);
      console.log(`        ${chalk.gray("Time:")} ${chalk.white(time)}  ${chalk.gray("ID:")} ${chalk.white(f.id)}`);
      if (f.command) {
        console.log(`        ${chalk.gray("Command:")} ${chalk.cyan(f.command)}`);
      }
      if (f.failedFiles.length > 0) {
        console.log(`        ${chalk.gray("Files:")} ${chalk.white(f.failedFiles.slice(0, 3).join(", "))}`);
      }
    }
    if (typeFailures.length > 3) {
      console.log(`        ${chalk.gray(`... and ${typeFailures.length - 3} more`)}`);
    }
    console.log();
  }

  console.log(`    ${chalk.gray("Total failures recorded:")} ${chalk.white(String(failureMemory.count()))}`);
  console.log();

  const affectedFiles = failureMemory.getAffectedFiles();
  if (affectedFiles.length > 0) {
    console.log(`    ${chalk.gray("Affected files:")} ${chalk.white(String(affectedFiles.length))}`);
    console.log();
  }
}

// ---------------------------------------------------------------------------
// /debug — Debug workflows
// ---------------------------------------------------------------------------

function handleDebug(options: InteractiveOptions): void {
  const profile = detectProjectProfile(options.cwd);
  const fileIndex = createFileIndex(options.cwd);

  console.log();
  console.log(sectionHeader("DEBUG ANALYSIS"));
  console.log();

  // Run validation to get errors
  const validation = runValidation(options.cwd, profile, fileIndex);

  // Analyze errors
  const allErrors = validation.checks
    .filter((c) => c.analysis)
    .flatMap((c) => c.analysis?.errors ?? []);

  const errorAnalysis = analyzeErrors(allErrors.map((e) => e.raw).join("\n"), options.cwd);

  // Discover tests
  const testDiscovery = discoverTests(options.cwd, profile, fileIndex);

  // Generate debug workflows
  const debugResult = analyzeDebugWorkflows(
    errorAnalysis,
    profile,
    fileIndex,
    testDiscovery,
    validation,
  );

  // Health score
  const healthColor =
    debugResult.context.healthScore >= 80
      ? chalk.green
      : debugResult.context.healthScore >= 50
        ? chalk.yellow
        : chalk.red;

  console.log(
    `    ${chalk.gray("Health Score:")} ${healthColor.bold(String(debugResult.context.healthScore))}/100`,
  );
  console.log();

  // Quick fixes
  if (debugResult.quickFixes.length > 0) {
    console.log(`    ${chalk.bold.white("QUICK FIXES")}`);
    for (const fix of debugResult.quickFixes) {
      console.log(`      ${chalk.green(symbols.bullet)} ${chalk.white(fix.description)}`);
      console.log(`        ${chalk.gray("Command:")} ${chalk.cyan(fix.command)}`);
    }
    console.log();
  }

  // Debug workflows
  if (debugResult.workflows.length > 0) {
    console.log(`    ${chalk.bold.white("DEBUG WORKFLOWS")}`);
    for (const workflow of debugResult.workflows.slice(0, 3)) {
      console.log(`      ${chalk.cyan(symbols.bullet)} ${chalk.white.bold(workflow.title)}`);
      console.log(`        ${chalk.gray(workflow.description)}`);
      console.log();

      for (const step of workflow.steps.slice(0, 3)) {
        console.log(`        ${chalk.gray(`${step.step}.`)} ${chalk.white(step.title)}`);
        if (step.command) {
          console.log(`           ${chalk.gray("Run:")} ${chalk.cyan(step.command)}`);
        }
      }
      if (workflow.steps.length > 3) {
        console.log(`        ${chalk.gray(`... and ${workflow.steps.length - 3} more steps`)}`);
      }
      console.log();
    }
  } else {
    console.log(
      `    ${chalk.green(symbols.success)} ${chalk.white("No issues detected. Project looks healthy!")}`,
    );
    console.log();
  }
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
// / — Command Palette (professional slash command UI)
// ---------------------------------------------------------------------------

interface SlashCommand {
  id: string;
  label: string;
  desc: string;
  example?: string;
}

interface SlashCategory {
  name: string;
  icon: string;
  commands: SlashCommand[];
}

const SLASH_CATEGORIES: SlashCategory[] = [
  {
    name: "INTELLIGENCE",
    icon: "🧠",
    commands: [
      { id: "/project", label: "/project", desc: "Show project intelligence & profile" },
      { id: "/context", label: "/context", desc: "Show current AI context & tracked files" },
      { id: "/map", label: "/map", desc: "Show project file map & structure" },
      { id: "/history", label: "/history", desc: "Show recent task execution history" },
    ],
  },
  {
    name: "DEBUGGING",
    icon: "🐛",
    commands: [
      { id: "/validate", label: "/validate [mode]", desc: "Run validation checks (quick / standard / full)", example: "/validate quick" },
      { id: "/errors", label: "/errors", desc: "Analyze recent errors grouped by category" },
      { id: "/failures", label: "/failures", desc: "View recent failure history & affected files" },
      { id: "/debug", label: "/debug", desc: "Full debug analysis: health score, fixes & workflows" },
    ],
  },
  {
    name: "WORKSPACE",
    icon: "📁",
    commands: [
      { id: "/workspace", label: "/workspace", desc: "Show workspace name, location & detected features" },
      { id: "/status", label: "/status", desc: "Show version, provider, model & session status" },
      { id: "/pipeline", label: "/pipeline", desc: "Show the development pipeline phases" },
    ],
  },
  {
    name: "AGENTS & SKILLS",
    icon: "🤖",
    commands: [
      { id: "/agents", label: "/agents", desc: "List all available built-in agents & capabilities" },
      { id: "/skills", label: "/skills", desc: "List active skills for current project type" },
      { id: "/workflows", label: "/workflows", desc: "List available phase workflows" },
    ],
  },
  {
    name: "AI MODELS",
    icon: "🧠",
    commands: [
      { id: "/models", label: "/models", desc: "View configured AI providers & available models" },
    ],
  },
  {
    name: "SYSTEM",
    icon: "🛠️",
    commands: [
      { id: "/doctor", label: "/doctor", desc: "Check environment, Node, pnpm & provider status" },
      { id: "/clear", label: "/clear", desc: "Clear the terminal screen" },
      { id: "/help", label: "/help", desc: "Show all available commands" },
      { id: "/exit", label: "/exit", desc: "Exit DEVBYAI interactive mode" },
      { id: "/update", label: "/update", desc: "Update DEVBYAI to latest version (pull, install, build)" },
    ],
  },
];

function padRight(text: string, len: number): string {
  return text + " ".repeat(Math.max(0, len - text.length));
}

function handleSlashPalette(): void {
  const labelWidth = 20;
  const descWidth = 52;
  const rowWidth = labelWidth + descWidth + 4;

  const top = "═".repeat(rowWidth);
  const headerLine = "│";
  const mid = "─".repeat(rowWidth);

  console.log();
  console.log(chalk.bold.white(top));
  console.log(`  ${chalk.bold.white("DEVBYAI COMMAND PALETTE")}`);
  console.log(chalk.bold.white(top));
  console.log();

  for (const category of SLASH_CATEGORIES) {
    // Category header
    console.log(`  ${chalk.cyan(category.icon)} ${chalk.bold.white(category.name)}`);
    console.log(`  ┌${"─".repeat(labelWidth)}┬${"─".repeat(descWidth)}┐`);

    for (const cmd of category.commands) {
      const label = padRight(cmd.label, labelWidth);
      const desc = padRight(cmd.desc, descWidth);
      const example = cmd.example ? `  ${chalk.gray("e.g. " + cmd.example)}` : "";
      console.log(
        `  │ ${chalk.cyan.bold(label)} │ ${chalk.white(desc)}│${example}`,
      );
    }

    console.log(`  └${"─".repeat(labelWidth)}┴${"─".repeat(descWidth)}┘`);
    console.log();
  }

  console.log(`  ${chalk.bold.gray("NATURAL LANGUAGE")}`);
  console.log(`  ┌${"─".repeat(labelWidth)}┬${"─".repeat(descWidth)}┐`);
  console.log(
    `  │ ${chalk.cyan.bold(padRight("type any task", labelWidth))} │ ${chalk.white(padRight("Execute a natural language development task", descWidth))}│`,
  );
  console.log(`  │ ${chalk.gray(padRight("", labelWidth))} │ ${chalk.gray(padRight('Example: "Explain this project"', descWidth))}│`);
  console.log(`  └${"─".repeat(labelWidth)}┴${"─".repeat(descWidth)}┘`);
  console.log();

  console.log(`  ${chalk.gray("Type")} ${chalk.cyan("/help")} ${chalk.gray("for the full reference, or")} ${chalk.cyan("/")} ${chalk.gray("to reopen this palette.")}`);
  console.log();
}

// ---------------------------------------------------------------------------
// /update — Update DEVBYAI (advanced users)
// ---------------------------------------------------------------------------

function handleUpdate(): void {
  const { execSync } = require("node:child_process");

  console.log();
  console.log(sectionHeader("UPDATE DEVBYAI"));
  console.log();

  let updated = false;

  // Step 1: Pull latest changes
  console.log(`  ${chalk.cyan("▶")} ${chalk.bold.white("Pulling latest changes...")}`);
  try {
    const result = execSync("git pull", {
      encoding: "utf-8",
      timeout: 60000,
    });
    console.log(`    ${chalk.gray(result.trim().split("\n").pop() || "done")}`);
    updated = true;
  } catch (err) {
    console.log(`    ${chalk.yellow(symbols.warning)} ${chalk.gray("Git pull failed — you may need to merge manually.")}`);
  }
  console.log();

  // Step 2: Install dependencies
  console.log(`  ${chalk.cyan("▶")} ${chalk.bold.white("Installing dependencies...")}`);
  try {
    execSync("pnpm install", {
      encoding: "utf-8",
      timeout: 120000,
    });
    console.log(`    ${chalk.green(symbols.success)} Dependencies installed.`);
    updated = true;
  } catch (err) {
    console.log(`    ${chalk.red(symbols.error)} ${chalk.gray("pnpm install failed.")}`);
  }
  console.log();

  // Step 3: Build packages
  console.log(`  ${chalk.cyan("▶")} ${chalk.bold.white("Building packages...")}`);
  try {
    execSync("pnpm build", {
      encoding: "utf-8",
      timeout: 120000,
    });
    console.log(`    ${chalk.green(symbols.success)} Packages built.`);
    updated = true;
  } catch (err) {
    console.log(`    ${chalk.red(symbols.error)} ${chalk.gray("Build failed.")}`);
  }
  console.log();

  if (updated) {
    console.log(`  ${chalk.green(symbols.success)} ${chalk.bold.white("DEVBYAI updated successfully.")}`);
    console.log(`  ${chalk.gray("Restart DEVBYAI to use the latest version.")}`);
  } else {
    console.log(`  ${chalk.yellow(symbols.warning)} ${chalk.bold.white("No changes were applied.")}`);
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
        case "/":
          handleSlashPalette();
          break;
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
        case "/validate": {
          const modeArg = trimmed.split(" ")[1]?.toLowerCase();
          const validateMode = (modeArg === "quick" || modeArg === "full" || modeArg === "standard")
            ? modeArg
            : "standard";
          handleValidate(options, validateMode);
          break;
        }
        case "/failures":
          handleFailures(options);
          break;
        case "/errors":
          handleErrors(options);
          break;
        case "/debug":
          handleDebug(options);
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
        case "/update":
          handleUpdate();
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
