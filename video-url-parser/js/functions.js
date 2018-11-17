/* jshint -W097 */
/* jshint -W117 */
"use strict";

// truncate the long URLs.
String.prototype.trim2 = function (length) {
	return this.length > length ? this.substring(0, length) + "..." : this;
};

const getChromeVersion = () => {     
	let raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
	return raw ? parseInt(raw[2], 10) : false;
};

const getLocalIPs = (callback) => {
    let ips = [];

    let RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    let pc = new RTCPeerConnection({
        // Don't specify any stun/turn servers, otherwise you will
        // also find your public IP addresses.
        iceServers: []
    });
    // Add a media line, this is needed to activate candidate gathering.
    pc.createDataChannel('');
    
    // onicecandidate is triggered whenever a candidate has been found.
    pc.onicecandidate = function(e) {
        if (!e.candidate) { // Candidate gathering completed.
            pc.close();
            callback(ips);
            return;
        }
        let ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
        if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
            ips.push(ip);
    };
    pc.createOffer(function(sdp) {
        pc.setLocalDescription(sdp);
    }, function onerror() {});
};

// console.log in the background page
const bglog = (obj) => {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({type: "bglog", obj: obj});
    }
};

// extract domain of url
const extractDomain = (url) => {
    let domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    //find & remove port number
    domain = domain.split(':')[0];
    return domain.toLowerCase().replace("www.", "");
};

// read as text
const readResponseAsText = (response) => {
    return response.text();
};

// read as json
const readResponseAsJSON = (response) => { 
    return response.json(); 
};

// check if valid response
const validateResponse = (response) => { 
    if (!response.ok) { 
        throw Error(response.statusText); 
    } 
    return response; 
};

const ValidURL = (url) => {
    // if parameter is array, then we check all its elements
    if (url instanceof Array) {
        for (let i = 0; i < url.length; ++ i) {
            // recursion call
            if (!ValidURL(url[i])) { // arguments.callee - strict mode
                return false;
            }
        }
        return true;
    }
    if (url == null) {
        return false;
    }        
    if (url == "") {
        return false;
    }
    if (url.length <= 7) {
        return false;
    }
    function _ValidURL(url) {
        return /^(https?:)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/{1,2}((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
    }    
    if (_ValidURL(url)) {
        return true;
    }
    if (url.length > 5) {            
        if (url.startsWith("http:\\/\\/") || url.startsWith("https:\\/\\/")) {
            return _ValidURL(url.replace(/\\\//g, "/"));
        }
    }
    return false;
};    

function FixURL(url) {        
    if (url && (url.length !== undefined)) {
        if (url.length > 5) {
            if (url.startsWith("http:\\/\\/") || url.startsWith("https:\\/\\/")) {
                return url.replace(/\\\//g, "/");
            }
        }        
        if (url.length > 5) {
            if ((url.charAt(0) == '/') && (url.charAt(1) == '/')) {
                return "http:" + url;
            }
        }
    }
    return url;
}

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		getParameterByName, FixURL, extractDomain, ValidURL
	};
}

// remove duplicate urls in array
Array.prototype.uniq = function () {
    let data = [];
    // convert arguments (special object) to array
    const arr = [].slice.apply(this, arguments, 0);
    for (let x of arr) {
        if (!data.includes(x)) {
            data.push(x);
        }
    }
    return data;
}