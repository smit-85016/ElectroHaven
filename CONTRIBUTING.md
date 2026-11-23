# Contributing to ElectroHaven

Thank you for your interest in contributing to **ElectroHaven**! We welcome community contributions, bug reports, and feature proposals to keep our platform fast, accessible, and user-friendly.

---

## 📋 Code of Conduct

Please treat all community members and contributors with respect, kindness, and professionalism. We are committed to providing a welcoming and inclusive environment for everyone.

---

## 🛠️ Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/electrohaven.git
   cd electrohaven
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Verify tests:**
   ```bash
   npm test
   ```

---

## 🌿 Branch Naming Conventions

Use descriptive branch names with appropriate prefixes:
- `feature/setup-builder-presets` — New features or UX enhancements
- `fix/sidebar-footer-overlap` — Bug fixes
- `perf/cart-calculation-memo` — Performance optimizations
- `docs/deployment-guide` — Documentation improvements
- `refactor/router-normalizer` — Code refactoring without behavioral changes

---

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short description in imperative mood>

[optional body explaining context or rationale]

[optional footer referencing issues, e.g. Closes #42]
```

**Common Types:**
- `feat`: A new user-facing feature
- `fix`: A bug fix
- `docs`: Documentation updates only
- `style`: Formatting, missing semicolons, CSS tweaks (no code logic changes)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding or updating test suites
- `chore`: Build process, dependencies, or tool configurations

*Examples:*
- `feat(setup-builder): add budget presets and live product swapping`
- `fix(sidebar): resolve footer overlapping on medium viewport heights`
- `docs(readme): add screenshot gallery and deployment guide`

---

## 🧪 Code Quality & Testing

Before submitting a Pull Request, please ensure:
1. **Automated tests pass:**
   ```bash
   npm test
   ```
2. **Production build succeeds with 0 errors:**
   ```bash
   npm run build
   ```
3. **Themes & Responsiveness:**
   - Verify that your changes look clean in both **Dark Mode** and **Light Mode**.
   - Check responsiveness across desktop (1440px+), tablet (768px), and mobile (375px) viewports.
4. **Security & Secrets:**
   - Do **NOT** commit hardcoded API keys, private passwords, tokens, or environment credentials.

---

## 🚀 Pull Request Workflow

1. Push your branch to your forked repository:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of the upstream repository.
3. Complete the PR template with:
   - Summary of changes
   - Motivation and context
   - Relevant screenshots (before & after if UI changes were made)
   - Testing steps performed
4. Maintainers will review your PR and provide constructive feedback.

---

## 🐛 Reporting Bugs & Issues

When reporting an issue, please include:
- A clear, concise title.
- Steps to reproduce the bug.
- Expected vs. actual behavior.
- Browser name, version, and operating system.
- Screenshots or console error logs if available.

Thank you for helping make ElectroHaven better!
