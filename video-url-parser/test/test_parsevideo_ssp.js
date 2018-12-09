/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('ssp_helper_function', function() {
    const src0 = "27663617dc59e052bf3e2c671ca6a73c";
    const dest0 = "d7c6ec235367cb2a1279ef6a6061c573";
    it(src0, function() {
        assert.equal(ParseVideo._sse_reverse_engineering_helper(src0), dest0);
    });
    const src1 = "07b3a7920ee0ee63a329e6caf223cbac";
    const dest1 = "07e3e6e2eab2ca3290b0937c3ecf26aa";
    it(src1, function() {
        assert.equal(ParseVideo._sse_reverse_engineering_helper(src1), dest1);
    });
    const src2 = "3ec8852551e4ac36e981c555230868d1";
    const dest2 = "5e18a5c8edc51e60238419568c523358";
    it(src2, function() {
        assert.equal(ParseVideo._sse_reverse_engineering_helper(src2), dest2);
    });
    const src3 = "68b8f34e248b19a6acf92a1ef1587c8c";
    const dest3 = "28481a2f88beca6546cb9c37891f1aef";
    it(src3, function() {
        assert.equal(ParseVideo._sse_reverse_engineering_helper(src3), dest3);
    });
    const src4 = "1b34453212843b5e5a6443a97bd0b50f";
    const dest4 = "1b2433468032f5ed31544a5b0ba7b594";
    it(src4, function() {
        assert.equal(ParseVideo._sse_reverse_engineering_helper(src4), dest4);
    });
    const src5 = "9d1e9aa135872b85749ed602cc6ac68a";
    const dest5 = "3d5e26d98811a756a967e4acab0cc829";
    it(src5, function() {
        assert.equal(ParseVideo._sse_reverse_engineering_helper(src5), dest5);
    });
    const src6 = "ecfb34cc3ab3dfaa35027e49b5e970f0";
    const dest6 = "3cabde70bffc03aece0325479f4b5a93";
    it(src6, function() {
        assert.equal(ParseVideo._sse_reverse_engineering_helper(src6), dest6);
    });
});

describe('ssp*.com', function() {
    const url = 'https://www.se' + 'sep' + 'orn.com/videos/8395/900/';
    it(url, function() {
        const html = fs.readFileSync('test/data/html-ssp.html').toString();
        const video = new ParseVideo(url, html);
        const video_urls = video.Parse();
        const prefix = "https://www.seseporn.com/get_file/12/3cabde70bffc03aece0325479f4b5a93/8000/8395/8395.mp4/?br=457&rnd=";
        assert.equal(video_urls.slice(0, prefix.length), prefix);
    });   
});
