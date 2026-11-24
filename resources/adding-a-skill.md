# Adding a New Skill

Skills provide reusable development knowledge (TypeScript, Testing, Code Review, Documentation) that agents can use.

---

## 1. Understand the Skill Interface

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

## 2. Implement the Skill

Create `packages/skills/src/built-in/<skill>.ts`. Example — a Docker skill:

```ts
import type {
  Skill,
  SkillMetadata,
  SkillInstructions,
} from "../types.js";

export const dockerMetadata: SkillMetadata = {
  id: "docker",
  name: "Docker",
  description: "Containerization best practices",
  priority: 50,
  applicableProjectTypes: ["node", "python", "go"],
  applicableAgentRoles: ["builder", "devops"],
};

export class DockerSkill implements Skill {
  readonly metadata = dockerMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use multi-stage builds to reduce image size",
        "Pin base image versions",
        "Add a .dockerignore file",
      ],
      bestPractices: ["Run as non-root user"],
      rules: ["Never commit secrets to images"],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["node", "python", "go"].includes(projectType);
  }
}
```

---

## 3. Register the Skill

Open `packages/skills/src/index.ts`:

1. Import and export your skill.
2. Add it to `createBuiltInSkillRegistry()`.

```ts
export { DockerSkill, dockerMetadata } from "./built-in/docker.js";

import { DockerSkill } from "./built-in/docker.js";

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new DockerSkill());   // <-- add this
  return registry;
}
```

---

## 4. Write Tests

Create `packages/skills/src/__tests__/docker.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DockerSkill } from "../built-in/docker.js";

describe("DockerSkill", () => {
  it("applies to node projects", () => {
    const skill = new DockerSkill();
    expect(skill.appliesTo("node")).toBe(true);
  });

  it("returns instructions", () => {
    const skill = new DockerSkill();
    const instructions = skill.getInstructions();
    expect(instructions.instructions.length).toBeGreaterThan(0);
  });
});
```

---

## 5. Run Checks

```bash
pnpm --filter @devbyai/skills lint
pnpm --filter @devbyai/skills typecheck
pnpm --filter @devbyai/skills test
```
