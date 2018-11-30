/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('html <video src>', function() {
    let url = 'https://example.com/example-video.html';
    it(url, function() {
        const html = fs.readFileSync('test/data/html-video-tag.html').toString();
        const video = new ParseVideo(url, html);
        const video_urls = video.Parse();
        assert.equal(video_urls, "https://ev-ph.ypncdn.com/videos/201807/10/173954251/480P_2000K_173954251.mp4?rate=141k&amp;burst=1400k&amp;validfrom=1543514700&amp;validto=1543529100&amp;hash=%2B3Po2O4r7uQZFHm7NCKaT1rMY5s%3D");
    });   
});
