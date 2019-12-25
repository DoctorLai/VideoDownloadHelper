'use strict';

let ipaddress = '';
getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses.
    ipaddress = ips.join('-');
});

let m3u8_url = "https://uploadbeta.com/api/video/test.m3u8";

// save settings
const saveSettings = (showMsg = true) => {
    let settings = {};
    settings['lang'] = $('select#lang').val();
    settings['key'] = $('input#key').val().trim();
    settings['m3u8'] = m3u8_url;
    chrome.storage.sync.set({ 
        video_downloader_settings: settings
    }, function() {
        if (showMsg) {
            alert(get_text('alert_save'));
        }
    });
}

// log in the textarea
const logit = (dom, msg, showtime = true) => {
    if ((msg == undefined) || (msg == null)) {
        return;
    }
    let s = dom.val();
    if (showtime) {
        let d = new Date();
        let n = d.toLocaleTimeString();            
        dom.val((s + "\n" + n + ": " + msg).trim());
    } else {
        dom.val((s + "\n" + msg).trim());
    }
}

// use server API
const callAPI = (key, url) => {
    let api = "https://uploadbeta.com/api/video/?cached&video=" + encodeURIComponent(url) + "&hash=" + key;
    console.log(api);
    return new Promise((resolve, reject) => {
        fetch(api, {mode: 'cors'})
        .then(validateResponse)
        .then(readResponseAsJSON)
        .then(function(result) {
            if (result["urls"]) {
                resolve(result["urls"]);
            } else if (result['url']) {
                resolve(result['url']);
            } else {
                reject("parse error " + key);
                logit($('textarea#about'), "parse error " + key);
            }
        }).catch(function(error) {
            logit($('textarea#about'), 'key error: ' + key);
            reject("error " + key);
        });
    });     
}

// display video url
function setUrlOffline(url, url2 = '') {
    if (url.includes("weibomiaopai.com")) { // alternative 
        $('div#down').html("<h3>" + get_text("videos_list") + "</h3><ul><li><a target=_blank rel=nofollow href='" + url + "'>" + "<i><font color=gray>" + url + "</font></i></a></li></ul>");
        let key = $('input#key').val().trim();
        if (key) {
            callAPI(key, url2).then((video) => {
                if ((video != null) && (video.constructor == Array)) {
                    setUrlOfflineArray(video);
                } else {
                    $('div#down').html("<h3>" + get_text("videos_list") + "</h3><ul><li><a target=_blank rel=nofollow href='" + video + "'>" + video + "</a></li></ul>");
                }
            });
        }
    } else {
        $('div#down').html("<h3>" + get_text("videos_list") + "</h3><ul><li><a target=_blank rel=nofollow href='" + url + "'>" + url + "</a></li></ul>");
    }    
}

// display more than 1 video urls
function setUrlOfflineArray(urls) {
    let urls_length = urls.length;
    let s = "<h3>"+ get_text("videos_list") + "</h3>";
    s += "<ol>";
    for (let i = 0; i < urls_length; ++i) {
        s += "<li><a target=_blank rel=nofollow href='" + urls[i] + "'>" + urls[i].TrimToLength(max_url_length) + "</a></li>";
    }
    s += "</ol>";
    $('div#down').html(s);
}

