# Git Workflow for Contributors

DEVBYAI is hosted at https://github.com/saikirantechy/devbyai.git. All contributions go through fork → branch → pull request.

---

## 1. One-Time Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/devbyai.git
cd devbyai

# Add upstream (original repo)
git remote add upstream https://github.com/saikirantechy/devbyai.git

# Verify remotes
git remote -v
```

---

## 2. Before You Start Work

Always sync with upstream first:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 3. Create a Feature Branch

Never commit directly to `main`.

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
# or for docs:
git checkout -b docs/readme-improvements
```

Branch naming convention: `<type>/<short-description>` using kebab-case.

---

## 4. Make Changes & Commit

```bash
# Stage and commit
git add .
git commit -m "feat: add read_file tool"

# Conventional commit prefixes:
# feat:     new feature
# fix:      bug fix
# docs:     documentation
# test:     tests
# refactor: code refactor
# style:    formatting
# chore:    maintenance
```

---

## 5. Push & Open a PR

```bash
git push origin feature/your-feature-name
```

Then go to https://github.com/saikirantechy/devbyai.git and click **Compare & pull request**.

- Base: `main` (upstream)
- Compare: your feature branch
- Title: match your commit message
- Body: describe what changed and why; link the issue (`Closes #123`)

---

## 6. Keep Your Branch Updated

If upstream moves forward while you're working:

```bash
git fetch upstream
git merge upstream/main
# resolve any conflicts, then
git push origin feature/your-feature-name
```

---

## 7. After Your PR Is Merged

```bash
git checkout main
git pull upstream main
git push origin main
```

---

## Useful Commands

```bash
git status            # see changed files
git log --oneline -5  # recent commits
git branch -a         # list all branches
```
