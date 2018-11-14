/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { extractDomain } = require( '../js/functions' )  ;

class ParseVideo {
    constructor(url, html = "") {
        this.url = url;
        this.html = html;
    }

    Parse() {
        let domain = extractDomain(this.url);
        if (domain.includes("miaopai.com")) {
            return ParseVideo.parse_miaopai_com(this.url, this.html);
        }
        return null;
    }

    static parse_miaopai_com(url, html) {
        let re = /.*miaopai\.com\/show\/(.*)\.html?$/i;
        let found = re.exec(url);
        if (found !== null) {
            return "http://gslb.miaopai.com/stream/" + found[1] + ".mp4";
        } 
        return null;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		ParseVideo
	};
}