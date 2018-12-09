/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { ValidURL, extractDomain, FixURL, ArrayIntersection } = require( '../js/functions' )  ;

class ParseVideo {
    constructor(url, html = "") {
        // e.g. https://www.dailymotion.com/video/x2bu0q2
        this.url = url;
        // e.g. <html>....</html>
        this.html = html;
    }

    // entry of video parser
    Parse() {
        const domain = extractDomain(this.url);
        let video_url = "";
        if (domain.includes("miaopai.com")) {
            video_url = ParseVideo.parse_miaopai_com(this.url, this.html);
            if (ValidURL(video_url)) {
                return video_url;
            }
        }        
        if (domain.includes("pearvideo.com")) {
            video_url = ParseVideo.parse_pearvideo_com(this.url, this.html);
            if (ValidURL(video_url)) {
                return video_url;
            }            
        }
        if (domain.includes("ted.com")) {
            video_url = ParseVideo.parse_ted_com(this.url, this.html);
            if (ValidURL(video_url)) {
                return video_url;
            }            
        }
        if (domain.includes("msdn.com")) {
            video_url = ParseVideo.parse_msdn_com(this.url, this.html);
            if (ValidURL(video_url)) {
                return video_url;
            }            
        }     
        if (domain.includes("weibo.com")) {
            video_url = ParseVideo.parse_weibo_com(this.url, this.html);
            if (ValidURL(video_url)) {
                return video_url;
            }            
        }          
        if (domain.includes("xiaokaxiu.com")) {
            video_url = ParseVideo.parse_xiaokaxiu_com(this.url, this.html);
            if (ValidURL(video_url)) {
                return video_url;
            }            
        }       
        if (domain.includes("facebook.com")) {
            video_url = ParseVideo.parse_facebook_video(this.url, this.html);
            return video_url;
        }     
        if (domain.includes("sese" + "p" + "orn.com")) {
            video_url = ParseVideo.parse_ssp_video(this.url, this.html);
            return video_url;
        }                                 
        video_url = ParseVideo.extract_all_video_urls(this.url, this.html);
        if (video_url !== null) {
            return video_url;
        }
        video_url = ParseVideo.extract_all_mp4_urls(this.url, this.html);
        if (video_url !== null) {
            return video_url;
        }
        // get the og:video_url from the header
        video_url = ParseVideo.parse_header_og_video_url(this.url, this.html);
        if (video_url !== null) {
            return video_url;
        }
        // get the <video src> from the html
        video_url = ParseVideo.parse_video_tag_in_html(this.url, this.html);
        if (video_url !== null) {
            return video_url;
        }
        return null;
    }

