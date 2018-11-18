/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
let { ParseVideo } = require('../js/parsevideo');
const fs  = require("fs");

describe('weibo.com', function() {
    let url = 'https://www.weibo.com/2142058927/Eg0OBB5A5?type=comment';
    it(url, function() {
        let html = fs.readFileSync('test/data/weibo-1.html').toString();
        let video = new ParseVideo(url, html);
        let video_urls = video.Parse();
        assert.deepEqual(video_urls, [ 
            "http://f.us.sinaimg.cn/0049exBQlx07piGD4ePu010402014JM00k010.mp4?label=mp4_hd&template=852x480.25.0&Expires=1542573069&ssig=Oj%2B2qiajy4&KID=unistore,video",
            "http://gslb.ins.miaopai.com/stream/ins_fEVqE0rZcMYYAXeNszZgvvUo3YZ0UUzv.mp4?mpflag=32&time_stamp=1542514291761&Expires=1542573042&ssig=X6ofK75r9T&KID=unistore,video",
            "http://f.us.sinaimg.cn/000zW3l1lx07phZKzFfG01040200y3t50k010.mp4?label=mp4_hd&template=854x480.28.0&Expires=1542573086&ssig=3uv9CiQdF5&KID=unistore,video",
            "http://us.sinaimg.cn/0045s1OJjx076OX2kSMw010401004qpt0k01.mp4?label=mp4_hd&Expires=1542573118&ssig=U1nBnsbRW5&KID=unistore,video"
        ]);
    });   
});
