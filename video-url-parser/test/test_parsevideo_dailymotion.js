/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require("../js/parsevideo");
const fs = require("fs");

describe("dailymotion", function () {
    const url = "https://www.dailymotion.com/video/x2bu0q2";
    it(url, function () {
        const html = fs.readFileSync("test/data/dailymotion-x2bu0q2.html").toString();
        const video = new ParseVideo(url, html);
        const video_urls = video.Parse();
        assert.deepEqual(video_urls, [
            "https://www.dailymotion.com/cdn/manifest/video/x2bu0q2.m3u8?sec=abc123",
            "https://www.dailymotion.com/cdn/H264-1280x720/video/x2bu0q2.mp4?auth=xyz",
        ]);
    });
});

describe("parse_dailymotion_com (static)", function () {
    it("extracts the legacy progressive MP4 stream", function () {
        const html = '"stream_h264_url":"https://cdn.dm.example/video.mp4"';
        assert.equal(ParseVideo.parse_dailymotion_com("", html), "https://cdn.dm.example/video.mp4");
    });
    it("returns null when no stream is present", function () {
        assert.isNull(ParseVideo.parse_dailymotion_com("https://www.dailymotion.com/video/x", "<html></html>"));
    });
});
