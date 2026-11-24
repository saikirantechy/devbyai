# UI/UX Skills

UI/UX skills help DEVBYAI agents understand design principles, accessibility, responsive layouts, and user experience best practices when working on frontend code.

---

## 1. UI/UX Skill Categories

| Skill | ID | Purpose | Best For |
|-------|-----|---------|----------|
| Responsive Design | `responsive-design` | Mobile-first layouts, breakpoints, fluid grids | Frontend builders |
| Accessibility | `accessibility` | ARIA labels, color contrast, keyboard navigation | All frontend work |
| Design System | `design-system` | Component consistency, tokens, spacing, typography | Design system contributors |
| User Experience | `user-experience` | User flows, interaction patterns, usability | Product features |
| Visual Design | `visual-design` | Color theory, spacing, imagery, visual hierarchy | UI polish |

---

## 2. Responsive Design Skill

```ts
export const responsiveDesignMetadata: SkillMetadata = {
  id: "responsive-design",
  name: "Responsive Design",
  description: "Mobile-first responsive layouts and breakpoints",
  priority: 80,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class ResponsiveDesignSkill implements Skill {
  readonly metadata = responsiveDesignMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use mobile-first design approach",
        "Define breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)",
        "Use relative units (rem, em, %) over fixed pixels",
        "Test layouts on multiple screen sizes",
        "Ensure touch targets are at least 44x44px",
      ],
      bestPractices: [
        "Use CSS Grid and Flexbox for layouts",
        "Hide non-essential content on small screens",
        "Use responsive images with srcset",
      ],
      rules: [
        "Never use fixed width containers without max-width",
        "Always test on mobile viewport",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "react", "nextjs", "node"].includes(projectType);
  }
}
```

---

## 3. Accessibility Skill

```ts
export const accessibilityMetadata: SkillMetadata = {
  id: "accessibility",
  name: "Accessibility (a11y)",
  description: "WCAG compliance, ARIA, keyboard navigation, color contrast",
  priority: 90,
  applicableProjectTypes: ["typescript", "react", "nextjs", "node"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class AccessibilitySkill implements Skill {
  readonly metadata = accessibilityMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Add ARIA labels to interactive elements",
        "Ensure color contrast ratio of at least 4.5:1",
        "Make all functionality keyboard accessible",
        "Use semantic HTML (button, nav, main, section, etc.)",
        "Provide alt text for images",
      ],
      bestPractices: [
        "Use native HTML elements over custom divs for interactivity",
        "Test with screen readers",
        "Provide focus indicators",
      ],
      rules: [
        "Never remove focus outlines without replacement",
        "Do not rely on color alone to convey meaning",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "react", "nextjs", "node"].includes(projectType);
  }
}
```

---

## 4. Design System Skill

```ts
export const designSystemMetadata: SkillMetadata = {
  id: "design-system",
  name: "Design System",
  description: "Component consistency, design tokens, spacing, typography",
  priority: 70,
  applicableProjectTypes: ["typescript", "react", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class DesignSystemSkill implements Skill {
  readonly metadata = designSystemMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use defined design tokens (colors, spacing, typography)",
        "Reuse existing components before creating new ones",
        "Follow component naming conventions",
        "Document component props and usage",
      ],
      bestPractices: [
        "Create variants for component states (default, hover, active, disabled)",
        "Use CSS custom properties for theming",
      ],
      rules: [
        "Do not hardcode colors or spacing values",
        "Always export component types",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "react", "nextjs"].includes(projectType);
  }
}
```

---

## 5. User Experience Skill

```ts
export const userExperienceMetadata: SkillMetadata = {
  id: "user-experience",
  name: "User Experience",
  description: "User flows, interaction patterns, usability best practices",
  priority: 75,
  applicableProjectTypes: ["typescript", "react", "nextjs", "node"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class UserExperienceSkill implements Skill {
  readonly metadata = userExperienceMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Design clear user flows with minimal steps",
        "Provide feedback for all user actions (loading, success, error)",
        "Use empty states to guide users",
        "Keep navigation predictable and consistent",
      ],
      bestPractices: [
        "Show skeleton loaders during data fetching",
        "Use toast notifications for non-critical messages",
      ],
      rules: [
        "Never leave users guessing about what happened",
        "Always provide a way to undo destructive actions",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "react", "nextjs", "node"].includes(projectType);
  }
}
```

---

## 6. Visual Design Skill

```ts
export const visualDesignMetadata: SkillMetadata = {
  id: "visual-design",
  name: "Visual Design",
  description: "Color theory, spacing, imagery, visual hierarchy",
  priority: 60,
  applicableProjectTypes: ["typescript", "react", "nextjs"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class VisualDesignSkill implements Skill {
  readonly metadata = visualDesignMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Establish clear visual hierarchy",
        "Use consistent spacing scale",
        "Limit color palette to primary, secondary, neutral, and semantic colors",
        "Ensure sufficient whitespace around elements",
      ],
      bestPractices: [
        "Use 8px grid system for spacing",
        "Test designs in grayscale first",
      ],
      rules: [
        "Do not use more than 3 font families",
        "Maintain consistent corner radius values",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "react", "nextjs"].includes(projectType);
  }
}
```

---

## 7. Registering UI/UX Skills

In `packages/skills/src/index.ts`:

```ts
export { ResponsiveDesignSkill, responsiveDesignMetadata } from "./built-in/responsive-design.js";
export { AccessibilitySkill, accessibilityMetadata } from "./built-in/accessibility.js";
export { DesignSystemSkill, designSystemMetadata } from "./built-in/design-system.js";
export { UserExperienceSkill, userExperienceMetadata } from "./built-in/user-experience.js";
export { VisualDesignSkill, visualDesignMetadata } from "./built-in/visual-design.js";

import { ResponsiveDesignSkill } from "./built-in/responsive-design.js";
import { AccessibilitySkill } from "./built-in/accessibility.js";
// ... etc

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new ResponsiveDesignSkill());
  registry.register(new AccessibilitySkill());
  registry.register(new DesignSystemSkill());
  registry.register(new UserExperienceSkill());
  registry.register(new VisualDesignSkill());
  return registry;
}
```

---

## 8. Using UI/UX Skills in Agents

```ts
import { createBuiltInSkillRegistry, resolveSkills } from "@devbyai/skills";

const registry = createBuiltInSkillRegistry();
const skills = resolveSkills(registry, "react");

// Access skill instructions
for (const skill of skills) {
  const instructions = skill.getInstructions();
  console.log(`Skill: ${skill.metadata.name}`);
  console.log(`Instructions: ${instructions.instructions.join(", ")}`);
}
```

---

## 9. Checklist

- [ ] Skill implements `Skill` interface
- [ ] `id` is unique (kebab-case)
- [ ] `priority` reflects importance (higher = more important)
- [ ] `applicableProjectTypes` lists supported project types
- [ ] `applicableAgentRoles` lists which agents should use it
- [ ] `getInstructions()` returns clear, actionable guidance
- [ ] `appliesTo()` correctly filters by project type
- [ ] Registered in `createBuiltInSkillRegistry()`
- [ ] Exported from `packages/skills/src/index.ts`
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes