# AI Model Hub & Provider Architecture

This is the most important foundation because DevByAI supports both **shared free access** and **BYOK** (Bring Your Own Key).

---

## A. Provider Adapter System

Create one common interface for all providers. Each provider gets its own adapter.

```ts
interface AIProvider {
  id: string;
  listModels(): Promise<AIModel[]>;
  generate(request: AIRequest): Promise<AIResponse>;
  stream(request: AIRequest): AsyncIterable<AIStreamChunk>;
  supportsTools(modelId: string): boolean;
  getUsage?(): Promise<ProviderUsage>;
}
```

### Separate adapters:

```
providers/
  gemini/
    adapter.ts
  groq/
    adapter.ts
  openrouter/
    adapter.ts
  ollama/
    adapter.ts

gateway/
  model-router.ts
  provider-registry.ts
  quota-manager.ts
  fallback-manager.ts
```

**Advantage:** The coding agent doesn't need to know whether it is talking to Gemini, Groq, or another provider.

---

## B. Model Catalog

Do not hardcode model options into the frontend. Maintain a model catalog:

| Field | Purpose |
|-------|---------|
| `model_id` | Unique provider/model identifier |
| `provider_id` | Provider name |
| `display_name` | User-facing model name |
| `coding_score` | Evaluated coding suitability |
| `context_limit` | Supported context window |
| `supports_tools` | Tool-calling capability |
| `supports_streaming` | Streaming capability |
| `access_modes` | Shared, BYOK, or local |
| `availability` | Available, disabled, or temporarily unavailable |

The coding score should come from your own evaluation, not an unsupported claim that one model is universally best.

---

## C. Shared Free Access vs BYOK

### Shared Free Access (Platform-managed)

1. User selects a model marked as available for shared access.
2. Backend checks the user's allowance and provider quota.
3. Request goes through DevByAI's provider account.
4. Usage is recorded against the shared allowance.

### Bring Your Own Key (User-managed)

1. User connects a supported provider.
2. Backend securely stores the encrypted credential.
3. User selects a model available through that credential.
4. Requests use the user's provider account.

**Recommendation:** Let users choose their preferred access mode per session, rather than forcing a global account setting.

### Important Safeguards

- Encrypt user API keys at rest.
- Never return full API keys to the frontend.
- Never write secrets into logs or error messages.
- Allow users to revoke and replace keys.
- Do not silently switch from BYOK to shared access.
- Show when a provider's free quota is exhausted.
- Keep provider terms and rate limits in mind.

---

## D. Smart Model Routing

Routing should consider the task and model capabilities:

| Task | Routing preference |
|------|-------------------|
| Explain code | Fast, inexpensive model |
| Generate code | Strong coding model |
| Debug errors | Model with good reasoning |
| Repository analysis | Long-context model |
| Agent tool calls | Model with reliable tool calling |
| Generate tests | Coding-capable model |

Allow users to override automatic selection.

A model being available through a free tier does not automatically mean it supports all the tools your agent needs.