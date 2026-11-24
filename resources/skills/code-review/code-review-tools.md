# Code Review Tools

Tool support for code review agents in DEVBYAI. Maps review dimensions to the tools agents can use.

---

## 1. Tool → Review Dimension Mapping

| Review Dimension | Required Tools | Recommended Tools | Why |
|-----------------|---------------|-------------------|-----|
| Security | `search_files`, `read_file` | `security-audit`, `run_linter` | Find secrets, vulnerabilities, patterns |
| Performance | `search_files`, `read_file` | `run_linter`, `run_tests` | Find slow patterns, run benchmarks |
| Architecture | `list_files`, `read_file` | `search_files` | Explore structure, check imports |
| Testing | `list_files`, `read_file` | `run_tests`, `search_files` | Find test files, execute tests |
| Maintainability | `read_file`, `search_files` | `run_linter` | Check naming, comments, duplication |

---

## 2. Tool Permissions for Code Review

| Tool | Permission | Policy | Reason |
|------|-----------|--------|--------|
| `read_file` | `read` | `auto` | Read-only access to source files |
| `list_files` | `read` | `auto` | Read-only directory listing |
| `search_files` | `read` | `auto` | Read-only search within workspace |
| `run_linter` | `execute` | `ask` | Runs linting commands |
| `run_tests` | `execute` | `ask` | Runs test commands |
| `security-audit` | `read` | `ask` | Scans for vulnerabilities |

---

## 3. Tool Support Code Example

```ts
import type { Tool, ToolInput, ToolResult, ToolPermission } from "@devbyai/tools";

export class CodeReviewTool implements Tool {
  name = "code_review";
  description = "Perform code review on specified files";
  permissions: ToolPermission[] = ["read"];
  inputSchema = {
    type: "object",
    properties: {
      files: { type: "array", items: { type: "string" }, description: "Files to review" },
      dimensions: { type: "array", items: { type: "string" }, description: "Review dimensions" },
    },
    required: ["files"],
  };

  async execute(input: ToolInput): Promise<ToolResult> {
    const files = input.files as string[];
    const dimensions = (input.dimensions as string[]) || [
      "security", "performance", "architecture", "testing", "maintainability",
    ];

    const results = [];
    for (const file of files) {
      for (const dimension of dimensions) {
        // Run review logic for each dimension
        results.push({
          file,
          dimension,
          findings: [],
        });
      }
    }

    return { success: true, output: JSON.stringify(results, null, 2) };
  }
}
```

---

## 4. Tool Support Checklist

- [ ] Review tools have minimum required permissions (`read` for most)
- [ ] Destructive tools (`write_file`, `delete_file`) require explicit approval
- [ ] `run_linter` and `run_tests` use `execute` permission with `ask` policy
- [ ] All tool results include file paths and line numbers where applicable
- [ ] Tools respect workspace boundaries (no access outside project)
- [ ] Tool errors caught and returned as `ToolResult` with `success: false`

---

## 5. Example Tool Usage in Review

```ts
// Security review: search for hardcoded secrets
const secrets = await tools.search_files({
  pattern: "(api[_-]?key|secret|password|token)\\s*[:=]",
  directory: "src/",
});

// Performance review: find sync I/O in async code
const syncIo = await tools.search_files({
  pattern: "readFileSync|writeFileSync|execSync",
  directory: "src/",
});

// Architecture review: check module structure
const modules = await tools.list_files({ path: "src/" });

// Testing review: check test coverage
const testResults = await tools.run_tests({ pattern: "**/*.test.ts" });
```

---

## 6. Registering Review Tools

```ts
import { CodeReviewTool } from "./code-review.js";

export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(new ReadFileTool());
  registry.register(new WriteFileTool());
  registry.register(new ListDirectoryTool());
  registry.register(new SearchFilesTool());
  registry.register(new CommandRunnerTool());
  registry.register(new CodeReviewTool()); // Add code review tool
  return registry;
}
```
