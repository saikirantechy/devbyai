// src/index.ts
var ReadFileTool = class {
  name = "read_file";
  description = "Read the contents of a file";
  permissions = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      path: { type: "string", description: "File path to read" }
    },
    required: ["path"]
  };
  async execute(input) {
    const filePath = input.path;
    try {
      const fs = await import("fs/promises");
      const content = await fs.readFile(filePath, "utf-8");
      return { success: true, output: content };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
};
var WriteFileTool = class {
  name = "write_file";
  description = "Write content to a file, creating it if it doesn't exist";
  permissions = ["write"];
  inputSchema = {
    type: "object",
    properties: {
      path: { type: "string", description: "File path to write" },
      content: { type: "string", description: "Content to write" }
    },
    required: ["path", "content"]
  };
  async execute(input) {
    const filePath = input.path;
    const content = input.content;
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");
      return { success: true, output: `Written to ${filePath}` };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
};
var ListDirectoryTool = class {
  name = "list_directory";
  description = "List files and directories in a path";
  permissions = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      path: { type: "string", description: "Directory path to list" }
    },
    required: ["path"]
  };
  async execute(input) {
    const dirPath = input.path;
    try {
      const fs = await import("fs/promises");
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const output = entries.map((e) => `${e.isDirectory() ? "\u{1F4C1}" : "\u{1F4C4}"} ${e.name}`).join("\n");
      return { success: true, output };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
};
var SearchFilesTool = class {
  name = "search_files";
  description = "Search for a pattern across project files";
  permissions = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Search pattern (string)" },
      directory: { type: "string", description: "Directory to search in" }
    },
    required: ["pattern"]
  };
  async execute(input) {
    const pattern = input.pattern;
    const directory = input.directory || ".";
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const matches = [];
      const extensions = [".ts", ".js", ".json", ".yaml", ".yml"];
      async function walk(dir) {
        let entries;
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
            }
          }
        }
      }
      await walk(directory);
      return {
        success: true,
        output: matches.length > 0 ? matches.join("\n") : `No matches found for "${pattern}"`
      };
    } catch (err) {
      return { success: false, output: "", error: String(err) };
    }
  }
};
var ToolRegistry = class {
  tools = /* @__PURE__ */ new Map();
  register(tool) {
    this.tools.set(tool.name, tool);
  }
  get(name) {
    return this.tools.get(name);
  }
  list() {
    return Array.from(this.tools.values());
  }
  listNames() {
    return Array.from(this.tools.keys());
  }
};
function createDefaultToolRegistry() {
  const registry = new ToolRegistry();
  registry.register(new ReadFileTool());
  registry.register(new WriteFileTool());
  registry.register(new ListDirectoryTool());
  registry.register(new SearchFilesTool());
  return registry;
}
export {
  ListDirectoryTool,
  ReadFileTool,
  SearchFilesTool,
  ToolRegistry,
  WriteFileTool,
  createDefaultToolRegistry
};
