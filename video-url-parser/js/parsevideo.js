/* jshint -W097 */
/* jshint -W117 */
"use strict";

/*
 * The site-specific parsers rely on hand-tuned regular expressions that keep
 * explicit escape characters for readability, so the cosmetic
 * `no-useless-escape` rule is disabled for the whole file.
 */
/* eslint-disable no-useless-escape */

const { ValidURL, extractDomain, FixURL, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS } = require("../js/functions");

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

        const handler = {
            "miaopai.com": ParseVideo.parse_miaopai_com,
            "pearvideo.com": ParseVideo.parse_pearvideo_com,
            "ted.com": ParseVideo.parse_ted_com,
            "msdn.com": ParseVideo.parse_msdn_com,
            "weibo.com": ParseVideo.parse_weibo_com,
            "xiaokaxiu.com": ParseVideo.parse_xiaokaxiu_com,
            "facebook.com": ParseVideo.parse_facebook_video,
            "dailymotion.com": ParseVideo.parse_dailymotion_com,
            "vimeo.com": ParseVideo.parse_vimeo_com,
        };
        const vKeys = Object.keys(handler);
        for (let i = 0; i < vKeys.length; ++i) {
            if (domain.includes(vKeys[i])) {
                video_url = handler[vKeys[i]](this.url, this.html);
                if (ValidURL(video_url)) {
                    return video_url;
                }
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
        // get the <source src> children of <video>/<audio> tags
        video_url = ParseVideo.extract_all_source_tags(this.url, this.html);
        if (video_url !== null) {
            return video_url;
        }
        // get any HLS (.m3u8) playlist URLs embedded in the page
        video_url = ParseVideo.extract_all_m3u8_urls(this.url, this.html);
        if (video_url !== null) {
            return video_url;
        }
        // last resort: any direct links to downloadable media files (mp4, webm,
        // mkv, mov, mp3, ...) found anywhere in the page
        video_url = ParseVideo.extract_all_media_urls(this.url, this.html);
        if (video_url !== null) {
            return video_url;
        }
        return null;
    }

    // parse msdn.com video e.g. https://channel9.msdn.com/Events/Visual-Studio/Visual-Studio-2017-Launch/T108
    static parse_msdn_com(url, html) {
        const re = /\<meta\s+property\s*=\s*(['"])og:video(.*)\1\s+content=(["'])(https?:\/\/[^'",]*)\3\s*\/?\>/gi;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {
            const url = FixURL(found[4]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        const re2 = /(https?:\/\/[^'",]*\.mp4)/gi;
        let found2 = re2.exec(html);
        while (found2 !== null) {
            const url = FixURL(found2[1]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found2 = re2.exec(html);
        }
        video_url = video_url.uniq();
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse ted.com video e.g. https://www.ted.com/talks/atul_gawande_want_to_get_great_at_something_get_a_coach?language=en#t-48048
    static parse_ted_com(url, html) {
        const re = /(['"])?(low|high|file|medium)\1?:\s*(['"])(https?:[^\s'",]+)/gi;
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
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse miaopai.com video e.g. https://miaopai.com/show/abcde.html
    // this is one of the simplest form and we can get it from URL
    static parse_miaopai_com(url, _html) {
        const re = /.*miaopai\.com\/show\/(.*)\.html?$/i;
        const found = re.exec(url);
        if (found !== null) {
            return "http://gslb.miaopai.com/stream/" + found[1] + ".mp4";
        }
        return null;
    }

    // extract all video_url in html e.g. "video_url": "https://aaaabbb.com/"
    static extract_all_video_urls(url, html) {
        const re = /['"]?video_url['"]?:\s*(['"])(https?:[^\s'",]+)\1/gi;
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
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse pearvideo.com e.g. http://www.pearvideo.com/video_1050733
    static parse_pearvideo_com(url, html) {
        let video_url = [];
        const re = /([hsl]d|src)Url\s*=\s*[\"\']([^\"\']+)[\'\"]/gi;
        let found = re.exec(html);
        while (found !== null) {
            const tmp_url = FixURL(found[2]);
            if (ValidURL(tmp_url)) {
                video_url.push(tmp_url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // extract all MP4 in html e.g. "mp4","url":"https://aabb.com"
    static extract_all_mp4_urls(url, html) {
        const re = /mp4[\'\"]\s*,\s*[\'\"]url[\'\"]\s*:\s*[\'\"]([^\"\']+)[\'\"]/gi;
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
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse weibo.com video e.g. https://www.weibo.com/2142058927/Eg0OBB5A5?type=comment
    static parse_weibo_com(url, html) {
        const re = /video_src\s*=([^\\&]+unistore(\,|%2C)video)/gi;
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
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse xiaokaxiu.com video e.g. https://v.xiaokaxiu.com/v/fhX23JOcSbVEJOQ9LFKtOP2WBkeP1AA-.html
    static parse_xiaokaxiu_com(url, html) {
        const re = /player.swf\?scid=([^"\'&]+)/gi;
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
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse the og:video_url in header HTML
    // e.g. <meta property="og:video:url" content="https://......." />
    static parse_header_og_video_url(url, html) {
        const re = /\<meta\s+property\s*=\s*(['"])og:video(.*)\1\s+content=(["'])(https?:\/\/[^'",]*)\3\s*\/?\>/gi;
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
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse the video tag
    // e.g. <video id="player-html5" class='videoPlayer' src="https://ev-ph.ypncdn.com/videos/201807/10/173954251/480P_2000K_173954251.mp4?rate=141k&amp;burst=1400k&amp;validfrom=1543514700&amp;validto=1543529100&amp;hash=%2B3Po2O4r7uQZFHm7NCKaT1rMY5s%3D" x-webkit-airplay="allow" controls poster="https://di1-ph.ypncdn.com/m=eaAaaEPbaaaa/videos/201807/10/173954251/original/(m=eqgl9daaaa)(mh=nuY0nvopChJ7Fc-_)8.jpg"></video>
    static parse_video_tag_in_html(url, html) {
        const re = /\<video(.*)src=(["'])(https?:\/\/[^'",]*)\2/gi;
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
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse the facebook video
    // e.g. https://www.facebook.com/zhihua.lai/videos/10150166829094739/
    static parse_facebook_video(url, html) {
        let re = /['"]?hd_src_no_ratelimit['"]?: *(['"])(https?:[^\s'",]+)\1,/gi;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        re = /['"]?hd_src['"]?: *(['"])(https?:[^\s'",]+)\1,/gi;
        found = re.exec(html);
        while (found !== null) {
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        re = /['"]?sd_src_no_ratelimit['"]?: *(['"])(https?:[^\s'",]+)\1,/gi;
        found = re.exec(html);
        while (found !== null) {
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        re = /['"]?sd_src['"]?: *(['"])(https?:[^\s'",]+)\1,/gi;
        found = re.exec(html);
        while (found !== null) {
            const url = FixURL(found[2]);
            if (ValidURL(url)) {
                video_url.push(url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse dailymotion.com video e.g. https://www.dailymotion.com/video/x2bu0q2
    static parse_dailymotion_com(url, html) {
        let video_url = [];
        // modern HLS manifest referenced inside the player metadata JSON
        // e.g. {"type":"application/x-mpegURL","url":"https:\/\/...\/x2bu0q2.m3u8"}
        let re = /"type"\s*:\s*"application\/x-mpegURL"\s*,\s*"url"\s*:\s*"(https?:[^"]+)"/gi;
        let found = re.exec(html);
        while (found !== null) {
            const tmp_url = FixURL(found[1]);
            if (ValidURL(tmp_url)) {
                video_url.push(tmp_url);
            }
            found = re.exec(html);
        }
        // legacy progressive MP4 streams e.g. "stream_h264_hd_url":"https:\/\/...mp4"
        re = /"stream_h264[a-z0-9_]*_url"\s*:\s*"(https?:[^"]+)"/gi;
        found = re.exec(html);
        while (found !== null) {
            const tmp_url = FixURL(found[1]);
            if (ValidURL(tmp_url)) {
                video_url.push(tmp_url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // parse vimeo.com video e.g. https://vimeo.com/151712690
    static parse_vimeo_com(url, html) {
        let video_url = [];
        // progressive MP4 renditions inside the player config JSON
        // e.g. "progressive":[{...,"url":"https://...mp4",...}]
        const block = /"progressive"\s*:\s*\[([\s\S]*?)\]/i.exec(html);
        if (block !== null) {
            const re = /"url"\s*:\s*(["'])(https?:[^"']+?\.mp4[^"']*)\1/gi;
            let found = re.exec(block[1]);
            while (found !== null) {
                const tmp_url = FixURL(found[2]);
                if (ValidURL(tmp_url)) {
                    video_url.push(tmp_url);
                }
                found = re.exec(block[1]);
            }
        }
        video_url = video_url.uniq();
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // extract <source src="..."> children of <video>/<audio> elements
    // e.g. <video><source src="https://cdn.example.com/a.mp4" type="video/mp4"></video>
    static extract_all_source_tags(url, html) {
        const re = /<source\b[^>]*?\ssrc\s*=\s*(["'])(https?:\/\/[^"']+)\1/gi;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {
            const tmp_url = FixURL(found[2]);
            if (ValidURL(tmp_url)) {
                video_url.push(tmp_url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // extract HLS playlist (.m3u8) URLs embedded anywhere in the html / inline JSON
    static extract_all_m3u8_urls(url, html) {
        const re = /(https?:[^\s'"<>,]+\.m3u8[^\s'"<>,]*)/gi;
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {
            const tmp_url = FixURL(found[1]);
            if (ValidURL(tmp_url)) {
                video_url.push(tmp_url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }

    // extract direct links to downloadable media files (mp4, webm, mkv, mov,
    // mp3, ...) embedded anywhere in the html. This is the broadest fallback and
    // runs last so it only fires when the structured extractors above find
    // nothing. The extension list is shared with functions.js so new formats
    // only need to be added in one place. A path separator is required after the
    // host so a domain label like "sub.mov.example.com" is not mistaken for a
    // media file. ".m3u8" has its own dedicated extractor and is excluded here.
    static extract_all_media_urls(url, html) {
        const exts = VIDEO_EXTENSIONS.concat(AUDIO_EXTENSIONS).filter((e) => e !== "m3u8");
        const re = new RegExp(
            "(https?://[^\\s'\"<>,()\\\\]+/[^\\s'\"<>,()\\\\]+\\.(?:" +
                exts.join("|") +
                ")(?:[?#][^\\s'\"<>,()\\\\]*)?)",
            "gi"
        );
        let found = re.exec(html);
        let video_url = [];
        while (found !== null) {
            const tmp_url = FixURL(found[1]);
            if (ValidURL(tmp_url)) {
                video_url.push(tmp_url);
            }
            found = re.exec(html);
        }
        video_url = video_url.uniq();
        return video_url.length === 0 ? null : video_url.length === 1 ? video_url[0] : video_url;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
        ParseVideo,
    };
}
