/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { ValidURL, extractDomain, FixURL } = require( '../js/functions' )  ;

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
        video_url = ParseVideo.extract_all_video_urls(this.url, this.html);
        if (video_url !== null) {
            return video_url;
        }
        video_url = ParseVideo.extract_all_mp4_urls(this.url, this.html);
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
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		ParseVideo
	};
}