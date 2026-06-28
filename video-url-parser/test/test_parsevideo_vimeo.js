/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require("../js/parsevideo");
const fs = require("fs");

describe("vimeo", function () {
    const url = "https://vimeo.com/151712690";
    it(url, function () {
        const html = fs.readFileSync("test/data/vimeo-151712690.html").toString();
        const video = new ParseVideo(url, html);
        const video_urls = video.Parse();
        assert.deepEqual(video_urls, [
            "https://vod-progressive.akamaized.net/exp=1/360p.mp4",
            "https://vod-progressive.akamaized.net/exp=1/720p.mp4",
        ]);
    });
});

describe("parse_vimeo_com (static)", function () {
    it("returns null when no progressive stream is present", function () {
        assert.isNull(ParseVideo.parse_vimeo_com("https://vimeo.com/1", "<html></html>"));
    });
});
