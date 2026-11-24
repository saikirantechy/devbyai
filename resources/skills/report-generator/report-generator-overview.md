# Report Generator Overview

Foundation and principles for report generator skills in DEVBYAI.

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Report Request                             │
│            "Generate a security audit report"                 │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Report Generator Orchestrator                    │
│           Selects report skills based on request              │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Tool Collection                            │
│   run_tests · audit_dependencies · search_files · read_file   │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  Report Skill Processing                      │
│         Parse → Classify → Prioritize → Format               │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  Generated Report                             │
│         Markdown · JSON · HTML · Terminal output             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Principles

| Principle | Description |
|-----------|-------------|
| **Evidence-based** | Every finding must cite tool output or source location |
| **Reproducible** | Same inputs produce the same report structure |
| **Actionable** | Every finding includes a specific recommendation |
| **Scoped** | Only report on what the user asked for |
| **Accurate** | Never invent findings or inflate severity |
| **Secure** | Redact secrets from all report output |

---

## 3. Core Interfaces

```ts
export type ReportType =
  | "test-report"
  | "security-audit"
  | "coverage-report"
  | "dependency-audit"
  | "project-health"
  | "compliance-audit";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface ReportSkillMetadata {
  id: string;
  name: string;
  description: string;
  priority: number;
  reportTypes: ReportType[];
  applicableProjectTypes: string[];
  applicableAgentRoles: string[];
}

export interface ReportFinding {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  evidence: string;
  file?: string;
  line?: number;
  recommendation: string;
}

export interface ReportContext {
  cwd: string;
  projectType: string;
  framework?: string;
  reportType: ReportType;
  tools: ReportToolset;
  options?: Record<string, unknown>;
}

export interface GeneratedReport {
  skillId: string;
  reportType: ReportType;
  format: "markdown" | "json" | "html" | "terminal";
  content: string;
  findings: ReportFinding[];
  generatedAt: string;
}

export interface ReportSkill {
  readonly metadata: ReportSkillMetadata;
  generate(context: ReportContext): Promise<GeneratedReport>;
  getReportChecklist(): string[];
}
```

---

## 4. Report Severity Levels

| Severity | Meaning | Action |
|----------|---------|--------|
| `critical` | Exploitable vulnerability or data loss risk | Block release |
| `high` | Major issue requiring prompt attention | Fix before release |
| `medium` | Quality or risk issue | Schedule fix |
| `low` | Minor improvement | Optional |
| `info` | Informational note | No action |

---

## 5. Security Rules

- **Never** include actual secret values in reports — show only the location and pattern type.
- **Never** log full source files into reports.
- **Always** respect tool permissions and workspace boundaries.
- **Always** mark reports as generated from tool-collected evidence.

---

## 6. Checklist for Adding Report Skills

- [ ] Skill implements `ReportSkill` interface
- [ ] `reportTypes` lists supported report types
- [ ] `generate()` returns `GeneratedReport` with findings
- [ ] Every finding has evidence and recommendation
- [ ] Secrets redacted from all output
- [ ] Tool permissions configured
- [ ] Registered in skill registry
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes
