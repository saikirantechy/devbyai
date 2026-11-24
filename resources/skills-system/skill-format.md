# Skill Format — Open Standard + DevByAI Manifest

This section covers the skill file formats: the open `SKILL.md` convention and the DevByAI native manifest.

---

## Architectural Principle

Do not invent a completely separate skill format. Use the open `SKILL.md` convention as the foundation and add a DevByAI manifest for features that require structured metadata.

---

## A. Open-Standard Skill Structure

A standard skill package:

```
frontend-builder/
├── SKILL.md
├── references/
│   ├── react-guidelines.md
│   ├── accessibility.md
│   └── performance.md
├── scripts/
│   └── validate-project.sh
└── assets/
    └── component-template.tsx
```

### Example `SKILL.md`

```md
---
name: frontend-builder
description: Build responsive, accessible frontend applications. Use when creating websites, React components, dashboards, or frontend features.
---

# Frontend Builder

## Objective

Create maintainable and accessible frontend applications.

## Workflow

1. Inspect the existing project.
2. Identify the framework and dependencies.
3. Understand the component architecture.
4. Plan the implementation.
5. Build reusable components.
6. Implement responsive layouts.
7. Run available tests and lint checks.
8. Summarize the completed work.

## Guidelines

- Follow existing project conventions.
- Prefer TypeScript when appropriate.
- Reuse existing components.
- Avoid unnecessary dependencies.
- Implement accessible interfaces.
- Do not overwrite user changes.
```

The skill loader should understand the standard frontmatter and instruction body rather than requiring a proprietary file format.

---

## B. DevByAI Native Manifest

For marketplace features, add a separate `devbyai.json` file:

```json
{
  "schema_version": "1.0",
  "id": "devbyai.frontend-builder",
  "name": "Frontend Builder",
  "version": "1.0.0",
  "format": "agentskills",
  "category": "frontend",
  "author": {
    "name": "DevByAI"
  },
  "license": "MIT",
  "compatibility": {
    "agent_api": "1.0"
  },
  "capabilities": [
    "read_project",
    "search_files",
    "propose_file_edits"
  ],
  "entrypoint": "SKILL.md",
  "references": [
    "references/react-guidelines.md",
    "references/accessibility.md"
  ]
}
```

This is an illustrative DevByAI schema, not an existing industry standard.

### Why a Manifest?

Plain skill instructions do not reliably express:

- Marketplace identity
- Publisher information
- Version and compatibility
- License
- Declared capabilities
- Dependencies
- Verification status
- Package integrity

### Important

Declared capabilities are **requests for permissions, not grants**. Your permission gateway must independently approve them.

---

## C. Compatibility Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Canonical Internal Skill Definition      │
│              (one normalized representation)                │
└─────────────────────────────────────────────────────────────┘
                                 ▲
                                 │
          ┌──────────────────────┴──────────────────────┐
          │                                             │
┌─────────────────────┐                       ┌─────────────────────┐
│   Open Format       │                       │   DevByAI Format    │
│   SKILL.md + files  │                       │   Manifest + meta   │
│   AgentSkillsAdapter│                       │   DevByAISkillAdapter│
└─────────────────────┘                       └─────────────────────┘
```

### Adapters

- **AgentSkillsAdapter**: imports and exports compatible `SKILL.md` packages.
- **DevByAISkillAdapter**: reads native manifests and marketplace extensions.

The agent should consume the normalized internal definition, not care about the original package format.

### Compatibility Validation

Validate frontmatter, field restrictions, and package layout against the relevant published skill-format specification. Avoid silently accepting unsupported features.