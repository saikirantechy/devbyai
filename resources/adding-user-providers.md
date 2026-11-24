# Adding User Providers

This guide shows how users and contributors can add custom AI model providers to DEVBYAI.

---

## 1. Provider Interface

Defined in `packages/models/src/index.ts`:

```ts
export type ProviderStatus =
  | "not-configured"
  | "configuring"
  | "available"
  | "connected"
  | "unavailable"
  | "error";

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

## 2. Creating a Custom Provider

Create `packages/models/src/<your-provider>.ts`:

```ts
import type {
  ModelProvider,
  ModelMessage,
  ModelResponse,
  ModelStreamChunk,
  GenerateOptions,
} from "./index.js";

export class YourProvider implements ModelProvider {
  readonly id = "your-provider";
  readonly name = "Your Provider Name";
  private model = "default-model";
  private _configured = false;

  async initialize(config: Record<string, unknown>): Promise<void> {
    // Read apiKey, baseUrl, etc. from config
    this._configured = true;
  }

  async listModels(): Promise<string[]> {
    return ["default-model", "pro-model", "fast-model"];
  }

  getModel(): string {
    return this.model;
  }

  isConfigured(): boolean {
    return this._configured;
  }

  async generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse> {
    // Call your provider's API
    return {
      content: "AI response",
      model: options?.model || this.model,
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
      yield { content: `${word} `, done: false };
    }
    yield { done: true };
  }
}
```

### Error Classes (Optional)

Define provider-specific errors if needed (see `openai.ts` for `ProviderNotConfiguredError`, `ProviderAuthenticationError`, `ProviderNetworkError`):

```ts
export class YourProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YourProviderError";
  }
}
```

---

## 3. Registering the Provider

Open `packages/models/src/index.ts` and update `createDefaultProviderRegistry()`:

```ts
export function createDefaultProviderRegistry(): ProviderRegistry {
  const registry = new ProviderRegistry();
  registry.register(() => new MockProvider());

  try {
    const { YourProvider } = await import("./your-provider.js");
    registry.register(() => new YourProvider());
  } catch {
    // Provider not available — skip gracefully
  }

  registry.setActiveProvider("mock");
  return registry;
}
```

Export from `index.ts`:

```ts
export { YourProvider } from "./your-provider.js";
export type { YourProviderConfig } from "./your-provider.js";
```

---

## 4. Provider Configuration

Users configure providers in `devbyai.json`:

```json
{
  "provider": "your-provider",
  "model": "default-model",
  "providers": {
    "your-provider": {
      "baseUrl": "https://api.yourprovider.com/v1",
      "model": "default-model"
    }
  }
}
```

API keys come from environment variables:

```bash
$env:YOUR_PROVIDER_API_KEY="sk-your-key"  # PowerShell
export YOUR_PROVIDER_API_KEY="sk-your-key"  # bash/zsh
```

The `getApiKey("your-provider")` function checks `process.env.YOUR_PROVIDER_API_KEY`.

---

## 5. Provider Status

The `ProviderRegistry.getStatus(id)` method returns:

| Status | Meaning |
|--------|---------|
| `not-configured` | Provider exists but not configured |
| `configuring` | Provider is being set up |
| `available` | Provider is ready to use |
| `connected` | Provider has active connection |
| `unavailable` | Provider not found or not installable |
| `error` | Provider encountered an error |

---

## 6. Testing Custom Providers

```ts
import { describe, expect, it } from "vitest";
import { YourProvider } from "../your-provider.js";

describe("YourProvider", () => {
  it("has correct id and name", () => {
    const provider = new YourProvider();
    expect(provider.id).toBe("your-provider");
    expect(provider.name).toBe("Your Provider Name");
  });

  it("lists models", async () => {
    const provider = new YourProvider();
    const models = await provider.listModels();
    expect(models.length).toBeGreaterThan(0);
  });

  it("starts unconfigured", () => {
    const provider = new YourProvider();
    expect(provider.isConfigured()).toBe(false);
  });
});
```

---

## 7. Checklist

- [ ] Provider class implements `ModelProvider`
- [ ] `id` is unique (kebab-case)
- [ ] `initialize()`, `listModels()`, `getModel()`, `generate()`, `stream()` implemented
- [ ] Errors caught and handled gracefully (never throw uncaught)
- [ ] Registered in `createDefaultProviderRegistry()`
- [ ] Exported from `packages/models/src/index.ts`
- [ ] Environment variable documented (`<PROVIDER>_API_KEY`)
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/models lint && typecheck && test` passes
