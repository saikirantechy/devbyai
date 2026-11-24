# Security Review Skill

Security-focused code review for DEVBYAI agents. Identifies vulnerabilities, secrets, injection risks, and authentication issues.

---

## 1. Skill Metadata

```ts
export const securityReviewMetadata: CodeReviewMetadata = {
  id: "security-review",
  name: "Security Review",
  description: "Security-focused code review: vulnerabilities, secrets, injection, authentication",
  priority: 95,
  reviewDimensions: ["security"],
  applicableProjectTypes: ["typescript", "node", "react", "nextjs", "python", "go"],
  applicableAgentRoles: ["reviewer", "security-auditor"],
};
```

---

## 2. Security Review Instructions

```ts
export class SecurityReviewSkill implements CodeReviewSkill {
  readonly metadata = securityReviewMetadata;

  async review(files: string[], context: ReviewContext): Promise<CodeReviewResult[]> {
    const results: CodeReviewResult[] = [];

    for (const file of files) {
      // Check for hardcoded secrets
      const secretResults = await this.checkHardcodedSecrets(file);
      results.push(...secretResults);

      // Check for injection vulnerabilities
      const injectionResults = await this.checkInjectionVulnerabilities(file);
      results.push(...injectionResults);

      // Check authentication and authorization
      const authResults = await this.checkAuthentication(file);
      results.push(...authResults);

      // Check for exposed error details
      const errorResults = await this.checkErrorHandling(file);
      results.push(...errorResults);
    }

    return results;
  }

  private async checkHardcodedSecrets(file: string): Promise<CodeReviewResult[]> {
    // Search for API keys, passwords, tokens in source
    return [];
  }

  private async checkInjectionVulnerabilities(file: string): Promise<CodeReviewResult[]> {
    // Check for SQL injection, command injection, XSS
    return [];
  }

  private async checkAuthentication(file: string): Promise<CodeReviewResult[]> {
    // Verify auth checks on sensitive endpoints
    return [];
  }

  private async checkErrorHandling(file: string): Promise<CodeReviewResult[]> {
    // Ensure errors don't leak stack traces or secrets
    return [];
  }

  getReviewChecklist(dimension: "security"): string[] {
    return [
      "No hardcoded API keys, passwords, or tokens",
      "All user inputs validated and sanitized",
      "Parameterized queries used for database operations",
      "Authentication checks on all sensitive endpoints",
      "Authorization checks for resource access",
      "Error messages don't expose internal details",
      "Secrets stored in environment variables, not code",
      "HTTPS enforced for all external communications",
      "Rate limiting on authentication endpoints",
      "CSRF protection for state-changing operations",
    ];
  }
}
```

---

## 3. Security Review Checklist

| Item | Severity | Description |
|------|----------|-------------|
| No hardcoded secrets | `critical` | API keys, passwords, tokens must be in env vars |
| Input validation | `high` | All user inputs validated and sanitized |
| SQL injection prevention | `critical` | Parameterized queries only |
| XSS prevention | `high` | Output encoded, CSP headers |
| Authentication | `high` | Auth checks on all protected routes |
| Authorization | `high` | Resource-level access control |
| Error handling | `medium` | No stack traces or secrets in errors |
| Dependency vulnerabilities | `high` | `pnpm audit` passes with no critical issues |
| Secure headers | `medium` | CSP, HSTS, X-Content-Type-Options |
| Rate limiting | `medium` | Auth and API endpoints rate-limited |

---

## 4. Tool Support

Security review uses these tools:

| Tool | Purpose |
|------|---------|
| `search_files` | Search for secrets, patterns, vulnerabilities |
| `read_file` | Read source files for detailed analysis |
| `security-audit` | Run vulnerability scanning |
| `run_linter` | Check for security-related lint rules |

Example tool usage:

```ts
const secrets = await tools.search_files({
  pattern: "(api[_-]?key|secret|password|token)\\s*[:=]\\s*[\"'][^\"']+[\"']",
  directory: "src/",
});
```

---

## 5. Registering the Skill

```ts
export { SecurityReviewSkill, securityReviewMetadata } from "./built-in/security-review.js";

import { SecurityReviewSkill } from "./built-in/security-review.js";

export function createBuiltInSkillRegistry(): SkillRegistry {
  const registry = new SkillRegistry();
  registry.register(new TypeScriptSkill());
  registry.register(new SecurityReviewSkill());
  return registry;
}
```
