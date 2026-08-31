# DEVBYAI

**Dev By AI** — A free and open-source AI-powered development agent for your terminal.

```
╭──────────────────────────────────────────╮
│              DEVBYAI                     │
│              Dev By AI                   │
│                                          │
│    The Open Development Agent            │
╰──────────────────────────────────────────╯
```

## What is DEVBYAI?

DEVBYAI is a completely free and open-source **AI Development Orchestrator** designed to help developers throughout the complete software development lifecycle.

```
EXPLORE → PLAN → BUILD → REVIEW → RESEARCH → TEST → DEPLOY → SHIP
```

DEVBYAI is NOT just another AI code generator. It's an intelligent orchestrator that guides you from **idea to production**.

## Philosophy

- 🆓 **FREE** — No paywalls, no premium tiers
- 🔓 **OPEN SOURCE** — Fully transparent, community-driven
- 🤖 **MODEL INDEPENDENT** — Works with any AI provider
- 💻 **TERMINAL FIRST** — Built for developers
- 🔌 **EXTENSIBLE** — Skills, tools, and plugins
- 🔒 **SECURE** — User-controlled permissions

## Quick Start

### Prerequisites

- **Node.js** v18+ (current LTS recommended)
- **pnpm** v8+
- **Git**

### Install & Run

```bash
# Clone
git clone https://github.com/saikirantechy/devbyai.git
cd devbyai

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run DEVBYAI
pnpm dev
```

### Demo Mode

Try the demo to see DEVBYAI in action (read-only, no file changes):

```bash
node apps/cli/dist/index.js demo
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Launch DEVBYAI CLI |
| `node apps/cli/dist/index.js demo` | Run demo mode |
| `node apps/cli/dist/index.js init` | Initialize configuration |
| `node apps/cli/dist/index.js version` | Show version |
| `node apps/cli/dist/index.js models` | List AI providers |
| `node apps/cli/dist/index.js doctor` | Check environment |
| `node apps/cli/dist/index.js "task"` | Execute a task |

## Development

```bash
pnpm install       # Install all dependencies
pnpm build         # Build all packages
pnpm test          # Run all tests (116 tests)
pnpm typecheck     # Type check all packages
pnpm lint          # Run linter
pnpm doctor        # Check environment
```

## Project Structure

```
devbyai/
├── apps/cli/           # CLI with Commander
├── packages/
│   ├── core/           # Orchestrator + Pipeline phase system
│   ├── config/         # Configuration management
│   ├── models/         # ModelProvider interface + MockProvider
│   ├── tools/          # Tool interface + filesystem tools
│   ├── agents/         # Placeholder (future)
│   ├── skills/         # Placeholder (future)
│   └── sdk/            # Placeholder (future)
├── scripts/            # Cross-platform build scripts
├── docs/               # Documentation
│   ├── getting-started.md
│   ├── cli.md
│   ├── architecture.md
│   └── vision.md
├── vitest.config.ts    # Test configuration
├── biome.json          # Linter/formatter config
└── tsconfig.json       # Base TypeScript config
```

## Architecture

```
CLI (apps/cli)
 └──── Core (packages/core)
           ├──── Orchestrator
           ├──── Pipeline (Phases)
           ├──── Models (packages/models)
           └──── Tools (packages/tools)
```

See [docs/architecture.md](docs/architecture.md) for details.

## Pipeline

DEVBYAI follows a structured development pipeline:

1. **EXPLORE** — Understand the codebase
2. **PLAN** — Design the solution
3. **BUILD** — Implement changes
4. **REVIEW** — Verify implementation
5. **TEST** — Verify functionality
6. **SHIP** — Finalize and summarize

## What's Working in v0.1.0

- ✅ CLI with banner, commands, and help
- ✅ Pipeline architecture with 6 phases
- ✅ MockProvider for development/testing
- ✅ Configuration system
- ✅ Tool interfaces with filesystem tools
- ✅ Demo mode
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ 116 automated tests

## What's Coming

- 🔜 OpenAI / Anthropic provider integration
- 🔜 Interactive chat mode with streaming
- 🔜 Real code exploration and modification
- 🔜 Skills system
- 🔜 Plugin architecture
- 🔜 Developer SDK

See [ROADMAP.md](ROADMAP.md) for the full version plan.

## Documentation

- [Getting Started](docs/getting-started.md)
- [CLI Reference](docs/cli.md)
- [Architecture](docs/architecture.md)
- [Vision](docs/vision.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — See [LICENSE](LICENSE) for details.
