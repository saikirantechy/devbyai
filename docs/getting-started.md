# Getting Started with DEVBYAI

DEVBYAI (Dev By AI) is a free and open-source AI-powered development agent for your terminal.

## Prerequisites

- **Node.js** v18 or later (recommended: current LTS)
- **pnpm** v8 or later
- **Git**

## Installation

### Windows

```powershell
git clone https://github.com/saikirantechy/devbyai.git
cd devbyai
pnpm install
pnpm build
```

### macOS

```bash
git clone https://github.com/saikirantechy/devbyai.git
cd devbyai
pnpm install
pnpm build
```

### Linux

```bash
git clone https://github.com/saikirantechy/devbyai.git
cd devbyai
pnpm install
pnpm build
```

## Running DEVBYAI

After building, run DEVBYAI from the project root:

```bash
node apps/cli/dist/index.js
```

Or use the npm script:

```bash
pnpm dev
```

## First Run

When you first run DEVBYAI, you should see:

```
╭──────────────────────────────────────────╮
│              DEVBYAI                     │
│              Dev By AI                   │
│                                          │
│    The Open Development Agent            │
╰──────────────────────────────────────────╯

  Workspace detected: ✓ your-project

  DEVBYAI v0.1.0

  Ready.
```

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages |
| `pnpm dev` | Run DEVBYAI CLI |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type check all packages |
| `pnpm lint` | Run linter |
| `pnpm doctor` | Check environment |

## Demo Mode

Try the demo to see DEVBYAI in action without modifying any files:

```bash
node apps/cli/dist/index.js demo
```

## Next Steps

- Read the [CLI Reference](./cli.md) for all available commands
- Check the [Architecture Overview](./architecture.md) for the project structure
- See the [Roadmap](../ROADMAP.md) for planned features
