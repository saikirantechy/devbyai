/**
 * DEVBYAI Tool System — Core Types
 *
 * Shared type definitions used across tool implementations.
 */

export type ToolPermission = "read" | "write" | "execute" | "network" | "dangerous";

export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface Tool {
  /** Unique tool name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Permission(s) required to run this tool */
  permissions: ToolPermission[];
  /** JSON Schema for the tool's input */
  inputSchema: Record<string, unknown>;

  /** Execute the tool with the given input */
  execute(input: ToolInput): Promise<ToolResult>;
}
