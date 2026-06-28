/* jshint -W097 */
/* jshint -W117 */
"use strict";

/*
 * The URL/parsing patterns in this module intentionally keep explicit escape
 * characters for readability and defensive matching, so the cosmetic
 * `no-useless-escape` rule is disabled for the whole file.
 */
/* eslint-disable no-useless-escape */

// truncate the long URLs.
String.prototype.TrimToLength = function (length) {
    return this.length > length ? this.substring(0, length) + "..." : this;
};

const getChromeVersion = () => {
    const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
};

const getLocalIPs = (callback) => {
    const ips = [];

    const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    const pc = new RTCPeerConnection({
        // Don't specify any stun/turn servers, otherwise you will
        // also find your public IP addresses.
        iceServers: [],
    });
    // Add a media line, this is needed to activate candidate gathering.
    pc.createDataChannel("");

    // onicecandidate is triggered whenever a candidate has been found.
    pc.onicecandidate = function (e) {
        if (!e.candidate) {
            // Candidate gathering completed.
            pc.close();
            callback(ips);
            return;
        }
        const match = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate);
        if (!match) {
            return;
        }
        const ip = match[1];
        // avoid duplicate entries (tcp/udp)
        if (ips.indexOf(ip) === -1) {
            ips.push(ip);
        }
    };
    pc.createOffer(
        function (sdp) {
            pc.setLocalDescription(sdp);
        },
        function onerror() {}
    );
};

// console.log in the background page
const bglog = (obj) => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.sendMessage({ type: "bglog", obj: obj });
    }
};

// extract domain of url
const extractDomain = (url) => {
    if (typeof url === "undefined" || !url) {
        return "";
    }
    let domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split("/")[2];
    } else {
        domain = url.split("/")[0];
    }
    //find & remove port number
    domain = domain.split(":")[0];
    // strip only a leading "www." (avoid corrupting domains such as "awww.com")
    return domain.toLowerCase().replace(/^www\./, "");
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
    if (url == null) {
        return false;
    }
    if (url.includes("blob:http://")) {
        return false;
    }
    // if parameter is array, then we check all its elements
    if (url instanceof Array) {
        for (let i = 0; i < url.length; ++i) {
            // recursion call
            if (!ValidURL(url[i])) {
                // arguments.callee - strict mode
                return false;
            }
        }
        return true;
    }
    if (url === "") {
        return false;
    }
    if (url.length <= 7) {
        return false;
    }
    function _ValidURL(url) {
        return /^(https?:)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/{1,2}((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(
            url
        );
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
    if (url && url.length !== undefined) {
        if (url.length > 5) {
            if (url.startsWith("http:\\/\\/") || url.startsWith("https:\\/\\/")) {
                return url.replace(/\\\//g, "/");
            }
        }
        if (url.length > 5) {
            if (url.charAt(0) === "/" && url.charAt(1) === "/") {
                return "http:" + url;
            }
        }
    }
    return url;
}

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// remove duplicate urls in array using ES6 syntax - just beautiful
Array.prototype.uniq = function () {
    return [...new Set(this)];
};

// return the intersection between two arrays
const ArrayIntersection = (a, b) => {
    const setB = new Set(b);
    return [...new Set(a)].filter((x) => setB.has(x));
};

// get the lowercased file extension (without the dot) from a URL, ignoring any
// query string or fragment. Returns "" when there is no usable extension.
const getFileExtension = (url) => {
    if (!url || typeof url !== "string") {
        return "";
    }
    const path = url.split(/[?#]/)[0];
    const slash = path.lastIndexOf("/");
    const name = slash === -1 ? path : path.substring(slash + 1);
    const dot = name.lastIndexOf(".");
    if (dot === -1 || dot === name.length - 1) {
        return "";
    }
    return name.substring(dot + 1).toLowerCase();
};

// remove characters that are illegal in filenames on common platforms so the
// result is safe to hand to chrome.downloads.download({ filename }).
const sanitizeFilename = (name) => {
    if (!name || typeof name !== "string") {
        return "";
    }
    return name
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^\.+/, "")
        .substring(0, 120)
        .trim();
};

// build a safe, human-friendly download filename from a page title and the
// media URL. An optional zero-based index disambiguates batch downloads.
const suggestFilename = (url, title, index) => {
    let base = sanitizeFilename(title || "");
    if (!base) {
        base = "video";
    }
    if (typeof index === "number" && index >= 0) {
        base += "-" + (index + 1);
    }
    const ext = getFileExtension(url);
    return ext ? base + "." + ext : base;
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
        getChromeVersion,
        getLocalIPs,
        bglog,
        readResponseAsText,
        readResponseAsJSON,
        validateResponse,
        getParameterByName,
        FixURL,
        extractDomain,
        ValidURL,
        ArrayIntersection,
        getFileExtension,
        sanitizeFilename,
        suggestFilename,
    };
}
