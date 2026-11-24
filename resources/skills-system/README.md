# DevByAI Skills System — Technical Design

A hybrid, open-standard-compatible skill platform for DEVBYAI.

This folder contains the complete technical design for building a skills marketplace where DevByAI maintains official, trusted developer skills and community members can publish, share, update, and install their own skills.

---

## 📑 Design Sections

| Section | File | Description |
|---------|------|-------------|
| 1. System Overview | [`system-overview.md`](system-overview.md) | Architecture, components, main responsibilities |
| 2. Skill Format | [`skill-format.md`](skill-format.md) | Open `SKILL.md` convention + DevByAI manifest |
| 3. Database Schema | [`database-schema.md`](database-schema.md) | PostgreSQL tables and relationships |
| 4. Skills Registry | [`skills-registry.md`](skills-registry.md) | Registration, discovery, versioning, publishing |
| 5. Skill Loader | [`skill-loader.md`](skill-loader.md) | Loading lifecycle, lazy loading, caching |
| 6. Agent Integration | [`agent-integration.md`](agent-integration.md) | Orchestration pipeline, discovery, context |
| 7. Security Architecture | [`security-architecture.md`](security-architecture.md) | Trust levels, permissions, sandbox, audit |
| 8. Marketplace | [`marketplace.md`](marketplace.md) | Screens, API design, recommendation |
| 9. Implementation Plan | [`implementation-plan.md`](implementation-plan.md) | 7-phase roadmap |
| 10. First Official Skills | [`first-skills.md`](first-skills.md) | 12 starter skills |
| 11. Testing & Acceptance | [`testing-acceptance.md`](testing-acceptance.md) | Acceptance criteria and benchmarks |
| 12. Technical Boundaries | [`technical-boundaries.md`](technical-boundaries.md) | Module separation recommendations |
| 13. References | [`references.md`](references.md) | Specifications and references |
| 14. Final Recommendation | [`final-recommendation.md`](final-recommendation.md) | Recommended direction and next steps |

---

## 🎯 Core Principle

> **A skill provides knowledge and instructions. The agent provides reasoning. Tools provide capabilities. The security layer controls what can actually happen.**

A skill is not a plugin or tool. It should not automatically gain permission to read every file, execute shell commands, access the internet, or use user credentials.

---

## 🏗️ System at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│              DevByAI Skills Marketplace                           │
│   Official skills · Community skills · Search · Install · Update  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Skills Registry                                │
│         Metadata · Versions · Compatibility · Trust · Deps        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Skills Discovery                                 │
│                      Match skills to tasks                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Skills Loader                                  │
│                Retrieve and assemble instructions                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               Agent Orchestrator                                  │
│         Planning · Skill selection · Model selection · Tools      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│           Permission and Security Gateway                         │
│            Authorization · Sandbox · Approval · Audit logs        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

Read the sections in order:

1. [`system-overview.md`](system-overview.md) — Understand the components
2. [`skill-format.md`](skill-format.md) — Learn the skill file formats
3. [`database-schema.md`](database-schema.md) — See the PostgreSQL schema
4. [`skills-registry.md`](skills-registry.md) — Understand the registry
5. [`skill-loader.md`](skill-loader.md) — Understand skill loading
6. [`agent-integration.md`](agent-integration.md) — Connect to the AI agent
7. [`security-architecture.md`](security-architecture.md) — Security model
8. [`marketplace.md`](marketplace.md) — Community marketplace
9. [`implementation-plan.md`](implementation-plan.md) — Build phases
10. [`first-skills.md`](first-skills.md) — Starter skills
11. [`testing-acceptance.md`](testing-acceptance.md) — Validation criteria

---

## 🔗 Related Resources

- [`skills/`](../skills/) — Skill implementations (UI/UX, Dev, Doc, Format, Security, App/Web, Agent skills)
- [`control-tools-system.md`](../control-tools-system.md) — Tool control and permissions
- [`adding-user-models.md`](../adding-user-models.md) — Adding AI models
- [`adding-user-providers.md`](../adding-user-providers.md) — Adding AI providers
- [`advanced-features.md`](../advanced-features.md) — Hooks, workflows, skills, agents