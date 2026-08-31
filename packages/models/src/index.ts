/**
 * DEVBYAI Model Provider System
 *
 * Defines the ModelProvider abstraction and provides providers for
 * AI model integration.
 */

// ---------------------------------------------------------------------------
// Core ModelProvider Interface
// ---------------------------------------------------------------------------

export interface ModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ModelToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ModelStreamChunk {
  content?: string;
  toolCalls?: ModelToolCall[];
  done: boolean;
}

export type ProviderStatus =
  | "not-configured"
  | "configuring"
  | "available"
  | "connected"
  | "unavailable"
  | "error";

export interface ModelProvider {
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

  /** Check if provider is configured */
  isConfigured?(): boolean;

  /** Send a message and get a full response */
  generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse>;

  /** Send a message and get a streaming response */
  stream(messages: ModelMessage[], options?: GenerateOptions): AsyncIterable<ModelStreamChunk>;
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// ---------------------------------------------------------------------------
// MockProvider — for development and testing
// ---------------------------------------------------------------------------

export class MockProvider implements ModelProvider {
  readonly id = "mock";
  readonly name = "Mock Provider";

  private model = "mock-default";
  private responseDelay = 100;
  private _configured = true;

  async initialize(_config: Record<string, unknown>): Promise<void> {
    // No-op for mock
  }

  async listModels(): Promise<string[]> {
    return ["mock-default", "mock-fast", "mock-precise"];
  }

  getModel(): string {
    return this.model;
  }

  isConfigured(): boolean {
    return this._configured;
  }

  async generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse> {
    const model = options?.model || this.model;

    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, this.responseDelay));

    const lastMessage = messages[messages.length - 1];
    const userContent = lastMessage?.content || "";

    return {
      content: this.generateMockResponse(userContent),
      model,
      provider: this.id,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
    };
  }

  async *stream(
    messages: ModelMessage[],
    options?: GenerateOptions,
  ): AsyncIterable<ModelStreamChunk> {
    const response = await this.generate(messages, options);
    const words = response.content.split(" ");

    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      yield { content: `${word} `, done: false };
    }

    yield { done: true };
  }

  private generateMockResponse(input: string): string {
    if (input.toLowerCase().includes("explore")) {
      return "[MOCK] Exploring the codebase... Found TypeScript project with 12 source files.";
    }
    if (input.toLowerCase().includes("plan")) {
      return "[MOCK] Plan: 1) Analyze requirements. 2) Identify files. 3) Implement changes. 4) Verify.";
    }
    if (input.toLowerCase().includes("build")) {
      return "[MOCK] Building... Implementation complete. 3 files modified.";
    }
    return "[MOCK] Received your request. In v0.2.0 this will connect to a real AI provider.";
  }
}

// ---------------------------------------------------------------------------
// Provider Registry
// ---------------------------------------------------------------------------

export class ProviderRegistry {
  private providers = new Map<string, () => ModelProvider>();
  private activeProviderId: string | null = null;
  private activeModel: string | null = null;

  register(factory: () => ModelProvider): void {
    const provider = factory();
    this.providers.set(provider.id, factory);
  }

  create(id: string): ModelProvider | undefined {
    const factory = this.providers.get(id);
    return factory ? factory() : undefined;
  }

  listIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /** Set the active provider */
  setActiveProvider(id: string): boolean {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
      return true;
    }
    return false;
  }

  /** Get the active provider ID */
  getActiveProviderId(): string | null {
    return this.activeProviderId;
  }

  /** Set the active model */
  setActiveModel(model: string): void {
    this.activeModel = model;
  }

  /** Get the active model */
  getActiveModel(): string | null {
    return this.activeModel;
  }

  /** Get provider status */
  getStatus(id: string): ProviderStatus {
    const provider = this.create(id);
    if (!provider) return "unavailable";
    if (provider.isConfigured && !provider.isConfigured()) return "not-configured";
    return "available";
  }
}

/**
 * Create a ProviderRegistry pre-loaded with available providers.
 */
export function createDefaultProviderRegistry(): ProviderRegistry {
  const registry = new ProviderRegistry();

  // Always register mock provider
  registry.register(() => new MockProvider());

  // Register OpenAI provider if available
  try {
    const { OpenAIProvider } = require("./openai.js") as typeof import("./openai.js");
    registry.register(() => new OpenAIProvider());
  } catch {
    // OpenAI not available — mock only
  }

  // Set default active provider
  registry.setActiveProvider("mock");

  return registry;
}

// Re-export OpenAI provider
export {
  OpenAIProvider,
  ProviderNotConfiguredError,
  ProviderAuthenticationError,
  ProviderNetworkError,
} from "./openai.js";
export type { OpenAIProviderConfig } from "./openai.js";
