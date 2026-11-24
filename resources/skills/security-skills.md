# Security Skills

Security skills help DEVBYAI agents identify vulnerabilities, enforce secure coding practices, and audit code for security issues.

---

## 1. Security Skill Categories

| Skill | ID | Purpose | Best For |
|-------|-----|---------|----------|
| Security Audit | `security-audit` | Vulnerability scanning, dependency checks | All projects |
| Secure Coding | `secure-coding` | Input validation, authentication, authorization | Application code |
| Secret Management | `secret-management` | API keys, environment variables, secrets | Configuration |
| Dependency Security | `dependency-security` | Vulnerable packages, outdated deps | All projects |
| OWASP Top 10 | `owasp-top-10` | Common web vulnerabilities | Web applications |
| Code Review Security | `code-review-security` | Security-focused code review | Pull requests |

---

## 2. Security Audit Skill

```ts
export const securityAuditMetadata: SkillMetadata = {
  id: "security-audit",
  name: "Security Audit",
  description: "Vulnerability scanning, dependency checks, and security assessment",
  priority: 90,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer", "builder"],
};

export class SecurityAuditSkill implements Skill {
  readonly metadata = securityAuditMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Scan dependencies for known vulnerabilities",
        "Check for exposed API keys or secrets in code",
        "Review authentication and authorization logic",
        "Validate all user inputs and outputs",
        "Check for insecure configurations",
      ],
      bestPractices: [
        "Run `npm audit` or `pnpm audit` regularly",
        "Use static analysis tools (SonarQube, Snyk)",
        "Schedule weekly security scans",
      ],
      rules: [
        "Never commit secrets to version control",
        "Block merges with critical vulnerabilities",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 3. Secure Coding Skill

```ts
export const secureCodingMetadata: SkillMetadata = {
  id: "secure-coding",
  name: "Secure Coding",
  description: "Input validation, authentication, authorization, output encoding",
  priority: 85,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class SecureCodingSkill implements Skill {
  readonly metadata = secureCodingMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Validate and sanitize all user inputs",
        "Use parameterized queries to prevent SQL injection",
        "Encode output to prevent XSS",
        "Implement proper authentication and authorization",
        "Use HTTPS for all external communications",
      ],
      bestPractices: [
        "Apply principle of least privilege",
        "Use Content Security Policy (CSP) headers",
        "Implement rate limiting on API endpoints",
      ],
      rules: [
        "Never trust client-side data",
        "Do not log sensitive information (passwords, tokens)",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 4. Secret Management Skill

```ts
export const secretManagementMetadata: SkillMetadata = {
  id: "secret-management",
  name: "Secret Management",
  description: "API keys, environment variables, secrets handling",
  priority: 90,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["builder", "reviewer"],
};

export class SecretManagementSkill implements Skill {
  readonly metadata = secretManagementMetadata;

  getInstructions(): SkillInstructions = {
    instructions: [
      "Store secrets in environment variables, never in code",
      "Use `.env.example` for template, never commit `.env`",
      "Rotate API keys regularly",
      "Use secret management services (AWS Secrets Manager, Vault)",
      "Encrypt secrets at rest and in transit",
    ],
    bestPractices: [
        "Use different secrets for development and production",
        "Audit secret access regularly",
    ],
    rules: [
        "Never hardcode API keys, tokens, or passwords",
        "Do not log secrets to console or files",
    ],
  };

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 5. Dependency Security Skill

```ts
export const dependencySecurityMetadata: SkillMetadata = {
  id: "dependency-security",
  name: "Dependency Security",
  description: "Vulnerable packages, outdated dependencies, supply chain security",
  priority: 80,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer", "builder"],
};

export class DependencySecuritySkill implements Skill {
  readonly metadata = dependencySecurityMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Run dependency audits regularly (`pnpm audit`)",
        "Keep dependencies updated to secure versions",
        "Remove unused dependencies",
        "Pin dependency versions in lockfiles",
        "Verify package integrity before installation",
      ],
      bestPractices: [
        "Use `pnpm audit --fix` for automatic fixes",
        "Subscribe to security advisories for critical packages",
      ],
      rules: [
        "Do not install packages from unverified sources",
        "Block builds with critical vulnerabilities",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 6. OWASP Top 10 Skill

```ts
export const owaspTop10Metadata: SkillMetadata = {
  id: "owasp-top-10",
  name: "OWASP Top 10",
  description: "Common web vulnerabilities: injection, broken auth, XSS, etc.",
  priority: 75,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs"],
  applicableAgentRoles: ["reviewer", "builder"],
};

export class OWASPTop10Skill implements Skill {
  readonly metadata = owaspTop10Metadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "A1: Broken Access Control — enforce authorization checks",
        "A2: Cryptographic Failures — use strong encryption",
        "A3: Injection — parameterize all queries",
        "A4: Insecure Design — threat model early",
        "A5: Security Misconfiguration — harden defaults",
        "A6: Vulnerable Components — audit dependencies",
        "A7: Authentication Failures — implement MFA, strong passwords",
        "A8: Software Integrity — verify software sources",
        "A9: Logging Failures — log security events",
        "A10: SSRF — validate remote resource requests",
      ],
      bestPractices: [
        "Use OWASP Dependency-Check",
        "Implement security headers",
      ],
      rules: [
        "Address all OWASP Top 10 items before production",
        "Review OWASP compliance quarterly",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return ["typescript", "node", "react", "nextjs"].includes(projectType);
  }
}
```

---

## 7. Code Review Security Skill

```ts
export const codeReviewSecurityMetadata: SkillMetadata = {
  id: "code-review-security",
  name: "Code Review Security",
  description: "Security-focused code review checklist and guidelines",
  priority: 85,
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer"],
};

export class CodeReviewSecuritySkill implements Skill {
  readonly metadata = codeReviewSecurityMetadata;

  getInstructions(): SkillInstructions {
    return {
      instructions: [
        "Check for hardcoded secrets and credentials",
        "Verify input validation on all entry points",
        "Review authentication and authorization logic",
        "Check for insecure dependencies",
        "Verify error handling doesn't leak information",
      ],
      bestPractices: [
        "Use security review checklist for every PR",
        "Require security approval for auth-related changes",
      ],
      rules: [
        "Block PRs with critical security issues",
        "Document security decisions in PR description",
      ],
    };
  }

  appliesTo(projectType: string): boolean {
    return true;
  }
}
```

---

## 8. Registering Security Skills

In `packages/skills/src/index.ts`:

```ts
export { SecurityAuditSkill, securityAuditMetadata } from "./built-in/security-audit.js";
export { SecureCodingSkill, secureCodingMetadata } from "./built-in/secure-coding.js";
export { SecretManagementSkill, secretManagementMetadata } from "./built-in/secret-management.js";
export { DependencySecuritySkill, dependencySecurityMetadata } from "./built-in/dependency-security.js";
export { OWASPTop10Skill, owaspTop10Metadata } from "./built-in/owasp-top-10.js";
export { CodeReviewSecuritySkill, codeReviewSecurityMetadata } from "./built-in/code-review-security.js";

import { SecurityAuditSkill } from "./built-in/security-audit.js";
// ... etc

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new SecurityAuditSkill());
  registry.register(new SecureCodingSkill());
  registry.register(new SecretManagementSkill());
  registry.register(new DependencySecuritySkill());
  registry.register(new OWASPTop10Skill());
  registry.register(new CodeReviewSecuritySkill());
  return registry;
}
```

---

## 9. Checklist

- [ ] Skill implements `Skill` interface
- [ ] `id` is unique (kebab-case)
- [ ] Security guidance aligns with OWASP/industry standards
- [ ] `applicableProjectTypes` covers relevant project types
- [ ] Registered in `createBuiltInSkillRegistry()`
- [ ] Exported from `packages/skills/src/index.ts`
- [ ] Tests in `src/__tests__/`
- [ ] `pnpm --filter @devbyai/skills lint && typecheck && test` passes