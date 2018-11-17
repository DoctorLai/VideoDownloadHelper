/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
let { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('miaopai', function() {
    let url = 'http://www.miaopai.com/show/abcde.html';
    it(url, function() {
        let video = new ParseVideo(url);
        assert.equal(video.Parse(), "http://gslb.miaopai.com/stream/abcde.mp4");
    });   
});
