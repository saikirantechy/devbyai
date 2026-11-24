# Report Generator Developer Tools

Developer tools and workflows for report generation in DEVBYAI — CLI commands and CI/CD integration.

---

## 1. CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `devbyai report audit` | Security audit report | `devbyai report audit` |
| `devbyai report tests` | Test execution report | `devbyai report tests` |
| `devbyai report coverage` | Coverage report | `devbyai report coverage` |
| `devbyai report deps` | Dependency audit report | `devbyai report deps` |
| `devbyai report health` | Full project health report | `devbyai report health` |
| `devbyai report --format json` | Output as JSON | `devbyai report audit --format json` |
| `devbyai report --output report.md` | Save to file | `devbyai report health --output report.md` |

---

## 2. CLI Implementation

```ts
program
  .command("report <type>")
  .description("Generate a report (audit, tests, coverage, deps, health)")
  .option("--format <format>", "Output format (markdown, json, html)", "markdown")
  .option("--output <file>", "Save report to file")
  .action(async (type, options) => {
    const agent = agentRegistry.create("report-generator");
    const result = await agent.execute({
      cwd: process.cwd(),
      request: `Generate ${type} report`,
      previousResults: [],
    });

    if (options.output) {
      await fs.writeFile(options.output, result.output);
      console.log(`Report saved to ${options.output}`);
    } else {
      console.log(result.output);
    }
  });
```

---

## 3. Interactive Slash Commands

| Command | Description |
|---------|-------------|
| `/report audit` | Generate security audit report |
| `/report tests` | Generate test report |
| `/report coverage` | Generate coverage report |
| `/report health` | Generate full health report |

---

## 4. CI/CD Integration

```yaml
name: Audit Report
on:
  schedule:
    - cron: "0 0 * * 1"  # Weekly
  pull_request:
    types: [opened, synchronize]

jobs:
  audit-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - run: devbyai report audit --output audit-report.md
      - uses: actions/upload-artifact@v4
        with:
          name: audit-report
          path: audit-report.md
```

---

## 5. Developer Workflow

```bash
# Generate a weekly audit report
devbyai report audit --output audit-report.md

# Check full project health
devbyai report health

# Generate test report for CI
devbyai report tests --format json --output test-report.json
```

---

## 6. Checklist

- [ ] CLI `report` command implemented
- [ ] Supports all report types
- [ ] Supports `--format` and `--output` options
- [ ] Slash commands implemented
- [ ] CI/CD workflow documented
- [ ] Tests in `src/__tests__/`
