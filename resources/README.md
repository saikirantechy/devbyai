# Developer Resources

Professional coding resources for contributing to **DEVBYAI** — the open-source AI-powered development agent.

This folder contains everything a contributor needs to write code, add features, and submit pull requests that match the project's standards.

---

## 📑 Coding Guides

| Guide | What you'll learn |
|-------|-------------------|
| [`environment-setup.md`](environment-setup.md) | Install deps, build, and run `devbyai` globally from any terminal |
| [`coding-standards.md`](coding-standards.md) | TypeScript/ESM conventions, Biome formatting, commit style |
| [`api-reference.md`](api-reference.md) | Quick reference for all `@devbyai/*` packages |
| [`writing-tests.md`](writing-tests.md) | Vitest test patterns for tools, agents, skills |
| [`adding-a-tool.md`](adding-a-tool.md) | Add a new filesystem/system tool |
| [`adding-a-provider.md`](adding-a-provider.md) | Add a new AI model provider |
| [`adding-an-agent.md`](adding-an-agent.md) | Add a new specialized agent |
| [`adding-a-skill.md`](adding-a-skill.md) | Add a new reusable skill |
| [`adding-a-command.md`](adding-a-command.md) | Add a new CLI command |
| [`adding-a-hook.md`](adding-a-hook.md) | Add a pipeline lifecycle hook |
| [`adding-a-workflow.md`](adding-a-workflow.md) | Add a phase workflow |
| [`config-guide.md`](config-guide.md) | Configuration system (`devbyai.json`) |
| [`git-workflow.md`](git-workflow.md) | Git workflow for forks, branches, and PRs |
| [`pr-checklist.md`](pr-checklist.md) | Pre-submission checklist |
| [`control-tools-system.md`](control-tools-system.md) | Control, register, and secure the tools system |
| [`adding-user-models.md`](adding-user-models.md) | Add custom AI models |
| [`adding-user-providers.md`](adding-user-providers.md) | Add custom AI model providers |
| [`advanced-features.md`](advanced-features.md) | Hooks, workflows, skills, agents, CLI commands |

---

## 🏗️ Architecture — AI Coding Platform

| Guide | Description |
|-------|-------------|
| [`architecture/README.md`](architecture/README.md) | Overview of the AI coding platform architecture |
| [`architecture/product-vision.md`](architecture/product-vision.md) | Product vision and positioning |
| [`architecture/high-level-architecture.md`](architecture/high-level-architecture.md) | System architecture overview |
| [`architecture/ai-model-hub.md`](architecture/ai-model-hub.md) | Model hub, provider adapters, shared access & BYOK |
| [`architecture/coding-agent.md`](architecture/coding-agent.md) | Coding agent workflow, tools, and safe execution |
| [`architecture/github-integration.md`](architecture/github-integration.md) | GitHub integration for open-source contributions |
| [`architecture/backend-services.md`](architecture/backend-services.md) | Backend services, database, and API design |
| [`architecture/technology-stack.md`](architecture/technology-stack.md) | Recommended technology choices |
| [`architecture/roadmap.md`](architecture/roadmap.md) | Phased development roadmap |
| [`architecture/usage-limits.md`](architecture/usage-limits.md) | Free-tier limits and usage strategy |
| [`architecture/testing-strategy.md`](architecture/testing-strategy.md) | Testing strategy and security |
| [`architecture/important-decisions.md`](architecture/important-decisions.md) | Key decisions before implementation |

---

## 🧠 Skills — UI/UX, Dev, Doc, Format, Security

