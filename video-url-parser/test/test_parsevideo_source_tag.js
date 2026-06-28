/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require("../js/parsevideo");

describe("extract_all_source_tags", function () {
    it("extracts a single <source> URL", function () {
        const html = '<video controls><source src="https://cdn.example.com/a.mp4" type="video/mp4"></video>';
        assert.equal(ParseVideo.extract_all_source_tags("", html), "https://cdn.example.com/a.mp4");
    });
    it("extracts multiple <source> URLs", function () {
        const html =
            '<video><source src="https://cdn.example.com/a.webm" type="video/webm">' +
            '<source src="https://cdn.example.com/a.mp4" type="video/mp4"></video>';
        const urls = ParseVideo.extract_all_source_tags("", html);
        assert.deepEqual(urls, ["https://cdn.example.com/a.webm", "https://cdn.example.com/a.mp4"]);
    });
    it("returns null when there is no <source> tag", function () {
        assert.isNull(ParseVideo.extract_all_source_tags("", "<video></video>"));
    });
    it("is reachable through Parse() for an <audio> source", function () {
        const html = '<audio><source src="https://cdn.example.com/clip.m4a" type="audio/mp4"></audio>';
        const video = new ParseVideo("https://generic.example.com/listen", html);
        assert.equal(video.Parse(), "https://cdn.example.com/clip.m4a");
    });
});
