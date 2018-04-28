'use strict';

String.prototype.trim2 = function (length) {
	return this.length > length ? this.substring(0, length) + "..." : this;
}

const getChromeVersion = () => {     
	let raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
	return raw ? parseInt(raw[2], 10) : false;
}

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
}

// console.log in the background page
const bglog = (obj) => {
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({type: "bglog", obj: obj});
    }
}

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
    return domain;
}

// read as text
const readResponseAsText = (response) => {
    return response.text();
}

// read as json
const readResponseAsJSON = (response) => { 
    return response.json(); 
} 

// check if valid response
const validateResponse = (response) => { 
    if (!response.ok) { 
        throw Error(response.statusText); 
    } 
    return response; 
}