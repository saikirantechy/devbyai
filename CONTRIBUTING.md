# Contributing to DEVBYAI

Thank you for your interest in contributing to DEVBYAI!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Make your changes
6. Run checks: `pnpm lint && pnpm typecheck && pnpm test`
7. Commit and push
8. Open a Pull Request

## Development Setup

```bash
pnpm install    # Install all dependencies
pnpm build      # Build all packages
pnpm lint       # Run linter
pnpm typecheck  # Type check
pnpm test       # Run tests
```

## Code Style

- TypeScript with strict mode
- Biome for linting and formatting
- Prefer named exports
- Keep functions small and focused
- Write meaningful comments

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include a clear description
- Add tests for new features
- Ensure all checks pass
- Follow the existing code style

## Issues

- Use GitHub Issues for bug reports and feature requests
- Provide as much detail as possible
- Include reproduction steps for bugs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
