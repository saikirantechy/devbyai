# System Overview — DevByAI Skills System

## Architectural Principle

**A skill provides knowledge and instructions. The agent provides reasoning. Tools provide capabilities. The security layer controls what can actually happen.**

A skill is not a plugin or tool. It should not automatically gain permission to read every file, execute shell commands, access the internet, or use a user's credentials.

---

## System Diagram

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
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              File tools · Terminal tools · GitHub tools           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Main Components

| Component | Responsibility |
|-----------|----------------|
| Skills Marketplace | Browse, publish, and install skills |
| Skills Registry | Store skill metadata and versions |
| Skills Discovery | Match skills to user tasks |
| Skills Loader | Retrieve and assemble skill instructions |
| Compatibility Engine | Support open and native skill formats |
| Agent Orchestrator | Coordinate AI model, skills, and tools |
| Permission Gateway | Enforce security and approvals |
| Skill Validator | Validate uploaded skill packages |
| Usage and Audit Service | Track installation and execution activity |

---

## Implementation Pattern

I recommend a **modular monolith** for the initial implementation, with separate modules and interfaces. You can split services later if scale requires it.

---

## Relationship to Existing DevByAI Code

The skills system builds on the existing `packages/skills/` package in the DevByAI monorepo:

- `packages/skills/src/types.ts` — Core `Skill`, `SkillMetadata`, `SkillInstructions` interfaces
- `packages/skills/src/registry.ts` — `SkillRegistry`, `resolveSkills`
- `packages/skills/src/index.ts` — Public API barrel exports and `createBuiltInSkillRegistry`

The technical design in this folder extends these into a full marketplace with versioning, publishing, discovery, loading, and security.