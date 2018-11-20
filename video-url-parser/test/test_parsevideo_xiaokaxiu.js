/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('xiaokaxiu.com', function() {
    const url = 'https://v.xiaokaxiu.com/v/fhX23JOcSbVEJOQ9LFKtOP2WBkeP1AA-.html';
    it(url, function() {
        const html = fs.readFileSync('test/data/xiaokaxiu-1.html').toString();
        const video = new ParseVideo(url, html);
        const video_urls = video.Parse();
        assert.equal(video_urls, "http://gslb.miaopai.com/stream/fhX23JOcSbVEJOQ9LFKtOP2WBkeP1AA-.mp4");
    });   
});
