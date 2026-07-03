# Contributing to Simple Video Download Helper

First off, thank you for taking the time to contribute! :tada: Contributions of
all kinds are welcome — bug reports, feature requests, documentation, new
site parsers, translations and code.

This document explains how to get set up and the conventions we follow.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Project Layout](#project-layout)
- [Development Setup](#development-setup)
- [Available Scripts](#available-scripts)
- [Coding Standards](#coding-standards)
- [Adding a New Site Parser](#adding-a-new-site-parser)
- [Adding or Updating a Translation](#adding-or-updating-a-translation)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project you agree to uphold a respectful, harassment-
free environment for everyone. Please be kind and constructive.

## Ways to Contribute

- **Report bugs** using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
- **Request features** using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
- **Improve documentation** — even fixing a typo helps.
- **Add support for a new site** — see [below](#adding-a-new-site-parser).
- **Translate the UI** — see [below](#adding-or-updating-a-translation).

## Project Layout

The extension and all of its tooling live in the `video-url-parser/` directory.
The repository root exposes the same npm scripts and delegates into that
directory, so you can work from **either** location.

```text
.
├── package.json               # Root scripts that delegate into video-url-parser/
└── video-url-parser/          # The extension itself
    ├── manifest.json          # Manifest V3 definition
    ├── js/
    │   ├── functions.js       # Core helper utilities (unit-tested)
    │   ├── constants.js       # Shared constants (unit-tested)
    │   └── parsevideo.js      # The ParseVideo engine and site parsers (unit-tested)
    ├── lang/                  # Popup UI translations (one file per language)
    ├── _locales/              # Chrome i18n messages (one folder per locale)
    └── test/                  # Mocha + Chai unit tests
```

## Development Setup

Requirements: **Node.js >= 18**.

```bash
# Clone your fork
git clone https://github.com/<your-username>/VideoDownloadHelper.git
cd VideoDownloadHelper

# Install dependencies (root delegates into video-url-parser/)
npm install
```

To load the extension in your browser:

```bash
cd video-url-parser
npm run build              # produces dist/dist.min.js (not committed)
```

Then open `chrome://extensions`, enable **Developer mode**, click
**Load unpacked** and select the `video-url-parser/` folder.

To create the Chrome Web Store zip package instead, run:

```bash
npm run package            # writes simple-video-download-helper-<version>.zip at the repo root
```

## Available Scripts

Run these from the repository root **or** from `video-url-parser/`:

| Script                 | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm test`             | Run the Mocha unit-test suite.                    |
| `npm run coverage`     | Run the tests and enforce coverage thresholds.    |
| `npm run lint`         | Lint the source and tests with ESLint.            |
| `npm run lint:fix`     | Auto-fix lint problems where possible.            |
| `npm run format`       | Format the codebase with Prettier.                |
| `npm run format:check` | Verify formatting without writing changes.        |
| `npm run build`        | Produce the production bundle.                     |
| `npm run package`      | Build and create the extension zip at the repo root. |
| `npm run check`        | Run lint, format check, coverage and build.       |

**Before opening a pull request, please make sure `npm run check` passes.**

## Coding Standards

- Code style is enforced by [ESLint](https://eslint.org/) (flat config) and
  [Prettier](https://prettier.io/): 4-space indentation, double quotes,
  semicolons, 120-character print width.
- The linters and formatter are intentionally **scoped** to the core library
  (`js/functions.js`, `js/constants.js`, `js/parsevideo.js`), the test suite and
  the config files. Vendored libraries and legacy UI scripts are excluded — see
  `eslint.config.js` and `.prettierignore`. Please keep those ignore lists in
  sync when you add files.
- New behaviour in the core library should be covered by unit tests.
- The parser must remain **dependency-free** at runtime.

## Adding a New Site Parser

1. Add a `parse_<site>_com(...)` function in
   [`video-url-parser/js/parsevideo.js`](video-url-parser/js/parsevideo.js) and
   register it in the `Parse()` chain.
2. Add a spec file under `video-url-parser/test/` (e.g.
   `test_parsevideo_<site>.js`) with representative HTML fixtures in
   `test/data/`.
3. Add the verified page to
   [`tested-urls.txt`](video-url-parser/tested-urls.txt).
4. Run `npm run check` and update the "Supported sites" table in the README.

## Adding or Updating a Translation

The popup UI is translated via two mechanisms:

- **`video-url-parser/lang/<code>.js`** — the popup UI strings. Copy
  `lang/en-us.js`, translate each value, and keep the same set of keys.
- **`video-url-parser/_locales/<locale>/messages.json`** — the Chrome
  extension name/description shown in the browser.

When you add a **new** language to `lang/`, also:

1. Add a `<script src="lang/<code>.js"></script>` include in `main.html`.
2. Add a `case "<code>": return (translation_<name>);` in
   `js/translate.js` (`get_lang()`).
3. Add an `<option value="<code>">Native name</option>` to the language
   `<select id="lang">` in `main.html`.

## Commit Messages

- Use clear, imperative subject lines (e.g. "Add Vietnamese translation").
- Reference related issues where relevant (e.g. "Fixes #123").
- Keep unrelated changes in separate commits/PRs.

## Pull Request Process

1. Fork the repository and create a topic branch from `master`.
2. Make your change, adding tests and documentation as appropriate.
3. Ensure `npm run check` passes locally.
4. Open a pull request using the template and describe **what** and **why**.
5. Be responsive to review feedback — we're glad to help get your change merged.

Thank you for contributing! :heart:
