const { steemit_domains, max_url_length } = require( '../js/constants' ) ;
const { extractDomain, FixURL, ValidURL, getParameterByName } = require( '../js/functions' )  ;
const { ParseVideo } = require( '../js/parsevideo' ) ;

(function() {     
    "use strict";
    
    // defines a known failed URLs so we can skip and try next method
    const FAILED_URLS = [
        "https://staticxx.facebook.com/common/referer_frame.php"
    ];

    const pageurl = document.location.href;
    const domain = extractDomain(pageurl);

    // no youtube.com video please.
    if (domain.includes("youtube.com")) {
        return; 
    }

    const html = document.documentElement.outerHTML;
    let video_url = "";
    let video_dom = null;

    // Simple Video Parser
    let SimpleVidoeParser = new ParseVideo(pageurl, html);
    video_url = SimpleVidoeParser.Parse();    
    if (ValidURL(video_url)) {    
        if (typeof video_url === "string") {
            // embeded URL is not a real video url                        
            if (video_url.includes("/embed/")) {
                $.ajax({
                    type: "GET",
                    dataType: "html",
                    url: video_url,
                    success: function(data) {
                        // now we have the sub HTML
                        SimpleVidoeParser = new ParseVideo(video_url, data);
                        video_url = SimpleVidoeParser.Parse();                           
                        chrome.runtime.sendMessage({
                            action: "getSource",
                            source: JSON.stringify(video_url)
                        });   
                        return;                                             
                    },
                    error: function(request, status, error) {
                        
                    },
                    complete: function(data) {

                    }             
                });                
            }
        }
        if (!FAILED_URLS.includes(video_url)) {
            chrome.runtime.sendMessage({
                action: "getSource",
                source: JSON.stringify(video_url)
            });        
            return;
        }
    }

    // http://michaelzzz520.tumblr.com/post/156206105600
    if (domain.includes("tumblr.com")) {
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("div.tumblr_video_container>iframe");
            if (video_dom) {
                video_url = video_dom.getAttribute("src"); 
                if (ValidURL(video_url)) {
                    let url1 = video_url;
                    video_url = "";
                    $.ajax({
                        type: "GET",
                        dataType: "html",
                        url: url1,
                        success: function(data) {
                            let dom = $(data).find("source[type='video/mp4']");
                            if (dom) {
                                video_url = dom.attr('src');
                                if (ValidURL(video_url)) {
                                    chrome.runtime.sendMessage({
                                        action: "getSource",
                                        source: JSON.stringify(FixURL(video_url))
                                    });
                                }                            
                            }
                        },
                        error: function(request, status, error) {
                            
                        },
                        complete: function(data) {

                        }             
                    });
                }
            }
        }
    }

    // http://us.sinaimg.cn/0032P9gCjx076OXbakmk01040100jIoS0k01.mp4?KID=unistore,video&ssig=7T1tFK2CkX&Expires=1485650329
    // http://weibo.com/tv/v/EtfrDlfUw?from=vhot
    // http://www.jianshu.com/p/5b6b4b2aa5c7
    // http://weibo.com/p/230444897a6a26db6d0226093f2d5819cf1e90
    // http://weibo.com/tv/v/EgaAp1dcM
    // http://weibo.com/2142058927/Eg0OBB5A5
    if ((domain.includes("weibo.com"))||(domain.includes("video.sina.com.cn"))) {
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("div[node-type='common_video_player']");
            if (video_dom) {
                let src = video_dom.getAttribute("action-data"); 
                if (src.length > 10) {
                    src = getParameterByName("video_src", src);
                    if (src.length > 0) {
                        src = decodeURIComponent(src);
                    }
                    if (ValidURL(src)) {
                        if (src.includes("ssig=") && src.includes("Expires=")) {
                            video_url = src;                            
                        }
                    }
                }
            }
        }
        if (!ValidURL(video_url)) {
            let re = /video_src=([^&]*)/i;
            let found = re.exec(html);
            if (found != null) {
                let tmp = decodeURIComponent(found[1]);
                if (ValidURL(tmp)) {
                    video_url = tmp;
                }
            }
        }
    }

    // http://imgur.com/gallery/S8ZZWHB
    if (domain.includes("imgur.com")) {
        if (!ValidURL(video_url)) { 
            video_dom = document.querySelector("source[type='video/mp4']");
            if (video_dom) {
                video_url = video_dom.getAttribute("src");
            }
        }
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("meta[name='twitter:player:stream']");
            if (video_dom) {
                video_url = video_dom.getAttribute("content");
            }                    
        }        
    }

    // https://steemit.com/cn/@justyy/i-got-my-phd-degree-at-the-age-of-25-video-25
    if (steemit_domains.includes(domain)) {
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("div.videoWrapper>iframe");
            if (video_dom) {
                video_url = video_dom.getAttribute("src"); 
            }
        }        
    }

    // https://d.tube/#!/v/movingroovin/7gdlydh0
    if (domain.includes("d.tube")) {
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("div.embed>iframe");
            if (video_dom) {
                video_url = video_dom.getAttribute("src"); 
                if (ValidURL(video_url)) {
                    let url1 = video_url;
                    $.ajax({
                        type: "GET",
                        dataType: "html",
                        url: url1,
                        success: function(data) {
                            let dom = $(data).find("source[type='video/mp4']");
                            if (dom) {
                                video_url = dom.attr('src');
                                if (ValidURL(video_url)) {
                                    chrome.runtime.sendMessage({
                                        action: "getSource",
                                        source: JSON.stringify(FixURL(video_url))
                                    });
                                }                            
                            }
                        },
                        error: function(request, status, error) {
                            
                        },
                        complete: function(data) {

                        }             
                    });
                }                   
            }         
        }        
    }

    // http://m.miaopai.com/show/channel/rjHGk~4TM7hNz~lg81-uZQ__
    if (domain.includes("miaopai.com")) {
        if (!ValidURL(video_url)) {
            let re = /.*miaopai\.com\/show\/(.*)\.html?$/i;
            let found = re.exec(pageurl);
            if (found != null) {
                video_url = "http://gslb.miaopai.com/stream/" + found[1] + ".mp4";
            } else {
                video_dom = document.querySelector("meta[property='og:videosrc']");
                if (video_dom) {
                    let id = video_dom.replace("http://p.weibo.com/show/", "");
                    id = id.replace(".swf", "");
                    if (id) {
                        video_url = "http://gslb.miaopai.com/stream/" + id + ".mp4";
                    }
                }
            }
        }                
    }    

    // https://www.facebook.com/zhihua.lai/videos/10150166829094739/
    // https://www.facebook.com/jkforum.net/videos/1446868685325245/
    // https:\/\/video-lht6-1.xx.fbcdn.net\/v\/t43.1792-2\/16462856_1831043770510348_1355160244581302272_n.mp4?efg=eyJ2ZW5jb2RlX3RhZyI6InN2ZV9oZCJ9&oh=77bce2793ab8bbb9d67c31fca836cc65&oe=5895F4AC
    if (domain.includes("facebook.com")) {
        if (!ValidURL(video_url)) { 
            let re = /['"]?hd_src_no_ratelimit['"]?: *(['"])(https?:[^\s'",]+)\1,/ig;
            let found = re.exec(html);
            while (found != null) {
                video_url = found[2];
                if (ValidURL(video_url)) {
                    break;
                }
                found = re.exec(html);
            } 
        }
        if (!ValidURL(video_url)) {
            let re = /['"]?hd_src['"]?: *(['"])(https?:[^\s'",]+)\1,/ig;
            let found = re.exec(html);
            while (found != null) {
                video_url = found[2];
                if (ValidURL(video_url)) {
                    break;
                }
                found = re.exec(html);
            }             
        }
        if (!ValidURL(video_url)) { 
            let re = /['"]?sd_src_no_ratelimit['"]?: *(['"])(https?:[^\s'",]+)\1,/ig;
            let found = re.exec(html);
            while (found != null) {
                video_url = found[2];
                if (ValidURL(video_url)) {
                    break;
                }
                found = re.exec(html);
            }
        }
        if (!ValidURL(video_url)) {
            let re = /['"]?sd_src['"]?: *(['"])(https?:[^\s'",]+)\1,/ig;
            let found = re.exec(html);
            while (found != null) {
                video_url = found[2];
                if (ValidURL(video_url)) {
                    break;
                }
                found = re.exec(html);
            }             
        }        
    }

    // http://www.v1.cn/2017-05-10/2533977.shtml
    if (domain.includes("v1.cn")) {
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("param[name='Flashlets']");
            if (video_dom) {
                let tmp = video_dom.getAttribute("value");   
                if (tmp.length) {
                    let re = /videoUrl=(.*)/i;
                    let found = re.exec(tmp);
                    if (found != null) {
                        if (ValidURL(found[1])) {
                            video_url = found[1];
                        }
                    }
                }
            }
        }                
    }       

    // http://www.meipai.com/media/596371059
    if (domain.includes("meipai.com")) {
        if (!ValidURL(video_url)) {
            let tmp = "";
            video_dom = document.querySelector("meta[property='og:video:secure_url']");
            if (video_dom) {
                tmp = video_dom.getAttribute("content");
            } else {
                video_dom = document.querySelector("meta[property='og:video']");
                if (video_dom) {
                    tmp = video_dom.getAttribute("content");
                }
            }
            tmp = tmp.trim();

            if (ValidURL(tmp)) {
                video_url = tmp;
            } else {
                function getHex(param1) {
                    return {
                        'str': param1.substring(4),
                        'hex': param1.substring(0, 4).split('').reverse().join('')
                    }
                }

                function getDec(param1) {
                    let loc2 = parseInt(param1, 16) + "";
                    return {
                        'pre': loc2.substring(0, 2).split(''),
                        'tail': loc2.substring(2).split('')
                    }
                }

                function substr(param1, param2) {
                    let loc3 = param1.substring(0, parseInt(param2[0]));                    
                    let loc4 = param1.substring(parseInt(param2[0]), parseInt(param2[0]) + parseInt(param2[1]));
                    return loc3 + param1.substring(parseInt(param2[0])).replace(loc4, "");
                }

                function getPos(param1, param2) {
                    param2[0] = param1.length - parseInt(param2[0]) - parseInt(param2[1]);
                    return param2;
                }

                let dict2 = getHex(tmp);

                let dict3 = getDec(dict2['hex']);

                let str4 = substr(dict2['str'], dict3['pre']);

                tmp = atob(substr(str4, getPos(str4, dict3['tail'])));                

                if (ValidURL(tmp)) {
                    video_url = tmp;                
                }                
            }
        }
    }

    // https://vimeo.com/151712690
    if (domain.includes("vimeo.com")) {
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("meta[property*='video']");
            if (video_dom) {
                video_url = video_dom.getAttribute("content");
                $.ajax({
                    type: "GET",
                    dataType: "html",
                    url: video_url,
                    success: function(data) {
                        let re = /,"url":"([^"\']+)"/gi;
                        let found = re.exec(data);                        
                        let video_url_arr = [];
                        while (found != null) {
                            let tmp_url = FixURL(found[1]);
                            if (ValidURL(tmp_url)) {
                                video_url_arr.push(tmp_url);    
                            }                            
                            found = re.exec(data);
                        }
                        if (video_url_arr.length > 0) {
                            chrome.runtime.sendMessage({
                                action: "getSource",
                                source: JSON.stringify(video_url_arr)
                            });                          
                        } else {
                            chrome.runtime.sendMessage({
                                action: "getSource",
                                source: JSON.stringify(FixURL(video_url))
                            });                              
                        }
                    },                    
                    error: function(request, status, error) {
                        
                    },
                    complete: function(data) {

                    }             
                });                
            }
        }
    }

    // https://www.ted.com/talks/atul_gawande_want_to_get_great_at_something_get_a_coach?language=en#t-48048
    if (domain.includes("ted.com")) {
        if (!ValidURL(video_url)) {
            let re = /{"uri":"([^"\']+)"/gi;
            let found = re.exec(html);                        
            let video_url_arr = [];
            while (found != null) {
                let tmp_url = FixURL(found[1]);
                if (ValidURL(tmp_url)) {
                    video_url_arr.push(tmp_url);    
                }                            
                found = re.exec(html);
            }
            if (video_url_arr.length > 0) {
                chrome.runtime.sendMessage({
                    action: "getSource",
                    source: JSON.stringify(video_url_arr)
                });                          
            } else {
                chrome.runtime.sendMessage({
                    action: "getSource",
                    source: JSON.stringify(FixURL(video_url))
                });                              
            }
        }
    }    

    // http://www.pearvideo.com/video_1050733
    if (domain.includes("pearvideo.com")) {
        if (!ValidURL(video_url)) {
            let re = /srcUrl="([^"\']+)"/gi;
            let found = re.exec(html);                        
            let video_url_arr = [];
            while (found != null) {
                let tmp_url = FixURL(found[1]);
                if (ValidURL(tmp_url)) {
                    video_url_arr.push(tmp_url);    
                }                            
                found = re.exec(html);
            }
            if (video_url_arr.length > 0) {
                chrome.runtime.sendMessage({
                    action: "getSource",
                    source: JSON.stringify(video_url_arr)
                });                          
            } else {
                chrome.runtime.sendMessage({
                    action: "getSource",
                    source: JSON.stringify(FixURL(video_url))
                });                              
            }
        }
    }    

    // https://v.xiaokaxiu.com/v/fhX23JOcSbVEJOQ9LFKtOP2WBkeP1AA-.html
    if (domain.includes("xiaokaxiu.com")) {
        if (!ValidURL(video_url)) {
            // http://gslb.miaopai.com/stream/fhX23JOcSbVEJOQ9LFKtOP2WBkeP1AA-_m.jpg
            let re = /player.swf\?scid=([^"\'&]+)/gi;
            let found = re.exec(html);                        
            let video_url_arr = [];
            while (found != null) {
                let tmp_url = "http://gslb.miaopai.com/stream/" + found[1] + ".mp4";
                tmp_url = FixURL(tmp_url);
                if (ValidURL(tmp_url)) {
                    video_url_arr.push(tmp_url);    
                    break;
                }                            
                found = re.exec(html);
            }
            if (video_url_arr.length > 0) {
                chrome.runtime.sendMessage({
                    action: "getSource",
                    source: JSON.stringify(video_url_arr)
                });                          
            } else {
                chrome.runtime.sendMessage({
                    action: "getSource",
                    source: JSON.stringify(FixURL(video_url))
                });                              
            }
        }
    }        

    ///////////////////////////////////////////   try something in general /////////////////////////////////////////////////

    if (!ValidURL(video_url)) {
        video_dom = document.querySelector("video#player-html5");
        if (video_dom) {
            let src = video_dom.getAttribute("src"); 
            if (src.length > 10) {
                src = decodeURIComponent(src);
                if (ValidURL(src)) {
                    video_url = src;                            
                }
            }
        }
    }     
    
    // https://which0.r.worldssl.net/video/embed/119838?player=hola&v=1&vip=0&mobile=0
    // https://which0.r.worldssl.net/videos/1/119838/119838.240p.m3u8?v=1.1
    if (!ValidURL(video_url)) {
        video_dom = document.querySelector("div#player-wrapper>iframe");
        if (video_dom) {
            video_url = video_dom.getAttribute("src");             
            if (ValidURL(video_url)) {
                let url1 = video_url;
                video_url = "";                
                $.ajax({
                    type: "GET",
                    dataType: "html",
                    url: url1,
                    success: function(data) {
                        let dom = $(data).find("source");
                        if (dom) {
                            video_url = dom.attr('src');                             
                            if (ValidURL(video_url)) {
                                video_url = video_url.replace(".m3u8", ".ts");
                                chrome.runtime.sendMessage({
                                    action: "getSource",
                                    source: JSON.stringify(FixURL(video_url))
                                });
                            }
                        }  
                        if (!ValidURL(video_url)) {
                            let re = /src:\s*\"(.*)\"/i;
                            let found = re.exec(data);
                            if (found != null) {                                
                                video_url = found[1];                                
                                video_url = video_url.replace(".m3u8", ".ts");
                                chrome.runtime.sendMessage({
                                    action: "getSource",
                                    source: JSON.stringify(FixURL(video_url))
                                });                                
                            }
                        }
                        // https://which2.r.worldssl.net/videos/0/76346/76346.240p.ts?v=1.1
                        // https://which0.r.worldssl.net/videos/1/76346/76346.240p.ts?v=1.1
                        if (!ValidURL(video_url)) {
                            let video_id_re = /(.*)video\/(.*)embed\/([0-9]+)\?/;
                            let video_id = video_id_re.exec(url1);
                            if (video_id != null) {
                                video_dom = document.querySelector("meta[property='og:image']");
                                const extra_style = video_dom.getAttribute('content');
                                if (extra_style.startsWith('/videos/')) {
                                    const extra_id = extra_style.charAt('/videos/'.length);
                                    video_url = video_id[1] + "videos/" + extra_id + "/" + video_id[3] + "/" + video_id[3] + ".240p.ts?v=1.1";
                                } else {
                                    video_url = [
                                        video_id[1] + "videos/0/" + video_id[3] + "/" + video_id[3] + ".240p.ts?v=1.1",
                                        video_id[1] + "videos/1/" + video_id[3] + "/" + video_id[3] + ".240p.ts?v=1.1",
                                        video_id[1] + "videos/2/" + video_id[3] + "/" + video_id[3] + ".240p.ts?v=1.1",
                                        video_id[1] + "videos/3/" + video_id[3] + "/" + video_id[3] + ".240p.ts?v=1.1"
                                    ];
                                }
                                chrome.runtime.sendMessage({
                                    action: "getSource",
                                    source: JSON.stringify(FixURL(video_url))
                                });                                  
                            }                            
                        }
                    },       
                });
            }
        }
    }     

    if (!ValidURL(video_url)) {
        video_dom = document.querySelector("div#player-wrapper>iframe");
        if (video_dom) {
            video_url = video_dom.getAttribute("src"); 
            if (ValidURL(video_url)) {
                let url1 = video_url;
                video_url = "";
                $.ajax({
                    type: "GET",
                    dataType: "html",
                    url: url1,
                    success: function(data) {
                        let dom = $(data).find("div#hlsjsvod");
                        if (dom) {
                            video_url = dom.attr('data-url240');
                            if (ValidURL(video_url)) {
                                video_url = video_url.replace(".m3u8", ".ts");
                                chrome.runtime.sendMessage({
                                    action: "getSource",
                                    source: JSON.stringify(FixURL(video_url))
                                });
                            }                            
                        }
                        if (!ValidURL(video_url)) {    
                            let re = /src:\s*\"(.*)\"/i;
                            let found = re.exec(data);
                            if (found != null) {
                                video_url = found[1];
                                video_url = video_url.replace(".m3u8", ".ts");
                                chrome.runtime.sendMessage({
                                    action: "getSource",
                                    source: JSON.stringify(FixURL(video_url))
                                });                                
                            }
                        }
                    },       
                });
            }
        }
    }         

    if ((!domain.includes("dailymotion.com")) && (!domain.includes("youtube.com"))) {
        // instagram
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("meta[property='og:video:secure_url']");
            if (video_dom) {
                video_url = video_dom.getAttribute("content");
            }
        }    

        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("meta[property='og:video']");
            if (video_dom) {
                video_url = video_dom.getAttribute("content");
            }
        }

        // http://www.aipai.com/c36/OTs2KCgkKyZpJGsv.html
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("meta[property='og:videosrc']");
            if (video_dom) {
                video_url = video_dom.getAttribute("content");
            }
        } 

        // https://www.kuaishou.com/photo/83855155/1570965204
        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("meta[property='og:video:url']");
            if (video_dom) {
                video_url = video_dom.getAttribute("content");
            }
        } 

        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("meta[property*='video']");
            if (video_dom) {
                video_url = video_dom.getAttribute("content");
            }
        }     

        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("source[type='video/mp4']");
            if (video_dom) {
                video_url = video_dom.getAttribute("src");   
            }
        }

        if (!ValidURL(video_url)) {
            let re = /['"]?video_url['"]?: *(['"])(https?:[^\s'",]+)\1/ig;
            let found = re.exec(html);
            while (found != null) {
                video_url = found[2];
                if (ValidURL(video_url)) {
                    break;
                }
                found = re.exec(html);
            }
        }

        if (!ValidURL(video_url)) {
            video_dom = document.querySelector("video");
            if (video_dom) {
                video_url = video_dom.getAttribute("src");   
            }
        } 
    }

    // http://91.91p17.space/view_video.php?viewkey=a4ff8ca2a1da8d03fd7d
    if (!ValidURL(video_url)) {
        video_dom = document.querySelector("source[type='video/mp4']");
        if (video_dom) {
            video_url = video_dom.getAttribute("src");   
        }
    }

    if (video_url) {
        video_url = video_url.trim();
    }

    if (video_url) {
        if (!ValidURL(video_url)) {
            video_url = (pageurl.toLocaleLowerCase().startsWith("https") ? "https://" : "http://") + domain + video_url;
        }
    //if (ValidURL(video_url)) {
        chrome.runtime.sendMessage({
            action: "getSource",
            source: JSON.stringify(FixURL(video_url))
        });
    }
    //} else {
        // http://www.pearvideo.com/video_1050733
        if (domain.includes("pearvideo.com")) {
            let tmp = [];
            let re = /[hsl]dUrl=[\"\']([^\"\']+)[\'\"]/ig;
            let found = re.exec(html);
            while (found != null) {
                let tmp_url = FixURL(found[1]); 
                if (ValidURL(tmp_url)) {
                    tmp.push(tmp_url);
                }
                found = re.exec(html);
            }
            if ((tmp.length > 0)) {
                chrome.runtime.sendMessage({
                    action: "getSource",
                    source: JSON.stringify(tmp)
                });                
            }
        }         

        // http://www.dailymotion.com/video/x2bu0q2_alejandro-fernandez-tengo-ganas-de-ti-ft-christina-aguilera_music
        if (domain.includes("dailymotion.com")) {
            let tmp = [];
            let re = /mp4[\'\"],[\'\"]url[\'\"]:[\'\"]([^\"\']+)[\'\"]/ig;
            let found = re.exec(html);
            while (found != null) {
                let tmp_url = FixURL(found[1]); 
                if (ValidURL(tmp_url)) {
                    tmp.push(tmp_url);
                }
                found = re.exec(html);
            }
            if ((tmp.length > 0)) {
                chrome.runtime.sendMessage({
                    action: "getSource",
                    source: JSON.stringify(tmp)
                });                
            }
        }   

        // sniffer!
        if (chrome.devtools) { // only available within a devltools page
            chrome.devtools.network.onRequestFinished.addListener( 
                function(request) {
                    // 100 kb
                    if (request.response.bodySize > 100 * 1024) {
                        chrome.devtools.inspectedWindow.eval(
                            'console.log(unescape("' +
                            escape(request.request.url) + '"))'
                        );
                        chrome.runtime.sendMessage({
                            action: "getSource",
                            source: JSON.stringify(FixURL(request.request.url))
                        });                        
                    }
                }
            );         
        }
    //}
})();