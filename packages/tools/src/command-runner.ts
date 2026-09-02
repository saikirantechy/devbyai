/**
 * DEVBYAI Command Runner Tool
 *
 * Runs shell commands asynchronously with configurable working directory,
 * timeout, and output truncation.
 */

import { exec } from "node:child_process";
import type { Tool, ToolInput, ToolResult, ToolPermission } from "./types.js";

const DEFAULT_TIMEOUT_MS = 120000;
const MAX_BUFFER = 1024 * 1024 * 5; // 5MB
const MAX_OUTPUT_CHARS = 50 * 1024; // 50KB

export interface CommandResult extends ToolResult {
  exitCode: number;
  duration: number;
}

export class CommandRunnerTool implements Tool {
  name = "run_command";
  description = "Run a shell command in a specified working directory";
  permissions: ToolPermission[] = ["execute"];
  inputSchema = {
    type: "object",
    properties: {
      command: { type: "string", description: "Shell command to execute" },
      cwd: { type: "string", description: "Working directory to run the command in" },
      timeout: {
        type: "number",
        description: "Timeout in milliseconds (default 120000)",
      },
    },
    required: ["command", "cwd"],
  };

  async execute(input: ToolInput): Promise<CommandResult> {
    const command = input.command as string;
    const cwd = input.cwd as string;
    const timeout = (input.timeout as number) ?? DEFAULT_TIMEOUT_MS;

    const startedAt = Date.now();

    try {
      const result = await new Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
        killed: boolean;
      }>((resolve, reject) => {
        const child = exec(
          command,
          { cwd, timeout, maxBuffer: MAX_BUFFER, encoding: "utf-8" },
          (error, stdout, stderr) => {
            const err = error as (NodeJS.ErrnoException & { killed?: boolean; signal?: string }) | null;
            const wasKilled = err !== null && (err.killed === true || err.signal === "SIGTERM");

            const exitCode = err === null ? 0 : 1;

            resolve({ stdout, stderr, exitCode, killed: wasKilled });
          },
        );

        child.on("error", (err) => {
          resolve({
            stdout: "",
            stderr: String(err),
            exitCode: 1,
            killed: false,
          });
        });
      });

      let output = (result.stdout || "") + (result.stderr || "");
      const duration = Date.now() - startedAt;

      let truncated = false;
      if (output.length > MAX_OUTPUT_CHARS) {
        output = output.slice(0, MAX_OUTPUT_CHARS);
        truncated = true;
      }

      if (result.killed) {
        output = `${output}\n[Command timed out after ${timeout}ms and was terminated.]`;
      }

      if (truncated) {
        output += "\n[Output truncated — exceeds 50KB]";
      }

      return {
        success: result.exitCode === 0,
        output: output || "(no output)",
        exitCode: result.exitCode,
        duration,
      };
    } catch (err) {
      const duration = Date.now() - startedAt;
      return {
        success: false,
        output: "",
        error: String(err),
        exitCode: 1,
        duration,
      };
    }
  }
}
