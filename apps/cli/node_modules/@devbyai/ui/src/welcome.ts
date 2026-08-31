/**
 * DEVBYAI Welcome Screen
 *
 * Premium first-launch experience for the DEVBYAI interactive terminal.
 */

import chalk from "chalk";
import { type LogoSize, renderIdentity } from "./logo.js";
import { divider } from "./section.js";
import { symbols } from "./symbols.js";
import { type WorkspaceInfo, detectWorkspace } from "./workspace.js";

export interface WelcomeOptions {
  version: string;
  provider: string;
  model: string;
  compact?: boolean;
}

/**
 * Get responsive logo size based on terminal width.
 */
function getLogoSize(): LogoSize {
  const width = process.stdout.columns || 80;
  if (width >= 60) return "large";
  if (width >= 40) return "medium";
  return "small";
}

/**
 * Render the DEVBYAI welcome screen.
 */
export function renderWelcome(options: WelcomeOptions): string {
  const lines: string[] = [];
  const compact = options.compact || (process.stdout.columns || 80) < 50;

  // Logo / Identity
  lines.push(renderIdentity(getLogoSize()));
  lines.push("");
  lines.push(divider());
  lines.push("");

  if (compact) {
    // Compact mode
    lines.push(`  ${chalk.white.bold("DEVBYAI")} ${chalk.gray(`v${options.version}`)}`);
    lines.push(`  ${chalk.gray("Ready.")}`);
  } else {
    // Full welcome
    lines.push(`  ${chalk.white.bold("Welcome to DEVBYAI.")}`);
    lines.push(`  ${chalk.gray("The open AI development environment for your terminal.")}`);
    lines.push("");
    lines.push(divider());
    lines.push("");

    // Workspace status
    const cwd = process.cwd();
    const workspace = detectWorkspace(cwd);
    lines.push(renderWelcomeWorkspace(workspace));
    lines.push("");

    // AI status
    lines.push(`  ${chalk.bold.white("AI")}`);
    lines.push(`    ${chalk.gray("Provider:")} ${chalk.white(options.provider)}`);
    lines.push(`    ${chalk.gray("Model:")}    ${chalk.white(options.model)}`);
    lines.push(`    ${chalk.gray("Status:")}   ${chalk.green(`${symbols.running} Ready`)}`);
    lines.push("");
    lines.push(divider());
    lines.push("");

    // Quick start suggestions
    lines.push(`  ${chalk.bold.white("GET STARTED")}`);
    lines.push(`  ${chalk.gray("Ask DEVBYAI anything about your project.")}`);
    lines.push("");
    lines.push(`    ${chalk.cyan(symbols.bullet)} Explore your codebase`);
    lines.push(`    ${chalk.cyan(symbols.bullet)} Plan a feature`);
    lines.push(`    ${chalk.cyan(symbols.bullet)} Build something`);
    lines.push(`    ${chalk.cyan(symbols.bullet)} Review code`);
    lines.push(`    ${chalk.cyan(symbols.bullet)} Research solutions`);
    lines.push("");
    lines.push(divider());
  }

  return lines.join("\n");
}

/**
 * Render workspace info for welcome screen.
 */
function renderWelcomeWorkspace(info: WorkspaceInfo): string {
  const lines: string[] = [];

  lines.push(`  ${chalk.bold.white("Workspace")}`);
  lines.push(`    ${chalk.green(symbols.success)} ${chalk.white(info.name)}`);

  const detected = info.features.filter((f) => f.detected);
  if (detected.length > 0) {
    lines.push(`    ${chalk.gray(detected.map((f) => f.name).join(" • "))}`);
  }

  return lines.join("\n");
}

/**
 * Print the welcome screen.
 */
export function printWelcome(options: WelcomeOptions): void {
  console.log(renderWelcome(options));
}

/**
 * Render a compact session header.
 */
export function renderSessionHeader(options: {
  workspace: string;
  provider: string;
  version: string;
}): string {
  const lines: string[] = [];
  lines.push(
    `  ${chalk.bold.white("DEVBYAI")} ${chalk.gray("•")} ${chalk.gray("DEVELOPMENT SESSION")}`,
  );
  lines.push(
    `  ${chalk.gray("Workspace:")} ${chalk.white(options.workspace)}  ${chalk.gray("•")}  ${chalk.gray("Provider:")} ${chalk.white(options.provider)}`,
  );
  lines.push(divider());
  return lines.join("\n");
}
