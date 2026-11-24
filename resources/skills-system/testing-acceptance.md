# Testing and Acceptance Criteria

Before considering the system complete, establish measurable acceptance criteria.

---

## Acceptance Criteria

| Area | Acceptance Criterion |
|------|---------------------|
| Format compatibility | Valid supported `SKILL.md` packages import correctly |
| Registry | Published versions cannot be silently overwritten |
| Loader | Only authorized and validated versions load |
| Discovery | Relevant skills rank above unrelated skills in test cases |
| Context | Only selected instructions and references are loaded |
| Agent | Skills work with compatible models from different providers |
| Permissions | A skill cannot grant itself capabilities |
| Isolation | One user's skills and workspaces cannot access another's |
| Marketplace | Publisher ownership and moderation are enforced |
| Audit | Skill activation and permission events are recorded |

---

## Benchmark Tasks

Run each task with and without the relevant skill. Measure correctness, test success, unnecessary tool calls, latency, and token usage:

1. Create a React component
2. Build a Next.js page
3. Create a REST API
4. Design a database schema
5. Fix a TypeScript error
6. Write unit tests
7. Review a GitHub pull request
8. Debug a failing application

This tells you whether the skill genuinely improves the agent instead of just adding more prompt text.