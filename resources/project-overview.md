# Project Overview for Contributors

A quick tour of the DEVBYAI codebase to help you find your way around before making your first contribution.

---

## What is DEVBYAI?

DEVBYAI is a free and open-source, terminal-first AI development agent. It helps developers move from an idea to production through a structured pipeline:

**EXPLORE → PLAN → BUILD → REVIEW → TEST → SHIP**

---

## Repository Structure

```
devbyai/
├── apps/
│   └── cli/              # DEVBYAI Terminal Experience (CLI entry point)
├── packages/
│   ├── core/             # Orchestration & Pipeline
│   ├── config/           # Configuration Management
│   ├── models/           # AI Provider Abstractions
│   ├── tools/            # Agent Tool System
│   ├── ui/               # Design System & Visual Components
│   ├── agents/           # Future Agent Architecture
│   ├── skills/           # Future Skills System
│   └── sdk/              # Future Developer SDK
├── docs/
│   ├── architecture.md
│   ├── cli.md
│   ├── getting-started.md
│   └── vision.md
├── resources/            # Contributor resources (this folder)
├── scripts/              # Build and dev scripts
├── assets/               # Logo and brand assets
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── ROADMAP.md
├── biome.json            # Linter & formatter config
├── tsconfig.json         # TypeScript config
├── vitest.config.ts      # Test config
└── pnpm-workspace.yaml   # Monorepo workspace config
```

---

## Key Technologies

| Technology | Purpose |
|------------|---------|
| TypeScript | Primary language (strict mode) |
| pnpm | Package manager & monorepo tool |
| Biome | Linter and formatter |
| Vitest | Test runner |
| Node.js | Runtime |

---

## Where to Contribute by Interest

| Interest Area | Where to Look | Suggested First Tasks |
|---------------|---------------|----------------------|
| CLI / Terminal | `apps/cli/` | Improve commands, add slash commands |
| Core Logic | `packages/core/` | Pipeline orchestration, validation engine |
| AI Providers | `packages/models/` | Add or improve model provider integrations |
| Tools | `packages/tools/` | Agent tools (command runner, file system, etc.) |
| UI / Visuals | `packages/ui/` | Terminal design system, loading states |
| Documentation | `docs/`, `README.md` | Fix typos, add examples, improve guides |
| Tests | All packages | Add unit tests, fix flaky tests |

---

## Common Workflows

### Adding a New CLI Command

1. Find the command registration in `apps/cli/`.
2. Add your command handler.
3. Register it in the command list.
4. Add tests and update documentation.

### Adding an AI Provider

1. Look at existing providers in `packages/models/`.
2. Implement the provider interface.
3. Register it in the provider registry.
4. Add configuration support in `packages/config/`.

### Fixing a Bug

1. Reproduce the bug locally.
2. Find the responsible package/module.
3. Write a failing test first.
4. Fix the bug and verify the test passes.
5. Run `pnpm lint && pnpm typecheck && pnpm test`.

---

## Need More Context?

- [Architecture Docs](docs/architecture.md) — deep dive into system design
- [Vision](docs/vision.md) — long-term project goals
- [Roadmap](ROADMAP.md) — planned features and releases
- [Reading Resources](reading-resources.md) — learn the tools we use

---

Still unsure where to start? Open a [Discussion](https://github.com/saikirantechy/devbyai/discussions) and ask!