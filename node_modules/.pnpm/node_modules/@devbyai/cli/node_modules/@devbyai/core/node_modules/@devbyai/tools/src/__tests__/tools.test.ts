import { describe, expect, it } from "vitest";
import {
  ListDirectoryTool,
  ReadFileTool,
  SearchFilesTool,
  createDefaultToolRegistry,
} from "../index.js";

describe("ToolRegistry", () => {
  it("registers and retrieves tools", () => {
    const registry = createDefaultToolRegistry();
    expect(registry.listNames()).toContain("read_file");
    expect(registry.listNames()).toContain("write_file");
    expect(registry.listNames()).toContain("list_directory");
    expect(registry.listNames()).toContain("search_files");
  });

  it("returns all tools", () => {
    const registry = createDefaultToolRegistry();
    expect(registry.list().length).toBe(4);
  });

  it("returns undefined for unknown tool", () => {
    const registry = createDefaultToolRegistry();
    expect(registry.get("nonexistent")).toBeUndefined();
  });
});

describe("ReadFileTool", () => {
  it("has correct metadata", () => {
    const tool = new ReadFileTool();
    expect(tool.name).toBe("read_file");
    expect(tool.permissions).toContain("read");
  });

  it("reads existing file", async () => {
    const tool = new ReadFileTool();
    const result = await tool.execute({ path: "package.json" });
    expect(result.success).toBe(true);
    expect(result.output).toContain("devbyai");
  });

  it("fails on non-existent file", async () => {
    const tool = new ReadFileTool();
    const result = await tool.execute({ path: "/nonexistent/file.txt" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("ListDirectoryTool", () => {
  it("has correct metadata", () => {
    const tool = new ListDirectoryTool();
    expect(tool.name).toBe("list_directory");
    expect(tool.permissions).toContain("read");
  });

  it("lists directory contents", async () => {
    const tool = new ListDirectoryTool();
    const result = await tool.execute({ path: "." });
    expect(result.success).toBe(true);
    expect(result.output).toContain("package.json");
    expect(result.output).toContain("README.md");
  });

  it("fails on non-existent directory", async () => {
    const tool = new ListDirectoryTool();
    const result = await tool.execute({ path: "/nonexistent/dir" });
    expect(result.success).toBe(false);
  });
});

describe("SearchFilesTool", () => {
  it("has correct metadata", () => {
    const tool = new SearchFilesTool();
    expect(tool.name).toBe("search_files");
    expect(tool.permissions).toContain("read");
  });

  it("finds matching content", async () => {
    const tool = new SearchFilesTool();
    const result = await tool.execute({ pattern: "devbyai" });
    expect(result.success).toBe(true);
    expect(result.output).toContain("package.json");
  });
});
