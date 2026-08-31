/**
 * DEVBYAI Tool System
 *
 * Defines the base Tool interface and provides built-in filesystem tools.
 */
type ToolPermission = "read" | "write" | "execute" | "network" | "dangerous";
interface ToolInput {
    [key: string]: unknown;
}
interface ToolResult {
    success: boolean;
    output: string;
    error?: string;
}
interface Tool {
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
declare class ReadFileTool implements Tool {
    name: string;
    description: string;
    permissions: ToolPermission[];
    inputSchema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    execute(input: ToolInput): Promise<ToolResult>;
}
declare class WriteFileTool implements Tool {
    name: string;
    description: string;
    permissions: ToolPermission[];
    inputSchema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    execute(input: ToolInput): Promise<ToolResult>;
}
declare class ListDirectoryTool implements Tool {
    name: string;
    description: string;
    permissions: ToolPermission[];
    inputSchema: {
        type: string;
        properties: {
            path: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    execute(input: ToolInput): Promise<ToolResult>;
}
declare class SearchFilesTool implements Tool {
    name: string;
    description: string;
    permissions: ToolPermission[];
    inputSchema: {
        type: string;
        properties: {
            pattern: {
                type: string;
                description: string;
            };
            directory: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    execute(input: ToolInput): Promise<ToolResult>;
}
declare class ToolRegistry {
    private tools;
    register(tool: Tool): void;
    get(name: string): Tool | undefined;
    list(): Tool[];
    listNames(): string[];
}
/**
 * Create a ToolRegistry pre-loaded with the default filesystem tools.
 */
declare function createDefaultToolRegistry(): ToolRegistry;

export { ListDirectoryTool, ReadFileTool, SearchFilesTool, type Tool, type ToolInput, type ToolPermission, ToolRegistry, type ToolResult, WriteFileTool, createDefaultToolRegistry };