| Guide | Description |
|-------|-------------|
| [`skills/README.md`](skills/README.md) | Overview of all DEVBYAI skills |
| [`skills/ui-ux-skills.md`](skills/ui-ux-skills.md) | UI/UX design skills (responsive, accessibility, design system) |
| [`skills/dev-skills.md`](skills/dev-skills.md) | Development skills (TypeScript, Node.js, React, Next.js, Python) |
| [`skills/doc-skills.md`](skills/doc-skills.md) | Documentation skills (API docs, README, contribution guide) |
| [`skills/format-dev-skills.md`](skills/format-dev-skills.md) | Code formatting skills (formatting, imports, naming, lint) |
| [`skills/security-skills.md`](skills/security-skills.md) | Security skills (audit, secure coding, secret management, OWASP) |
| [`skills/skill-installation.md`](skills/skill-installation.md) | Which skills are required for each tool + installation |
| [`skills/app-web-dev-skills.md`](skills/app-web-dev-skills.md) | App, website, web app dev skills |
| [`skills/agent-skills.md`](skills/agent-skills.md) | Reusable agent skill bundles |

---

## 🏗️ Skills System — Technical Design

| Guide | Description |
|-------|-------------|
| [`skills-system/README.md`](skills-system/README.md) | Overview of the skills system design |
| [`skills-system/system-overview.md`](skills-system/system-overview.md) | Architecture, components, main responsibilities |
| [`skills-system/skill-format.md`](skills-system/skill-format.md) | Open `SKILL.md` convention + DevByAI manifest |
| [`skills-system/database-schema.md`](skills-system/database-schema.md) | PostgreSQL tables and relationships |
| [`skills-system/skills-registry.md`](skills-system/skills-registry.md) | Registration, discovery, versioning, publishing |
| [`skills-system/skill-loader.md`](skills-system/skill-loader.md) | Loading lifecycle, lazy loading, caching |
| [`skills-system/agent-integration.md`](skills-system/agent-integration.md) | Orchestration pipeline, discovery, context |
| [`skills-system/security-architecture.md`](skills-system/security-architecture.md) | Trust levels, permissions, sandbox, audit |
| [`skills-system/marketplace.md`](skills-system/marketplace.md) | Screens, API design, recommendation |
| [`skills-system/implementation-plan.md`](skills-system/implementation-plan.md) | 7-phase roadmap |
| [`skills-system/first-skills.md`](skills-system/first-skills.md) | 12 starter skills |
| [`skills-system/testing-acceptance.md`](skills-system/testing-acceptance.md) | Acceptance criteria and benchmarks |
| [`skills-system/technical-boundaries.md`](skills-system/technical-boundaries.md) | Module separation recommendations |
| [`skills-system/references.md`](skills-system/references.md) | Specifications and references |
| [`skills-system/final-recommendation.md`](skills-system/final-recommendation.md) | Recommended direction and next steps |

---

## 🧭 Getting Started (Coding First)

1. **Fork & clone** — see [`git-workflow.md`](git-workflow.md).
2. **Install & build** — `pnpm install && pnpm build`.
3. **Pick a coding guide** above based on what you want to build.
4. **Write code + tests** following [`coding-standards.md`](coding-standards.md).
5. **Run checks** — `pnpm lint && pnpm typecheck && pnpm test`.
6. **Open a PR** — see [`pr-checklist.md`](pr-checklist.md).

---

## 🏗️ Codebase at a Glance

```
devbyai/
├── apps/cli/          # Terminal CLI (commander-based)
├── packages/
│   ├── core/          # Orchestrator, pipeline, intelligence
│   ├── config/        # Configuration management
│   ├── models/        # AI provider abstractions
│   ├── tools/         # Agent tool system
│   ├── ui/            # Terminal design system
│   ├── agents/        # Specialized agents
│   ├── skills/        # Reusable skills
│   └── sdk/           # Developer SDK
└── resources/         # Contributor resources (this folder)
```

All packages use **TypeScript strict mode**, **ESM**, **Biome** (lint/format), **Vitest** (tests), and **tsup** (builds).

---

## 🤝 Contributing Code

By submitting code, you agree your contributions are licensed under the [MIT License](https://opensource.org/licenses/MIT). Please read the [Code of Conduct](../CODE_OF_CONDUCT.md) if one exists at the repo root.

Questions? Open a [Discussion](https://github.com/saikirantechy/devbyai/discussions) or comment on an issue.