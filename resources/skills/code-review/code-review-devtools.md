# Code Review Developer Tools

Developer tools and workflows for code review in DEVBYAI. How developers interact with code review features.

---

## 1. CLI Commands for Code Review

| Command | Description | Example |
|---------|-------------|---------|
| `devbyai review` | Review changed files | `devbyai review --files src/auth.ts` |
| `devbyai review --security` | Security-focused review | `devbyai review --security` |
| `devbyai review --performance` | Performance-focused review | `devbyai review --performance` |
| `devbyai review --all` | Full review all dimensions | `devbyai review --all` |
| `devbyai review --pr <number>` | Review a GitHub PR | `devbyai review --pr 42` |

---

## 2. CLI Command Implementation

```ts
// --- devbyai review ---
program
  .command("review")
  .description("Review changed files or a PR")
  .option("--files <paths>", "Comma-separated file paths to review")
  .option("--security", "Security-focused review")
  .option("--performance", "Performance-focused review")
  .option("--architecture", "Architecture-focused review")
  .option("--testing", "Testing-focused review")
  .option("--all", "Review all dimensions")
  .option("--pr <number>", "Review a GitHub PR")
  .action(async (options) => {
    const cwd = process.cwd();
    const files = options.files ? options.files.split(",") : [];
    const dimensions = [];

    if (options.security) dimensions.push("security");
    if (options.performance) dimensions.push("performance");
    if (options.architecture) dimensions.push("architecture");
    if (options.testing) dimensions.push("testing");
    if (options.all) {
      dimensions.push("security", "performance", "architecture", "testing", "maintainability");
    }

    const orchestrator = new CodeReviewOrchestrator({ cwd });
    const result = await orchestrator.review({ files, dimensions });

    console.log(result.report);

    if (result.requiresApproval) {
      console.log(chalk.yellow("\n⚠️  Critical or high issues found. Approval required before merge."));
      process.exit(1);
    }
  });
```

---

## 3. Interactive Slash Commands

| Slash Command | Description |
|---------------|-------------|
| `/review` | Review current changes |
| `/review security` | Security-focused review |
| `/review performance` | Performance-focused review |
| `/review pr <url>` | Review a GitHub PR |
| `/review approve` | Approve pending review |
| `/review reject` | Reject with comments |

Example implementation in `interactive.ts`:

```ts
case "/review": {
  const arg = trimmed.split(" ")[1] || "all";
  const reviewAgent = agentRegistry.create("code-reviewer");
  const result = await reviewAgent.execute({
    cwd,
    request: `Review changes focusing on: ${arg}`,
    previousResults: [],
  });
  console.log(result.output);
  break;
}
```

---

## 4. Review Report Format

```
# Code Review Report

## Summary
- Critical: 0
- High: 2
- Medium: 3
- Low: 1
- Info: 4

## 🚨 Critical Issues
None

## ⚠️ High Issues

### Hardcoded API Key
- **File:** `src/auth/config.ts:15`
- **Severity:** high
- **Description:** API key hardcoded in source code
- **Suggestion:** Move to environment variable
- **Auto-fixable:** No
- **Requires approval:** Yes

### Missing Input Validation
- **File:** `src/api/users.ts:42`
- **Severity:** high
- **Description:** User input not validated before database query
- **Suggestion:** Add Zod schema validation
- **Auto-fixable:** No
- **Requires approval:** Yes

## 📋 Medium Issues

### Missing Test Coverage
- **File:** `src/utils/helpers.ts`
- **Severity:** medium
- **Description:** No test file for utility functions
- **Suggestion:** Create `src/utils/helpers.test.ts`
- **Auto-fixable:** No
- **Requires approval:** No

## ✅ Passed Checks
- Linting: Passed
- Type checking: Passed
- Build: Passed

## 🎯 Recommendation
Address critical and high issues before merging. Medium issues should be fixed in a follow-up PR.
```

---

## 5. Developer Workflow

### Step 1: Create a PR

```bash
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
# Open PR on GitHub
```

### Step 2: Run Code Review

```bash
# Review your changes locally
devbyai review --all

# Or review a specific PR
devbyai review --pr 42
```

### Step 3: Address Findings

```bash
# Fix critical/high issues
# Re-run review
devbyai review --all
```

### Step 4: Get Approval

```bash
# If critical/high issues were found, request approval
devbyai review --approve
```

---

## 6. Integrating with CI/CD

Add to `.github/workflows/review.yml`:

```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - run: devbyai review --all
```

---

## 7. Checklist for Developer Tools

- [ ] CLI `review` command implemented
- [ ] Supports `--files`, `--security`, `--performance`, `--architecture`, `--testing`, `--all`, `--pr`
- [ ] Interactive slash commands (`/review`) implemented
- [ ] Review report formatted with severity levels
- [ ] Critical/high issues block merge by default
- [ ] CI/CD integration documented
- [ ] Developer workflow documented
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm lint && pnpm typecheck && pnpm test` passes

---

## 8. Registering CLI Command

```ts
// In apps/cli/src/index.ts
program
  .command("review")
  .description("Review changed files or a PR")
  .option("--files <paths>", "Files to review")
  .option("--all", "Review all dimensions")
  .action(async (options) => {
    // Implementation
  });
```
