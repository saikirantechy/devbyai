# Adding User Models

This guide shows how users and contributors can add custom AI models to DEVBYAI.

---

## 1. Model Interface

Defined in `packages/models/src/index.ts`:

```ts
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

export interface ModelStreamChunk {
  content?: string;
  toolCalls?: ModelToolCall[];
  done: boolean;
}

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

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
```

---

## 2. Adding a Custom Model

To add a new model, you typically add it to an existing provider's `listModels()` method, or create a new provider.

### Option A — Add model to existing provider

Open `packages/models/src/openai.ts` (or your provider) and add the model ID to `listModels()`:

```ts
async listModels(): Promise<string[]> {
  return ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", "your-custom-model"];
}
```

### Option B — Create a new provider with custom models

Create `packages/models/src/your-provider.ts`:

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
  readonly name = "Your Provider";
  private model = "your-default-model";
  private _configured = false;

  async initialize(config: Record<string, unknown>): Promise<void> {
    // Store API key, endpoint, etc.
    this._configured = true;
  }

  async listModels(): Promise<string[]> {
    return ["your-default-model", "your-pro-model", "your-fast-model"];
  }

  getModel(): string {
    return this.model;
  }

  isConfigured(): boolean {
    return this._configured;
  }

  async generate(messages: ModelMessage[], options?: GenerateOptions): Promise<ModelResponse> {
    // Call your model API
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
    // Provider not available — skip
  }

  registry.setActiveProvider("mock");
  return registry;
}
```

Export from `index.ts`:

```ts
export { YourProvider } from "./your-provider.js";
```

---

## 4. User-Configurable Models (Runtime)

Users can configure models through `devbyai.json`:

```json
{
  "provider": "your-provider",
  "model": "your-custom-model",
  "providers": {
    "your-provider": {
      "apiKey": "...",
      "baseUrl": "https://api.example.com/v1",
      "model": "your-custom-model"
    }
  }
}
```

API keys should come from environment variables, not the config file:

```bash
$env:YOUR_PROVIDER_API_KEY="your-key"  # PowerShell
export YOUR_PROVIDER_API_KEY="your-key"  # bash/zsh
```

The config system reads keys via `getApiKey(providerId)` which checks `process.env.<PROVIDER>_API_KEY`.

---

## 5. Model Catalog

If you maintain a model catalog (for a web dashboard), add entries like:

| Field | Example |
|-------|---------|
| `model_id` | `your-provider/your-custom-model` |
| `provider_id` | `your-provider` |
| `display_name` | "Your Custom Model" |
| `coding_score` | 75 |
| `context_limit` | 32768 |
| `supports_tools` | true |
| `supports_streaming` | true |
| `access_modes` | `["BYOK"]` |
| `availability` | `available` |

---

## 6. Testing Custom Models

```ts
import { describe, expect, it } from "vitest";
import { YourProvider } from "../your-provider.js";

describe("YourProvider", () => {
  it("lists models", async () => {
    const provider = new YourProvider();
    const models = await provider.listModels();
    expect(models.length).toBeGreaterThan(0);
  });

  it("returns configured status", () => {
    const provider = new YourProvider();
    expect(provider.isConfigured()).toBe(false);
  });
});
```

---

## 7. Checklist

- [ ] New provider implements `ModelProvider` interface
- [ ] `listModels()` returns available model IDs
- [ ] `generate()` and `stream()` implemented
- [ ] Provider registered in `createDefaultProviderRegistry()`
- [ ] Exported from `packages/models/src/index.ts`
- [ ] Environment variable documented for API key
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/models lint && typecheck && test` passes
