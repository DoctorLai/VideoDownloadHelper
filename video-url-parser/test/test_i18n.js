/* jshint -W097 */
/* jshint -W117 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { assert } = require("chai");

const ROOT = path.join(__dirname, "..");
const LANG_DIR = path.join(ROOT, "lang");
const LOCALES_DIR = path.join(ROOT, "_locales");
const MAIN_HTML = path.join(ROOT, "main.html");
const TRANSLATE_JS = path.join(ROOT, "js", "translate.js");

// Minimum number of languages the project promises to ship.
const MIN_LANGUAGES = 25;

// Load a lang/<code>.js file and evaluate the translation_* object it declares.
// The lang files are plain browser scripts (no module.exports), so they are run
// in an isolated VM context and the declared const is captured back out.
function loadTranslation(file) {
    const src = fs.readFileSync(file, "utf8");
    const match = src.match(/const\s+(translation_\w+)\s*=/);
    assert.isNotNull(match, `${path.basename(file)} must declare a translation_* object`);
    const varName = match[1];
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(`${src}\nthis.__translation = ${varName};`, sandbox, { filename: file });
    return sandbox.__translation;
}

function langCodes() {
    return fs
        .readdirSync(LANG_DIR)
        .filter((name) => name.endsWith(".js"))
        .map((name) => name.replace(/\.js$/, ""))
        .sort();
}

function localeDirs() {
    return fs
        .readdirSync(LOCALES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

describe("i18n: lang/ UI translations", function () {
    const codes = langCodes();
    const referenceKeys = Object.keys(loadTranslation(path.join(LANG_DIR, "en-us.js"))).sort();

    it(`ships at least ${MIN_LANGUAGES} UI languages`, function () {
        assert.isAtLeast(codes.length, MIN_LANGUAGES);
    });

    it("has a non-empty reference key set (en-us)", function () {
        assert.isAbove(referenceKeys.length, 0);
    });

    codes.forEach((code) => {
        describe(`${code}.js`, function () {
            const translation = loadTranslation(path.join(LANG_DIR, `${code}.js`));

            it("declares a translation object", function () {
                assert.isObject(translation);
            });

            it("has exactly the same keys as en-us.js", function () {
                assert.deepEqual(Object.keys(translation).sort(), referenceKeys);
            });

            it("has a non-empty string value for every key", function () {
                Object.entries(translation).forEach(([key, value]) => {
                    assert.isString(value, `${code}: '${key}' must be a string`);
                    assert.isAbove(value.trim().length, 0, `${code}: '${key}' must not be empty`);
                });
            });
        });
    });
});

describe("i18n: main.html and translate.js wiring", function () {
    const html = fs.readFileSync(MAIN_HTML, "utf8");
    const translateSrc = fs.readFileSync(TRANSLATE_JS, "utf8");
    const codes = langCodes();

    const includeCodes = [...html.matchAll(/<script\s+src="lang\/([\w-]+)\.js"/g)].map((m) => m[1]).sort();

    const selectBlock = html.match(/<select[^>]*id="lang"[^>]*>([\s\S]*?)<\/select>/);
    assert.isNotNull(selectBlock, 'main.html must contain a <select id="lang">');
    const optionCodes = [...selectBlock[1].matchAll(/<option\s+value="([\w-]+)"/g)].map((m) => m[1]).sort();

    const caseCodes = [...translateSrc.matchAll(/case\s+'([\w-]+)'\s*:/g)].map((m) => m[1]).sort();

    it("includes a <script> for every lang file", function () {
        assert.deepEqual(includeCodes, codes);
    });

    it("has a <select> <option> for every lang file", function () {
        assert.deepEqual(optionCodes, codes);
    });

    it("has a translate.js switch case for every lang file", function () {
        assert.deepEqual(caseCodes, codes);
    });
});

describe("i18n: _locales Chrome messages", function () {
    const locales = localeDirs();

    it(`ships at least ${MIN_LANGUAGES} locales`, function () {
        assert.isAtLeast(locales.length, MIN_LANGUAGES);
    });

    locales.forEach((locale) => {
        describe(locale, function () {
            const file = path.join(LOCALES_DIR, locale, "messages.json");

            it("has a messages.json file", function () {
                assert.isTrue(fs.existsSync(file), `${locale}/messages.json is missing`);
            });

            it("is valid JSON with non-empty appName and appDesc messages", function () {
                const data = JSON.parse(fs.readFileSync(file, "utf8"));
                assert.property(data, "appName");
                assert.property(data, "appDesc");
                assert.isString(data.appName.message);
                assert.isAbove(data.appName.message.trim().length, 0);
                assert.isString(data.appDesc.message);
                assert.isAbove(data.appDesc.message.trim().length, 0);
            });
        });
    });
});
