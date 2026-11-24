# Skill Installation — Required Skills per Tool

This guide maps DEVBYAI tools to the skills they require, so users and contributors know which skills to install or enable for their tools to work effectively.

---

## 1. Tool → Skill Mapping

| Tool | Required Skills | Recommended Skills | Why |
|------|----------------|-------------------|-----|
| `read_file` | None | `code-comments` | Read file contents; comments help explain what was read |
| `write_file` | `code-formatting`, `naming-conventions` | `file-structure`, `secure-coding` | Write files with proper format, names, and security |
| `list_directory` | None | `file-structure` | List directory contents |
| `search_files` | None | `code-comments` | Search for patterns in files |
| `command_runner` | `secure-coding` | `security-audit` | Run commands safely with validation |
| `edit_file` | `code-formatting`, `naming-conventions` | `secure-coding`, `file-structure` | Edit files with consistent style |
| `create_file` | `code-formatting`, `naming-conventions` | `file-structure`, `secure-coding` | Create new files properly |
| `delete_file` | `secure-coding` | `security-audit` | Delete files with approval and security checks |

---

## 2. Install Required Skills

Skills are built into `@devbyai/skills`. No separate npm installation is needed — they are registered via `createBuiltInSkillRegistry()`.

### Step 1: Verify skills package is installed

```bash
# In your project
pnpm add @devbyai/skills
```

### Step 2: Create skill registry with required skills

```ts
import { createBuiltInSkillRegistry } from "@devbyai/skills";

const registry = createBuiltInSkillRegistry();
```

This registers all built-in skills including:
- TypeScript, Node.js, React, Next.js, Python (dev skills)
- Responsive Design, Accessibility, Design System (UI/UX skills)
- API Docs, README, Contribution Guide (doc skills)
- Code Formatting, Import Organization, Naming Conventions (format skills)
- Security Audit, Secure Coding, Secret Management (security skills)

### Step 3: Resolve skills for your project type

```ts
import { resolveSkills } from "@devbyai/skills";

const activeSkills = resolveSkills(registry, "typescript");
// Returns skills applicable to TypeScript projects
```

### Step 4: Use skills in your agent/tools

```ts
const skill = registry.get("code-formatting");
if (skill && skill.appliesTo("typescript")) {
  const instructions = skill.getInstructions();
  console.log(instructions.instructions);
}
```

---

## 3. Required Skills by Project Type

### TypeScript / Node.js Project

**Required:**
- `typescript` — TypeScript best practices
- `code-formatting` — Consistent formatting
- `naming-conventions` — Naming standards
- `secure-coding` — Secure coding practices

**Recommended:**
- `nodejs` — Node.js runtime knowledge
- `file-structure` — Project organization
- `lint-config` — Biome linting
- `security-audit` — Vulnerability scanning

### React / Next.js Frontend

**Required:**
- `react` or `nextjs` — Framework knowledge
- `code-formatting` — Consistent formatting
- `accessibility` — a11y compliance
- `responsive-design` — Mobile layouts

**Recommended:**
- `design-system` — Component consistency
- `user-experience` — UX best practices
- `secure-coding` — XSS/CSRF prevention
- `api-docs` — API documentation

### Python Project

**Required:**
- `python` — Python best practices
- `code-formatting` — Consistent formatting
- `secure-coding` — Secure coding

**Recommended:**
- `dependency-security` — Package auditing
- `api-docs` — API documentation

### Go Project

**Required:**
- `go` — Go best practices
- `code-formatting` — Consistent formatting
- `secure-coding` — Secure coding

**Recommended:**
- `dependency-security` — Package auditing
- `api-docs` — API documentation

---

## 4. Skill Installation Script

Create `scripts/install-skills.mjs` to auto-install skills based on project type:

```js
import { createBuiltInSkillRegistry } from "@devbyai/skills";

const PROJECT_TYPE = process.argv[2] || "typescript";

const registry = createBuiltInSkillRegistry();
const skills = registry.list();

console.log(`Skills available for ${PROJECT_TYPE}:`);
for (const skill of skills) {
  if (skill.appliesTo(PROJECT_TYPE)) {
    console.log(`  ✓ ${skill.metadata.id} (priority: ${skill.metadata.priority})`);
  }
}
```

Run:

```bash
node scripts/install-skills.mjs typescript
```

---

## 5. Skill Priority for Tool Selection

When multiple skills apply, higher priority skills are consulted first:

| Priority Range | Skill Type | Example |
|---------------|------------|---------|
| 90+ | Critical | `security-audit`, `readme-guide`, `typescript` |
| 80-89 | Important | `secure-coding`, `secret-management`, `react` |
| 70-79 | Standard | `naming-conventions`, `api-docs`, `nodejs` |
| 60-69 | Optional | `changelog`, `visual-design`, `lint-config` |

---

## 6. Checklist for Tool-Skill Setup

- [ ] Identify your project type (typescript, node, react, nextjs, python, go)
- [ ] Install `@devbyai/skills` package
- [ ] Create skill registry with `createBuiltInSkillRegistry()`
- [ ] Resolve skills for your project type with `resolveSkills()`
- [ ] Map each tool to its required skills
- [ ] Configure tool approval based on skill recommendations
- [ ] Run `pnpm --filter @devbyai/skills lint && typecheck && test`
- [ ] Document which skills your project uses in `devbyai.json` or README

---

## 7. Example devbyai.json with Skill Configuration

```json
{
  "provider": "mock",
  "model": "mock",
  "skills": {
    "enabled": ["typescript", "code-formatting", "secure-coding", "security-audit"],
    "disabled": [],
    "priority": {
      "security-audit": 100,
      "secure-coding": 90
    }
  },
  "permissions": {
    "write": "ask",
    "execute": "ask",
    "network": "ask"
  }
}
```
