/* jshint -W119 */
/* jshint -W104 */
// inject to the current page

async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	// `tab` will either be a `tabs.Tab` instance or `undefined`.
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

window.onload = async function() {
	'use strict';

	let tab = await getCurrentTab();
	console.log("Tab object is ", tab);

	/*
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ["js/jquery-3.4.1.min.js", "dist/dist.min.js"]
	});	
	*/
	/*
	const executeScripts = (tabId, injectDetailsArray) => {
		function createCallback(tabId, injectDetails, innerCallback) {
			return function () {
				chrome.scripting.executeScript(tabId, injectDetails, innerCallback);
			};
		}
		let callback = null;

		for (let i = injectDetailsArray.length - 1; i >= 0; --i) {
			callback = createCallback(tabId, injectDetailsArray[i], callback);
		}

		if (callback !== null) {
			callback();
		}
	};
	executeScripts(null, [ 
		{ file: "js/jquery-3.4.1.min.js" },
		{ file: "dist/dist.min.js" }
	]);	
	*/
}; 