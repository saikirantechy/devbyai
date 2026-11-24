# DevByAI Architecture — AI Coding Platform

This folder contains the architectural vision for DevByAI as a **multi-provider AI coding platform with an integrated coding agent**.

---

## 📑 Contents

| File | Description |
|------|-------------|
| [`product-vision.md`](product-vision.md) | Product vision and positioning |
| [`high-level-architecture.md`](high-level-architecture.md) | System architecture overview |
| [`ai-model-hub.md`](ai-model-hub.md) | Model hub, provider adapters, shared access & BYOK |
| [`coding-agent.md`](coding-agent.md) | Coding agent workflow, tools, and safe execution |
| [`github-integration.md`](github-integration.md) | GitHub integration for open-source contributions |
| [`backend-services.md`](backend-services.md) | Backend services, database, and API design |
| [`technology-stack.md`](technology-stack.md) | Recommended technology choices |
| [`roadmap.md`](roadmap.md) | Phased development roadmap |
| [`usage-limits.md`](usage-limits.md) | Free-tier limits and usage strategy |
| [`testing-strategy.md`](testing-strategy.md) | Testing strategy and security |
| [`important-decisions.md`](important-decisions.md) | Key decisions before implementation |

---

## 🎯 Summary

DevByAI is designed as a **multi-provider AI coding platform** supporting two access modes:

1. **Shared free access** — Platform-managed provider accounts within controlled free-tier limits.
2. **Bring Your Own Key (BYOK)** — Users connect their own API keys using individual quotas.

The AI coding experience is separated from model providers, so models can be added, removed, or replaced without rebuilding the application.

Six major modules:

| Module | Responsibility |
|--------|----------------|
| AI Model Hub | Model discovery, selection, and provider integration |
| AI Gateway | Shared access, BYOK, routing, and quotas |
| Coding Workspace | Code editor, file explorer, and diffs |
| Coding Agent | Repository analysis, file changes, and test execution |
| GitHub Integration | Repository access, issues, branches, and pull requests |
| Usage Dashboard | User limits, provider usage, and request history |

---

## ⚠️ Important Safeguards

- Encrypt user API keys at rest.
- Never return full API keys to the frontend.
- Never write secrets into logs or error messages.
- Allow users to revoke and replace keys.
- Do not silently switch from BYOK to shared access.
- Run code execution in isolated, short-lived workspaces.
- Require approval for destructive actions.

See [`important-decisions.md`](important-decisions.md) for alignment questions before implementation.