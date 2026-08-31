/**
 * DEVBYAI Tool System
 *
 * Defines the base Tool interface and provides built-in filesystem tools.
 */

// ---------------------------------------------------------------------------
// Core Tool Interface
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Built-in: ReadFile
// ---------------------------------------------------------------------------

export class ReadFileTool implements Tool {
  name = "read_file";
  description = "Read the contents of a file";
  permissions: ToolPermission[] = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      path: { type: "string", description: "File path to read" },
    },
    required: ["path"],
  };

  async execute(input: ToolInput): Promise<ToolResult> {
    const filePath = input.path as string;
    try {
      const fs = await import("node:fs/promises");
      const content = await fs.readFile(filePath, "utf-8");
      return { success: true, output: content };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
}

// ---------------------------------------------------------------------------
// Built-in: WriteFile
// ---------------------------------------------------------------------------

export class WriteFileTool implements Tool {
  name = "write_file";
  description = "Write content to a file, creating it if it doesn't exist";
  permissions: ToolPermission[] = ["write"];
  inputSchema = {
    type: "object",
    properties: {
      path: { type: "string", description: "File path to write" },
      content: { type: "string", description: "Content to write" },
    },
    required: ["path", "content"],
  };

  async execute(input: ToolInput): Promise<ToolResult> {
    const filePath = input.path as string;
    const content = input.content as string;
    try {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");
      return { success: true, output: `Written to ${filePath}` };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
}

// ---------------------------------------------------------------------------
// Built-in: ListDirectory
// ---------------------------------------------------------------------------

export class ListDirectoryTool implements Tool {
  name = "list_directory";
  description = "List files and directories in a path";
  permissions: ToolPermission[] = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      path: { type: "string", description: "Directory path to list" },
    },
    required: ["path"],
  };

  async execute(input: ToolInput): Promise<ToolResult> {
    const dirPath = input.path as string;
    try {
      const fs = await import("node:fs/promises");
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const output = entries.map((e) => `${e.isDirectory() ? "📁" : "📄"} ${e.name}`).join("\n");
      return { success: true, output };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
}

// ---------------------------------------------------------------------------
// Built-in: SearchFiles (simple grep)
// ---------------------------------------------------------------------------

export class SearchFilesTool implements Tool {
  name = "search_files";
  description = "Search for a pattern across project files";
  permissions: ToolPermission[] = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Search pattern (string)" },
      directory: { type: "string", description: "Directory to search in" },
    },
    required: ["pattern"],
  };

  async execute(input: ToolInput): Promise<ToolResult> {
    const pattern = input.pattern as string;
    const directory = (input.directory as string) || ".";
    try {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");

      const matches: string[] = [];
      const extensions = [".ts", ".js", ".json", ".yaml", ".yml"];

      async function walk(dir: string): Promise<void> {
        let entries: { name: string; isDirectory: () => boolean }[] | undefined;
        try {
          entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
          return;
        }
        for (const entry of entries) {
          if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist")
            continue;
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
            try {
              const content = await fs.readFile(fullPath, "utf-8");
              const lines = content.split("\n");
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(pattern)) {
                  matches.push(`${fullPath}:${i + 1}: ${lines[i].trim()}`);
                }
              }
            } catch {
              // skip unreadable files
            }
          }
        }
      }

      await walk(directory);

      return {
        success: true,
        output: matches.length > 0 ? matches.join("\n") : `No matches found for "${pattern}"`,
      };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
}

// ---------------------------------------------------------------------------
// Tool Registry
// ---------------------------------------------------------------------------

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  listNames(): string[] {
    return Array.from(this.tools.keys());
  }
}

/**
 * Create a ToolRegistry pre-loaded with the default filesystem tools.
 */
export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(new ReadFileTool());
  registry.register(new WriteFileTool());
  registry.register(new ListDirectoryTool());
  registry.register(new SearchFilesTool());
  return registry;
}
