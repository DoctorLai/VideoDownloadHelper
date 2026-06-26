#!/usr/bin/env node
"use strict";

/*
 * Produces a Chrome Web Store ready zip of the extension.
 *
 * The archive is built from the extension root (this script's parent directory)
 * so that `manifest.json` sits at the top level of the zip, and development-only
 * files are excluded. Run it via `npm run package` (which builds first).
 */

const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const extensionRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(extensionRoot, "..");

// Directories (matched by name, at any depth) that must never be shipped.
const EXCLUDED_DIRS = new Set(["node_modules", "test", "coverage", ".nyc_output", "scripts", ".git"]);

// Files that only exist for development/tooling, excluded at the extension root.
const EXCLUDED_ROOT_FILES = new Set([
    "eslint.config.js",
    "webpack.config.js",
    ".prettierrc.json",
    ".prettierignore",
    ".nycrc.json",
    ".mocharc.json",
    "package.json",
    "package-lock.json",
    "todo-urls.txt",
    "some-video-sites.txt",
]);

function collectFiles(absDir, relDir, files) {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
        const name = entry.name;
        const rel = relDir ? `${relDir}/${name}` : name;
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(name)) {
                continue;
            }
            collectFiles(path.join(absDir, name), rel, files);
        } else {
            if (relDir === "" && EXCLUDED_ROOT_FILES.has(name)) {
                continue;
            }
            if (name.endsWith(".zip")) {
                continue;
            }
            files.push(rel);
        }
    }
    return files;
}

function main() {
    const manifestPath = path.join(extensionRoot, "manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const { version, name } = manifest;

    const distBundle = path.join(extensionRoot, "dist", "dist.min.js");
    if (!fs.existsSync(distBundle)) {
        console.error("Build output not found at dist/dist.min.js. Run `npm run build` first.");
        process.exit(1);
    }

    const zipName = `simple-video-download-helper-${version}.zip`;
    const outputPath = path.join(repoRoot, zipName);

    const files = collectFiles(extensionRoot, "", []);
    const zip = new AdmZip();
    for (const rel of files) {
        const zipFolder = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
        zip.addLocalFile(path.join(extensionRoot, rel), zipFolder);
    }
    zip.writeZip(outputPath);

    const sizeKiB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`Packaged "${name}" v${version}`);
    console.log(`  files:  ${files.length}`);
    console.log(`  output: ${path.relative(repoRoot, outputPath)} (${sizeKiB} KiB)`);
}

main();
