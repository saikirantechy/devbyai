# Project Health Report Skill

Overall project health report generation for DEVBYAI agents. Combines all report skills into a single health snapshot.

---

## 1. Skill Metadata

```ts
export const projectHealthReportMetadata: ReportSkillMetadata = {
  id: "project-health-report",
  name: "Project Health Report Generator",
  description: "Generate combined project health reports from multiple report skills",
  priority: 70,
  reportTypes: ["project-health"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["planner", "reporter", "reviewer"],
};
```

---

## 2. Instructions

```ts
export class ProjectHealthReportSkill implements ReportSkill {
  readonly metadata = projectHealthReportMetadata;

  constructor(private skills: ReportSkill[]) {}

  async generate(context: ReportContext): Promise<GeneratedReport> {
    const reports: GeneratedReport[] = [];

    for (const skill of this.skills) {
      if (skill === this) continue;
      try {
        const report = await skill.generate(context);
        reports.push(report);
      } catch (error) {
        // Record tool failure without crashing the whole report
        reports.push({
          skillId: skill.metadata.id,
          reportType: skill.metadata.reportTypes[0],
          format: "markdown",
          content: `Unable to generate: ${error}`,
          findings: [],
          generatedAt: new Date().toISOString(),
        });
      }
    }

    const allFindings = reports.flatMap((r) => r.findings);
    const score = this.calculateHealthScore(allFindings);

    return {
      skillId: this.metadata.id,
      reportType: "project-health",
      format: "markdown",
      content: this.format(score, reports, allFindings),
      findings: allFindings,
      generatedAt: new Date().toISOString(),
    };
  }

  private calculateHealthScore(findings: ReportFinding[]): number {
    const weights = { critical: 25, high: 10, medium: 3, low: 1, info: 0 };
    const penalty = findings.reduce((sum, f) => sum + weights[f.severity], 0);
    return Math.max(0, 100 - penalty);
  }

  private format(score: number, reports: GeneratedReport[], findings: ReportFinding[]): string {
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
    return `# Project Health Report\n\n` +
      `**Health Score:** ${score}/100 (${grade})\n\n` +
      `## Component Reports\n\n` +
      reports.map((r) => `- ${r.skillId}: ${r.findings.length} findings`).join("\n") +
      `\n\n## Priority Actions\n\n` +
      findings.filter((f) => f.severity === "critical" || f.severity === "high")
        .slice(0, 5)
        .map((f) => `1. ${f.title} — ${f.recommendation}`).join("\n");
  }

  getReportChecklist(): string[] {
    return [
      "Run all component report skills",
      "Handle individual tool failures gracefully",
      "Calculate health score transparently",
      "List top priority actions",
      "Include all component report summaries",
    ];
  }
}
```

---

## 3. Tool Support

Uses all tools from component report skills: `run_tests`, `run_coverage`, `audit_dependencies`, `search_files`, `read_file`, `list_files`.

---

## 4. Health Score Weights

| Severity | Penalty |
|----------|---------|
| `critical` | -25 |
| `high` | -10 |
| `medium` | -3 |
| `low` | -1 |
| `info` | 0 |
