# Technical Boundaries — Skills System

Keep these modules separate in your backend:

```
backend/
├── skills/
│   ├── registry/
│   ├── formats/
│   │   ├── agentskills/
│   │   └── devbyai/
│   ├── parser/
│   ├── validator/
│   ├── loader/
│   ├── discovery/
│   ├── versioning/
│   ├── marketplace/
│   └── permissions/
│
├── agents/
│   ├── orchestrator/
│   ├── planner/
│   ├── context-composer/
│   ├── model-router/
│   └── tool-executor/
│
├── security/
│   ├── sandbox/
│   ├── policy-engine/
│   ├── secret-manager/
│   └── audit/
│
└── github/
```

---

## Boundary Rules

| Rule | Description |
|------|-------------|
| Skills module does not execute code | It only loads and validates instructions |
| Agent module does not bypass permission gateway | All tool calls go through authorization |
| Marketplace module does not publish without validation | Every package is scanned before publication |

That separation will make future maintenance much easier.