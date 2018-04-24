'use strict';

// inject to the current page
window.onload = () => {
	chrome.tabs.executeScript(null, {
		file: "js/jquery-3.2.1.min.js"
	}, function() {
		chrome.tabs.executeScript(null, {
			file: "js/getPagesSource.js"
		}, function() {

		})
	});
}; 