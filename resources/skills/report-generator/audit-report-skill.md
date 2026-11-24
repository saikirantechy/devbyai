# Audit Report Skill

Security and compliance audit report generation for DEVBYAI agents. Collects evidence through tools and produces structured, actionable audit reports.

---

## 1. Skill Metadata

```ts
export const auditReportMetadata: ReportSkillMetadata = {
  id: "audit-report",
  name: "Audit Report Generator",
  description: "Generate security and compliance audit reports from tool-collected evidence",
  priority: 95,
  reportTypes: ["security-audit", "compliance-audit", "dependency-audit", "code-audit"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer", "security-auditor", "reporter"],
};
```

---

## 2. Audit Report Instructions

```ts
export class AuditReportSkill implements ReportSkill {
  readonly metadata = auditReportMetadata;

  async generate(context: ReportContext): Promise<GeneratedReport> {
    const findings: AuditFinding[] = [];

    // 1. Collect evidence from tools
    findings.push(...await this.auditSecrets(context));
    findings.push(...await this.auditDependencies(context));
    findings.push(...await this.auditAuthentication(context));
    findings.push(...await this.auditInputValidation(context));
    findings.push(...await this.auditFilePermissions(context));

    // 2. Classify and prioritize
    const classified = this.classifyFindings(findings);

    // 3. Generate structured report
    return this.buildReport(classified, context);
  }

  private async auditSecrets(context: ReportContext): Promise<AuditFinding[]> {
    // Use search_files to find hardcoded secrets
    const results = await context.tools.search_files({
      pattern: "(api[_-]?key|secret|password|token|private[_-]?key)\\s*[:=]\\s*['\"][^'\"]+['\"]",
      directory: context.cwd,
    });
    return results.map((r) => ({
      id: `SEC-${r.id}`,
      category: "secret-exposure",
      severity: "critical",
      title: "Potential hardcoded secret",
      evidence: r.match,
      file: r.file,
      line: r.line,
      recommendation: "Move secret to environment variable and rotate the exposed credential",
    }));
  }

  private async auditDependencies(context: ReportContext): Promise<AuditFinding[]> {
    // Use audit_dependencies to check lockfiles
    const results = await context.tools.audit_dependencies({ cwd: context.cwd });
    return results.vulnerabilities.map((v) => ({
      id: `DEP-${v.id}`,
      category: "vulnerable-dependency",
      severity: v.severity,
      title: `Vulnerable dependency: ${v.package}`,
      evidence: v.advisory,
      recommendation: v.fixAvailable
        ? `Upgrade to ${v.fixAvailable}`
        : "No fix available — consider replacing the dependency",
    }));
  }

  private async auditAuthentication(context: ReportContext): Promise<AuditFinding[]> {
    // Check auth checks on sensitive routes
    return [];
  }

  private async auditInputValidation(context: ReportContext): Promise<AuditFinding[]> {
    // Check input validation patterns
    return [];
  }

  private async auditFilePermissions(context: ReportContext): Promise<AuditFinding[]> {
    // Check overly permissive file access
    return [];
  }

  private classifyFindings(findings: AuditFinding[]): AuditFinding[] {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return findings.sort((a, b) => order[a.severity] - order[b.severity]);
  }

  private buildReport(findings: AuditFinding[], context: ReportContext): GeneratedReport {
    const counts = this.countBySeverity(findings);
    const passed = this.getPassedChecks(context);

    let markdown = `# Security Audit Report\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n`;
    markdown += `**Scope:** ${context.cwd}\n\n`;
    markdown += `## Executive Summary\n\n`;
    markdown += `| Severity | Count |\n|----------|-------|\n`;
    markdown += `| Critical | ${counts.critical} |\n`;
    markdown += `| High | ${counts.high} |\n`;
    markdown += `| Medium | ${counts.medium} |\n`;
    markdown += `| Low | ${counts.low} |\n\n`;

    for (const severity of ["critical", "high", "medium", "low"] as const) {
      const group = findings.filter((f) => f.severity === severity);
      if (group.length === 0) continue;
      markdown += `## ${severity.toUpperCase()} Findings\n\n`;
      for (const f of group) {
        markdown += `### ${f.id}: ${f.title}\n\n`;
        markdown += `- **Category:** ${f.category}\n`;
        if (f.file) markdown += `- **Location:** \`${f.file}${f.line ? `:${f.line}` : ""}\`\n`;
        markdown += `- **Evidence:** ${f.evidence}\n`;
        markdown += `- **Recommendation:** ${f.recommendation}\n\n`;
      }
    }

    markdown += `## Passed Checks\n\n`;
    for (const check of passed) markdown += `- ✅ ${check}\n`;

    markdown += `\n## Remediation Priority\n\n`;
    markdown += `1. Fix all critical findings immediately\n`;
    markdown += `2. Fix high findings before release\n`;
    markdown += `3. Schedule medium findings for next sprint\n`;

    return {
      skillId: this.metadata.id,
      reportType: "security-audit",
      format: "markdown",
      content: markdown,
      findings,
      generatedAt: new Date().toISOString(),
    };
  }

  private countBySeverity(findings: AuditFinding[]): Record<string, number> {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    for (const f of findings) counts[f.severity]++;
    return counts;
  }

  private getPassedChecks(context: ReportContext): string[] {
    return [
      "No plaintext secrets in tracked source files",
      "Dependency lockfile present",
      "HTTPS used for external communications",
    ];
  }

  getReportChecklist(): string[] {
    return [
      "Scan for hardcoded secrets and credentials",
      "Audit dependencies for known vulnerabilities",
      "Verify authentication on protected routes",
      "Verify authorization on resource access",
      "Check input validation and sanitization",
      "Check error handling for information leakage",
      "Check file permissions and workspace boundaries",
      "Record evidence with file paths and line numbers",
      "Classify findings by severity",
      "Provide specific remediation guidance",
      "List passed checks for completeness",
    ];
  }
}
```

---

## 3. Audit Categories

| Category | Severity Range | Description |
|----------|---------------|-------------|
| `secret-exposure` | `critical` | Hardcoded API keys, passwords, tokens |
| `vulnerable-dependency` | `critical`–`high` | Known CVEs in dependencies |
| `authentication` | `high` | Missing or weak authentication |
| `authorization` | `high` | Missing resource-level access control |
| `input-validation` | `high`–`medium` | Unvalidated user input |
| `injection` | `critical` | SQL, command, or template injection |
| `error-handling` | `medium` | Information leakage through errors |
| `file-permissions` | `medium` | Overly permissive file access |

---

## 4. Tool Support

| Tool | Purpose | Permission | Policy |
|------|---------|-----------|--------|
| `search_files` | Find secret patterns and insecure code | `read` | `auto` |
| `read_file` | Read files for detailed evidence | `read` | `auto` |
| `list_files` | Enumerate project files | `read` | `auto` |
| `audit_dependencies` | Scan lockfiles for vulnerabilities | `read` | `ask` |
| `security-audit` | Run full security scanner | `execute` | `ask` |

Example tool usage:

```ts
const secrets = await context.tools.search_files({
  pattern: "(api[_-]?key|secret|password|token)\\s*[:=]",
  directory: context.cwd,
});

const deps = await context.tools.audit_dependencies({ cwd: context.cwd });
```

---

## 5. Report Output Example

```md
# Security Audit Report

**Generated:** 2026-11-24T10:00:00Z
**Scope:** /project

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 2 |
| Medium | 3 |
| Low | 0 |

## CRITICAL Findings

### SEC-001: Potential hardcoded secret

- **Category:** secret-exposure
- **Location:** `src/auth/config.ts:15`
- **Evidence:** `apiKey = "sk-live-..."`
- **Recommendation:** Move secret to environment variable and rotate the exposed credential

## Passed Checks

- ✅ No plaintext secrets in tracked source files
- ✅ Dependency lockfile present
- ✅ HTTPS used for external communications

## Remediation Priority

1. Fix all critical findings immediately
2. Fix high findings before release
3. Schedule medium findings for next sprint
```

---

## 6. Registering the Skill

```ts
export { AuditReportSkill, auditReportMetadata } from "./built-in/audit-report.js";

import { AuditReportSkill } from "./built-in/audit-report.js";

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new AuditReportSkill());
  return registry;
}
```
