# High-Level Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend – DevByAI Web App                   │
│  Dashboard · AI Chat · Code Editor · Model Hub · GitHub         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API                                    │
│  Authentication · Authorization · Sessions · Project Management   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Gateway                                   │
│          Provider routing and quotas                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Agent Orchestrator                               │
│              Tools and coding workflows                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Repository Service                               │
│                    Files and code context                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Usage Service                                  │
│                  Limits and tracking                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               Provider Adapter Layer                              │
│  Common interface for different model APIs                        │
│                                                                   │
│   Gemini · Groq · OpenRouter · Ollama · Other providers           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Principle

The frontend should **never** communicate directly with shared provider credentials. All model requests go through the backend.

---

## Six Major Modules

| Module | Responsibility |
|--------|----------------|
| AI Model Hub | Model discovery, selection, and provider integration |
| AI Gateway | Shared access, BYOK, routing, and quotas |
| Coding Workspace | Code editor, file explorer, and diffs |
| Coding Agent | Repository analysis, file changes, and test execution |
| GitHub Integration | Repository access, issues, branches, and pull requests |
| Usage Dashboard | User limits, provider usage, and request history |