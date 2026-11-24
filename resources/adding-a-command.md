# Adding a CLI Command

DEVBYAI's CLI is built with [Commander](https://commanderjs.org/) in `apps/cli/src/index.ts`. This guide shows how to add a new command.

---

## 1. Understand the CLI Structure

`apps/cli/src/index.ts` uses `Commander` to register:

- A default action (`devbyai [task]`) for task execution
- Subcommands: `demo`, `init`, `version`, `models`, `doctor`

Each command is a `.command("name")` chain with `.description()` and `.action(async () => { ... })`.

---

## 2. Add a New Command

Open `apps/cli/src/index.ts` and add a new command block before `program.parse()`.

Example — a `status` command:

```ts
// --- devbyai status ---
program
  .command("status")
  .description("Show DEVBYAI workspace and provider status")
  .action(async () => {
    const cwd = process.cwd();
    const version = getVersion();

    printBanner({ version });
    console.log();

    const workspace = detectWorkspace(cwd);
    console.log(sectionHeader("WORKSPACE"));
    console.log(renderWorkspace(workspace));
    console.log();

    const config = getConfig();
    console.log(sectionHeader("CONFIGURATION"));
    console.log(`    Provider: ${config.provider || "mock"}`);
    console.log(`    Model: ${config.model || "mock"}`);
    console.log();
  });
```

Pattern:
1. `program.command("name")` — command name (kebab-case).
2. `.description("...")` — short help text.
3. `.action(async () => { ... })` — async action handler.
4. Inside: use `printBanner`, `sectionHeader`, `status`, `symbols` from `@devbyai/ui` for consistent styling.

---

## 3. Import UI Helpers

Available from `@devbyai/ui` (already imported at the top of `index.ts`):

```ts
import {
  printBanner,
  sectionHeader,
  status,
  symbols,
  createSpinner,
  divider,
  renderWorkspace,
  detectWorkspace,
} from "@devbyai/ui";
```

Common usage:

```ts
const spinner = createSpinner({ text: "Working..." });
spinner.start();
await doWork();
spinner.succeed("Done");

console.log(status.success("Operation complete"));
console.log(status.error("Something failed"));
console.log(symbols.success); // ✓
```

---

## 4. Access Config & Providers

```ts
import { getConfig, getApiKey, loadConfig } from "@devbyai/config";
import { createDefaultProviderRegistry } from "@devbyai/models";

await loadConfig(cwd);
const config = getConfig();
const providerId = config.provider || "mock";
const apiKey = getApiKey(providerId);

const registry = createDefaultProviderRegistry();
const provider = registry.create(providerId);
```

---

## 5. Run Checks

```bash
pnpm lint            # Biome (includes apps/cli)
pnpm typecheck       # TypeScript
pnpm test            # Vitest
```

> The CLI package's `dev` script runs `node apps/cli/dist/index.js`, so you must `pnpm build` before testing CLI changes locally.

---

## 6. Example PR Checklist

- [ ] New command registered in `apps/cli/src/index.ts`
- [ ] Uses `.js` extension imports
- [ ] Uses UI helpers (`status`, `symbols`, `createSpinner`) for styling
- [ ] Command name is kebab-case
- [ ] Description is clear and concise
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass
