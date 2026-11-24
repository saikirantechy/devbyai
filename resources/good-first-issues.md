# Good First Issues

Looking for your first contribution to DEVBYAI? This page helps you find beginner-friendly issues and choose one that matches your interests.

---

## What Makes a "Good First Issue"?

Good first issues are:

- ✅ Well-scoped and clearly described
- ✅ Low risk (won't break core functionality if done imperfectly)
- ✅ Good for learning the codebase
- ✅ Labeled `good first issue` or `help wanted` on GitHub

---

## How to Find Good First Issues

1. Visit the [DEVBYAI Issues page](https://github.com/saikirantechy/devbyai/issues).
2. Filter by labels:
   - `good first issue`
   - `help wanted`
   - `documentation`
3. Look for issues that say "good for first contribution" or similar.
4. Comment on the issue to let others know you're working on it:  
   > "I'd like to work on this. Is it still available?"

---

## Suggested Starter Contributions

If no issues are labeled yet, here are types of contributions that are usually great for beginners:

### Documentation
- Fix typos or unclear wording in READMEs and docs
- Add missing examples to command documentation
- Improve the getting-started guide

### Tests
- Add unit tests for uncovered functions
- Fix flaky or broken tests

### Code
- Fix small bugs in CLI commands
- Improve error messages
- Refactor repetitive code patterns

### Developer Experience
- Improve contributor onboarding docs
- Add missing scripts to `package.json`

---

## How to Claim an Issue

1. Comment on the issue asking if it's still open for contributors.
2. Wait for a maintainer to assign it to you (or just start if it's unassigned).
3. Create a branch: `git checkout -b fix/issue-short-description`
4. Work on the fix and open a PR linking the issue: `Closes #issue-number`

---

## Tips for First-Time Contributors

- **Start small.** A one-line doc fix is a perfectly valid first PR.
- **Ask questions.** If something is unclear, ask in the issue or Discussions.
- **Be patient.** Maintainers are volunteers and may take time to review.
- **Respond to feedback.** PR reviews often request changes — that's normal!

---

## Example First PR Workflow

```bash
# 1. Fork and clone
git clone https://github.com/YOUR-USERNAME/devbyai.git
cd devbyai

# 2. Install and sync
pnpm install
git remote add upstream https://github.com/saikirantechy/devbyai.git
git fetch upstream
git checkout main
git merge upstream/main

# 3. Create branch
git checkout -b docs/fix-readme-typo

# 4. Make changes, run checks
pnpm lint --write
pnpm test

# 5. Commit and push
git add .
git commit -m "docs: fix typo in README installation section"
git push origin docs/fix-readme-typo

# 6. Open PR on GitHub
```

---

## Where to Ask for Help

- [GitHub Discussions](https://github.com/saikirantechy/devbyai/discussions) — general questions
- Issue comments — specific to an issue
- [Reading Resources](reading-resources.md) — open-source guides

Happy contributing! 🎉