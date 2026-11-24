# Dev Skills for Building Apps, Websites & Web Apps

This guide maps the skills developers need to build modern applications — from frontend UIs to backend APIs, databases, and deployment — and maps them to DEVBYAI skills.

---

## 1. Full-Stack App Development Skill Map

| Layer | Skill | DEVBYAI Skill ID | Purpose |
|-------|-------|-----------------|---------|
| Frontend UI | HTML/CSS/JavaScript | `ui-ux-skills`, `responsive-design`, `visual-design` | Build interfaces |
| Frontend Framework | React / Next.js | `react`, `nextjs` | Component-based UIs |
| Styling | Tailwind CSS | `ui-ux-skills`, `code-formatting` | Utility-first styling |
| State Management | Zustand / Redux / Context | `react`, `nextjs` | Client state |
| Backend API | Node.js / Express / Fastify | `nodejs`, `api-docs` | Server logic |
| Database | PostgreSQL / MongoDB / SQLite | `nodejs`, `dependency-security` | Data storage |
| Authentication | OAuth / JWT / Sessions | `secure-coding`, `secret-management` | User auth |
| File Storage | AWS S3 / Cloudflare R2 | `secret-management` | Asset storage |
| Deployment | Vercel / Netlify / Docker | `file-structure`, `lint-config` | Hosting |
| Testing | Vitest / Jest / Playwright | `testing` | Test coverage |
| Linting | Biome / ESLint | `lint-config`, `code-formatting` | Code quality |

---

## 2. Website Development Skills

For static websites, marketing sites, and documentation sites:

```ts
export const websiteDevMetadata: SkillMetadata = {
  id: "website-dev",
  name: "Website Development",
  description: "Build static websites, marketing sites, and documentation sites",
  priority: 85,
  applicableProjectTypes: ["typescript", "react", "nextjs", "node"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class WebsiteDevSkill implements Skill {
  readonly metadata = websiteDevMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use semantic HTML5 elements",
        "Implement responsive breakpoints (mobile-first)",
        "Optimize images with WebP/AVIF formats",
        "Use semantic CSS or utility-first (Tailwind)",
        "Add meta tags for SEO and social sharing",
        "Ensure WCAG 2.1 AA accessibility compliance",
        "Preload critical resources",
        "Minimize render-blocking resources",
      ],
      bestPractices: [
        "Use CSS Grid and Flexbox for layouts",
        "Implement lazy loading for below-fold images",
        "Use a CDN for static assets",
      ],
      rules: [
        "Never use inline styles in production",
        "Always provide alt text for images",
        "Test on multiple browsers and devices",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "react", "nextjs", "node"].includes(projectType);
  }
}
```

---

## 3. Web Application Development Skills

For dynamic web apps with authentication, databases, and real-time features:

```ts
export const webAppDevMetadata: SkillMetadata = {
  id: "web-app-dev",
  name: "Web Application Development",
  description: "Build dynamic web applications with auth, databases, and APIs",
  priority: 90,
  applicableProjectTypes: ["typescript", "nextjs", "node"],
  applicableAgentRoles: ["builder", "reviewer", "planner"],
};

export class WebAppDevSkill implements Skill {
  readonly metadata = webAppDevMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use App Router (Next.js) or Route Handlers for API endpoints",
        "Implement server-side rendering for SEO-critical pages",
        "Use Client Components only when interactivity is needed",
        "Implement JWT or session-based authentication",
        "Validate all inputs with Zod or similar schema library",
        "Use parameterized queries to prevent SQL injection",
        "Implement rate limiting on API routes",
        "Add proper error boundaries and loading states",
      ],
      bestPractices: [
        "Use React Server Components by default",
        "Implement ISR for semi-static content",
        "Use environment variables for all secrets",
      ],
      rules: [
        "Never expose API keys in client-side code",
        "Always sanitize user-generated content",
        "Require HTTPS in production",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "nextjs", "node"].includes(projectType);
  }
}
```

---

## 4. Mobile App Development Skills

For React Native, Flutter, or cross-platform mobile apps:

```ts
export const mobileAppDevMetadata: SkillMetadata = {
  id: "mobile-app-dev",
  name: "Mobile App Development",
  description: "Build cross-platform mobile applications",
  priority: 75,
  applicableProjectTypes: ["typescript", "react", "node"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class MobileAppDevSkill implements Skill {
  readonly metadata = mobileAppDevMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Use React Native for cross-platform iOS/Android",
        "Implement platform-specific code when needed",
        "Optimize images for mobile screen densities",
        "Handle offline states gracefully",
        "Implement push notifications",
        "Use secure storage for tokens (Keychain/Keystore)",
      ],
      bestPractices: [
        "Use Expo for faster development",
        "Implement code push for OTA updates",
      ],
      rules: [
        "Test on physical devices, not just emulators",
        "Respect platform design guidelines (Human Interface / Material)",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "react", "node"].includes(projectType);
  }
}
```

