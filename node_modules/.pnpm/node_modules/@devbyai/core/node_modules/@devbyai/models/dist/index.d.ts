/**
 * DEVBYAI Model Provider System
 *
 * Defines the ModelProvider abstraction and provides a MockProvider for
 * development and testing.
 */
interface ModelMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
interface ModelResponse {
    content: string;
    model: string;
    provider: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
interface ModelToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}
interface ModelStreamChunk {
    content?: string;
    toolCalls?: ModelToolCall[];
    done: boolean;
}
interface ModelProvider {
    /** Provider identifier */
    readonly id: string;
    /** Human-readable name */
    readonly name: string;
    /** Initialize the provider with configuration */
    initialize(config: Record<string, unknown>): Promise<void>;
    /** List available models */
    listModels(): Promise<string[]>;
    /** Get the currently selected model */
    getModel(): string;
    /** Send a message and get a full response */
    generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse>;
    /** Send a message and get a streaming response */
    stream(messages: ModelMessage[], options?: GenerateOptions): AsyncIterable<ModelStreamChunk>;
}
interface GenerateOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
declare class MockProvider implements ModelProvider {
    readonly id = "mock";
    readonly name = "Mock Provider";
    private model;
    private responseDelay;
    initialize(_config: Record<string, unknown>): Promise<void>;
    listModels(): Promise<string[]>;
    getModel(): string;
    generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse>;
    stream(messages: ModelMessage[], options?: GenerateOptions): AsyncIterable<ModelStreamChunk>;
    private generateMockResponse;
}
declare class ProviderRegistry {
    private providers;
    register(factory: () => ModelProvider): void;
    create(id: string): ModelProvider | undefined;
    listIds(): string[];
}
/**
 * Create a ProviderRegistry pre-loaded with the mock provider.
 */
declare function createDefaultProviderRegistry(): ProviderRegistry;

export { type GenerateOptions, MockProvider, type ModelMessage, type ModelProvider, type ModelResponse, type ModelStreamChunk, type ModelToolCall, ProviderRegistry, createDefaultProviderRegistry };
