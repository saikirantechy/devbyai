# Contributing to DEVBYAI

Thank you for your interest in contributing to DEVBYAI! 🎉

DEVBYAI is a free and open-source AI-powered development agent built for your terminal. Contributions of all sizes are welcome — from documentation tweaks to new features.

This guide walks you through the entire contribution process, from setting up your environment to getting your pull request merged.

---

## 1. Before You Start

- Read the [Code of Conduct](code-of-conduct.md). All contributors are expected to follow it.
- Check existing [GitHub Issues](https://github.com/saikirantechy/devbyai/issues) to see if your idea or bug is already being discussed.
- If you're unsure where to start, look at the [Good First Issues](good-first-issues.md) list.

---

## 2. Getting Started (Step by Step)

### Step 1: Fork the repository

1. Go to the [DEVBYAI repository](https://github.com/saikirantechy/devbyai).
2. Click the **Fork** button in the top-right corner.
3. Select your GitHub account as the destination.

### Step 2: Clone your fork

```bash
git clone https://github.com/YOUR-USERNAME/devbyai.git
cd devbyai
```

### Step 3: Add the upstream remote

```bash
git remote add upstream https://github.com/saikirantechy/devbyai.git
```

This lets you sync your fork with the original project later.

### Step 4: Install dependencies

DEVBYAI uses [pnpm](https://pnpm.io/). Install dependencies:

```bash
pnpm install
```

### Step 5: Create a feature branch

Always create a new branch for your work. Never commit directly to `main`.

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
```

### Step 6: Make your changes

Write code, add tests, update documentation — whatever your contribution involves.

### Step 7: Run checks

Before committing, make sure everything passes:

```bash
pnpm lint       # Lint and format (Biome)
pnpm typecheck  # TypeScript type checking
pnpm test       # Run the test suite
```

### Step 8: Commit your changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add example feature"
```

### Step 9: Push to your fork

```bash
git push origin feature/your-feature-name
```

### Step 10: Open a Pull Request

1. Go to your fork on GitHub.
2. Click **Compare & pull request**.
3. Select `main` (base) ← your feature branch (compare).
4. Write a clear title and description.
5. Submit the PR.

A maintainer will review your PR and may request changes. Be patient and responsive!

---

## 3. Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run Biome linter and formatter |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run all tests with Vitest |
| `pnpm dev` | Run DEVBYAI locally |

---

## 4. Code Style

DEVBYAI uses **TypeScript** with strict mode and **Biome** for linting and formatting.

- Prefer **named exports** over default exports.
- Keep functions **small and focused**.
- Write **meaningful comments** for complex logic.
- Follow the existing file structure and naming conventions.
- Add tests for new features.

Run `pnpm lint --write` to auto-format your code before committing.

---

## 5. Pull Request Guidelines

- Keep PRs **focused on a single change**.
- Include a **clear description** of what changed and why.
- Add **tests** for new features or bug fixes.
- Ensure **all checks pass** (lint, typecheck, test).
- Link any related issue using `Closes #issue-number` or `Refs #issue-number`.

---

## 6. Issues

Use [GitHub Issues](https://github.com/saikirantechy/devbyai/issues) for:

- 🐛 Bug reports (include reproduction steps)
- ✨ Feature requests
- ❓ Questions about the codebase

When reporting a bug, include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your environment (OS, Node version, pnpm version)

---

## 7. License

By contributing to DEVBYAI, you agree that your contributions will be licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Need Help?

- Open a [Discussion](https://github.com/saikirantechy/devbyai/discussions) for questions.
- Tag a maintainer if your PR needs urgent review.
- Check the [Reading Resources](reading-resources.md) for open-source best practices.