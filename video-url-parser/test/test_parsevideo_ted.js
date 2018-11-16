/* jshint -W097 *//* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
let { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('ted.com', function() {
    let url = 'https://www.ted.com/talks/atul_gawande_want_to_get_great_at_something_get_a_coach?language=en#t-48048';
    it(url, function() {
        let html = fs.readFileSync('test/data/ted-1.html').toString();
        let video = new ParseVideo(url, html);
        let video_urls = video.Parse();
        assert.deepEqual(video_urls, [ 
            'https://download.ted.com/talks/AtulGawande_2017-light.mp4?apikey=acme-roadrunner',
            'https://download.ted.com/talks/AtulGawande_2017.mp4?apikey=acme-roadrunner',
            'https://download.ted.com/talks/AtulGawande_2017-480p.mp4?apikey=acme-roadrunner',
            'https://download.ted.com/talks/AtulGawande_2017-low-en.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-en.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-fa.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-fa.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-pt-br.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-pt-br.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-zh-tw.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-zh-tw.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-pl.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-pl.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-pt.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-pt.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-nl.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-nl.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-es.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-es.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-ko.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-ko.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-ar.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-ar.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-fr.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-fr.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-tr.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-tr.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-ja.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-ja.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-low-zh-cn.mp4',
            'https://download.ted.com/talks/AtulGawande_2017-480p-zh-cn.mp4',
            'https://pc.tedcdn.com/talk/stream/2017/Blank/AtulGawande_2017-320k.mp4?dnt' 
        ]);
    });   
});
