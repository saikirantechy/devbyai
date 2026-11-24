# Coverage Report Skill

Code coverage report generation for DEVBYAI agents.

---

## 1. Skill Metadata

```ts
export const coverageReportMetadata: ReportSkillMetadata = {
  id: "coverage-report",
  name: "Coverage Report Generator",
  description: "Generate code coverage reports from coverage tooling output",
  priority: 75,
  reportTypes: ["coverage-report"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["test-engineer", "reporter", "developer"],
};
```

---

## 2. Instructions

```ts
export class CoverageReportSkill implements ReportSkill {
  readonly metadata = coverageReportMetadata;

  async generate(context: ReportContext): Promise<GeneratedReport> {
    const coverage = await context.tools.run_coverage({
      cwd: context.cwd,
      threshold: context.options?.threshold ?? 80,
    });

    const findings = coverage.files
      .filter((f) => f.lineCoverage < (context.options?.threshold ?? 80))
      .map((f) => ({
        id: `COV-${f.file}`,
        category: "low-coverage",
        severity: f.lineCoverage < 50 ? "high" : "medium",
        title: `Low coverage in ${f.file} (${f.lineCoverage}%)`,
        evidence: `${f.coveredLines}/${f.totalLines} lines covered`,
        file: f.file,
        recommendation: "Add tests for uncovered branches and error paths",
      }));

    return {
      skillId: this.metadata.id,
      reportType: "coverage-report",
      format: "markdown",
      content: this.format(coverage, findings),
      findings,
      generatedAt: new Date().toISOString(),
    };
  }

  private format(coverage: CoverageData, findings: ReportFinding[]): string {
    return `# Coverage Report\n\n` +
      `**Overall:** ${coverage.overall}% | **Threshold:** ${coverage.threshold}%\n\n` +
      `## Below Threshold\n\n` +
      findings.map((f) => `- ${f.title}`).join("\n");
  }

  getReportChecklist(): string[] {
    return [
      "Run coverage tooling",
      "Report overall coverage percentage",
      "List files below threshold",
      "Identify uncovered branches and error paths",
      "Suggest specific tests to add",
    ];
  }
}
```

---

## 3. Tool Support

| Tool | Purpose | Permission | Policy |
|------|---------|-----------|--------|
| `run_coverage` | Generate coverage data | `execute` | `ask` |
| `read_file` | Read uncovered source | `read` | `auto` |
| `list_files` | Find test files | `read` | `auto` |
