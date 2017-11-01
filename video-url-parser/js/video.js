function ForbiddenDomains(domain) {
  var sites = [];
  return sites.indexOf(domain) !== -1;
}

var max_url_length = 70;

String.prototype.trim2 = function (length) {
  return this.length > length ? this.substring(0, length) + "..." : this;
}

function getChromeVersion() {     
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

function getLocalIPs(callback) {
    var ips = [];

    var RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    var pc = new RTCPeerConnection({
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
        var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
        if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
            ips.push(ip);
    };
    pc.createOffer(function(sdp) {
        pc.setLocalDescription(sdp);
    }, function onerror() {});
}

var ipaddress = '';
getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses.
    ipaddress = ips.join('-');
});

// console.log in the background page
var bglog = function(obj) {
    if(chrome && chrome.runtime) {
      chrome.runtime.sendMessage({type: "bglog", obj: obj});
    }
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }
    //find & remove port number
    domain = domain.split(':')[0];
    return domain;
}

MD5 = function(e) {
    function h(a, b) {
        var c, d, e, f, g;
        e = a & 2147483648;
        f = b & 2147483648;
        c = a & 1073741824;
        d = b & 1073741824;
        g = (a & 1073741823) + (b & 1073741823);
        return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
    }

    function k(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & c | ~b & d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function l(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & d | c & ~d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function m(a, b, d, c, e, f, g) {
        a = h(a, h(h(b ^ d ^ c, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function n(a, b, d, c, e, f, g) {
        a = h(a, h(h(d ^ (b | ~c), e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function p(a) {
        var b = "",
            d = "",
            c;
        for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
        return b
    }
    var f = [],
        q, r, s, t, a, b, c, d;
    e = function(a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
        }
        return b
    }(e);
    f = function(b) {
        var a, c = b.length;
        a = c + 8;
        for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
        a = (g - g % 4) / 4;
        e[a] |= 128 << g % 4 * 8;
        e[d - 2] = c << 3;
        e[d - 1] = c >>> 29;
        return e
    }(e);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
    return (p(a) + p(b) + p(c) + p(d)).toLowerCase()
};

function getLang() {
  return document.getElementById("lang").selectedIndex;
}

var manifest = chrome.runtime.getManifest();
var app_name = manifest.name + " v" + manifest.version;

var ver0 = "<BR/><font color=gray>Chrome Version: " + getChromeVersion() + "</font> | <a href='https://steakovercooked.com/Contact.Mail' target=_blank>Report Bug (or Suggestions)</a>";
var ver1 = "<BR/><font color=gray>Chrome 版本: " + getChromeVersion() + "</font> | <a href='https://steakovercooked.com/ch/Contact.Mail' target=_blank>反馈问题（提交BUG建议）</a><BR/><B>QQ群: 141778919</B>";

var botver0 = "<BR/>" + ver0 + "<BR/><a target=_blank href='https://weibomiaopai.com/download-video-parser.php'>" + app_name + "</a> | <a href='https://github.com/DoctorLai/VideoDownloadHelper' target=_blank>Source Code</a>";
var botver1 = "<BR/>" + ver1 + "<BR/><a target=_blank href='https://weibomiaopai.com/'>" + app_name + "</a> | <a href='https://github.com/DoctorLai/VideoDownloadHelper' target=_blank>源代码</a>";

function setUrlOffline(url) {
  if (getLang() == 0) {
    $('div#down').html("<h3><B>List of Video(s)</B>: </h3><a target=_blank rel=nofollow href='" + url + "'><B>" + url + "</B></a><BR/>" +  botver0);
  } else {
    $('div#down').html("<h3><B>视频列表</B>: </h3><a target=_blank rel=nofollow href='" + url + "'><B>" + url + "</B></a><BR/>" + botver1);  
  }  
}

function displayError(url) {
  if (getLang() == 0) {
    $('div#down').html("<h3><B>List of Video(s)</B>: </h3><font color=gray>Google's Policy Does <B>NOT</B> Allow This, Sorry!" +  botver0);
  } else {
    $('div#down').html("<h3><B>视频列表</B>: </h3><font color=gray>Google的政策<B>不允许</B>在Chrome扩展程序中下载这个网站的视频。" + botver1);
  }
}

function setUrlOfflineArray(urls) {
  var urls_length = urls.length;
  if (getLang() == 0) {
    var s = "<h3><B>List of Video(s)</B>: </h3><ol>";  
  } else {
    var s = "<h3><B>视频列表</B>: </h3><ol>";
  }
  
  for (var i = 0; i < urls_length; ++i) {
    s += "<li><a target=_blank rel=nofollow href='" + urls[i] + "'><B>" + urls[i].trim2(max_url_length) + "</B></a></li>";
  }
  if (getLang() == 0) {
    s += "</ol><font color=gray>via Offline Parser, Click <font color=red>Above Button</font> to Invoke the Server.<BR/>(usually <B>more accurate</B>).</font>" + botver0;
  } else {
    s += "</ol><font color=gray>由离线浏览器分析所得，<i>如果不正确</i>，点击<font color=red>上面的红色按钮</font>由服务器获取。</font>" + botver1;
  }
  
  $('div#down').html(s);  
}

document.addEventListener('DOMContentLoaded', function() {
  $('select#lang').change(function() {
      chrome.storage.sync.set({ langIndex: getLang() });
  });     

  var pageurl = '';
  chrome.tabs.getSelected(null, function(tab) {   
    pageurl = tab.url;    
  });
  chrome.storage.sync.get('langIndex', function(data) {
      document.getElementById("lang").selectedIndex = data.langIndex;  

      switch (data.langIndex) {
        case 0: document.getElementById("message").innerHTML = "<B><i>Sorry</i>😂<B/><ul><li><a target=_blank href='https://github.com/DoctorLai/VideoDownloadHelper'>Source Code</a></li><li><a target=_blank href='https://github.com/DoctorLai/VideoDownloadHelper/blob/master/examples.txt'>Supported Sites</a></li><li><a href='ht" + "tps://weibom" + "iaopai.co" + "m/download-video-parser.php/?url=" + pageurl + "' target=_blank>Not Allowed by Google, Check Online Tools</li></ul>"; break;
        case 1: document.getElementById("message").innerHTML = "<B><i>非常抱歉</i>😂<B/><ul><li><a target=_blank href='https://github.com/DoctorLai/VideoDownloadHelper'>源代码</a></li><li><a target=_blank href='https://github.com/DoctorLai/VideoDownloadHelper/blob/master/examples.txt'>支持站点</a></li><li><a href='ht" + "tps://weibo" + "mia" + "opai.com/?url=" + pageurl + "' target=_blank>Google 不允许，看看别人怎么下载？</li></ul>"; break;
      }

  });   

  /*  
  chrome.storage.sync.get('serverIndex', function(data) {
      document.getElementById("server").selectedIndex = data.serverIndex;
  }); 
  */
  /*
  $('select#server').change(function() {
      chrome.storage.sync.set({ serverIndex: document.getElementById("server").selectedIndex });
  });    
  */
  chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
      var url = JSON.parse(request.source);
      if ((url != null) && (url.constructor == Array)) {           
        if (url.length == 1) {
          setUrlOffline(url[0]);
        } else {
          setUrlOfflineArray(url);
        }
      } else {
        var url = $.trim(url);
        if (url.length > 0) {
          var domain1 = extractDomain(url).toLowerCase().replace("www.", "");
          if (ForbiddenDomains(domain1)) {
            displayError(url);
          } else {
            setUrlOffline(url);
            if (url.endsWith("m3u8") || (url.includes("m3u8?"))) {          
              var tmp = url.lastIndexOf("/");
              if (tmp != -1) {
                var base_url = url.substr(0, tmp + 1);
                var m3u8 = url;
                $.ajax({
                   type: "GET",
                   url: m3u8,
                   success: function(data) {
                      var lines = data.trim().split(/\s*[\r\n]+\s*/g);
                      var len = lines.length;
                      var m3u8arr = [];
                      for (var i = 0; i < len; ++ i) {
                        var line = $.trim(lines[i]);
                        if ((line != null) && (line != '') && (line.length > 2) && (line[0] != '#')) {
                          if ((line.startsWith("http://") || line.startsWith("https://") || line.startsWith("ftp://"))) {
                            m3u8arr.push(line);  
                          } else {
                            var theurl = base_url + line;                            
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
                   error: function(request, status, error) {
                   },
                   complete: function(data) {                        
                   }             
                });                
              }
            }
          }
        }
      }
    }
  });
}, false);