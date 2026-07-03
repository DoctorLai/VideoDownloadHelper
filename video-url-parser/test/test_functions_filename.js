/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { getFileExtension, sanitizeFilename, suggestFilename, inferMediaExtension } = require("../js/functions");

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
    it("handles a bare filename with no path separator", function () {
        assert.equal(getFileExtension("video.MP4"), "mp4");
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
    it("keeps a known media extension found in a query parameter", function () {
        assert.equal(suggestFilename("https://cdn.example.com/get.php?file=p.png", "Pic"), "Pic.png");
    });
    it("keeps a known media extension when extra path segments follow the file", function () {
        assert.equal(suggestFilename("https://cdn.example.com/i/photo.jpg/large", "Pic"), "Pic.jpg");
    });
    it("still keeps a non-media extension for other downloads", function () {
        assert.equal(suggestFilename("https://cdn.example.com/report.pdf", "Doc"), "Doc.pdf");
    });
});

describe("inferMediaExtension", function () {
    it("returns a known image extension from a simple URL", function () {
        assert.equal(inferMediaExtension("https://cdn.example.com/photo.jpg"), "jpg");
    });
    it("returns a known video extension, ignoring case and query string", function () {
        assert.equal(inferMediaExtension("https://cdn.example.com/clip.MP4?token=1"), "mp4");
    });
    it("infers the extension from a query parameter", function () {
        assert.equal(inferMediaExtension("https://cdn.example.com/get.php?file=photo.png"), "png");
    });
    it("infers the extension when extra path segments follow the file", function () {
        assert.equal(inferMediaExtension("https://cdn.example.com/image.jpg/large"), "jpg");
    });
    it("does not infer an extension from the host name", function () {
        assert.equal(inferMediaExtension("https://jpg.example.com/watch"), "");
    });
    it("returns an empty string for a non-media extension", function () {
        assert.equal(inferMediaExtension("https://cdn.example.com/report.pdf"), "");
    });
    it("returns an empty string when there is no known extension", function () {
        assert.equal(inferMediaExtension("https://cdn.example.com/watch?v=abc"), "");
    });
    it("returns an empty string for null", function () {
        assert.equal(inferMediaExtension(null), "");
    });
});
