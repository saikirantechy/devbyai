# Skills

DEVBYAI skills provide reusable development knowledge that agents can use when working on your codebase. This folder documents all available skills, how to use them, and how to install the right ones for your tools.

---

## 📑 Skill Guides

| Guide | Description |
|-------|-------------|
| [`ui-ux-skills.md`](ui-ux-skills.md) | UI/UX design skills for agents |
| [`dev-skills.md`](dev-skills.md) | Core development skills |
| [`doc-skills.md`](doc-skills.md) | Documentation skills |
| [`format-dev-skills.md`](format-dev-skills.md) | Code formatting skills |
| [`security-skills.md`](security-skills.md) | Security auditing skills |
| [`app-web-dev-skills.md`](app-web-dev-skills.md) | App, website, and web app development skills |
| [`agent-skills.md`](agent-skills.md) | Reusable agent skill bundles (SKILL.md pattern) |
| [`skill-installation.md`](skill-installation.md) | Which skills are required for each tool |

---

## 🧠 What Are Skills?

Skills are reusable knowledge modules that agents consult when performing tasks. Each skill provides:

- **Instructions** — Core guidance for the AI
- **Best Practices** — Recommended approaches
- **Rules** — Constraints to follow
- **Applicability** — Which project types and agent roles the skill applies to

Defined in `packages/skills/src/types.ts`:

```ts
export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  priority: number;
  applicableProjectTypes: string[];
  applicableAgentRoles: string[];
}

export interface SkillInstructions {
  instructions: string[];
  bestPractices?: string[];
  rules?: string[];
}

export interface Skill {
  readonly metadata: SkillMetadata;
  getInstructions(): SkillInstructions;
  appliesTo(projectType: string): boolean;
}
```

---

## 🛠️ Built-in Skills

DEVBYAI ships with these built-in skills:

| Skill | ID | Project Types | Agent Roles |
|-------|-----|---------------|-------------|
| TypeScript | `typescript` | typescript, node | builder, reviewer |
| Testing | `testing` | typescript, node, python | builder, tester |
| Code Review | `code-review` | all | reviewer |
| Documentation | `documentation` | all | builder, reviewer |

---

## 📦 Installing Skills

Skills are built into the `@devbyai/skills` package. No separate installation is needed — they are registered automatically via `createBuiltInSkillRegistry()`.

To use a skill in your agent:

```ts
import { createBuiltInSkillRegistry, resolveSkills } from "@devbyai/skills";

const registry = createBuiltInSkillRegistry();
const activeSkills = resolveSkills(registry, "typescript");
```

See [`skill-installation.md`](skill-installation.md) for which skills map to which tools.

---

## 🆕 Creating a Custom Skill

Create `packages/skills/src/built-in/<your-skill>.ts`:

```ts
import type { Skill, SkillMetadata, SkillInstructions } from "../types.js";

export const yourSkillMetadata: SkillMetadata = {
  id: "your-skill",
  name: "Your Skill",
  description: "Description of your skill",
  priority: 50,
  applicableProjectTypes: ["typescript", "node"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class YourSkill implements Skill {
  readonly metadata = yourSkillMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: ["Do X", "Do Y"],
      bestPractices: ["Follow convention Z"],
      rules: ["Never do W"],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node"].includes(projectType);
  }
}
```

Register it in `packages/skills/src/index.ts`:

```ts
export { YourSkill, yourSkillMetadata } from "./built-in/your-skill.js";

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new YourSkill());
  return registry;
}
```

Then run checks:

```bash
pnpm --filter @devbyai/skills lint
pnpm --filter @devbyai/skills typecheck
pnpm --filter @devbyai/skills test
```

---

## 🔗 Related Resources

- [`adding-a-skill.md`](../adding-a-skill.md) — Step-by-step guide to adding a skill
- [`advanced-features.md`](../advanced-features.md) — Skills in the broader advanced features context