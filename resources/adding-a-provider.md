# Adding a New AI Model Provider

Providers let DEVBYAI talk to different AI models (OpenAI, Anthropic, Ollama, etc.). This guide shows how to add one.

---

## 1. Understand the Provider Interface

Defined in `packages/models/src/index.ts`:

```ts
export interface ModelProvider {
  readonly id: string;
  readonly name: string;
  initialize(config: Record<string, unknown>): Promise<void>;
  listModels(): Promise<string[]>;
  getModel(): string;
  isConfigured?(): boolean;
  generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse>;
  stream(messages: ModelMessage[], options?: GenerateOptions): AsyncIterable<ModelStreamChunk>;
}
```

See `MockProvider` in the same file for a complete reference implementation.

---

## 2. Implement the Provider

Create `packages/models/src/<provider>.ts`. Example — a minimal provider:

```ts
import type {
  ModelProvider,
  ModelMessage,
  ModelResponse,
  ModelStreamChunk,
  GenerateOptions,
} from "./index.js";

export class AnthropicProvider implements ModelProvider {
  readonly id = "anthropic";
  readonly name = "Anthropic";
  private model = "claude-3-haiku";
  private _configured = false;

  async initialize(config: Record<string, unknown>): Promise<void> {
    // store api key, etc.
    this._configured = true;
  }

  async listModels(): Promise<string[]> {
    return ["claude-3-haiku", "claude-3-sonnet", "claude-3-opus"];
  }

  getModel(): string {
    return this.model;
  }

  isConfigured(): boolean {
    return this._configured;
  }

  async generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse> {
    // call Anthropic API here
    return {
      content: "...",
      model: options?.model || this.model,
      provider: this.id,
    };
  }

  async *stream(
    messages: ModelMessage[],
    options?: GenerateOptions,
  ): AsyncIterable<ModelStreamChunk> {
    const response = await this.generate(messages, options);
    yield { content: response.content, done: true };
  }
}
```

Also define error classes if needed (see `openai.ts` for `ProviderNotConfiguredError`, etc.).

---

## 3. Register the Provider

Open `packages/models/src/index.ts` and update `createDefaultProviderRegistry()`:

```ts
export function createDefaultProviderRegistry(): ProviderRegistry {
  const registry = new ProviderRegistry();
  registry.register(() => new MockProvider());

  try {
    const { AnthropicProvider } = await import("./anthropic.js");
    registry.register(() => new AnthropicProvider());
  } catch {
    // provider not available — skip
  }

  registry.setActiveProvider("mock");
  return registry;
}
```

Note: The existing code uses `require()` for OpenAI. New providers can use dynamic `import()` for ESM compatibility.

---

## 4. Export from `index.ts`

```ts
export { AnthropicProvider } from "./anthropic.js";
export type { AnthropicProviderConfig } from "./anthropic.js";
```

---

## 5. Write Tests

Create `packages/models/src/__tests__/anthropic.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { AnthropicProvider } from "../anthropic.js";

describe("AnthropicProvider", () => {
  it("lists models", async () => {
    const provider = new AnthropicProvider();
    const models = await provider.listModels();
    expect(models.length).toBeGreaterThan(0);
  });
});
```

---

## 6. Run Checks

```bash
pnpm --filter @devbyai/models lint
pnpm --filter @devbyai/models typecheck
pnpm --filter @devbyai/models test
```
