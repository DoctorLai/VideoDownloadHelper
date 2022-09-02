(async function() {    
    "use strict";

    console.log("loaded background.js");
    
    async function getCurrentTab() {
        let queryOptions = { active: true, lastFocusedWindow: true };
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab;
    }

    let tab = await getCurrentTab();
    console.log(`Current Tab is ${JSON.stringify(tab)}`);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["./js/jquery-3.4.1.min.js", "./dist/dist.min.js"]
    });	

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