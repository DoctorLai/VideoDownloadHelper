/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require("../js/parsevideo");

describe("parse_facebook_video", function () {
    const html =
        '"hd_src_no_ratelimit":"https://video.fb.example/hd_norl.mp4",' +
        '"hd_src":"https://video.fb.example/hd.mp4",' +
        '"sd_src_no_ratelimit":"https://video.fb.example/sd_norl.mp4",' +
        '"sd_src":"https://video.fb.example/sd.mp4",';
    it("collects hd/sd sources in priority order", function () {
        const video_urls = ParseVideo.parse_facebook_video("https://www.facebook.com/x/videos/1/", html);
        assert.deepEqual(video_urls, [
            "https://video.fb.example/hd_norl.mp4",
            "https://video.fb.example/hd.mp4",
            "https://video.fb.example/sd_norl.mp4",
            "https://video.fb.example/sd.mp4",
        ]);
    });
    it("returns null when no source is present", function () {
        assert.isNull(ParseVideo.parse_facebook_video("https://www.facebook.com/x/videos/1/", "<html></html>"));
    });
});

describe("ParseVideo.Parse (no match)", function () {
    it("returns null for an unknown domain with no recognizable video", function () {
        const video = new ParseVideo("https://unknown.example.com/page", "<html><body>no videos here</body></html>");
        assert.isNull(video.Parse());
    });
    it("returns null for empty html on an unknown domain", function () {
        const video = new ParseVideo("https://unknown.example.com/page");
        assert.isNull(video.Parse());
    });
});

describe("ParseVideo.Parse (dispatch)", function () {
    it("extracts a generic video_url embedded in the page html", function () {
        const html = '{"video_url": "https://cdn.example.com/movie.mp4"}';
        const video = new ParseVideo("https://generic.example.com/watch", html);
        assert.equal(video.Parse(), "https://cdn.example.com/movie.mp4");
    });
    it("extracts an og:video URL from the page header", function () {
        const html = '<meta property="og:video:url" content="https://cdn.example.com/og.mp4" />';
        const video = new ParseVideo("https://generic.example.com/watch", html);
        assert.equal(video.Parse(), "https://cdn.example.com/og.mp4");
    });
});

describe("parse_miaopai_com (static)", function () {
    it("derives the stream URL from a show URL", function () {
        assert.equal(
            ParseVideo.parse_miaopai_com("http://www.miaopai.com/show/abcde.html"),
            "http://gslb.miaopai.com/stream/abcde.mp4"
        );
    });
    it("returns null when the URL is not a show URL", function () {
        assert.isNull(ParseVideo.parse_miaopai_com("https://www.miaopai.com/about"));
    });
});

describe("parse_xiaokaxiu_com (static)", function () {
    it("returns null when no player scid is present", function () {
        assert.isNull(ParseVideo.parse_xiaokaxiu_com("https://v.xiaokaxiu.com/v/abc.html", "<html></html>"));
    });
});
