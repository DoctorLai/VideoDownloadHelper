/* jshint -W097 *//* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
let { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('pearvideo', function() {
    let url = 'http://www.pearvideo.com/video_1050733';
    it(url, function() {
        let html = fs.readFileSync('test/data/pearvideo-1050733.html').toString();
        let video = new ParseVideo(url, html);
        assert.equal(video.Parse(), "http://video.pearvideo.com/mp4/short/20170320/cont-1050733-10294549-hd.mp4");
    });   
});
