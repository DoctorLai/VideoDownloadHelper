/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { getFileExtension, sanitizeFilename, suggestFilename } = require("../js/functions");

describe("getFileExtension", function () {
    it("returns the lowercased extension of a simple URL", function () {
        assert.equal(getFileExtension("https://cdn.example.com/a.mp4"), "mp4");
    });
    it("ignores the query string", function () {
        assert.equal(getFileExtension("https://cdn.example.com/a.MP4?token=1&x=2"), "mp4");
    });
    it("ignores the fragment", function () {
        assert.equal(getFileExtension("https://cdn.example.com/a.webm#t=10"), "webm");
    });
    it("returns an empty string when there is no extension", function () {
        assert.equal(getFileExtension("https://cdn.example.com/watch"), "");
    });
    it("returns an empty string for a trailing slash", function () {
        assert.equal(getFileExtension("https://cdn.example.com/path/"), "");
    });
    it("returns an empty string for a trailing dot", function () {
        assert.equal(getFileExtension("https://cdn.example.com/a."), "");
    });
    it("returns an empty string for null", function () {
        assert.equal(getFileExtension(null), "");
    });
    it("returns an empty string for a non-string", function () {
        assert.equal(getFileExtension(42), "");
    });
});

describe("sanitizeFilename", function () {
    it("replaces characters that are illegal in filenames", function () {
        assert.equal(sanitizeFilename("Hello / World"), "Hello _ World");
    });
    it("collapses runs of whitespace", function () {
        assert.equal(sanitizeFilename("a    b"), "a b");
    });
    it("strips leading dots", function () {
        assert.equal(sanitizeFilename("...hidden"), "hidden");
    });
    it("returns an empty string for an empty input", function () {
        assert.equal(sanitizeFilename(""), "");
    });
    it("returns an empty string for null", function () {
        assert.equal(sanitizeFilename(null), "");
    });
});

describe("suggestFilename", function () {
    it("combines the title and the URL extension", function () {
        assert.equal(suggestFilename("https://cdn.example.com/a.mp4", "My Video"), "My Video.mp4");
    });
    it("appends a 1-based index when provided", function () {
        assert.equal(suggestFilename("https://cdn.example.com/a.mp4", "My Video", 0), "My Video-1.mp4");
    });
    it("sanitizes the title", function () {
        assert.equal(suggestFilename("https://cdn.example.com/a.webm", "A/B", 2), "A_B-3.webm");
    });
    it("falls back to a default base name", function () {
        assert.equal(suggestFilename("https://cdn.example.com/a.mp4", ""), "video.mp4");
    });
    it("omits the extension when the URL has none", function () {
        assert.equal(suggestFilename("https://cdn.example.com/watch", "Title"), "Title");
    });
    it("ignores a negative index", function () {
        assert.equal(suggestFilename("https://cdn.example.com/a.mp4", "Title", -1), "Title.mp4");
    });
});
