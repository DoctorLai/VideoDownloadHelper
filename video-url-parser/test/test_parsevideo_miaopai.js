/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('miaopai', function() {
    const url = 'http://www.miaopai.com/show/abcde.html';
    it(url, function() {
        const video = new ParseVideo(url);
        assert.equal(video.Parse(), "http://gslb.miaopai.com/stream/abcde.mp4");
    });   
});
