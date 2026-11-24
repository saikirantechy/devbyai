# Coding Agent Architecture

This is where DevByAI becomes more than a normal AI chat application — the coding agent can understand a project and make controlled changes to it.

---

## Coding Agent Workflow

1. **User opens a project** — Import a GitHub repository or create a local workspace.
2. **Repository indexing** — Read relevant files, project configuration, README, and directory structure.
3. **Task understanding** — User asks: "Fix the login bug and add a test."
4. **Agent planning** — Identify relevant files, formulate an implementation plan, and select tools.
5. **Tool execution** — Read files, edit files, inspect diffs, and run approved tests.
6. **Review and approval** — Show the changes and ask the user to approve or reject them.
7. **Final result** — Explain changes, show test results, and optionally prepare a Git commit or pull request.

---

## Agent Tools

Give the agent a controlled set of tools:

| Tool | Function |
|------|----------|
| `list_files` | Explore project structure |
| `read_file` | Read source files |
| `search_code` | Search for functions and symbols |
| `edit_file` | Propose or apply file changes |
| `create_file` | Create new files |
| `delete_file` | Delete files with approval |
| `run_tests` | Execute configured tests |
| `run_linter` | Run linting checks |
| `get_git_diff` | Inspect proposed changes |
| `git_status` | Check repository changes |

**Do not let the model execute arbitrary commands directly on your application server.**

---

## Safe Execution Design

This part is essential. Run code in isolated, short-lived workspaces or containers:

- Separate each user's workspace.
- Set CPU, memory, disk, and execution-time limits.
- Disable outbound network access by default.
- Allowlist permitted commands.
- Do not mount application secrets into coding containers.
- Require approval for destructive actions and sensitive operations.
- Capture logs and test output.
- Keep a recoverable version of the original files.

**MVP approach:** Start with read-only repository exploration, then introduce controlled editing and test execution.