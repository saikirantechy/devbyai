# Usage Limits & Free-Tier Strategy

A free coding platform needs a sustainable usage model. Otherwise, a small number of users could consume all available shared quota.

---

## Access Categories

| Feature | Shared free | BYOK | Local |
|---------|-------------|------|-------|
| AI chat | Limited | Provider quota | Device capacity |
| Code generation | Limited | Provider quota | Device capacity |
| Repository analysis | Limited | Provider quota | Device capacity |
| Coding agent | Limited tasks | Provider quota | Device capacity |
| Test execution | Controlled | Controlled | Local environment |

---

## Illustrative Free-Tier Limits

These are **starting values for testing**, not provider quotas or final product commitments:

| Limit | Value |
|-------|-------|
| AI requests per day per user | 20 |
| Coding agent tasks per day | 3 |
| Maximum concurrent agent tasks | 1 |
| BYOK requests | Provider limits |

Tune these based on actual cost and abuse data.

---

## Safeguards

- Per-user and per-IP rate limits.
- Daily token budgets.
- Maximum agent execution time.
- Maximum repository size.
- Request concurrency limits.
- Abuse detection.
- Provider quota monitoring.
- Explicit fallback behavior.

**Don't promise automatic fallback** to another provider unless the user has authorized that access mode. A user's own API key should not unexpectedly consume your shared quota, or vice versa.