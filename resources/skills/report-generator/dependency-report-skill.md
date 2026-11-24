# Dependency Report Skill

Dependency vulnerability report generation for DEVBYAI agents.

---

## 1. Skill Metadata

```ts
export const dependencyReportMetadata: ReportSkillMetadata = {
  id: "dependency-report",
  name: "Dependency Report Generator",
  description: "Generate dependency vulnerability and license reports from lockfiles",
  priority: 85,
  reportTypes: ["dependency-audit"],
  applicableProjectTypes: ["typescript", "node", "python", "go"],
  applicableAgentRoles: ["security-auditor", "reporter", "developer"],
};
```

---

## 2. Instructions

```ts
export class DependencyReportSkill implements ReportSkill {
  readonly metadata = dependencyReportMetadata;

  async generate(context: ReportContext): Promise<GeneratedReport> {
    const audit = await context.tools.audit_dependencies({ cwd: context.cwd });

    const findings: ReportFinding[] = audit.vulnerabilities.map((v) => ({
      id: `DEP-${v.id}`,
      category: "vulnerable-dependency",
      severity: v.severity,
      title: `${v.package}@${v.version}: ${v.title}`,
      evidence: v.advisory,
      recommendation: v.fixAvailable
        ? `Upgrade to ${v.fixAvailable}`
        : "No fix available — evaluate replacement",
    }));

    return {
      skillId: this.metadata.id,
      reportType: "dependency-audit",
      format: "markdown",
      content: this.format(audit, findings),
      findings,
      generatedAt: new Date().toISOString(),
    };
  }

  private format(audit: DependencyAudit, findings: ReportFinding[]): string {
    return `# Dependency Audit Report\n\n` +
      `**Packages scanned:** ${audit.totalPackages} | **Vulnerabilities:** ${findings.length}\n\n` +
      `## Vulnerabilities\n\n` +
      findings.map((f) => `### ${f.title}\n- **Severity:** ${f.severity}\n- **Advisory:** ${f.evidence}\n- **Fix:** ${f.recommendation}`).join("\n\n");
  }

  getReportChecklist(): string[] {
    return [
      "Run dependency audit on lockfile",
      "List vulnerabilities with severity and advisory",
      "Identify available fixes",
      "Check for outdated direct dependencies",
      "Check license compatibility",
    ];
  }
}
```

---

## 3. Tool Support

| Tool | Purpose | Permission | Policy |
|------|---------|-----------|--------|
| `audit_dependencies` | Scan lockfile for CVEs | `read` | `ask` |
| `read_file` | Read lockfile / package manifest | `read` | `auto` |
| `search_files` | Find all manifest files | `read` | `auto` |
