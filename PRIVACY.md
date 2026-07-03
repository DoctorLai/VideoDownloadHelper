# Privacy Policy

_Last updated: 2026-07-03_

**Simple Video Download Helper** ("the extension") is a browser extension that
helps you find and download videos from supported websites. This document
explains what data the extension accesses and how it is used.

## Summary

- The extension runs **locally in your browser**.
- It does **not** collect, store, or transmit your personal data to the
  developer.
- It does **not** include analytics, advertising, or tracking of any kind.

## Data the Extension Accesses

To do its job, the extension needs to read the content of the page you are
viewing and use a small number of browser capabilities. These are declared in
[`manifest.json`](video-url-parser/manifest.json):

| Permission     | Why it is needed                                                            |
| -------------- | --------------------------------------------------------------------------- |
| `activeTab`    | To read the current page so it can detect downloadable media URLs.          |
| `scripting`    | To run the parser (content script) on the page you are viewing.             |
| `downloads`    | To save a detected video/audio/image using the browser's download manager.  |
| `contextMenus` | To provide right-click "download" and "find videos" menu entries.           |
| `storage`      | To remember your settings (such as UI language, dark mode and API key).     |

The parsing of page content happens **on your device**. Detected media URLs are
shown to you in the popup; they are not sent anywhere unless you explicitly
choose to download or copy them.

## Local Storage

The extension uses the browser's local extension storage to keep your
preferences, for example:

- Selected UI language.
- Dark mode preference.
- An optional VIP/remote-parser API key, **if you choose to enter one**.

This information stays in your browser profile and is never transmitted to the
developer.

## Optional Remote Parser (VIP)

The extension can optionally use a remote parser API to help detect video URLs
on some pages. This is **opt-in** and only used when you have configured it. The
relevant endpoints are declared under `host_permissions` in the manifest:

- `https://uploadbeta.com/api/*`
- `https://video.justyy.workers.dev/api/*`

When (and only when) you use this optional feature, the page URL you are trying
to parse may be sent to that API so it can return candidate media URLs. If you
do not use the VIP/remote feature, no page data leaves your browser.

## Third-Party Websites

When you download a file, your browser connects directly to the website hosting
that file. Those websites have their own privacy policies, which are outside the
control of this extension.

## Children's Privacy

The extension is not directed at children and does not knowingly collect any
personal information from anyone.

## Changes to This Policy

We may update this policy from time to time. Material changes will be reflected
by updating the "Last updated" date at the top of this document.

## Contact

If you have questions about this privacy policy, please open an issue at
<https://github.com/DoctorLai/VideoDownloadHelper/issues> or contact the
maintainer at **dr.zhihua.lai@gmail.com**.
