'use strict';

let m3u8_url = "https://uploadbeta.com/api/video/test.m3u8";

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// save settings
const saveSettings = (showMsg = true) => {
    let settings = {};
    settings['lang'] = $('select#lang').val();
    settings['key'] = $('input#key').val().trim();
    settings['m3u8'] = m3u8_url;
    settings['dark'] = $('input#dark').is(':checked');
    chrome.storage.sync.set({
        video_downloader_settings: settings
    }, function() {
        if (showMsg) {
            vdhToast(get_text('alert_save'));
        }
    });
};

// log in the textarea
const logit = (dom, msg, showtime = true) => {
    if ((msg == undefined) || (msg == null)) {
        return;
    }
    const s = dom.val();
    if (showtime) {
        const d = new Date();
        const n = d.toLocaleTimeString();
        dom.val((s + "\n" + n + ": " + msg).trim());
    } else {
        dom.val((s + "\n" + msg).trim());
    }
}

// use server API
const callAPI = (key, url) => {
    const api = "https://video.justyy.workers.dev/api/video/?cached&from=simplevideodownloader&video=" + encodeURIComponent(url) + "&hash=" + key;
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

// page title of the active tab, used to suggest download filenames
let vdhPageTitle = "";

// escape a string for safe inclusion inside single-quoted HTML attributes/text
function vdhEscapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// true when the URL points at a concrete media/file we can download directly.
// Delegates to the shared classifier in functions.js (loaded before this file).
function vdhIsDownloadable(url) {
    if (typeof url !== "string") {
        return false;
    }
    return isDownloadableMediaUrl(url);
}

// show a short, auto-dismissing toast message in the popup
function vdhToast(msg) {
    const t = $("#vdh-toast");
    if (!msg || t.length === 0) {
        return;
    }
    t.text(msg).stop(true, true).fadeIn(120).delay(1300).fadeOut(450);
}

// copy text to the clipboard with user feedback
function vdhCopy(text) {
    if (!text) {
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            vdhToast(get_text("copied", "Copied!"));
        }, function() {
            vdhToast(get_text("copy_failed", "Copy failed"));
        });
    } else {
        vdhToast(get_text("copy_failed", "Copy failed"));
    }
}

// download a single URL with chrome.downloads, falling back to a new tab if the
// browser blocks the programmatic download
function vdhDownload(url, index) {
    if (!url) {
        return;
    }
    if (typeof chrome !== "undefined" && chrome.downloads && chrome.downloads.download) {
        const filename = suggestFilename(url, vdhPageTitle, typeof index === "number" ? index : -1);
        chrome.downloads.download({ url: url, filename: filename }, function() {
            if (chrome.runtime && chrome.runtime.lastError) {
                window.open(url, "_blank");
            }
        });
    } else {
        window.open(url, "_blank");
    }
}

// build a single <li> with the link plus Download/Copy action buttons
function vdhMediaItem(url, index, forceDownload) {
    const safe = vdhEscapeHtml(url);
    const shown = vdhEscapeHtml(url.TrimToLength(max_url_length));
    const type = getMediaType(url);
    let s = "<li><a target=_blank rel=nofollow href='" + safe + "'>" + shown + "</a> ";
    if (type) {
        s += "<span class='vdh-tag vdh-tag-" + type + "'>" + type + "</span> ";
    }
    if (forceDownload || vdhIsDownloadable(url)) {
        s += "<button type='button' class='vdh-btn vdh-dl' data-url='" + safe + "' data-index='" + index + "'>" +
            vdhEscapeHtml(get_text("download", "Download")) + "</button> ";
    }
    s += "<button type='button' class='vdh-btn vdh-copy' data-url='" + safe + "'>" +
        vdhEscapeHtml(get_text("copy", "Copy")) + "</button></li>";
    return s;
}

// render a titled list of media URLs with per-item and bulk action buttons
function vdhRenderList(titleKey, urls, forceDownload) {
    const list = (urls || []).filter(function(u) {
        return typeof u === "string" && u.length > 0;
    });
    const title = get_text(titleKey, titleKey);
    const anyDownloadable = forceDownload || list.some(vdhIsDownloadable);
    let s = "<h3>" + title + (list.length ? " (" + list.length + ")" : "") + "</h3>";
    s += "<div class='vdh-toolbar'>";
    if (anyDownloadable) {
        s += "<button type='button' class='vdh-btn' id='vdh-dl-all'>" +
            vdhEscapeHtml(get_text("download_all", "Download All")) + "</button> ";
    }
    s += "<button type='button' class='vdh-btn' id='vdh-copy-all'>" +
        vdhEscapeHtml(get_text("copy_all", "Copy All")) + "</button>";
    s += "</div><ol>";
    for (let i = 0; i < list.length; ++i) {
        s += vdhMediaItem(list[i], i, forceDownload);
    }
    s += "</ol>";
    return s;
}

// display video url
function setUrlOffline(url, url2 = '') {
    if (url.includes("weibomiaopai.com")) { // alternative
        $('div#down').html(vdhRenderList("videos_list", [url]));
        const key = $('input#key').val().trim();
        if (key) {
            callAPI(key, url2).then((video) => {
                if ((video != null) && (video.constructor == Array)) {
                    setUrlOfflineArray(video);
                } else {
                    $('div#down').html(vdhRenderList("videos_list", [video]));
                }
            });
        }
    } else {
        $('div#down').html(vdhRenderList("videos_list", [url]));
    }
}