---

## 5. Backend API Development Skills

```ts
export const backendApiDevMetadata: SkillMetadata = {
  id: "backend-api-dev",
  name: "Backend API Development",
  description: "Build REST/GraphQL APIs with authentication and databases",
  priority: 88,
  applicableProjectTypes: ["typescript", "node", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class BackendApiDevSkill implements Skill {
  readonly metadata = backendApiDevMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Design RESTful endpoints with proper HTTP methods",
        "Implement JWT or OAuth 2.0 authentication",
        "Validate all request bodies with schemas",
        "Use connection pooling for databases",
        "Implement pagination for list endpoints",
        "Add structured logging for all requests",
        "Implement graceful shutdown",
        "Use health check endpoints",
      ],
      bestPractices: [
        "Version your API (v1, v2)",
        "Use OpenAPI/Swagger for documentation",
        "Implement circuit breakers for external calls",
      ],
      rules: [
        "Never log passwords or tokens",
        "Always validate content-type headers",
        "Return consistent error response format",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node", "python", "go"].includes(projectType);
  }
}
```

---

## 6. Database Development Skills

```ts
export const databaseDevMetadata: SkillMetadata = {
  id: "database-dev",
  name: "Database Development",
  description: "Design schemas, write queries, manage migrations",
  priority: 82,
  applicableProjectTypes: ["typescript", "node", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class DatabaseDevSkill implements Skill {
  readonly metadata = databaseDevMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Normalize database schemas (3NF minimum)",
        "Add indexes on frequently queried columns",
        "Use parameterized queries to prevent SQL injection",
        "Implement connection pooling",
        "Use transactions for multi-table writes",
        "Create migration files for schema changes",
        "Add soft deletes instead of hard deletes",
      ],
      bestPractices: [
        "Use ORM (Prisma/Drizzle) for TypeScript projects",
        "Implement read replicas for read-heavy workloads",
        "Monitor slow query logs",
      ],
      rules: [
        "Never store passwords in plain text",
        "Do not expose raw database errors to clients",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node", "python", "go"].includes(projectType);
  }
}
```

---

## 6. Deployment & DevOps Skills

```ts
export const devopsDevMetadata: SkillMetadata = {
  id: "devops-dev",
  name: "DevOps & Deployment",
  description: "CI/CD, containerization, cloud deployment, monitoring",
  priority: 78,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer", "planner"],
};

export class DevOpsDevSkill implements Skill {
  readonly metadata = devopsDevMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Containerize applications with Docker",
        "Use multi-stage builds for smaller images",
        "Implement CI/CD pipelines (GitHub Actions)",
        "Set up environment-based configuration",
        "Implement health check endpoints",
        "Configure log aggregation",
        "Set up monitoring and alerting",
        "Implement blue-green or canary deployments",
      ],
      bestPractices: [
        "Use Docker Compose for local development",
        "Implement automated rollback on failure",
      ],
      rules: [
        "Never commit secrets to Docker images",
        "Always run security scans in CI",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 7. Registering App/Web Dev Skills

In `packages/skills/src/index.ts`:

```ts
export { WebsiteDevSkill, websiteDevMetadata } from "./built-in/website-dev.js";
export { WebAppDevSkill, webAppDevMetadata } from "./built-in/web-app-dev.js";
export { MobileAppDevSkill, mobileAppDevMetadata } from "./built-in/mobile-app-dev.js";
export { BackendApiDevSkill, backendApiDevMetadata } from "./built-in/backend-api-dev.js";
export { DatabaseDevSkill, databaseDevMetadata } from "./built-in/database-dev.js";
export { DevOpsDevSkill, devopsDevMetadata } from "./built-in/devops-dev.js";

import { WebsiteDevSkill } from "./built-in/website-dev.js";
import { WebAppDevSkill } from "./built-in/web-app-dev.js";
// ... etc

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new WebsiteDevSkill());
  registry.register(new WebAppDevSkill());
  registry.register(new MobileAppDevSkill());
  registry.register(new BackendApiDevSkill());
  registry.register(new DatabaseDevSkill());
  registry.register(new DevOpsDevSkill());
  return registry;
}
```

---

## 8. Checklist for App/Web Dev Skills

- [ ] Skill implements `Skill` interface
- [ ] `id` is unique (kebab-case)
- [ ] Instructions cover the full stack layer
- [ ] `applicableProjectTypes` lists relevant project types
- [ ] Registered in `createBuiltInSkillRegistry()`
- [ ] Exported from `packages/skills/src/index.ts`
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes
