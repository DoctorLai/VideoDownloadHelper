/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require("../js/parsevideo");

describe("extract_all_m3u8_urls", function () {
    it("extracts a plain .m3u8 URL", function () {
        const html = 'var src = "https://cdn.example.com/live/index.m3u8";';
        assert.equal(ParseVideo.extract_all_m3u8_urls("", html), "https://cdn.example.com/live/index.m3u8");
    });
    it("normalizes backslash-escaped .m3u8 URLs in JSON", function () {
        const html = '{"hls":"https:\\/\\/cdn.example.com\\/live\\/index.m3u8?token=1"}';
        assert.equal(ParseVideo.extract_all_m3u8_urls("", html), "https://cdn.example.com/live/index.m3u8?token=1");
    });
    it("returns null when no .m3u8 URL is present", function () {
        assert.isNull(ParseVideo.extract_all_m3u8_urls("", "<html>no streams</html>"));
    });
    it("is reachable through Parse()", function () {
        const html = '<html><body>player.load("https://cdn.example.com/v/master.m3u8");</body></html>';
        const video = new ParseVideo("https://generic.example.com/watch", html);
        assert.equal(video.Parse(), "https://cdn.example.com/v/master.m3u8");
    });
});
