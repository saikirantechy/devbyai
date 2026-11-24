# Backend Services & Database Design

You don't need microservices immediately. Start with a **modular monolith**: one backend application with clearly separated modules. This keeps development and deployment simpler.

---

## Project Structure

```
devbyai/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── features/
│   │   ├── ai-chat/
│   │   ├── model-hub/
│   │   ├── code-editor/
│   │   ├── coding-agent/
│   │   └── github/
│   └── services/
│
├── backend/
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── github/
│   ├── ai-gateway/
│   ├── providers/
│   ├── agent/
│   ├── sandbox/
│   ├── usage/
│   └── database/
│
├── shared/
│   ├── types/
│   └── schemas/
│
├── tests/
└── docs/
```

---

## Database Tables

| Table | Important information |
|-------|----------------------|
| `users` | Account details |
| `projects` | User projects and repository references |
| `github_connections` | GitHub connection metadata |
| `ai_providers` | Supported provider information |
| `ai_models` | Model catalog |
| `user_api_keys` | **Encrypted** provider credentials |
| `chat_sessions` | Chat session metadata |
| `chat_messages` | Conversation history |
| `agent_tasks` | Agent task status and execution |
| `agent_tool_calls` | Tool execution records |
| `usage_records` | Token and request usage |
| `user_quotas` | Shared access limits |

**Never store raw API keys** in `user_api_keys`. Store encrypted credentials and minimum metadata.

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/ai/chat` | Send a chat message |
| `POST /api/ai/stream` | Stream AI responses |
| `GET /api/ai/models` | List available models |
| `GET /api/ai/providers` | List available providers |
| `POST /api/keys` | Add a provider API key |
| `GET /api/keys` | List user's keys (metadata only) |
| `DELETE /api/keys/:id` | Remove a provider key |
| `GET /api/usage` | View usage statistics |
| `GET /api/usage/limits` | View remaining quotas |
| `POST /api/projects/import` | Import a GitHub repository |
| `GET /api/projects/:id/files` | List project files |
| `GET /api/projects/:id/file` | Read a specific file |
| `POST /api/agent/tasks` | Create an agent task |
| `GET /api/agent/tasks/:id` | Get task status |
| `POST /api/agent/tasks/:id/approve` | Approve agent changes |
| `POST /api/agent/tasks/:id/cancel` | Cancel an agent task |
| `GET /api/github/issues` | List GitHub issues |
| `POST /api/github/pull-requests` | Create a pull request |

These are proposed contracts — adjust them to match your existing backend framework.