# Local Development Setup

A detailed guide to setting up your development environment for DEVBYAI.

---

## Prerequisites

Make sure you have the following installed:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org/ |
| pnpm | 8+ | https://pnpm.io/install |
| Git | 2.0+ | https://git-scm.com/ |

### Verify Installation

```bash
node --version      # v18.x.x or higher
pnpm --version      # 8.x.x or higher
git --version       # git version 2.x.x
```

---

## Step 1: Fork and Clone

1. Go to https://github.com/saikirantechy/devbyai
2. Click **Fork** → create a fork under your account
3. Clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/devbyai.git
cd devbyai
```

4. Add the upstream remote:

```bash
git remote add upstream https://github.com/saikirantechy/devbyai.git
```

---

## Step 2: Install Dependencies

DEVBYAI is a pnpm monorepo. Install all workspace dependencies:

```bash
pnpm install
```

This installs dependencies for all packages in `apps/` and `packages/`.

---

## Step 3: Build the Project

Build all packages:

```bash
pnpm build
```

---

## Step 4: Verify Everything Works

Run the full check suite:

```bash
pnpm lint       # Lint and format (Biome)
pnpm typecheck  # TypeScript type checking
pnpm test       # Run tests (Vitest)
```

All should pass with no errors.

---

## Step 5: Run DEVBYAI Locally

```bash
pnpm dev
```

This launches the DEVBYAI interactive terminal environment.

---

## Common Setup Issues

### pnpm not found

If `pnpm` is not recognized, install it:

```bash
# Using npm
npm install -g pnpm

# Or using corepack (comes with Node.js 16.17+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Build errors

Try cleaning and rebuilding:

```bash
pnpm clean      # if available, otherwise delete node_modules and .turbo
pnpm install
pnpm build
```

### Test failures

Run tests for a specific package:

```bash
pnpm --filter @devbyai/core test
```

---

## IDE Setup (Recommended: VS Code)

Install these extensions for the best experience:

- **TypeScript and JavaScript Language Features** (built-in)
- **Biome** — for linting and formatting
- **ESLint** — optional, if you prefer ESLint
- **GitLens** — helpful for exploring history

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Keeping Your Fork Updated

Before starting new work, sync with upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Need Help?

If you run into setup issues, open a [Discussion](https://github.com/saikirantechy/devbyai/discussions) or comment on an existing issue with your error details.