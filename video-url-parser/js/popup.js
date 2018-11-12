// inject to the current page
window.onload = () => {
	'use strict';
	const executeScripts = (tabId, injectDetailsArray) => {
		function createCallback(tabId, injectDetails, innerCallback) {
			return function () {
				chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
			};
		}
		let callback = null;

		for (let i = injectDetailsArray.length - 1; i >= 0; --i) {
			callback = createCallback(tabId, injectDetailsArray[i], callback);
		}

		if (callback !== null) {
			callback();
		}
	}
    executeScripts(null, [ 
		{ file: "js/constants.js" }, 
		{ file: "js/functions.js" }, 
		{ file: "js/jquery-3.2.1.min.js" }, 
        { file: "js/getPagesSource.js" }
    ]);	
}; 