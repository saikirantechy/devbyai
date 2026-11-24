# Report Generator Tools

Tool support for report generator agents in DEVBYAI. Maps report types to the tools agents use to collect evidence.

---

## 1. Tool → Report Type Mapping

| Report Type | Required Tools | Recommended Tools |
|-------------|---------------|-------------------|
| Test report | `run_tests` | `read_file`, `search_files` |
| Security audit | `search_files`, `read_file` | `audit_dependencies`, `security-audit` |
| Coverage report | `run_coverage` | `read_file`, `list_files` |
| Dependency audit | `audit_dependencies` | `read_file`, `search_files` |
| Project health | All of the above | All of the above |

---

## 2. Tool Permissions

| Tool | Permission | Policy | Reason |
|------|-----------|--------|--------|
| `read_file` | `read` | `auto` | Read-only evidence collection |
| `list_files` | `read` | `auto` | Read-only enumeration |
| `search_files` | `read` | `auto` | Read-only pattern scanning |
| `audit_dependencies` | `read` | `ask` | Scans lockfiles, may be slow |
| `run_tests` | `execute` | `ask` | Executes test commands |
| `run_coverage` | `execute` | `ask` | Executes coverage tooling |
| `security-audit` | `execute` | `ask` | Full security scanner |

---

## 3. ReportToolset Interface

```ts
export interface ReportToolset {
  read_file(input: { path: string }): Promise<FileContent>;
  list_files(input: { path: string }): Promise<string[]>;
  search_files(input: { pattern: string; directory: string }): Promise<SearchMatch[]>;
  run_tests(input: { cwd: string; pattern?: string }): Promise<TestOutput>;
  run_coverage(input: { cwd: string; threshold?: number }): Promise<CoverageData>;
  audit_dependencies(input: { cwd: string }): Promise<DependencyAudit>;
}
```

---

## 4. Tool Usage Examples

```ts
// Security audit: find secrets
const secrets = await tools.search_files({
  pattern: "(api[_-]?key|secret|password|token)\\s*[:=]",
  directory: cwd,
});

// Test report: run tests
const tests = await tools.run_tests({ cwd, pattern: "**/*.test.ts" });

// Coverage report
const coverage = await tools.run_coverage({ cwd, threshold: 80 });

// Dependency audit
const deps = await tools.audit_dependencies({ cwd });
```

---

## 5. Tool Safety Rules

- Read-only tools (`read_file`, `list_files`, `search_files`) are auto-approved.
- Execution tools (`run_tests`, `run_coverage`, `security-audit`) require user approval.
- Reports must never include raw secret values.
- All tool results must be scoped to the workspace.
