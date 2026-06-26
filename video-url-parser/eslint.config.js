const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        // Vendored libraries, build output, coverage reports, i18n data and
        // legacy browser UI scripts are intentionally excluded from linting.
        ignores: [
            "node_modules/**",
            "dist/**",
            "coverage/**",
            ".nyc_output/**",
            "bs/**",
            "images/**",
            "lang/**",
            "_locales/**",
            "test/data/**",
            "js/jquery-3.4.1.min.js",
            "js/jquery-ui.js",
            "js/MD5.js",
            "js/m_inc.js",
            "js/background.js",
            "js/getPagesSource.js",
            "js/popup.js",
            "js/translate.js",
            "js/video.js",
        ],
    },
    js.configs.recommended,
    {
        // Core, unit-tested parser library.
        files: ["js/functions.js", "js/constants.js", "js/parsevideo.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.browser,
                ...globals.node,
                // WebExtension API global available to extension scripts.
                chrome: "readonly",
            },
        },
        rules: {
            eqeqeq: ["error", "smart"],
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-var": "error",
            "prefer-const": "warn",
        },
    },
    {
        // Mocha test suite.
        files: ["test/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.mocha,
            },
        },
    },
    {
        // Node tooling/config files.
        files: ["webpack.config.js", "eslint.config.js", "scripts/**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                ...globals.node,
            },
        },
    },
];