document.addEventListener('DOMContentLoaded', function() {   
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });

    // load settings
    chrome.storage.sync.get('video_downloader_settings', function(data) {
        if (data && data.video_downloader_settings) {
            let settings = data.video_downloader_settings;
            let lang = settings['lang'];
            let key = settings['key'];
            if (settings['m3u8']) {
                m3u8_url = settings['m3u8'];
            }
            $("select#lang").val(lang);
            if (key) {
                $("input#key").val(key);
            }
        } else {
            // first time set default parameters
        }
        // about
        let manifest = chrome.runtime.getManifest();    
        let app_name = manifest.name + " v" + manifest.version;
        // version number
        $('textarea#about').val(get_text('application') + ': ' + app_name + '\n' + get_text('chrome_version') + ': ' + getChromeVersion());

        // translate
        ui_translate();
    });
    // save settings when button 'save' is clicked
    $('button#setting_save_btn').click(function() {
        saveSettings();
        // translate
        ui_translate();        
    });  

    // expand m3u8 video list
    const process_m3u8 = (url) => {
        if (url.endsWith("m3u8") || (url.includes("m3u8?"))) {
            let tmp = url.lastIndexOf("/");
            if (tmp != -1) {
                let base_url = url.substr(0, tmp + 1);
                let m3u8 = url;
                $.ajax({
                    type: "GET",
                    url: m3u8,
                    success: function(data) {
                        let lines = data.trim().split(/\s*[\r\n]+\s*/g);
                        let len = lines.length;
                        let m3u8arr = [];
                        for (let i = 0; i < len; ++i) {
                            let line = $.trim(lines[i]);
                            if ((line != null) && (line != '') && (line.length > 2) && (line[0] != '#')) {
                                if ((line.startsWith("http://") || line.startsWith("https://") || line.startsWith("ftp://"))) {
                                    m3u8arr.push(line);
                                } else {
                                    let theurl = base_url + line;
                                    m3u8arr.push(theurl);
                                }
                            }
                        }
                        if (m3u8arr.length == 1) {
                            setUrlOffline(m3u8arr[0]);
                        } else {
                            setUrlOfflineArray(m3u8arr);
                        }
                    },
                    error: function(request, status, error) {},
                    complete: function(data) {}
                });
            }
        }
    }

    let pageurl = '';
    chrome.tabs.getSelected(null, function(tab) {
        pageurl = tab.url;

        let domain = extractDomain(pageurl).toLowerCase();        
        if (!domain.includes('youtube.com')) {
            let s;
            if ($('select#lang').val() != 'en-us') {
                s = 'https://weibomiaopai.com/?url=' + encodeURIComponent(pageurl);
            } else {
                s = 'https://weibomiaopai.com/download-video-parser.php?url=' + encodeURIComponent(pageurl);
            }
            setUrlOffline(s, pageurl);
        } else {
            $('div#down').html("<BR/>" + "<blockquote>" + get_text('youtube_notice') + "</blockquote>");
            $('button#m3u8').hide();
            $('button#links').hide();
            $('button#pic').hide();
            $('button#vid').hide();
            $('#text_setting').hide();
            $('#text_log').hide();
        }

        $("#m3u8").click(function() {
            let the_m3u8_url = prompt(".m3u8 URL", m3u8_url);
            if (the_m3u8_url) {
                m3u8_url = the_m3u8_url;
                saveSettings(false);
                process_m3u8(m3u8_url);
            }
        });

        $("#pic").click(function() {
            $('div#down').html(get_text("not_found"));
            let domain = pageurl.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
            if (pageurl.startsWith("http://")) {
                domain = "http://" + domain;
            } else if (pageurl.startsWith("https://")) {
                domain = "https://" + domain;
            }
            $.ajax({
                type: "GET",
                url: pageurl,
                success: function(data) {
                    let tmp = [];
                    let re = /<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/ig;
                    let found = re.exec(data);
                    while (found != null) {
                        let tmp_url = found[1];
                        if ((tmp_url != null) && (tmp_url.length > 0)) {
                            if (tmp_url.startsWith("http://") || tmp_url.startsWith("https://")) {
                                tmp.push(tmp_url);
                            } else {
                                if (tmp_url[0] == '/') {
                                    tmp.push(domain + tmp_url);
                                } else {
                                    tmp.push(domain + '/' + tmp_url);
                                }
                            }
                        }
                        found = re.exec(data);
                    }
                    if (tmp.length > 0) {
                        // remove duplicate
                        tmp = tmp.uniq();
                        let s = "<h3>" + get_text("images_list") + "</h3>";
                        s += "<ol>";
                        for (let i = 0; i < tmp.length; ++i) {
                            s += "<li><a target=_blank href='" + tmp[i] + "'>" + tmp[i] + "</a>";
                        }
                        s += "</ol>";
                        $('div#down').html(s);
                    }
                },
                error: function(request, status, error) {},
                complete: function(data) {}
            });
        });

        $("#vid").click(function() {
            $('div#down').html(get_text("not_found"));
            let domain = pageurl.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
            if (pageurl.startsWith("http://")) {
                domain = "http://" + domain;
            } else if (pageurl.startsWith("https://")) {
                domain = "https://" + domain;
            }
            $.ajax({
                type: "GET",
                url: pageurl,
                success: function(data) {
                    let tmp = [];
                    let re = /src\s*=\s*['\"]([^'\"]*\.mp4?)['\"][^>]*?>/ig;
                    let found = re.exec(data);
                    while (found != null) {
                        let tmp_url = found[1];
                        if ((tmp_url != null) && (tmp_url.length > 0)) {
                            if (tmp_url.startsWith("http://") || tmp_url.startsWith("https://")) {
                                tmp.push(tmp_url);
                            } else {
                                if (tmp_url[0] == '/') {
                                    tmp.push(domain + tmp_url);
                                } else {
                                    tmp.push(domain + '/' + tmp_url);
                                }
                            }
                        }
                        found = re.exec(data);
                    }
                    if (tmp.length > 0) {
                        // remove duplicate
                        tmp = tmp.uniq();
                        let s = "<h3>" + get_text("videos_list") + "</h3>";
                        s += "<ol>";
                        for (let i = 0; i < tmp.length; ++i) {
                            s += "<li><a target=_blank href='" + tmp[i] + "'>" + tmp[i] + "</a>";
                        }
                        s += "</ol>";
                        $('div#down').html(s);
                    }
                },
                error: function(request, status, error) {},
                complete: function(data) {}
            });
        });

        $("#links").click(function() {
            $('div#down').html(get_text("not_found"));
            let domain = pageurl.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];
            if (pageurl.startsWith("http://")) {
                domain = "http://" + domain;
            } else if (pageurl.startsWith("https://")) {
                domain = "https://" + domain;
            }
            $.ajax({
                type: "GET",
                url: pageurl,
                success: function(data) {
                    let tmp = [];
                    let re = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*))/ig;
                    let found = re.exec(data);
                    while (found != null) {
                        let tmp_url = found[0];
                        if ((tmp_url != null) && (tmp_url.length > 0)) {
                            if (tmp_url.startsWith("http://") || tmp_url.startsWith("https://")) {
                                tmp.push(tmp_url);
                            } else {
                                if (tmp_url[0] == '/') {
                                    tmp.push(domain + tmp_url);
                                } else {
                                    tmp.push(domain + '/' + tmp_url);
                                }
                            }
                        }
                        found = re.exec(data);
                    }
                    if (tmp.length > 0) {
                        tmp = tmp.uniq();
                        let s = "<h3>" + get_text("links_list") + "</h3>";
                        s += "<ol>";
                        for (let i = 0; i < tmp.length; ++i) {
                            s += "<li><a target=_blank href='" + tmp[i] + "'>" + tmp[i] + "</a>";
                        }
                        s += "</ol>";
                        $('div#down').html(s);
                    }
                },
                error: function(request, status, error) {},
                complete: function(data) {}
            });
        });
    });
    
    // get video url from getPageSource.js
    chrome.runtime.onMessage.addListener(function(request, sender) {
        if (request.action == "getSource") {
            let url = JSON.parse(request.source);
            if ((url != null) && (url.constructor == Array)) {
                if (url.length == 1) {
                    setUrlOffline(url[0]);
                    process_m3u8(url);
                } else {
                    setUrlOfflineArray(url);
                }
            } else if (url) {
                url = $.trim(url);
                if (url.length > 0) {
                    setUrlOffline(url);
                    process_m3u8(url);
                }
            }
        }
    });

    // append tested urls to log memo
    const url = 'https://raw.githubusercontent.com/DoctorLai/VideoDownloadHelper/master/video-url-parser/tested-urls.txt';
    fetch(url).then((response) => {
        return response.text().then(function(text) {
            $('textarea#about').val($('textarea#about').val() + "\n****Tested URLs****:\n" + text);
        });        
    });
}, false);