# Report Generator Skills

Professional report generator skills for DEVBYAI agents — generate test reports, security reports, coverage reports, dependency reports, and project health reports with full tool support.

---

## 📑 Contents

| Guide | Description |
|-------|-------------|
| [`report-generator-overview.md`](report-generator-overview.md) | Report generation architecture and principles |
| [`test-report-skill.md`](test-report-skill.md) | Generate test execution reports |
| [`security-report-skill.md`](security-report-skill.md) | Generate security audit reports |
| [`coverage-report-skill.md`](coverage-report-skill.md) | Generate code coverage reports |
| [`dependency-report-skill.md`](dependency-report-skill.md) | Generate dependency vulnerability reports |
| [`project-health-report-skill.md`](project-health-report-skill.md) | Generate overall project health reports |
| [`report-generator-tools.md`](report-generator-tools.md) | Tool support for report generator agents |
| [`report-generator-agent.md`](report-generator-agent.md) | Agent integration for report generation |
| [`report-generator-devtools.md`](report-generator-devtools.md) | Developer tools, CLI commands, and CI/CD workflows |

---

## 🎯 Core Principle

> **A good report turns raw tool output into decisions. Reports must be accurate, reproducible, actionable, and scoped to what the user asked for.**

A report generator skill provides knowledge and formatting instructions. The agent provides reasoning. Tools collect the data. The security layer controls what can be read and executed.

---

## 📊 Report Types

| Report | Data Source | Primary Tools |
|--------|-------------|---------------|
| Test report | Test runner output | `run_tests`, `read_file` |
| Security report | Vulnerability scans, source patterns | `security-audit`, `search_files` |
| Coverage report | Coverage tooling output | `run_coverage`, `read_file` |
| Dependency report | Lockfiles, audit output | `audit_dependencies`, `read_file` |
| Project health report | All of the above | Multiple tools |

---

## 🚀 Getting Started

Read the guides in order:

1. [`report-generator-overview.md`](report-generator-overview.md) — Foundation and principles
2. [`test-report-skill.md`](test-report-skill.md) — Test reports
3. [`security-report-skill.md`](security-report-skill.md) — Security reports
4. [`coverage-report-skill.md`](coverage-report-skill.md) — Coverage reports
5. [`dependency-report-skill.md`](dependency-report-skill.md) — Dependency reports
6. [`project-health-report-skill.md`](project-health-report-skill.md) — Project health reports
7. [`report-generator-tools.md`](report-generator-tools.md) — Tool support
8. [`report-generator-agent.md`](report-generator-agent.md) — Agent integration
9. [`report-generator-devtools.md`](report-generator-devtools.md) — Developer tools

---

## 🔗 Related Resources

- [`code-review/`](../code-review/) — Code review skills with tool support
- [`skills/security-skills.md`](../security-skills.md) — Security skills overview
- [`control-tools-system.md`](../../control-tools-system.md) — Tool control and permissions
- [`adding-a-skill.md`](../../adding-a-skill.md) — How to add a new skill
