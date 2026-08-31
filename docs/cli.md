# DEVBYAI CLI Reference

## Commands

### `devbyai`

Launch the DEVBYAI CLI with the welcome banner and workspace detection.

**Example:**

```bash
node apps/cli/dist/index.js
```

**Output:**

```
╭──────────────────────────────────────────╮
│              DEVBYAI                     │
│              Dev By AI                   │
│                                          │
│    The Open Development Agent            │
╰──────────────────────────────────────────╯

  Workspace detected: ✓ my-project

  DEVBYAI v0.1.0

  Ready.
```

---

### `devbyai [task]`

Execute a development task through the pipeline.

**Example:**

```bash
node apps/cli/dist/index.js "Build authentication for my app"
```

**Output:**

```
  Task: Build authentication for my app

  ✓ Task complete
    ✓ explore: [EXPLORE] Analyzing workspace...
    ✓ plan: [PLAN] Planning implementation...
    ✓ build: [BUILD] Implementation phase ready.
    ✓ review: [REVIEW] No issues detected.
    ✓ test: [TEST] Tests passed.
    ✓ ship: [SHIP] Task complete.
```

**Note:** In v0.1.0, tasks run through the MockProvider. Real AI integration is planned for v0.2.0.

---

### `devbyai demo`

Run a read-only demo that showcases DEVBYAI's pipeline without modifying any files.

**Example:**

```bash
node apps/cli/dist/index.js demo
```

**Output:**

```
╭──────────────────────────────────────────╮
│              DEVBYAI                     │
│              Dev By AI                   │
│                                          │
│    The Open Development Agent            │
╰──────────────────────────────────────────╯

  DEVBYAI v0.1.0 DEMO

  Provider: MockProvider (demo mode)
  Mode: Read-only — no files will be modified

  Workspace Detection
  ────────────────────────────────────────
  ✓ Workspace: my-project
  ✓ TypeScript project detected
  ✓ pnpm workspace detected
  ✓ Git repository detected

  [1/5] EXPLORE
  Scanning project structure...

    ✓ apps/cli
    ✓ packages/core
    ✓ packages/models
    ✓ packages/tools
    ✓ packages/config

  [2/5] PLAN
  Creating development strategy...

    MockProvider active — planning is simulated

  [3/5] BUILD
  No files modified (demo mode).

    ⚠ Demo mode: no changes applied

  [4/5] REVIEW
  Checking simulated implementation...

    ✓ Review complete

  [5/5] SHIP
  Demo complete.

  ════════════════════════════════════════

  DEMO COMPLETE

  DEVBYAI architecture is working.
  Connect a real AI provider for full functionality.
  See v0.2.0 roadmap for OpenAI/Anthropic integration.
```

---

### `devbyai init`

Initialize DEVBYAI configuration in the current directory. Creates a `devbyai.json` file with default settings.

**Example:**

```bash
node apps/cli/dist/index.js init
```

**Output:**

```
  Initializing DEVBYAI configuration...

  ✓ Created devbyai.json
```

**Config file (`devbyai.json`):**

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

### `devbyai version`

Show the current DEVBYAI version.

**Example:**

```bash
node apps/cli/dist/index.js version
```

**Output:**

```
DEVBYAI v0.1.0
```

---

### `devbyai models`

List available AI providers and models.

**Example:**

```bash
node apps/cli/dist/index.js models
```

**Output:**

```
  Available Providers:
    • Mock Provider (mock)
      - mock-default
      - mock-fast
      - mock-precise

  Note: Only MockProvider is available in v0.1.0
  Real providers (OpenAI, Anthropic) coming in v0.2.0
```

---

### `devbyai doctor`

Check the DEVBYAI environment and diagnose issues.

**Example:**

```bash
node apps/cli/dist/index.js doctor
```

**Output:**

```
  DEVBYAI Environment Check

  ✓ Node.js: v24.13.1
  ✓ pnpm: 11.0.9
  ✓ Platform: win32 (x64)
  ✓ Workspace: devbyai
  ✓ TypeScript: detected
  ✓ pnpm workspace: detected
  ✓ Git: initialized
  ⚠ Config: No devbyai.json (using defaults)

  All checks passed.
```

---

### `devbyai --help`

Show all available commands.

**Output:**

```
Usage: devbyai [options] [command] [task]

DEVBYAI — AI Development Orchestrator

Arguments:
  task           Task to execute (optional)

Options:
  -V, --version  output the version number
  -h, --help     display help for command

Commands:
  demo           Run DEVBYAI demo mode (read-only, no file changes)
  init           Initialize DEVBYAI configuration
  version        Show DEVBYAI version
  models         List available AI providers and models
  doctor         Check DEVBYAI environment and diagnose issues
```
