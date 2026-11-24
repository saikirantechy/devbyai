# Report Generator Agent

Agent integration for report generation in DEVBYAI. How report agents discover skills, collect evidence through tools, and produce reports.

---

## 1. Agent Metadata

```ts
export const reportGeneratorAgentMetadata: AgentMetadata = {
  id: "report-generator",
  name: "Report Generator Agent",
  description: "Generates test, security, coverage, dependency, and project health reports",
  role: "reporter",
  capabilities: [
    "collect_evidence",
    "analyze_results",
    "generate_reports",
    "redact_secrets",
  ],
  supportedPhases: ["review", "report"],
};
```

---

## 2. Agent Implementation

```ts
export class ReportGeneratorAgent implements Agent {
  readonly metadata = reportGeneratorAgentMetadata;

  private toolRegistry = createDefaultToolRegistry();
  private skillRegistry = createBuiltInSkillRegistry();

  async execute(context: AgentContext): Promise<AgentResult> {
    const reportType = this.detectReportType(context.request);
    const skills = resolveSkills(this.skillRegistry, context.cwd)
      .filter((s) => s.metadata.reportTypes.includes(reportType));

    const reportContext = {
      cwd: context.cwd,
      projectType: "typescript",
      reportType,
      tools: this.createReportToolset(context),
    };

    const reports = [];
    for (const skill of skills) {
      reports.push(await skill.generate(reportContext));
    }

    return {
      agentId: this.metadata.id,
      success: true,
      output: reports.map((r) => r.content).join("\n\n---\n\n"),
      suggestedNext: "present_report_to_user",
    };
  }

  private detectReportType(request: string): ReportType {
    if (request.includes("security") || request.includes("audit")) return "security-audit";
    if (request.includes("coverage")) return "coverage-report";
    if (request.includes("dependency") || request.includes("deps")) return "dependency-audit";
    if (request.includes("test")) return "test-report";
    return "project-health";
  }

  private createReportToolset(context: AgentContext): ReportToolset {
    return {
      read_file: (input) => this.toolRegistry.get("read_file").execute(input),
      list_files: (input) => this.toolRegistry.get("list_files").execute(input),
      search_files: (input) => this.toolRegistry.get("search_files").execute(input),
      run_tests: (input) => this.toolRegistry.get("run_tests").execute(input),
      run_coverage: (input) => this.toolRegistry.get("run_coverage").execute(input),
      audit_dependencies: (input) => this.toolRegistry.get("audit_dependencies").execute(input),
    };
  }
}
```

---

## 3. Workflow

```
User request → Detect report type → Select skills → Collect evidence via tools → Generate report → Present to user
```

---

## 4. Registering the Agent

```ts
export { ReportGeneratorAgent, reportGeneratorAgentMetadata } from "./built-in/report-generator.js";

import { ReportGeneratorAgent } from "./built-in/report-generator.js";

export function createBuiltInAgentRegistry(): AgentRegistry {
  const registry = new AgentRegistry();
  registry.register(new CodeReviewAgent());
  registry.register(new ReportGeneratorAgent());
  return registry;
}
```

---

## 5. Checklist

- [ ] Agent implements `Agent` interface
- [ ] `metadata.role` is `"reporter"`
- [ ] Detects report type from request
- [ ] Selects skills based on report type
- [ ] Creates toolset from tool registry
- [ ] Redacts secrets in all output
- [ ] Registered in agent registry
- [ ] Tests in `src/__tests__/`
