# Development Environment Setup and Code Quality Tools

This document describes the setup and usage of development tools to ensure code quality and consistency in the DigiClick AI project.

## Git Hooks with Husky

We use [Husky](https://typicode.github.io/husky/) to manage Git hooks for pre-commit and commit message linting.

### Installing Husky Hooks

Run the following command to install Husky hooks:

```bash
npm run prepare
```

This will set up the Git hooks in the `.husky/` directory.

## Pre-commit Hooks with lint-staged

We use [lint-staged](https://github.com/okonet/lint-staged) to run linters and formatters on staged files before committing.

The pre-commit hook runs lint-staged, which executes:

- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting checks

## Commit Message Linting with Commitlint

We use [Commitlint](https://commitlint.js.org/) to enforce commit message conventions.

The commit-msg hook runs commitlint to validate commit messages against the configured rules.

## Code Formatting with Prettier

We use [Prettier](https://prettier.io/) for automatic code formatting.

Run the following command to format all files:

```bash
npm run format
```

To check formatting without applying changes:

```bash
npm run format:check
```

## Setting Up the Development Environment

1. Install dependencies:

```bash
npm install
```

2. Install Husky hooks:

```bash
npm run prepare
```

3. Make sure to write commit messages following the commitlint rules.

4. Use the pre-commit hooks to ensure code quality before committing.

## Additional Tools

- ESLint for linting JavaScript/TypeScript code.
- Stylelint for CSS linting.
- Jest and Cypress for testing.

## Troubleshooting

If hooks are not running, try reinstalling Husky hooks:

```bash
npx husky install
```

Or manually add hooks:

```bash
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"
```

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Prettier Documentation](https://prettier.io/)
