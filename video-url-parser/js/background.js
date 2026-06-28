(async function() {
    "use strict";

    console.log("loaded background.js");

    async function getCurrentTab() {
        let queryOptions = { active: true, lastFocusedWindow: true };
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab;
    }

    // chrome.tabs / chrome.scripting are only available in the service worker
    // and extension pages (e.g. the popup), not in a content-script context.
    // This file is also declared as a content script, so guard before using
    // them to avoid throwing when injected into a page.
    if (chrome && chrome.tabs && chrome.tabs.query && chrome.scripting && chrome.scripting.executeScript) {
        let tab = await getCurrentTab();
        console.log(`Current Tab is ${JSON.stringify(tab)}`);
        if (tab && tab.id != null) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["./js/jquery-3.4.1.min.js", "./dist/dist.min.js"]
            });
        }
    }

    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            switch (message.type) {
                case "bglog":
                    console.log(message.obj);
                break;
            }
            return true;
        });
    }

    if (chrome && chrome.runtime && chrome.runtime.onInstalled) {
        chrome.runtime.onInstalled.addListener(function(details) {
            if (details.reason == "install") {
                //call a function to handle a first install
                console.log("onInstalled: Thank you!");
            } else if (details.reason == "update") {
                //call a function to handle an update
                console.log("new version available");
            }
        });
    }
})();

// =====================================================================
// Service-worker-only features: a toolbar badge that counts detected
// media, plus right-click context menus. background.js is also injected
// as a content script and loaded by the popup; those contexts define
// `window`, so we gate on its absence to run this only in the service
// worker where chrome.action / chrome.contextMenus are available.
// =====================================================================
if (typeof window === "undefined" && typeof chrome !== "undefined") {
    // ---- Toolbar badge: number of media URLs detected on a tab ----
    if (chrome.action && chrome.action.setBadgeText) {
        try {
            chrome.action.setBadgeBackgroundColor({ color: "#d9534f" });
        } catch (e) {
            // best-effort only
        }

        const setBadge = (tabId, count) => {
            if (typeof tabId !== "number") {
                return;
            }
            try {
                chrome.action.setBadgeText({
                    tabId: tabId,
                    text: count > 0 ? String(count) : ""
                });
            } catch (e) {
                // ignore (e.g. the tab was already closed)
            }
        };

        if (chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener(function(message, sender) {
                if (message && message.action === "getSource" && sender && sender.tab) {
                    let count = 0;
                    try {
                        const parsed = JSON.parse(message.source);
                        if (Array.isArray(parsed)) {
                            count = parsed.length;
                        } else if (parsed) {
                            count = 1;
                        }
                    } catch (e) {
                        count = 0;
                    }
                    setBadge(sender.tab.id, count);
                }
                return false;
            });
        }

        // clear the badge when a tab starts loading a new page
        if (chrome.tabs && chrome.tabs.onUpdated) {
            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
                if (changeInfo.status === "loading") {
                    setBadge(tabId, 0);
                }
            });
        }
    }

    // ---- Right-click context menus ----
    if (chrome.contextMenus) {
        const MENU_DOWNLOAD_MEDIA = "vdh_download_media";
        const MENU_PARSE_PAGE = "vdh_parse_page";

        const createMenus = () => {
            try {
                chrome.contextMenus.removeAll(function() {
                    chrome.contextMenus.create({
                        id: MENU_DOWNLOAD_MEDIA,
                        title: "Download this video / audio",
                        contexts: ["video", "audio"]
                    });
                    chrome.contextMenus.create({
                        id: MENU_PARSE_PAGE,
                        title: "Find videos on this page",
                        contexts: ["page", "frame", "link"]
                    });
                });
            } catch (e) {
                // ignore
            }
        };

        if (chrome.runtime && chrome.runtime.onInstalled) {
            chrome.runtime.onInstalled.addListener(createMenus);
        }
        // also (re)create on every service-worker startup
        createMenus();

        if (chrome.contextMenus.onClicked) {
            chrome.contextMenus.onClicked.addListener(function(info, tab) {
                if (info.menuItemId === MENU_DOWNLOAD_MEDIA && info.srcUrl) {
                    if (chrome.downloads && chrome.downloads.download) {
                        chrome.downloads.download({ url: info.srcUrl });
                    }
                } else if (info.menuItemId === MENU_PARSE_PAGE) {
                    const pageUrl = (tab && tab.url) || info.pageUrl || "";
                    if (
                        pageUrl &&
                        pageUrl.indexOf("http") === 0 &&
                        pageUrl.toLowerCase().indexOf("youtube.com") === -1
                    ) {
                        chrome.tabs.create({
                            url: "https://weibomiaopai.com/download-video-parser.php?url=" + encodeURIComponent(pageUrl)
                        });
                    }
                }
            });
        }
    }
}