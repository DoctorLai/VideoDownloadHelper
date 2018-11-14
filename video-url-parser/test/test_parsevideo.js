/* jshint -W097 *//* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
let { ParseVideo } = require('../js/parsevideo');

describe('miaopai', function() {
    it('http://www.miaopai.com/show/abcde.html', function() {
        let video = new ParseVideo("http://www.miaopai.com/show/abcde.html");
        assert.equal(video.Parse(), "http://gslb.miaopai.com/stream/abcde.mp4");
    });   
});