/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ValidURL, getParameterByName, sanitizeFilename } = require("../js/functions");

describe("ValidURL (backslash-escaped slashes)", function () {
    it("accepts a URL whose slashes are backslash-escaped", function () {
        assert.isTrue(ValidURL("http:\\/\\/www.example.com/a.mp4"));
    });
    it("accepts an https URL whose slashes are backslash-escaped", function () {
        assert.isTrue(ValidURL("https:\\/\\/www.example.com/a.mp4"));
    });
    it("still rejects an escaped prefix with no host", function () {
        assert.isFalse(ValidURL("http:\\/\\/"));
    });
});

describe("getParameterByName", function () {
    it("returns the decoded value of a query parameter", function () {
        assert.equal(getParameterByName("x", "https://e.com/?x=a%20b"), "a b");
    });
    it("returns an empty string when the parameter has no value", function () {
        assert.equal(getParameterByName("x", "https://e.com/?x"), "");
    });
    it("returns null when the parameter is absent", function () {
        assert.isNull(getParameterByName("y", "https://e.com/?x=1"));
    });
});

describe("sanitizeFilename (edge cases)", function () {
    it("returns an empty string for a truthy non-string", function () {
        assert.equal(sanitizeFilename(12345), "");
    });
    it("truncates very long names to 120 characters", function () {
        const long = "a".repeat(200);
        assert.equal(sanitizeFilename(long).length, 120);
    });
});
