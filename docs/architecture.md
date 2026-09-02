# DEVBYAI Architecture

## Overview

DEVBYAI is built as a modular monorepo with clear separation of concerns.

```
CLI (apps/cli)
 │
 └──── DEVBYAI Core (packages/core)
          │
          ├──── Orchestrator
          ├──── Pipeline (Phase system)
          ├──── Context
          │
          ├──── Models (packages/models)
          │     └──── Provider abstraction
          │
          └──── Tools (packages/tools)
                └──── Filesystem, Terminal, Git
```

## Packages

| Package | Purpose |
|---------|---------|
| `@devbyai/cli` | Terminal interface, commands, UI |
| `@devbyai/core` | Orchestrator, pipeline, phase system |
| `@devbyai/models` | AI provider abstraction |
| `@devbyai/tools` | Tool system for filesystem and commands |
| `@devbyai/config` | Configuration management |
| `@devbyai/agents` | Specialized agents (future) |
| `@devbyai/skills` | Reusable skills (future) |
| `@devbyai/sdk` | Developer SDK (future) |

## Pipeline Phases

1. **EXPLORE** — Understand the codebase
2. **PLAN** — Design the solution
3. **BUILD** — Implement changes
4. **REVIEW** — Verify implementation
5. **RESEARCH** — Gather external knowledge
6. **TEST** — Verify functionality
7. **DEPLOY** — Assist with deployment (future)
8. **SHIP** — Finalize and summarize

## Model Providers

DEVBYAI is model-independent. Providers are plugged in via the `ModelProvider` interface:

- `MockProvider` (development/testing)
- OpenAI (planned)
- Anthropic (planned)
- Google Gemini (planned)
- OpenRouter (planned)
- Ollama (planned)

## Tool System

Tools are self-contained units with:
- A name and description
- Input schema
- Permission requirements
- An execute function

Built-in tools: `read_file`, `write_file`, `list_directory`, `search_files`

## Validation Engine

The Validation Engine coordinates build, test, lint, and typecheck validation:

- **Discovery**: Detects applicable checks from Project Intelligence
- **Planning**: Creates validation plans based on mode (quick/standard/full)
- **Execution**: Runs discovered checks safely via Command Runner
- **Analysis**: Parses errors and generates suggestions via Error Analysis
- **Memory**: Records failures in Failure Memory for debugging context

### Validation Modes

| Mode | Checks | Use Case |
|------|--------|----------|
| `quick` | typecheck, test | Fast feedback |
| `standard` | typecheck, lint, test, build | Default validation |
| `full` | all applicable checks | Pre-deployment |

### Debug Intelligence Pipeline

```
Error → Failure Analyzer → Error Context → Related Files → Debug Agent
```

The Debug Agent analyzes failures, finds related files, and suggests fixes based on error patterns and failure history.

### Failure Memory

Recent failures are persisted to `.devbyai/failures/` with structured metadata:
- Failure type, command, exit code
- Failed files and related files
- Raw output (truncated for safety)
- Maximum 20 records retained
