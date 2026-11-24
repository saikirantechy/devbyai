# Advanced Code Review Skills

Professional code review skills for DEVBYAI agents, covering security, performance, architecture, testing, and maintainability — with full tool support.

---

## 📑 Contents

| Guide | Description |
|-------|-------------|
| [`code-review-overview.md`](code-review-overview.md) | Code review skill architecture and principles |
| [`security-review-skill.md`](security-review-skill.md) | Security-focused code review |
| [`performance-review-skill.md`](performance-review-skill.md) | Performance and optimization review |
| [`architecture-review-skill.md`](architecture-review-skill.md) | Architecture and design review |
| [`testing-review-skill.md`](testing-review-skill.md) | Testing and quality review |
| [`code-review-tools.md`](code-review-tools.md) | Tool support for code review agents |
| [`code-review-agent.md`](code-review-agent.md) | Agent integration for code review |
| [`code-review-devtools.md`](code-review-devtools.md) | Developer tools and workflows |

---

## 🎯 Core Principle

> **Code review is not just finding bugs — it's ensuring code is secure, performant, maintainable, and aligned with project standards.**

A code review skill provides knowledge and instructions. The agent provides reasoning. Tools provide capabilities. The security layer controls what can actually happen.

---

## 🔍 Review Dimensions

| Dimension | Focus | Tools |
|-----------|-------|-------|
| Security | Vulnerabilities, secrets, injection, auth | `search_files`, `read_file`, `security-audit` |
| Performance | Complexity, N+1 queries, blocking I/O | `read_file`, `search_files`, `run_linter` |
| Architecture | Module boundaries, patterns, coupling | `list_files`, `read_file`, `search_files` |
| Testing | Coverage, edge cases, mocking | `run_tests`, `read_file`, `list_files` |
| Maintainability | Naming, comments, duplication, complexity | `read_file`, `search_files`, `run_linter` |

---

## 🚀 Getting Started

Read the guides in order:

1. [`code-review-overview.md`](code-review-overview.md) — Foundation and principles
2. [`security-review-skill.md`](security-review-skill.md) — Security review
3. [`performance-review-skill.md`](performance-review-skill.md) — Performance review
4. [`architecture-review-skill.md`](architecture-review-skill.md) — Architecture review
5. [`testing-review-skill.md`](testing-review-skill.md) — Testing review
6. [`code-review-tools.md`](code-review-tools.md) — Tool support
7. [`code-review-agent.md`](code-review-agent.md) — Agent integration
8. [`code-review-devtools.md`](code-review-devtools.md) — Developer workflows

---

## 🔗 Related Resources

- [`skills/security-skills.md`](../skills/security-skills.md) — Security skills overview
- [`skills/dev-skills.md`](../skills/dev-skills.md) — Development skills
- [`control-tools-system.md`](../control-tools-system.md) — Tool control and permissions
- [`adding-a-skill.md`](../adding-a-skill.md) — How to add a new skill