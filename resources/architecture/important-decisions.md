# Important Decisions Before Implementation

Align the architecture with your existing project instead of creating a disconnected second application.

## Decisions Needed

### 1. Existing Technology Stack
What frontend, backend, and database does DevByAI currently use?

### 2. Deployment
Will users access DevByAI through a hosted website, or do you also want a local developer application?

### 3. Coding Agent Experience
Should it behave like:
- A **chat assistant that edits files** (approval-based), or
- A **more autonomous agent** that plans, edits, tests, and reports results?

---

## Recommended Direction

1. **Hosted web application first.**
2. **Approval-based coding agent** (user reviews diffs before changes are applied).
3. **Local model support** as an additional option (Ollama, etc.).

---

## Next Steps

Once these decisions are made, convert the architecture into:

- Database schemas
- Provider interfaces
- API contracts
- Implementation tickets

---

## Optional: Weekly Model Tracking

I can monitor free coding-model releases, API availability, and provider free-tier changes weekly so you can keep DevByAI's model catalog up to date.