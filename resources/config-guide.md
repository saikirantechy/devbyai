# Configuration Guide

DEVBYAI uses a `devbyai.json` config file in the workspace root, managed by `@devbyai/config`.

---

## 1. Default Configuration

Created by `devbyai init`:

```json
{
  "provider": "mock",
  "model": "mock",
  "permissions": {
    "write": "ask",
    "execute": "ask",
    "network": "ask"
  }
}
```

- `provider` — AI provider ID (e.g. `mock`, `openai`).
- `model` — Model name for the provider.
- `permissions` — Tool permission policy (`ask`, `allow`, `deny`).

---

## 2. Config API

```ts
import { loadConfig, getConfig, getApiKey } from "@devbyai/config";

await loadConfig(cwd);          // loads devbyai.json
const config = getConfig();     // returns current config object
const apiKey = getApiKey("openai"); // reads OPENAI_API_KEY env var
```

API keys are read from environment variables (`<PROVIDER>_API_KEY`), never stored in `devbyai.json`.

---

## 3. Adding a Config Option

1. Add the field to the default config in `apps/cli/src/index.ts` (`init` command).
2. Read it via `getConfig()` in your code.
3. Document it here and in `docs/`.

---

## 4. Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI provider key |
| `ANTHROPIC_API_KEY` | Anthropic provider key |
| `DEVBYAI_PROVIDER` | Default provider override |
| `DEVBYAI_MODEL` | Default model override |

---

## 5. Run Checks

```bash
pnpm --filter @devbyai/config lint
pnpm --filter @devbyai/config typecheck
pnpm --filter @devbyai/config test
```
