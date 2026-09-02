# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in DEVBYAI, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email security@devbyai.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Principles

DEVBYAI is designed with security in mind:

- **User-controlled permissions** — Never execute dangerous operations without consent
- **No API key exposure** — Keys are stored securely, never logged
- **No silent command execution** — All terminal commands require user awareness
- **Read-only by default** — File modifications require explicit permission

## Validation & Debugging Security

- **Sensitive output protection**: Validation output is truncated to safe limits (5KB per failure record)
- **No secrets in failure memory**: Failure records do not persist environment variables, API keys, or tokens
- **Safe file exclusion**: The File Index excludes sensitive files (.env, .pem, .key, credentials) from all intelligence systems
- **Command safety**: The Command Runner Tool respects workspace boundaries and permission settings
- **Failure retention limits**: Maximum 20 failure records are retained to prevent unbounded storage growth
