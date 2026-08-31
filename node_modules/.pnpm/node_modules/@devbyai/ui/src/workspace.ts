/**
 * DEVBYAI Workspace Display
 *
 * Displays workspace information in a structured format.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import chalk from "chalk";
import { sectionHeader } from "./section.js";
import { symbols } from "./symbols.js";

export interface WorkspaceInfo {
  /** Directory name */
  name: string;
  /** Full path */
  path: string;
  /** Detected features */
  features: WorkspaceFeature[];
}

export interface WorkspaceFeature {
  /** Feature name */
  name: string;
  /** Whether detected */
  detected: boolean;
  /** Optional detail */
  detail?: string;
}

/**
 * Detect workspace information.
 */
export function detectWorkspace(cwd: string): WorkspaceInfo {
  const parts = cwd.replace(/\\/g, "/").split("/");
  const name = parts[parts.length - 1] || cwd;

  const features: WorkspaceFeature[] = [
    {
      name: "TypeScript",
      detected: existsSync(resolve(cwd, "tsconfig.json")),
    },
    {
      name: "pnpm",
      detected:
        existsSync(resolve(cwd, "pnpm-workspace.yaml")) ||
        existsSync(resolve(cwd, "pnpm-lock.yaml")),
    },
    {
      name: "Git",
      detected: existsSync(resolve(cwd, ".git")),
    },
    {
      name: "Node.js",
      detected: existsSync(resolve(cwd, "package.json")),
    },
    {
      name: "Biome",
      detected: existsSync(resolve(cwd, "biome.json")),
    },
  ];

  return { name, path: cwd, features };
}

/**
 * Render workspace information.
 */
export function renderWorkspace(info: WorkspaceInfo): string {
  const lines: string[] = [];

  lines.push(sectionHeader("WORKSPACE"));
  lines.push("");
  lines.push(`    ${chalk.white(info.name)} ${chalk.gray(info.path)}`);
  lines.push("");

  for (const feature of info.features) {
    if (feature.detected) {
      const detail = feature.detail ? chalk.gray(` ${symbols.line} ${feature.detail}`) : "";
      lines.push(`    ${chalk.green(symbols.success)} ${chalk.white(feature.name)}${detail}`);
    }
  }

  return lines.join("\n");
}

/**
 * Print workspace info to console.
 */
export function printWorkspace(info: WorkspaceInfo): void {
  console.log(renderWorkspace(info));
}
