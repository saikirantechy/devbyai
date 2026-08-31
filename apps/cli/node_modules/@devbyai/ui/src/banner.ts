/**
 * DEVBYAI Banner
 *
 * Enhanced banner with workspace information and brand identity.
 */

import chalk from "chalk";
import { symbols } from "./symbols.js";

export interface BannerOptions {
  /** Show workspace info below banner */
  workspace?: string;
  /** Show version */
  version?: string;
  /** Show current model */
  model?: string;
  /** Compact mode (no extra info) */
  compact?: boolean;
}

/**
 * Render the DEVBYAI banner.
 */
export function renderBanner(options: BannerOptions = {}): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(
    chalk.bold.cyan(
      `${symbols.corner.topLeft}──────────────────────────────────────────${symbols.corner.topRight}`,
    ),
  );
  lines.push(
    `${chalk.bold.cyan(symbols.corner.vertical)}              ${chalk.bold.white("DEVBYAI")}                       ${chalk.bold.cyan(symbols.corner.vertical)}`,
  );
  lines.push(
    `${chalk.bold.cyan(symbols.corner.vertical)}              ${chalk.gray("Dev By AI")}                     ${chalk.bold.cyan(symbols.corner.vertical)}`,
  );
  lines.push(
    `${chalk.bold.cyan(symbols.corner.vertical)}                                          ${chalk.bold.cyan(symbols.corner.vertical)}`,
  );
  lines.push(
    `${chalk.bold.cyan(symbols.corner.vertical)}    ${chalk.gray("The Open Development Agent")}            ${chalk.bold.cyan(symbols.corner.vertical)}`,
  );
  lines.push(
    chalk.bold.cyan(
      `${symbols.corner.bottomLeft}──────────────────────────────────────────${symbols.corner.bottomRight}`,
    ),
  );

  if (!options.compact) {
    if (options.version) {
      lines.push(`  ${chalk.gray("Version:")} ${chalk.cyan(options.version)}`);
    }
    if (options.model) {
      lines.push(`  ${chalk.gray("Model:")} ${chalk.white(options.model)}`);
    }
    if (options.workspace) {
      lines.push(
        `  ${chalk.gray("Workspace:")} ${chalk.green(symbols.success)} ${chalk.white(options.workspace)}`,
      );
    }
  }

  return lines.join("\n");
}

/**
 * Print the DEVBYAI banner to console.
 */
export function printBanner(options: BannerOptions = {}): void {
  console.log(renderBanner(options));
}

/**
 * Render a compact status banner for inline use.
 */
export function renderStatusLine(options: {
  version?: string;
  model?: string;
  workspace?: string;
}): string {
  const parts: string[] = [];
  if (options.version) parts.push(chalk.cyan(`v${options.version}`));
  if (options.model) parts.push(chalk.white(options.model));
  if (options.workspace) parts.push(chalk.gray(options.workspace));
  return parts.join(`  ${chalk.gray("•")} `);
}
