# Test Report Skill

Test execution report generation for DEVBYAI agents.

---

## 1. Skill Metadata

```ts
export const testReportMetadata: ReportSkillMetadata = {
  id: "test-report",
  name: "Test Report Generator",
  description: "Generate test execution reports from test runner output",
  priority: 80,
  reportTypes: ["test-report"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["test-engineer", "reporter", "developer"],
};
```

---

## 2. Instructions

```ts
export class TestReportSkill implements ReportSkill {
  readonly metadata = testReportMetadata;

  async generate(context: ReportContext): Promise<GeneratedReport> {
    const testOutput = await context.tools.run_tests({
      cwd: context.cwd,
      pattern: context.options?.pattern ?? "**/*.test.ts",
    });

    const findings = this.parseTestResults(testOutput);
    const content = this.formatReport(findings, testOutput);

    return {
      skillId: this.metadata.id,
      reportType: "test-report",
      format: "markdown",
      content,
      findings,
      generatedAt: new Date().toISOString(),
    };
  }

  private parseTestResults(output: TestOutput): ReportFinding[] {
    return output.failures.map((f) => ({
      id: `TEST-${f.id}`,
      category: "test-failure",
      severity: "high",
      title: f.testName,
      evidence: f.errorMessage,
      file: f.file,
      line: f.line,
      recommendation: "Fix the failing assertion or correct the implementation",
    }));
  }

  private formatReport(findings: ReportFinding[], output: TestOutput): string {
    return `# Test Report\n\n` +
      `**Passed:** ${output.passed} | **Failed:** ${output.failed} | **Skipped:** ${output.skipped}\n\n` +
      `## Failures\n\n` +
      findings.map((f) => `### ${f.title}\n- **Location:** \`${f.file}:${f.line}\`\n- **Error:** ${f.evidence}\n`).join("\n");
  }

  getReportChecklist(): string[] {
    return [
      "Run the full test suite",
      "Record passed, failed, and skipped counts",
      "Include file and line for each failure",
      "Include error messages as evidence",
      "Suggest fixes for failures",
      "Check for flaky tests",
    ];
  }
}
```

---

## 3. Tool Support

| Tool | Purpose | Permission | Policy |
|------|---------|-----------|--------|
| `run_tests` | Execute test suite | `execute` | `ask` |
| `read_file` | Read failing test file | `read` | `auto` |
| `search_files` | Find test files | `read` | `auto` |

---

## 4. Report Output Example

```md
# Test Report

**Passed:** 208 | **Failed:** 2 | **Skipped:** 1

## Failures

### should reject invalid email
- **Location:** `src/auth/validation.test.ts:42`
- **Error:** Expected false, received true
```
