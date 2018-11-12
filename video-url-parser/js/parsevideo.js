/* jshint -W097 */
/* jshint -W117 */
"use strict";

class ParseVideo {
    constructor(url, html = "") {
        this.url = url;
        this.html = html;
    }

    static Parse(html) {
        return html;
    }

    ParseHTML() {                
        this.Parse(this.html);
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		ParseVideo
	};
}