// display more than 1 video urls
function setUrlOfflineArray(urls) {
    $('div#down').html(vdhRenderList("videos_list", urls));
}

document.addEventListener('DOMContentLoaded', async function() {
    // init tabs
    $(function() {
        $( "#tabs" ).tabs();
    });

    // load settings
    chrome.storage.sync.get('video_downloader_settings', function(data) {
        if (data && data.video_downloader_settings) {
            const settings = data.video_downloader_settings;
            const lang = settings['lang'];
            const key = settings['key'];
            if (settings['m3u8']) {
                m3u8_url = settings['m3u8'];
            }
            $("select#lang").val(lang);
            if (key) {
                $("input#key").val(key);
            }
            if (settings['dark']) {
                $("body").addClass("vdh-dark");
                $("input#dark").prop("checked", true);
            }
        } else {
            // first time set default parameters
        }
        // about
        const manifest = chrome.runtime.getManifest();
        const app_name = manifest.name + " v" + manifest.version;
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

    // dark mode toggle
    $('input#dark').change(function() {
        if ($(this).is(':checked')) {
            $('body').addClass('vdh-dark');
        } else {
            $('body').removeClass('vdh-dark');
        }
        saveSettings(false);
    });

    // delegated actions for the dynamically-rendered media lists
    $('#down').on('click', '.vdh-dl', function() {
        const idx = parseInt($(this).attr('data-index'), 10);
        vdhDownload($(this).attr('data-url'), isNaN(idx) ? -1 : idx);
    });
    $('#down').on('click', '.vdh-copy', function() {
        vdhCopy($(this).attr('data-url'));
    });
    $('#down').on('click', '#vdh-dl-all', function() {
        $('#down ol li .vdh-dl').each(function() {
            const idx = parseInt($(this).attr('data-index'), 10);
            vdhDownload($(this).attr('data-url'), isNaN(idx) ? -1 : idx);
        });
    });
    $('#down').on('click', '#vdh-copy-all', function() {
        const urls = [];
        $('#down ol li a').each(function() {
            urls.push($(this).attr('href'));
        });
        vdhCopy(urls.join("\n"));
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
    let tab = await getCurrentTab();
    vdhPageTitle = (tab && tab.title) ? tab.title : "";

    //chrome.tabs.query({ currentWindow: true, active: true }, (tab) => {
    if (true) {
        pageurl = tab.url;

        const restricted = isRestrictedUrl(pageurl);
        let domain = restricted ? "" : extractDomain(pageurl).toLowerCase();
        if (restricted) {
            // Browser-internal / restricted pages (chrome://, the Web Store, ...)
            // cannot be read or injected into, so page scanning is unavailable.
            $('div#down').html("<BR/>" + "<blockquote>" + get_text('restricted_page_notice', "This page isn't supported. Open a normal web page (http/https) and reopen the extension.") + "</blockquote>");
            $('button#merger').hide();
            $('button#links').hide();
            $('button#pic').hide();
            $('button#vid').hide();
        } else if (!domain.includes('youtube.com')) {
            let s;
            if (["zh-cn", "zh-tw"].includes($('select#lang').val())) {
                s = 'https://weibomiaopai.com/?url=' + encodeURIComponent(pageurl);
            } else {
                s = 'https://weibomiaopai.com/download-video-parser.php?url=' + encodeURIComponent(pageurl);
            }
            if (pageurl.includes("http")) {
                setUrlOffline(s, pageurl);
            }
        } else {
            $('div#down').html("<BR/>" + "<blockquote>" + get_text('youtube_notice') + "</blockquote>");
            $('button#merger').hide();
            $('button#m3u8').hide();
            $('button#links').hide();
            $('button#pic').hide();
            $('button#vid').hide();
            $('#text_setting').hide();
            $('#text_log').hide();
        }

        $("#m3u8").click(function() {
            let the_m3u8_url = prompt(".m3u8 URL (No Youtube)", m3u8_url);
            if (the_m3u8_url) {
                if (the_m3u8_url.toLocaleLowerCase().includes("youtube.com")) {
                    alert("No Youtube!");
                } else {
                    m3u8_url = the_m3u8_url;
                    saveSettings(false);
                    process_m3u8(m3u8_url);
                }
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
                        $('div#down').html(vdhRenderList("images_list", tmp, true));
                    }
                },
                error: function(request, status, error) {},
                complete: function(data) {}
            });
        });


        $("#merger").click(function() {
            if (["zh-cn", "zh-tw"].includes($('select#lang').val())) {
                open("https://slowapi.com/merge-videos-files/");
            } else {
                open("https://slowapi.com/merge-videos/");
            }
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
                    const w_url = "https://weibomiaopai.com/download-video-parser.php?url=" + encodeURIComponent(pageurl);
                    tmp = tmp.uniq();
                    tmp.unshift(w_url);
                    $('div#down').html(vdhRenderList("videos_list", tmp, true));
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
                        $('div#down').html(vdhRenderList("links_list", tmp, true));
                    }
                },
                error: function(request, status, error) {},
                complete: function(data) {}
            });
        });
    };

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