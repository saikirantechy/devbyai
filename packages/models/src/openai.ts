/**
 * DEVBYAI OpenAI Provider
 *
 * Production-quality OpenAI integration with streaming support.
 * Also supports OpenAI-compatible APIs via custom base URL.
 */

import OpenAI from "openai";
import type {
  GenerateOptions,
  ModelMessage,
  ModelProvider,
  ModelResponse,
  ModelStreamChunk,
} from "./index.js";

export interface OpenAIProviderConfig {
  /** API key (from env or config) */
  apiKey?: string;
  /** Custom base URL for OpenAI-compatible APIs */
  baseUrl?: string;
  /** Default model to use */
  model?: string;
}

export class OpenAIProvider implements ModelProvider {
  readonly id = "openai";
  readonly name = "OpenAI";

  private client: OpenAI | null = null;
  private model: string;
  private configured = false;

  constructor() {
    this.model = "gpt-4o";
  }

  async initialize(config: Record<string, unknown>): Promise<void> {
    const openaiConfig = config as OpenAIProviderConfig;

    // Try to get API key from config, then environment
    const apiKey = openaiConfig.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.configured = false;
      return;
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: openaiConfig.baseUrl || process.env.OPENAI_BASE_URL || undefined,
    });

    if (openaiConfig.model) {
      this.model = openaiConfig.model;
    }

    this.configured = true;
  }

  async listModels(): Promise<string[]> {
    if (!this.configured || !this.client) {
      return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
    }

    try {
      const response = await this.client.models.list();
      return response.data
        .filter((m) => m.id.startsWith("gpt-"))
        .map((m) => m.id)
        .sort();
    } catch {
      // Fallback to known models if API call fails
      return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
    }
  }

  getModel(): string {
    return this.model;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse> {
    if (!this.client) {
      throw new ProviderNotConfiguredError("OpenAI API key not configured");
    }

    const model = options?.model || this.model;

    const response = await this.client.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    });

    const choice = response.choices[0];

    return {
      content: choice?.message?.content || "",
      model: response.model,
      provider: this.id,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *stream(
    messages: ModelMessage[],
    options?: GenerateOptions,
  ): AsyncIterable<ModelStreamChunk> {
    if (!this.client) {
      throw new ProviderNotConfiguredError("OpenAI API key not configured");
    }

    const model = options?.model || this.model;

    const stream = await this.client.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield { content: delta.content, done: false };
      }
      if (chunk.choices[0]?.finish_reason) {
        yield { done: true };
      }
    }
  }
}

/**
 * Error thrown when provider is not configured.
 */
export class ProviderNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderNotConfiguredError";
  }
}

/**
 * Error thrown when provider authentication fails.
 */
export class ProviderAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderAuthenticationError";
  }
}

/**
 * Error thrown when provider network request fails.
 */
export class ProviderNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderNetworkError";
  }
}
