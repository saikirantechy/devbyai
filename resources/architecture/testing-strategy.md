# Testing Strategy

Before releasing publicly, test these scenarios:

| Test | Expected result |
|------|-----------------|
| Provider is unavailable | Clear error or permitted fallback |
| Shared quota is exhausted | Explain when access may reset |
| BYOK key is invalid | Show a safe connection error |
| User cancels an agent | Stop its execution |
| Agent proposes a file edit | Display a reviewable diff |
| Agent executes malicious code | Sandbox prevents unauthorized access |
| GitHub token expires | Ask the user to reconnect |
| Model doesn't support tools | Prevent incompatible agent execution |
| Two users edit separate projects | No cross-user file access |

**Release blockers:** Isolation and credential security are release blockers, not optional improvements.