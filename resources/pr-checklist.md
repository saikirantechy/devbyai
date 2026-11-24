# Pull Request Checklist

Before opening a PR, verify every item below.

---

## 🔍 Code Quality

- [ ] `pnpm lint` passes (Biome)
- [ ] `pnpm lint:fix` has been run to auto-format
- [ ] `pnpm typecheck` passes (TypeScript strict)
- [ ] `pnpm test` passes (Vitest)
- [ ] No `console.log` left in production code (unless intentional UI output)
- [ ] No unused imports or variables

---

## 📦 Package Standards

- [ ] New code follows the interface + class pattern
- [ ] Public API exported from `src/index.ts`
- [ ] Imports use `.js` extensions (ESM convention)
- [ ] No `any` types; use `unknown` or specific types
- [ ] Registry updated if adding a tool/provider/agent/skill/command
- [ ] `package.json` name uses `@devbyai/*` scope (for packages)

---

## 🧪 Testing

- [ ] New feature has unit tests in `src/__tests__/`
- [ ] Tests cover both success and failure paths
- [ ] Tests import with `.js` extension
- [ ] `pnpm test` passes for the affected package

---

## 📝 Commit & PR

- [ ] Commit message uses conventional format (`feat:`, `fix:`, `docs:`, etc.)
- [ ] PR title is clear and concise
- [ ] PR body describes what changed and why
- [ ] PR links the related issue (`Closes #123` or `Refs #123`)
- [ ] PR is focused on a single change
- [ ] Documentation updated if user-facing behavior changed

---

## 🚀 Final Steps

1. Push your branch to your fork.
2. Open the PR against `https://github.com/saikirantechy/devbyai.git` → `main`.
3. Respond to maintainer review feedback.
4. Once approved, a maintainer will merge it.
