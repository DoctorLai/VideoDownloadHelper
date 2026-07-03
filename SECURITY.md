# Security Policy

## Supported Versions

Security fixes are applied to the latest released version of the extension. We
recommend always running the most recent build from the Chrome Web Store or the
`master` branch of this repository.

| Version | Supported          |
| ------- | ------------------ |
| 3.2.x   | :white_check_mark: |
| < 3.2   | :x:                |

## Reporting a Vulnerability

We take the security of Simple Video Download Helper seriously. If you believe
you have found a security vulnerability, please report it privately so we can
address it before it is publicly disclosed.

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, use one of the following channels:

- Preferred: open a
  [GitHub Security Advisory](https://github.com/DoctorLai/VideoDownloadHelper/security/advisories/new)
  ("Report a vulnerability").
- Alternatively, email the maintainer at **dr.zhihua.lai@gmail.com** with the
  subject line `[SECURITY] VideoDownloadHelper`.

When reporting, please include as much of the following as possible:

- A description of the vulnerability and its potential impact.
- Steps to reproduce (proof-of-concept, affected URLs, or a minimal test case).
- The extension version, browser, and operating system you tested with.
- Any suggested remediation, if you have one.

## What to Expect

- **Acknowledgement:** we aim to acknowledge your report within 5 business days.
- **Assessment:** we will investigate and keep you informed of our progress.
- **Fix & disclosure:** once a fix is available we will release it and, with
  your permission, credit you in the release notes.

## Scope

This project is a client-side browser extension. Relevant areas include:

- The content-script parser (`video-url-parser/js/`), which reads page content
  to detect media URLs.
- The extension permissions declared in
  [`manifest.json`](video-url-parser/manifest.json) (`activeTab`, `storage`,
  `scripting`, `downloads`, `contextMenus`).
- The optional remote parser API endpoints listed under `host_permissions`.

Out of scope: vulnerabilities in third-party websites the extension is used on,
and issues that require a physically compromised device.

Thank you for helping keep the project and its users safe.
