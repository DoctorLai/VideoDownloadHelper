'use strict';

window.onload = () => {
	chrome.tabs.executeScript(null, {
		file: "js/jquery-3.2.1.min.js"
	}, function() {
		chrome.tabs.executeScript(null, {
			file: "js/getPagesSource.js"
		}, function() {
			chrome.runtime.sendMessage({
			    action: "getSource",
			    source: JSON.stringify("https://uploadbeta.com/aaa.mp4")
			});    
		})
	});
}; 