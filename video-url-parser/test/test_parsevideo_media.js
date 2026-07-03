/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require("../js/parsevideo");

describe("extract_all_media_urls", function () {
    it("extracts a direct .webm link", function () {
        const html = '<a href="https://cdn.example.com/clip.webm">download</a>';
        assert.equal(ParseVideo.extract_all_media_urls("", html), "https://cdn.example.com/clip.webm");
    });
    it("extracts a link with a query string", function () {
        const html = '"file":"https://cdn.example.com/v/movie.mkv?token=abc123"';
        assert.equal(ParseVideo.extract_all_media_urls("", html), "https://cdn.example.com/v/movie.mkv?token=abc123");
    });
    it("extracts a direct audio file", function () {
        const html = "listen here https://cdn.example.com/audio/song.mp3 now";
        assert.equal(ParseVideo.extract_all_media_urls("", html), "https://cdn.example.com/audio/song.mp3");
    });
    it("extracts and de-duplicates multiple media links", function () {
        const html =
            '<source src="https://cdn.example.com/a.mov">' +
            '<source src="https://cdn.example.com/b.mp4">' +
            '<source src="https://cdn.example.com/a.mov">';
        const urls = ParseVideo.extract_all_media_urls("", html);
        assert.deepEqual(urls, ["https://cdn.example.com/a.mov", "https://cdn.example.com/b.mp4"]);
    });
    it("returns null when there is no media link", function () {
        assert.isNull(ParseVideo.extract_all_media_urls("", "<p>no media here</p>"));
    });
    it("does not treat a domain label as a media extension", function () {
        // ".mov" appears in the host, but there is no media file in the path
        assert.isNull(ParseVideo.extract_all_media_urls("", "visit https://sub.mov.example.com/watch please"));
    });
    it("is reachable through Parse() as a last-resort fallback", function () {
        const html = '<div data-src="https://cdn.example.com/media/final.mkv"></div>';
        const video = new ParseVideo("https://generic.example.com/watch", html);
        assert.equal(video.Parse(), "https://cdn.example.com/media/final.mkv");
    });
});
