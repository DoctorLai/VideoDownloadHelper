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

describe('pearvideo', function() {
    let url = 'http://www.pearvideo.com/video_1050733';
    it(url, function() {
        let html = fs.readFileSync('test/data/pearvideo-1050733.html').toString();
        let video = new ParseVideo(url, html);
        assert.equal(video.Parse(), "http://video.pearvideo.com/mp4/short/20170320/cont-1050733-10294549-hd.mp4");
    });   
});

describe('extract_all_video_urls', function() {
    let html = '"video_url": "https://aaaabbb.com", ';
    it(html, function() {
        assert.equal(ParseVideo.extract_all_video_urls('', html), "https://aaaabbb.com");
    });   
    let html2 = '"video_url": "https://aaaabbb1.com", "video_url": "https://aaaabbb2.com", ';
    it(html2, function() {
        let video_urls = ParseVideo.extract_all_video_urls('', html2);
        assert.equal(video_urls.length, 2);
        assert.equal(video_urls[0], "https://aaaabbb1.com");
        assert.equal(video_urls[1], "https://aaaabbb2.com");
    });    
    let html3 = '"video_url":"https://aaaabbb1.com","video_url":"kajsdkfj","video_url": "https://aaaabbb2.com", ';
    it(html3, function() {
        let video_urls = ParseVideo.extract_all_video_urls('', html3);
        assert.equal(video_urls.length, 2);
        assert.equal(video_urls[0], "https://aaaabbb1.com");
        assert.equal(video_urls[1], "https://aaaabbb2.com");
    });  
    let html4 = "kasjdfk sa, <video_url>:https://www.google.com";
    it(html4, function() {
        let video_urls = ParseVideo.extract_all_video_urls('', html4);
        assert.isNull(video_urls);
    });  
});

describe('extract_all_mp4_urls', function() {
    let html = '"mp4","url":"https://aabb.com"';
    it(html, function() {
        assert.equal(ParseVideo.extract_all_mp4_urls('', html), "https://aabb.com");
    });   
    let html2 = '""mp4","url":   "https://aabb1.com","mp4","url":"https://aabb2.com"';
    it(html2, function() {
        let video_urls = ParseVideo.extract_all_mp4_urls('', html2);
        assert.equal(video_urls.length, 2);
        assert.equal(video_urls[0], "https://aabb1.com");
        assert.equal(video_urls[1], "https://aabb2.com");
    });    
    let html3 = '""mp4","url":   "https://aabb1.com", \'mp4\', \'url\': \'http://www.bb.com1\', "mp4","url":"https://aabb2.com"';
    it(html3, function() {
        let video_urls = ParseVideo.extract_all_mp4_urls('', html3);
        assert.equal(video_urls.length, 2);
        assert.equal(video_urls[0], "https://aabb1.com");
        assert.equal(video_urls[1], "https://aabb2.com");
    });  
    let html4 = '"mp4","url":   "http2//aabb1.com"w.google.com"';
    it(html4, function() {
        let video_urls = ParseVideo.extract_all_mp4_urls('', html4);
        assert.isNull(video_urls);
    });  
});

