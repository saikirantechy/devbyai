# Security Report Skill

Security posture report generation for DEVBYAI agents. Complements [`audit-report-skill.md`](audit-report-skill.md) with ongoing security posture tracking.

---

## 1. Skill Metadata

```ts
export const securityReportMetadata: ReportSkillMetadata = {
  id: "security-report",
  name: "Security Report Generator",
  description: "Generate security posture reports including secrets, injection, and auth checks",
  priority: 90,
  reportTypes: ["security-audit", "compliance-audit"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["security-auditor", "reviewer", "reporter"],
};
```

---

## 2. Instructions

```ts
export class SecurityReportSkill implements ReportSkill {
  readonly metadata = securityReportMetadata;

  async generate(context: ReportContext): Promise<GeneratedReport> {
    const findings: ReportFinding[] = [];

    findings.push(...await this.scanSecrets(context));
    findings.push(...await this.scanInjectionRisks(context));
    findings.push(...await this.scanAuthChecks(context));

    return {
      skillId: this.metadata.id,
      reportType: "security-audit",
      format: "markdown",
      content: this.format(findings),
      findings,
      generatedAt: new Date().toISOString(),
    };
  }

  private async scanSecrets(context: ReportContext): Promise<ReportFinding[]> {
    const matches = await context.tools.search_files({
      pattern: "(api[_-]?key|secret|password|token)\\s*[:=]",
      directory: context.cwd,
    });
    // Redact actual values — report only location and type
    return matches.map((m) => ({
      id: `SEC-${m.id}`,
      category: "secret-exposure",
      severity: "critical",
      title: "Potential hardcoded secret",
      evidence: "[redacted — pattern matched]",
      file: m.file,
      line: m.line,
      recommendation: "Move to environment variable and rotate credential",
    }));
  }

  private async scanInjectionRisks(context: ReportContext): Promise<ReportFinding[]> {
    // Search for string-concatenated SQL, eval, child_process with user input
    return [];
  }

  private async scanAuthChecks(context: ReportContext): Promise<ReportFinding[]> {
    // Check route handlers for auth middleware
    return [];
  }

  private format(findings: ReportFinding[]): string {
    return `# Security Report\n\n` +
      `## Findings (${findings.length})\n\n` +
      findings.map((f) => `- **${f.severity.toUpperCase()}** ${f.title} — \`${f.file}:${f.line}\`\n  ${f.recommendation}`).join("\n");
  }

  getReportChecklist(): string[] {
    return [
      "Scan for hardcoded secrets (values redacted)",
      "Check for SQL/command injection risks",
      "Verify authentication on protected routes",
      "Verify authorization on resource access",
      "Check error handling for information leakage",
      "Check dependency vulnerabilities",
      "Record evidence locations without exposing secrets",
    ];
  }
}
```

---

## 3. Tool Support

| Tool | Purpose | Permission | Policy |
|------|---------|-----------|--------|
| `search_files` | Pattern scanning | `read` | `auto` |
| `read_file` | Evidence review | `read` | `auto` |
| `audit_dependencies` | CVE scanning | `read` | `ask` |
| `security-audit` | Full scanner | `execute` | `ask` |
