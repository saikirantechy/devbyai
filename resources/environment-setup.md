# Environment Setup — Run `devbyai` Globally

This guide walks a new user through installing DEVBYAI from the GitHub repo and running the `devbyai` command from any terminal, anywhere on their machine.

---

## 1. Prerequisites

Before you begin, install these tools:

| Tool | Minimum Version | Download |
|------|-----------------|----------|
| Node.js | 18+ | https://nodejs.org/ |
| pnpm | 8+ | https://pnpm.io/install |
| Git | 2.0+ | https://git-scm.com/ |

Verify your installation:

```powershell
node --version      # v18.x.x or higher
pnpm --version      # 8.x.x or higher
git --version       # git version 2.x.x
```

---

## 2. Clone the Repository

```powershell
git clone https://github.com/saikirantechy/devbyai.git
cd devbyai
```

---

## 3. Install Dependencies

DEVBYAI is a pnpm monorepo. Install all workspace dependencies:

```powershell
pnpm install
```

---

## 4. Build All Packages

Build the TypeScript source into distributable JavaScript:

```powershell
pnpm build
```

This compiles every package in `apps/` and `packages/` into `dist/` folders.

---

## 5. Run `devbyai` Locally (Without Global Install)

You can run the CLI directly from the repo:

```powershell
pnpm dev
# or
node apps/cli/dist/index.js --help
```

---

## 6. Install `devbyai` Globally (Recommended)

To type `devbyai` from **any terminal, any folder**, link the CLI globally.

### Step 6a — Set up pnpm global bin (one-time)

```powershell
pnpm setup
```

This adds `C:\Users\DELL\AppData\Local\pnpm` to your system PATH.

> **Important:** After running `pnpm setup`, close and reopen your terminal so the new PATH takes effect.

### Step 6b — Link the CLI globally

From the `apps/cli` folder:

```powershell
cd apps/cli
pnpm link --global
```

### Step 6c — Verify

Open a **new terminal window** and run:

```powershell
devbyai --help
devbyai version
devbyai doctor
```

You should see the DEVBYAI help output.

---

## 7. Environment Variables

DEVBYAI works out of the box with the built-in **MockProvider** (no API key required). To use real AI providers, set the corresponding environment variable.

### Create an `.env` file (optional but recommended)

In the repo root, create `.env`:

```powershell
# Copy this to .env and fill in your values
# DEVBYAI_PROVIDER=mock
# DEVBYAI_MODEL=mock

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Google
GOOGLE_API_KEY=your-google-key
```

### Load the `.env` file

PowerShell (Windows):

```powershell
Get-Content .env | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { $env:$matches[1] = $matches[2] } }
```

macOS / Linux:

```bash
export $(grep -v '^#' .env | xargs)
```

Or set them manually in your shell:

**PowerShell (Windows):**

```powershell
$env:OPENAI_API_KEY="sk-your-key"
$env:DEVBYAI_PROVIDER="openai"
$env:DEVBYAI_MODEL="gpt-4o"
```

**macOS / Linux (bash/zsh):**

```bash
export OPENAI_API_KEY="sk-your-key"
export DEVBYAI_PROVIDER="openai"
export DEVBYAI_MODEL="gpt-4o"
```

### Supported Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DEVBYAI_PROVIDER` | Default AI provider | `openai`, `anthropic`, `google`, `mock` |
| `DEVBYAI_MODEL` | Default model name | `gpt-4o`, `claude-3-sonnet` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `OPENAI_BASE_URL` | OpenAI-compatible base URL | `https://api.openai.com/v1` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `GOOGLE_API_KEY` | Google API key | `...` |
| `CI` | Set to `true` in CI environments | `true` |
| `NO_COLOR` | Disable colored output | `1` |
| `FORCE_COLOR` | Force color output | `1` or `0` |

---

## 8. Initialize Configuration (Optional)

Generate a `devbyai.json` config file in your workspace:

```powershell
devbyai init
```

This creates:

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

---

## 9. Quick Start Checklist

```powershell
# 1. Clone
git clone https://github.com/saikirantechy/devbyai.git
cd devbyai

# 2. Install & build
pnpm install
pnpm build

# 3. Global link (one-time)
pnpm setup
# ⚠️ Close & reopen terminal after this

cd apps/cli
pnpm link --global

# 4. Use it
devbyai --help
devbyai doctor
devbyai demo
```

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| `devbyai` not recognized | Close and reopen terminal after `pnpm setup` |
| Build fails | Run `pnpm install` then `pnpm build` again |
| Provider not configured | Set `OPENAI_API_KEY` (or relevant provider key) |
| `tsup` not found | Run `pnpm install` to install workspace devDependencies |
| Tests fail | Run `pnpm test` from repo root to see details |

---

## Next Steps

- Read [`CONTRIBUTING.md`](../CONTRIBUTING.md) to contribute code.
- Browse [`resources/`](../resources/) for coding guides.
- Open issues or discussions at https://github.com/saikirantechy/devbyai