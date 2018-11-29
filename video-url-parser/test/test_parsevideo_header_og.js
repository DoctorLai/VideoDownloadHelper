/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('html header og:video', function() {
    let url = 'https://example.com/example-video.html';
    it(url, function() {
        const html = fs.readFileSync('test/data/html-header-og-video-url.html').toString();
        const video = new ParseVideo(url, html);
        const video_urls = video.Parse();
        assert.deepEqual(video_urls, [ 
            "https://sec.ch9.ms/ch9/e38e/55fb9c4b-33b1-4742-9fda-225eb92ee38e/VS2017LaunchT108_mid.mp4#1",
            "https://sec.ch9.ms/ch9/e38e/55fb9c4b-33b1-4742-9fda-225eb92ee38e/VS2017LaunchT108_mid.mp4#2",
            "https://sec.ch9.ms/ch9/e38e/55fb9c4b-33b1-4742-9fda-225eb92ee38e/VS2017LaunchT108_mid.mp4#3"            
        ]);
    });   
});
