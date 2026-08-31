/**
 * DEVBYAI Logo
 *
 * Unique ASCII identity for the DEVBYAI terminal experience.
 * Responsive: adapts to terminal width.
 */

import chalk from "chalk";

/**
 * DEVBYAI block logo - large identity.
 */
const LOGO_LARGE = [
  "██████╗ ███████╗██╗   ██╗██████╗ ██╗   ██╗ █████╗ ██╗",
  "██╔══██╗██╔════╝██║   ██║██╔══██╗╚██╗ ██╔╝██╔══██╗██║",
  "██║  ██║█████╗  ██║   ██║██████╔╝ ╚████╔╝ ███████║██║",
  "██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██╗  ╚██╔╝  ██╔══██║██║",
  "██████╔╝███████╗ ╚████╔╝ ██████╔╝   ██║   ██║  ██║██║",
  "╚═════╝ ╚══════╝  ╚═══╝  ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝",
];

/**
 * DEVBYAI medium identity.
 */
const LOGO_MEDIUM = [
  "╔╦╗╔═╗╔╦╗╦═╗╦╔═╗  ╦  ╦╔═╗╦  ╦ ╦╔═╗",
  " ║║║╣  ║ ╠╦╝║╠═╣  ╚╗╔╝║ ║║ ║║║║╠═╝",
  "═╩╝╚═╝ ╩ ╩╚═╩╩ ╩   ╚╝ ╚═╝╩═╝╚╩╝╩  ",
];

/**
 * DEVBYAI small identity.
 */
const LOGO_SMALL = "DEVBYAI";

export type LogoSize = "large" | "medium" | "small" | "auto";

/**
 * Get terminal width.
 */
function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

/**
 * Select appropriate logo size based on terminal width.
 */
function selectLogoSize(preferred: LogoSize): "large" | "medium" | "small" {
  if (preferred !== "auto") return preferred;

  const width = getTerminalWidth();
  if (width >= 60) return "large";
  if (width >= 40) return "medium";
  return "small";
}

/**
 * Render the DEVBYAI logo.
 */
export function renderLogo(size: LogoSize = "auto", color?: "cyan" | "white"): string {
  const selected = selectLogoSize(size);
  const colorFn = color === "white" ? chalk.bold.white : chalk.bold.cyan;

  let lines: string[];

  switch (selected) {
    case "large":
      lines = LOGO_LARGE.map((line) => colorFn(line));
      break;
    case "medium":
      lines = LOGO_MEDIUM.map((line) => colorFn(line));
      break;
    case "small":
      return colorFn(LOGO_SMALL);
  }

  // Center the logo
  const width = getTerminalWidth();
  const logoWidth = lines[0]?.length || 0;
  const padding = Math.max(0, Math.floor((width - logoWidth) / 2));

  return lines.map((line) => " ".repeat(padding) + line).join("\n");
}

/**
 * Render the DEVBYAI tagline.
 */
export function renderTagline(): string {
  const width = getTerminalWidth();
  const tagline = "From Idea to Production.";
  const padding = Math.max(0, Math.floor((width - tagline.length) / 2));
  return " ".repeat(padding) + chalk.gray(tagline);
}

/**
 * Render the full DEVBYAI identity block (logo + tagline).
 */
export function renderIdentity(size: LogoSize = "auto"): string {
  const lines: string[] = [];
  lines.push(renderLogo(size));
  lines.push("");
  lines.push(renderTagline());
  return lines.join("\n");
}
