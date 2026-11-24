# Slash Commands Reference

DEVBYAI interactive mode supports slash commands (`/`) for quick access to intelligence, debugging, workspace, agents, skills, AI, and system features.

---

## How to Use

Launch the interactive terminal:

```powershell
devbyai
```

Then type a slash command at the prompt:

```
DEVBYAI > /project
DEVBYAI > /validate quick
DEVBYAI > /debug
```

Type `/` alone to open the **Command Palette** showing all available commands with descriptions and examples.

---

## Command Categories

### 🧠 Intelligence

| Command | Description | Example |
|---------|-------------|---------|
| `/project` | Show project profile, languages, frameworks, and build system | `/project` |
| `/context` | Show current AI context, tracked files, and estimated tokens | `/context` |
| `/map` | Show project file map and directory structure | `/map` |
| `/history` | Show recent task execution history with status and duration | `/history` |

### 🐛 Debugging

| Command | Description | Example |
|---------|-------------|---------|
| `/validate` | Run validation checks (quick / standard / full modes) | `/validate`, `/validate quick`, `/validate full` |
| `/errors` | Analyze recent errors grouped by category | `/errors` |
| `/failures` | View recent failure history and affected files | `/failures` |
| `/debug` | Run full debug analysis with health score, quick fixes, and workflows | `/debug` |

### 📁 Workspace

| Command | Description | Example |
|---------|-------------|---------|
| `/workspace` | Show workspace name, location, and detected features | `/workspace` |
| `/status` | Show version, provider, model, session status, and health | `/status` |
| `/pipeline` | Show the development pipeline (EXPLORE → PLAN → BUILD → REVIEW → TEST → SHIP) | `/pipeline` |

### 🤖 Agents & Skills

| Command | Description | Example |
|---------|-------------|---------|
| `/agents` | List all available built-in agents and their capabilities | `/agents` |
| `/skills` | List active skills for the current project type | `/skills` |
| `/workflows` | List available phase workflows | `/workflows` |

### 🤖 AI

| Command | Description | Example |
|---------|-------------|---------|
| `/models` | View configured AI providers and available models | `/models` |

### 🛠️ System

| Command | Description | Example |
|---------|-------------|---------|
| `/doctor` | Check DEVBYAI environment, Node, pnpm, platform, and provider status | `/doctor` |
| `/clear` | Clear the terminal screen | `/clear` |
| `/help` | Show all available commands | `/help` |
| `/update` | Update DEVBYAI to latest version (pull, install, build) | `/update` |
| `/exit` | Exit DEVBYAI interactive mode | `/exit` |

---

## Command Palette

Type `/` (just the slash, no command name) at the prompt to open the professional command palette:

```
DEVBYAI > /
═════════════════════════════════════════════════════════════════════════════════
  DEVBYAI COMMAND PALETTE
═════════════════════════════════════════════════════════════════════════════════

  🧠 INTELLIGENCE
  ┌──────────────┬──────────────────────────────────────────────────────────┐
  │ /project     │ Show project intelligence & profile                      │
  │ /context     │ Show current AI context & tracked files                  │
  │ /map         │ Show project file map & structure                        │
  │ /history     │ Show recent task execution history                       │
  └──────────────┴──────────────────────────────────────────────────────────┘

  ...
```

---

## Natural Language

You don't need a slash command for everything. Type any task description directly:

```
DEVBYAI > Explain this project
DEVBYAI > Create a plan for adding authentication
DEVBYAI > Review this codebase for security issues
DEVBYAI > Build a new feature for the CLI
```

---

## Tips

- **Tab completion**: Not yet supported; type commands manually.
- **Command history**: Use Up/Down arrow keys to navigate previous inputs.
- **Case insensitive**: `/HELP`, `/Help`, and `/help` all work.
- **Unknown commands**: Type `/help` or `/` to see the full list.