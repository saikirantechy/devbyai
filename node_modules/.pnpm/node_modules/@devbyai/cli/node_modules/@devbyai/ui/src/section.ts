/**
 * DEVBYAI Section Components
 *
 * Section headers, dividers, and layout helpers.
 */

import chalk from "chalk";
import { symbols } from "./symbols.js";

/**
 * Render a section header with decorative line.
 *
 * Example: "  ── WORKSPACE ──────────────────────────"
 */
export function sectionHeader(title: string, width = 50): string {
  const prefix = "  ";
  const header = `── ${title.toUpperCase()} `;
  const remaining = Math.max(0, width - header.length - prefix.length);
  const line = symbols.line.repeat(remaining);
  return `${prefix}${chalk.bold.white(header)}${chalk.gray(line)}`;
}

/**
 * Render a divider line.
 */
export function divider(width = 50): string {
  return `  ${chalk.gray(symbols.line.repeat(width))}`;
}

/**
 * Render a double divider (for major sections).
 */
export function doubleDivider(width = 50): string {
  return `  ${chalk.gray(symbols.doubleLine.repeat(width))}`;
}

/**
 * Render an indented item with a bullet.
 */
export function bullet(text: string, indent = 4): string {
  const spaces = " ".repeat(indent);
  return `${spaces}${chalk.gray(symbols.bullet)} ${text}`;
}

/**
 * Render a key-value pair.
 */
export function keyValue(key: string, value: string, indent = 2): string {
  const spaces = " ".repeat(indent);
  return `${spaces}${chalk.gray(`${key}:`)} ${chalk.white(value)}`;
}

/**
 * Render a blank line.
 */
export function blank(): string {
  return "";
}