    // parse msdn.com video e.g. https://channel9.msdn.com/Events/Visual-Studio/Visual-Studio-2017-Launch/T108
    static parse_msdn_com(url, html) {
        const re = /\<meta\s+property\s*=\s*(['"])og:video(.*)\1\s+content=(["'])(https?:\/\/[^'",]*)\3\s*\/?\>/ig;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const url = FixURL(found[4]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        const re2 = /(https?:\/\/[^'",]*\.mp4)/ig;
        let found2 = re2.exec(html);
        while (found2 !== null) {  
            const url = FixURL(found2[1]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found2 = re2.exec(html);
        }
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);        
    }

    // parse ted.com video e.g. https://www.ted.com/talks/atul_gawande_want_to_get_great_at_something_get_a_coach?language=en#t-48048
    static parse_ted_com(url, html) {
        const re = /(['"])?(low|high|file|medium)\1?:\s*(['"])(https?:[^\s'",]+)/ig;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const url = FixURL(found[4]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);        
    }

    // parse miaopai.com video e.g. https://miaopai.com/show/abcde.html
    // this is one of the simplest form and we can get it from URL
    static parse_miaopai_com(url, html) {
        const re = /.*miaopai\.com\/show\/(.*)\.html?$/i;
        let found = re.exec(url);
        if (found !== null) {
            return "http://gslb.miaopai.com/stream/" + found[1] + ".mp4";
        } 
        return null;
    }

    // extract all video_url in html e.g. "video_url": "https://aaaabbb.com/"
    static extract_all_video_urls(url, html) {
        const re = /['"]?video_url['"]?:\s*(['"])(https?:[^\s'",]+)\1/ig;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);
    }

    // parse pearvideo.com e.g. http://www.pearvideo.com/video_1050733
    static parse_pearvideo_com(url, html) {
        let video_url = [];
        const re = /([hsl]d|src)Url\s*=\s*[\"\']([^\"\']+)[\'\"]/ig;
        let found = re.exec(html);
        while (found !== null) {
            const tmp_url = FixURL(found[2]); 
            if (ValidURL(tmp_url)) {
                video_url.push(tmp_url);
            }
            found = re.exec(html);
        }        
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);        
    }

    // extract all MP4 in html e.g. "mp4","url":"https://aabb.com"
    static extract_all_mp4_urls(url, html) {
        const re = /mp4[\'\"]\s*,\s*[\'\"]url[\'\"]\s*:\s*[\'\"]([^\"\']+)[\'\"]/ig;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const url = FixURL(found[1]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);
    }

    // parse weibo.com video e.g. https://www.weibo.com/2142058927/Eg0OBB5A5?type=comment
    static parse_weibo_com(url, html) {
        const re = /video_src\s*=([^\\&]+unistore(\,|%2C)video)/ig;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const url = FixURL(decodeURIComponent(found[1]));            
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);        
    }    

    // parse xiaokaxiu.com video e.g. https://v.xiaokaxiu.com/v/fhX23JOcSbVEJOQ9LFKtOP2WBkeP1AA-.html
    static parse_xiaokaxiu_com(url, html) {
        const re =  /player.swf\?scid=([^"\'&]+)/gi;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const tmp_url = "http://gslb.miaopai.com/stream/" + found[1] + ".mp4";
            const url = FixURL(tmp_url);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);        
    }      

    // parse the og:video_url in header HTML
    // e.g. <meta property="og:video:url" content="https://......." />
    static parse_header_og_video_url(url, html) {
        const re = /\<meta\s+property\s*=\s*(['"])og:video(.*)\1\s+content=(["'])(https?:\/\/[^'",]*)\3\s*\/?\>/ig;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const url = FixURL(found[4]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);        
    } 
    
    // parse the video tag
    // e.g. <video id="player-html5" class='videoPlayer' src="https://ev-ph.ypncdn.com/videos/201807/10/173954251/480P_2000K_173954251.mp4?rate=141k&amp;burst=1400k&amp;validfrom=1543514700&amp;validto=1543529100&amp;hash=%2B3Po2O4r7uQZFHm7NCKaT1rMY5s%3D" x-webkit-airplay="allow" controls poster="https://di1-ph.ypncdn.com/m=eaAaaEPbaaaa/videos/201807/10/173954251/original/(m=eqgl9daaaa)(mh=nuY0nvopChJ7Fc-_)8.jpg"></video>
    static parse_video_tag_in_html(url, html) {
        const re = /\<video(.*)src=(["'])(https?:\/\/[^'",]*)\2/ig;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const url = FixURL(found[3]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);        
    }        

    // parse the facebook video
    // e.g. https://www.facebook.com/zhihua.lai/videos/10150166829094739/
    static parse_facebook_video(url, html) {
        let re = /['"]?hd_src_no_ratelimit['"]?: *(['"])(https?:[^\s'",]+)\1,/ig;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {  
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        re = /['"]?hd_src['"]?: *(['"])(https?:[^\s'",]+)\1,/ig;
        found = re.exec(html);
        while (found !== null) {  
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        re = /['"]?sd_src_no_ratelimit['"]?: *(['"])(https?:[^\s'",]+)\1,/ig;
        found = re.exec(html);
        while (found !== null) {  
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }        
        re = /['"]?sd_src['"]?: *(['"])(https?:[^\s'",]+)\1,/ig;     
        found = re.exec(html);   
        while (found !== null) {  
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }              
        video_url = video_url.uniq();
        return (video_url.length === 0) ? null :
               ( (video_url.length === 1) ? video_url[0] : video_url);            
    }

    // parse ssp.com video e.g. https://www.ssp*.com/videos/8395/900/
    static parse_ssp_video(url, html) {
        const re = /https?:\/\/(www.)?[a-zA-Z]+\.com\/get_file\/([0-9]+)\/([a-z0-9]{32})\/([0-9]+)\/([0-9]+)\/([0-9]+)\.mp4\/\?br=([0-9]+)/ig;
        let found = re.exec(html);
        if (found == null) {
            return null;
        }
        // get the mapping
        const id = ParseVideo._sse_reverse_engineering_helper(found[3]);
        // decrypte it and replace
        let surl = found[0].replace(found[3], id);
        return surl + "&rnd=" + ((new Date()).getTime() + 500);
    }      

    // reverse engineering helper function for ssp
    // to solve a mapping relations between two 32-character IDs
    static _sse_reverse_engineering_helper(source) {
        // known mappings
        const arr = {
            "27663617dc59e052bf3e2c671ca6a73c": "d7c6ec235367cb2a1279ef6a6061c573",
            "07b3a7920ee0ee63a329e6caf223cbac": "07e3e6e2eab2ca3290b0937c3ecf26aa",
            "3ec8852551e4ac36e981c555230868d1": "5e18a5c8edc51e60238419568c523358",
            "68b8f34e248b19a6acf92a1ef1587c8c": "28481a2f88beca6546cb9c37891f1aef",
            "1b34453212843b5e5a6443a97bd0b50f": "1b2433468032f5ed31544a5b0ba7b594",
            "9d1e9aa135872b85749ed602cc6ac68a": "3d5e26d98811a756a967e4acab0cc829"
        };
        let data = [];
        for (let i = 0; i < 32; ++ i) {
            let map = [];
            let keys = Object.keys(arr);
            keys.forEach(function(key) {
                let val = arr[key];
                let x = key[i];
                let s = "";
                for (let j = 0; j < 32; ++ j) {
                    if (val[j] == x) {
                        s += (j + ",");
                    }
                }
                if (s.length > 0 && s[s.length - 1] === ',') {
                    s = s.slice(0, -1);
                }
                if (map.length == 0) {
                    map = s.split(',');
                } else {
                    // narrow down the answers
                    map = ArrayIntersection(map, s.split(','));
                }
            });
            if (map.length > 0) {
                data[map[0]] = i;
            }
        }
        let s = '';
        for (let i = 0; i < 32; ++ i) {
            if (data[i] !== undefined) {
                // restore the mapping
                s += source[data[i]];
            }
        }
        return s;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		ParseVideo
	};
}